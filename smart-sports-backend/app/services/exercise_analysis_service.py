# # app/services/exercise_analysis_service.py
# import cv2
# import mediapipe as mp
# import numpy as np
# import math
# import os
# import asyncio
# import edge_tts
# from groq import Groq

# # -----------------------------------------------------------------------
# # خريطة المفاصل - من الـ notebook الأصلي
# # -----------------------------------------------------------------------
# JOINT_MAP = {
#     "shoulder_angle_left":    (13, 11, 23),
#     "shoulder_angle_right":   (14, 12, 24),
#     "shoulder_flexion_left":  (13, 11, 12),
#     "shoulder_flexion_right": (14, 12, 11),
#     "elbow_left":             (11, 13, 15),
#     "elbow_right":            (12, 14, 16),
#     "knee_left":              (23, 25, 27),
#     "knee_right":             (24, 26, 28),
#     "hip_left":               (11, 23, 25),
#     "hip_right":              (12, 24, 26),
#     "hip_abduction_left":     (23, 24, 25),
#     "hip_abduction_right":    (24, 23, 26),
# }

# # -----------------------------------------------------------------------
# # قاموس التمارين - من الـ notebook الأصلي
# # -----------------------------------------------------------------------
# exercise_rules = {
#     "shoulder_based": {
#         "arm_abduction":    {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 80,  "down_threshold": 20,  "min_angle": 15,  "max_angle": 95,  "type": "upper", "description": "Lateral arm raise"},
#         "shoulder_flexion": {"joints": ["shoulder_flexion_left", "shoulder_flexion_right"],"up_threshold": 90,  "down_threshold": 10,  "min_angle": 0,   "max_angle": 180, "type": "upper", "description": "Forward arm raise"},
#         "arm_vw":           {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 120, "down_threshold": 60,  "min_angle": 45,  "max_angle": 135, "type": "upper", "description": "V-W exercise"},
#         "arm_circles":      {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 60,  "down_threshold": 120, "min_angle": 30,  "max_angle": 150, "type": "upper", "description": "Arm circles"},
#         "arm_half_circles": {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 60,  "down_threshold": 100, "min_angle": 30,  "max_angle": 120, "type": "upper", "description": "Arm half circles"},
#     },
#     "elbow_based": {
#         "pushups":           {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 80,  "min_angle": 70,  "max_angle": 170, "type": "upper", "description": "Push-ups"},
#         "bench_press":       {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 80,  "min_angle": 70,  "max_angle": 160, "type": "upper", "description": "Bench press"},
#         "shoulder_press":    {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 90,  "min_angle": 80,  "max_angle": 170, "type": "upper", "description": "Shoulder press"},
#         "bicep_curl":        {"joints": ["elbow_left", "elbow_right"], "up_threshold": 40,  "down_threshold": 150, "min_angle": 30,  "max_angle": 160, "type": "upper", "description": "Bicep curl"},
#         "triceps_pushdown":  {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 40,  "min_angle": 30,  "max_angle": 170, "type": "upper", "description": "Triceps pushdown"},
#         "lat_pulldown":      {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 60,  "min_angle": 45,  "max_angle": 160, "type": "upper", "description": "Lat pulldown"},
#     },
#     "knee_based": {
#         "bodyweight_squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 120, "down_threshold": 60,  "min_angle": 40, "max_angle": 130, "type": "lower", "description": "Bodyweight squats"},
#         "squats":            {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 80,  "min_angle": 70, "max_angle": 170, "type": "lower", "description": "Squats"},
#         "leg_lunge":         {"joints": ["knee_left", "knee_right"], "up_threshold": 165, "down_threshold": 95,  "min_angle": 85, "max_angle": 175, "type": "lower", "description": "Leg lunge"},
#         "lunge":             {"joints": ["knee_left"],               "up_threshold": 140, "down_threshold": 85,  "min_angle": 70, "max_angle": 175, "type": "lower", "description": "Lunge"},
#         "butt_kicks":        {"joints": ["knee_left", "knee_right"], "up_threshold": 60,  "down_threshold": 150, "min_angle": 45, "max_angle": 160, "type": "lower", "description": "Butt kicks"},
#         "high_knee":         {"joints": ["knee_left", "knee_right"], "up_threshold": 80,  "down_threshold": 160, "min_angle": 70, "max_angle": 170, "type": "lower", "description": "High knee"},
#         "leg_extension":     {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 100, "min_angle": 90, "max_angle": 175, "type": "lower", "description": "Leg extension"},
#     },
#     "hip_based": {
#         "leg_swing":    {"joints": ["hip_left", "hip_right"],               "up_threshold": 80,  "down_threshold": 10, "min_angle": 0,  "max_angle": 90,  "type": "lower", "description": "Leg swing"},
#         "jumping_jacks":{"joints": ["hip_abduction_left", "hip_abduction_right"], "up_threshold": 140, "down_threshold": 30, "min_angle": 20, "max_angle": 150, "type": "lower", "description": "Jumping jacks"},
#         "leg_abduction":{"joints": ["hip_abduction_left", "hip_abduction_right"], "up_threshold": 30,  "down_threshold": 5,  "min_angle": 0,  "max_angle": 45,  "type": "lower", "description": "Leg abduction"},
#     },
# }

# # -----------------------------------------------------------------------
# # الدوال الأساسية من الـ notebook الأصلي (بالظبط)
# # -----------------------------------------------------------------------
# def calculate_angle(a, b, c):
#     a = np.array([a[0], a[1]])
#     b = np.array([b[0], b[1]])
#     c = np.array([c[0], c[1]])
#     ba = a - b
#     bc = c - b
#     norm_ba = np.linalg.norm(ba)
#     norm_bc = np.linalg.norm(bc)
#     if norm_ba < 0.01 or norm_bc < 0.01:
#         return 0
#     cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
#     cosine = np.clip(cosine, -1.0, 1.0)
#     angle = np.arccos(cosine)
#     return int(np.degrees(angle))


# def calculate_hip_abduction(hip_left, hip_right, knee):
#     hip_left  = np.array([hip_left[0],  hip_left[1]])
#     hip_right = np.array([hip_right[0], hip_right[1]])
#     knee      = np.array([knee[0],      knee[1]])
#     hip_vector = hip_right - hip_left
#     if np.linalg.norm(hip_left - knee) < np.linalg.norm(hip_right - knee):
#         knee_vector = knee - hip_left
#     else:
#         knee_vector = knee - hip_right
#     dot = np.dot(hip_vector, knee_vector)
#     norm_product = np.linalg.norm(hip_vector) * np.linalg.norm(knee_vector)
#     if norm_product < 0.01:
#         return 0
#     cos_angle = abs(dot) / norm_product
#     cos_angle = np.clip(cos_angle, -1.0, 1.0)
#     return int(np.degrees(np.arccos(cos_angle)))


# def smooth_angle(history, new_val, window=3):
#     history.append(new_val)
#     if len(history) > window:
#         history.pop(0)
#     return np.mean(history)


# def count_reps_adaptive(angle_history, exercise_name, stage, last_rep_frame, frame, min_frames, is_lower_body=True):
#     if len(angle_history) < 10:
#         return stage, False, last_rep_frame

#     recent = angle_history[-20:]
#     max_angle = max(recent)
#     min_angle = min(recent)
#     range_motion = max_angle - min_angle
#     if range_motion < 35:
#         return stage, False, last_rep_frame

#     up_th   = max_angle - (range_motion * 0.15)
#     down_th = min_angle + (range_motion * 0.15)
#     current = np.mean(angle_history[-3:])

#     new_stage = stage
#     rep_counted = False

#     if exercise_name in ["lunge", "leg_lunge", "squats", "bodyweight_squats"]:
#         if current < down_th:
#             new_stage = "down"
#         elif current > up_th and stage == "down":
#             new_stage = "up"
#             if frame - last_rep_frame > min_frames:
#                 rep_counted = True
#                 last_rep_frame = frame
#     else:
#         if current > up_th:
#             new_stage = "up"
#         elif current < down_th and stage == "up":
#             new_stage = "down"
#             if frame - last_rep_frame > min_frames:
#                 rep_counted = True
#                 last_rep_frame = frame

#     return new_stage, rep_counted, last_rep_frame


# def find_exercise(exercise_name):
#     for category, exercises in exercise_rules.items():
#         if exercise_name in exercises:
#             return category, exercises[exercise_name]
#     return None, None


# # -----------------------------------------------------------------------
# # Groq API Feedback
# # -----------------------------------------------------------------------
# def generate_groq_feedback(exercise_name, category, target_min, target_max,
#                            min_achieved, max_achieved, total_reps, groq_api_key):
#     try:
#         client = Groq(api_key=groq_api_key)

#         exercise_type = ""
#         for cat, exercises in exercise_rules.items():
#             if exercise_name in exercises:
#                 exercise_type = exercises[exercise_name].get('type', 'unknown')
#                 break

#         prompt = (
#             f"Evaluate the trainee's performance for the {category} exercise: {exercise_name}. "
#             f"This is a {exercise_type} body exercise. "
#             f"The target safe range is {target_min} to {target_max} degrees. "
#             f"The trainee achieved a range of {min_achieved:.1f} to {max_achieved:.1f} degrees. "
#             f"Total repetitions completed: {total_reps}. "
#             f"Provide a Score out of 100, Angle Analysis, Biomechanical Interpretation, and Coaching Feedback. "
#             f"Be encouraging and constructive."
#         )

