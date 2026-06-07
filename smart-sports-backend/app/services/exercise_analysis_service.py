# app/services/exercise_analysis_service.py
#
# CHANGES FROM PREVIOUS VERSION:
#   1. Leg Swings FULL FIXED: Isolated completely from the generic adaptive counter logic.
#   2. Leg Swings Stages unified to match standard state machine structure ("up" and "down").
#   3. Jumping Jacks: counts on LEG opening only (hip abduction + knee extension range)
#   4. Butt Kicks: wider, more permissive knee flexion thresholds to catch fast moves
#   5. Bad reps removed entirely — all tracking, variables, and counters removed
#   6. Live camera and video upload share one unified rep-counting engine (count_reps_unified)

import cv2
import mediapipe as mp
import numpy as np
import math
import os
import asyncio
import edge_tts
from groq import Groq
import shutil
import requests
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

# -----------------------------------------------------------------------
# Joint index map (MediaPipe Pose landmark indices)
# -----------------------------------------------------------------------
JOINT_MAP = {
    "shoulder_angle_left":    (13, 11, 23),
    "shoulder_angle_right":   (14, 12, 24),
    "shoulder_flexion_left":  (13, 11, 12),
    "shoulder_flexion_right": (14, 12, 11),
    "elbow_left":             (11, 13, 15),
    "elbow_right":            (12, 14, 16),
    "knee_left":              (23, 25, 27),
    "knee_right":             (24, 26, 28),
    "hip_left":               (11, 23, 25),
    "hip_right":              (12, 24, 26),
    "hip_abduction_left":     (23, 24, 25),
    "hip_abduction_right":    (24, 23, 26),
}

