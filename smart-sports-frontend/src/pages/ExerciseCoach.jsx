// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from 'react-router-dom';
// import axios from "axios";
// import CameraAnalysis from '../components/CameraAnalysis'; // تأكدي من المسار الصحيح للملف
// import LiveCamera from '../components/LiveCamera';
// import { Pose } from '@mediapipe/pose'; // لا تنسي الاستيراد في أعلى الملف
// import { getMyPlan } from "../services/api";

// export default function ExerciseCoach() {
//   // const [step, setStep] = useState(1);           // لو عندك
//   const [exerciseName, setExerciseName] = useState("bicep_curl");
//   const [videoFile, setVideoFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const [selectedExercise, setSelectedExercise] = useState("bicep_curl");
//   const [mode, setMode] = useState("upload"); // الافتراضي رفع ملف
//   const [weeklyPlan, setWeeklyPlan]       = useState(null);
//   const [checkedExercises, setCheckedExercises] = useState({});
//   const [selectedDay, setSelectedDay]     = useState(null);

//   const token = localStorage.getItem("token");
//   const videoRef = useRef(null); // هذا المرجع الذي ستستخدمه MediaPipe
//   const poseInstanceRef = useRef(null);
//   const canvasRef = useRef(null);
  


//   const runPoseDetection = async () => {
//   // 1. إنشاء نسخة من الـ Pose (الذكاء الاصطناعي)
//   const pose = new Pose({
//     locateFile: (file) => {
//       return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
//     },
//   });

//   // 2. إعدادات الموديل (دقة الكشف)
//   pose.setOptions({
//     modelComplexity: 1,
//     smoothLandmarks: true,
//     minDetectionConfidence: 0.5,
//     minTrackingConfidence: 0.5,
//   });

//   // 3. ماذا يفعل عندما يجد "نقاط الجسم"؟
//   pose.onResults((results) => {
//     // هنا يأتي ناتج التحليل (results.poseLandmarks)
//     if (results.poseLandmarks) {
//       console.log("تم كشف نقاط الجسم:", results.poseLandmarks);
//       // هنا يمكنك رسم النقاط على Canvas أو تخزينها
//     }
//   });

//   poseInstanceRef.current = pose; // نحفظه لنتمكن من إغلاقه لاحقاً
// };
//   const selectedDayPlan = weeklyPlan?.find(d => d.day === selectedDay);
//   useEffect(() => {
//     getMyPlan()
//       .then(res => {
//         if (res.data?.workout?.weekly_schedule) {
//           setWeeklyPlan(res.data.workout.weekly_schedule);
//           // اختار أول يوم تلقائي
//           setSelectedDay(res.data.workout.weekly_schedule[0]?.day);
//         }
//       })
//     return () => {
//       if (previewUrl) {
//         URL.revokeObjectURL(previewUrl);
//       }
//       if (poseInstanceRef.current) {
//       poseInstanceRef.current.close(); // أو .reset() حسب نسختك
//       poseInstanceRef.current = null;
//     }
//     };
//   }, [previewUrl]);

//   const toggleCheck = (day, exName) => {
//     const key = `${day}-${exName}`;
//     setCheckedExercises(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleFileChange = (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   console.log("File selected:", file.name, "Type:", file.type, "Size:", (file.size / 1024 / 1024).toFixed(2) + " MB");

//   // تنظيف الـ URL القديم
//   if (previewUrl) {
//     URL.revokeObjectURL(previewUrl);
//   }

//   const url = URL.createObjectURL(file);
//   setVideoFile(file);
//   setPreviewUrl(url);
//   setResult(null);
//   setError("");


  
//   // اختبار بسيط
//   const videoTest = document.createElement('video');
//   videoTest.src = url;
//   videoTest.onloadedmetadata = () => {
//     console.log("✅ Video metadata loaded successfully");
//   };
//   videoTest.onerror = (err) => {
//     console.error("❌ Video failed to load:", err);
//     setError("Cannot play this video file. Try another MP4.");
//   };
// };
//   const handleVideoMetadata = () => {
//   if (videoRef.current) {
//     console.log("✅ Video ready, now we can start MediaPipe");
//     // هنا قومي باستدعاء دالة تشغيل MediaPipe (مثل pose.send)
//     runPoseDetection(); 
//   }
// };

