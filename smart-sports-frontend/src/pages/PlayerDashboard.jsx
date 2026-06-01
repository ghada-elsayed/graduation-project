// import { useEffect, useState, useMemo } from "react";
// import { useNavigate } from 'react-router-dom';
// import { getMe, getMyVideos, uploadVideo, getMyApplications, getAllClubs, applyToClub, cancelApplication, getNotifications, markAllNotifsRead, respondToOffer, getPlayerOffers, getMyCvApplications, updateStats } from '../services/api';
// import axios from 'axios';


// const VIDEOS = [
//   { title: "Hat-trick vs Al-Shabab", date: "Jun 13, 2026", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&q=80" },
//   { title: "Player of the Month",    date: "Dec 2025",     img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80" },
//   { title: "Training Highlights",    date: "Jun 5, 2026",  img: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=300&q=80" },
// ];


// function NutritionSection({ plan, navigate }) {
//   const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
//   const [selectedDay, setSelectedDay] = useState('Monday');

//   const days        = plan.daily_plan?.days || [];
//   const workoutDays = plan.workout?.weekly_schedule || [];
//   const dayMeals    = days.find(d => d.day === selectedDay);
//   const dayWorkout  = workoutDays.find(d => d.day === selectedDay);

//   return (
//     <div style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.5rem", marginTop:"1.25rem" }}>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
//         <h3 style={{ fontWeight:700, fontSize:".95rem", color:"#1a2332" }}>🥗 Weekly Nutrition & Training Plan</h3>
//         <button
//           onClick={() => navigate('/nutrition')}
//           style={{ background:"#f97316", color:"white", border:"none", padding:".4rem .9rem", borderRadius:8, fontWeight:600, fontSize:".72rem", cursor:"pointer" }}
//         >New Plan</button>
//       </div>

//       {/* Day Selector */}
//       <div style={{ display:"flex", gap:".4rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
//         {DAYS.map(day => {
//           const hasMeals   = days.some(d => d.day === day);
//           const hasWorkout = workoutDays.some(d => d.day === day);
//           return (
//             <button key={day} onClick={() => setSelectedDay(day)} style={{
//               padding:".4rem .8rem", borderRadius:8,
//               border: selectedDay===day ? "none" : "1px solid #e2eaf2",
//               background: selectedDay===day ? "#2563eb" : "white",
//               color: selectedDay===day ? "white" : "#64748b",
//               fontWeight:600, fontSize:".72rem", cursor:"pointer", position:"relative",
//             }}>
//               {day.slice(0,3)}
//               {(hasMeals || hasWorkout) && (
//                 <span style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background: hasWorkout ? "#10b981" : "#f97316" }} />
//               )}
//             </button>
//           );
//         })}
//       </div>

//       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
//         {/* Meals */}
//         <div>
//           <h4 style={{ fontWeight:700, fontSize:".82rem", color:"#2563eb", marginBottom:".75rem" }}>🍽️ Meals</h4>
//           {dayMeals ? (
//             dayMeals.meals.map((meal, i) => (
//               <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:".85rem", marginBottom:".75rem", border:"1px solid #e2eaf2" }}>
//                 <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332", marginBottom:".5rem" }}>{meal.name}</div>
//                 {meal.foods.map((food, fi) => (
//                   <div key={fi} style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem", padding:".2rem 0", borderBottom: fi < meal.foods.length-1 ? "1px solid #f0f4f8":"none" }}>
//                     <span style={{ color:"#475569" }}>• {food.name}</span>
//                     <span style={{ fontWeight:600, color:"#1a2332" }}>{Number(food.amount_g).toFixed(0)}g</span>
//                   </div>
//                 ))}
//                 <div style={{ marginTop:".5rem", fontSize:".68rem", color:"#94a3b8", display:"flex", gap:"1rem" }}>
//                   <span>🔥 {Math.round(meal.totals.calories)} kcal</span>
//                   <span>💪 {Math.round(meal.totals.protein)}g protein</span>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div style={{ textAlign:"center", padding:"2rem", color:"#94a3b8", fontSize:".78rem" }}>No meals for {selectedDay}</div>
//           )}
//         </div>

//         {/* Workout */}
//         <div>
//           <h4 style={{ fontWeight:700, fontSize:".82rem", color:"#10b981", marginBottom:".75rem" }}>💪 Exercises</h4>
//           {dayWorkout ? (
//             <>
//               {dayWorkout.exercises.map((ex, i) => (
//                 <div key={i} style={{ background:"#f0fdf4", borderRadius:10, padding:".85rem", marginBottom:".75rem", border:"1px solid #bbf7d0" }}>
//                   <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332", marginBottom:".3rem" }}>{ex.name}</div>
//                   <div style={{ fontSize:".7rem", color:"#64748b" }}>{ex.sets} sets × {ex.reps} &nbsp;|&nbsp; Rest: {ex.rest}</div>
//                   <div style={{ fontSize:".65rem", color:"#94a3b8", marginTop:".2rem" }}>Joints: {ex.joints.map(j => j.replace(/_/g,' ')).join(', ')}</div>
//                 </div>
//               ))}
//               {plan.workout?.tips && (
//                 <div style={{ background:"#eff6ff", borderRadius:10, padding:".75rem", border:"1px solid #bfdbfe" }}>
//                   <div style={{ fontWeight:600, fontSize:".72rem", color:"#2563eb", marginBottom:".4rem" }}>💡 Tips</div>
//                   {plan.workout.tips.map((tip, i) => (
//                     <div key={i} style={{ fontSize:".7rem", color:"#475569", padding:".15rem 0" }}>• {tip}</div>
//                   ))}
//                 </div>
//               )}
//             </>
//           ) : (
//             <div style={{ textAlign:"center", padding:"2rem", color:"#94a3b8", fontSize:".78rem" }}>Rest day 😴</div>
//           )}
//         </div>
//       </div>

//       {plan.expires_at && (
//         <div style={{ marginTop:"1rem", textAlign:"center", fontSize:".68rem", color:"#94a3b8" }}>
//           Plan expires: {new Date(plan.expires_at).toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
//         </div>
//       )}
//     </div>
//   );
// }


// // ── localStorage helpers ──────────────────────────────────────────
// const LS_KEY = "playerDashboardCache";

// function loadCache() {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     return raw ? JSON.parse(raw) : {};
//   } catch { return {}; }
// }

// function saveCache(patch) {
//   try {
//     const prev = loadCache();
//     localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, ...patch }));
//   } catch {}
// }

// export default function PlayerDashboard() {
//   // ── Read cache once, synchronously, before any state init ────────
//   const cache = useMemo(() => loadCache(), []);

//   const [active, setActive]               = useState("overview");
//   const [uploading, setUploading]         = useState(false);
//   const [uploadDone, setUploadDone]       = useState(false);
//   const [collapsed, setCollapsed]         = useState(false);
//   const [loading, setLoading]             = useState(true);
//   const [nutritionPlan, setNutritionPlan] = useState(cache.nutritionPlan ?? null);
//   const navigate = useNavigate();

//   // Data states — initialised from cache so page looks right on refresh
//   const [user, setUser]                         = useState(cache.user ?? null);
//   const [videos, setVideos]                     = useState(cache.videos ?? []);
//   const [applications, setApplications]         = useState(cache.applications ?? []);
//   const [clubs, setClubs]                       = useState(cache.clubs ?? []);
//   const [cvApplications, setCvApplications]     = useState(cache.cvApplications ?? []);
//   const [playerNotifications, setPlayerNotifications] = useState(cache.playerNotifications ?? []);
//   const [playerOffers, setPlayerOffers]         = useState(cache.playerOffers ?? []);

//   // ── Auto-persist: only save when data is actually loaded ─────────
//   useEffect(() => { if (user)                         saveCache({ user });                         }, [user]);
//   useEffect(() => { if (videos.length)                saveCache({ videos });                       }, [videos]);
//   useEffect(() => { if (applications.length)          saveCache({ applications });                 }, [applications]);
//   useEffect(() => { if (clubs.length)                 saveCache({ clubs });                        }, [clubs]);
//   useEffect(() => { if (cvApplications.length)        saveCache({ cvApplications });               }, [cvApplications]);
//   useEffect(() => { if (playerNotifications.length)   saveCache({ playerNotifications });          }, [playerNotifications]);
//   useEffect(() => { if (playerOffers.length)          saveCache({ playerOffers });                 }, [playerOffers]);
//   useEffect(() => { if (nutritionPlan)                saveCache({ nutritionPlan });                }, [nutritionPlan]);

//   // Modals
//   const [showStatsForm, setShowStatsForm]       = useState(false);
//   const [statsForm, setStatsForm]               = useState({
//     goals:         cache.user?.goals         || 0,
//     assists:       cache.user?.assists       || 0,
//     matches:       cache.user?.matches       || 0,
//     shot_accuracy: cache.user?.shot_accuracy || 0,
//     win_rate:      cache.user?.win_rate      || 0,
//     games_played:  cache.user?.games_played  || 0,
//   });
//   const [showEditProfile, setShowEditProfile]   = useState(false);
//   const [profileForm, setProfileForm]           = useState({
//     full_name: "", age: "", height_cm: "", weight_kg: "",
//     position: "", city: "", phone: "",
//   });

//   const isInClub = applications.some(a => a.status === "accepted") ||
//                     playerOffers.some(a => a.status === "accepted");

//   const unreadCount = playerNotifications.filter(n => !n.is_read).length;

//   const SIDEBAR_ITEMS = [
//     { icon: "📊", label: "Overview",       id: "overview" },
//     { icon: "📈", label: "Statistics",     id: "stats" },
//     { icon: "🔍", label: "Club Search",    id: "clubs" },
//     { icon: "🔔", label: "Notifications",  id: "notifications", badge: unreadCount },
//     { icon: "🥗", label: "Nutrition",      id: "nutrition" },
//     { icon: "🏋️", label: "Exercise Coach", id: "exercise" },
//     { icon: "💼", label: "Job Offers",     id: "jobs" },
//     { icon: "📤", label: "Uploads",        id: "uploads" },
//     { icon: "⚙️", label: "Settings",       id: "settings" },
//   ];

//   const PERFORMANCE = [
//     { label: "Games Played",  value: user?.games_played  || 0,         sub: "This season" },
//     { label: "Goals",         value: user?.goals         || 0,         sub: "This season" },
//     { label: "Assists",       value: user?.assists       || 0,         sub: "This season" },
//     { label: "Matches",       value: user?.matches       || 0,         sub: "This season" },
//     { label: "Shot Accuracy", value: (user?.shot_accuracy || 0) + "%", sub: "On target %" },
//     { label: "Win Rate",      value: (user?.win_rate     || 0) + "%",  sub: "Overall series" },
//   ];

