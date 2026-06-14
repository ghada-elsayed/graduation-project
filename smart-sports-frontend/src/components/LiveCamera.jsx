// src/components/LiveCamera.jsx
import { useEffect, useRef, useState, useCallback } from "react";

// ── Math helpers ──────────────────────────────────────────────
function calcAngle([ax, ay], [bx, by], [cx, cy]) {
  const radians = Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}
function getTorsoLean([sx, sy], [hx, hy]) {
  return Math.abs(Math.atan2(sx - hx, hy - sy) * 180 / Math.PI);
}

// ── Exercise configs ──────────────────────────────────────────
const EXERCISES = {
  bicep_curl: {
    label: "Bicep Curl",
    upAngle: 40, downAngle: 150, type: "curl",
    minGoodAngle: 20, maxGoodAngle: 50,
    formCheck: (lm) => {
      const leftDrift = calcAngle([lm[23].x, lm[23].y], [lm[11].x, lm[11].y], [lm[13].x, lm[13].y]);
      const rightDrift = calcAngle([lm[24].x, lm[24].y], [lm[12].x, lm[12].y], [lm[14].x, lm[14].y]);
      return (leftDrift + rightDrift) / 2 > 30 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
    ) / 2,
  },

  shoulder_press: {
    label: "Shoulder Press",
    upAngle: 160, downAngle: 70, type: "press_up",
    minGoodAngle: 155, maxGoodAngle: 180,
    formCheck: (lm) => getTorsoLean([lm[11].x, lm[11].y], [lm[23].x, lm[23].y]) > 15 ? "bad" : "ok",
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
    ) / 2,
  },

  squats: {
    label: "Squats",
    upAngle: 120, downAngle: 60, type: "squat",
    minGoodAngle: 50, maxGoodAngle: 75,
    formCheck: (lm, smoothed) => {
      const avgHip = (
        calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y])
      ) / 2;
      return smoothed < 80 && avgHip > 110 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  pushups: {
    label: "Push-ups",
    upAngle: 160, downAngle: 80, type: "press_up",
    minGoodAngle: 155, maxGoodAngle: 180,
    formCheck: (lm) => {
      const avgHip = (
        calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y])
      ) / 2;
      return avgHip < 150 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
    ) / 2,
  },

  // leg_lunge: {
  //   label: "Leg Lunge",
  //   upAngle: 155, downAngle: 95, type: "squat",
  //   minGoodAngle: 85, maxGoodAngle: 100,
  //   formCheck: (lm, smoothed) => {
  //     const minKnee = Math.min(
  //       calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]),
  //       calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
  //     );
  //     return smoothed < 100 && minKnee > 150 ? "bad" : "ok";
  //   },
  leg_lunge: {
  label: "Leg Lunge",

  upAngle: 150,
  downAngle: 120,

  type: "squat",

  minGoodAngle: 90,
  maxGoodAngle: 140,

  formCheck: (lm, smoothed) => {
    const minKnee = Math.min(
      calcAngle(
        [lm[23].x, lm[23].y],
        [lm[25].x, lm[25].y],
        [lm[27].x, lm[27].y]
      ),
      calcAngle(
        [lm[24].x, lm[24].y],
        [lm[26].x, lm[26].y],
        [lm[28].x, lm[28].y]
      )
    );

    // فقط لو الركبة ما نزلتش كفاية
    if (minKnee > 170) {
      return "bad";
    }

    return "ok";
  },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  lunge: {
    label: "Lunge",
    upAngle: 140, downAngle: 85, type: "squat",
    minGoodAngle: 75, maxGoodAngle: 95,
    formCheck: (lm, smoothed) => {
      const minKnee = Math.min(
        calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]),
        calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
      );
      return smoothed < 100 && minKnee > 110 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  leg_extension: {
    label: "Leg Extension",
    upAngle: 160, downAngle: 100, type: "squat",
    minGoodAngle: 150, maxGoodAngle: 180,
    formCheck: (lm) => {
      const avgHip = (
        calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y])
      ) / 2;
      return avgHip < 80 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  bodyweight_squats: {
    label: "Bodyweight Squats",
    upAngle: 120, downAngle: 60, type: "squat",
    minGoodAngle: 50, maxGoodAngle: 75,
    formCheck: (lm, smoothed) => {
      const avgHip = (
        calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y])
      ) / 2;
      return smoothed < 80 && avgHip > 110 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  high_knee: {
    label: "High Knee",
    upAngle: 120, downAngle: 170, type: "kick",
    minGoodAngle: 55, maxGoodAngle: 80,
    formCheck: (lm, smoothed) => {
      const minHip = Math.min(
        calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]),
        calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y])
      );
      return smoothed < 10 && minHip > 120 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  butt_kicks: {
    label: "Butt Kicks",
    upAngle: 50, downAngle: 160, type: "kick",
    minGoodAngle: 45, maxGoodAngle: 90,
    formCheck: (lm) => {
      // التأكد من ثبات الفخذ (عدم رفع الركبة للأمام كالجري العادي)
      const avgHip = (
        calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y])
      ) / 2;
      if (avgHip < 145) return "bad"; // لو الحوض انثنى للأمام بوضوح
      return "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
    ) / 2,
  },

  arm_abduction: {
    label: "Arm Abduction",
    upAngle: 80, downAngle: 20, type: "raise",
    minGoodAngle: 75, maxGoodAngle: 100,
    formCheck: (lm) => {
      const avgElbow = (
        calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
      ) / 2;
      return avgElbow < 140 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y])
    ) / 2,
  },

  shoulder_flexion: {
    label: "Shoulder Flexion",
    upAngle: 90, downAngle: 10, type: "raise",
    minGoodAngle: 85, maxGoodAngle: 100,
    formCheck: (lm) => {
      const avgElbow = (
        calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
      ) / 2;
      return avgElbow < 150 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[23].x, lm[23].y], [lm[11].x, lm[11].y], [lm[13].x, lm[13].y]) +
      calcAngle([lm[24].x, lm[24].y], [lm[12].x, lm[12].y], [lm[14].x, lm[14].y])
    ) / 2,
  },

  // jumping_jacks: {
  //   label: "Jumping Jacks",
  //   upAngle: 140, downAngle: 165, type: "squat",
  //   minGoodAngle: 125, maxGoodAngle: 150,
  //   formCheck: (lm, smoothed) => {
  //     // الـ formCheck هنا يتأكد أن الذراع يفتح بالتزامن مع حركة الرجلين
  //     const armAngle = (
  //       calcAngle([lm[13].x, lm[13].y], [lm[11].x, lm[11].y], [lm[23].x, lm[23].y]) +
  //       calcAngle([lm[14].x, lm[14].y], [lm[12].x, lm[12].y], [lm[24].x, lm[24].y])
  //     ) / 2;
  //     if (smoothed < 155 && armAngle < 80) return "bad";
  //     return "ok";
  //   },
  //   getAngle: (lm) => {
  //     // قياس الحوض الداخلي (Hip Abduction) للحكم بناءً على فتحة وقرص القدمين فقط
  //     const leftHip = calcAngle([lm[24].x, lm[24].y], [lm[23].x, lm[23].y], [lm[25].x, lm[25].y]);
  //     const rightHip = calcAngle([lm[23].x, lm[23].y], [lm[24].x, lm[24].y], [lm[26].x, lm[26].y]);
  //     return (leftHip + rightHip) / 2;
  //   },
  // },