#         response = client.chat.completions.create(
#             model="llama3-8b-8192",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=400,
#             temperature=0.7,
#         )
#         return response.choices[0].message.content.strip()

#     except Exception as e:
#         return f"Score: 70/100\n\nCoaching Feedback:\nGood effort on the {exercise_name}! You completed {total_reps} reps with a range of {min_achieved:.1f}° to {max_achieved:.1f}°. Keep practicing to improve your form."


# # -----------------------------------------------------------------------
# # TTS Functions (من الـ notebook الأصلي)
# # -----------------------------------------------------------------------
# async def create_coach_audio_async(text, output_filename):
#     communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
#     await communicate.save(output_filename)


# def create_coach_audio(text, output_filename):
#     try:
#         loop = asyncio.new_event_loop()
#         asyncio.set_event_loop(loop)
#         loop.run_until_complete(create_coach_audio_async(text, output_filename))
#         loop.close()
#         return output_filename
#     except Exception:
#         return None


# def extract_feedback_for_tts(report_text):
#     try:
#         spoken = report_text.split("Coaching Feedback:\n")[1].strip()
#     except:
#         spoken = report_text
#     sentences = spoken.split('. ')
#     spoken_part = '. '.join(sentences[:3])
#     if len(spoken_part) > 300:
#         spoken_part = spoken_part[:300] + '...'
#     return spoken_part


# # -----------------------------------------------------------------------
# # الدالة الرئيسية (مبنية على الـ notebook)
# # -----------------------------------------------------------------------
# def analyze_exercise_video(video_path: str, exercise_name: str, groq_api_key: str, output_dir: str = "/tmp") -> dict:
#     category, ex_info = find_exercise(exercise_name)
#     if category is None:
#         return {"error": f"Exercise '{exercise_name}' not found"}

#     mp_pose = mp.solutions.pose
#     pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

#     cap = cv2.VideoCapture(video_path)
#     fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30

#     reps = 0
#     stage = None
#     last_rep_frame = -fps
#     all_angles = []
#     joint_histories = {j: [] for j in ex_info.get('joints', [])}
#     frame_count = 0
#     is_lower_body = ex_info.get('type') == 'lower'

#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break

#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = pose.process(rgb)

#         if results.pose_landmarks:
#             landmarks = results.pose_landmarks.landmark
#             frame_angles = []
#             left_angle = None
#             right_angle = None

#             if exercise_name == "leg_abduction":
#                 hip_l = [landmarks[23].x, landmarks[23].y]
#                 hip_r = [landmarks[24].x, landmarks[24].y]
#                 knee_l = [landmarks[25].x, landmarks[25].y]
#                 knee_r = [landmarks[26].x, landmarks[26].y]
#                 angle_l = calculate_hip_abduction(hip_l, hip_r, knee_l)
#                 angle_r = calculate_hip_abduction(hip_l, hip_r, knee_r)
#                 main_angle = max(angle_l, angle_r)
#             else:
#                 for joint in ex_info.get('joints', []):
#                     if joint in JOINT_MAP:
#                         p1, p2, p3 = JOINT_MAP[joint]
#                         a = [landmarks[p1].x, landmarks[p1].y]
#                         b = [landmarks[p2].x, landmarks[p2].y]
#                         c = [landmarks[p3].x, landmarks[p3].y]
#                         angle = calculate_angle(a, b, c)

#                         if joint in joint_histories:
#                             angle = smooth_angle(joint_histories[joint], angle)

#                         frame_angles.append(angle)

#                         if joint == "knee_left":
#                             left_angle = angle
#                         elif joint == "knee_right":
#                             right_angle = angle

#                 if exercise_name in ["lunge", "leg_lunge", "squats", "bodyweight_squats"]:
#                     main_angle = min(left_angle, right_angle) if left_angle is not None and right_angle is not None else (np.mean(frame_angles) if frame_angles else 0)
#                 else:
#                     main_angle = np.mean(frame_angles) if frame_angles else 0

#             if main_angle > 0:
#                 all_angles.append(main_angle)
#                 new_stage, rep_detected, last_rep_frame = count_reps_adaptive(
#                     all_angles, exercise_name, stage, last_rep_frame, frame_count, fps // 2, is_lower_body
#                 )
#                 if rep_detected:
#                     reps += 1
#                 stage = new_stage

#         frame_count += 1

#     cap.release()
#     pose.close()

#     # حساب الإحصائيات
#     if all_angles:
#         min_ang = float(min(all_angles))
#         max_ang = float(max(all_angles))
#         avg_ang = float(np.mean(all_angles))
#     else:
#         min_ang = max_ang = avg_ang = 0.0

#     # توليد Feedback باستخدام Groq
#     ai_feedback = ""
#     audio_path = None

#     if reps > 0:
#         ai_feedback = generate_groq_feedback(
#             exercise_name, category,
#             ex_info.get('min_angle', 0), ex_info.get('max_angle', 180),
#             min_ang, max_ang, reps, groq_api_key
#         )

#         spoken_text = extract_feedback_for_tts(ai_feedback)
#         audio_file = os.path.join(output_dir, f"{exercise_name}_feedback.mp3")
#         result = create_coach_audio(spoken_text, audio_file)
#         if result:
#             audio_path = audio_file
#     else:
#         ai_feedback = "No repetitions detected. Please ensure you are visible in the video and performing the correct exercise."

#     return {
#         "exercise_name": exercise_name,
#         "category": category,
#         "description": ex_info.get('description', ''),
#         "total_reps": reps,
#         "min_angle": round(min_ang, 1),
#         "max_angle": round(max_ang, 1),
#         "avg_angle": round(avg_ang, 1),
#         "range_of_motion": round(max_ang - min_ang, 1),
#         "target_min": ex_info.get('min_angle', 0),
#         "target_max": ex_info.get('max_angle', 180),
#         "ai_feedback": ai_feedback,
#         "audio_path": audio_path,
#         "exercise_type": ex_info.get('type', 'unknown'),
#     }


# # -----------------------------------------------------------------------
# # قائمة التمارين المتاحة
# # -----------------------------------------------------------------------
# def get_all_exercises():
#     exercises = []
#     for category, exs in exercise_rules.items():
#         for name, info in exs.items():
#             exercises.append({
#                 "name": name,
#                 "category": category,
#                 "description": info.get('description', ''),
#                 "type": info.get('type', 'unknown'),
#             })
#     return exercises




















# # app/services/exercise_analysis_service.py
# import cv2
# import mediapipe as mp
# import numpy as np
# import math
# import os
# import asyncio
# import edge_tts
# from groq import Groq
# import shutil
# import requests
# import sys
# import os
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from app.core.config import settings
# # from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_audioclips

# # -----------------------------------------------------------------------
# # خريطة المفاصل - من الـ notebook الأصلي
# # -----------------------------------------------------------------------
# JOINT_MAP = {
#     "shoulder_angle_left":    (13, 11, 23),
#     "shoulder_angle_right":   (14, 12, 24),
#     "shoulder_flexion_left":  (13, 11, 12),
#     "shoulder_flexion_right": (14, 12, 11),
#     "elbow_left":             (11, 13, 15),
#     "elbow_right":            (12, 14, 16),
#     "knee_left":              (23, 25, 27),
#     "knee_right":             (24, 26, 28),
#     "hip_left":               (11, 23, 25),
#     "hip_right":              (12, 24, 26),
#     "hip_abduction_left":     (23, 24, 25),
#     "hip_abduction_right":    (24, 23, 26),
# }