// // في الـ JSX الخاص بكِ:
// <video 
//   ref={videoRef} 
//   src={previewUrl} 
//   onLoadedMetadata={handleVideoMetadata} 
//   playsInline 
//   muted 
// />

//   const handleAnalyze = async () => {
//     if (!videoFile) {
//       setError("Please select a video file");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     const formData = new FormData();
//     formData.append("file", videoFile);
//     formData.append("exercise_name", exerciseName);

//     try {
//       const res = await axios.post(
//         "http://localhost:8000/exercise/analyze",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setResult(res.data);
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.detail || "Failed to analyze video");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:"Segoe UI,sans-serif" }}>
//       <style>{`
//         * { box-sizing:border-box; margin:0; padding:0; }
//         .card { background:white; border:1px solid #e2eaf2; border-radius:14px; padding:1.25rem; }
//         .btn-blue { background:#2563eb; color:white; border:none; padding:.6rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer; }
//         .btn-back { background:#64748b; color:white; border:none; padding:.5rem 1rem; border-radius:8px; cursor:pointer; font-size:.82rem; }
//         .day-btn { padding:.4rem .85rem; border-radius:8px; border:1.5px solid #e2eaf2; background:white; font-size:.75rem; font-weight:600; cursor:pointer; color:#64748b; transition:all .2s; }
//         .day-btn.on { background:#2563eb; color:white; border-color:#2563eb; }
//         .ex-row { display:flex; align-items:center; gap:.75rem; padding:.6rem .75rem; border-radius:10px; border:1.5px solid #e2eaf2; margin-bottom:.5rem; transition:all .2s; background:white; }
//         .ex-row.done { background:#f0fdf4; border-color:#86efac; }
//         .checkbox { width:20px; height:20px; border-radius:5px; border:2px solid #cbd5e1; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s; background:white; }
//         .checkbox.checked { background:#10b981; border-color:#10b981; color:white; }
//       `}</style>

//       {/* Navbar */}
//       <nav style={{ background:"white", borderBottom:"1px solid #e2eaf2", padding:".85rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem" }}>
//         <button className="btn-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
//         <h2 style={{ fontWeight:800, fontSize:"1rem", color:"#1a2332" }}>🏋️ Exercise Coach</h2>
//       </nav>

//       <div style={{ maxWidth:1200, margin:"0 auto", padding:"1.5rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>

//         {/* LEFT — Workout Plan من الـ Nutrition */}
//         <div>
//           <div className="card" style={{ marginBottom:"1.25rem" }}>
//             <h3 style={{ fontWeight:700, fontSize:".92rem", color:"#1a2332", marginBottom:"1rem" }}>📅 Your Weekly Workout Plan</h3>

//             {weeklyPlan ? (
//               <>
//                 {/* Day Selector */}
//                 <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1rem" }}>
//                   {weeklyPlan.map(day => (
//                     <button
//                       key={day.day}
//                       className={"day-btn" + (selectedDay===day.day?" on":"")}
//                       onClick={() => setSelectedDay(day.day)}
//                     >
//                       {day.day.slice(0,3)}
//                       {day.exercises?.length > 0 && (
//                         <span style={{ marginLeft:4, background: selectedDay===day.day?"rgba(255,255,255,.3)":"#dbeafe", color: selectedDay===day.day?"white":"#2563eb", borderRadius:10, padding:"0 5px", fontSize:".65rem" }}>
//                           {day.exercises.length}
//                         </span>
//                       )}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Exercises for selected day */}
//                 {selectedDayPlan?.exercises?.length > 0 ? (
//                   <>
//                     <div style={{ fontSize:".72rem", color:"#64748b", marginBottom:".75rem" }}>
//                       {selectedDayPlan.exercises.filter(ex => checkedExercises[`${selectedDay}-${ex.name}`]).length} / {selectedDayPlan.exercises.length} completed
//                     </div>
//                     {/* Progress bar */}
//                     <div style={{ height:6, background:"#f0f4f8", borderRadius:99, overflow:"hidden", marginBottom:"1rem" }}>
//                       <div style={{
//                         height:"100%",
//                         width: `${(selectedDayPlan.exercises.filter(ex => checkedExercises[`${selectedDay}-${ex.name}`]).length / selectedDayPlan.exercises.length) * 100}%`,
//                         background:"#10b981", borderRadius:99, transition:"width .3s"
//                       }} />
//                     </div>