//   jumping_jacks: {
//   label: "Jumping Jacks",
//   type: "jump",

//   upThreshold: 0.28,
//   downThreshold: 0.06,

//   formCheck: (lm) => {
//     const left = lm[27];
//     const right = lm[28];

//     const spread = Math.abs(left.x - right.x);

//     // فلتر بسيط يمنع الوقفة العشوائية
//     if (spread < 0.03) return "bad";

//     return "ok";
//   },

//   getAngle: (lm) => {
//     const left = lm[27];
//     const right = lm[28];

//     // ده المؤشر الحقيقي للـ jumping jacks
//     return Math.abs(left.x - right.x);
//   },
// },
jumping_jacks: {
    label: "Jumping Jacks",
    type: "jump",

    upAngle: 27,
    downAngle: 14,
    minGoodAngle: 25,
    maxGoodAngle: 200,

    formCheck: (lm, smoothed) => {
      const left = lm[27];
      const right = lm[28];
      const legsSpread = Math.abs(left.x - right.x) > 0.13;

      const avgWristY = avg([lm[15].y, lm[16].y]);
      const avgShoulderY = avg([lm[11].y, lm[12].y]);
      const armsUp = avgWristY < avgShoulderY - 0.04;

      // console.log("wrist-shoulder diff:", (avgWristY - avgShoulderY).toFixed(3), "| angle:", smoothed.toFixed(1));

      const nearPeak = smoothed >= 25;
      if (!nearPeak) return "ok";

      if (legsSpread !== armsUp) return "bad";
      return "ok";
    },

    getAngle: (lm) => {
      const left = lm[27];
      const right = lm[28];
      return Math.abs(left.x - right.x) * 200;
    },
  },  // lat_pulldown: {
  //   label: "Lat Pulldown",
  //   upAngle: 150, downAngle: 75, type: "curl",
  //   minGoodAngle: 25, maxGoodAngle: 155,
  //   formCheck: (lm) => getTorsoLean([lm[11].x, lm[11].y], [lm[23].x, lm[23].y]) > 155 ? "bad" : "ok",
  //   getAngle: (lm) => (
  //     calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
  //     calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
  //   ) / 2,
  // },

  lat_pulldown: {
  label: "Lat Pulldown",
  upAngle: 150, downAngle: 75, type: "curl",
  minGoodAngle: 70, maxGoodAngle: 155,
  formCheck: (lm) => getTorsoLean([lm[11].x, lm[11].y], [lm[23].x, lm[23].y]) > 300 ? "bad" : "ok",
  getAngle: (lm) => (
    calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
    calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
  ) / 2,
},

  triceps_pushdown: {
    label: "Triceps Pushdown",
    upAngle: 160, downAngle: 40, type: "press_up",
    minGoodAngle: 155, maxGoodAngle: 180,
    formCheck: (lm) => {
      const avgShoulder = (
        calcAngle([lm[13].x, lm[13].y], [lm[11].x, lm[11].y], [lm[23].x, lm[23].y]) +
        calcAngle([lm[14].x, lm[14].y], [lm[12].x, lm[12].y], [lm[24].x, lm[24].y])
      ) / 2;
      return avgShoulder > 30 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
    ) / 2,
  },

  bench_press: {
    label: "Bench Press",
    upAngle: 150, downAngle: 80, type: "press_up",
    minGoodAngle: 145, maxGoodAngle: 180,
    formCheck: (lm) => Math.abs(lm[11].y - lm[12].y) > 0.05 ? "bad" : "ok",
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
    ) / 2,
  },

  // leg_swing: {
  //   label: "Leg Swing",
  //   upAngle: 120, downAngle: 170, type: "kick",
  //   minGoodAngle: 45, maxGoodAngle: 75,
  //   formCheck: (lm) => {
  //     // فحص مركب: الركبة يجب أن تظل مفرودة ومستقيمة تماماً أثناء حركة أرجحة الفخذ
  //     const minKnee = Math.min(
  //       calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y])
  //     );
  //     if (minKnee < 100) return "bad";
  //     return "ok";
  //   },
  //   getAngle: (lm) => (
  //     calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]) 
  //   ),
  // },

  // leg_swing: {
  // label: "Leg Swing",
  // upAngle: 90,
  // downAngle: 150,
  // type: "kick",

  // formCheck: (lm) => {
  //   const kneeAngle = calcAngle(
  //     [lm[23].x, lm[23].y],
  //     [lm[25].x, lm[25].y],
  //     [lm[27].x, lm[27].y]
  //   );

  //   return kneeAngle < 160 ? "bad" : "ok";
  // },

  // getAngle: (lm) =>
  //   calcAngle(
  //     [lm[11].x, lm[11].y],
  //     [lm[23].x, lm[23].y],
  //     [lm[25].x, lm[25].y]
  //   )

  // leg_swing: {
  // label: "Leg Swing",
  // upAngle: 150,
  // downAngle: 170,
  // type: "kick",

  // minGoodAngle: 140,
  // maxGoodAngle: 155,

  // formCheck: (lm) => {
  //   const kneeAngle = calcAngle(
  //     [lm[23].x, lm[23].y],
  //     [lm[25].x, lm[25].y],
  //     [lm[27].x, lm[27].y]
  //   );

  //   return kneeAngle < 135 ? "bad" : "ok";
  // },



//   leg_swing: {
//   label: "Leg Swing",

//   upAngle: 105,
//   downAngle: 70,

//   type: "kick",

//   minGoodAngle: 100,
//   maxGoodAngle: 125,

//   formCheck: (lm) => {
//     const kneeAngle = calcAngle(
//       [lm[23].x, lm[23].y],
//       [lm[25].x, lm[25].y],
//       [lm[27].x, lm[27].y]
//     );

//     // اسمحي بثني بسيط للركبة
//     return kneeAngle < 120 ? "bad" : "ok";
//   },
//   getAngle: (lm) =>
//     calcAngle(
//       [lm[11].x, lm[11].y],
//       [lm[23].x, lm[23].y],
//       [lm[27].x, lm[27].y]
//     ),
// },