# # -----------------------------------------------------------------------
# # قاموس التمارين - من الـ notebook الأصلي
# # -----------------------------------------------------------------------
# exercise_rules = {
#     "shoulder_based": {
#         "arm_abduction":    {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 80,  "down_threshold": 20,  "min_angle": 15,  "max_angle": 95,  "type": "upper", "description": "Lateral arm raise"},
#         "shoulder_flexion": {"joints": ["shoulder_flexion_left", "shoulder_flexion_right"],"up_threshold": 90,  "down_threshold": 10,  "min_angle": 0,   "max_angle": 180, "type": "upper", "description": "Forward arm raise"},
#         "arm_vw":           {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 120, "down_threshold": 60,  "min_angle": 45,  "max_angle": 135, "type": "upper", "description": "V-W exercise"},
#         "arm_circles":      {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 60,  "down_threshold": 120, "min_angle": 30,  "max_angle": 150, "type": "upper", "description": "Arm circles"},
#         "arm_half_circles": {"joints": ["shoulder_angle_left", "shoulder_angle_right"],   "up_threshold": 60,  "down_threshold": 100, "min_angle": 30,  "max_angle": 120, "type": "upper", "description": "Arm half circles"},
#     },
#     "elbow_based": {
#         "pushups":           {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 80,  "min_angle": 70,  "max_angle": 170, "type": "upper", "description": "Push-ups"},
#         "bench_press":       {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 80,  "min_angle": 70,  "max_angle": 160, "type": "upper", "description": "Bench press"},
#         "shoulder_press":    {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 90,  "min_angle": 80,  "max_angle": 170, "type": "upper", "description": "Shoulder press"},
#         "bicep_curl":        {"joints": ["elbow_left", "elbow_right"], "up_threshold": 40,  "down_threshold": 150, "min_angle": 30,  "max_angle": 160, "type": "upper", "description": "Bicep curl"},
#         "triceps_pushdown":  {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 40,  "min_angle": 30,  "max_angle": 170, "type": "upper", "description": "Triceps pushdown"},
#         "lat_pulldown":      {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 60,  "min_angle": 45,  "max_angle": 160, "type": "upper", "description": "Lat pulldown"},
#     },
#     "knee_based": {
#         "bodyweight_squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 120, "down_threshold": 60,  "min_angle": 40, "max_angle": 130, "type": "lower", "description": "Bodyweight squats"},
#         "squats":            {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 80,  "min_angle": 70, "max_angle": 170, "type": "lower", "description": "Squats"},
#         "leg_lunge":         {"joints": ["knee_left", "knee_right"], "up_threshold": 165, "down_threshold": 95,  "min_angle": 85, "max_angle": 175, "type": "lower", "description": "Leg lunge"},
#         "lunge":             {"joints": ["knee_left"],               "up_threshold": 140, "down_threshold": 85,  "min_angle": 70, "max_angle": 175, "type": "lower", "description": "Lunge"},
#         "butt_kicks":        {"joints": ["knee_left", "knee_right"], "up_threshold": 60,  "down_threshold": 150, "min_angle": 45, "max_angle": 160, "type": "lower", "description": "Butt kicks"},
#         "high_knee":         {"joints": ["knee_left", "knee_right"], "up_threshold": 80,  "down_threshold": 160, "min_angle": 70, "max_angle": 170, "type": "lower", "description": "High knee"},
#         "leg_extension":     {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 100, "min_angle": 90, "max_angle": 175, "type": "lower", "description": "Leg extension"},
#     },
#     "hip_based": {
#         "leg_swing":    {"joints": ["hip_left", "hip_right"],               "up_threshold": 80,  "down_threshold": 10, "min_angle": 0,  "max_angle": 90,  "type": "lower", "description": "Leg swing"},
#         "jumping_jacks":{"joints": ["hip_abduction_left", "hip_abduction_right"], "up_threshold": 140, "down_threshold": 30, "min_angle": 20, "max_angle": 150, "type": "lower", "description": "Jumping jacks"},
#         "leg_abduction":{"joints": ["hip_abduction_left", "hip_abduction_right"], "up_threshold": 30,  "down_threshold": 5,  "min_angle": 0,  "max_angle": 45,  "type": "lower", "description": "Leg abduction"},
#     },
# }

# # -----------------------------------------------------------------------
# # الدوال الأساسية من الـ notebook الأصلي
# # -----------------------------------------------------------------------
# def calculate_angle(a, b, c):
#     a = np.array([a[0], a[1]])
#     b = np.array([b[0], b[1]])
#     c = np.array([c[0], c[1]])
#     ba = a - b
#     bc = c - b
#     norm_ba = np.linalg.norm(ba)
#     norm_bc = np.linalg.norm(bc)
#     if norm_ba < 0.01 or norm_bc < 0.01:
#         return 0
#     cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
#     cosine = np.clip(cosine, -1.0, 1.0)
#     angle = np.arccos(cosine)
#     return int(np.degrees(angle))


# def calculate_hip_abduction(hip_left, hip_right, knee):
#     hip_left  = np.array([hip_left[0],  hip_left[1]])
#     hip_right = np.array([hip_right[0], hip_right[1]])
#     knee      = np.array([knee[0],      knee[1]])
#     hip_vector = hip_right - hip_left
#     if np.linalg.norm(hip_left - knee) < np.linalg.norm(hip_right - knee):
#         knee_vector = knee - hip_left
#     else:
#         knee_vector = knee - hip_right
#     dot = np.dot(hip_vector, knee_vector)
#     norm_product = np.linalg.norm(hip_vector) * np.linalg.norm(knee_vector)
#     if norm_product < 0.01:
#         return 0
#     cos_angle = abs(dot) / norm_product
#     cos_angle = np.clip(cos_angle, -1.0, 1.0)
#     return int(np.degrees(np.arccos(cos_angle)))


# def smooth_angle(history, new_val, window=3):
#     history.append(new_val)
#     if len(history) > window:
#         history.pop(0)
#     return np.mean(history)


# def count_reps_adaptive(angle_history, exercise_name, stage, last_rep_frame, frame, min_frames=18, is_lower_body=True):
#     if len(angle_history) < 10:
#         return stage, False, last_rep_frame

#     recent = angle_history[-30:]
#     current = np.mean(angle_history[-6:])   # smoothing أقوى
#     max_angle = max(recent)
#     min_angle = min(recent)

#     # فلترة الحركات الضعيفة
#     if max_angle - min_angle < 35:
#         return stage, False, last_rep_frame

#     rep_counted = False
#     new_stage = stage

#     # ====================== Special Logic for Lunge ======================
#     if exercise_name in ["leg_lunge", "lunge", "reverse_lunge"]:
#         up_th = max_angle - 20
#         down_th = min_angle + 25

#         if current < down_th:
#             new_stage = "down"
#         elif current > up_th and stage == "down":
#             new_stage = "up"
#             if frame - last_rep_frame > min_frames:
#                 rep_counted = True
#                 last_rep_frame = frame

#     # ====================== General Logic ======================
#     elif exercise_name in ["squats", "bodyweight_squats", "leg_extension"]:
#         up_th = max_angle - 22
#         down_th = min_angle + 22

#         if current < down_th:
#             new_stage = "down"
#         elif current > up_th and stage == "down":
#             new_stage = "up"
#             if frame - last_rep_frame > min_frames:
#                 rep_counted = True
#                 last_rep_frame = frame
#     else:
#         # باقي التمارين (Upper body)
#         up_th = max_angle - 18
#         down_th = min_angle + 18

#         if current > up_th:
#             new_stage = "up"
#         elif current < down_th and stage == "up":
#             new_stage = "down"
#             if frame - last_rep_frame > min_frames:
#                 rep_counted = True
#                 last_rep_frame = frame

#     return new_stage, rep_counted, last_rep_frame


# def find_exercise(exercise_name):
#     for category, exercises in exercise_rules.items():
#         if exercise_name in exercises:
#             return category, exercises[exercise_name]
#     return None, None


# def draw_info(image, name, angle, reps, stage, min_a, max_a, angle_type, debug_info=""):
#     h, w = image.shape[:2]
#     overlay = image.copy()
#     cv2.rectangle(overlay, (10, 10), (450, 190), (0, 0, 0), -1)
#     cv2.addWeighted(overlay, 0.6, image, 0.4, 0, image)

#     cv2.rectangle(image, (10, 10), (450, 190), (255, 255, 255), 1)

#     title = name.replace('_', ' ').title()
#     cv2.putText(image, f"{title}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
#     cv2.putText(image, f"REPS: {reps}", (20, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#     cv2.putText(image, f"Angle: {int(angle)}°", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

#     color = (0, 255, 0) if min_a <= angle <= max_a else (0, 0, 255)
#     cv2.putText(image, f"Safe: {min_a}-{max_a}", (20, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

#     if stage:
#         stage_color = (0, 255, 255) if stage == "up" else (255, 165, 0)
#         cv2.putText(image, f"STAGE: {stage.upper()}", (280, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, stage_color, 1)

#     if debug_info:
#         cv2.putText(image, debug_info, (20, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)

#     return image


# def add_angle(image, pos, angle, is_main_joint=False):
#     x, y = int(pos[0]), int(pos[1])
#     if is_main_joint:
#         cv2.rectangle(image, (x-25, y-25), (x+35, y+10), (0, 0, 0), -1)
#         cv2.rectangle(image, (x-25, y-25), (x+35, y+10), (0, 255, 0), 2)
#         cv2.putText(image, f"{int(angle)}°", (x-20, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
#     else:
#         cv2.rectangle(image, (x-20, y-20), (x+30, y+5), (0, 0, 0), -1)
#         cv2.rectangle(image, (x-20, y-20), (x+30, y+5), (0, 255, 255), 1)
#         cv2.putText(image, f"{int(angle)}°", (x-15, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)


# # -----------------------------------------------------------------------
# # Groq API Feedback
# # -----------------------------------------------------------------------
# import os
# import requests
# from dotenv import load_dotenv
# import urllib.parse

# # تحميل الإعدادات من ملف .env
# load_dotenv()

# def get_ai_voice_feedback(exercise_name, min_angle, max_angle, total_reps):
#     # قراءة الرابط من البيئة المحيطة
#     kaggle_url = os.getenv("COLAB_NGROK_URL")
    
#     if not kaggle_url:
#         print("Error: KAGGLE_API_URL not found in .env file")
#         return None

#     payload = {
#         "exercise_name": exercise_name,
#         "min_angle": min_angle,
#         "max_angle": max_angle,
#         "total_reps": total_reps
#     }
    
#     try:
#         # إرسال الطلب لـ Kaggle
#         response = requests.post(kaggle_url, json=payload, timeout=60)
        