//                     {selectedDayPlan.exercises.map((ex, i) => {
//                       const key     = `${selectedDay}-${ex.name}`;
//                       const isDone  = checkedExercises[key];
//                       return (
//                         <div key={i} className={"ex-row" + (isDone?" done":"")} onClick={() => toggleCheck(selectedDay, ex.name)}>
//                           <div className={"checkbox" + (isDone?" checked":"")}>
//                             {isDone && "✓"}
//                           </div>
//                           <div style={{ flex:1 }}>
//                             <div style={{ fontWeight:600, fontSize:".82rem", color: isDone?"#16a34a":"#1a2332", textDecoration: isDone?"line-through":"none" }}>
//                               {ex.name}
//                             </div>
//                             <div style={{ fontSize:".7rem", color:"#64748b" }}>
//                               {ex.sets} sets × {ex.reps} | Rest: {ex.rest}
//                             </div>
//                           </div>
//                           <span style={{ fontSize:".65rem", background:"#f0f4f8", color:"#64748b", padding:".2rem .5rem", borderRadius:6 }}>
//                             {ex.type}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </>
//                 ) : (
//                   <div style={{ textAlign:"center", padding:"1.5rem", color:"#94a3b8", fontSize:".82rem" }}>
//                     😴 Rest day — no exercises
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div style={{ textAlign:"center", padding:"1.5rem" }}>
//                 <p style={{ color:"#64748b", fontSize:".82rem", marginBottom:"1rem" }}>No workout plan found</p>
//                 <button className="btn-blue" onClick={() => navigate('/nutrition')}>
//                   Create Nutrition Plan
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Exercise Tips */}
//           {weeklyPlan && (
//             <div className="card">
//               <h4 style={{ fontWeight:700, fontSize:".82rem", color:"#1a2332", marginBottom:".75rem" }}>💡 Tips</h4>
//               <div style={{ fontSize:".75rem", color:"#64748b", lineHeight:1.8 }}>
//                 • Warm up for 5-10 minutes before starting<br/>
//                 • Stay hydrated throughout your workout<br/>
//                 • Rest 48 hours before training the same muscle group
//               </div>
//             </div>
//           )}
//         </div>

//         {/* RIGHT — Video Analysis */}
//         <div>
//           <div className="card" style={{ marginBottom:"1.25rem" }}>
//             <h3 style={{ fontWeight:700, fontSize:".92rem", color:"#1a2332", marginBottom:"1rem" }}>🎥 Analyze Your Exercise</h3>

//             <div style={{ marginBottom:"1rem" }}>
//               <label style={{ fontSize:".75rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>Select Exercise</label>
//               <select
//                 value={exerciseName}
//                 onChange={e => setExerciseName(e.target.value)}
//                 style={{ width:"100%", padding:".6rem .9rem", border:"1.5px solid #e2eaf2", borderRadius:8, fontSize:".85rem", background:"white", color:"#1a2332", outline:"none" }}
//               >
//                 {[["bicep_curl","Bicep Curl"],["squats","Squats"],["pushups","Push-ups"],
//                   ["leg_lunge","Leg Lunge"],["shoulder_press","Shoulder Press"],
//                   ["bench_press","Bench Press"],["lat_pulldown","Lat Pulldown"],
//                   ["arm_abduction","Arm Abduction"],["shoulder_flexion","Shoulder Flexion"],
//                   ["bodyweight_squats","Bodyweight Squats"],["lunge","Lunge"],
//                   ["high_knee","High Knee"],["butt_kicks","Butt Kicks"],
//                   ["jumping_jacks","Jumping Jacks"],["leg_extension","Leg Extension"]
//                 ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
//               </select>
//             </div>

//             <div style={{ marginBottom:"1rem" }}>
//               <label style={{ fontSize:".75rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>Upload Video</label>
//               <input type="file" accept="video/*" onChange={handleFileChange} style={{ fontSize:".8rem" }} />
//             </div>

//             {previewUrl && (
//               <video key={previewUrl} src={previewUrl} controls muted playsInline
//                 style={{ width:"100%", maxHeight:220, borderRadius:10, background:"#000", marginBottom:"1rem" }}
//               />
//             )}

