# app/services/exercise_analysis_service.py
#
# CHANGES FROM PREVIOUS VERSION:
#   1. Re-introduced Bad Reps tracking for ALL exercises dynamically.
#   2. Fixed Jumping Jacks: now counts based on LEG abduction angle (knee angle range check added).
#   3. Fixed Butt Kicks: corrected thresholds — triggers when knee flexion < 90° (heel to butt).
#   4. Fixed Leg Swing: corrected thresholds — triggers when hip angle < 60° (deep forward swing).
#   5. Added per-exercise bad rep logic for ALL shoulder, elbow, knee, hip exercises.
#   6. Fully synchronized unified bad_reps tracking between live stream and upload module.

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
        "butt_kicks": {
            # knee_left/right angle (hip→knee→ankle)
            # Good rep: heel fully reaches butt → knee angle < 65°
            # Bad rep:  partial kick → knee angle 65°–95°
            # Down (leg extended): knee angle > 140°
            "joints": ["knee_left", "knee_right"],
            "up_threshold":   65,   # ✅ FIXED: deep flexion = good kick
            "down_threshold": 140,  # ✅ FIXED: leg extended = reset
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
        "leg_swing": {
            # hip_left/right angle (shoulder→hip→knee)
            # Good rep: deep forward swing → hip angle < 55°
            # Bad rep:  shallow swing → hip angle 55°–80°
            # Down (leg back / neutral): hip angle > 130°
            "joints": ["hip_left"],
            "up_threshold":   55,   # ✅ FIXED: deep forward swing
            "down_threshold": 130,  # ✅ FIXED: back to neutral/back
            "min_angle": 30, "max_angle": 180,
            "type": "lower", "description": "Leg swing",
        },
        "jumping_jacks": {
            # ✅ FIXED: now uses LEG abduction (hip_abduction joints)
            # Good rep: legs wide enough AND knees straight (knee angle ≥ 150°)
            # Bad rep:  legs partially open OR knees bent
            "joints": ["hip_abduction_left", "hip_abduction_right"],
            "up_threshold":   28,   # ✅ good open: abduction ≥ 28°
            "down_threshold":  8,   # closed: abduction ≤ 8°
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
# Per-exercise bad rep thresholds
# Maps exercise_name → (bad_zone_start, bad_zone_end, direction)
# direction: "above_up" = bad if doesn't reach up_threshold fully
#            "below_down" = bad if doesn't reach down_threshold fully
# -----------------------------------------------------------------------
BAD_REP_ZONES = {
    # === SHOULDER ===
    # arm must reach 80° to count; 50–79° = bad (partial raise)
    "arm_abduction":     {"bad_low": 50,  "bad_high": 79,   "check": "up_side"},
    # shoulder flexion must reach 90°; 60–89° = bad
    "shoulder_flexion":  {"bad_low": 60,  "bad_high": 89,   "check": "up_side"},
    # arm_vw must reach 120°; 90–119° = bad
    "arm_vw":            {"bad_low": 90,  "bad_high": 119,  "check": "up_side"},
    # arm_circles / arm_half_circles handled in unified (delta-based)
    "arm_circles":       {"bad_low": 40,  "bad_high": 55,   "check": "up_side"},
    "arm_half_circles":  {"bad_low": 40,  "bad_high": 55,   "check": "up_side"},

    # === ELBOW ===
    # pushups must go down to 80°; 110–130° = bad (not deep enough)
    "pushups":           {"bad_low": 110, "bad_high": 130,  "check": "down_side"},
    # bench_press: same pattern
    "bench_press":       {"bad_low": 110, "bad_high": 130,  "check": "down_side"},
    # shoulder_press must go down to 90°; 110–130° = bad
    "shoulder_press":    {"bad_low": 110, "bad_high": 130,  "check": "down_side"},
    # bicep_curl must reach 40°; 55–85° = bad (not curled enough)
    "bicep_curl":        {"bad_low": 55,  "bad_high": 85,   "check": "up_side"},
    # triceps_pushdown must go down to 40°; 55–90° = bad
    "triceps_pushdown":  {"bad_low": 55,  "bad_high": 90,   "check": "down_side"},
    # lat_pulldown must go down to 60°; 80–110° = bad
    "lat_pulldown":      {"bad_low": 80,  "bad_high": 110,  "check": "down_side"},

    # === KNEE ===
    # squats must go down to 80°; 105–130° = bad (not deep enough)
    "squats":            {"bad_low": 105, "bad_high": 130,  "check": "down_side"},
    "bodyweight_squats": {"bad_low": 80,  "bad_high": 100,  "check": "down_side"},
    # leg_lunge must go down to 95°; 115–140° = bad
    "leg_lunge":         {"bad_low": 115, "bad_high": 140,  "check": "down_side"},
    "lunge":             {"bad_low": 105, "bad_high": 120,  "check": "down_side"},
    # butt_kicks: must go up to < 65°; 65–95° = bad (shallow kick)
    "butt_kicks":        {"bad_low": 65,  "bad_high": 95,   "check": "up_side"},
    # high_knee: must reach hip angle < 80°; 80–115° = bad
    "high_knee":         {"bad_low": 80,  "bad_high": 115,  "check": "up_side"},
    # leg_extension must reach 160°; 130–155° = bad
    "leg_extension":     {"bad_low": 130, "bad_high": 155,  "check": "up_side"},

    # === HIP ===
    # leg_swing: must reach < 55°; 55–80° = bad (shallow swing)
    "leg_swing":         {"bad_low": 55,  "bad_high": 80,   "check": "up_side"},
    # leg_abduction must reach 30°; 15–25° = bad
    "leg_abduction":     {"bad_low": 15,  "bad_high": 25,   "check": "up_side"},
}


# -----------------------------------------------------------------------
# Geometry helpers
# -----------------------------------------------------------------------

def calculate_angle(a, b, c):
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
# Jumping Jacks — ✅ FIXED: Leg-based Counter + Bad Rep Checking
# Now validates:
#   1. Hip abduction (leg spread) ≥ 28° for "open"
#   2. Knee angle ≥ 150° (legs STRAIGHT) — key fix to ensure leg-driven counting
#   3. Partial spread (15–27°) OR bent knees = "bad_open"
# -----------------------------------------------------------------------

def count_jumping_jacks_rep(lm, stage, reps, bad_reps, last_rep_frame, frame, fps):
    min_frame_gap = max(int(fps * 0.25), 6)

    hip_l     = [lm[23].x, lm[23].y]
    hip_r     = [lm[24].x, lm[24].y]
    knee_l_pt = [lm[25].x, lm[25].y]
    knee_r_pt = [lm[26].x, lm[26].y]
    ankle_l   = [lm[27].x, lm[27].y]
    ankle_r   = [lm[28].x, lm[28].y]

    # Leg spread (abduction) — primary driver
    abduct_l   = calculate_hip_abduction(hip_l, hip_r, knee_l_pt)
    abduct_r   = calculate_hip_abduction(hip_l, hip_r, knee_r_pt)
    abduct_avg = (abduct_l + abduct_r) / 2

    # Knee straightness check — legs must be STRAIGHT when open (not bent)
    knee_ang_l = calculate_angle(hip_l, knee_l_pt, ankle_l)
    knee_ang_r = calculate_angle(hip_r, knee_r_pt, ankle_r)
    legs_straight = (knee_ang_l >= 150) and (knee_ang_r >= 150)

    # Ankle spread as extra validation (ankles should be wide apart)
    ankle_spread = abs(ankle_l[0] - ankle_r[0])   # normalized X distance
    ankles_wide  = ankle_spread > 0.20             # >20% of frame width

    new_stage = stage

    # ── Good open: legs sufficiently spread, straight, and ankles wide
    if abduct_avg >= 28 and legs_straight and ankles_wide:
        new_stage = "open"

    # ── Bad open: partial spread OR bent knees (user is trying but failing form)
    elif (15 <= abduct_avg < 28) or (abduct_avg >= 28 and not legs_straight):
        new_stage = "bad_open"

    # ── Closed: legs back together → count the rep based on previous stage
    elif abduct_avg <= 8:
        if (frame - last_rep_frame) > min_frame_gap:
            if stage == "open":
                reps += 1
                last_rep_frame = frame
            elif stage == "bad_open":
                bad_reps += 1
                last_rep_frame = frame
        new_stage = "closed"

    return new_stage, reps, bad_reps, last_rep_frame


# -----------------------------------------------------------------------
# Butt Kicks — ✅ FIXED Counter + Bad Reps
# MediaPipe knee angle = hip→knee→ankle
# Good rep: heel reaches butt → knee angle < 65° (deep flexion)
# Bad rep:  partial kick → knee angle 65°–95°
# Reset:    leg extended → knee angle > 140°
# Uses alternating legs (min of left/right to catch whichever leg kicks)
# -----------------------------------------------------------------------

def count_butt_kicks_rep(angle_history, stage, reps, bad_reps, last_rep_frame, frame, fps):
    if len(angle_history) < 4:
        return stage, reps, bad_reps, last_rep_frame

    min_frame_gap = max(int(fps * 0.16), 3)
    current = np.mean(angle_history[-4:])   # angle_history contains min(left, right)

    new_stage = stage

    if current < 65:             # ✅ Deep flexion — good kick (heel to butt)
        new_stage = "up"
    elif 65 <= current < 95:     # ✅ Shallow kick — bad rep attempt
        new_stage = "bad_up"
    elif current > 140:          # ✅ Leg extended — rep completion check
        if (frame - last_rep_frame) > min_frame_gap:
            if stage == "up":
                reps += 1
                last_rep_frame = frame
            elif stage == "bad_up":
                bad_reps += 1
                last_rep_frame = frame
        new_stage = "down"

    return new_stage, reps, bad_reps, last_rep_frame


# -----------------------------------------------------------------------
# Leg Swing — ✅ FIXED Counter + Bad Reps
# MediaPipe hip angle = shoulder→hip→knee
# Good rep: deep forward swing → hip angle < 55°
# Bad rep:  shallow swing → hip angle 55°–80°
# Reset:    leg back / neutral → hip angle > 130°
# Uses alternating legs (min of left/right)
# -----------------------------------------------------------------------

def count_leg_swing_rep(angle_history, stage, reps, bad_reps, last_rep_frame, frame, fps):
    if len(angle_history) < 4:
        return stage, reps, bad_reps, last_rep_frame

    min_frame_gap = max(int(fps * 0.18), 3)
    current = np.mean(angle_history[-4:])   # angle_history contains min(left, right)

    new_stage = stage

    if current < 55:             # ✅ Deep forward swing — good rep
        new_stage = "up"
    elif 55 <= current < 80:     # ✅ Shallow swing — bad rep
        new_stage = "bad_up"
    elif current > 130:          # ✅ Back to neutral/back — rep completion check
        if (frame - last_rep_frame) > min_frame_gap:
            if stage == "up":
                reps += 1
                last_rep_frame = frame
            elif stage == "bad_up":
                bad_reps += 1
                last_rep_frame = frame
        new_stage = "down"

    return new_stage, reps, bad_reps, last_rep_frame


# -----------------------------------------------------------------------
# UNIFIED rep counter — ✅ FULL bad rep support for ALL exercises
# 
# Logic per exercise type:
#   "up_side" exercises: movement goes toward a small/large angle peak
#     → bad_up if reaches bad zone but not the full up_threshold
#   "down_side" exercises: movement goes toward a deep angle (squat-style)
#     → bad_down if reaches bad zone but not the full down_threshold
# -----------------------------------------------------------------------

def count_reps_unified(angle_history, exercise_name, stage, reps, bad_reps,
                       last_rep_frame, frame, fps):
    # ── Special handlers ──────────────────────────────────────────────
    if exercise_name == "butt_kicks":
        return count_butt_kicks_rep(angle_history, stage, reps, bad_reps, last_rep_frame, frame, fps)

    if exercise_name == "leg_swing":
        return count_leg_swing_rep(angle_history, stage, reps, bad_reps, last_rep_frame, frame, fps)

    if len(angle_history) < 10:
        return stage, reps, bad_reps, last_rep_frame

    recent  = angle_history[-30:]
    current = np.mean(angle_history[-6:])
    max_a   = max(recent)
    min_a   = min(recent)
    delta   = max_a - min_a

    min_frame_gap = max(int(fps * 0.30), 8)
    new_stage = stage

    # ── Get per-exercise bad rep zone ─────────────────────────────────
    bad_zone = BAD_REP_ZONES.get(exercise_name, None)

    # ════════════════════════════════════════════════════════════════
    # 1. LOWER BODY — LUNGE pattern (goes DOWN into lunge position)
    # ════════════════════════════════════════════════════════════════
    if exercise_name in ["leg_lunge", "lunge", "reverse_lunge"]:
        up_th   = max_a - 20
        down_th = min_a + 25

        if bad_zone:
            # bad_down: reached some bend but not enough
            bad_down_th_lo = bad_zone["bad_low"]
            bad_down_th_hi = bad_zone["bad_high"]
        else:
            bad_down_th_lo = min_a + 35
            bad_down_th_hi = min_a + 55

        if current < down_th:
            new_stage = "down"
        elif bad_down_th_lo <= current <= bad_down_th_hi and stage != "down":
            new_stage = "bad_down"
        elif current > up_th:
            if (frame - last_rep_frame) > min_frame_gap:
                if stage == "down":
                    reps += 1
                    last_rep_frame = frame
                elif stage == "bad_down":
                    bad_reps += 1
                    last_rep_frame = frame
            new_stage = "up"

    # ════════════════════════════════════════════════════════════════
    # 2. LOWER BODY — SQUAT / LEG EXTENSION pattern
    # ════════════════════════════════════════════════════════════════
    elif exercise_name in ["squats", "bodyweight_squats", "leg_extension"]:
        up_th   = max_a - 22
        down_th = min_a + 22

        if bad_zone:
            bad_down_th_lo = bad_zone["bad_low"]
            bad_down_th_hi = bad_zone["bad_high"]
        else:
            bad_down_th_lo = min_a + 38
            bad_down_th_hi = min_a + 55

        if current < down_th:
            new_stage = "down"
        elif bad_down_th_lo <= current <= bad_down_th_hi and stage != "down":
            new_stage = "bad_down"
        elif current > up_th:
            if (frame - last_rep_frame) > min_frame_gap:
                if stage == "down":
                    reps += 1
                    last_rep_frame = frame
                elif stage == "bad_down":
                    bad_reps += 1
                    last_rep_frame = frame
            new_stage = "up"

    # ════════════════════════════════════════════════════════════════
    # 3. HIGH KNEE — angle goes DOWN (hip flexion decreases angle)
    # ════════════════════════════════════════════════════════════════
    elif exercise_name == "high_knee":
        # Good: hip/knee angle drops below 80° (knee up to chest)
        # Bad:  angle 80°–115° (partial knee raise)
        # Reset: angle > 155° (leg down)
        if current < 80:
            new_stage = "up"
        elif 80 <= current < 115 and stage != "up":
            new_stage = "bad_up"
        elif current > 155:
            if (frame - last_rep_frame) > min_frame_gap:
                if stage == "up":
                    reps += 1
                    last_rep_frame = frame
                elif stage == "bad_up":
                    bad_reps += 1
                    last_rep_frame = frame
            new_stage = "down"

    # ════════════════════════════════════════════════════════════════
    # 4. LEG ABDUCTION — angle goes UP (hip spreads outward)
    # ════════════════════════════════════════════════════════════════
    elif exercise_name == "leg_abduction":
        # Good: abduction ≥ 30°
        # Bad:  abduction 15°–25° (partial spread)
        # Reset: abduction ≤ 5°
        if current >= 30:
            new_stage = "up"
        elif 15 <= current < 28 and stage != "up":
            new_stage = "bad_up"
        elif current <= 5:
            if (frame - last_rep_frame) > min_frame_gap:
                if stage == "up":
                    reps += 1
                    last_rep_frame = frame
                elif stage == "bad_up":
                    bad_reps += 1
                    last_rep_frame = frame
            new_stage = "down"

    # ════════════════════════════════════════════════════════════════
    # 5. UPPER BODY — ALL shoulder and elbow exercises
    #    Uses BAD_REP_ZONES for per-exercise thresholds
    # ════════════════════════════════════════════════════════════════
    else:
        if delta < 20:   # Not enough movement — ignore
            return stage, reps, bad_reps, last_rep_frame

        up_th   = max_a - 18
        down_th = min_a + 18

        if bad_zone:
            check     = bad_zone["check"]
            bad_lo    = bad_zone["bad_low"]
            bad_hi    = bad_zone["bad_high"]

            if check == "up_side":
                # Exercises where "up" = reaching a HIGH angle (arm_abduction, shoulder_flexion, etc.)
                # Bad: reached partial range but not full up_threshold
                if current > up_th:
                    new_stage = "up"
                elif bad_lo <= current <= bad_hi and stage != "up":
                    new_stage = "bad_up"
                elif current < down_th:
                    if (frame - last_rep_frame) > min_frame_gap:
                        if stage == "up":
                            reps += 1
                            last_rep_frame = frame
                        elif stage == "bad_up":
                            bad_reps += 1
                            last_rep_frame = frame
                    new_stage = "down"

            elif check == "down_side":
                # Exercises where "down" = reaching a LOW angle (pushups, bicep_curl bottom, etc.)
                # For bicep_curl: "up" = curl (LOW angle ~40°), "down" = extended (HIGH angle ~150°)
                # For pushups: "up" = extended (HIGH angle), "down" = deep bend (LOW angle)
                if exercise_name in ["bicep_curl"]:
                    # Inverted: rep is counted when returning from curl (low angle → high)
                    if current < bad_lo:    # Full curl reached
                        new_stage = "up"
                    elif bad_lo <= current <= bad_hi and stage != "up":
                        new_stage = "bad_up"
                    elif current > up_th:   # Arm fully extended
                        if (frame - last_rep_frame) > min_frame_gap:
                            if stage == "up":
                                reps += 1
                                last_rep_frame = frame
                            elif stage == "bad_up":
                                bad_reps += 1
                                last_rep_frame = frame
                        new_stage = "down"
                else:
                    # Standard: rep is counted when going DOWN and coming back UP
                    if current < down_th:   # Went deep enough
                        new_stage = "down"
                    elif bad_lo <= current <= bad_hi and stage != "down":
                        new_stage = "bad_down"
                    elif current > up_th:   # Back to extended
                        if (frame - last_rep_frame) > min_frame_gap:
                            if stage == "down":
                                reps += 1
                                last_rep_frame = frame
                            elif stage == "bad_down":
                                bad_reps += 1
                                last_rep_frame = frame
                        new_stage = "up"
        else:
            # Fallback for exercises without explicit bad zone (arm_circles, etc.)
            bad_up_th = max_a - 30
            if current > up_th:
                new_stage = "up"
            elif bad_up_th <= current <= up_th and stage != "up":
                new_stage = "bad_up"
            elif current < down_th:
                if (frame - last_rep_frame) > min_frame_gap:
                    if stage == "up":
                        reps += 1
                        last_rep_frame = frame
                    elif stage == "bad_up":
                        bad_reps += 1
                        last_rep_frame = frame
                new_stage = "down"

    return new_stage, reps, bad_reps, last_rep_frame


# -----------------------------------------------------------------------
# Utility & Overlay Drawing Components
# -----------------------------------------------------------------------

def find_exercise(exercise_name):
    for category, exercises in exercise_rules.items():
        if exercise_name in exercises:
            return category, exercises[exercise_name]
    return None, None


def draw_info(image, name, angle, reps, bad_reps, stage, min_a, max_a, debug_info=""):
    h, w = image.shape[:2]
    overlay = image.copy()
    cv2.rectangle(overlay, (10, 10), (380, 160), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.55, image, 0.45, 0, image)
    cv2.rectangle(image, (10, 10), (380, 160), (255, 255, 255), 1)

    title = name.replace('_', ' ').title()
    cv2.putText(image, title,                (20, 32),  cv2.FONT_HERSHEY_SIMPLEX, 0.6,  (255, 255, 255), 1)
    cv2.putText(image, f"GOOD REPS: {reps}", (20, 58),  cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0),    2)
    cv2.putText(image, f"BAD REPS: {bad_reps}", (20, 84), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 255),  2)
    cv2.putText(image, f"Angle: {int(angle)}°", (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

    color = (0, 255, 0) if min_a <= angle <= max_a else (0, 0, 255)
    cv2.putText(image, f"Safe: {min_a}-{max_a}°", (20, 132), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

    if stage:
        s_color = (0, 0, 255) if "bad" in stage else (0, 255, 255)
        cv2.putText(image, f"STAGE: {stage.upper()}", (210, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.5, s_color, 1)

    return image


# -----------------------------------------------------------------------
# AI voice feedback components
# -----------------------------------------------------------------------

def get_ai_voice_feedback(exercise_name, min_angle, max_angle, total_reps):
    kaggle_url = os.getenv("COLAB_NGROK_URL")
    if not kaggle_url:
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
        return None
    except Exception:
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
    except Exception:
        return None


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

    cap     = cv2.VideoCapture(video_path)
    raw_fps = cap.get(cv2.CAP_PROP_FPS)
    fps     = raw_fps if 5 < raw_fps <= 120 else 25

    width   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height  = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_video_path  = os.path.join(output_dir, f"temp_{exercise_name}.avi")
    final_filename   = f"analyzed_{exercise_name}.mp4"
    final_video_path = os.path.abspath(os.path.join(output_dir, final_filename))

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out    = cv2.VideoWriter(temp_video_path, fourcc, fps, (width, height))

    # ── State Initialization ─────────────────────────────────────────
    reps            = 0
    bad_reps        = 0
    stage           = None
    last_rep_frame  = -int(fps)
    all_angles      = []
    joint_histories = {j: [] for j in ex_info.get('joints', [])}
    frame_count     = 0
    main_angle      = 0   # ensure always defined

    while cap.isOpened():
        success, frame_img = cap.read()
        if not success:
            break

        rgb     = cv2.cvtColor(frame_img, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        if results.pose_landmarks:
            lm = results.pose_landmarks.landmark

            mp.solutions.drawing_utils.draw_landmarks(
                frame_img,
                results.pose_landmarks,
                mp.solutions.pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style(),
            )

            # ── 1. Jumping Jacks (✅ Leg-driven) ──────────────────────
            if exercise_name == "jumping_jacks":
                stage, reps, bad_reps, last_rep_frame = count_jumping_jacks_rep(
                    lm, stage, reps, bad_reps, last_rep_frame, frame_count, fps
                )
                hip_l  = [lm[23].x, lm[23].y]
                hip_r  = [lm[24].x, lm[24].y]
                kl     = [lm[25].x, lm[25].y]
                kr     = [lm[26].x, lm[26].y]
                main_angle = (calculate_hip_abduction(hip_l, hip_r, kl) +
                              calculate_hip_abduction(hip_l, hip_r, kr)) / 2
                all_angles.append(main_angle)

            # ── 2. Leg Abduction ──────────────────────────────────────
            elif exercise_name == "leg_abduction":
                hip_l  = [lm[23].x, lm[23].y]
                hip_r  = [lm[24].x, lm[24].y]
                knee_l = [lm[25].x, lm[25].y]
                knee_r = [lm[26].x, lm[26].y]
                main_angle = max(
                    calculate_hip_abduction(hip_l, hip_r, knee_l),
                    calculate_hip_abduction(hip_l, hip_r, knee_r)
                )
                all_angles.append(main_angle)
                stage, reps, bad_reps, last_rep_frame = count_reps_unified(
                    all_angles, exercise_name, stage, reps, bad_reps,
                    last_rep_frame, frame_count, fps
                )

            # ── 3. Arm Circles / Half Circles ────────────────────────
            elif exercise_name in ("arm_circles", "arm_half_circles"):
                left  = calculate_angle(
                    [lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]
                )
                right = calculate_angle(
                    [lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y]
                )
                main_angle = (left + right) / 2
                all_angles.append(main_angle)
                stage, reps, bad_reps, last_rep_frame = count_reps_unified(
                    all_angles, exercise_name, stage, reps, bad_reps,
                    last_rep_frame, frame_count, fps
                )

            # ── 4. Butt Kicks & Leg Swing — ✅ Alternating leg logic ──
            elif exercise_name in ("butt_kicks", "leg_swing"):
                frame_angles = []
                left_angle = right_angle = None

                for joint in ex_info.get('joints', []):
                    if joint in JOINT_MAP:
                        p1, p2, p3 = JOINT_MAP[joint]
                        angle = calculate_angle(
                            [lm[p1].x, lm[p1].y],
                            [lm[p2].x, lm[p2].y],
                            [lm[p3].x, lm[p3].y]
                        )
                        if joint in joint_histories:
                            angle = smooth_angle(joint_histories[joint], angle)
                        frame_angles.append(angle)
                        if "left"  in joint: left_angle  = angle
                        if "right" in joint: right_angle = angle

                # Use the MINIMUM (whichever leg is currently kicking/swinging)
                if left_angle is not None and right_angle is not None:
                    main_angle = min(left_angle, right_angle)
                elif frame_angles:
                    main_angle = np.mean(frame_angles)
                else:
                    main_angle = 0

                if main_angle > 0:
                    all_angles.append(main_angle)
                    stage, reps, bad_reps, last_rep_frame = count_reps_unified(
                        all_angles, exercise_name, stage, reps, bad_reps,
                        last_rep_frame, frame_count, fps
                    )

            # ── 5. All remaining exercises (shoulder, elbow, knee, hip) ──
            else:
                frame_angles = []
                left_angle = right_angle = None

                for joint in ex_info.get('joints', []):
                    if joint in JOINT_MAP:
                        p1, p2, p3 = JOINT_MAP[joint]
                        angle = calculate_angle(
                            [lm[p1].x, lm[p1].y],
                            [lm[p2].x, lm[p2].y],
                            [lm[p3].x, lm[p3].y]
                        )
                        if joint in joint_histories:
                            angle = smooth_angle(joint_histories[joint], angle)
                        frame_angles.append(angle)
                        if "left"  in joint: left_angle  = angle
                        if "right" in joint: right_angle = angle

                if exercise_name in ("lunge", "leg_lunge", "squats",
                                     "bodyweight_squats", "high_knee"):
                    # Lower body: use min (whichever leg is deeper)
                    if left_angle is not None and right_angle is not None:
                        main_angle = min(left_angle, right_angle)
                    else:
                        main_angle = np.mean(frame_angles) if frame_angles else 0
                else:
                    # Upper body: average both sides
                    main_angle = np.mean(frame_angles) if frame_angles else 0

                if main_angle > 0:
                    all_angles.append(main_angle)
                    stage, reps, bad_reps, last_rep_frame = count_reps_unified(
                        all_angles, exercise_name, stage, reps, bad_reps,
                        last_rep_frame, frame_count, fps
                    )

            # Update HUD
            frame_img = draw_info(
                frame_img, exercise_name, main_angle,
                reps, bad_reps, stage,
                ex_info.get('min_angle', 0), ex_info.get('max_angle', 180)
            )

        out.write(frame_img)
        frame_count += 1

    cap.release()
    out.release()
    pose.close()

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

    # ── FFmpeg pipeline ────────────────────────────────────────────────
    try:
        fixed_temp = temp_video_path.replace(".avi", "_fixed.avi")
        os.system(f'ffmpeg -i "{temp_video_path}" -c copy "{fixed_temp}" -y')
        if os.path.exists(fixed_temp):
            temp_video_path = fixed_temp
    except Exception:
        pass

    try:
        if audio_path and os.path.exists(audio_path):
            cmd = (f'ffmpeg -i "{temp_video_path}" -i "{audio_path}" '
                   f'-c:v libx264 -preset ultrafast -crf 28 -c:a aac "{final_video_path}" -y')
        else:
            cmd = (f'ffmpeg -i "{temp_video_path}" '
                   f'-c:v libx264 -preset ultrafast -crf 28 "{final_video_path}" -y')
        os.system(cmd)
    except Exception:
        shutil.copy(temp_video_path, final_video_path)

    for tmp in [temp_video_path, temp_video_path.replace(".avi", "_fixed.avi")]:
        if os.path.exists(tmp):
            os.remove(tmp)

    return {
        "exercise_name":   exercise_name,
        "total_reps":      reps,
        "bad_reps":        bad_reps,
        "min_angle":       round(min_ang, 1),
        "max_angle":       round(max_ang, 1),
        "range_of_motion": round(max_ang - min_ang, 1),
        "ai_feedback":     ai_text,
        "video_url":       f"/static/analyzed/{final_filename}",
        "audio_url":       (f"/static/analyzed/{exercise_name}_feedback.mp3"
                            if audio_path else None),
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