#         if response.status_code == 200:

#             encoded_text = response.headers.get("X-Feedback-Text", "Great%20Job")
#             decoded_text = urllib.parse.unquote(encoded_text) 
#             ai_text = decoded_text.encode('ascii', 'ignore').decode('ascii')
#             print(f"Final Clean Text: {ai_text}")
    

#             # مسار حفظ الصوت (تأكدي من وجود الفولدر)
#             audio_path = os.path.join("static", "analyzed", f"{exercise_name}_feedback.mp3")
            
#             with open(audio_path, "wb") as f:
#                 f.write(response.content)
            
#             return audio_path, ai_text
#         else:
#             print(f"Kaggle Error: {response.status_code}")
#             return None
            
#     except Exception as e:
#         print(f"Connection Error to Kaggle: {e}")
#         return None
# # -----------------------------------------------------------------------
# # TTS Functions
# # -----------------------------------------------------------------------
# # async def create_coach_audio_async(text, output_filename):
# #     communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
# #     await communicate.save(output_filename)


# def create_coach_audio(text, output_filename):
#     try:
#         import asyncio
#         import nest_asyncio
#         nest_asyncio.apply()
        
#         async def _run():
#             communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
#             await communicate.save(output_filename)
        
#         asyncio.get_event_loop().run_until_complete(_run())
        
#         if os.path.exists(output_filename):
#             print(f"✅ TTS saved: {output_filename}")
#             return output_filename
#         return None
#     except Exception as e:
#         print(f"❌ TTS Error: {e}")
#         return None

# def extract_feedback_for_tts(report_text):
#     try:
#         spoken = report_text.split("Coaching Feedback:\n")[1].strip()
#     except:
#         spoken = report_text
#     sentences = spoken.split('. ')
#     spoken_part = '. '.join(sentences[:3])
#     if len(spoken_part) > 300:
#         spoken_part = spoken_part[:300] + '...'
#     return spoken_part


# # -----------------------------------------------------------------------
# # الدالة الرئيسية - النسخة المكتملة
# # -----------------------------------------------------------------------
# def analyze_exercise_video(video_path: str, exercise_name: str, groq_api_key: str, output_dir: str = "static/analyzed") -> dict:   #"/tmp"
#     os.makedirs(output_dir, exist_ok=True)

#     category, ex_info = find_exercise(exercise_name)
#     if category is None:
#         return {"error": f"Exercise '{exercise_name}' not found"}

#     # تصليح استيراد MediaPipe
#     mp_pose = mp.solutions.pose
#     pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

#     cap = cv2.VideoCapture(video_path)
#     original_fps = cap.get(cv2.CAP_PROP_FPS)
    
#     if original_fps == 0 or original_fps > 100:
#         fps = 20 
#     else:
#         fps = original_fps

#     width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
#     height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

#     # ملفات الإخراج
#     temp_video_path = os.path.join(output_dir, f"temp_{exercise_name}..avi")
#     final_video_path = os.path.join(output_dir, f"analyzed_{exercise_name}.mp4")
#     audio_path = os.path.join(output_dir, f"{exercise_name}_feedback.mp3")
#     audio_url = None
#     if audio_path and os.path.exists(audio_path):
#         audio_url = "/static/analyzed/" + os.path.basename(audio_path)
#         print(f"✅ Audio URL: {audio_url}")

#     fourcc = cv2.VideoWriter_fourcc(*'XVID')
#     out = cv2.VideoWriter(temp_video_path, fourcc, fps, (width, height))

#     reps = 0
#     stage = None
#     last_rep_frame = -fps
#     all_angles = []
#     joint_histories = {j: [] for j in ex_info.get('joints', [])}
#     frame_count = 0
#     is_lower_body = ex_info.get('type') == 'lower'

#     while cap.isOpened():
#         # ret, frame = cap.read()
#         # if not ret:
#         #     break
#         success, frame = cap.read()
#         if not success:
#             break

#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = pose.process(rgb)

#         if results.pose_landmarks:
#             landmarks = results.pose_landmarks.landmark
#             # === رسم المفاصل والـ skeleton ===
#             mp.solutions.drawing_utils.draw_landmarks(
#                 frame,
#                 results.pose_landmarks,
#                 mp.solutions.pose.POSE_CONNECTIONS,
#                 landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style()
#             )
#             frame_angles = []
#             left_angle = None
#             right_angle = None

#             if exercise_name == "leg_abduction":
#                 hip_l = [landmarks[23].x, landmarks[23].y]
#                 hip_r = [landmarks[24].x, landmarks[24].y]
#                 knee_l = [landmarks[25].x, landmarks[25].y]
#                 knee_r = [landmarks[26].x, landmarks[26].y]
#                 angle_l = calculate_hip_abduction(hip_l, hip_r, knee_l)
#                 angle_r = calculate_hip_abduction(hip_l, hip_r, knee_r)
#                 main_angle = max(angle_l, angle_r)

#             elif exercise_name in ["arm_circles", "arm_half_circles"]:
#                 # حساب زاوية خاصة للدوران
#                 left = calculate_angle(
#                     [landmarks[11].x, landmarks[11].y],
#                     [landmarks[13].x, landmarks[13].y],
#                     [landmarks[15].x, landmarks[15].y]
#                 )
#                 right = calculate_angle(
#                     [landmarks[12].x, landmarks[12].y],
#                     [landmarks[14].x, landmarks[14].y],
#                     [landmarks[16].x, landmarks[16].y]
#                 )
#                 main_angle = (left + right) / 2

#             else:
#                 frame_angles = []
#                 for joint in ex_info.get('joints', []):
#                     if joint in JOINT_MAP:
#                         p1, p2, p3 = JOINT_MAP[joint]
#                         a = [landmarks[p1].x, landmarks[p1].y]
#                         b = [landmarks[p2].x, landmarks[p2].y]
#                         c = [landmarks[p3].x, landmarks[p3].y]
#                         angle = calculate_angle(a, b, c)

#                         if joint in joint_histories:
#                             angle = smooth_angle(joint_histories[joint], angle)

#                         frame_angles.append(angle)
                        
#                         main_angle = np.mean(frame_angles) if frame_angles else 0

#                         if joint == "knee_left":
#                             left_angle = angle
#                         elif joint == "knee_right":
#                             right_angle = angle

#                 if exercise_name in ["lunge", "leg_lunge", "squats", "bodyweight_squats"]:
#                     main_angle = min(left_angle, right_angle) if left_angle is not None and right_angle is not None else (np.mean(frame_angles) if frame_angles else 0)
#                 else:
#                     main_angle = np.mean(frame_angles) if frame_angles else 0

#             if main_angle > 0:
#                 all_angles.append(main_angle)
#                 new_stage, rep_detected, last_rep_frame = count_reps_adaptive(
#                     all_angles, exercise_name, stage, last_rep_frame, frame_count, fps // 2, is_lower_body
#                 )
#                 if rep_detected:
#                     reps += 1
#                 stage = new_stage
#             # === رسم المعلومات على الفيديو ===
#             frame = draw_info(frame, exercise_name, main_angle, reps, stage, 
#                                ex_info.get('min_angle', 0), ex_info.get('max_angle', 180), "")

#         out.write(frame)
#         frame_count += 1

#     cap.release()
#     out.release()
#     pose.close()

#     # if all_angles:
#     #     min_ang = float(min(all_angles))
#     #     max_ang = float(max(all_angles))
#     #     avg_ang = float(np.mean(all_angles))
#     # else:
#     #     min_ang = max_ang = avg_ang = 0.0

#     # ai_feedback = ""
#     # audio_path = None

#     # if reps > 0:
#     #     ai_feedback = generate_groq_feedback(
#     #         exercise_name, category,
#     #         ex_info.get('min_angle', 0), ex_info.get('max_angle', 180),
#     #         min_ang, max_ang, reps, groq_api_key
#     #     )

#     #     spoken_text = extract_feedback_for_tts(ai_feedback)
#     #     audio_file = os.path.join(output_dir, f"{exercise_name}_feedback.mp3")
#     #     result = create_coach_audio(spoken_text, audio_file)
#     #     if result:
#     #         audio_path = audio_file
#     # else:
#     #     ai_feedback = "No repetitions detected. Please ensure you are visible in the video and performing the correct exercise."

#     # #final_output_url = f"/static/analyzed/analyzed_{exercise_name}.mp4" # الرابط اللي هيروح للفرونت
#     # final_video_path = os.path.join(output_dir, f"analyzed_{exercise_name}.mp4")
    
#     # try:
#     #     from moviepy.editor import VideoFileClip, AudioFileClip
#     #     video_clip = VideoFileClip(temp_video_path)
#     #     if audio_path and os.path.exists(audio_path):
#     #         audio_clip = AudioFileClip(audio_path)
#     #         final_clip = video_clip.set_audio(audio_clip)
#     #         final_clip.write_videofile(final_video_path, codec="libx264", audio_codec="aac", fps=fps)
#     #         final_clip.close()
#     #         audio_clip.close()
#     #     else:
#     #         video_clip.write_videofile(final_video_path, codec="libx264", fps=fps)
#     #     video_clip.close()
#     # except Exception as e:
#     #     print(f"MoviePy failed: {e}")
#     #     # fallback باستخدام ffmpeg
#     #     try:
#     #         if audio_path and os.path.exists(audio_path):
#     #             os.system(f'ffmpeg -i "{temp_video_path}" -i "{audio_path}" -c:v copy -c:a aac "{final_video_path}" -y')
#     #         else:
#     #             os.system(f'ffmpeg -i "{temp_video_path}" -c:v libx264 "{final_video_path}" -y')
#     #     except:
#     #         shutil.copy(temp_video_path, final_video_path)

