// src/components/LiveCamera.jsx
import { useEffect, useRef, useState, useCallback } from "react";

// ── Math helpers ──────────────────────────────────────────────
function calcAngle([ax, ay], [bx, by], [cx, cy]) {
  const radians = Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}
function calcHipAbduction([hx, hy], [opp_hx, opp_hy], [kx, ky]) {
  // Approximate abduction angle using the hip line and knee position
  return Math.abs(calcAngle([opp_hx, opp_hy], [hx, hy], [kx, ky]) - 90);
}

const pt = (lm, index) => [lm[index].x, lm[index].y];
const avg = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const angleAt = (lm, a, b, c) => calcAngle(pt(lm, a), pt(lm, b), pt(lm, c));
const both = (left, right) => (lm) => avg([left(lm), right(lm)]);
const minBoth = (left, right) => (lm) => Math.min(left(lm), right(lm));

const elbowAverage = both(
  (lm) => angleAt(lm, 11, 13, 15),
  (lm) => angleAt(lm, 12, 14, 16)
);
const shoulderAngleAverage = both(
  (lm) => angleAt(lm, 13, 11, 23),
  (lm) => angleAt(lm, 14, 12, 24)
);
const kneeMinimum = minBoth(
  (lm) => angleAt(lm, 23, 25, 27),
  (lm) => angleAt(lm, 24, 26, 28)
);
const hipMinimum = minBoth(
  (lm) => angleAt(lm, 11, 23, 25),
  (lm) => angleAt(lm, 12, 24, 26)
);
const hipAbductionLeft = (lm) => calcHipAbduction(pt(lm, 23), pt(lm, 24), pt(lm, 25));
const hipAbductionRight = (lm) => calcHipAbduction(pt(lm, 24), pt(lm, 23), pt(lm, 26));
const hipAbductionAverage = both(hipAbductionLeft, hipAbductionRight);
const hipAbductionMaximum = (lm) => Math.max(hipAbductionLeft(lm), hipAbductionRight(lm));