# -----------------------------------------------------------------------
# Exercise rule catalogue
# -----------------------------------------------------------------------
exercise_rules = {
    "shoulder_based": {
        "arm_abduction": {
            "joints": ["shoulder_angle_left", "shoulder_angle_right"],
            "up_threshold": 80, "down_threshold": 20,
            "min_angle": 15, "max_angle": 95,
            "type": "upper", "description": "Lateral arm raise",
        },
        "shoulder_flexion": {
            "joints": ["shoulder_flexion_left", "shoulder_flexion_right"],
            "up_threshold": 90, "down_threshold": 10,
            "min_angle": 0, "max_angle": 180,
            "type": "upper", "description": "Forward arm raise",
        },
        "arm_vw": {
            "joints": ["shoulder_angle_left", "shoulder_angle_right"],
            "up_threshold": 120, "down_threshold": 60,
            "min_angle": 45, "max_angle": 135,
            "type": "upper", "description": "V-W exercise",
        },
        "arm_circles": {
            "joints": ["shoulder_angle_left", "shoulder_angle_right"],
            "up_threshold": 60, "down_threshold": 120,
            "min_angle": 30, "max_angle": 150,
            "type": "upper", "description": "Arm circles",
        },
        "arm_half_circles": {
            "joints": ["shoulder_angle_left", "shoulder_angle_right"],
            "up_threshold": 60, "down_threshold": 100,
            "min_angle": 30, "max_angle": 120,
            "type": "upper", "description": "Arm half circles",
        },
    },
    "elbow_based": {
        "pushups": {
            "joints": ["elbow_left", "elbow_right"],
            "up_threshold": 160, "down_threshold": 80,
            "min_angle": 70, "max_angle": 170,
            "type": "upper", "description": "Push-ups",
        },
        "bench_press": {
            "joints": ["elbow_left", "elbow_right"],
            "up_threshold": 150, "down_threshold": 80,
            "min_angle": 70, "max_angle": 160,
            "type": "upper", "description": "Bench press",
        },
        "shoulder_press": {
            "joints": ["elbow_left", "elbow_right"],
            "up_threshold": 160, "down_threshold": 90,
            "min_angle": 80, "max_angle": 170,
            "type": "upper", "description": "Shoulder press",
        },
        "bicep_curl": {
            "joints": ["elbow_left", "elbow_right"],
            "up_threshold": 40, "down_threshold": 150,
            "min_angle": 30, "max_angle": 160,
            "type": "upper", "description": "Bicep curl",
        },
        "triceps_pushdown": {
            "joints": ["elbow_left", "elbow_right"],
            "up_threshold": 160, "down_threshold": 40,
            "min_angle": 30, "max_angle": 170,
            "type": "upper", "description": "Triceps pushdown",
        },
        "lat_pulldown": {
            "joints": ["elbow_left", "elbow_right"],
            "up_threshold": 150, "down_threshold": 60,
            "min_angle": 45, "max_angle": 160,
            "type": "upper", "description": "Lat pulldown",
        },
    },
    "knee_based": {
        "bodyweight_squats": {
            "joints": ["knee_left", "knee_right"],
            "up_threshold": 120, "down_threshold": 60,
            "min_angle": 40, "max_angle": 130,
            "type": "lower", "description": "Bodyweight squats",
        },
        "squats": {
            "joints": ["knee_left", "knee_right"],
            "up_threshold": 160, "down_threshold": 80,
            "min_angle": 70, "max_angle": 170,
            "type": "lower", "description": "Squats",
        },
        "leg_lunge": {
            "joints": ["knee_left", "knee_right"],
            "up_threshold": 165, "down_threshold": 95,
            "min_angle": 85, "max_angle": 175,
            "type": "lower", "description": "Leg lunge",
        },
        "lunge": {
            "joints": ["knee_left"],
            "up_threshold": 140, "down_threshold": 85,
            "min_angle": 70, "max_angle": 175,
            "type": "lower", "description": "Lunge",
        },
        # ── BUTT KICKS: Permissive dynamic thresholds for running postures ──────
        "butt_kicks": {
            "joints": ["knee_left", "knee_right"],
            "up_threshold": 115,   
            "down_threshold": 135, 
            "min_angle": 40, "max_angle": 175,
            "type": "lower", "description": "Butt kicks",
        },
        "high_knee": {
            "joints": ["knee_left", "knee_right"],
            "up_threshold": 80, "down_threshold": 160,
            "min_angle": 70, "max_angle": 170,
            "type": "lower", "description": "High knee",
        },
        "leg_extension": {
            "joints": ["knee_left", "knee_right"],
            "up_threshold": 160, "down_threshold": 100,
            "min_angle": 90, "max_angle": 175,
            "type": "lower", "description": "Leg extension",
        },
    },
    "hip_based": {
        # ── LEG SWING: Standardized catalog configuration ────
        "leg_swing": {
            "joints": ["hip_left", "hip_right"],
            "up_threshold": 135,   
            "down_threshold": 75,  
            "min_angle": 30, "max_angle": 180,
            "type": "lower", "description": "Leg swing",
        },
        # ── JUMPING JACKS: Driven completely by leg movement parameters ────────────
        "jumping_jacks": {
            "joints": ["hip_abduction_left", "hip_abduction_right"],
            "up_threshold": 25,   
            "down_threshold": 8,   
            "min_angle": 0, "max_angle": 150,
            "type": "lower", "description": "Jumping jacks",
            "special": "jumping_jacks_leg",
        },
        "leg_abduction": {
            "joints": ["hip_abduction_left", "hip_abduction_right"],
            "up_threshold": 30, "down_threshold": 5,
            "min_angle": 0, "max_angle": 45,
            "type": "lower", "description": "Leg abduction",
        },
    },
}

# -----------------------------------------------------------------------
# Geometry helpers
# -----------------------------------------------------------------------

def calculate_angle(a, b, c):
    """3-point angle at vertex b (in degrees, 0-180)."""
    a = np.array([a[0], a[1]])
    b = np.array([b[0], b[1]])
    c = np.array([c[0], c[1]])
    ba = a - b
    bc = c - b
    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    if norm_ba < 0.01 or norm_bc < 0.01:
        return 0
    cosine = np.clip(np.dot(ba, bc) / (norm_ba * norm_bc), -1.0, 1.0)
    return int(np.degrees(np.arccos(cosine)))


def calculate_hip_abduction(hip_left, hip_right, knee):
    """Angle between the hip baseline and the knee on one side."""
    hip_left  = np.array(hip_left)
    hip_right = np.array(hip_right)
    knee      = np.array(knee)
    hip_vector = hip_right - hip_left
    if np.linalg.norm(hip_left - knee) < np.linalg.norm(hip_right - knee):
        knee_vector = knee - hip_left
    else:
        knee_vector = knee - hip_right
    dot  = np.dot(hip_vector, knee_vector)
    norm = np.linalg.norm(hip_vector) * np.linalg.norm(knee_vector)
    if norm < 0.01:
        return 0
    return int(np.degrees(np.arccos(np.clip(abs(dot) / norm, -1.0, 1.0))))


