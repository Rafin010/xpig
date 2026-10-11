import os
import sys
import glob
import random
import asyncio
import httpx

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.security import create_access_token

TARGET_DIR = r"D:\_Xpig\XPIG-STORAG"
API_URL = "http://127.0.0.1:8000/api/v1/videos/upload"
STATUS_URL = "http://127.0.0.1:8000/api/v1/videos/{}"
ADMIN_USER_ID = 1

DESHI_PREFIXES = ["Exclusive viral", "New leaked", "Secret camera", "Hot scandal", "Trending viral", "Hidden camera", "Leaked private tape", "Village girl", "Exclusive hidden"]
DESHI_SUFFIXES = ["full video", "part 1", "uncut", "hd recording", "must watch", "scandal", "real video"]

def generate_title(index):
    return f"{random.choice(DESHI_PREFIXES)} deshi link {random.choice(DESHI_SUFFIXES)} - Vol {index}"

async def wait_for_video(client, video_id, headers):
    print(f"   [WAITING] Waiting for FFmpeg and Cloudflare R2 processing to complete...")
    while True:
        try:
            res = await client.get(STATUS_URL.format(video_id), headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "PUBLISHED":
                    print(f"   [SUCCESS] Video {video_id} is PUBLISHED!")
                    break
                elif data.get("status") == "FAILED":
                    print(f"   [ERROR] Video {video_id} FAILED processing.")
                    break
            await asyncio.sleep(5)
        except Exception as e:
            print(f"   [ERROR] Connection error while checking status: {e}")
            await asyncio.sleep(5)

async def main():
    print(f"Scanning {TARGET_DIR} for MP4 files...")
    mp4_files = glob.glob(os.path.join(TARGET_DIR, "**", "*.mp4"), recursive=True)
    
    if not mp4_files:
        print("No MP4 files found.")
        return

    print(f"Found {len(mp4_files)} videos.")
    token = create_access_token(subject=str(ADMIN_USER_ID))
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient(timeout=600.0) as client:
        for i, filepath in enumerate(mp4_files, 1):
            filename = os.path.basename(filepath)
            title = generate_title(i)
            print(f"\n[{i}/{len(mp4_files)}] Uploading: {filename}\n   -> Title: '{title}'")
            
            try:
                with open(filepath, "rb") as f:
                    files = {"file": (filename, f, "video/mp4")}
                    data = {"title": title, "description": "Auto-uploaded from XPIG-STORAG bulk archive."}
                    
                    response = await client.post(API_URL, data=data, files=files, headers=headers)
                    if response.status_code in [200, 201]:
                        video_id = response.json().get("video_id")
                        print(f"   [UPLOADED] Sent to staging. Video ID: {video_id}")
                        await wait_for_video(client, video_id, headers)
                    else:
                        print(f"   [FAILED] Upload returned {response.status_code}: {response.text}")
            except Exception as e:
                print(f"   [ERROR] Failed uploading {filename}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
