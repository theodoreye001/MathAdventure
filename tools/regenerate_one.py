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
from src.schemas import VoiceDesignRequest

# Prompt for guide (gentle teacher)
GUIDE_PROMPT = "一位温柔开朗的年轻女老师，二十多岁，声音甜美清亮但不尖锐，像邻家大姐姐。语速适中偏慢，吐字清晰，每个字都咬得很清楚，适合小朋友理解。带着天然的耐心和鼓励感，像在跟一年级小朋友面对面说话。不过分亲昵也不严肃，自然温暖的日常对话风格。"

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
        print(f"Error: {e}")
        return False

def main():
    client = MiMoClient()
    dest_dir = Path("assets/sounds/voice/g1_up")
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # 用空格代替逗号，使停顿更加短促和自然，尾部保留省略号提供缓冲
    padded_text = "我们要先找 1 哦！…… "
    audio_id = "g1_u1_guide_init"
    
    wav_path = dest_dir / f"{audio_id}.wav"
    mp3_path = dest_dir / f"{audio_id}.mp3"
    
    print(f"Re-generating {audio_id} with padded text: '{padded_text}'")
    
    try:
        req = VoiceDesignRequest(
            text=padded_text,
            voice_prompt=GUIDE_PROMPT,
            strict_verbatim=True
        )
        audio_bytes = client.synthesize_voice_design(req)
        
        with open(wav_path, "wb") as f:
            f.write(audio_bytes)
            
        success = convert_wav_to_mp3(wav_path, mp3_path)
        if success:
            wav_path.unlink()
            print(f"✅ Successfully re-generated and saved to {mp3_path}")
            
            # Print duration
            cmd = ["ffmpeg", "-i", str(mp3_path)]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            for line in res.stderr.split("\n"):
                if "Duration" in line:
                    print(line.strip())
        else:
            print("❌ Failed to convert to MP3")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