def smooth_angle(history, new_val, window=3):
    history.append(new_val)
    if len(history) > window:
        history.pop(0)
    return np.mean(history)


# -----------------------------------------------------------------------
# Jumping Jacks — leg-based counter
# -----------------------------------------------------------------------

def count_jumping_jacks_rep(lm, stage, reps, last_rep_frame, frame, fps):
    """
    Count a Jumping Jack rep based on LEG opening only.
    """
    min_frame_gap = max(int(fps * 0.25), 6)

    hip_l  = [lm[23].x, lm[23].y]
    hip_r  = [lm[24].x, lm[24].y]
    knee_l_pt = [lm[25].x, lm[25].y]
    knee_r_pt = [lm[26].x, lm[26].y]
    ankle_l   = [lm[27].x, lm[27].y]
    ankle_r   = [lm[28].x, lm[28].y]

    abduct_l = calculate_hip_abduction(hip_l, hip_r, knee_l_pt)
    abduct_r = calculate_hip_abduction(hip_l, hip_r, knee_r_pt)
    abduct_avg = (abduct_l + abduct_r) / 2

    knee_ang_l = calculate_angle(hip_l, knee_l_pt, ankle_l)
    knee_ang_r = calculate_angle(hip_r, knee_r_pt, ankle_r)
    legs_straight = (knee_ang_l >= 145) and (knee_ang_r >= 145)

    new_stage = stage

    if abduct_avg >= 25 and legs_straight:
        new_stage = "open"
    elif abduct_avg <= 8:
        if stage == "open" and (frame - last_rep_frame) > min_frame_gap:
            reps += 1
            last_rep_frame = frame
        new_stage = "closed"

    return new_stage, reps, last_rep_frame


# -----------------------------------------------------------------------
# Butt Kicks — dedicated counter (permissive)
# -----------------------------------------------------------------------

def count_butt_kicks_rep(angle_history, stage, reps, last_rep_frame, frame, fps):
    """
    Count butt kicks based on knee flexion with widened dynamic filters.
    """
    if len(angle_history) < 4:
        return stage, reps, last_rep_frame

    min_frame_gap = max(int(fps * 0.18), 3)
    current = np.mean(angle_history[-4:])

    new_stage = stage
    if current < 115: 
        new_stage = "kick"
    elif current > 135 and stage == "kick": 
        if (frame - last_rep_frame) > min_frame_gap:
            reps += 1
            last_rep_frame = frame
        new_stage = "return"

    return new_stage, reps, last_rep_frame


# -----------------------------------------------------------------------
# Leg Swing — Isolated Dedicated Engine (FIXED)
# -----------------------------------------------------------------------

def count_leg_swing_rep(angle_history, stage, reps, last_rep_frame, frame, fps):
    """
    Count leg swings independently using standard 'up'/'down' engine naming
    to protect integrity inside unified routers.
    """
    if len(angle_history) < 4:
        return stage, reps, last_rep_frame

    min_frame_gap = max(int(fps * 0.20), 4)
    current = np.mean(angle_history[-4:])

    new_stage = stage
    # If hip angle drops below 75 (Leg swings high forward) -> Enter state 'up'
    if current < 75: 
        new_stage = "up"
    # If hip angle recovers past 135 (Leg extends backward/neutral) -> Register valid count
    elif current > 135 and stage == "up":
        if (frame - last_rep_frame) > min_frame_gap:
            reps += 1
            last_rep_frame = frame
        new_stage = "down"

    return new_stage, reps, last_rep_frame


# -----------------------------------------------------------------------
# UNIFIED rep counter — used by BOTH live camera and video upload
# -----------------------------------------------------------------------