// ── Exercise configs ──────────────────────────────────────────
const EXERCISES = {
  bicep_curl: {
    label: "Bicep Curl",
    upAngle: 40,
    downAngle: 150,
    badZone: { low: 55, high: 85 },
    checkType: "up_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  pushups: {
    label: "Push-ups",
    upAngle: 160,
    downAngle: 80,
    badZone: { low: 110, high: 130 },
    checkType: "down_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  bench_press: {
    label: "Bench Press",
    upAngle: 150,
    downAngle: 80,
    badZone: { low: 110, high: 130 },
    checkType: "down_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  shoulder_press: {
    label: "Shoulder Press",
    upAngle: 160,
    downAngle: 90,
    badZone: { low: 110, high: 130 },
    checkType: "down_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  triceps_pushdown: {
    label: "Triceps Pushdown",
    upAngle: 160,
    downAngle: 40,
    badZone: { low: 55, high: 90 },
    checkType: "down_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  lat_pulldown: {
    label: "Lat Pulldown",
    upAngle: 150,
    downAngle: 60,
    badZone: { low: 80, high: 110 },
    checkType: "down_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  arm_abduction: {
    label: "Arm Abduction",
    upAngle: 80,
    downAngle: 20,
    badZone: { low: 50, high: 79 },
    checkType: "up_side",
    requiredPoints: [13, 11, 23, 14, 12, 24],
    getAngle: shoulderAngleAverage,
  },
  shoulder_flexion: {
    label: "Shoulder Flexion",
    upAngle: 90,
    downAngle: 10,
    badZone: { low: 60, high: 89 },
    checkType: "up_side",
    requiredPoints: [13, 11, 12, 14],
    getAngle: both(
      (lm) => angleAt(lm, 13, 11, 12),
      (lm) => angleAt(lm, 14, 12, 11)
    ),
  },
  arm_vw: {
    label: "Arm VW",
    upAngle: 120,
    downAngle: 60,
    badZone: { low: 90, high: 119 },
    checkType: "up_side",
    requiredPoints: [13, 11, 23, 14, 12, 24],
    getAngle: shoulderAngleAverage,
  },
  arm_circles: {
    label: "Arm Circles",
    upAngle: 60,
    downAngle: 120,
    badZone: { low: 40, high: 55 },
    checkType: "up_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  arm_half_circles: {
    label: "Arm Half Circles",
    upAngle: 60,
    downAngle: 120,
    badZone: { low: 40, high: 55 },
    checkType: "up_side",
    requiredPoints: [11, 13, 15, 12, 14, 16],
    getAngle: elbowAverage,
  },
  squats: {
    label: "Squats",
    upAngle: 160,
    downAngle: 80,
    badZone: { low: 105, high: 130 },
    checkType: "down_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  bodyweight_squats: {
    label: "Bodyweight Squats",
    upAngle: 120,
    downAngle: 60,
    badZone: { low: 80, high: 100 },
    checkType: "down_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  leg_lunge: {
    label: "Leg Lunge",
    upAngle: 165,
    downAngle: 95,
    badZone: { low: 115, high: 140 },
    checkType: "down_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  lunge: {
    label: "Lunge",
    upAngle: 140,
    downAngle: 85,
    badZone: { low: 105, high: 120 },
    checkType: "down_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  leg_extension: {
    label: "Leg Extension",
    upAngle: 160,
    downAngle: 100,
    badZone: { low: 130, high: 155 },
    checkType: "up_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  high_knee: {
    label: "High Knee",
    upAngle: 80,
    downAngle: 160,
    badZone: { low: 80, high: 115 },
    checkType: "up_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  butt_kicks: {
    label: "Butt Kicks",
    upAngle: 65,
    downAngle: 140,
    badZone: { low: 65, high: 95 },
    checkType: "up_side",
    requiredPoints: [23, 25, 27, 24, 26, 28],
    getAngle: kneeMinimum,
  },
  leg_swing: {
    label: "Leg Swing",
    upAngle: 55,
    downAngle: 130,
    badZone: { low: 55, high: 80 },
    checkType: "up_side",
    requiredPoints: [11, 23, 25, 12, 24, 26],
    getAngle: hipMinimum,
  },
  leg_abduction: {
    label: "Leg Abduction",
    upAngle: 30,
    downAngle: 5,
    badZone: { low: 15, high: 25 },
    checkType: "up_side",
    requiredPoints: [23, 24, 25, 26],
    getAngle: hipAbductionMaximum,
  },
  jumping_jacks: {
    label: "Jumping Jacks",
    upAngle: 28,
    downAngle: 8,
    badZone: { low: 15, high: 27 },
    checkType: "up_side",
    requiredPoints: [23, 24, 25, 26],
    getAngle: hipAbductionAverage,
  },
};

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
  [25, 27], [26, 28],
];

const MOVENET_KEYPOINTS = [
  "nose", "left_eye", "right_eye", "left_ear", "right_ear",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle",
];

const MOVENET_TO_MEDIAPIPE = {
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
};

function mapMoveNetToMediaPipe(keypoints, width, height) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 }));

  keypoints.forEach((kp, index) => {
    const name = kp.name || kp.part || MOVENET_KEYPOINTS[index];
    const mediaPipeIndex = MOVENET_TO_MEDIAPIPE[name];
    if (mediaPipeIndex === undefined) return;

    landmarks[mediaPipeIndex] = {
      x: kp.x / width,
      y: kp.y / height,
      visibility: kp.score ?? 0,
    };
  });

  return landmarks;
}

function hasVisiblePoints(landmarks, indexes, minScore = 0.2) {
  return indexes.every(index => (landmarks[index]?.visibility || 0) >= minScore);
}