#     # # حذف الملف المؤقت
#     # if os.path.exists(temp_video_path):
#     #     os.remove(temp_video_path)

#     # return {
#     #     "exercise_name": exercise_name,
#     #     "category": category,
#     #     "description": ex_info.get('description', ''),
#     #     "total_reps": reps,
#     #     "min_angle": round(min_ang, 1),
#     #     "max_angle": round(max_ang, 1),
#     #     "avg_angle": round(avg_ang, 1),
#     #     "range_of_motion": round(max_ang - min_ang, 1),
#     #     "target_min": ex_info.get('min_angle', 0),
#     #     "target_max": ex_info.get('max_angle', 180),
#     #     "ai_feedback": ai_feedback,
#     #     "video_url": f"/static/analyzed/analyzed_{exercise_name}.mp4",
#     #     "audio_url": f"/static/analyzed/{exercise_name}_feedback.mp3" if audio_path and os.path.exists(audio_path) else None,
#     #     "exercise_type": ex_info.get('type', 'unknown'),
#     # }
#     if all_angles:
#         min_ang = float(min(all_angles))
#         max_ang = float(max(all_angles))
#         avg_ang = float(np.mean(all_angles))
#     else:
#         min_ang = max_ang = avg_ang = 0.0

#     ai_feedback = ""
#     audio_path = None

#     if reps > 0:
#         print(f"✅ Reps detected: {reps}, generating feedback from Kaggle...")
        
#         # 1. بنادي الدالة اللي بتكلم Kaggle وترجع مسار ملف الصوت
#         audio_path, ai_text = get_ai_voice_feedback(
#             exercise_name=exercise_name,
#             total_reps=reps,
#             min_angle=min_ang,
#             max_angle=max_ang
#         )

#         if audio_path:
#             ai_feedback = ai_text # نص مؤقت
#             print(f"✅ Feedback and Audio received from Kaggle: {audio_path}")
#         else:
#             ai_feedback = "Exercise completed, but could not connect to AI for voice feedback."
#             audio_path = None
#     else:
#         ai_feedback = "No repetitions detected."
#         audio_path = None

#     # ====================== حفظ الفيديو النهائي مع الصوت ======================
#     final_filename = f"analyzed_{exercise_name}.mp4"
#     final_video_path_project = os.path.join("static", "analyzed", final_filename)
#     final_video_path_project = os.path.abspath(final_video_path_project)
    
#     # التأكد من وجود المجلد
#     os.makedirs(os.path.dirname(final_video_path_project), exist_ok=True)

#     try:
#         fixed_temp_video = temp_video_path.replace(".mp4", "_fixed.mp4")
#         # ده بيصلح الـ moov atom اللي كانت مسببة الخطأ
#         repair_cmd = f'ffmpeg -i "{temp_video_path}" -c copy "{fixed_temp_video}" -y'
#         print(f"🛠️ Repairing video container: {repair_cmd}")
#         os.system(repair_cmd)
        
#         if os.path.exists(fixed_temp_video):
#             temp_video_path = fixed_temp_video
#             print("✅ Video container repaired successfully.")
#     except Exception as e:
#         print(f"⚠️ Repair failed: {e}")



#     # 2. عملية الدمج (يجب أن تتم بينما الملفات لا تزال في الـ Temp)
#     try:
#         if audio_path and os.path.exists(audio_path):
#             # ندمج ونحفظ النتيجة مباشرة في مسار المشروع النهائي
#             ffmpeg_cmd = f'ffmpeg -i "{temp_video_path}" -i "{audio_path}" -c:v libx264 -preset ultrafast -crf 28 -c:a aac "{final_video_path_project}" -y'
#             print(f"🚀 Running ffmpeg: {ffmpeg_cmd}")
            
#             return_code = os.system(ffmpeg_cmd)
            
#             if return_code == 0:
#                 print(f"✅ Video + Audio merged and saved to: {final_video_path_project}")
#             else:
#                 raise Exception("FFMPEG failed to execute")
#         else:
#             # لو مفيش صوت، انسخ الملف المؤقت للمشروع مباشرة
#             shutil.copy(temp_video_path, final_video_path_project)
#             print(f"✅ Video saved without audio to: {final_video_path_project}")
            
#     except Exception as e:
#         print(f"⚠️ Error during processing: {e}")
#         # محاولة أخيرة: نسخ الفيديو حتى لو بدون صوت في حالة فشل الدمج
#         try:
#             shutil.copy(temp_video_path, final_video_path_project)
#         except:
#             print("❌ Critical: Could not save even the temp video")

#     # 3. حذف الملفات المؤقتة من الـ Temp بعد الانتهاء
#     try:
#         if os.path.exists(temp_video_path): os.remove(temp_video_path)
#         if "_fixed" in temp_video_path and os.path.exists(temp_video_path):
#             os.remove(temp_video_path)
#         # لو حابة تحذفي ملف الصوت المؤقت كمان:
#         # if audio_path and os.path.exists(audio_path): os.remove(audio_path)
#     except:
#         pass

#     # 4. الـ Return (إرسال روابط الويب النظيفة للفرونت إند)
#     return {
#         "exercise_name": exercise_name,
#         "total_reps": reps,
#         "min_angle": round(min_ang, 1),
#         "max_angle": round(max_ang, 1),
#         "range_of_motion": round(max_ang - min_ang, 1),
#         "ai_feedback": ai_text,
#         # نرسل الروابط باستخدام /static ليفهمها المتصفح
#         "video_url": f"/static/analyzed/{final_filename}".replace("\\", "/"),
#         "audio_url": f"/static/analyzed/{exercise_name}_feedback.mp3".replace("\\", "/") if audio_path else None,
#     }


# # -----------------------------------------------------------------------
# # قائمة التمارين
# # -----------------------------------------------------------------------
# def get_all_exercises():
#     exercises = []
#     for category, exs in exercise_rules.items():
#         for name, info in exs.items():
#             exercises.append({
#                 "name": name,
#                 "category": category,
#                 "description": info.get('description', ''),
#                 "type": info.get('type', 'unknown'),
#             })
#     return exercises


# app/services/exercise_analysis_service.py
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
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
# from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_audioclips

