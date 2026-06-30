import os
import sys
import json
import subprocess
import yaml
from pathlib import Path

# Add TTS project to sys.path
TTS_PROJECT_DIR = Path("D:/AI/文字转语音")
sys.path.insert(0, str(TTS_PROJECT_DIR))

# Ensure dotenv and client are loaded
from dotenv import load_dotenv
load_dotenv(dotenv_path=TTS_PROJECT_DIR / ".env")

from src.mimo_client import MiMoClient
from src.schemas import PresetRequest, VoiceCloneRequest

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError:
        return False

def convert_wav_to_mp3(wav_path: Path, mp3_path: Path):
    try:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(wav_path),
            "-codec:a", "libmp3lame",
            "-qscale:a", "4",
            str(mp3_path)
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.returncode == 0
    except Exception as e:
        print(f"Error converting to MP3: {e}")
        return False

def main():
    manifest_yaml = Path("tools/voice_manifest.yaml")
    if not manifest_yaml.exists():
        print(f"Error: Manifest file {manifest_yaml} not found.")
        sys.exit(1)

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

    # Master host voice for voice clone (announce role)
    master_host_path = output_base_dir / "g1_up/g1_u1_settlement_title.mp3"
    if not master_host_path.exists():
        # Fallback to wav if mp3 doesn't exist
        master_host_path = output_base_dir / "g1_up/g1_u1_settlement_title.wav"
        
    if master_host_path.exists():
        print(f"Loading master host reference sample from {master_host_path} for 'announce' role.")
        with open(master_host_path, "rb") as f:
            host_sample_bytes = f.read()
        host_sample_mime = "audio/mpeg" if master_host_path.suffix == ".mp3" else "audio/wav"
    else:
        print("WARNING: Master host reference sample not found. 'announce' role cannot use voiceclone.")
        host_sample_bytes = None

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
    
    # Check for --force flag
    force_regenerate = "--force" in sys.argv
    if force_regenerate:
        print("Force regeneration enabled. All files will be overwritten.")
        pending_items = items_to_process
    else:
        pending_items = [item for item in items_to_process if not item["dest_file"].exists()]
        
    print(f"Pending items to generate: {len(pending_items)}")

    success_count = 0
    failed_count = 0

    for i, item in enumerate(pending_items, 1):
        # 绝对不要覆盖我们作为克隆源的主主持声音
        if item["audio_id"] == "g1_u1_settlement_title":
            print(f"[{i}/{len(pending_items)}] Skipping master host clone source: {item['audio_id']}")
            success_count += 1
            continue

        safe_print_text = item["text"].replace("……", "...").replace("\n", " ").strip()
        try:
            safe_print_text = safe_print_text.encode('gbk', errors='ignore').decode('gbk')
        except Exception:
            safe_print_text = "[Text containing special characters]"
        print(f"[{i}/{len(pending_items)}] Generating {item['audio_id']} ({item['role']}): '{safe_print_text[:30]}'")
        item["dest_dir"].mkdir(parents=True, exist_ok=True)
        
        wav_path = item["dest_file"].with_suffix(".wav")
        actual_output_path = item["dest_file"]

        # 句尾加“…… ”提供自然衰减静音，避免尾字被截断
        text_to_send = item["text"]
        if not text_to_send.endswith("…… "):
            text_to_send = text_to_send + "…… "

        try:
            # 策略：
            # 1. guide 或 cheer 角色：使用预设的 "茉莉" 音色，音色完全稳定
            # 2. announce 角色：使用 voiceclone，克隆 master_host 的音色，保证主持声音完全一致
            if item["role"] in ["guide", "cheer"]:
                req = PresetRequest(
                    text=text_to_send,
                    voice_id="茉莉",
                    strict_verbatim=True
                )
                audio_bytes = client.synthesize_preset(req)
            elif item["role"] == "announce" and host_sample_bytes is not None:
                req = VoiceCloneRequest(
                    text=text_to_send,
                    sample_name="host_voice",
                    sample_path=str(master_host_path),
                    sample_mime=host_sample_mime,
                    sample_bytes=host_sample_bytes,
                    strict_verbatim=True
                )
                audio_bytes = client.synthesize_voice_clone(req)
            else:
                # 兜底：如果是不明角色或缺乏克隆源，用普通预设，保证不崩
                req = PresetRequest(
                    text=text_to_send,
                    voice_id="茉莉",
                    strict_verbatim=True
                )
                audio_bytes = client.synthesize_preset(req)

            # 保存为 wav
            with open(wav_path, "wb") as f:
                f.write(audio_bytes)
            
            # 转 mp3
            if ext == ".mp3":
                success = convert_wav_to_mp3(wav_path, actual_output_path)
                if success:
                    wav_path.unlink()
                    success_count += 1
                else:
                    print(f"  -> MP3 conversion failed, renaming wav.")
                    wav_path.rename(item["dest_file"].with_suffix(".wav"))
                    success_count += 1
            else:
                success_count += 1

        except Exception as e:
            print(f"  -> Error generating {item['audio_id']}: {e}")
            failed_count += 1

    # 生成/更新 manifest.json
    index_keys = {}
    index_texts = {}
    
    for item in items_to_process:
        mp3_path = item["dest_dir"] / f"{item['audio_id']}.mp3"
        wav_path = item["dest_dir"] / f"{item['audio_id']}.wav"
        
        rel_path = ""
        if mp3_path.exists():
            rel_path = f"{item['section']}/{item['audio_id']}.mp3"
        elif wav_path.exists():
            rel_path = f"{item['section']}/{item['audio_id']}.wav"
            
        if rel_path:
            index_keys[item["audio_id"]] = rel_path
            # 去除尾部多余句点做精准 texts 反查匹配
            clean_text = item["text"].strip()
            index_texts[clean_text] = rel_path

    # 把我们动态添加的 19 个特别句也注册在 texts 表中（如果它们在 items_to_process 里没有，在这里补充）
    # 在这个脚本中，由于 voice_manifest.yaml 里我们已经添加了它们，所以 items_to_process 会包含它们并正确注册！

    index_manifest = {
        "keys": index_keys,
        "texts": index_texts
    }

    manifest_json = output_base_dir / "manifest.json"
    with open(manifest_json, "w", encoding="utf-8") as f:
        json.dump(index_manifest, f, indent=2, ensure_ascii=False)
        
    print(f"\nBatch completed: {success_count} success, {failed_count} failed.")
    print(f"Manifest index updated at {manifest_json}")

if __name__ == "__main__":
    main()