//   // ── Data fetching ──────────────────────────────────────────────
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) { navigate('/login'); return; }

//     getMe()
//       .then(res => {
//         const cachedUser = loadCache().user || {};
//         const STAT_KEYS    = ['goals','assists','matches','shot_accuracy','win_rate','games_played'];
//         const PROFILE_KEYS = ['full_name','age','height_cm','weight_kg','position','city','phone'];
//         const merged = { ...res.data };
//         [...STAT_KEYS, ...PROFILE_KEYS].forEach(k => {
//           if (cachedUser[k] !== undefined && cachedUser[k] !== "") merged[k] = cachedUser[k];
//         });

//         setUser(merged);
//         saveCache({ user: merged });
//         setStatsForm({
//           goals:         merged.goals         || 0,
//           assists:       merged.assists       || 0,
//           matches:       merged.matches       || 0,
//           shot_accuracy: merged.shot_accuracy || 0,
//           win_rate:      merged.win_rate      || 0,
//           games_played:  merged.games_played  || 0,
//         });
//         setProfileForm({
//           full_name:  merged.full_name  || "",
//           age:        merged.age        || "",
//           height_cm:  merged.height_cm  || "",
//           weight_kg:  merged.weight_kg  || "",
//           position:   merged.position   || "",
//           city:       merged.city       || "",
//           phone:      merged.phone      || "",
//         });
//       })
//       .catch(() => navigate('/login'));

//     getMyVideos()       .then(res => { setVideos(res.data);             saveCache({ videos: res.data }); })            .catch(() => {});
//     getMyApplications() .then(res => { setApplications(res.data);      saveCache({ applications: res.data }); })      .catch(() => {});
//     getMyCvApplications().then(res => { setCvApplications(res.data);   saveCache({ cvApplications: res.data }); })   .catch(() => {});
//     getPlayerOffers()   .then(res => { setPlayerOffers(res.data);      saveCache({ playerOffers: res.data }); })      .catch(() => {});
//     getNotifications()  .then(res => { setPlayerNotifications(res.data); saveCache({ playerNotifications: res.data }); }).catch(() => {});
//     getAllClubs().then(res => {
//       // normalize: API may return array directly, or { clubs: [...] }, or { data: [...] }
//       const raw = res.data;
//       const list = Array.isArray(raw) ? raw
//                   : Array.isArray(raw?.clubs) ? raw.clubs
//                   : Array.isArray(raw?.results) ? raw.results
//                   : [];
//       setClubs(list);
//       saveCache({ clubs: list });
//     }).catch(() => {});
//     fetchMyNutritionPlan();
//   }, [navigate]);

//   const fetchMyNutritionPlan = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       if (!token) return;
//       const res = await axios.get("http://localhost:8000/nutrition/my-plan", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setNutritionPlan(res.data);
//       saveCache({ nutritionPlan: res.data });
//     } catch (err) {
//       console.error("Error fetching nutrition plan:", err);
//       setNutritionPlan(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       await uploadVideo(formData);
//       setUploadDone(true);
//       const res = await getMyVideos();
//       setVideos(res.data);
//     } catch {
//       alert('Upload failed. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ── Sidebar click handler ──────────────────────────────────────
//   const handleSidebarClick = (item) => {
//     if (item.id === 'nutrition')      { navigate('/nutrition');       return; }
//     if (item.id === 'jobs')           { navigate('/jobs');            return; }
//     if (item.id === 'exercise')       { navigate('/exercise-coach');  return; }

//     setActive(item.id);