# -----------------------------------------------------------------------
# خريطة المفاصل - من الـ notebook الأصلي
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
# قاموس التمارين - من الـ notebook الأصلي
# -----------------------------------------------------------------------
exercise_rules = {
    "shoulder_based": {
        "arm_abduction":    {"joints": ["shoulder_angle_left", "shoulder_angle_right"],    "up_threshold": 80,  "down_threshold": 20,  "min_angle": 15,  "max_angle": 95,  "type": "upper", "description": "Lateral arm raise",
                             "stability_checks": {"elbow_left": (120, 180), "elbow_right": (120, 180), "hip_left": (140, 180), "hip_right": (140, 180)}},
        "shoulder_flexion": {"joints": ["shoulder_flexion_left", "shoulder_flexion_right"], "up_threshold": 90,  "down_threshold": 10,  "min_angle": 0,   "max_angle": 180, "type": "upper", "description": "Forward arm raise",
                             "stability_checks": {"elbow_left": (120, 180), "elbow_right": (120, 180), "hip_left": (140, 180), "hip_right": (140, 180)}},
        "arm_vw":           {"joints": ["shoulder_angle_left", "shoulder_angle_right"],    "up_threshold": 120, "down_threshold": 60,  "min_angle": 45,  "max_angle": 135, "type": "upper", "description": "V-W exercise",
                             "stability_checks": {"hip_left": (140, 180), "hip_right": (140, 180)}},
        "arm_circles":      {"joints": ["shoulder_angle_left", "shoulder_angle_right"],    "up_threshold": 40,  "down_threshold": 130, "min_angle": 30,  "max_angle": 150, "type": "upper", "description": "Arm circles",
                             "stability_checks": {"hip_left": (140, 180), "hip_right": (140, 180)}},
        "arm_half_circles": {"joints": ["shoulder_angle_left", "shoulder_angle_right"],    "up_threshold": 60,  "down_threshold": 100, "min_angle": 30,  "max_angle": 120, "type": "upper", "description": "Arm half circles",
                             "stability_checks": {"hip_left": (140, 180), "hip_right": (140, 180)}},
    },
    "elbow_based": {
        "pushups":           {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 80,  "min_angle": 70,  "max_angle": 170, "type": "upper", "description": "Push-ups",
                              "stability_checks": {"shoulder_angle_left": (20, 100), "shoulder_angle_right": (20, 100), "hip_left": (140, 180), "hip_right": (140, 180)}},
        "bench_press":       {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 80,  "min_angle": 70,  "max_angle": 160, "type": "upper", "description": "Bench press",
                              "stability_checks": {"shoulder_angle_left": (20, 100), "shoulder_angle_right": (20, 100)}},
        "shoulder_press":    {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 90,  "min_angle": 80,  "max_angle": 170, "type": "upper", "description": "Shoulder press",
                              "stability_checks": {"shoulder_angle_left": (50, 130), "shoulder_angle_right": (50, 130), "hip_left": (140, 180), "hip_right": (140, 180)}},
        "bicep_curl":        {"joints": ["elbow_left", "elbow_right"], "up_threshold": 40,  "down_threshold": 150, "min_angle": 30,  "max_angle": 160, "type": "upper", "description": "Bicep curl",
                              "stability_checks": {"shoulder_angle_left": (5, 70), "shoulder_angle_right": (5, 70), "hip_left": (140, 180), "hip_right": (140, 180)}},
        "triceps_pushdown":  {"joints": ["elbow_left", "elbow_right"], "up_threshold": 160, "down_threshold": 40,  "min_angle": 30,  "max_angle": 170, "type": "upper", "description": "Triceps pushdown",
                              "stability_checks": {"shoulder_angle_left": (5, 70), "shoulder_angle_right": (5, 70), "hip_left": (140, 180), "hip_right": (140, 180)}},
        "lat_pulldown":      {"joints": ["elbow_left", "elbow_right"], "up_threshold": 150, "down_threshold": 60,  "min_angle": 45,  "max_angle": 160, "type": "upper", "description": "Lat pulldown",
                              "stability_checks": {"shoulder_angle_left": (70, 160), "shoulder_angle_right": (70, 160), "hip_left": (140, 180), "hip_right": (140, 180)}},
    },
    "knee_based": {
        "bodyweight_squats": {"joints": ["knee_left", "knee_right"], "up_threshold": 120, "down_threshold": 60,  "min_angle": 40, "max_angle": 130, "type": "lower", "description": "Bodyweight squats",
                              "stability_checks": {"shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80)}},
        "squats":            {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 80,  "min_angle": 70, "max_angle": 170, "type": "lower", "description": "Squats",
                              "stability_checks": {"shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80)}},
        "leg_lunge":         {"joints": ["knee_left", "knee_right"], "up_threshold": 165, "down_threshold": 95,  "min_angle": 85, "max_angle": 175, "type": "lower", "description": "Leg lunge",
                              "stability_checks": {"shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80), "elbow_left": (120, 180), "elbow_right": (120, 180)}},
        "lunge":             {"joints": ["knee_left", "knee_right"], "up_threshold": 140, "down_threshold": 85,  "min_angle": 70, "max_angle": 175, "type": "lower", "description": "Lunge"},
        "butt_kicks":        {"joints": ["knee_left", "knee_right"], "up_threshold": 60,  "down_threshold": 150, "min_angle": 45, "max_angle": 160, "type": "lower", "description": "Butt kicks",
                              "stability_checks": {"hip_left": (130, 180), "hip_right": (130, 180)}},
        "high_knee":         {"joints": ["knee_left", "knee_right"], "up_threshold": 80,  "down_threshold": 160, "min_angle": 70, "max_angle": 170, "type": "lower", "description": "High knee",
                              "stability_checks": {"shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80)}},
        "leg_extension":     {"joints": ["knee_left", "knee_right"], "up_threshold": 160, "down_threshold": 100, "min_angle": 90, "max_angle": 175, "type": "lower", "description": "Leg extension",
                              "stability_checks": {"hip_left": (70, 120), "hip_right": (70, 120), "shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80)}},
    },
    "hip_based": {
        "leg_swing":    {"joints": ["hip_left", "hip_right"],                              "up_threshold": 80,  "down_threshold": 10, "min_angle": 0,  "max_angle": 90,  "type": "lower", "description": "Leg swing",
                         "stability_checks": {"knee_left": (130, 180), "knee_right": (130, 180), "shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80)}},
        "jumping_jacks":{"joints": ["hip_abduction_left", "hip_abduction_right"],         "up_threshold": 140, "down_threshold": 30, "min_angle": 20, "max_angle": 150, "type": "lower", "description": "Jumping jacks",
                         "stability_checks": {"elbow_left": (120, 180), "elbow_right": (120, 180), "knee_left": (130, 180), "knee_right": (130, 180)}},
        "leg_abduction":{"joints": ["hip_abduction_left", "hip_abduction_right"],         "up_threshold": 30,  "down_threshold": 5,  "min_angle": 0,  "max_angle": 45,  "type": "lower", "description": "Leg abduction",
                         "stability_checks": {"knee_left": (130, 180), "knee_right": (130, 180), "shoulder_angle_left": (5, 80), "shoulder_angle_right": (5, 80)}},
    },
}

# -----------------------------------------------------------------------
# الدوال الأساسية من الـ notebook الأصلي
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
    cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine = np.clip(cosine, -1.0, 1.0)
    angle = np.arccos(cosine)
    return int(np.degrees(angle))


def calculate_hip_abduction(hip_left, hip_right, knee):
    hip_left  = np.array([hip_left[0],  hip_left[1]])
    hip_right = np.array([hip_right[0], hip_right[1]])
    knee      = np.array([knee[0],      knee[1]])
    hip_vector = hip_right - hip_left
    if np.linalg.norm(hip_left - knee) < np.linalg.norm(hip_right - knee):
        knee_vector = knee - hip_left
    else:
        knee_vector = knee - hip_right
    dot = np.dot(hip_vector, knee_vector)
    norm_product = np.linalg.norm(hip_vector) * np.linalg.norm(knee_vector)
    if norm_product < 0.01:
        return 0
    cos_angle = abs(dot) / norm_product
    cos_angle = np.clip(cos_angle, -1.0, 1.0)
    return int(np.degrees(np.arccos(cos_angle)))


def smooth_angle(history, new_val, window=3):
    history.append(new_val)
    if len(history) > window:
        history.pop(0)
    return np.mean(history)


def count_reps_adaptive(angle_history, exercise_name, stage, last_rep_frame, frame, min_frames=18, is_lower_body=True):
    if len(angle_history) < 10:
        return stage, False, last_rep_frame

    recent = angle_history[-30:]
    current = np.mean(angle_history[-6:])   # smoothing أقوى
    max_angle = max(recent)
    min_angle = min(recent)

    # فلترة الحركات الضعيفة
    if max_angle - min_angle < 35:
        return stage, False, last_rep_frame

    rep_counted = False
    new_stage = stage

    # ====================== Special Logic for Lunge ======================
    if exercise_name in ["leg_lunge", "lunge", "reverse_lunge"]:
        up_th = max_angle - 20
        down_th = min_angle + 25

        if current < down_th:
            new_stage = "down"
        elif current > up_th and stage == "down":
            new_stage = "up"
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame

    # ====================== General Logic ======================
    elif exercise_name in ["squats", "bodyweight_squats", "leg_extension"]:
        up_th = max_angle - 22
        down_th = min_angle + 22

        if current < down_th:
            new_stage = "down"
        elif current > up_th and stage == "down":
            new_stage = "up"
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
    else:
        # باقي التمارين (Upper body)
        up_th = max_angle - 18
        down_th = min_angle + 18

        if current > up_th:
            new_stage = "up"
        elif current < down_th and stage == "up":
            new_stage = "down"
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame

    return new_stage, rep_counted, last_rep_frame


def find_exercise(exercise_name):
    for category, exercises in exercise_rules.items():
        if exercise_name in exercises:
            return category, exercises[exercise_name]
    return None, None


def check_stability(landmarks, stability_checks):
    """
    بتتحقق إن الزوايا الثانوية (اللي المفروض تكون ثابتة) جوّه الرينج المسموح بيه.
    لو أي زاوية برّا الرينج → الفريم ده مش بيتحسب.
    """
    for joint_name, (min_val, max_val) in stability_checks.items():
        if joint_name not in JOINT_MAP:
            continue
        p1, p2, p3 = JOINT_MAP[joint_name]
        a = [landmarks[p1].x, landmarks[p1].y]
        b = [landmarks[p2].x, landmarks[p2].y]
        c = [landmarks[p3].x, landmarks[p3].y]
        angle = calculate_angle(a, b, c)
        if not (min_val <= angle <= max_val):
            return False
    return True


def draw_info(image, name, angle, reps, stage, min_a, max_a, angle_type, debug_info=""):
    h, w = image.shape[:2]
    overlay = image.copy()
    cv2.rectangle(overlay, (10, 10), (450, 190), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, image, 0.4, 0, image)

    cv2.rectangle(image, (10, 10), (450, 190), (255, 255, 255), 1)

    title = name.replace('_', ' ').title()
    cv2.putText(image, f"{title}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    cv2.putText(image, f"REPS: {reps}", (20, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    cv2.putText(image, f"Angle: {int(angle)}°", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

    color = (0, 255, 0) if min_a <= angle <= max_a else (0, 0, 255)
    cv2.putText(image, f"Safe: {min_a}-{max_a}", (20, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

    if stage:
        stage_color = (0, 255, 255) if stage == "up" else (255, 165, 0)
        cv2.putText(image, f"STAGE: {stage.upper()}", (280, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, stage_color, 1)

    if debug_info:
        cv2.putText(image, debug_info, (20, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)

    return image


def add_angle(image, pos, angle, is_main_joint=False):
    x, y = int(pos[0]), int(pos[1])
    if is_main_joint:
        cv2.rectangle(image, (x-25, y-25), (x+35, y+10), (0, 0, 0), -1)
        cv2.rectangle(image, (x-25, y-25), (x+35, y+10), (0, 255, 0), 2)
        cv2.putText(image, f"{int(angle)}°", (x-20, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    else:
        cv2.rectangle(image, (x-20, y-20), (x+30, y+5), (0, 0, 0), -1)
        cv2.rectangle(image, (x-20, y-20), (x+30, y+5), (0, 255, 255), 1)
        cv2.putText(image, f"{int(angle)}°", (x-15, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)


# -----------------------------------------------------------------------
# Groq API Feedback
# -----------------------------------------------------------------------
import os
import requests
from dotenv import load_dotenv
import urllib.parse

# تحميل الإعدادات من ملف .env
load_dotenv()

def get_ai_voice_feedback(exercise_name, min_angle, max_angle, total_reps):
    # قراءة الرابط من البيئة المحيطة
    kaggle_url = os.getenv("COLAB_NGROK_URL")
    
    if not kaggle_url:
        print("Error: KAGGLE_API_URL not found in .env file")
        return None

    payload = {
        "exercise_name": exercise_name,
        "min_angle": min_angle,
        "max_angle": max_angle,
        "total_reps": total_reps
    }
    
    try:
        # إرسال الطلب لـ Kaggle
        response = requests.post(kaggle_url, json=payload, timeout=60)
        
        if response.status_code == 200:

            encoded_text = response.headers.get("X-Feedback-Text", "Great%20Job")
            decoded_text = urllib.parse.unquote(encoded_text) 
            ai_text = decoded_text.encode('ascii', 'ignore').decode('ascii')
            print(f"Final Clean Text: {ai_text}")
    

            # مسار حفظ الصوت (تأكدي من وجود الفولدر)
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
# -----------------------------------------------------------------------
# TTS Functions
# -----------------------------------------------------------------------
# async def create_coach_audio_async(text, output_filename):
#     communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
#     await communicate.save(output_filename)


def create_coach_audio(text, output_filename):
    try:
        import asyncio
        import nest_asyncio
        nest_asyncio.apply()
        
        async def _run():
            communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
            await communicate.save(output_filename)
        
        asyncio.get_event_loop().run_until_complete(_run())
        
        if os.path.exists(output_filename):
            print(f"✅ TTS saved: {output_filename}")
            return output_filename
        return None
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        return None

def extract_feedback_for_tts(report_text):
    try:
        spoken = report_text.split("Coaching Feedback:\n")[1].strip()
    except:
        spoken = report_text
    sentences = spoken.split('. ')
    spoken_part = '. '.join(sentences[:3])
    if len(spoken_part) > 300:
        spoken_part = spoken_part[:300] + '...'
    return spoken_part


# -----------------------------------------------------------------------
# الدالة الرئيسية - النسخة المكتملة
# -----------------------------------------------------------------------
def count_reps_fixed(current_angle, exercise_name, ex_info, stage, last_rep_frame, frame, min_frames=20):
    """
    Uses the fixed up_threshold and down_threshold from exercise_rules.
    A rep is only counted when the user crosses both thresholds in sequence.
    """
    up_th = ex_info.get("up_threshold", 90)
    down_th = ex_info.get("down_threshold", 150)

    rep_counted = False
    new_stage = stage

    if exercise_name in ["squats", "bodyweight_squats", "leg_extension", "leg_lunge", "lunge"]:
        if current_angle < down_th:
            new_stage = "down"
        elif current_angle > up_th and stage == "down":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "up"

    elif exercise_name in ["high_knee", "butt_kicks"]:
        if current_angle < up_th:
            new_stage = "up"
        elif current_angle > down_th and stage == "up":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "down"

    elif exercise_name in ["leg_swing", "leg_abduction", "jumping_jacks", "arm_abduction", "shoulder_flexion", "arm_vw"]:
        if current_angle > up_th:
            new_stage = "up"
        elif current_angle < down_th and stage == "up":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "down"

    elif exercise_name in ["arm_circles", "arm_half_circles"]:
        if current_angle < up_th:
            new_stage = "up"
        elif current_angle > down_th and stage == "up":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "down"

    elif exercise_name in ["bicep_curl", "lat_pulldown"]:
        if current_angle < up_th:
            new_stage = "up"
        elif current_angle > down_th and stage == "up":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "down"

    elif exercise_name in ["pushups", "bench_press", "shoulder_press", "triceps_pushdown"]:
        if current_angle < down_th:
            new_stage = "down"
        elif current_angle > up_th and stage == "down":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "up"

    else:
        if current_angle < up_th:
            new_stage = "up"
        elif current_angle > down_th and stage == "up":
            if frame - last_rep_frame > min_frames:
                rep_counted = True
                last_rep_frame = frame
            new_stage = "down"

    return new_stage, rep_counted, last_rep_frame


def analyze_exercise_video(video_path: str, exercise_name: str, groq_api_key: str, output_dir: str = "static/analyzed") -> dict:   #"/tmp"
    os.makedirs(output_dir, exist_ok=True)

    category, ex_info = find_exercise(exercise_name)
    if category is None:
        return {"error": f"Exercise '{exercise_name}' not found"}

    # تصليح استيراد MediaPipe
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    cap = cv2.VideoCapture(video_path)
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    
    if original_fps == 0 or original_fps > 100:
        fps = 20 
    else:
        fps = original_fps

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # ملفات الإخراج
    temp_video_path = os.path.join(output_dir, f"temp_{exercise_name}..avi")
    final_video_path = os.path.join(output_dir, f"analyzed_{exercise_name}.mp4")
    audio_path = os.path.join(output_dir, f"{exercise_name}_feedback.mp3")
    audio_url = None
    if audio_path and os.path.exists(audio_path):
        audio_url = "/static/analyzed/" + os.path.basename(audio_path)
        print(f"✅ Audio URL: {audio_url}")

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(temp_video_path, fourcc, fps, (width, height))

    reps = 0
    stage = None
    last_rep_frame = -fps
    all_angles = []
    joint_histories = {j: [] for j in ex_info.get('joints', [])}
    frame_count = 0
    is_lower_body = ex_info.get('type') == 'lower'

    while cap.isOpened():
        # ret, frame = cap.read()
        # if not ret:
        #     break
        success, frame = cap.read()
        if not success:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            # === رسم المفاصل والـ skeleton ===
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp.solutions.pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style()
            )
            frame_angles = []
            left_angle = None
            right_angle = None

            if exercise_name == "leg_abduction":
                hip_l = [landmarks[23].x, landmarks[23].y]
                hip_r = [landmarks[24].x, landmarks[24].y]
                knee_l = [landmarks[25].x, landmarks[25].y]
                knee_r = [landmarks[26].x, landmarks[26].y]
                angle_l = calculate_hip_abduction(hip_l, hip_r, knee_l)
                angle_r = calculate_hip_abduction(hip_l, hip_r, knee_r)
                main_angle = max(angle_l, angle_r)

            elif exercise_name in ["arm_circles", "arm_half_circles"]:
                # حساب زاوية خاصة للدوران
                left = calculate_angle(
                    [landmarks[11].x, landmarks[11].y],
                    [landmarks[13].x, landmarks[13].y],
                    [landmarks[15].x, landmarks[15].y]
                )
                right = calculate_angle(
                    [landmarks[12].x, landmarks[12].y],
                    [landmarks[14].x, landmarks[14].y],
                    [landmarks[16].x, landmarks[16].y]
                )
                main_angle = (left + right) / 2

            else:
                frame_angles = []
                for joint in ex_info.get('joints', []):
                    if joint in JOINT_MAP:
                        p1, p2, p3 = JOINT_MAP[joint]
                        a = [landmarks[p1].x, landmarks[p1].y]
                        b = [landmarks[p2].x, landmarks[p2].y]
                        c = [landmarks[p3].x, landmarks[p3].y]
                        angle = calculate_angle(a, b, c)

                        if joint in joint_histories:
                            angle = smooth_angle(joint_histories[joint], angle)

                        frame_angles.append(angle)
                        
                        main_angle = np.mean(frame_angles) if frame_angles else 0

                        if joint == "knee_left":
                            left_angle = angle
                        elif joint == "knee_right":
                            right_angle = angle

                if exercise_name in ["squats", "bodyweight_squats", "leg_lunge"]:
                    # الاتنين بينزلوا مع بعض - ناخد الأقل
                    main_angle = min(left_angle, right_angle) if left_angle is not None and right_angle is not None else (np.mean(frame_angles) if frame_angles else 0)
                elif exercise_name == "lunge":
                    # واحدة بس بتنزل - ناخد الأقل (الركبة النازلة)
                    # بس لازم الركبة التانية تكون ممدودة (> 140) عشان يكون لنج حقيقي
                    if left_angle is not None and right_angle is not None:
                        bent = min(left_angle, right_angle)
                        straight = max(left_angle, right_angle)
                        if straight >= 140 and bent <= 150:
                            main_angle = bent
                        else:
                            main_angle = 0
                    else:
                        main_angle = np.mean(frame_angles) if frame_angles else 0
                else:
                    main_angle = np.mean(frame_angles) if frame_angles else 0

            ex_min = ex_info.get('min_angle', 0)
            ex_max = ex_info.get('max_angle', 180)
            stability_checks = ex_info.get('stability_checks', {})
            is_stable = check_stability(landmarks, stability_checks) if stability_checks else True
            key_landmarks_visible = all(
                landmarks[i].visibility > 0.4
                for i in [11, 12, 13, 14, 23, 24]
                if i < len(landmarks)
            )

            if main_angle > 0 and ex_min <= main_angle <= ex_max and is_stable and key_landmarks_visible:
                all_angles.append(main_angle)
                new_stage, rep_detected, last_rep_frame = count_reps_fixed(
                    main_angle, exercise_name, ex_info, stage, last_rep_frame, frame_count, max(fps, 15)
                )
                if rep_detected:
                    reps += 1
                stage = new_stage
            # === رسم المعلومات على الفيديو ===
            frame = draw_info(frame, exercise_name, main_angle, reps, stage, 
                               ex_info.get('min_angle', 0), ex_info.get('max_angle', 180), "")

        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()
    pose.close()

    # if all_angles:
    #     min_ang = float(min(all_angles))
    #     max_ang = float(max(all_angles))
    #     avg_ang = float(np.mean(all_angles))
    # else:
    #     min_ang = max_ang = avg_ang = 0.0

    # ai_feedback = ""
    # audio_path = None

    # if reps > 0:
    #     ai_feedback = generate_groq_feedback(
    #         exercise_name, category,
    #         ex_info.get('min_angle', 0), ex_info.get('max_angle', 180),
    #         min_ang, max_ang, reps, groq_api_key
    #     )

    #     spoken_text = extract_feedback_for_tts(ai_feedback)
    #     audio_file = os.path.join(output_dir, f"{exercise_name}_feedback.mp3")
    #     result = create_coach_audio(spoken_text, audio_file)
    #     if result:
    #         audio_path = audio_file
    # else:
    #     ai_feedback = "No repetitions detected. Please ensure you are visible in the video and performing the correct exercise."

    # #final_output_url = f"/static/analyzed/analyzed_{exercise_name}.mp4" # الرابط اللي هيروح للفرونت
    # final_video_path = os.path.join(output_dir, f"analyzed_{exercise_name}.mp4")
    
    # try:
    #     from moviepy.editor import VideoFileClip, AudioFileClip
    #     video_clip = VideoFileClip(temp_video_path)
    #     if audio_path and os.path.exists(audio_path):
    #         audio_clip = AudioFileClip(audio_path)
    #         final_clip = video_clip.set_audio(audio_clip)
    #         final_clip.write_videofile(final_video_path, codec="libx264", audio_codec="aac", fps=fps)
    #         final_clip.close()
    #         audio_clip.close()
    #     else:
    #         video_clip.write_videofile(final_video_path, codec="libx264", fps=fps)
    #     video_clip.close()
    # except Exception as e:
    #     print(f"MoviePy failed: {e}")
    #     # fallback باستخدام ffmpeg
    #     try:
    #         if audio_path and os.path.exists(audio_path):
    #             os.system(f'ffmpeg -i "{temp_video_path}" -i "{audio_path}" -c:v copy -c:a aac "{final_video_path}" -y')
    #         else:
    #             os.system(f'ffmpeg -i "{temp_video_path}" -c:v libx264 "{final_video_path}" -y')
    #     except:
    #         shutil.copy(temp_video_path, final_video_path)

    # # حذف الملف المؤقت
    # if os.path.exists(temp_video_path):
    #     os.remove(temp_video_path)

    # return {
    #     "exercise_name": exercise_name,
    #     "category": category,
    #     "description": ex_info.get('description', ''),
    #     "total_reps": reps,
    #     "min_angle": round(min_ang, 1),
    #     "max_angle": round(max_ang, 1),
    #     "avg_angle": round(avg_ang, 1),
    #     "range_of_motion": round(max_ang - min_ang, 1),
    #     "target_min": ex_info.get('min_angle', 0),
    #     "target_max": ex_info.get('max_angle', 180),
    #     "ai_feedback": ai_feedback,
    #     "video_url": f"/static/analyzed/analyzed_{exercise_name}.mp4",
    #     "audio_url": f"/static/analyzed/{exercise_name}_feedback.mp3" if audio_path and os.path.exists(audio_path) else None,
    #     "exercise_type": ex_info.get('type', 'unknown'),
    # }
    if all_angles:
        min_ang = float(min(all_angles))
        max_ang = float(max(all_angles))
        avg_ang = float(np.mean(all_angles))
    else:
        min_ang = max_ang = avg_ang = 0.0

    ai_feedback = ""
    ai_text = ""
    audio_path = None

    if reps > 0:
        print(f"✅ Reps detected: {reps}, generating feedback from Kaggle...")

        result = get_ai_voice_feedback(
            exercise_name=exercise_name,
            total_reps=reps,
            min_angle=min_ang,
            max_angle=max_ang
        )

        if result:
            audio_path, ai_text = result
        else:
            audio_path = None
            ai_text = ""

        if audio_path:
            ai_feedback = ai_text
            print(f"✅ Feedback and Audio received from Kaggle: {audio_path}")
        else:
            ai_feedback = "Exercise completed, but could not connect to AI for voice feedback."
            audio_path = None
    else:
        ai_feedback = "No repetitions detected."
        audio_path = None

    # ====================== حفظ الفيديو النهائي مع الصوت ======================
    final_filename = f"analyzed_{exercise_name}.mp4"
    final_video_path_project = os.path.join("static", "analyzed", final_filename)
    final_video_path_project = os.path.abspath(final_video_path_project)
    
    # التأكد من وجود المجلد
    os.makedirs(os.path.dirname(final_video_path_project), exist_ok=True)

    try:
        fixed_temp_video = temp_video_path.replace(".mp4", "_fixed.mp4")
        # ده بيصلح الـ moov atom اللي كانت مسببة الخطأ
        repair_cmd = f'ffmpeg -i "{temp_video_path}" -c copy "{fixed_temp_video}" -y'
        print(f"🛠️ Repairing video container: {repair_cmd}")
        os.system(repair_cmd)
        
        if os.path.exists(fixed_temp_video):
            temp_video_path = fixed_temp_video
            print("✅ Video container repaired successfully.")
    except Exception as e:
        print(f"⚠️ Repair failed: {e}")



    # 2. عملية الدمج (يجب أن تتم بينما الملفات لا تزال في الـ Temp)
    try:
        if audio_path and os.path.exists(audio_path):
            # ندمج ونحفظ النتيجة مباشرة في مسار المشروع النهائي
            ffmpeg_cmd = f'ffmpeg -i "{temp_video_path}" -i "{audio_path}" -c:v libx264 -preset ultrafast -crf 28 -c:a aac "{final_video_path_project}" -y'
            print(f"🚀 Running ffmpeg: {ffmpeg_cmd}")
            
            return_code = os.system(ffmpeg_cmd)
            
            if return_code == 0:
                print(f"✅ Video + Audio merged and saved to: {final_video_path_project}")
            else:
                raise Exception("FFMPEG failed to execute")
        else:
            # لو مفيش صوت، انسخ الملف المؤقت للمشروع مباشرة
            shutil.copy(temp_video_path, final_video_path_project)
            print(f"✅ Video saved without audio to: {final_video_path_project}")
            
    except Exception as e:
        print(f"⚠️ Error during processing: {e}")
        # محاولة أخيرة: نسخ الفيديو حتى لو بدون صوت في حالة فشل الدمج
        try:
            shutil.copy(temp_video_path, final_video_path_project)
        except:
            print("❌ Critical: Could not save even the temp video")

    # 3. حذف الملفات المؤقتة من الـ Temp بعد الانتهاء
    try:
        if os.path.exists(temp_video_path): os.remove(temp_video_path)
        if "_fixed" in temp_video_path and os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        # لو حابة تحذفي ملف الصوت المؤقت كمان:
        # if audio_path and os.path.exists(audio_path): os.remove(audio_path)
    except:
        pass

    # 4. الـ Return (إرسال روابط الويب النظيفة للفرونت إند)
    return {
        "exercise_name": exercise_name,
        "total_reps": reps,
        "min_angle": round(min_ang, 1),
        "max_angle": round(max_ang, 1),
        "range_of_motion": round(max_ang - min_ang, 1),
        "ai_feedback": ai_text,
        # نرسل الروابط باستخدام /static ليفهمها المتصفح
        "video_url": f"/static/analyzed/{final_filename}".replace("\\", "/"),
        "audio_url": f"/static/analyzed/{exercise_name}_feedback.mp3".replace("\\", "/") if audio_path else None,
    }


# -----------------------------------------------------------------------
# قائمة التمارين
# -----------------------------------------------------------------------
def get_all_exercises():
    exercises = []
    for category, exs in exercise_rules.items():
        for name, info in exs.items():
            exercises.append({
                "name": name,
                "category": category,
                "description": info.get('description', ''),
                "type": info.get('type', 'unknown'),
            })
    return exercises
