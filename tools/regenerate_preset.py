import os
import sys
import json
import subprocess
import shutil
from pathlib import Path

# Add TTS project to sys.path
TTS_PROJECT_DIR = Path("D:/AI/文字转语音")
sys.path.insert(0, str(TTS_PROJECT_DIR))

# Ensure dotenv and client are loaded
from dotenv import load_dotenv
load_dotenv(dotenv_path=TTS_PROJECT_DIR / ".env")

from src.mimo_client import MiMoClient
from src.schemas import PresetRequest

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
        print(f"Error during conversion: {e}")
        return False

def main():
    client = MiMoClient()
    dest_dir = Path("assets/sounds/voice/g1_up")
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # 待生成的列表，全部使用预设音色 “茉莉”
    voice_id = "茉莉"
    
    tasks = [
        # 开局第一句
        ("g1_u1_guide_init", "我们要先找 1 哦！…… "),
        # 2 ~ 10 阶段的 9 句话
        ("g1_u1_guide_next2", "真准！接下来找出 2 个物品的小组。…… "),
        ("g1_u1_guide_next3", "真准！接下来找出 3 个物品的小组。…… "),
        ("g1_u1_guide_next4", "真准！接下来找出 4 个物品的小组。…… "),
        ("g1_u1_guide_next5", "真准！接下来找出 5 个物品的小组。…… "),
        ("g1_u1_guide_next6", "真准！接下来找出 6 个物品的小组.…… "),
        ("g1_u1_guide_next7", "真准！接下来找出 7 个物品的小组。…… "),
        ("g1_u1_guide_next8", "真准！接下来找出 8 个物品的小组。…… "),
        ("g1_u1_guide_next9", "真准！接下来找出 9 个物品的小组。…… "),
        ("g1_u1_guide_next10", "真准！接下来找出 10 个物品的小组。…… "),
        # 2 ~ 10 错题反馈的 9 句话
        ("g1_u1_error_find2", "我们要先找 2 哦！…… "),
        ("g1_u1_error_find3", "我们要先找 3 哦！…… "),
        ("g1_u1_error_find4", "我们要先找 4 哦！…… "),
        ("g1_u1_error_find5", "我们要先找 5 哦！…… "),
        ("g1_u1_error_find6", "我们要先找 6 哦！…… "),
        ("g1_u1_error_find7", "我们要先找 7 哦！…… "),
        ("g1_u1_error_find8", "我们要先找 8 哦！…… "),
        ("g1_u1_error_find9", "我们要先找 9 哦！…… "),
        ("g1_u1_error_find10", "我们要先找 10 哦！…… "),
        # 第一单元其他遗漏音频（错题反馈 & 结算副标题修正）
        ("g1_u1_error_bridge", "再看看哪边还有兔子没连上线？…… "),
        ("g1_u1_settlement_subtitle", "你对 1~10 的数序和多少关系非常熟悉！…… ")
    ]
    
    success_count = 0
    
    for audio_id, text in tasks:
        wav_path = dest_dir / f"{audio_id}.wav"
        mp3_path = dest_dir / f"{audio_id}.mp3"
        
        # 编码问题避开 CMD 乱码打印
        safe_print_text = text.replace("……", "...").strip()
        print(f"Generating {audio_id} ('{safe_print_text}') using preset '{voice_id}'")
        
        try:
            # 建立 Preset 语音请求
            req = PresetRequest(
                text=text,
                voice_id=voice_id,
                strict_verbatim=True
            )
            audio_bytes = client.synthesize_preset(req)
            
            with open(wav_path, "wb") as f:
                f.write(audio_bytes)
                
            success = convert_wav_to_mp3(wav_path, mp3_path)
            if success:
                wav_path.unlink()
                print(f"  -> Saved {mp3_path}")
                success_count += 1
            else:
                print(f"  -> Failed to convert {audio_id} to MP3")
        except Exception as e:
            print(f"  -> Error generating {audio_id}: {str(e)[:100]}")
            
    print(f"\nDone: Successfully generated {success_count} / {len(tasks)} files using preset '{voice_id}'")

    # 更新 manifest.json 中的索引记录
    manifest_json_path = Path("assets/sounds/voice/manifest.json")
    if manifest_json_path.exists():
        try:
            with open(manifest_json_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
            
            # 确保这些文本也指向这些音频文件 (用于 VoicePlayer 反向内容查找)
            for audio_id, text in tasks:
                # texts 中去除 emoji 和前缀等，这里直接用干净的文本映射
                # texts 表里需要剥离 "…… " 等做精准查找，
                # 但既然是 exact match，manifest.json 中的 texts 应该对应游戏代码调用的字符串：
                # 游戏调用时的原始文本是："我们要先找 1 哦！" 和 "真准！接下来找出 X 个物品的小组。"
                clean_text = text.replace("…… ", "").strip()
                manifest["keys"][audio_id] = f"g1_up/{audio_id}.mp3"
                manifest["texts"][clean_text] = f"g1_up/{audio_id}.mp3"
                
            with open(manifest_json_path, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            print("Successfully updated manifest.json index mapping.")
        except Exception as e:
            print(f"Error updating manifest: {e}")

if __name__ == "__main__":
    main()