//     // Mark all notifications as read when opening the tab
//     if (item.id === "notifications" && unreadCount > 0) {
//       markAllNotifsRead()
//         .then(() => setPlayerNotifications(prev => prev.map(n => ({ ...n, is_read: true }))))
//         .catch(() => {});
//     }
//   };

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <div style={{ display:"flex", minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Segoe UI',sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
//         * { box-sizing:border-box; margin:0; padding:0; }

//         .sidebar-item { display:flex; align-items:center; gap:.75rem; padding:.7rem 1rem; border-radius:10px; cursor:pointer; transition:all .2s; color:#64748b; font-size:.85rem; font-weight:500; position:relative; }
//         .sidebar-item:hover { background:rgba(37,99,235,.08); color:#2563eb; }
//         .sidebar-item.active { background:#2563eb; color:white; }

//         .stat-card { background:white; border:1px solid #e2eaf2; border-radius:12px; padding:1rem 1.25rem; display:flex; flex-direction:column; gap:.25rem; transition:all .2s; }
//         .stat-card:hover { box-shadow:0 4px 16px rgba(37,99,235,.1); transform:translateY(-2px); }

//         .perf-item { background:white; border:1px solid #e2eaf2; border-radius:12px; padding:1rem; text-align:center; flex:1; }

//         .video-card { background:white; border:1px solid #e2eaf2; border-radius:12px; overflow:hidden; cursor:pointer; transition:all .2s; }
//         .video-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.1); transform:translateY(-2px); }

//         .btn-blue { background:#2563eb; color:white; border:none; padding:.55rem 1.1rem; border-radius:8px; font-weight:600; font-size:.82rem; cursor:pointer; transition:all .2s; }
//         .btn-blue:hover { background:#1d4ed8; }

//         .btn-orange { background:#f97316; color:white; border:none; padding:.55rem 1.1rem; border-radius:8px; font-weight:600; font-size:.82rem; cursor:pointer; transition:all .2s; }
//         .btn-orange:hover { background:#ea580c; }

//         .upgrade-box { background:linear-gradient(135deg,#1e3a5f,#2c5282); border-radius:12px; padding:1.1rem; color:white; margin-top:auto; }

//         @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
//         .fu { animation:fadeUp .5s ease both; }

//         .modal-input { width:100%; padding:.7rem .9rem; border:1.5px solid #e2eaf2; border-radius:8px; font-size:.88rem; outline:none; transition:border .2s; }
//         .modal-input:focus { border-color:#2563eb; }
//       `}</style>

//       {/* ══ EDIT STATS MODAL ══ */}
//       {showStatsForm && (
//         <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
//           <div style={{ background:"white", borderRadius:16, padding:"2rem", width:"100%", maxWidth:420, boxShadow:"0 8px 40px rgba(0,0,0,.15)" }}>
//             <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a2332", marginBottom:"1.25rem" }}>📊 Update My Stats</h3>
//             <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
//               {[
//                 ["Goals",          "goals",         0, 9999],
//                 ["Assists",        "assists",       0, 9999],
//                 ["Matches",        "matches",       0, 9999],
//                 ["Games Played",   "games_played",  0, 9999],
//                 ["Shot Accuracy%", "shot_accuracy", 0, 100],
//                 ["Win Rate%",      "win_rate",      0, 100],
//               ].map(([label, key, min, max]) => (
//                 <div key={key}>
//                   <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>{label}</label>
//                   <input
//                     type="number" min={min} max={max}
//                     value={statsForm[key]}
//                     onChange={e => setStatsForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
//                     className="modal-input"
//                   />
//                 </div>
//               ))}
//             </div>
//             <div style={{ display:"flex", gap:".75rem" }}>
//               <button
//                 onClick={() => {
//                   // 1. Update UI immediately
//                   const updated = { ...user, ...statsForm };
//                   setUser(updated);
//                   setShowStatsForm(false);

//                   // 2. Save to localStorage directly — independent of API
//                   saveCache({ user: updated });

//                   // 3. Try to save to DB in background (best effort)
//                   updateStats(statsForm).catch(() => {
//                     alert("Could not save to server — stats saved locally");
//                   });
//                 }}
//                 style={{ flex:1, background:"#f97316", color:"white", border:"none", padding:".75rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}
//               >Save Stats</button>
//               <button onClick={() => setShowStatsForm(false)}
//                 style={{ padding:".75rem 1rem", borderRadius:8, border:"1px solid #e2eaf2", background:"white", color:"#64748b", fontWeight:600, cursor:"pointer" }}
//               >Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ EDIT PROFILE MODAL ══ */}
//       {showEditProfile && (
//         <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
//           <div style={{ background:"white", borderRadius:16, padding:"2rem", width:"100%", maxWidth:460, boxShadow:"0 8px 40px rgba(0,0,0,.15)", maxHeight:"90vh", overflowY:"auto" }}>
//             <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a2332", marginBottom:"1.25rem" }}>✏️ Edit Profile</h3>
//             <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
//               {[
//                 ["Full Name",   "full_name",  "text"],
//                 ["Age",         "age",        "number"],
//                 ["Height (cm)", "height_cm",  "number"],
//                 ["Weight (kg)", "weight_kg",  "number"],
//                 ["Position",    "position",   "text"],
//                 ["City",        "city",       "text"],
//                 ["Phone",       "phone",      "text"],
//               ].map(([label, key, type]) => (
//                 <div key={key} style={key === "full_name" || key === "phone" ? { gridColumn:"1 / -1" } : {}}>
//                   <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>{label}</label>
//                   <input
//                     type={type}
//                     value={profileForm[key]}
//                     onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
//                     className="modal-input"
//                     placeholder={`Enter ${label.toLowerCase()}`}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div style={{ display:"flex", gap:".75rem" }}>
//               <button
//                 onClick={() => {
//                   const updated = { ...user, ...profileForm };
//                   setUser(updated);
//                   saveCache({ user: updated });
//                   setShowEditProfile(false);
//                 }}
//                 style={{ flex:1, background:"#2563eb", color:"white", border:"none", padding:".75rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}
//               >Save Profile</button>
//               <button onClick={() => setShowEditProfile(false)}
//                 style={{ padding:".75rem 1rem", borderRadius:8, border:"1px solid #e2eaf2", background:"white", color:"#64748b", fontWeight:600, cursor:"pointer" }}
//               >Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ SIDEBAR ══ */}
//       <div style={{ width:collapsed?64:220, background:"white", borderRight:"1px solid #e2eaf2", display:"flex", flexDirection:"column", padding:"1.25rem .75rem", transition:"width .3s", flexShrink:0, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>

//         {/* Logo */}
//         <div style={{ display:"flex", alignItems:"center", gap:".5rem", padding:".5rem .25rem", marginBottom:"1.5rem" }}>
//           <div style={{ width:32, height:32, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
//             <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid white" }} />
//           </div>
//           {!collapsed && <span style={{ fontWeight:800, fontSize:".88rem", color:"#1a2332" }}>Sports Pro</span>}
//         </div>

//         {/* Nav items */}
//         {SIDEBAR_ITEMS.map(item => (
//           <div key={item.id}
//             className={`sidebar-item${active===item.id?" active":""}`}
//             onClick={() => handleSidebarClick(item)}
//           >
//             <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{item.icon}</span>
//             {!collapsed && <span>{item.label}</span>}
//             {!collapsed && item.badge > 0 && (
//               <span style={{ marginLeft:"auto", background:"#ef4444", color:"white", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".62rem", fontWeight:700 }}>{item.badge}</span>
//             )}
//           </div>
//         ))}

//         {/* Collapse btn */}
//         <div style={{ marginTop:"1rem", padding:".5rem", cursor:"pointer", color:"#94a3b8", fontSize:".8rem", textAlign:"center" }} onClick={() => setCollapsed(!collapsed)}>
//           {collapsed ? "→" : "← Collapse"}
//         </div>

//         {/* Upgrade box */}
//         {!collapsed && (
//           <div className="upgrade-box">
//             <div style={{ fontSize:".7rem", opacity:.8, marginBottom:".3rem" }}>Upgrade to Pro</div>
//             <div style={{ fontSize:".75rem", opacity:.7, marginBottom:".75rem", lineHeight:1.5 }}>Get advanced analytics and insights</div>
//             <button style={{ background:"#f97316", color:"white", border:"none", padding:".45rem 1rem", borderRadius:7, fontWeight:700, fontSize:".75rem", cursor:"pointer", width:"100%" }}>Upgrade Now</button>
//           </div>
//         )}

//         {/* User */}
//         <div style={{ display:"flex", alignItems:"center", gap:".6rem", padding:".75rem .25rem", marginTop:"1rem", borderTop:"1px solid #e2eaf2" }}>
//           {!collapsed && (
//             <div style={{ flex:1 }}>
//               <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332" }}>{user?.full_name || "Guest User"}</div>
//               <div style={{ fontSize:".62rem", color:"#94a3b8" }}>{user?.role || "Player"}</div>
//             </div>
//           )}
//           {!collapsed && (
//             <button
//               onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
//               style={{ background:"#ef4444", color:"white", border:"none", padding:".3rem .7rem", borderRadius:6, fontSize:".68rem", fontWeight:700, cursor:"pointer" }}
//             >Logout</button>
//           )}
//         </div>
//       </div>

//       {/* ══ MAIN CONTENT ══ */}
//       <div style={{ flex:1, overflowY:"auto", padding:"1.75rem" }}>

//         {/* Header */}
//         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
//           <div>
//             <h1 style={{ fontWeight:800, fontSize:"1.3rem", color:"#1a2332" }}>{user?.full_name || "Loading..."}</h1>
//             <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginTop:".25rem" }}>
//               <span style={{ background:"#dbeafe", color:"#2563eb", fontSize:".65rem", fontWeight:700, padding:".15rem .5rem", borderRadius:4 }}>Active</span>
//               <span style={{ color:"#94a3b8", fontSize:".75rem" }}>{user?.sport || "No Sport"}</span>
//               <span style={{ color:"#94a3b8", fontSize:".75rem" }}>•</span>
//               <span style={{ color:"#94a3b8", fontSize:".75rem" }}>{user?.email || ""}</span>
//             </div>
//           </div>
//           <div style={{ display:"flex", gap:".75rem" }}>
//             <button className="btn-blue" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
//             <button className="btn-blue" onClick={() => setShowStatsForm(true)}>Edit Stats</button>
//             <button className="btn-orange">Upload Video</button>
//           </div>
//         </div>

//         {/* ── OVERVIEW ── */}
//         {active === "overview" && (
//           <>
//             {/* Personal Info */}
//             <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem" }}>
//               <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:".9rem" }}>Personal Information</h3>
//               <p style={{ color:"#94a3b8", fontSize:".75rem", marginBottom:".9rem" }}>Basic player details and information</p>
//               <div style={{ display:"flex", gap:"2rem" }}>
//                 {[
//                   ["Age",      user?.age       ? user.age + " years" : "—"],
//                   ["Height",   user?.height_cm ? user.height_cm + " cm" : "—"],
//                   ["Weight",   user?.weight_kg ? user.weight_kg + " kg" : "—"],
//                   ["Position", user?.position  || "—"],
//                   ["City",     user?.city      || "—"],
//                   ["Phone",    user?.phone     || "—"],
//                 ].map(([l, v]) => (
//                   <div key={l}>
//                     <div style={{ fontSize:".68rem", color:"#94a3b8", marginBottom:".2rem" }}>{l}</div>
//                     <div style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332" }}>{v}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Performance Overview */}
//             <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem" }}>
//               <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>Performance Overview</h3>
//               <div style={{ display:"flex", gap:"1rem" }}>
//                 {PERFORMANCE.map(p => (
//                   <div key={p.label} className="perf-item">
//                     <div style={{ fontSize:".65rem", color:"#94a3b8", marginBottom:".3rem" }}>{p.label}</div>
//                     <div style={{ fontWeight:800, fontSize:"1.2rem", color:"#2563eb" }}>{p.value}</div>
//                     <div style={{ fontSize:".62rem", color:"#94a3b8", marginTop:".2rem" }}>{p.sub}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Recent Uploads */}
//             <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"1.25rem" }}>
//               <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
//                 <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>Recent Uploads & Achievements</h3>
//                 <div style={{ display:"flex", gap:".75rem" }}>
//                   {VIDEOS.map((v, i) => (
//                     <div key={i} className="video-card" style={{ flex:1 }}>
//                       <div style={{ position:"relative" }}>
//                         <img src={v.img} alt={v.title} style={{ width:"100%", height:90, objectFit:"cover" }} />
//                         <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.3)" }}>
//                           <div style={{ width:28, height:28, background:"rgba(255,255,255,.9)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem" }}>▶</div>
//                         </div>
//                       </div>
//                       <div style={{ padding:".6rem" }}>
//                         <div style={{ fontWeight:600, fontSize:".72rem", color:"#1a2332", lineHeight:1.3 }}>{v.title}</div>
//                         <div style={{ fontSize:".62rem", color:"#94a3b8", marginTop:".2rem" }}>{v.date}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Upload area */}
//                 <div style={{ marginTop:"1rem", border:"2px dashed #e2eaf2", borderRadius:10, padding:"1rem", textAlign:"center", background:uploadDone?"#f0fdf4":"transparent" }}>
//                   {uploading ? (
//                     <div style={{ color:"#2563eb", fontSize:".8rem", fontWeight:600 }}>⏳ Uploading...</div>
//                   ) : uploadDone ? (
//                     <div style={{ color:"#16a34a", fontSize:".8rem", fontWeight:600 }}>✅ Video uploaded! AI analysis in progress...</div>
//                   ) : (
//                     <>
//                       <div style={{ fontSize:"1.5rem", marginBottom:".35rem" }}>📤</div>
//                       <div style={{ fontWeight:600, fontSize:".8rem", color:"#1a2332" }}>Upload New Video</div>
//                       <div style={{ fontSize:".7rem", color:"#94a3b8", marginTop:".2rem" }}>Click to upload</div>
//                       <input type="file" accept="video/*" onChange={handleUpload} style={{ marginTop:".75rem", fontSize:".75rem" }} />
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* CV Applications */}
//               {applications.length > 0 && (
//                 <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
//                   <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
//                     <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332" }}>💼 CV Applications</h3>
//                     <span style={{ background:"#dbeafe", color:"#2563eb", fontSize:".62rem", fontWeight:700, padding:".15rem .5rem", borderRadius:4 }}>{applications.length} Applied</span>
//                   </div>
//                   <div style={{ maxHeight:280, overflowY:"auto", paddingRight:".25rem" }}>
//                     {applications.map((app, i) => (
//                       <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:".9rem", marginBottom:".75rem", border:"1px solid #e2eaf2" }}>
//                         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".5rem" }}>
//                           <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
//                             <div style={{ width:28, height:28, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:".7rem", fontWeight:700 }}>
//                               {app.club_name[0]}
//                             </div>
//                             <div>
//                               <div style={{ fontWeight:700, fontSize:".82rem", color:"#1a2332" }}>{app.club_name}</div>
//                               <div style={{ fontSize:".68rem", color:"#94a3b8" }}>{app.position}</div>
//                             </div>
//                           </div>
//                           <div style={{ textAlign:"center" }}>
//                             <div style={{ fontWeight:800, fontSize:"1.2rem", color: app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444" }}>{app.score}%</div>
//                             <div style={{ fontSize:".62rem", fontWeight:600, color: app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444" }}>{app.status}</div>
//                           </div>
//                         </div>
//                         <div style={{ height:6, background:"#e2eaf2", borderRadius:99, overflow:"hidden", marginBottom:".5rem" }}>
//                           <div style={{ height:"100%", width:app.score+"%", background: app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444", borderRadius:99 }} />
//                         </div>
//                         {app.met_skills && (
//                           <div style={{ fontSize:".68rem", color:"#64748b" }}>✅ Matched: <span style={{ color:"#10b981", fontWeight:600 }}>{app.met_skills}</span></div>
//                         )}
//                         <div style={{ fontSize:".62rem", color:"#94a3b8", marginTop:".3rem" }}>Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
//                       </div>
//                     ))}
//                   </div>
//                   {applications.length > 2 && (
//                     <div style={{ textAlign:"center", marginTop:".5rem", fontSize:".72rem", color:"#94a3b8" }}>↕ Scroll to see all {applications.length} applications</div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Nutrition & Exercise Plan */}
//             {nutritionPlan && nutritionPlan.has_active_plan && (
//               <NutritionSection plan={nutritionPlan} navigate={navigate} />
//             )}
//             {nutritionPlan && !nutritionPlan.has_active_plan && (
//               <div style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.5rem", marginTop:"1.25rem", textAlign:"center" }}>
//                 <p style={{ color:"#64748b", marginBottom:"1rem" }}>No active nutrition plan</p>
//                 <button className="btn-orange" onClick={() => navigate('/nutrition')}>Create New Plan</button>
//               </div>
//             )}
//           </>
//         )}

//         {/* ── CLUB SEARCH ── */}
//         {active === "clubs" && (() => {
//           const acceptedOffer = playerOffers.find(o => o.status === "accepted");
//           const acceptedApp   = applications.find(a => a.status === "accepted");
//           const alreadyInClub = !!(acceptedOffer || acceptedApp);
//           const hasCvAnyClub  = cvApplications.length > 0;

//           return (
//             <div>
//               {/* ── Banner: already in a club ── */}
//               {alreadyInClub && (
//                 <div style={{ background:"#dcfce7", border:"1px solid #86efac", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:".75rem" }}>
//                   <span style={{ fontSize:"1.4rem" }}>🏆</span>
//                   <div>
//                     <div style={{ fontWeight:700, fontSize:".88rem", color:"#15803d" }}>You are already a member of a club</div>
//                     <div style={{ fontSize:".75rem", color:"#16a34a", marginTop:".15rem" }}>You cannot join another club or send new requests</div>
//                   </div>
//                 </div>
//               )}

//               {/* ── Banner: CV submitted ── */}
//               {!alreadyInClub && hasCvAnyClub && (
//                 <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:".75rem" }}>
//                   <span style={{ fontSize:"1.4rem" }}>📄</span>
//                   <div>
//                     <div style={{ fontWeight:700, fontSize:".88rem", color:"#1d4ed8" }}>Your CV has been submitted</div>
//                     <div style={{ fontSize:".75rem", color:"#2563eb", marginTop:".15rem" }}>You cannot send manual requests after submitting your CV — wait for clubs to respond</div>
//                   </div>
//                 </div>
//               )}

//               {/* ── Available Clubs ── */}
//               <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem" }}>
//                 <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>🏟️ Available Clubs</h3>
//                 {clubs.length === 0
//                   ? <p style={{ color:"#94a3b8", fontSize:".78rem" }}>No clubs available</p>
//                   : clubs.map((club, i) => {
//                       const offerFromClub   = playerOffers.find(o => Number(o.club_id) === Number(club.id));
//                       const hasPendingOffer = offerFromClub?.status === "pending";
//                       const cvForThisClub   = cvApplications.some(a => Number(a.club_id) === Number(club.id));
//                       const appForThisClub  = applications.find(a => Number(a.club_id) === Number(club.id));

//                       return (
//                         <div key={i} style={{
//                           background: hasPendingOffer ? "#fffbeb" : "#f8fafc",
//                           borderRadius:10, padding:".9rem", marginBottom:".75rem",
//                           border: hasPendingOffer ? "1.5px solid #fcd34d" : "1px solid #e2eaf2",
//                           display:"flex", alignItems:"center", justifyContent:"space-between"
//                         }}>
//                           {/* Club info */}
//                           <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
//                             <div style={{ width:36, height:36, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:".85rem" }}>
//                               {club.full_name?.[0]}
//                             </div>
//                             <div>
//                               <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexWrap:"wrap" }}>
//                                 <span style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332" }}>{club.full_name}</span>
//                                 {hasPendingOffer && <span style={{ background:"#fef3c7", color:"#d97706", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20, border:"1px solid #fcd34d" }}>📨 Offer!</span>}
//                                 {offerFromClub?.status === "accepted" && <span style={{ background:"#dcfce7", color:"#16a34a", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20 }}>✅ Accepted</span>}
//                                 {offerFromClub?.status === "rejected" && <span style={{ background:"#fee2e2", color:"#dc2626", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20 }}>❌ Rejected</span>}
//                                 {cvForThisClub && <span style={{ background:"#eff6ff", color:"#2563eb", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20 }}>📄 CV Submitted</span>}
//                               </div>
//                               <div style={{ fontSize:".72rem", color:"#94a3b8" }}>📍 {club.city || "—"} • {club.sport || "—"}</div>
//                             </div>
//                           </div>

//                           {/* Action buttons */}
//                           <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>

//                             {/* Offer accept/reject */}
//                             {hasPendingOffer && !alreadyInClub && !hasCvAnyClub && (
//                               <div style={{ display:"flex", gap:6 }}>
//                                 <button onClick={() => respondToOffer(club.id, "accepted").then(() => { getPlayerOffers().then(r => { setPlayerOffers(r.data); saveCache({ playerOffers: r.data }); }); }).catch(() => {})}
//                                   style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"#10b981", color:"white", fontWeight:700, fontSize:".7rem", cursor:"pointer" }}>✓ Accept</button>
//                                 <button onClick={() => respondToOffer(club.id, "rejected").then(() => { getPlayerOffers().then(r => { setPlayerOffers(r.data); saveCache({ playerOffers: r.data }); }); }).catch(() => {})}
//                                   style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"#ef4444", color:"white", fontWeight:700, fontSize:".7rem", cursor:"pointer" }}>✕ Reject</button>
//                               </div>
//                             )}

//                             {/* Request button logic */}
//                             {alreadyInClub ? (
//                               <span style={{ fontSize:".72rem", color:"#94a3b8", fontWeight:600 }}>Already in a club</span>
//                             ) : cvForThisClub ? (
//                               <span style={{ fontSize:".72rem", color:"#2563eb", fontWeight:600, background:"#eff6ff", padding:".3rem .7rem", borderRadius:8 }}>CV Submitted</span>
//                             ) : hasCvAnyClub ? (
//                               <span style={{ fontSize:".72rem", color:"#94a3b8", fontWeight:600 }}>CV submitted to another club</span>
//                             ) : appForThisClub?.status === "accepted" ? (
//                               <span style={{ fontSize:".72rem", color:"#10b981", fontWeight:700, background:"#dcfce7", padding:".3rem .7rem", borderRadius:8 }}>✅ Accepted</span>
//                             ) : appForThisClub?.status === "rejected" ? (
//                               <span style={{ fontSize:".72rem", color:"#ef4444", fontWeight:700, background:"#fee2e2", padding:".3rem .7rem", borderRadius:8 }}>❌ Rejected</span>
//                             ) : appForThisClub ? (
//                               <button className="btn-blue" style={{ fontSize:".72rem", padding:".4rem .8rem", background:"#94a3b8" }}
//                                 onClick={() => cancelApplication(club.id).then(() => getMyApplications().then(res => { setApplications(res.data); saveCache({ applications: res.data }); })).catch(() => {})}>
//                                 ✕ Cancel Request
//                               </button>
//                             ) : (
//                               <button className="btn-blue" style={{ fontSize:".72rem", padding:".4rem .8rem" }}
//                                 onClick={() => applyToClub(club.id)
//                                   .then(() => getMyApplications().then(res => { setApplications(res.data); saveCache({ applications: res.data }); }))
//                                   .catch((err) => alert(err?.response?.data?.detail || "Failed to send request. Please try again."))}>
//                                 Join Request
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })
//                 }
//               </div>