leg_swing: {
    label: "Leg Swing",

    upAngle: 105,
    downAngle: 70,

    type: "kick",

    minGoodAngle: 100,
    maxGoodAngle: 125,

    formCheck: (lm) => {
      const leftKnee = calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]);
      const rightKnee = calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y]);
      const minKnee = Math.min(leftKnee, rightKnee);

      // اسمحي بثني بسيط للركبة
      return minKnee < 120 ? "bad" : "ok";
    },
    getAngle: (lm) => {
      const left = calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[27].x, lm[27].y]);
      const right = calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[28].x, lm[28].y]);

      // الرجل اللي بعيدة عن الـ rest angle (~180) هي اللي بترفع دلوقتي
      const leftDist = Math.abs(180 - left);
      const rightDist = Math.abs(180 - right);

      return leftDist >= rightDist ? left : right;
    },
  },

//   leg_abduction: {
//     label: "Leg Abduction",
//     upAngle: 150,
//   downAngle: 170,
//   type: "kick",

//   minGoodAngle: 140,
//   maxGoodAngle: 155,

//   formCheck: (lm) => {
//     const kneeAngle = calcAngle(
//       [lm[23].x, lm[23].y],
//       [lm[25].x, lm[25].y],
//       [lm[27].x, lm[27].y]
//     );

//     return kneeAngle < 135 ? "bad" : "ok";
//   },

//   getAngle: (lm) =>
//     calcAngle(
//       [lm[11].x, lm[11].y],
//       [lm[23].x, lm[23].y],
//       [lm[27].x, lm[27].y]
//     ),
// },
leg_abduction: {
    label: "Leg Abduction",
    upAngle: 150,
    downAngle: 170,
    type: "kick",

    minGoodAngle: 140,
    maxGoodAngle: 155,

    formCheck: (lm, smoothed) => {
      const leftKnee = calcAngle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y]);
      const rightKnee = calcAngle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y]);
      const minKnee = Math.min(leftKnee, rightKnee);

      console.log("leg_abduction | angle:", smoothed.toFixed(1), "| up:", 150, "| down:", 170, "| minKnee:", minKnee.toFixed(1));

      return minKnee < 135 ? "bad" : "ok";
    },

    getAngle: (lm) => {
      const left = calcAngle([lm[11].x, lm[11].y], [lm[23].x, lm[23].y], [lm[27].x, lm[27].y]);
      const right = calcAngle([lm[12].x, lm[12].y], [lm[24].x, lm[24].y], [lm[28].x, lm[28].y]);

      // الرجل اللي بعيدة عن وضع الراحة (~180) هي اللي بترفع دلوقتي
      const leftDist = Math.abs(180 - left);
      const rightDist = Math.abs(180 - right);

      return leftDist >= rightDist ? left : right;
    },
  },
// 1. الدوائر الكاملة: تعتمد على الـ Angle الدائرية (من 0 لـ 360 درجة) ونوعها circle
  arm_circles: {
    label: "Arm Circles",
    type: "circle", 
    formCheck: (lm) => {
      // التأكد إن الكوع مفرود أثناء الدوران
      const avgElbow = (
        calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
        calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
      ) / 2;
      return avgElbow < 130 ? "bad" : "ok";
    },
    getAngle: (lm) => {
      const leftVis = (lm[11].visibility + lm[15].visibility) / 2;
      const rightVis = (lm[12].visibility + lm[16].visibility) / 2;
      const useLeft = leftVis >= rightVis;
      const shoulder = useLeft ? lm[11] : lm[12];
      const wrist = useLeft ? lm[15] : lm[16];
      let deg = Math.atan2(wrist.y - shoulder.y, wrist.x - shoulder.x) * 180 / Math.PI;
      if (deg < 0) deg += 360;
      return deg; // بيرجع زاوية دائرية حقيقية للفة الكاملة
    },
  },

  // 2. نص الدوائر: حركة ترددية (تطلع وتنزل بس في مدى ضيق) ونوعها curl
  arm_half_circles: {
    label: "Arm Half Circles",
    type: "curl",
    upAngle: 80,       // البوابة اللي بتلقط الحركة
    downAngle: 110,    // النزول (فرد الدراع نسبياً لبره)
    minGoodAngle: 45,  
    maxGoodAngle: 70,  // المدى الضيق المسموح بيه للـ peakMin في نص اللفة
    formCheck: (lm) => "ok",
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y])
    ) / 2,
  },


  // arm_circles: {
  //   label: "Arm Circles",
  //   upAngle: 70, downAngle: 20, type: "raise",
  //   minGoodAngle: 30, maxGoodAngle: 50,
  //   formCheck: (lm) => {
  //     const avgElbow = (
  //       calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[15].x, lm[15].y]) +
  //       calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[16].x, lm[16].y])
  //     ) / 2;
  //     return avgElbow < 110 ? "bad" : "ok";
  //   },
  //   getAngle: (lm) => (
  //     calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]) +
  //     calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y])
  //   ) / 2,
  // },

//   arm_circles: {
//   label: "Arm Circles",
//   type: "curl",
//   // الـ upAngle و downAngle للتحكم في انتقال الـ State Machine
//   upAngle: 45, 
//   downAngle: 125,
//   // الـ Validation: لضمان تقييم العدة كـ Good بناءً على أقصى انقباض للمفصل (peakMin)
//   minGoodAngle: 20, 
//   maxGoodAngle: 45,
//   formCheck: (lm) => "ok",
//   getAngle: (lm) => (
//     calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]) +
//     calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y])
//   ) / 2,
// },

  
//   // 
//   arm_half_circles: {
//   label: "Arm Half Circles",
//   type: "curl",
//   // الـ upAngle و downAngle للتحكم في انتقال الـ State Machine أثناء الحركة
//   upAngle: 65, 
//   downAngle: 95,
//   // الـ Validation: للتأكد أن الـ peakMin وصل للمدى المطلوب لحساب العدة كـ Good
//   minGoodAngle: 40, 
//   maxGoodAngle: 65,
//   formCheck: (lm) => "ok",
//   getAngle: (lm) => (
//     calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]) +
//     calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y])
//   ) / 2,
// },


  arm_vw: {
    label: "Arm VW",
    upAngle: 120, downAngle: 60, type: "raise",
    minGoodAngle: 110, maxGoodAngle: 130,
    formCheck: (lm) => {
      const leftAngle = calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]);
      const rightAngle = calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y]);
      return Math.abs(leftAngle - rightAngle) > 30 ? "bad" : "ok";
    },
    getAngle: (lm) => (
      calcAngle([lm[11].x, lm[11].y], [lm[13].x, lm[13].y], [lm[23].x, lm[23].y]) +
      calcAngle([lm[12].x, lm[12].y], [lm[14].x, lm[14].y], [lm[24].x, lm[24].y])
    ) / 2,
  },
};

// ── Constants ─────────────────────────────────────────────────
const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
];

const MOVENET_KEYPOINTS = [
  "nose", "left_eye", "right_eye", "left_ear", "right_ear",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle",
];

