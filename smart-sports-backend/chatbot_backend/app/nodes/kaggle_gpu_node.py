import requests
import base64
import os

KAGGLE_GPU_URL = os.getenv("KAGGLE_GPU_URL", "")

def analyze_video_on_kaggle(video_path: str, player_name: str = "") -> tuple[str, float, dict]:
    if not KAGGLE_GPU_URL:
        return "none", 0.0, {}

    with open(video_path, "rb") as f:
        video_b64 = base64.b64encode(f.read()).decode()

    try:
        resp = requests.post(
            f"{KAGGLE_GPU_URL}/analyze",
            json={"video_base64": video_b64, "player_name": player_name},
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        print(f"✅ Kaggle response: action={data['action']}, score={data['score']}")
        return (
            data["action"],
            float(data["score"]),
            {
                "player_stats":    data.get("player_stats", {}),
                "scouting_report": data.get("scouting_report", ""),
                "market_value":    data.get("market_value", {}),
            }
        )

    except Exception as e:
        print(f"❌ Kaggle GPU error: {e}")
        return "none", 0.0, {}
    

    