//             <button
//               onClick={handleAnalyze}
//               disabled={loading || !videoFile}
//               className="btn-blue"
//               style={{ width:"100%", opacity: loading||!videoFile ? .6:1 }}
//             >
//               {loading ? "⏳ Analyzing..." : "🔍 Analyze Exercise"}
//             </button>

//             {error && <p style={{ color:"#ef4444", marginTop:".75rem", fontSize:".78rem" }}>{error}</p>}
//           </div>

//           {/* Result */}
//           {result && (
//             <div className="card">
//               <h4 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>
//                 📊 {result.exercise_name?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} — Results
//               </h4>

//               <div style={{ display:"flex", gap:"1rem", marginBottom:"1rem" }}>
//                 {[["Reps", result.total_reps,"#2563eb"],["Min°",result.min_angle,"#f97316"],["Max°",result.max_angle,"#10b981"],["ROM°",result.range_of_motion,"#8b5cf6"]].map(([l,v,c])=>(
//                   <div key={l} style={{ flex:1, background:"#f8fafc", borderRadius:10, padding:".75rem", textAlign:"center", border:"1px solid #e2eaf2" }}>
//                     <div style={{ fontWeight:800, fontSize:"1.3rem", color:c }}>{v}</div>
//                     <div style={{ fontSize:".65rem", color:"#64748b" }}>{l}</div>
//                   </div>
//                 ))}
//               </div>

//               {result.video_url && (
//                 <video src={`http://127.0.0.1:8000${result.video_url}?t=${Date.now()}`}
//                   controls style={{ width:"100%", borderRadius:10, background:"#000", marginBottom:"1rem" }}
//                 />
//               )}

//               {result.audio_url && (
//                 <div style={{ marginBottom:"1rem" }}>
//                   <div style={{ fontSize:".75rem", fontWeight:600, color:"#475569", marginBottom:".35rem" }}>🔊 Coach Feedback</div>
//                   <audio controls src={`http://127.0.0.1:8000${result.audio_url}`} style={{ width:"100%" }} />
//                 </div>
//               )}

//               {result.ai_feedback && (
//                 <div style={{ background:"#f8fafc", borderRadius:10, padding:"1rem", border:"1px solid #e2eaf2", fontSize:".78rem", color:"#475569", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
//                   {result.ai_feedback}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { getMyPlan } from "../services/api";
import LiveCamera from '../components/LiveCamera';