const MOVENET_TO_MEDIAPIPE = {
  left_shoulder: 11, right_shoulder: 12,
  left_elbow: 13, right_elbow: 14,
  left_wrist: 15, right_wrist: 16,
  left_hip: 23, right_hip: 24,
  left_knee: 25, right_knee: 26,
  left_ankle: 27, right_ankle: 28,
};

const LOWER_BODY_EXERCISES = new Set([
  "squats", "bodyweight_squats", "leg_lunge", "lunge", "leg_abduction",
  "high_knee", "butt_kicks", "leg_extension", "leg_swing",
]);

const PRECISION_EXERCISES = new Set([
  "butt_kicks",
  "lat_pulldown",
  "shoulder_press",
  "arm_circles",
  "arm_half_circles",
]);

const PRECISION_REQUIRED_POINTS = {
  butt_kicks: [11, 12, 23, 24, 25, 26, 27, 28],
  lat_pulldown: [11, 12, 13, 14, 15, 16, 23, 24],
  shoulder_press: [11, 12, 13, 14, 15, 16, 23, 24],
  arm_circles: [11, 12, 13, 14, 15, 16],
  arm_half_circles: [11, 12, 13, 14, 15, 16],
};

// ── Helpers ───────────────────────────────────────────────────
function mapMoveNetToMediaPipe(keypoints, width, height) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 }));
  keypoints.forEach((kp, index) => {
    const name = kp.name || kp.part || MOVENET_KEYPOINTS[index];
    const mpIdx = MOVENET_TO_MEDIAPIPE[name];
    if (mpIdx === undefined) return;
    landmarks[mpIdx] = { x: kp.x / width, y: kp.y / height, visibility: kp.score ?? 0 };
  });
  return landmarks;
}

function hasVisiblePoints(landmarks, indexes, minScore = 0.2) {
  return indexes.every(i => (landmarks[i]?.visibility || 0) >= minScore);
}

function lmPoint(lm, i) {
  return [lm[i].x, lm[i].y];
}

function angleAt(lm, a, b, c) {
  return calcAngle(lmPoint(lm, a), lmPoint(lm, b), lmPoint(lm, c));
}