def count_reps_unified(angle_history, exercise_name, stage, reps,
                       last_rep_frame, frame, fps):
    """
    Single rep-counting engine shared by both processing architectures.
    """
    if exercise_name == "butt_kicks":
        return count_butt_kicks_rep(
            angle_history, stage, reps, last_rep_frame, frame, fps)

    if exercise_name == "leg_swing":
        return count_leg_swing_rep(
            angle_history, stage, reps, last_rep_frame, frame, fps)

    if len(angle_history) < 10:
        return stage, reps, last_rep_frame

    recent = angle_history[-30:]
    current = np.mean(angle_history[-6:])
    max_angle = max(recent)
    min_angle = min(recent)

    if max_angle - min_angle < 35:
        return stage, reps, last_rep_frame

    min_frame_gap = max(int(fps * 0.30), 8)
    new_stage = stage

    if exercise_name in ["leg_lunge", "lunge", "reverse_lunge"]:
        up_th   = max_angle - 20
        down_th = min_angle + 25
        if current < down_th:
            new_stage = "down"
        elif current > up_th and stage == "down":
            new_stage = "up"
            if (frame - last_rep_frame) > min_frame_gap:
                reps += 1
                last_rep_frame = frame

    elif exercise_name in ["squats", "bodyweight_squats", "leg_extension"]:
        up_th   = max_angle - 22
        down_th = min_angle + 22
        if current < down_th:
            new_stage = "down"
        elif current > up_th and stage == "down":
            new_stage = "up"
            if (frame - last_rep_frame) > min_frame_gap:
                reps += 1
                last_rep_frame = frame
    else:
        up_th   = max_angle - 18
        down_th = min_angle + 18
        if current > up_th:
            new_stage = "up"
        elif current < down_th and stage == "up":
            new_stage = "down"
            if (frame - last_rep_frame) > min_frame_gap:
                reps += 1
                last_rep_frame = frame

    return new_stage, reps, last_rep_frame


# -----------------------------------------------------------------------
# Utility: find exercise info from the catalogue
# -----------------------------------------------------------------------

def find_exercise(exercise_name):
    for category, exercises in exercise_rules.items():
        if exercise_name in exercises:
            return category, exercises[exercise_name]
    return None, None


# -----------------------------------------------------------------------
# HUD overlay drawn on each video frame
# -----------------------------------------------------------------------