export default function ExerciseCoach() {
  const [exerciseName, setExerciseName]         = useState("bicep_curl");
  const [mode, setMode]                         = useState("upload");
  const [demoError, setDemoError]               = useState(false);
  const [videoFile, setVideoFile]               = useState(null);
  const [previewUrl, setPreviewUrl]             = useState(null);
  const [result, setResult]                     = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const navigate                                = useNavigate();
  const [weeklyPlan, setWeeklyPlan]             = useState(null);
  const [checkedExercises, setCheckedExercises] = useState({});
  const [selectedDay, setSelectedDay]           = useState(null);
  const [planExpired, setPlanExpired]           = useState(false);
  const [planExpiresAt, setPlanExpiresAt]       = useState(null);
  const [backendExercises, setBackendExercises] = useState([]);

  const selectedDayPlan = weeklyPlan?.find(d => d.day === selectedDay);
  const token           = localStorage.getItem("token");
  const poseInstanceRef = useRef(null);

  useEffect(() => {
    getMyPlan()
      .then(res => {
        if (!res.data?.has_active_plan) {
          setPlanExpired(true);
          setWeeklyPlan(null);
          return;
        }
        if (res.data?.expires_at) setPlanExpiresAt(res.data.expires_at);
        if (res.data?.workout?.weekly_schedule) {
          setWeeklyPlan(res.data.workout.weekly_schedule);
          setSelectedDay(res.data.workout.weekly_schedule[0]?.day);
        }
      })
      .catch(() => setWeeklyPlan(null));

    return () => {
      if (poseInstanceRef.current) {
        poseInstanceRef.current.close();
        poseInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    axios.get("http://localhost:8000/exercise/exercises-list")
      .then(res => {
        if (Array.isArray(res.data)) setBackendExercises(res.data);
      })
      .catch(() => setBackendExercises([]));
  }, []);

  const toggleCheck = (day, exName) => {
    const key = `${day}-${exName}`;
    setCheckedExercises(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!videoFile) { setError("Please select a video file"); return; }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("exercise_name", exerciseName);
    try {
      const res = await axios.post(
        "http://localhost:8000/exercise/analyze",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze video");
    } finally {
      setLoading(false);
    }
  };

  const exercises = [
    ["bicep_curl","Bicep Curl"],["squats","Squats"],["pushups","Push-ups"],
    ["leg_lunge","Leg Lunge"],["shoulder_press","Shoulder Press"],
    ["bench_press","Bench Press"],["lat_pulldown","Lat Pulldown"],
    ["arm_abduction","Arm Abduction"],
    ["bodyweight_squats","Bodyweight Squats"],["leg_abduction","Leg Abduction"],
    ["high_knee","High Knee"],["butt_kicks","Butt Kicks"],
    ["jumping_jacks","Jumping Jacks"],["leg_extension","Leg Extension"],
    ["arm_circles","Arm Circles"],["arm_half_circles","Arm Half Circles"],
    ["arm_vw","Arm VW"],["leg_swing","Leg Swing"],["triceps_pushdown","Triceps Pushdown"],
  ];

  const titleize = value => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const exerciseOptions = (backendExercises.length
    ? backendExercises.map(ex => [ex.name, ex.description || titleize(ex.name)])
    : exercises
  ).filter(([name]) => name !== "lunge");

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:"Segoe UI,sans-serif" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .card { background:white; border:1px solid #e2eaf2; border-radius:14px; padding:1.25rem; }
        .btn-blue { background:#2563eb; color:white; border:none; padding:.6rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer; }
        .btn-back { background:#64748b; color:white; border:none; padding:.5rem 1rem; border-radius:8px; cursor:pointer; font-size:.82rem; }
        .day-btn { padding:.4rem .85rem; border-radius:8px; border:1.5px solid #e2eaf2; background:white; font-size:.75rem; font-weight:600; cursor:pointer; color:#64748b; transition:all .2s; }
        .day-btn.on { background:#2563eb; color:white; border-color:#2563eb; }
        .ex-row { display:flex; align-items:center; gap:.75rem; padding:.6rem .75rem; border-radius:10px; border:1.5px solid #e2eaf2; margin-bottom:.5rem; transition:all .2s; background:white; cursor:pointer; }
        .ex-row.done { background:#f0fdf4; border-color:#86efac; }
        .checkbox { width:20px; height:20px; border-radius:5px; border:2px solid #cbd5e1; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s; background:white; }
        .checkbox.checked { background:#10b981; border-color:#10b981; color:white; }
        .mode-tabs { display:flex; gap:.5rem; margin-bottom:1rem; flex-wrap:wrap; }
        .mode-tab { padding:.45rem 1rem; border-radius:8px; border:1.5px solid #e2eaf2; background:white; color:#64748b; font-weight:600; font-size:.78rem; cursor:pointer; font-family:inherit; }
        .mode-tab.on { background:#2563eb; border-color:#2563eb; color:white; }
        @media (max-width:780px){
          .split{
          display:flex !important;
          flex-direction: column-reverse !important;
          }
        }
      `}</style>

      <nav style={{ background:"white", borderBottom:"1px solid #e2eaf2", padding:".85rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem" }}>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <h2 style={{ fontWeight:800, fontSize:"1rem", color:"#1a2332" }}>🏋️ Exercise Coach</h2>
      </nav>

      <div className="split" style={{ maxWidth:1200, margin:"0 auto", padding:"1.5rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>

        {/* ══ LEFT — Weekly Plan ══════════════════════════════════════════════ */}
        <div>
          <div className="card" style={{ marginBottom:"1.25rem" }}>
            <h3 style={{ fontWeight:700, fontSize:".92rem", color:"#1a2332", marginBottom:"1rem" }}>📅 Your Weekly Workout Plan</h3>

            {weeklyPlan ? (
              <>
                <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1rem" }}>
                  {weeklyPlan.map(day => (
                    <button key={day.day} className={"day-btn" + (selectedDay===day.day?" on":"")} onClick={() => setSelectedDay(day.day)}>
                      {day.day.slice(0,3)}
                      {day.exercises?.length > 0 && (
                        <span style={{ marginLeft:4, background: selectedDay===day.day?"rgba(255,255,255,.3)":"#dbeafe", color: selectedDay===day.day?"white":"#2563eb", borderRadius:10, padding:"0 5px", fontSize:".65rem" }}>
                          {day.exercises.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {selectedDayPlan?.exercises?.length > 0 ? (
                  <>
                    <div style={{ fontSize:".72rem", color:"#64748b", marginBottom:".75rem" }}>
                      {selectedDayPlan.exercises.filter(ex => checkedExercises[`${selectedDay}-${ex.name}`]).length} / {selectedDayPlan.exercises.length} completed
                    </div>
                    <div style={{ height:6, background:"#f0f4f8", borderRadius:99, overflow:"hidden", marginBottom:"1rem" }}>
                      <div style={{
                        height:"100%",
                        width:`${(selectedDayPlan.exercises.filter(ex => checkedExercises[`${selectedDay}-${ex.name}`]).length / selectedDayPlan.exercises.length) * 100}%`,
                        background:"#10b981", borderRadius:99, transition:"width .3s"
                      }} />
                    </div>

                    {selectedDayPlan.exercises.map((ex, i) => {
                      const key    = `${selectedDay}-${ex.name}`;
                      const isDone = checkedExercises[key];
                      const exKey  = ex.name.toLowerCase().replace(/\s+/g, '_');
                      return (
                        <div key={i} className={"ex-row" + (isDone?" done":"")}
                          onClick={() => { toggleCheck(selectedDay, ex.name); setExerciseName(exKey); setMode("live"); setDemoError(false); }}
                        >
                          <div className={"checkbox" + (isDone?" checked":"")}>{isDone && "✓"}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600, fontSize:".82rem", color: isDone?"#16a34a":"#1a2332", textDecoration: isDone?"line-through":"none" }}>
                              {ex.name}
                            </div>
                            <div style={{ fontSize:".7rem", color:"#64748b" }}>{ex.sets} sets × {ex.reps} | Rest: {ex.rest}</div>
                          </div>
                          <span style={{ fontSize:".65rem", background:"#f0f4f8", color:"#64748b", padding:".2rem .5rem", borderRadius:6 }}>{ex.type}</span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div style={{ textAlign:"center", padding:"1.5rem", color:"#94a3b8", fontSize:".82rem" }}>😴 Rest day — no exercises</div>
                )}
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"1.5rem" }}>
                {planExpired ? (
                  <>
                    <div style={{ fontSize:"1.5rem", marginBottom:".5rem" }}>⏰</div>
                    <p style={{ color:"#ef4444", fontWeight:700, fontSize:".85rem", marginBottom:".4rem" }}>Your plan has expired!</p>
                    <p style={{ color:"#94a3b8", fontSize:".75rem", marginBottom:"1rem" }}>Generate a new 7-day plan to continue</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:"1.5rem", marginBottom:".5rem" }}>📋</div>
                    <p style={{ color:"#64748b", fontSize:".82rem", marginBottom:"1rem" }}>No workout plan found</p>
                  </>
                )}
                <button className="btn-blue" onClick={() => navigate('/nutrition')}>
                  {planExpired ? 'Generate New Plan' : 'Create Nutrition Plan'}
                </button>
              </div>
            )}
          </div>

          {weeklyPlan && planExpiresAt && (
            <div style={{ textAlign:"center", fontSize:".68rem", color:"#94a3b8", marginBottom:"1rem" }}>
              Plan expires: {new Date(planExpiresAt).toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
            </div>
          )}

          {weeklyPlan && (
            <div className="card">
              <h4 style={{ fontWeight:700, fontSize:".82rem", color:"#1a2332", marginBottom:".75rem" }}>💡 Tips</h4>
              <div style={{ fontSize:".75rem", color:"#64748b", lineHeight:1.8 }}>
                • Warm up for 5-10 minutes before starting<br/>
                • Stay hydrated throughout your workout<br/>
                • Rest 48 hours before training the same muscle group
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT — Video Analysis ══════════════════════════════════════════ */}
        <div>
          <div className="card" style={{ marginBottom:"1.25rem" }}>
            <h3 style={{ fontWeight:700, fontSize:".92rem", color:"#1a2332", marginBottom:"1rem" }}>🎥 Analyze Your Exercise</h3>

            <div className="mode-tabs">
              {[["upload", "Upload Video"], ["live", "Live Camera"]].map(([id, label]) => (
                <button key={id} type="button" className={"mode-tab" + (mode === id ? " on" : "")} onClick={() => setMode(id)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Select exercise */}
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontSize:".75rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>Select Exercise</label>
              <select value={exerciseName} onChange={e => { setExerciseName(e.target.value); setDemoError(false); }}
                style={{ width:"100%", padding:".6rem .9rem", border:"1.5px solid #e2eaf2", borderRadius:8, fontSize:".85rem", background:"white", color:"#1a2332", outline:"none" }}
              >
                {exerciseOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Demo video */}
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontSize:".75rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>📽️ How to perform</label>
              {demoError ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:100, background:"#f1f5f9", borderRadius:10, color:"#94a3b8", fontSize:".78rem" }}>
                  🎬 Demo video coming soon
                </div>
              ) : (
                <video
                  key={exerciseName}
                  src={`/exercises/${exerciseName}.mp4`}
                  autoPlay loop muted playsInline
                  style={{ width:"100%", maxHeight:280, borderRadius:10, background:"#0f172a", objectFit:"cover", display:"block" }}
                  onError={() => setDemoError(true)}
                />
              )}
            </div>

            {mode === "live" && (
              <LiveCamera selectedExercise={exerciseName || "bicep_curl"} token={token} />
            )}

            <div style={{ display: mode === "upload" ? "block" : "none" }}>
            {/* Upload */}
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontSize:".75rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>Upload Your Video</label>
              <input type="file" accept="video/*" onChange={handleFileChange} style={{ fontSize:".8rem" }} />
            </div>

            {previewUrl && (
              <video key={previewUrl} src={previewUrl} controls muted playsInline
                style={{ width:"100%", maxHeight:220, borderRadius:10, background:"#000", marginBottom:"1rem" }}
              />
            )}

            <button onClick={handleAnalyze} disabled={loading || !videoFile} className="btn-blue"
              style={{ width:"100%", opacity: loading||!videoFile ? .6 : 1 }}
            >
              {loading ? "⏳ Analyzing..." : "🔍 Analyze Exercise"}
            </button>
            </div>

            {error && <p style={{ color:"#ef4444", marginTop:".75rem", fontSize:".78rem" }}>{error}</p>}
          </div>

          {/* Result */}
          {mode === "upload" && result && (
            <div className="card">
              <h4 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>
                📊 {result.exercise_name?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} — Results
              </h4>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(92px, 1fr))", gap:"1rem", marginBottom:"1rem" }}>
                {[
                  ["Total Reps", result.total_reps, "#2563eb"],
                  ["Good Reps", result.good_reps ?? result.total_reps, "#10b981"],
                  ["Bad Reps", result.bad_reps ?? 0, "#ef4444"],
                  ["Min°", result.min_angle, "#f97316"],
                  ["Max°", result.max_angle, "#8b5cf6"],
                  ["ROM°", result.range_of_motion, "#06b6d4"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f8fafc", borderRadius:10, padding:".75rem", textAlign:"center", border:"1px solid #e2eaf2" }}>
                    <div style={{ fontWeight:800, fontSize:"1.3rem", color:c }}>{v}</div>
                    <div style={{ fontSize:".65rem", color:"#64748b" }}>{l}</div>
                  </div>
                ))}
              </div>
              
              {result.video_url && (
                <video
                  src={result.video_url.startsWith("http") 
                    ? result.video_url 
                    : `http://127.0.0.1:8000${result.video_url}`}
                  controls
                  style={{ width:"100%", borderRadius:10, background:"#000", marginBottom:"1rem" }}
                />
              )}
              
              {result.audio_url && (
                <div style={{ marginBottom:"1rem" }}>
                  <div style={{ fontSize:".75rem", fontWeight:600, color:"#475569", marginBottom:".35rem" }}>🔊 Coach Feedback</div>
                  <audio controls
                    src={result.audio_url.startsWith("http")
                      ? result.audio_url
                      : `http://127.0.0.1:8000${result.audio_url}`}
                    style={{ width:"100%" }}
                  />
                </div>
              )}
              {result.ai_feedback && (
                <div style={{ background:"#f8fafc", borderRadius:10, padding:"1rem", border:"1px solid #e2eaf2", fontSize:".78rem", color:"#475569", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                  {result.ai_feedback}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