function avg(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeDeg(angle) {
  return ((angle % 360) + 360) % 360;
}

function signedDeltaDeg(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function angleDistanceDeg(a, b) {
  return Math.abs(signedDeltaDeg(a, b));
}

function shoulderRotationAngle(shoulder, wrist) {
  return normalizeDeg(Math.atan2(wrist.y - shoulder.y, wrist.x - shoulder.x) * 180 / Math.PI);
}

function getArmMetrics(lm) {
  const left = {
    side: "left",
    shoulder: lm[11],
    elbowPoint: lm[13],
    wrist: lm[15],
    hip: lm[23],
    elbow: angleAt(lm, 11, 13, 15),
    shoulderAngle: angleAt(lm, 23, 11, 13),
    visibility: avg([lm[11].visibility, lm[13].visibility, lm[15].visibility]),
  };
  const right = {
    side: "right",
    shoulder: lm[12],
    elbowPoint: lm[14],
    wrist: lm[16],
    hip: lm[24],
    elbow: angleAt(lm, 12, 14, 16),
    shoulderAngle: angleAt(lm, 24, 12, 14),
    visibility: avg([lm[12].visibility, lm[14].visibility, lm[16].visibility]),
  };

  left.rotation = shoulderRotationAngle(left.shoulder, left.wrist);
  right.rotation = shoulderRotationAngle(right.shoulder, right.wrist);
  left.radius = dist(left.shoulder, left.wrist);
  right.radius = dist(right.shoulder, right.wrist);

  const shoulderY = avg([lm[11].y, lm[12].y]);
  const hipY = avg([lm[23].y, lm[24].y]);
  const wristY = avg([lm[15].y, lm[16].y]);
  const elbowY = avg([lm[13].y, lm[14].y]);

  return {
    left,
    right,
    primary: left.visibility >= right.visibility ? left : right,
    avgElbow: avg([left.elbow, right.elbow]),
    avgShoulder: avg([left.shoulderAngle, right.shoulderAngle]),
    elbowDiff: Math.abs(left.elbow - right.elbow),
    wristYDiff: Math.abs(lm[15].y - lm[16].y),
    shoulderY,
    hipY,
    wristY,
    elbowY,
  };
}

function getLegMetrics(lm) {
  const left = {
    side: "left",
    knee: angleAt(lm, 23, 25, 27),
    hip: angleAt(lm, 11, 23, 25),
    ankleY: lm[27].y,
    kneeY: lm[25].y,
  };
  const right = {
    side: "right",
    knee: angleAt(lm, 24, 26, 28),
    hip: angleAt(lm, 12, 24, 26),
    ankleY: lm[28].y,
    kneeY: lm[26].y,
  };
  return {
    left,
    right,
    active: left.knee <= right.knee ? left : right,
    avgKnee: avg([left.knee, right.knee]),
    avgHip: avg([left.hip, right.hip]),
  };
}

function makePrecisionState(exerciseName, now) {
  return {
    exerciseName,
    stage: "start",
    side: null,
    startAngle: null,
    prevAngle: null,
    direction: 0,
    signedArc: 0,
    totalArc: 0,
    outArc: 0,
    maxArc: 0,
    minElbow: 180,
    radiusMin: Infinity,
    radiusMax: 0,
    quadrants: new Set(),
    reversals: 0,
    reachedMotion: false,
    reachedGood: false,
    bad: false,
    startedAt: now,
    lastMotionAt: now,
  };
}

function getPrecisionState(s, exerciseName, now) {
  if (!s.precision || s.precision.exerciseName !== exerciseName) {
    s.precision = makePrecisionState(exerciseName, now);
  }
  return s.precision;
}

function resetPrecisionState(s, exerciseName, now) {
  s.precision = makePrecisionState(exerciseName, now);
}

function commitPrecisionRep(s, exerciseName, now, isGood) {
  if (s.lastRepTime && now - s.lastRepTime < 800) return false;
  if (isGood) s.goodReps++;
  else s.badReps++;
  s.lastRepTime = now;
  s.currentRepForm = "Good";
  s.peakMin = Infinity;
  s.peakMax = -Infinity;
  resetPrecisionState(s, exerciseName, now);
  return true;
}

// function updateButtKicks(lm, s, now) {
//   const legs = getLegMetrics(lm);
//   const p = getPrecisionState(s, "butt_kicks", now);
//   const leg = p.side ? legs[p.side] : legs.active;
//   let warning = "";

//   if (p.stage === "start") {
//     s.stage = "start";
//     if (leg.knee < 110) {
//       p.stage = "peak";
//       p.side = leg.side;
//       p.reachedMotion = true;
//       p.reachedGood = leg.knee <= 70 && leg.hip >= 145;
//       p.bad = leg.hip < 135;
//     }
//   } else {
//     p.reachedMotion = p.reachedMotion || leg.knee < 110;
//     p.reachedGood = p.reachedGood || (leg.knee <= 70 && leg.hip >= 145);
//     p.bad = p.bad || leg.hip < 135;
//     warning = p.bad ? "Keep the hip extended" : "";

//     if (leg.knee >= 155) {
//       const isGood = p.reachedGood && !p.bad;
//       if (p.reachedMotion && commitPrecisionRep(s, "butt_kicks", now, isGood) && !isGood) {
//         warning = "Bend the knee more";
//       }
//       s.stage = "start";
//     } else {
//       s.stage = "peak";
//     }
//   }

//   return { handled: true, angle: leg.knee, warning };
// }

function updateButtKicks(lm, s, now) {
  const legs = getLegMetrics(lm);
  const p = getPrecisionState(s, "butt_kicks", now);
  const leg = p.side ? legs[p.side] : legs.active;
  let warning = "";

  // ── فحص إضافي: هل الركبة اترفعت للأمام؟ (high knee motion)
  const leftKneeY  = lm[25].y;
  const rightKneeY = lm[26].y;
  const leftHipY   = lm[23].y;
  const rightHipY  = lm[24].y;
  // لو الركبة ارتفعت فوق الـ hip (y أصغر = أعلى في الصورة) → high knee
  const kneeRaisedForward =
    leftKneeY  < leftHipY  - 0.05 ||
    rightKneeY < rightHipY - 0.05;

  if (p.stage === "start") {
    s.stage = "start";
    if (leg.knee < 110) {
      p.stage = "peak";
      p.side = leg.side;
      p.reachedMotion = true;
      p.reachedGood = leg.knee <= 70 && leg.hip >= 145 && !kneeRaisedForward;
      p.bad = leg.hip < 135 || kneeRaisedForward;
    }
  } else {
    p.reachedMotion = p.reachedMotion || leg.knee < 110;
    p.reachedGood   = p.reachedGood   || (leg.knee <= 70 && leg.hip >= 145 && !kneeRaisedForward);
    p.bad           = p.bad            || leg.hip < 135 || kneeRaisedForward;

    if (p.bad && kneeRaisedForward) {
      warning = "Don't raise the knee forward!";
    } else if (p.bad) {
      warning = "Keep the hip extended";
    }

    if (leg.knee >= 155) {
      const isGood = p.reachedGood && !p.bad;
      if (p.reachedMotion && commitPrecisionRep(s, "butt_kicks", now, isGood) && !isGood) {
        warning = kneeRaisedForward ? "Don't raise the knee forward!" : "Bend the knee more";
      }
      s.stage = "start";
    } else {
      s.stage = "peak";
    }
  }

  return { handled: true, angle: leg.knee, warning };
}


// function updateLatPulldown(lm, s, now) {
//   const arms = getArmMetrics(lm);
//   const p = getPrecisionState(s, "lat_pulldown", now);
//   const torsoLean = getTorsoLean([lm[11].x, lm[11].y], [lm[23].x, lm[23].y]);
//   const handsAtChest = arms.wristY > arms.shoulderY + 0.04 && arms.wristY < arms.hipY - 0.03;
//   const elbowsDrivenDown = arms.elbowY > arms.shoulderY + 0.04;
//   let warning = "";

//   if (arms.elbowDiff > 25 || arms.wristYDiff > 0.12) {
//     p.bad = true;
//     warning = "Pull both arms evenly";
//   }
//   if (torsoLean > 20) {
//     p.bad = true;
//     warning = "Keep your torso upright";
//   }

//   if (p.stage === "start") {
//     s.stage = "extended";
//     if (arms.avgElbow < 130) {
//       p.stage = "pull";
//       p.reachedMotion = true;
//     }
//   } else {
//     p.reachedMotion = p.reachedMotion || arms.avgElbow < 125;
//     p.reachedGood = p.reachedGood || (
//       arms.avgElbow <= 80 &&
//       arms.avgShoulder <= 105 &&
//       handsAtChest &&
//       elbowsDrivenDown
//     );

//     if (arms.avgElbow >= 160 && arms.avgShoulder >= 135) {
//       const isGood = p.reachedGood && !p.bad;
//       if (p.reachedMotion && commitPrecisionRep(s, "lat_pulldown", now, isGood) && !isGood) {
//         warning = "Finish the pull to upper chest";
//       }
//       s.stage = "extended";
//     } else {
//       s.stage = "pull";
//     }
//   }

//   return { handled: true, angle: arms.avgElbow, warning };
// }
function updateLatPulldown(lm, s, now) {
  const arms = getArmMetrics(lm);
  const p = getPrecisionState(s, "lat_pulldown", now);
  const torsoLean = getTorsoLean(
    [lm[11].x, lm[11].y],
    [lm[23].x, lm[23].y]
  );

  let warning = "";

  // مرونة أكبر في تقييم الحركة
  const goodPeak = arms.avgElbow <= 135;
  const extended = arms.avgElbow >= 145;

  // Form checks مرنة
  if (arms.elbowDiff > 45) {
    p.bad = true;
    warning = "Pull both arms evenly";
  }

  if (torsoLean > 40) {
    p.bad = true;
    warning = "Keep your torso upright";
  }

  if (p.stage === "start") {
    s.stage = "extended";

    p.startElbowAngle = arms.avgElbow;
    p.minElbow = arms.avgElbow;

    p.reachedMotion = false;
    p.reachedGood = false;
    p.bad = false;

    if (arms.avgElbow < 145) {
      p.stage = "pull";
      p.reachedMotion = true;
    }
  } else {
    p.minElbow = Math.min(
      p.minElbow ?? 180,
      arms.avgElbow
    );

    p.reachedMotion =
      p.reachedMotion || arms.avgElbow < 150;

    p.reachedGood =
      p.reachedGood || goodPeak;

    if (extended) {
      const totalRange =
        (p.startElbowAngle || 160) -
        (p.minElbow || 160);

      // تجاهل الحركات الصغيرة
      if (totalRange < 15 || !p.reachedMotion) {
        s.precision = null;
        s.stage = "extended";

        return {
          handled: true,
          angle: arms.avgElbow,
          warning: "",
        };
      }

      const isGood =
        (p.reachedGood || totalRange >= 25) &&
        !p.bad;

      if (
        commitPrecisionRep(
          s,
          "lat_pulldown",
          now,
          isGood
        ) &&
        !isGood
      ) {
        warning = p.bad
          ? warning || "Bad form"
          : "Pull down further";
      }

      // Reset للعدة الجديدة
      p.reachedMotion = false;
      p.reachedGood = false;
      p.bad = false;

      p.startElbowAngle = arms.avgElbow;
      p.minElbow = arms.avgElbow;

      s.stage = "extended";
    } else {
      s.stage = "pull";
    }
  }

  return {
    handled: true,
    angle: arms.avgElbow,
    warning,
  };
}
function updateShoulderPress(lm, s, now) {
  const arms = getArmMetrics(lm);
  const p = getPrecisionState(s, "shoulder_press", now);

  const torsoLean = getTorsoLean(
    [lm[11].x, lm[11].y],
    [lm[23].x, lm[23].y]
  );

  let warning = "";

  const handsOverhead =
    arms.wristY < arms.shoulderY - 0.05;

  // وضعية بداية معقولة للـ Shoulder Press
  const validStartPose =
    arms.avgElbow >= 80 &&
    arms.avgElbow <= 130 &&
    Math.abs(arms.wristY - arms.shoulderY) < 0.15;

  if (p.stage === "start") {
    s.stage = "bottom";

    p.reachedMotion = false;
    p.reachedGood = false;
    p.bad = false;

    p.maxElbow = arms.avgElbow;
    p.minElbow = arms.avgElbow;

    // لا تبدأ التمرين إلا من الوضعية الصحيحة
    if (validStartPose) {
      p.stage = "press";
    }

    return {
      handled: true,
      angle: arms.avgElbow,
      warning: ""
    };
  }

  // لو الشخص خرج من وضعية التمرين قبل ما يبدأ فعلياً
  if (
    !p.reachedMotion &&
    !validStartPose &&
    arms.avgElbow < 140
  ) {
    return {
      handled: true,
      angle: arms.avgElbow,
      warning: ""
    };
  }

  p.maxElbow = Math.max(
    p.maxElbow ?? 0,
    arms.avgElbow
  );

  p.minElbow = Math.min(
    p.minElbow ?? 180,
    arms.avgElbow
  );

  // لازم يوصل لفرد شبه كامل
  if (arms.avgElbow >= 150) {
    p.reachedMotion = true;
  }

  // Good lockout
  if (arms.avgElbow >= 160 && handsOverhead) {
    p.reachedGood = true;
  }

  // انتهاء العدة بالرجوع للأسفل
  if (arms.avgElbow <= 110) {

    const motionRange =
      (p.maxElbow || 0) -
      (p.minElbow || 180);

    // تجاهل أي حركة عشوائية
    if (
      motionRange < 45 ||
      !p.reachedMotion
    ) {
      p.reachedMotion = false;
      p.reachedGood = false;
      p.bad = false;

      p.maxElbow = arms.avgElbow;
      p.minElbow = arms.avgElbow;

      s.stage = "bottom";

      return {
        handled: true,
        angle: arms.avgElbow,
        warning: ""
      };
    }

    // فحص الفورم بعد التأكد أنها عدة فعلية
    if (arms.elbowDiff > 40) {
      p.bad = true;
      warning = "Press evenly";
    }

    if (arms.wristYDiff > 0.20) {
      p.bad = true;
      warning = "Keep both arms level";
    }

    if (torsoLean > 35) {
      p.bad = true;
      warning = "Keep your torso stacked";
    }

    const isGood =
      p.reachedGood &&
      !p.bad;

    if (
      commitPrecisionRep(
        s,
        "shoulder_press",
        now,
        isGood
      ) &&
      !isGood
    ) {
      warning =
        warning ||
        "Press higher";
    }

    // Reset
    p.reachedMotion = false;
    p.reachedGood = false;
    p.bad = false;

    p.maxElbow = arms.avgElbow;
    p.minElbow = arms.avgElbow;

    s.stage = "bottom";
  } else {
    s.stage = "lockout";
  }

  return {
    handled: true,
    angle: arms.avgElbow,
    warning
  };
}
function updateArmCircles(lm, s, now, exerciseName) {
  const arms = getArmMetrics(lm);
  const p = getPrecisionState(s, exerciseName, now);
  const arm = p.side ? arms[p.side] : arms.primary;
  const angle = arm.rotation;
  let warning = "";

  if (!p.side) p.side = arm.side;
  p.minElbow = Math.min(p.minElbow, arm.elbow);
  p.radiusMin = Math.min(p.radiusMin, arm.radius);
  p.radiusMax = Math.max(p.radiusMax, arm.radius);
  p.quadrants.add(Math.floor(angle / 90));

  if (arm.elbow < 170 || (exerciseName === "arm_circles" && arm.elbow < 175)) {
    p.bad = true;
    warning = "Keep the elbow locked";
  }

  if (p.prevAngle === null) {
    p.prevAngle = angle;
    p.startAngle = angle;
    s.stage = "ready";
    return { handled: true, angle, warning };
  }

  const delta = signedDeltaDeg(p.prevAngle, angle);
  const absDelta = Math.abs(delta);
  p.prevAngle = angle;

  if (absDelta < 2) {
    if (p.totalArc > 120 && now - p.lastMotionAt > 1400 && exerciseName === "arm_circles") {
      commitPrecisionRep(s, exerciseName, now, false);
      warning = "Complete the full circle";
    }
    s.stage = exerciseName === "arm_half_circles" ? p.stage : "circle";
    return { handled: true, angle, warning };
  }

  p.lastMotionAt = now;
  if (absDelta > 55) p.bad = true;

  if (exerciseName === "arm_circles") {
    const dir = Math.sign(delta);
    if (!p.direction) p.direction = dir;
    if (dir && p.direction && dir !== p.direction && absDelta > 8) p.reversals++;
    p.signedArc += delta;
    p.totalArc += absDelta;
    s.stage = "circle";

    const radiusSpread = p.radiusMin > 0 ? (p.radiusMax - p.radiusMin) / p.radiusMin : 0;
    if (p.reversals > 1 || radiusSpread > 0.45) p.bad = true;

    if (p.totalArc >= 330 || Math.abs(p.signedArc) >= 330) {
      const isGood =
        Math.abs(p.signedArc) >= 300 &&
        p.totalArc >= 330 &&
        p.quadrants.size >= 4 &&
        p.minElbow >= 175 &&
        p.reversals <= 1 &&
        radiusSpread <= 0.45 &&
        !p.bad;
      if (commitPrecisionRep(s, exerciseName, now, isGood) && !isGood) warning = "Bad circle path";
    }

    return { handled: true, angle, warning };
  }

  const progressDelta = p.direction ? delta * p.direction : absDelta;
  if (p.stage === "start") {
    p.direction = Math.sign(delta) || 1;
    p.stage = "out";
    p.startAngle = p.startAngle ?? angle;
  }

  p.totalArc += absDelta;

  if (p.stage === "out") {
    if (progressDelta >= -2) {
      p.outArc += Math.abs(delta);
      p.maxArc = Math.max(p.maxArc, p.outArc);
    } else {
      p.stage = "return";
      if (p.outArc < 150 || p.outArc > 220) p.bad = true;
    }
  } else if (p.stage === "return" && angleDistanceDeg(angle, p.startAngle) <= 25 && p.totalArc > 80) {
    const isGood =
      p.outArc >= 160 &&
      p.outArc <= 220 &&
      p.totalArc < 300 &&
      p.minElbow >= 175 &&
      !p.bad;
    if (commitPrecisionRep(s, exerciseName, now, isGood) && !isGood) warning = "Bad half-circle";
  }

  if (p.totalArc >= 300) {
    commitPrecisionRep(s, exerciseName, now, false);
    warning = "Do not complete a full circle";
  }

  s.stage = p.stage === "out" ? "half-up" : p.stage === "return" ? "return" : "ready";
  return { handled: true, angle: Math.min(p.outArc || 0, 360), warning };
}

function updatePrecisionExercise(exerciseName, lm, s, now) {
  if (!PRECISION_EXERCISES.has(exerciseName)) return { handled: false };
  if (exerciseName === "butt_kicks") return updateButtKicks(lm, s, now);
  if (exerciseName === "lat_pulldown") return updateLatPulldown(lm, s, now);
  if (exerciseName === "shoulder_press") return updateShoulderPress(lm, s, now);
  if (exerciseName === "arm_circles" || exerciseName === "arm_half_circles") {
    return updateArmCircles(lm, s, now, exerciseName);
  }
  return { handled: false };
}

// ── Component ─────────────────────────────────────────────────
export default function LiveCamera({ selectedExercise = "bicep_curl", token }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const pausedRef = useRef(false);
  const stateRef = useRef({
    stage: "waiting", goodReps: 0, badReps: 0,
    currentRepForm: "Good", angles: [], lastRepTime: null,
    peakMin: Infinity, peakMax: -Infinity,
  });

  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [display, setDisplay] = useState({ goodReps: 0, badReps: 0, stage: "waiting", angle: 0, warning: "" });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const ex = EXERCISES[selectedExercise] || EXERCISES.bicep_curl;

  // ── Detection loop ────────────────────────────────────────────
  const detectLoop = useCallback(async () => {
    if (pausedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas || !detector || video.readyState < 2) {
      animRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const ctx = canvas.getContext("2d");
    const W = canvas.width = video.videoWidth || 640;
    const H = canvas.height = video.videoHeight || 480;

    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();

    try {
      const poses = await detector.estimatePoses(video);
      if (poses.length > 0) {
        const lm = mapMoveNetToMediaPipe(poses[0].keypoints, W, H);

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

        const s = stateRef.current;
        const currentEx = EXERCISES[selectedExercise] || EXERCISES.bicep_curl;

        try {
          const requiredPoints = PRECISION_REQUIRED_POINTS[selectedExercise] ||
            (LOWER_BODY_EXERCISES.has(selectedExercise)
              ? [23, 25, 27, 24, 26, 28]
              : [11, 13, 15, 12, 14, 16]);

          if (!hasVisiblePoints(lm, requiredPoints)) {
            setDisplay(prev => ({ ...prev, warning: "Keep your full body visible" }));
            throw new Error("joints not visible");
          }

          const now = Date.now();
          const precisionResult = updatePrecisionExercise(selectedExercise, lm, s, now);

          if (precisionResult.handled) {
            const smoothed = precisionResult.angle;
            const warning = precisionResult.warning || "";

            s.angles.push(smoothed);
            if (s.angles.length > 8) s.angles.shift();
            s.peakMin = Math.min(s.peakMin, smoothed);
            s.peakMax = Math.max(s.peakMax, smoothed);

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
            throw new Error("precision handled");
          }

          const avgAngle = currentEx.getAngle(lm);
          s.angles.push(avgAngle);
          if (s.angles.length > 8) s.angles.shift();
          const smoothed = s.angles.reduce((a, b) => a + b, 0) / s.angles.length;

          // تتبع الـ peak طول الـ rep كلها
          s.peakMin = Math.min(s.peakMin, smoothed);
          s.peakMax = Math.max(s.peakMax, smoothed);

          const MIN_REP_GAP = 1000;
          const upTh = currentEx.upAngle;
          const downTh = currentEx.downAngle;
          const exType = currentEx.type || "curl";
          const minGood = currentEx.minGoodAngle;
          const maxGood = currentEx.maxGoodAngle;

          let warning = "";

          // formCheck: بيتشك على الزوايا الإضافية
          const formStatus = currentEx.formCheck
            ? currentEx.formCheck(lm, smoothed)
            : "ok";

          if (formStatus === "bad") {
            s.currentRepForm = "Bad";
            warning = "Check your form!";
          }

          // scoreRep: بيحكم على الـ rep بناءً على formCheck + peak angle
          function scoreRep() {
            if (s.currentRepForm === "Bad") return "bad";
            if (minGood === undefined || maxGood === undefined) return "good";
            if (exType === "curl" || exType === "kick") {
              if (s.peakMin > maxGood) return "bad";
            } else {
              if (s.peakMax < minGood) return "bad";
            }
            return "good";
          }

          function countRep() {
            // 1. حساب المدى الحركي الفعلي اللي المفصل لفه في العدة دي
            const totalRange = Math.abs(s.peakMax - s.peakMin);

            // 2. فلتر الأمان العام لكل التمارين:
            // لو المتدرب تحرك حركة بسيطة جداً (أقل من 18 درجة) نتيجة اهتزاز أو تعديل وقفة أو جلسة
            if (totalRange < 18) {
              // الكود بيتجاهل الحركة تماماً ومبيحسبهاش (لا جود ولا باد) وبيصفر الـ Peaks للعدة الجاية
              s.peakMin = Infinity;
              s.peakMax = -Infinity;
              s.currentRepForm = "Good";
              return; // الخروج فوراً بدون زيادة أي عداد
            }

            // 3. لو الحركة حقيقية وعبرت فلتر الأمان، الكود بيبدأ يقيمها ويعدها
            if (!s.lastRepTime || now - s.lastRepTime > MIN_REP_GAP) {
              const result = scoreRep();
              if (result === "good") {
                s.goodReps++;
              } else {
                s.badReps++;
                warning = "BAD FORM!";
              }

              // ريسيت وتجهيز للعدة الجديدة
              s.lastRepTime = now;
              s.currentRepForm = "Good";
              s.peakMin = Infinity;
              s.peakMax = -Infinity;
            }
          }

          // State machine
          if (exType === "curl") {
            if (smoothed < upTh) { s.stage = "up"; }
            else if (smoothed > downTh && s.stage === "up") { countRep(); s.stage = "down"; }
          }
          else if (exType === "press_up") {
            if (smoothed < downTh) { s.stage = "down"; }
            else if (smoothed > upTh && s.stage === "down") { countRep(); s.stage = "up"; }
          }
          else if (exType === "squat") {
            if (smoothed < downTh) { s.stage = "down"; }
            else if (smoothed > upTh && s.stage === "down") { countRep(); s.stage = "up"; }
          }
          else if (exType === "raise") {
            if (smoothed > upTh) { s.stage = "up"; }
            else if (smoothed < downTh && s.stage === "up") { countRep(); s.stage = "down"; }
          }
          else if (exType === "kick") {
            if (smoothed < upTh) { s.stage = "up"; }
            else if (smoothed > downTh && s.stage === "up") { countRep(); s.stage = "down"; }
          }
          else if (exType === "jump") {
            if (smoothed > upTh) { s.stage = "up"; }
            else if (smoothed < downTh && s.stage === "up") { countRep(); s.stage = "down"; }
          }

          // HUD
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

        } catch (e) { /* keypoints مش واضحين */ }
      }
    } catch (e) { /* تجاهل detection errors */ }

    animRef.current = requestAnimationFrame(detectLoop);
  }, [selectedExercise]);

  // ── Start ─────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    pausedRef.current = false;
    setError(""); setLoading(true); setFeedback(null); setPaused(false);
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core");
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter");
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl");
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection");
      await new Promise(r => setTimeout(r, 1000));
      await window.tf.setBackend("webgl");
      await window.tf.ready();
      if (typeof window.tf.loadGraphModel !== "function")
        throw new Error("TensorFlow graph model loader did not initialize. Refresh the page and try again.");

      const detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;

      stateRef.current = {
        stage: "waiting", goodReps: 0, badReps: 0,
        currentRepForm: "Good", angles: [], lastRepTime: null,
        peakMin: Infinity, peakMax: -Infinity,
      };
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
        } else { setCountdown(count); }
      }, 1000);

    } catch (err) {
      setError("Cannot start camera: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  }, [detectLoop]);

  // ── Reset ─────────────────────────────────────────────────────
  const resetSession = useCallback(() => {
    stateRef.current = {
      stage: "waiting", goodReps: 0, badReps: 0,
      currentRepForm: "Good", angles: [], lastRepTime: null,
      peakMin: Infinity, peakMax: -Infinity,
    };
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
    animRef.current = null; pausedRef.current = false;
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          exercise_name: selectedExercise,
          total_reps: totalReps,
          good_reps: s.goodReps,
          bad_reps: s.badReps,
          min_angle: Math.round(minAngle),
          max_angle: Math.round(maxAngle),
          range_of_motion: Math.round(maxAngle - minAngle),
        }),
      });
      if (!response.ok) throw new Error("Live feedback request failed");
      const data = await response.json();
      setFeedback(data);
      if (data.audio_url) {
        const url = data.audio_url.startsWith("http") ? data.audio_url : `http://localhost:8000${data.audio_url}`;
        new Audio(url).play();
      }
    } catch (err) {
      setError("Could not get feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  }, [selectedExercise, token]);

  useEffect(() => { resetSession(); }, [selectedExercise, resetSession]);
  useEffect(() => () => { stopCamera({ skipFeedback: true }); }, [stopCamera]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <video ref={videoRef} muted playsInline style={{ display: "none" }} />

      <div style={{ position: "relative", background: "#0a0a0a", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: active ? "block" : "none" }} />

        {!active && countdown === null && !loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", color: "#475569"
          }}>
            <div style={{ fontSize: 56 }}>🎥</div>
            <div style={{ fontSize: ".9rem", fontWeight: 600, marginTop: 8 }}>Press Start to begin live analysis</div>
            <div style={{ fontSize: ".75rem", color: "#64748b", marginTop: 4 }}>{ex.label}</div>
          </div>
        )}

        {loading && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,.85)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12
          }}>
            <div style={{
              width: 40, height: 40, border: "3px solid #1e3a5f",
              borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 1s linear infinite"
            }} />
            <div style={{ color: "white", fontSize: ".8rem" }}>Loading AI Model...</div>
          </div>
        )}

        {countdown !== null && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,.8)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ fontSize: ".85rem", color: "#94a3b8", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>GET READY</div>
            <div style={{ fontSize: 110, fontWeight: 900, color: "#f97316", lineHeight: 1 }}>{countdown}</div>
          </div>
        )}

        {active && (
          <>
            <div style={{
              position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center",
              gap: 6, background: "rgba(0,0,0,.6)", borderRadius: 20, padding: "4px 12px"
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "blink 1s infinite" }} />
              <span style={{ color: "white", fontSize: ".72rem", fontWeight: 700 }}>LIVE</span>
            </div>
            <div style={{
              position: "absolute", top: 12, right: 12, background: "rgba(37,99,235,.85)",
              color: "white", borderRadius: 8, padding: "3px 10px", fontSize: ".7rem", fontWeight: 700
            }}>
              {ex.label.toUpperCase()}
            </div>
            {display.warning && (
              <div style={{
                position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                background: "rgba(239,68,68,.9)", color: "white", borderRadius: 8,
                padding: "6px 16px", fontSize: ".82rem", fontWeight: 700
              }}>
                {display.warning}
              </div>
            )}
            {paused && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 8
              }}>
                <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}>Session Paused</div>
                <div style={{ color: "rgba(255,255,255,.75)", fontSize: ".8rem" }}>
                  Good: {display.goodReps} | Bad: {display.badReps}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(active || feedback) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))", gap: ".75rem" }}>
          {[
            { label: "Total Reps", value: display.goodReps + display.badReps, color: "#1e293b" },
            { label: "Good Reps", value: display.goodReps, color: "#16a34a" },
            { label: "Bad Reps", value: display.badReps, color: "#dc2626" },
            { label: "Angle", value: `${display.angle}`, color: "#2563eb" },
            { label: "Stage", value: display.stage, color: "#f97316" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", border: "1px solid #e2eaf2", borderRadius: 10, padding: ".75rem", textAlign: "center" }}>
              <div style={{ fontSize: ".62rem", color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
        {!active && countdown === null ? (
          <button onClick={startCamera} disabled={loading} style={btn("#2563eb", loading)}>
            {loading ? "Loading AI..." : "Start Live Analysis"}
          </button>
        ) : active ? (
          <>
            {!paused
              ? <button onClick={pauseCamera} style={btn("#f97316")}>Pause</button>
              : <button onClick={resumeCamera} style={btn("#10b981")}>Resume</button>
            }
            <button onClick={() => stopCamera()} style={btn("#ef4444")}>Stop & Get Feedback</button>
            <button onClick={resetSession} style={btn("#64748b")}>Reset</button>
          </>
        ) : null}
      </div>

      {feedbackLoading && (
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
          padding: "1rem", textAlign: "center", color: "#2563eb", fontWeight: 600
        }}>
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
          <div style={{
            background: "white", borderRadius: 8, padding: "1rem", border: "1px solid #e2e8f0",
            whiteSpace: "pre-wrap", fontSize: ".85rem", lineHeight: 1.6, color: "#334155"
          }}>
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
            style={{
              marginTop: "1rem", width: "100%", padding: ".65rem", borderRadius: 8,
              background: "#2563eb", color: "white", border: "none", fontWeight: 700,
              fontSize: ".82rem", cursor: "pointer", fontFamily: "inherit"
            }}>
            Start New Session
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: ".75rem", color: "#dc2626", fontSize: ".8rem"
        }}>
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