def draw_info(image, name, angle, reps, stage, min_a, max_a, debug_info=""):
    h, w = image.shape[:2]
    overlay = image.copy()
    cv2.rectangle(overlay, (10, 10), (380, 150), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.55, image, 0.45, 0, image)
    cv2.rectangle(image, (10, 10), (380, 150), (255, 255, 255), 1)

    title = name.replace('_', ' ').title()
    cv2.putText(image, title,           (20, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.6,  (255, 255, 255), 1)
    cv2.putText(image, f"REPS: {reps}", (20, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0),     2)
    cv2.putText(image, f"Angle: {int(angle)}°",
                                         (20, 82), cv2.FONT_HERSHEY_SIMPLEX, 0.5,  (255, 255, 0),   1)

    color = (0, 255, 0) if min_a <= angle <= max_a else (0, 0, 255)
    cv2.putText(image, f"Safe: {min_a}-{max_a}°",
                                         (20, 104), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

    if stage:
        s_color = (0, 255, 255) if stage in ("up", "open", "forward", "kick") else (255, 165, 0)
        cv2.putText(image, f"STAGE: {stage.upper()}",
                    (220, 82), cv2.FONT_HERSHEY_SIMPLEX, 0.5, s_color, 1)

    if debug_info:
        cv2.putText(image, debug_info, (20, 128), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (200, 200, 200), 1)

    return image


# -----------------------------------------------------------------------
# AI voice feedback via Kaggle/Colab endpoint
# -----------------------------------------------------------------------

def get_ai_voice_feedback(exercise_name, min_angle, max_angle, total_reps):
    kaggle_url = os.getenv("COLAB_NGROK_URL")
    if not kaggle_url:
        print("Error: COLAB_NGROK_URL not found in .env file")
        return None

    payload = {
        "exercise_name": exercise_name,
        "min_angle":     min_angle,
        "max_angle":     max_angle,
        "total_reps":    total_reps,
    }
    try:
        response = requests.post(kaggle_url, json=payload, timeout=60)
        if response.status_code == 200:
            encoded_text = response.headers.get("X-Feedback-Text", "Great%20Job")
            ai_text = urllib.parse.unquote(encoded_text).encode('ascii', 'ignore').decode('ascii')
            audio_path = os.path.join("static", "analyzed", f"{exercise_name}_feedback.mp3")
            with open(audio_path, "wb") as f:
                f.write(response.content)
            return audio_path, ai_text
        else:
            print(f"Kaggle Error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Connection Error to Kaggle: {e}")
        return None


def create_coach_audio(text, output_filename):
    try:
        import asyncio
        import nest_asyncio
        nest_asyncio.apply()

        async def _run():
            communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
            await communicate.save(output_filename)

        asyncio.get_event_loop().run_until_complete(_run())
        return output_filename if os.path.exists(output_filename) else None
    except Exception as e:
        print(f"TTS Error: {e}")
        return None


def extract_feedback_for_tts(report_text):
    try:
        spoken = report_text.split("Coaching Feedback:\n")[1].strip()
    except Exception:
        spoken = report_text
    sentences = spoken.split('. ')
    spoken_part = '. '.join(sentences[:3])
    return spoken_part[:300] + '...' if len(spoken_part) > 300 else spoken_part


# -----------------------------------------------------------------------
# MAIN VIDEO ANALYSIS (upload pipeline)
# -----------------------------------------------------------------------

def analyze_exercise_video(
    video_path: str,
    exercise_name: str,
    groq_api_key: str,
    output_dir: str = "static/analyzed",
) -> dict:
    os.makedirs(output_dir, exist_ok=True)

    category, ex_info = find_exercise(exercise_name)
    if category is None:
        return {"error": f"Exercise '{exercise_name}' not found"}

    mp_pose = mp.solutions.pose
    pose    = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    cap = cv2.VideoCapture(video_path)
    raw_fps = cap.get(cv2.CAP_PROP_FPS)
    fps     = raw_fps if 5 < raw_fps <= 120 else 25

    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_video_path = os.path.join(output_dir, f"temp_{exercise_name}.avi")
    final_filename  = f"analyzed_{exercise_name}.mp4"
    final_video_path = os.path.abspath(os.path.join(output_dir, final_filename))

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out    = cv2.VideoWriter(temp_video_path, fourcc, fps, (width, height))

    # ── State reset ─────────────────────────────────────────────────
    reps           = 0
    stage          = None
    last_rep_frame = -int(fps)
    all_angles     = []
    joint_histories = {j: [] for j in ex_info.get('joints', [])}
    frame_count    = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        rgb     = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        if results.pose_landmarks:
            lm = results.pose_landmarks.landmark

            # Draw skeleton overlay
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp.solutions.pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style(),
            )

            # ── 1. Jumping Jacks Shared Logic ─────────────
            if exercise_name == "jumping_jacks":
                stage, reps, last_rep_frame = count_jumping_jacks_rep(
                    lm, stage, reps, last_rep_frame, frame_count, fps
                )
                hip_l  = [lm[23].x, lm[23].y]
                hip_r  = [lm[24].x, lm[24].y]
                kl     = [lm[25].x, lm[25].y]
                kr     = [lm[26].x, lm[26].y]
                main_angle = (
                    calculate_hip_abduction(hip_l, hip_r, kl) +
                    calculate_hip_abduction(hip_l, hip_r, kr)
                ) / 2
                all_angles.append(main_angle)

            # ── 2. Leg Abduction ─────────────────────────────────────────
            elif exercise_name == "leg_abduction":
                hip_l  = [lm[23].x, lm[23].y]
                hip_r  = [lm[24].x, lm[24].y]
                knee_l = [lm[25].x, lm[25].y]
                knee_r = [lm[26].x, lm[26].y]
                a_l = calculate_hip_abduction(hip_l, hip_r, knee_l)
                a_r = calculate_hip_abduction(hip_l, hip_r, knee_r)
                main_angle = max(a_l, a_r)
                all_angles.append(main_angle)
                stage, reps, last_rep_frame = count_reps_unified(
                    all_angles, exercise_name, stage, reps,
                    last_rep_frame, frame_count, fps
                )

            # ── 3. Arm circles / half-circles ────────────────────────────
            elif exercise_name in ("arm_circles", "arm_half_circles"):
                left  = calculate_angle(
                    [lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y])
                right = calculate_angle(
                    [lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
                main_angle = (left + right) / 2
                all_angles.append(main_angle)
                stage, reps, last_rep_frame = count_reps_unified(
                    all_angles, exercise_name, stage, reps,
                    last_rep_frame, frame_count, fps
                )

            # ── 4. General exercises (incl. butt_kicks, leg_swing) ───────
            else:
                frame_angles = []
                left_angle = right_angle = None

                for joint in ex_info.get('joints', []):
                    if joint in JOINT_MAP:
                        p1, p2, p3 = JOINT_MAP[joint]
                        a = [lm[p1].x, lm[p1].y]
                        b = [lm[p2].x, lm[p2].y]
                        c = [lm[p3].x, lm[p3].y]
                        angle = calculate_angle(a, b, c)
                        if joint in joint_histories:
                            angle = smooth_angle(joint_histories[joint], angle)
                        frame_angles.append(angle)
                        if joint == "knee_left":
                            left_angle = angle
                        elif joint == "knee_right":
                            right_angle = angle

                if exercise_name in ("lunge", "leg_lunge", "squats", "bodyweight_squats"):
                    if left_angle is not None and right_angle is not None:
                        main_angle = min(left_angle, right_angle)
                    else:
                        main_angle = np.mean(frame_angles) if frame_angles else 0
                else:
                    main_angle = np.mean(frame_angles) if frame_angles else 0

                if main_angle > 0:
                    all_angles.append(main_angle)
                    stage, reps, last_rep_frame = count_reps_unified(
                        all_angles, exercise_name, stage, reps,
                        last_rep_frame, frame_count, fps
                    )

            # Draw dynamic HUD updates onto frame
            frame = draw_info(
                frame, exercise_name, main_angle if 'main_angle' in dir() else 0,
                reps, stage,
                ex_info.get('min_angle', 0), ex_info.get('max_angle', 180),
            )

        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()
    pose.close()

    # ── Calculations & Metrics Assembly ────────────────────────────────
    if all_angles:
        min_ang = float(min(all_angles))
        max_ang = float(max(all_angles))
    else:
        min_ang = max_ang = 0.0

    ai_text    = "Exercise completed!"
    audio_path = None

    if reps > 0:
        result = get_ai_voice_feedback(exercise_name, min_ang, max_ang, reps)
        if result:
            audio_path, ai_text = result

    # ── FFmpeg Core Rebuilding Container pipeline ──────────────────────
    try:
        fixed_temp = temp_video_path.replace(".avi", "_fixed.avi")
        os.system(f'ffmpeg -i "{temp_video_path}" -c copy "{fixed_temp}" -y')
        if os.path.exists(fixed_temp):
            temp_video_path = fixed_temp
    except Exception:
        pass

    try:
        if audio_path and os.path.exists(audio_path):
            cmd = (
                f'ffmpeg -i "{temp_video_path}" -i "{audio_path}" '
                f'-c:v libx264 -preset ultrafast -crf 28 -c:a aac '
                f'"{final_video_path}" -y'
            )
        else:
            cmd = (
                f'ffmpeg -i "{temp_video_path}" '
                f'-c:v libx264 -preset ultrafast -crf 28 '
                f'"{final_video_path}" -y'
            )
        ret = os.system(cmd)
        if ret != 0:
            shutil.copy(temp_video_path, final_video_path)
    except Exception as e:
        print(f"Video assembly error: {e}")
        shutil.copy(temp_video_path, final_video_path)

    # Clean working artifacts
    for tmp in [temp_video_path, temp_video_path.replace(".avi", "_fixed.avi")]:
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except Exception:
                pass

    return {
        "exercise_name":   exercise_name,
        "total_reps":      reps,
        "min_angle":       round(min_ang, 1),
        "max_angle":       round(max_ang, 1),
        "range_of_motion": round(max_ang - min_ang, 1),
        "ai_feedback":     ai_text,
        "video_url":       f"/static/analyzed/{final_filename}",
        "audio_url": (
            f"/static/analyzed/{exercise_name}_feedback.mp3"
            if audio_path and os.path.exists(audio_path)
            else None
        ),
    }


def get_all_exercises():
    exercises = []
    for category, exs in exercise_rules.items():
        for name, info in exs.items():
            exercises.append({
                "name":        name,
                "category":    category,
                "description": info.get("description", ""),
                "type":        info.get("type", "unknown"),
            })
    return exercises