//               {/* ── Club Offers ── */}
//               <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
//                 <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>📨 Club Offers</h3>
//                 {playerOffers.length === 0
//                   ? <p style={{ color:"#94a3b8", fontSize:".78rem" }}>No offers yet</p>
//                   : playerOffers.map((offer, i) => (
//                       <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:".9rem", marginBottom:".75rem", border:"1px solid #e2eaf2", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//                         <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
//                           <div style={{ width:36, height:36, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:".85rem" }}>
//                             {offer.club_name?.[0]}
//                           </div>
//                           <div>
//                             <div style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332" }}>{offer.club_name}</div>
//                             <div style={{ fontSize:".72rem", color:"#94a3b8" }}>Wants you to join the club</div>
//                           </div>
//                         </div>
//                         {offer.status === "pending" ? (
//                           alreadyInClub ? (
//                             <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Already in a club</span>
//                           ) : hasCvAnyClub ? (
//                             <span style={{ fontSize:12, color:"#2563eb", fontWeight:600 }}>CV Submitted</span>
//                           ) : (
//                             <div style={{ display:"flex", gap:8 }}>
//                               <button onClick={() => respondToOffer(offer.club_id, "accepted").then(() => getPlayerOffers().then(res => { setPlayerOffers(res.data); saveCache({ playerOffers: res.data }); })).catch(() => {})}
//                                 style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#10b981", color:"white", fontWeight:700, fontSize:12, cursor:"pointer" }}>✓ Accept</button>
//                               <button onClick={() => respondToOffer(offer.club_id, "rejected").then(() => getPlayerOffers().then(res => { setPlayerOffers(res.data); saveCache({ playerOffers: res.data }); })).catch(() => {})}
//                                 style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#ef4444", color:"white", fontWeight:700, fontSize:12, cursor:"pointer" }}>✕ Reject</button>
//                             </div>
//                           )
//                         ) : (
//                           <span style={{ background: offer.status==="accepted"?"#dcfce7":"#fee2e2", color: offer.status==="accepted"?"#16a34a":"#dc2626", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700 }}>
//                             {offer.status === "accepted" ? "✅ Accepted" : "❌ Rejected"}
//                           </span>
//                         )}
//                       </div>
//                     ))
//                 }
//               </div>
//             </div>
//           );
//         })()}

//         {/* ── NOTIFICATIONS ── */}
//         {active === "notifications" && (
//           <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
//               <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332" }}>🔔 Notifications</h3>
//               {playerNotifications.some(n => !n.is_read) && (
//                 <button
//                   onClick={() => {
//                     markAllNotifsRead()
//                       .then(() => setPlayerNotifications(prev => prev.map(n => ({ ...n, is_read: true }))))
//                       .catch(() => {});
//                   }}
//                   style={{ background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", padding:".3rem .8rem", borderRadius:6, fontSize:".72rem", fontWeight:600, cursor:"pointer" }}
//                 >Mark all as read</button>
//               )}
//             </div>
//             {playerNotifications.length === 0
//               ? <p style={{ color:"#94a3b8", fontSize:".78rem", textAlign:"center", padding:"2rem" }}>No notifications yet</p>
//               : playerNotifications.map((n, i) => (
//                   <div key={i} style={{ background: n.is_read?"#f8fafc":"#eff6ff", borderRadius:10, padding:".9rem", marginBottom:".75rem", border: n.is_read?"1px solid #e2eaf2":"1px solid #bfdbfe", display:"flex", alignItems:"center", gap:"1rem" }}>
//                     <div style={{ width:40, height:40, borderRadius:"50%", background: n.type==="accepted"?"#dcfce7":n.type==="rejected"?"#fee2e2":"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>
//                       {n.type==="accepted" ? "✅" : n.type==="rejected" ? "❌" : "📋"}
//                     </div>
//                     <div style={{ flex:1 }}>
//                       <div style={{ fontWeight:700, fontSize:".82rem", color:"#1a2332" }}>{n.title}</div>
//                       <div style={{ fontSize:".75rem", color:"#64748b", marginTop:".2rem" }}>{n.message}</div>
//                       <div style={{ fontSize:".65rem", color:"#94a3b8", marginTop:".2rem" }}>{new Date(n.created_at).toLocaleDateString()}</div>
//                     </div>
//                     {!n.is_read && <div style={{ width:8, height:8, borderRadius:"50%", background:"#2563eb", flexShrink:0 }} />}
//                   </div>
//                 ))
//             }
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { getMe, getMyVideos, uploadVideo, getMyApplications, getAllClubs, applyToClub, cancelApplication, getNotifications, markAllNotifsRead, respondToOffer, getPlayerOffers, getMyCvApplications, updateStats } from '../services/api';
import axios from 'axios';


