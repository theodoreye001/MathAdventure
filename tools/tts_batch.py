import os
import sys
import json
import subprocess
import shutil
from pathlib import Path

# Add PyYAML and TTS project to sys.path
TTS_PROJECT_DIR = Path("D:/AI/文字转语音")
sys.path.insert(0, str(TTS_PROJECT_DIR))

# Ensure pyyaml can be imported
try:
    import yaml
except ImportError:
    print("PyYAML not found in current environment. Attempting to install or import from venv...")
    # Try using the venv from TTS project if it exists
    venv_site_packages = TTS_PROJECT_DIR / ".venv" / "Lib" / "site-packages"
    if venv_site_packages.exists():
        sys.path.insert(0, str(venv_site_packages))
        import yaml
    else:
        # Fallback to simple yaml parser or pip install
        raise ImportError("Please install PyYAML: pip install pyyaml")

# Load env variables from D:/AI/文字转语音/.env
from dotenv import load_dotenv
load_dotenv(dotenv_path=TTS_PROJECT_DIR / ".env")

from src.mimo_client import MiMoClient
from src.schemas import VoiceDesignRequest

# Prompts for voicedesign
ROLE_PROMPTS = {
    "guide": "一位温柔开朗的年轻女老师，二十多岁，声音甜美清亮但不尖锐，像邻家大姐姐。语速适中偏慢，吐字清晰，每个字都咬得很清楚，适合小朋友理解。带着天然的耐心和鼓励感，像在跟一年级小朋友面对面说话。不过分亲昵也不严肃，自然温暖的日常对话风格。",
    "cheer": "一个活泼可爱的八九岁小女孩，声音稚嫩明亮，带着童真。语速偏快，语调上扬，充满惊喜和兴奋。像是在为好朋友的成功由衷地开心拍手叫好。声音中带着一种感染力十足的快乐。",
    "announce": "一位热情洋溢的少儿节目主持人，二十多岁女性。声音明亮有力，吐字饱满有磁性。语气中带着满满的自豪和祝贺，像是在给获奖选手颁发奖杯。有一种“隆重宣布”的仪式感，但不过分夸张。"
}

def check_ffmpeg():
    """Check if ffmpeg is available in path"""
    return shutil.which("ffmpeg") is not None

def convert_wav_to_mp3(wav_path: Path, mp3_path: Path):
    """Convert wav to mp3 using ffmpeg"""
    try:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(wav_path),
            "-codec:a", "libmp3lame",
            "-qscale:a", "4",  # Variable bitrate around 128kbps, excellent quality
            str(mp3_path)
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.returncode == 0
    except Exception as e:
        print(f"Error during ffmpeg conversion: {e}")
        return False

def main():
    manifest_yaml = Path("tools/voice_manifest.yaml")
    if not manifest_yaml.exists():
        print(f"Error: Manifest not found at {manifest_yaml}")
        return

    with open(manifest_yaml, "r", encoding="utf-8") as f:
        manifest = yaml.safe_load(f)

    client = MiMoClient()
    output_base_dir = Path("assets/sounds/voice")
    output_base_dir.mkdir(parents=True, exist_ok=True)

    has_ffmpeg = check_ffmpeg()
    if has_ffmpeg:
        print("ffmpeg found. Output files will be converted to .mp3 format.")
        ext = ".mp3"
    else:
        print("ffmpeg NOT found. Output files will remain in .wav format.")
        ext = ".wav"

    items_to_process = []
    # Collect items
    for section_key, items in manifest.items():
        if section_key == "metadata":
            continue
        for item in items:
            audio_id = item["audio_id"]
            text = item["text"]
            role = item["role"]
            dest_dir = output_base_dir / section_key
            dest_file = dest_dir / f"{audio_id}{ext}"
            
            items_to_process.append({
                "audio_id": audio_id,
                "text": text,
                "role": role,
                "dest_file": dest_file,
                "dest_dir": dest_dir,
                "section": section_key
            })

    print(f"Total items in manifest: {len(items_to_process)}")
    
    # 支持 --force 命令行参数以强制重新生成
    force_regenerate = "--force" in sys.argv
    if force_regenerate:
        print("Force regeneration enabled. All files will be overwritten.")
        pending_items = items_to_process
    else:
        # Filter items that already exist
        pending_items = [item for item in items_to_process if not item["dest_file"].exists()]
        
    print(f"Pending items to generate: {len(pending_items)}")

    success_count = 0
    failed_count = 0

    # Process items
    for i, item in enumerate(pending_items, 1):
        print(f"[{i}/{len(pending_items)}] Generating {item['audio_id']} ({item['role']}): '{item['text']}'")
        item["dest_dir"].mkdir(parents=True, exist_ok=True)
        
        # Temporary wav path if we are converting to mp3
        wav_path = item["dest_file"].with_suffix(".wav")
        actual_output_path = item["dest_file"]

        try:
            # 句尾加“…… ”提供自然衰减静音，避免尾字被截断
            text_to_send = item["text"] + "…… "
            
            req = VoiceDesignRequest(
                text=text_to_send,
                voice_prompt=ROLE_PROMPTS[item["role"]],
                strict_verbatim=True
            )
            # Call TTS to get WAV bytes
            audio_bytes = client.synthesize_voice_design(req)
            
            # Save temporarily as wav
            with open(wav_path, "wb") as f:
                f.write(audio_bytes)
            
            # If we need mp3, convert it and delete the wav
            if ext == ".mp3":
                success = convert_wav_to_mp3(wav_path, actual_output_path)
                if success:
                    wav_path.unlink()  # delete temp wav
                    print(f"  -> Successfully converted and saved to {actual_output_path}")
                    success_count += 1
                else:
                    print(f"  -> conversion failed, keeping wav: {wav_path}")
                    # Rename back to dest_file (as wav) if mp3 conversion failed
                    wav_path.rename(item["dest_file"].with_suffix(".wav"))
                    success_count += 1
            else:
                print(f"  -> Saved to {actual_output_path}")
                success_count += 1
                
        except Exception as e:
            print(f"  -> Failed to generate {item['audio_id']}: {e}")
            failed_count += 1

    # Generate/update manifest.json index file
    index_keys = {}
    index_texts = {}
    
    for item in items_to_process:
        # Check both .mp3 and .wav to be safe
        mp3_path = item["dest_dir"] / f"{item['audio_id']}.mp3"
        wav_path = item["dest_dir"] / f"{item['audio_id']}.wav"
        
        rel_path = ""
        if mp3_path.exists():
            rel_path = f"{item['section']}/{item['audio_id']}.mp3"
        elif wav_path.exists():
            rel_path = f"{item['section']}/{item['audio_id']}.wav"
            
        if rel_path:
            index_keys[item["audio_id"]] = rel_path
            index_texts[item["text"]] = rel_path

    index_manifest = {
        "keys": index_keys,
        "texts": index_texts
    }

    index_json_path = output_base_dir / "manifest.json"
    with open(index_json_path, "w", encoding="utf-8") as f:
        json.dump(index_manifest, f, indent=2, ensure_ascii=False)
    print(f"\nManifest index updated at {index_json_path}")
    print(f"Indexed {len(index_keys)} keys and {len(index_texts)} text strings.")
    print(f"Batch TTS completed: {success_count} success, {failed_count} failed.")

if __name__ == "__main__":
    main()