export default function LiveCamera({ selectedExercise = "bicep_curl", token }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const animRef     = useRef(null);
  const detectorRef = useRef(null);
  const streamRef   = useRef(null);
  const pausedRef   = useRef(false);
  const stateRef    = useRef({
    stage: "waiting", goodReps: 0, badReps: 0,
    currentRepForm: "Good", angles: [], lastRepTime: null,
  });

  const [active,          setActive]          = useState(false);
  const [paused,          setPaused]          = useState(false);
  const [countdown,       setCountdown]       = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [display,         setDisplay]         = useState({ goodReps: 0, badReps: 0, stage: "waiting", angle: 0, warning: "" });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback,        setFeedback]        = useState(null);

  const ex = EXERCISES[selectedExercise] || EXERCISES.bicep_curl;

  // ── Detection loop ────────────────────────────────────────────
  const detectLoop = useCallback(async () => {
    if (pausedRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas || !detector || video.readyState < 2) {
      animRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const ctx = canvas.getContext("2d");
    const W = canvas.width  = video.videoWidth  || 640;
    const H = canvas.height = video.videoHeight || 480;

    // رسم الفيديو مع mirror
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();

    try {
      const poses = await detector.estimatePoses(video);
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;

        // تحويل الـ keypoints لـ format بيستخدمه الكود
        const lm = mapMoveNetToMediaPipe(keypoints, W, H);

        // رسم الـ skeleton
        ctx.strokeStyle = "rgba(249,115,22,0.85)";
        ctx.lineWidth = 2.5;
        CONNECTIONS.forEach(([a, b]) => {
          if ((lm[a]?.visibility || 0) < 0.3 || (lm[b]?.visibility || 0) < 0.3) return;
          ctx.beginPath();
          ctx.moveTo((1 - lm[a].x) * W, lm[a].y * H);
          ctx.lineTo((1 - lm[b].x) * W, lm[b].y * H);
          ctx.stroke();
        });

        lm.forEach(p => {
          if ((p.visibility || 0) < 0.3) return;
          ctx.beginPath();
          ctx.arc((1 - p.x) * W, p.y * H, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#f97316";
          ctx.fill();
        });

        // حساب الـ reps
        const s = stateRef.current;
        const currentEx = EXERCISES[selectedExercise] || EXERCISES.bicep_curl;

        try {
          const requiredPoints = currentEx.requiredPoints || [11, 13, 15, 12, 14, 16];

          if (!hasVisiblePoints(lm, requiredPoints)) {
            setDisplay(prev => ({ ...prev, warning: "Keep your full body visible" }));
            throw new Error("Required exercise joints are not visible");
          }

          const avgAngle = currentEx.getAngle(lm);

          s.angles.push(avgAngle);
          if (s.angles.length > 8) s.angles.shift();
          const smoothed = s.angles.reduce((a, b) => a + b, 0) / s.angles.length;

          const now = Date.now();
          const MIN_REP_GAP_MS = 1000;
          const upTh = currentEx.upAngle;
          const downTh = currentEx.downAngle;
          const badZone = currentEx.badZone;
          const checkType = currentEx.checkType;

          let warning = "";

          if (checkType === "down_side") {
            if (smoothed < downTh) {
              s.stage = "down";
            } else if (badZone && smoothed >= badZone.low && smoothed <= badZone.high && s.stage !== "down") {
              s.stage = "bad_down";
            } else if (smoothed > upTh) {
              if (!s.lastRepTime || now - s.lastRepTime > MIN_REP_GAP_MS) {
                if (s.stage === "down") {
                  s.goodReps++;
                  s.currentRepForm = "Good";
                } else if (s.stage === "bad_down") {
                  s.badReps++;
                  warning = "BAD FORM: Go Deeper!";
                  s.currentRepForm = "Bad";
                }
                s.lastRepTime = now;
              }
              s.stage = "up";
            }
          } else if (checkType === "up_side") {
            const isTargetLowAngle = upTh < downTh;
            if (isTargetLowAngle) {
              if (smoothed < upTh) {
                s.stage = "up";
              } else if (badZone && smoothed >= badZone.low && smoothed <= badZone.high && s.stage !== "up") {
                s.stage = "bad_up";
              } else if (smoothed > downTh) {
                if (!s.lastRepTime || now - s.lastRepTime > MIN_REP_GAP_MS) {
                  if (s.stage === "up") {
                    s.goodReps++;
                    s.currentRepForm = "Good";
                  } else if (s.stage === "bad_up") {
                    s.badReps++;
                    warning = "BAD FORM: Full Range!";
                    s.currentRepForm = "Bad";
                  }
                  s.lastRepTime = now;
                }
                s.stage = "down";
              }
            } else {
              if (smoothed > upTh) {
                s.stage = "up";
              } else if (badZone && smoothed >= badZone.low && smoothed <= badZone.high && s.stage !== "up") {
                s.stage = "bad_up";
              } else if (smoothed < downTh) {
                if (!s.lastRepTime || now - s.lastRepTime > MIN_REP_GAP_MS) {
                  if (s.stage === "up") {
                    s.goodReps++;
                    s.currentRepForm = "Good";
                  } else if (s.stage === "bad_up") {
                    s.badReps++;
                    warning = "BAD FORM: Full Range!";
                    s.currentRepForm = "Bad";
                  }
                  s.lastRepTime = now;
                }
                s.stage = "down";
              }
            }
          }

          // رسم الـ HUD
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(0, 0, 215, 115);
          [
            [`Total: ${s.goodReps + s.badReps}`, "#ffffff"],
            [`Good: ${s.goodReps}`, "#4ade80"],
            [`Bad:  ${s.badReps}`, "#f87171"],
            [`Stage: ${s.stage}`, "#ffffff"],
            [`Angle: ${Math.round(smoothed)}`, "#60a5fa"],
          ].forEach(([t, c], i) => {
            ctx.fillStyle = c;
            ctx.font = "bold 14px monospace";
            ctx.fillText(t, 10, 24 + i * 22);
          });

          setDisplay({ goodReps: s.goodReps, badReps: s.badReps, stage: s.stage, angle: Math.round(smoothed), warning });
        } catch (e) {
          // لو مش قادر يحسب الزاوية (keypoints مش واضحين)
        }
      }
    } catch (e) {
      // تجاهل errors أثناء الـ detection
    }

    animRef.current = requestAnimationFrame(detectLoop);
  }, [selectedExercise]);

  // ── Start ─────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    pausedRef.current = false;
    setError(""); setLoading(true); setFeedback(null); setPaused(false);
    try {
      // ✅ نستخدم @tensorflow-models/pose-detection بدل MediaPipe القديم
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core");
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter");
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl");
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection");

      // انتظر حتى يتحمل كل حاجة
      await new Promise(r => setTimeout(r, 1000));

      // ✅ initialize الـ WebGL backend
      await window.tf.setBackend("webgl");
      await window.tf.ready();

      if (typeof window.tf.loadGraphModel !== "function") {
        throw new Error("TensorFlow graph model loader did not initialize. Refresh the page and try again.");
      }

      // ✅ إنشاء الـ detector باستخدام MoveNet (أسرع وأستقر)
      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        {
          modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );
      detectorRef.current = detector;

      // تشغيل الكاميرا
      stateRef.current = { stage: "waiting", goodReps: 0, badReps: 0, currentRepForm: "Good", angles: [], lastRepTime: null };
      setDisplay({ goodReps: 0, badReps: 0, stage: "waiting", angle: 0, warning: "" });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }, audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setLoading(false);

      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        if (count === 0) {
          clearInterval(interval);
          setCountdown(null);
          setActive(true);
          animRef.current = requestAnimationFrame(detectLoop);
        } else {
          setCountdown(count);
        }
      }, 1000);

    } catch (err) {
      console.error("Start error:", err);
      setError("Cannot start camera: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  }, [detectLoop]);

  const resetSession = useCallback(() => {
    stateRef.current = { stage: "waiting", goodReps: 0, badReps: 0, currentRepForm: "Good", angles: [], lastRepTime: null };
    setDisplay({ goodReps: 0, badReps: 0, stage: "waiting", angle: 0, warning: "" });
    setFeedback(null);
    setError("");
  }, []);

  const pauseCamera = useCallback(() => {
    pausedRef.current = true;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setPaused(true);
  }, []);

  const resumeCamera = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    if (!animRef.current) animRef.current = requestAnimationFrame(detectLoop);
  }, [detectLoop]);

  // ── Stop + Get Feedback ───────────────────────────────────────
  const stopCamera = useCallback(async ({ skipFeedback = false } = {}) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    pausedRef.current = false;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    detectorRef.current?.dispose?.();
    detectorRef.current = null;

    setActive(false); setPaused(false); setCountdown(null);

    const s = stateRef.current;
    const totalReps = s.goodReps + s.badReps;
    if (skipFeedback) return;

    const angles = s.angles;
    const minAngle = angles.length ? Math.min(...angles) : 0;
    const maxAngle = angles.length ? Math.max(...angles) : 0;

    setFeedbackLoading(true);
    try {
      const response = await fetch("http://localhost:8000/exercise/live-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exercise_name:   selectedExercise,
          total_reps:      totalReps,
          good_reps:       s.goodReps,
          bad_reps:        s.badReps,
          min_angle:       Math.round(minAngle),
          max_angle:       Math.round(maxAngle),
          range_of_motion: Math.round(maxAngle - minAngle),
        }),
      });
      if (!response.ok) throw new Error("Live feedback request failed");
      const data = await response.json();
      setFeedback(data);

      if (data.audio_url) {
        const audioUrl = data.audio_url.startsWith("http")
          ? data.audio_url
          : `http://localhost:8000${data.audio_url}`;
        new Audio(audioUrl).play();
      }
    } catch (err) {
      setError("Could not get feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  }, [selectedExercise, token]);

  useEffect(() => {
    resetSession();
  }, [selectedExercise, resetSession]);

  useEffect(() => () => { stopCamera({ skipFeedback: true }); }, [stopCamera]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <video ref={videoRef} muted playsInline style={{ display: "none" }} />

      {/* Canvas */}
      <div style={{ position: "relative", background: "#0a0a0a", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3" }}>
        <canvas ref={canvasRef}
          style={{ width: "100%", height: "100%", display: active ? "block" : "none" }} />

        {!active && countdown === null && !loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", color: "#475569" }}>
            <div style={{ fontSize: 56 }}>🎥</div>
            <div style={{ fontSize: ".9rem", fontWeight: 600, marginTop: 8 }}>Press Start to begin live analysis</div>
            <div style={{ fontSize: ".75rem", color: "#64748b", marginTop: 4 }}>{ex.label}</div>
          </div>
        )}

        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1e3a5f",
                          borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ color: "white", fontSize: ".8rem" }}>Loading AI Model...</div>
          </div>
        )}

        {countdown !== null && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: ".85rem", color: "#94a3b8", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>GET READY</div>
            <div style={{ fontSize: 110, fontWeight: 900, color: "#f97316", lineHeight: 1 }}>{countdown}</div>
          </div>
        )}

        {active && (
          <>
            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center",
                          gap: 6, background: "rgba(0,0,0,.6)", borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "blink 1s infinite" }} />
              <span style={{ color: "white", fontSize: ".72rem", fontWeight: 700 }}>LIVE</span>
            </div>
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(37,99,235,.85)",
                          color: "white", borderRadius: 8, padding: "3px 10px", fontSize: ".7rem", fontWeight: 700 }}>
              {ex.label.toUpperCase()}
            </div>
            {display.warning && (
              <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                            background: "rgba(239,68,68,.9)", color: "white", borderRadius: 8,
                            padding: "6px 16px", fontSize: ".82rem", fontWeight: 700 }}>
                {display.warning}
              </div>
            )}
            {paused && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", gap: 8 }}>
                <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}>Session Paused</div>
                <div style={{ color: "rgba(255,255,255,.75)", fontSize: ".8rem" }}>
                  Good: {display.goodReps} | Bad: {display.badReps}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      {(active || feedback) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))", gap: ".75rem" }}>
          {[
            { label: "Total Reps", value: display.goodReps + display.badReps, color: "#1e293b" },
            { label: "Good Reps", value: display.goodReps, color: "#16a34a" },
            { label: "Bad Reps",  value: display.badReps,  color: "#dc2626" },
            { label: "Angle",     value: `${display.angle}`, color: "#2563eb" },
            { label: "Stage",     value: display.stage,    color: "#f97316" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", border: "1px solid #e2eaf2", borderRadius: 10, padding: ".75rem", textAlign: "center" }}>
              <div style={{ fontSize: ".62rem", color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
        {!active && countdown === null ? (
          <button onClick={startCamera} disabled={loading} style={btn("#2563eb", loading)}>
            {loading ? "Loading AI..." : "Start Live Analysis"}
          </button>
        ) : active ? (
          <>
            {!paused ? (
              <button onClick={pauseCamera} style={btn("#f97316")}>Pause</button>
            ) : (
              <button onClick={resumeCamera} style={btn("#10b981")}>Resume</button>
            )}
            <button onClick={() => stopCamera()} style={btn("#ef4444")}>Stop & Get Feedback</button>
            <button onClick={resetSession} style={btn("#64748b")}>Reset</button>
          </>
        ) : null}
      </div>

      {feedbackLoading && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
                      padding: "1rem", textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Getting AI feedback...
        </div>
      )}

      {feedback && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem" }}>
          <h4 style={{ margin: "0 0 1rem", color: "#1e293b" }}>Session Results</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: ".75rem", marginBottom: "1rem" }}>
            {[
              { label: "Total Reps", value: feedback.total_reps, color: "#2563eb" },
              { label: "Good Reps", value: feedback.good_reps ?? display.goodReps, color: "#10b981" },
              { label: "Bad Reps", value: feedback.bad_reps ?? display.badReps, color: "#ef4444" },
              { label: "Min Angle", value: `${feedback.min_angle}°`, color: "#f97316" },
              { label: "Max Angle", value: `${feedback.max_angle}°`, color: "#8b5cf6" },
              { label: "Range", value: `${feedback.range_of_motion}°`, color: "#06b6d4" },
            ].map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 8, padding: ".75rem", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: ".65rem", color: "#94a3b8", fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "white", borderRadius: 8, padding: "1rem", border: "1px solid #e2e8f0",
                        whiteSpace: "pre-wrap", fontSize: ".85rem", lineHeight: 1.6, color: "#334155" }}>
            {feedback.ai_feedback}
          </div>
          {feedback.audio_url && (
            <div style={{ marginTop: "1rem" }}>
              <audio controls
                src={feedback.audio_url.startsWith("http") ? feedback.audio_url : `http://localhost:8000${feedback.audio_url}`}
                style={{ width: "100%" }} />
            </div>
          )}
          <button onClick={resetSession}
            style={{ marginTop: "1rem", width: "100%", padding: ".65rem", borderRadius: 8,
                     background: "#2563eb", color: "white", border: "none", fontWeight: 700,
                     fontSize: ".82rem", cursor: "pointer", fontFamily: "inherit" }}>
            Start New Session
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                      padding: ".75rem", color: "#dc2626", fontSize: ".8rem" }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load: " + src));
    document.head.appendChild(s);
  });
}

const btn = (bg, disabled = false) => ({
  background: disabled ? "#d1d5db" : bg, color: "white", border: "none",
  borderRadius: 8, padding: ".6rem 1.2rem", fontWeight: 700, fontSize: ".82rem",
  cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", flex: 1,
});