const VIDEOS = [
  { title: "Hat-trick vs Al-Shabab", date: "Jun 13, 2026", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&q=80" },
  { title: "Player of the Month",    date: "Dec 2025",     img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80" },
  { title: "Training Highlights",    date: "Jun 5, 2026",  img: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=300&q=80" },
];


function NutritionSection({ plan, navigate }) {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days        = plan.daily_plan?.days || [];
  const workoutDays = plan.workout?.weekly_schedule || [];
  const dayMeals    = days.find(d => d.day === selectedDay);
  const dayWorkout  = workoutDays.find(d => d.day === selectedDay);

  return (
    <div style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.5rem", marginTop:"1.25rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
        <h3 style={{ fontWeight:700, fontSize:".95rem", color:"#1a2332" }}>🥗 Weekly Nutrition & Training Plan</h3>
        <button
          onClick={() => navigate('/nutrition')}
          style={{ background:"#f97316", color:"white", border:"none", padding:".4rem .9rem", borderRadius:8, fontWeight:600, fontSize:".72rem", cursor:"pointer" }}
        >New Plan</button>
      </div>

      <div style={{ display:"flex", gap:".4rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
        {DAYS.map(day => {
          const hasMeals   = days.some(d => d.day === day);
          const hasWorkout = workoutDays.some(d => d.day === day);
          return (
            <button key={day} onClick={() => setSelectedDay(day)} style={{
              padding:".4rem .8rem", borderRadius:8,
              border: selectedDay===day ? "none" : "1px solid #e2eaf2",
              background: selectedDay===day ? "#2563eb" : "white",
              color: selectedDay===day ? "white" : "#64748b",
              fontWeight:600, fontSize:".72rem", cursor:"pointer", position:"relative",
            }}>
              {day.slice(0,3)}
              {(hasMeals || hasWorkout) && (
                <span style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background: hasWorkout ? "#10b981" : "#f97316" }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }} className="nutrition-grid">
        <div>
          <h4 style={{ fontWeight:700, fontSize:".82rem", color:"#2563eb", marginBottom:".75rem" }}>🍽️ Meals</h4>
          {dayMeals ? (
            dayMeals.meals.map((meal, i) => (
              <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:".85rem", marginBottom:".75rem", border:"1px solid #e2eaf2" }}>
                <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332", marginBottom:".5rem" }}>{meal.name}</div>
                {meal.foods.map((food, fi) => (
                  <div key={fi} style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem", padding:".2rem 0", borderBottom: fi < meal.foods.length-1 ? "1px solid #f0f4f8":"none" }}>
                    <span style={{ color:"#475569" }}>• {food.name}</span>
                    <span style={{ fontWeight:600, color:"#1a2332" }}>{Number(food.amount_g).toFixed(0)}g</span>
                  </div>
                ))}
                <div style={{ marginTop:".5rem", fontSize:".68rem", color:"#94a3b8", display:"flex", gap:"1rem" }}>
                  <span>🔥 {Math.round(meal.totals.calories)} kcal</span>
                  <span>💪 {Math.round(meal.totals.protein)}g protein</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign:"center", padding:"2rem", color:"#94a3b8", fontSize:".78rem" }}>No meals for {selectedDay}</div>
          )}
        </div>

        <div>
          <h4 style={{ fontWeight:700, fontSize:".82rem", color:"#10b981", marginBottom:".75rem" }}>💪 Exercises</h4>
          {dayWorkout ? (
            <>
              {dayWorkout.exercises.map((ex, i) => (
                <div key={i} style={{ background:"#f0fdf4", borderRadius:10, padding:".85rem", marginBottom:".75rem", border:"1px solid #bbf7d0" }}>
                  <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332", marginBottom:".3rem" }}>{ex.name}</div>
                  <div style={{ fontSize:".7rem", color:"#64748b" }}>{ex.sets} sets × {ex.reps} &nbsp;|&nbsp; Rest: {ex.rest}</div>
                  <div style={{ fontSize:".65rem", color:"#94a3b8", marginTop:".2rem" }}>Joints: {ex.joints.map(j => j.replace(/_/g,' ')).join(', ')}</div>
                </div>
              ))}
              {plan.workout?.tips && (
                <div style={{ background:"#eff6ff", borderRadius:10, padding:".75rem", border:"1px solid #bfdbfe" }}>
                  <div style={{ fontWeight:600, fontSize:".72rem", color:"#2563eb", marginBottom:".4rem" }}>💡 Tips</div>
                  {plan.workout.tips.map((tip, i) => (
                    <div key={i} style={{ fontSize:".7rem", color:"#475569", padding:".15rem 0" }}>• {tip}</div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"2rem", color:"#94a3b8", fontSize:".78rem" }}>Rest day 😴</div>
          )}
        </div>
      </div>

      {plan.expires_at && (
        <div style={{ marginTop:"1rem", textAlign:"center", fontSize:".68rem", color:"#94a3b8" }}>
          Plan expires: {new Date(plan.expires_at).toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
        </div>
      )}
    </div>
  );
}


const LS_KEY = "playerDashboardCache";

function loadCache() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCache(patch) {
  try {
    const prev = loadCache();
    localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {}
}

export default function PlayerDashboard() {
  const cache = useMemo(() => loadCache(), []);

  const [active, setActive]               = useState("overview");
  const [uploading, setUploading]         = useState(false);
  const [uploadDone, setUploadDone]       = useState(false);
  const [collapsed, setCollapsed]         = useState(false);
  const [mobileMenu, setMobileMenu]       = useState(false);
  const [loading, setLoading]             = useState(true);
  const [nutritionPlan, setNutritionPlan] = useState(cache.nutritionPlan ?? null);
  const navigate = useNavigate();

  const [user, setUser]                         = useState(cache.user ?? null);
  const [videos, setVideos]                     = useState(cache.videos ?? []);
  const [applications, setApplications]         = useState(cache.applications ?? []);
  const [clubs, setClubs]                       = useState(cache.clubs ?? []);
  const [cvApplications, setCvApplications]     = useState(cache.cvApplications ?? []);
  const [playerNotifications, setPlayerNotifications] = useState(cache.playerNotifications ?? []);
  const [playerOffers, setPlayerOffers]         = useState(cache.playerOffers ?? []);

  useEffect(() => { if (user)                         saveCache({ user });                         }, [user]);
  useEffect(() => { if (videos.length)                saveCache({ videos });                       }, [videos]);
  useEffect(() => { if (applications.length)          saveCache({ applications });                 }, [applications]);
  useEffect(() => { if (clubs.length)                 saveCache({ clubs });                        }, [clubs]);
  useEffect(() => { if (cvApplications.length)        saveCache({ cvApplications });               }, [cvApplications]);
  useEffect(() => { if (playerNotifications.length)   saveCache({ playerNotifications });          }, [playerNotifications]);
  useEffect(() => { if (playerOffers.length)          saveCache({ playerOffers });                 }, [playerOffers]);
  useEffect(() => { if (nutritionPlan)                saveCache({ nutritionPlan });                }, [nutritionPlan]);

  const [showStatsForm, setShowStatsForm]       = useState(false);
  const [statsForm, setStatsForm]               = useState({
    goals:         cache.user?.goals         || 0,
    assists:       cache.user?.assists       || 0,
    matches:       cache.user?.matches       || 0,
    shot_accuracy: cache.user?.shot_accuracy || 0,
    win_rate:      cache.user?.win_rate      || 0,
    games_played:  cache.user?.games_played  || 0,
  });
  const [showEditProfile, setShowEditProfile]   = useState(false);
  const [profileForm, setProfileForm]           = useState({
    full_name: "", age: "", height_cm: "", weight_kg: "",
    position: "", city: "", phone: "",
  });

  const isInClub = applications.some(a => a.status === "accepted") ||
                    playerOffers.some(a => a.status === "accepted");

  const unreadCount = playerNotifications.filter(n => !n.is_read).length;

  const SIDEBAR_ITEMS = [
    { icon: "📊", label: "Overview",       id: "overview" },
    // { icon: "📈", label: "Statistics",     id: "stats" },
    { icon: "🔍", label: "Club Search",    id: "clubs" },
    { icon: "🔔", label: "Notifications",  id: "notifications", badge: unreadCount },
    { icon: "🥗", label: "Nutrition",      id: "nutrition" },
    { icon: "🏋️", label: "Exercise Coach", id: "exercise" },
    { icon: "💼", label: "Job Offers",     id: "jobs" },
    // { icon: "📤", label: "Uploads",        id: "uploads" },
    // { icon: "⚙️", label: "Settings",       id: "settings" },
  ];

  const PERFORMANCE = [
    { label: "Games Played",  value: user?.games_played  || 0,         sub: "This season" },
    { label: "Goals",         value: user?.goals         || 0,         sub: "This season" },
    { label: "Assists",       value: user?.assists       || 0,         sub: "This season" },
    { label: "Matches",       value: user?.matches       || 0,         sub: "This season" },
    { label: "Shot Accuracy", value: (user?.shot_accuracy || 0) + "%", sub: "On target %" },
    { label: "Win Rate",      value: (user?.win_rate     || 0) + "%",  sub: "Overall series" },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    getMe()
      .then(res => {
        const cachedUser = loadCache().user || {};
        const STAT_KEYS    = ['goals','assists','matches','shot_accuracy','win_rate','games_played'];
        const PROFILE_KEYS = ['full_name','age','height_cm','weight_kg','position','city','phone'];
        const merged = { ...res.data };
        [...STAT_KEYS, ...PROFILE_KEYS].forEach(k => {
          if (cachedUser[k] !== undefined && cachedUser[k] !== "") merged[k] = cachedUser[k];
        });

        setUser(merged);
        saveCache({ user: merged });
        setStatsForm({
          goals:         merged.goals         || 0,
          assists:       merged.assists       || 0,
          matches:       merged.matches       || 0,
          shot_accuracy: merged.shot_accuracy || 0,
          win_rate:      merged.win_rate      || 0,
          games_played:  merged.games_played  || 0,
        });
        setProfileForm({
          full_name:  merged.full_name  || "",
          age:        merged.age        || "",
          height_cm:  merged.height_cm  || "",
          weight_kg:  merged.weight_kg  || "",
          position:   merged.position   || "",
          city:       merged.city       || "",
          phone:      merged.phone      || "",
        });
      })
      .catch(() => navigate('/login'));

    getMyVideos()       .then(res => { setVideos(res.data);             saveCache({ videos: res.data }); })            .catch(() => {});
    getMyApplications() .then(res => { setApplications(res.data);      saveCache({ applications: res.data }); })      .catch(() => {});
    getMyCvApplications().then(res => { setCvApplications(res.data);   saveCache({ cvApplications: res.data }); })   .catch(() => {});
    getPlayerOffers()   .then(res => { setPlayerOffers(res.data);      saveCache({ playerOffers: res.data }); })      .catch(() => {});
    getNotifications()  .then(res => { setPlayerNotifications(res.data); saveCache({ playerNotifications: res.data }); }).catch(() => {});
    getAllClubs().then(res => {
      const raw = res.data;
      const list = Array.isArray(raw) ? raw
                  : Array.isArray(raw?.clubs) ? raw.clubs
                  : Array.isArray(raw?.results) ? raw.results
                  : [];
      setClubs(list);
      saveCache({ clubs: list });
    }).catch(() => {});
    fetchMyNutritionPlan();
  }, [navigate]);

  const fetchMyNutritionPlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get("http://localhost:8000/nutrition/my-plan", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNutritionPlan(res.data);
      saveCache({ nutritionPlan: res.data });
    } catch (err) {
      console.error("Error fetching nutrition plan:", err);
      setNutritionPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadVideo(formData);
      setUploadDone(true);
      const res = await getMyVideos();
      setVideos(res.data);
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSidebarClick = (item) => {
    setMobileMenu(false);
    if (item.id === 'nutrition')      { navigate('/nutrition');       return; }
    if (item.id === 'jobs')           { navigate('/jobs');            return; }
    if (item.id === 'exercise')       { navigate('/exercise-coach');  return; }

    setActive(item.id);

    if (item.id === "notifications" && unreadCount > 0) {
      markAllNotifsRead()
        .then(() => setPlayerNotifications(prev => prev.map(n => ({ ...n, is_read: true }))))
        .catch(() => {});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-row" style={{ display:"flex", minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }

        .sidebar-item { display:flex; align-items:center; gap:.75rem; padding:.7rem 1rem; border-radius:10px; cursor:pointer; transition:all .2s; color:#64748b; font-size:.85rem; font-weight:500; position:relative; }
        .sidebar-item:hover { background:rgba(37,99,235,.08); color:#2563eb; }
        .sidebar-item.active { background:#2563eb; color:white; }

        .stat-card { background:white; border:1px solid #e2eaf2; border-radius:12px; padding:1rem 1.25rem; display:flex; flex-direction:column; gap:.25rem; transition:all .2s; }
        .stat-card:hover { box-shadow:0 4px 16px rgba(37,99,235,.1); transform:translateY(-2px); }

        .perf-item { background:white; border:1px solid #e2eaf2; border-radius:12px; padding:1rem; text-align:center; flex:1; min-width:100px; }

        .video-card { background:white; border:1px solid #e2eaf2; border-radius:12px; overflow:hidden; cursor:pointer; transition:all .2s; }
        .video-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.1); transform:translateY(-2px); }

        .btn-blue { background:#2563eb; color:white; border:none; padding:.55rem 1.1rem; border-radius:8px; font-weight:600; font-size:.82rem; cursor:pointer; transition:all .2s; }
        .btn-blue:hover { background:#1d4ed8; }

        .btn-orange { background:#f97316; color:white; border:none; padding:.55rem 1.1rem; border-radius:8px; font-weight:600; font-size:.82rem; cursor:pointer; transition:all .2s; }
        .btn-orange:hover { background:#ea580c; }

        .upgrade-box { background:linear-gradient(135deg,#1e3a5f,#2c5282); border-radius:12px; padding:1.1rem; color:white; margin-top:auto; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp .5s ease both; }

        .modal-input { width:100%; padding:.7rem .9rem; border:1.5px solid #e2eaf2; border-radius:8px; font-size:.88rem; outline:none; transition:border .2s; }
        .modal-input:focus { border-color:#2563eb; }

        /* ── Mobile ── */
        .mobile-topbar { display:none; }
        .sidebar-desktop { display:flex; }

        @media (max-width: 768px) {
          .dashboard-row { flex-direction:column !important; }
          .sidebar-desktop { display:none !important; }
          .mobile-topbar { display:flex !important; align-items:center; justify-content:space-between; padding:.75rem 1rem; background:white; border-bottom:1px solid #e2eaf2; position:sticky; top:0; z-index:100; }
          .main-content { padding:1rem !important; }
          .info-grid { flex-wrap:wrap !important; gap:1rem !important; }
          .perf-scroll { overflow-x:auto; padding-bottom:.5rem; }
          .perf-scroll > div { min-width:100px; }
          .grid-2col { grid-template-columns:1fr !important; }
          .nutrition-grid { grid-template-columns:1fr !important; }
          .header-row { flex-direction:column !important; align-items:flex-start !important; gap:.75rem; }
          .header-btns { width:100%; display:flex; gap:.5rem; flex-wrap:wrap; }
          .header-btns button { flex:1; }
        }

        .mobile-drawer {
          position:fixed; top:0; left:0; height:100vh; width:260px;
          background:white; z-index:200; padding:1.25rem .75rem;
          box-shadow:4px 0 20px rgba(0,0,0,.1);
          transform:translateX(-100%); transition:transform .3s;
          display:flex; flex-direction:column; overflow-y:auto;
        }
        .mobile-drawer.open { transform:translateX(0); }
        .drawer-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:199; }
        .drawer-overlay.open { display:block; }
      `}</style>

      {/* ══ MOBILE TOP BAR ══ */}
      <div className="mobile-topbar">
        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid white" }} />
          </div>
          <span style={{ fontWeight:800, fontSize:".85rem", color:"#1a2332" }}>Sports Pro</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
          <span style={{ fontSize:".78rem", color:"#64748b", fontWeight:600 }}>{user?.full_name?.split(' ')[0] || ""}</span>
          <button onClick={() => setMobileMenu(true)} style={{ background:"none", border:"1px solid #e2eaf2", borderRadius:8, padding:".35rem .6rem", cursor:"pointer", fontSize:"1rem" }}>☰</button>
        </div>
      </div>

      {/* ══ MOBILE DRAWER OVERLAY ══ */}
      <div className={`drawer-overlay${mobileMenu?" open":""}`} onClick={() => setMobileMenu(false)} />

      {/* ══ MOBILE DRAWER ══ */}
      <div className={`mobile-drawer${mobileMenu?" open":""}`}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <span style={{ fontWeight:800, fontSize:".88rem", color:"#1a2332" }}>Sports Pro</span>
          <button onClick={() => setMobileMenu(false)} style={{ background:"none", border:"none", fontSize:"1.2rem", cursor:"pointer", color:"#64748b" }}>✕</button>
        </div>
        {SIDEBAR_ITEMS.map(item => (
          <div key={item.id} className={`sidebar-item${active===item.id?" active":""}`} onClick={() => handleSidebarClick(item)}>
            <span style={{ fontSize:"1.1rem" }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span style={{ marginLeft:"auto", background:"#ef4444", color:"white", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".62rem", fontWeight:700 }}>{item.badge}</span>
            )}
          </div>
        ))}
        <div style={{ marginTop:"auto", paddingTop:"1rem", borderTop:"1px solid #e2eaf2" }}>
          <div style={{ fontWeight:700, fontSize:".8rem", color:"#1a2332", marginBottom:".2rem" }}>{user?.full_name || "Guest"}</div>
          <div style={{ fontSize:".68rem", color:"#94a3b8", marginBottom:".75rem" }}>{user?.role || "Player"}</div>
          <button onClick={handleLogout} style={{ background:"#ef4444", color:"white", border:"none", padding:".4rem 1rem", borderRadius:8, fontWeight:700, fontSize:".75rem", cursor:"pointer", width:"100%" }}>Logout</button>
        </div>
      </div>

      {/* ══ EDIT STATS MODAL ══ */}
      {showStatsForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"white", borderRadius:16, padding:"2rem", width:"100%", maxWidth:420, boxShadow:"0 8px 40px rgba(0,0,0,.15)", margin:"0 1rem" }}>
            <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a2332", marginBottom:"1.25rem" }}>📊 Update My Stats</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
              {[
                ["Goals",          "goals",         0, 9999],
                ["Assists",        "assists",       0, 9999],
                ["Matches",        "matches",       0, 9999],
                ["Games Played",   "games_played",  0, 9999],
                ["Shot Accuracy%", "shot_accuracy", 0, 100],
                ["Win Rate%",      "win_rate",      0, 100],
              ].map(([label, key, min, max]) => (
                <div key={key}>
                  <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>{label}</label>
                  <input
                    type="number" min={min} max={max}
                    value={statsForm[key]}
                    onChange={e => setStatsForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="modal-input"
                  />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:".75rem" }}>
              <button
                onClick={() => {
                  const updated = { ...user, ...statsForm };
                  setUser(updated);
                  setShowStatsForm(false);
                  saveCache({ user: updated });
                  updateStats(statsForm).catch(() => {
                    alert("Could not save to server — stats saved locally");
                  });
                }}
                style={{ flex:1, background:"#f97316", color:"white", border:"none", padding:".75rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}
              >Save Stats</button>
              <button onClick={() => setShowStatsForm(false)}
                style={{ padding:".75rem 1rem", borderRadius:8, border:"1px solid #e2eaf2", background:"white", color:"#64748b", fontWeight:600, cursor:"pointer" }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT PROFILE MODAL ══ */}
      {showEditProfile && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"white", borderRadius:16, padding:"2rem", width:"100%", maxWidth:460, boxShadow:"0 8px 40px rgba(0,0,0,.15)", maxHeight:"90vh", overflowY:"auto", margin:"0 1rem" }}>
            <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a2332", marginBottom:"1.25rem" }}>✏️ Edit Profile</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.25rem" }}>
              {[
                ["Full Name",   "full_name",  "text"],
                ["Age",         "age",        "number"],
                ["Height (cm)", "height_cm",  "number"],
                ["Weight (kg)", "weight_kg",  "number"],
                ["Position",    "position",   "text"],
                ["City",        "city",       "text"],
                ["Phone",       "phone",      "text"],
              ].map(([label, key, type]) => (
                <div key={key} style={key === "full_name" || key === "phone" ? { gridColumn:"1 / -1" } : {}}>
                  <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>{label}</label>
                  <input
                    type={type}
                    value={profileForm[key]}
                    onChange={e => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="modal-input"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:".75rem" }}>
              <button
                onClick={() => {
                  const updated = { ...user, ...profileForm };
                  setUser(updated);
                  saveCache({ user: updated });
                  setShowEditProfile(false);
                }}
                style={{ flex:1, background:"#2563eb", color:"white", border:"none", padding:".75rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}
              >Save Profile</button>
              <button onClick={() => setShowEditProfile(false)}
                style={{ padding:".75rem 1rem", borderRadius:8, border:"1px solid #e2eaf2", background:"white", color:"#64748b", fontWeight:600, cursor:"pointer" }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DESKTOP SIDEBAR ══ */}
      <div className="sidebar-desktop" style={{ width:collapsed?64:220, background:"white", borderRight:"1px solid #e2eaf2", flexDirection:"column", padding:"1.25rem .75rem", transition:"width .3s", flexShrink:0, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>

        <div style={{ display:"flex", alignItems:"center", gap:".5rem", padding:".5rem .25rem", marginBottom:"1.5rem" }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid white" }} />
          </div>
          {!collapsed && <span style={{ fontWeight:800, fontSize:".88rem", color:"#1a2332" }}>Sports Pro</span>}
        </div>

        {SIDEBAR_ITEMS.map(item => (
          <div key={item.id}
            className={`sidebar-item${active===item.id?" active":""}`}
            onClick={() => handleSidebarClick(item)}
          >
            <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge > 0 && (
              <span style={{ marginLeft:"auto", background:"#ef4444", color:"white", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".62rem", fontWeight:700 }}>{item.badge}</span>
            )}
          </div>
        ))}

        <div style={{ marginTop:"1rem", padding:".5rem", cursor:"pointer", color:"#94a3b8", fontSize:".8rem", textAlign:"center" }} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "→" : "← Collapse"}
        </div>

        {!collapsed && (
          <div className="upgrade-box">
            <div style={{ fontSize:".7rem", opacity:.8, marginBottom:".3rem" }}>Upgrade to Pro</div>
            <div style={{ fontSize:".75rem", opacity:.7, marginBottom:".75rem", lineHeight:1.5 }}>Get advanced analytics and insights</div>
            <button style={{ background:"#f97316", color:"white", border:"none", padding:".45rem 1rem", borderRadius:7, fontWeight:700, fontSize:".75rem", cursor:"pointer", width:"100%" }}>Upgrade Now</button>
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:".6rem", padding:".75rem .25rem", marginTop:"1rem", borderTop:"1px solid #e2eaf2" }}>
          {!collapsed && (
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332" }}>{user?.full_name || "Guest User"}</div>
              <div style={{ fontSize:".62rem", color:"#94a3b8" }}>{user?.role || "Player"}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} style={{ background:"#ef4444", color:"white", border:"none", padding:".3rem .7rem", borderRadius:6, fontSize:".68rem", fontWeight:700, cursor:"pointer" }}>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="main-content" style={{ flex:1, overflowY:"auto", padding:"1.75rem" }}>

        {/* Header */}
        <div className="header-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <div>
            <h1 style={{ fontWeight:800, fontSize:"1.3rem", color:"#1a2332" }}>{user?.full_name || "Loading..."}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginTop:".25rem", flexWrap:"wrap" }}>
              <span style={{ background:"#dbeafe", color:"#2563eb", fontSize:".65rem", fontWeight:700, padding:".15rem .5rem", borderRadius:4 }}>Active</span>
              <span style={{ color:"#94a3b8", fontSize:".75rem" }}>{user?.sport || "No Sport"}</span>
              <span style={{ color:"#94a3b8", fontSize:".75rem" }}>•</span>
              <span style={{ color:"#94a3b8", fontSize:".75rem" }}>{user?.email || ""}</span>
            </div>
          </div>
          <div className="header-btns" style={{ display:"flex", gap:".75rem" }}>
            <button className="btn-blue" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
            <button className="btn-blue" onClick={() => setShowStatsForm(true)}>Edit Stats</button>
            {/* <button className="btn-orange">Upload Video</button> */}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {active === "overview" && (
          <>
            {/* Personal Info */}
            <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem" }}>
              <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:".9rem" }}>Personal Information</h3>
              <p style={{ color:"#94a3b8", fontSize:".75rem", marginBottom:".9rem" }}>Basic player details and information</p>
              <div className="info-grid" style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}>
                {[
                  ["Age",      user?.age       ? user.age + " years" : "—"],
                  ["Height",   user?.height_cm ? user.height_cm + " cm" : "—"],
                  ["Weight",   user?.weight_kg ? user.weight_kg + " kg" : "—"],
                  ["Position", user?.position  || "—"],
                  ["City",     user?.city      || "—"],
                  ["Phone",    user?.phone     || "—"],
                ].map(([l, v]) => (
                  <div key={l} style={{ minWidth:80 }}>
                    <div style={{ fontSize:".68rem", color:"#94a3b8", marginBottom:".2rem" }}>{l}</div>
                    <div style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Overview */}
            <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem" }}>
              <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>Performance Overview</h3>
              <div className="perf-scroll" style={{ display:"flex", gap:"1rem" }}>
                {PERFORMANCE.map(p => (
                  <div key={p.label} className="perf-item">
                    <div style={{ fontSize:".65rem", color:"#94a3b8", marginBottom:".3rem" }}>{p.label}</div>
                    <div style={{ fontWeight:800, fontSize:"1.2rem", color:"#2563eb" }}>{p.value}</div>
                    <div style={{ fontSize:".62rem", color:"#94a3b8", marginTop:".2rem" }}>{p.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Uploads + CV Applications */}
            <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"1.25rem" }} className="grid-2col">
              <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
                <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>Recent Uploads & Achievements</h3>
                <div style={{ display:"flex", gap:".75rem", flexWrap:"wrap" }}>
                  {VIDEOS.map((v, i) => (
                    <div key={i} className="video-card" style={{ flex:1, minWidth:120 }}>
                      <div style={{ position:"relative" }}>
                        <img src={v.img} alt={v.title} style={{ width:"100%", height:90, objectFit:"cover" }} />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.3)" }}>
                          <div style={{ width:28, height:28, background:"rgba(255,255,255,.9)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem" }}>▶</div>
                        </div>
                      </div>
                      <div style={{ padding:".6rem" }}>
                        <div style={{ fontWeight:600, fontSize:".72rem", color:"#1a2332", lineHeight:1.3 }}>{v.title}</div>
                        <div style={{ fontSize:".62rem", color:"#94a3b8", marginTop:".2rem" }}>{v.date}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:"1rem", border:"2px dashed #e2eaf2", borderRadius:10, padding:"1rem", textAlign:"center", background:uploadDone?"#f0fdf4":"transparent" }}>
                  {uploading ? (
                    <div style={{ color:"#2563eb", fontSize:".8rem", fontWeight:600 }}>⏳ Uploading...</div>
                  ) : uploadDone ? (
                    <div style={{ color:"#16a34a", fontSize:".8rem", fontWeight:600 }}>✅ Video uploaded! AI analysis in progress...</div>
                  ) : (
                    <>
                      <div style={{ fontSize:"1.5rem", marginBottom:".35rem" }}>📤</div>
                      <div style={{ fontWeight:600, fontSize:".8rem", color:"#1a2332" }}>Upload New Video</div>
                      <div style={{ fontSize:".7rem", color:"#94a3b8", marginTop:".2rem" }}>Click to upload</div>
                      <input type="file" accept="video/*" onChange={handleUpload} style={{ marginTop:".75rem", fontSize:".75rem" }} />
                    </>
                  )}
                </div>
              </div>

              {applications.length > 0 && (
                <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                    <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332" }}>💼 CV Applications</h3>
                    <span style={{ background:"#dbeafe", color:"#2563eb", fontSize:".62rem", fontWeight:700, padding:".15rem .5rem", borderRadius:4 }}>{applications.length} Applied</span>
                  </div>
                  <div style={{ maxHeight:280, overflowY:"auto", paddingRight:".25rem" }}>
                    {applications.map((app, i) => (
                      <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:".9rem", marginBottom:".75rem", border:"1px solid #e2eaf2" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".5rem", flexWrap:"wrap", gap:".5rem" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:".7rem", fontWeight:700 }}>
                              {app.club_name[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:".82rem", color:"#1a2332" }}>{app.club_name}</div>
                              <div style={{ fontSize:".68rem", color:"#94a3b8" }}>{app.position}</div>
                            </div>
                          </div>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontWeight:800, fontSize:"1.2rem", color: app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444" }}>{app.score}%</div>
                            <div style={{ fontSize:".62rem", fontWeight:600, color: app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444" }}>{app.status}</div>
                          </div>
                        </div>
                        <div style={{ height:6, background:"#e2eaf2", borderRadius:99, overflow:"hidden", marginBottom:".5rem" }}>
                          <div style={{ height:"100%", width:app.score+"%", background: app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444", borderRadius:99 }} />
                        </div>
                        {app.met_skills && (
                          <div style={{ fontSize:".68rem", color:"#64748b" }}>✅ Matched: <span style={{ color:"#10b981", fontWeight:600 }}>{app.met_skills}</span></div>
                        )}
                        <div style={{ fontSize:".62rem", color:"#94a3b8", marginTop:".3rem" }}>Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                  {applications.length > 2 && (
                    <div style={{ textAlign:"center", marginTop:".5rem", fontSize:".72rem", color:"#94a3b8" }}>↕ Scroll to see all {applications.length} applications</div>
                  )}
                </div>
              )}
            </div>

            {/* Nutrition & Exercise Plan */}
            {nutritionPlan && nutritionPlan.has_active_plan && (
              <NutritionSection plan={nutritionPlan} navigate={navigate} />
            )}
            {nutritionPlan && !nutritionPlan.has_active_plan && (
              <div style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.5rem", marginTop:"1.25rem", textAlign:"center" }}>
                <p style={{ color:"#64748b", marginBottom:"1rem" }}>No active nutrition plan</p>
                <button className="btn-orange" onClick={() => navigate('/nutrition')}>Create New Plan</button>
              </div>
            )}
          </>
        )}

        {/* ── CLUB SEARCH ── */}
        {active === "clubs" && (() => {
          const acceptedOffer = playerOffers.find(o => o.status === "accepted");
          const acceptedApp   = applications.find(a => a.status === "accepted");
          const alreadyInClub = !!(acceptedOffer || acceptedApp);
          const hasCvAnyClub  = cvApplications.length > 0;

          return (
            <div>
              {alreadyInClub && (
                <div style={{ background:"#dcfce7", border:"1px solid #86efac", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:".75rem" }}>
                  <span style={{ fontSize:"1.4rem" }}>🏆</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:".88rem", color:"#15803d" }}>You are already a member of a club</div>
                    <div style={{ fontSize:".75rem", color:"#16a34a", marginTop:".15rem" }}>You cannot join another club or send new requests</div>
                  </div>
                </div>
              )}

              {!alreadyInClub && hasCvAnyClub && (
                <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:".75rem" }}>
                  <span style={{ fontSize:"1.4rem" }}>📄</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:".88rem", color:"#1d4ed8" }}>Your CV has been submitted</div>
                    <div style={{ fontSize:".75rem", color:"#2563eb", marginTop:".15rem" }}>You cannot send manual requests after submitting your CV — wait for clubs to respond</div>
                  </div>
                </div>
              )}

              <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem" }}>
                <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>🏟️ Available Clubs</h3>
                {clubs.length === 0
                  ? <p style={{ color:"#94a3b8", fontSize:".78rem" }}>No clubs available</p>
                  : clubs.map((club, i) => {
                      const offerFromClub   = playerOffers.find(o => Number(o.club_id) === Number(club.id));
                      const hasPendingOffer = offerFromClub?.status === "pending";
                      const cvForThisClub   = cvApplications.some(a => Number(a.club_id) === Number(club.id));
                      const appForThisClub  = applications.find(a => Number(a.club_id) === Number(club.id));

                      return (
                        <div key={i} style={{
                          background: hasPendingOffer ? "#fffbeb" : "#f8fafc",
                          borderRadius:10, padding:".9rem", marginBottom:".75rem",
                          border: hasPendingOffer ? "1.5px solid #fcd34d" : "1px solid #e2eaf2",
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          flexWrap:"wrap", gap:".75rem"
                        }}>
                          <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
                            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:".85rem", flexShrink:0 }}>
                              {club.full_name?.[0]}
                            </div>
                            <div>
                              <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexWrap:"wrap" }}>
                                <span style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332" }}>{club.full_name}</span>
                                {hasPendingOffer && <span style={{ background:"#fef3c7", color:"#d97706", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20, border:"1px solid #fcd34d" }}>📨 Offer!</span>}
                                {offerFromClub?.status === "accepted" && <span style={{ background:"#dcfce7", color:"#16a34a", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20 }}>✅ Accepted</span>}
                                {offerFromClub?.status === "rejected" && <span style={{ background:"#fee2e2", color:"#dc2626", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20 }}>❌ Rejected</span>}
                                {cvForThisClub && <span style={{ background:"#eff6ff", color:"#2563eb", fontSize:".65rem", fontWeight:700, padding:".1rem .45rem", borderRadius:20 }}>📄 CV Submitted</span>}
                              </div>
                              <div style={{ fontSize:".72rem", color:"#94a3b8" }}>📍 {club.city || "—"} • {club.sport || "—"}</div>
                            </div>
                          </div>

                          <div style={{ display:"flex", alignItems:"center", gap:".5rem", flexWrap:"wrap" }}>
                            {hasPendingOffer && !alreadyInClub && !hasCvAnyClub && (
                              <div style={{ display:"flex", gap:6 }}>
                                <button onClick={() => respondToOffer(club.id, "accepted").then(() => { getPlayerOffers().then(r => { setPlayerOffers(r.data); saveCache({ playerOffers: r.data }); }); }).catch(() => {})}
                                  style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"#10b981", color:"white", fontWeight:700, fontSize:".7rem", cursor:"pointer" }}>✓ Accept</button>
                                <button onClick={() => respondToOffer(club.id, "rejected").then(() => { getPlayerOffers().then(r => { setPlayerOffers(r.data); saveCache({ playerOffers: r.data }); }); }).catch(() => {})}
                                  style={{ padding:"5px 12px", borderRadius:8, border:"none", background:"#ef4444", color:"white", fontWeight:700, fontSize:".7rem", cursor:"pointer" }}>✕ Reject</button>
                              </div>
                            )}

                            {alreadyInClub ? (
                              <span style={{ fontSize:".72rem", color:"#94a3b8", fontWeight:600 }}>Already in a club</span>
                            ) : cvForThisClub ? (
                              <span style={{ fontSize:".72rem", color:"#2563eb", fontWeight:600, background:"#eff6ff", padding:".3rem .7rem", borderRadius:8 }}>CV Submitted</span>
                            ) : hasCvAnyClub ? (
                              <span style={{ fontSize:".72rem", color:"#94a3b8", fontWeight:600 }}>CV submitted to another club</span>
                            ) : appForThisClub?.status === "accepted" ? (
                              <span style={{ fontSize:".72rem", color:"#10b981", fontWeight:700, background:"#dcfce7", padding:".3rem .7rem", borderRadius:8 }}>✅ Accepted</span>
                            ) : appForThisClub?.status === "rejected" ? (
                              <span style={{ fontSize:".72rem", color:"#ef4444", fontWeight:700, background:"#fee2e2", padding:".3rem .7rem", borderRadius:8 }}>❌ Rejected</span>
                            ) : appForThisClub ? (
                              <button className="btn-blue" style={{ fontSize:".72rem", padding:".4rem .8rem", background:"#94a3b8" }}
                                onClick={() => cancelApplication(club.id).then(() => getMyApplications().then(res => { setApplications(res.data); saveCache({ applications: res.data }); })).catch(() => {})}>
                                ✕ Cancel Request
                              </button>
                            ) : (
                              <button className="btn-blue" style={{ fontSize:".72rem", padding:".4rem .8rem" }}
                                onClick={() => applyToClub(club.id)
                                  .then(() => getMyApplications().then(res => { setApplications(res.data); saveCache({ applications: res.data }); }))
                                  .catch((err) => alert(err?.response?.data?.detail || "Failed to send request. Please try again."))}>
                                Join Request
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                }
              </div>

              <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
                <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332", marginBottom:"1rem" }}>📨 Club Offers</h3>
                {playerOffers.length === 0
                  ? <p style={{ color:"#94a3b8", fontSize:".78rem" }}>No offers yet</p>
                  : playerOffers.map((offer, i) => (
                      <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:".9rem", marginBottom:".75rem", border:"1px solid #e2eaf2", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:".75rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
                          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:".85rem", flexShrink:0 }}>
                            {offer.club_name?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332" }}>{offer.club_name}</div>
                            <div style={{ fontSize:".72rem", color:"#94a3b8" }}>Wants you to join the club</div>
                          </div>
                        </div>
                        {offer.status === "pending" ? (
                          alreadyInClub ? (
                            <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Already in a club</span>
                          ) : hasCvAnyClub ? (
                            <span style={{ fontSize:12, color:"#2563eb", fontWeight:600 }}>CV Submitted</span>
                          ) : (
                            <div style={{ display:"flex", gap:8 }}>
                              <button onClick={() => respondToOffer(offer.club_id, "accepted").then(() => getPlayerOffers().then(res => { setPlayerOffers(res.data); saveCache({ playerOffers: res.data }); })).catch(() => {})}
                                style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#10b981", color:"white", fontWeight:700, fontSize:12, cursor:"pointer" }}>✓ Accept</button>
                              <button onClick={() => respondToOffer(offer.club_id, "rejected").then(() => getPlayerOffers().then(res => { setPlayerOffers(res.data); saveCache({ playerOffers: res.data }); })).catch(() => {})}
                                style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#ef4444", color:"white", fontWeight:700, fontSize:12, cursor:"pointer" }}>✕ Reject</button>
                            </div>
                          )
                        ) : (
                          <span style={{ background: offer.status==="accepted"?"#dcfce7":"#fee2e2", color: offer.status==="accepted"?"#16a34a":"#dc2626", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700 }}>
                            {offer.status === "accepted" ? "✅ Accepted" : "❌ Rejected"}
                          </span>
                        )}
                      </div>
                    ))
                }
              </div>
            </div>
          );
        })()}

        {/* ── NOTIFICATIONS ── */}
        {active === "notifications" && (
          <div className="fu" style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:14, padding:"1.25rem" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", flexWrap:"wrap", gap:".5rem" }}>
              <h3 style={{ fontWeight:700, fontSize:".88rem", color:"#1a2332" }}>🔔 Notifications</h3>
              {playerNotifications.some(n => !n.is_read) && (
                <button
                  onClick={() => {
                    markAllNotifsRead()
                      .then(() => setPlayerNotifications(prev => prev.map(n => ({ ...n, is_read: true }))))
                      .catch(() => {});
                  }}
                  style={{ background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", padding:".3rem .8rem", borderRadius:6, fontSize:".72rem", fontWeight:600, cursor:"pointer" }}
                >Mark all as read</button>
              )}
            </div>
            {playerNotifications.length === 0
              ? <p style={{ color:"#94a3b8", fontSize:".78rem", textAlign:"center", padding:"2rem" }}>No notifications yet</p>
              : playerNotifications.map((n, i) => (
                  <div key={i} style={{ background: n.is_read?"#f8fafc":"#eff6ff", borderRadius:10, padding:".9rem", marginBottom:".75rem", border: n.is_read?"1px solid #e2eaf2":"1px solid #bfdbfe", display:"flex", alignItems:"center", gap:"1rem" }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background: n.type==="accepted"?"#dcfce7":n.type==="rejected"?"#fee2e2":"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>
                      {n.type==="accepted" ? "✅" : n.type==="rejected" ? "❌" : "📋"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:".82rem", color:"#1a2332" }}>{n.title}</div>
                      <div style={{ fontSize:".75rem", color:"#64748b", marginTop:".2rem" }}>{n.message}</div>
                      <div style={{ fontSize:".65rem", color:"#94a3b8", marginTop:".2rem" }}>{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                    {!n.is_read && <div style={{ width:8, height:8, borderRadius:"50%", background:"#2563eb", flexShrink:0 }} />}
                  </div>
                ))
            }
          </div>
        )}

      </div>
    </div>
  );
}