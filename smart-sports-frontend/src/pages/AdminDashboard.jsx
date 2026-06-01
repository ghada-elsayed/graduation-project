// import { useState } from "react";

// const STATS = [
//   { label: "Total Athletes",   value: "12,458", change: "+12.5%", color: "#2563eb" },
//   { label: "Total Coaches",    value: "1,847",  change: "+10.2%", color: "#8b5cf6" },
//   { label: "Registered Clubs", value: "324",    change: "+8.1%",  color: "#f97316" },
//   { label: "Uploaded Videos",  value: "45,892", change: "+18.2%", color: "#10b981" },
//   { label: "AI Analyses",      value: "38,521", change: "+24.7%", color: "#f59e0b" },
//   { label: "Active Sessions",  value: "2,847",  change: "+3.8%",  color: "#ef4444" },
// ];

// const ACTIVITY = [
//   { name: "Susan Johnson",  action: "Uploaded new training video",      time: "2 min ago",  color: "#2563eb" },
//   { name: "Mike Chen",      action: "Requested AI performance analysis", time: "6 min ago",  color: "#8b5cf6" },
//   { name: "Emily Davis",    action: "New coach registration",            time: "12 min ago", color: "#10b981" },
//   { name: "Alex Martinez",  action: "Uploaded training sessions",        time: "20 min ago", color: "#f97316" },
//   { name: "Champions FC",   action: "New club registration",             time: "31 min ago", color: "#ef4444" },
// ];

// const SYSTEM = [
//   { label: "API Status",  status: "Operational", color: "#10b981" },
//   { label: "Database",    status: "Healthy",     color: "#10b981" },
//   { label: "AI Services", status: "Online",      color: "#10b981" },
//   { label: "Storage",     status: "78% Used",    color: "#f97316" },
// ];

// const USERS = [
//   { name: "Sarah Johnson",  email: "sarah@example.com",  role: "Athlete", joined: "Oct 15, 2024", status: "Active"   },
//   { name: "Mike Thompson",  email: "mike@example.com",   role: "Coach",   joined: "Nov 3, 2024",  status: "Active"   },
//   { name: "Emily Parker",   email: "emily@example.com",  role: "Athlete", joined: "Nov 18, 2024", status: "Inactive" },
//   { name: "David Martinez", email: "david@example.com",  role: "Club",    joined: "Dec 5, 2024",  status: "Active"   },
//   { name: "Jessica Adams",  email: "jessica@example.com",role: "Athlete", joined: "Dec 16, 2024", status: "Active"   },
// ];

// const NAV = ["Dashboard","Users","Videos","AI Analytics","Reports","Settings"];

// export default function AdminDashboard() {
//   const [active, setActive] = useState("Dashboard");
//   const [search, setSearch] = useState("");

//   const filtered = USERS.filter(u =>
//     u.name.toLowerCase().includes(search.toLowerCase()) ||
//     u.email.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div style={{ display:"flex", minHeight:"100vh", background:"#0f1923", fontFamily:"Segoe UI,sans-serif", color:"#e2e8f0" }}>
//       <style>{`
//         * { box-sizing:border-box; margin:0; padding:0; }
//         .si { padding:.65rem 1rem; border-radius:10px; cursor:pointer; color:#64748b; font-size:.82rem; font-weight:500; margin-bottom:.2rem; transition:all .2s; }
//         .si:hover { background:rgba(238, 237, 237, 0.05); color:#e2e8f0; }
//         .si.on { background:rgba(37,99,235,.18); color:#60a5fa; }
//         .sc { background:#1a2536; border:1px solid #1e3048; border-radius:14px; padding:1.2rem; transition:all .2s; }
//         .sc:hover { border-color:#2563eb; transform:translateY(-2px); }
//         .card { background:#1a2536; border:1px solid #1e3048; border-radius:14px; padding:1.2rem; }
//         .bb { background:#2563eb; color:white; border:none; padding:.48rem .95rem; border-radius:8px; font-weight:600; font-size:.76rem; cursor:pointer; }
//         .bo { background:transparent; color:#94a3b8; border:1px solid #1e3048; padding:.48rem .95rem; border-radius:8px; font-weight:600; font-size:.76rem; cursor:pointer; }
//         .bo:hover { border-color:#2563eb; color:#60a5fa; }
//         .fi { background:#0f1923; border:1px solid #1e3048; border-radius:8px; padding:.52rem .9rem; font-size:.8rem; color:#e2e8f0; outline:none; }
//         .fi::placeholder { color:#334155; }
//         .tr { border-bottom:1px solid #1e3048; }
//         .tr:hover { background:rgba(255,255,255,.02); }
//         .bdg { display:inline-block; padding:.18rem .52rem; border-radius:4px; font-size:.62rem; font-weight:700; }
//       `}</style>

//       {/* SIDEBAR */}
//       <div style={{ width:210, background:"#111827", borderRight:"1px solid #1e3048", display:"flex", flexDirection:"column", padding:"1.2rem .75rem", flexShrink:0, height:"100vh", position:"sticky", top:0 }}>
//         <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"1.75rem", padding:".5rem .25rem" }}>
//           <div style={{ width:32, height:32, background:"linear-gradient(135deg,#2563eb,#f97316)", borderRadius:8, fontWeight:900, color:"white", fontSize:".75rem", display:"flex", alignItems:"center", justifyContent:"center" }}>SP</div>
//           <div>
//             <div style={{ fontWeight:800, fontSize:".85rem", color:"#e2e8f0" }}>SportsPro</div>
//             <div style={{ fontSize:".58rem", color:"#64748b" }}>Admin Panel</div>
//           </div>
//         </div>

//         {NAV.map(item => (
//           <div key={item} className={"si" + (active===item?" on":"")} onClick={() => setActive(item)}>{item}</div>
//         ))}

//         <div style={{ marginTop:"auto", padding:".75rem .25rem", borderTop:"1px solid #1e3048" }}>
//           <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
//             <div style={{ width:30, height:30, background:"linear-gradient(135deg,#2563eb,#8b5cf6)", borderRadius:"50%", fontWeight:800, color:"white", fontSize:".8rem", display:"flex", alignItems:"center", justifyContent:"center" }}>A</div>
//             <div>
//               <div style={{ fontWeight:700, fontSize:".75rem", color:"#e2e8f0" }}>Admin User</div>
//               <div style={{ fontSize:".6rem", color:"#64748b" }}>admin@sportspro.com</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MAIN */}
//       <div style={{ flex:1, overflowY:"auto", padding:"1.75rem" }}>

//         {active === "Dashboard" && (
//           <>
//             <h1 style={{ fontWeight:800, fontSize:"1.3rem", color:"#e2e8f0", marginBottom:".3rem" }}>Dashboard Overview</h1>
//             <p style={{ color:"#64748b", fontSize:".78rem", marginBottom:"1.5rem" }}>Monitor your smart sports platform performance and metrics</p>

//             <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.25rem" }}>
//               {STATS.map((s,i) => (
//                 <div key={i} className="sc">
//                   <div style={{ fontSize:".7rem", color:"#64748b", fontWeight:600, marginBottom:".6rem" }}>{s.label}</div>
//                   <div style={{ fontWeight:800, fontSize:"1.35rem", color:"#e2e8f0", marginBottom:".25rem" }}>{s.value}</div>
//                   <div style={{ fontSize:".65rem", color:"#10b981", fontWeight:600 }}>{s.change} vs last month</div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", marginBottom:"1.25rem" }}>
//               <div className="card">
//                 <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#e2e8f0", marginBottom:".75rem" }}>User Growth Trend</h3>
//                 <div style={{ display:"flex", alignItems:"flex-end", gap:".35rem", height:80 }}>
//                   {[40,55,45,70,60,80,75,90,85,95,88,100].map((h,i) => (
//                     <div key={i} style={{ flex:1, background:"rgba(37,99,235,.4)", borderRadius:"3px 3px 0 0", height:h+"%" }} />
//                   ))}
//                 </div>
//               </div>
//               <div className="card">
//                 <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#e2e8f0", marginBottom:".75rem" }}>AI Analysis and Video Activity</h3>
//                 <div style={{ display:"flex", alignItems:"flex-end", gap:".35rem", height:80 }}>
//                   {[30,60,45,80,55,90,70,85,65,95,75,100].map((h,i) => (
//                     <div key={i} style={{ flex:1, background:"rgba(249,115,22,.4)", borderRadius:"3px 3px 0 0", height:h+"%" }} />
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"1.25rem" }}>
//               <div className="card">
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
//                   <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#e2e8f0" }}>Recent Activity</h3>
//                   <button className="bo">View All</button>
//                 </div>
//                 {ACTIVITY.map((a,i) => (
//                   <div key={i} style={{ display:"flex", alignItems:"center", gap:".65rem", padding:".55rem 0", borderBottom:"1px solid #1e3048" }}>
//                     <div style={{ width:26, height:26, background:a.color+"30", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".68rem", fontWeight:700, color:a.color, flexShrink:0 }}>{a.name[0]}</div>
//                     <div style={{ flex:1 }}>
//                       <span style={{ fontWeight:600, fontSize:".75rem", color:"#e2e8f0" }}>{a.name}</span>
//                       <span style={{ fontSize:".72rem", color:"#64748b" }}> - {a.action}</span>
//                     </div>
//                     <span style={{ fontSize:".6rem", color:"#475569", flexShrink:0 }}>{a.time}</span>
//                   </div>
//                 ))}
//               </div>

//               <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
//                 <div className="card">
//                   <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#e2e8f0", marginBottom:".85rem" }}>System Status</h3>
//                   {SYSTEM.map((s,i) => (
//                     <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".42rem 0", borderBottom: i<SYSTEM.length-1?"1px solid #1e3048":"none" }}>
//                       <span style={{ fontSize:".76rem", color:"#94a3b8" }}>{s.label}</span>
//                       <div style={{ display:"flex", alignItems:"center", gap:".3rem" }}>
//                         <div style={{ width:6, height:6, borderRadius:"50%", background:s.color }} />
//                         <span style={{ fontSize:".7rem", color:s.color, fontWeight:600 }}>{s.status}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="card">
//                   <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#e2e8f0", marginBottom:".85rem" }}>Quick Actions</h3>
//                   <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
//                     <button className="bb" style={{ width:"100%" }}>Export Data</button>
//                     <button className="bo" style={{ width:"100%" }}>Clear Cache</button>
//                     <button style={{ background:"rgba(239,68,68,.12)", color:"#ef4444", border:"1px solid rgba(239,68,68,.25)", padding:".48rem", borderRadius:8, fontWeight:600, fontSize:".76rem", cursor:"pointer", width:"100%" }}>Backup Now</button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}

//         {active === "Users" && (
//           <>
//             <h1 style={{ fontWeight:800, fontSize:"1.3rem", color:"#e2e8f0", marginBottom:".3rem" }}>Admin Management</h1>
//             <p style={{ color:"#64748b", fontSize:".78rem", marginBottom:"1.5rem" }}>Manage and view all platform users</p>
//             <div style={{ display:"flex", gap:"1rem", marginBottom:"1.25rem" }}>
//               {[["Athletes","8","#2563eb"],["Coaches","3","#8b5cf6"],["Clubs","3","#f97316"],["Individual","2","#10b981"]].map(([l,v,c],i) => (
//                 <div key={i} className="sc" style={{ flex:1, textAlign:"center" }}>
//                   <div style={{ fontSize:"1.4rem", fontWeight:800, color:c }}>{v}</div>
//                   <div style={{ fontSize:".7rem", color:"#64748b", marginTop:".2rem" }}>{l}</div>
//                 </div>
//               ))}
//             </div>
//             <div className="card">
//               <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
//                 <input className="fi" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:280 }} />
//                 <div style={{ display:"flex", gap:".5rem" }}>
//                   <button className="bo">All Roles</button>
//                   <button className="bo">All Status</button>
//                 </div>
//               </div>
//               <table style={{ width:"100%", borderCollapse:"collapse" }}>
//                 <thead>
//                   <tr style={{ borderBottom:"1px solid #1e3048" }}>
//                     {["Name","Email","Role","Joined","Status","Actions"].map(h => (
//                       <th key={h} style={{ textAlign:"left", padding:".55rem .75rem", fontSize:".7rem", color:"#64748b", fontWeight:600 }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((u,i) => (
//                     <tr key={i} className="tr">
//                       <td style={{ padding:".65rem .75rem" }}>
//                         <div style={{ display:"flex", alignItems:"center", gap:".55rem" }}>
//                           <div style={{ width:26, height:26, background:"linear-gradient(135deg,#2563eb,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".68rem", fontWeight:700, color:"white" }}>{u.name[0]}</div>
//                           <span style={{ fontSize:".8rem", fontWeight:600, color:"#e2e8f0" }}>{u.name}</span>
//                         </div>
//                       </td>
//                       <td style={{ padding:".65rem .75rem", fontSize:".76rem", color:"#94a3b8" }}>{u.email}</td>
//                       <td style={{ padding:".65rem .75rem" }}>
//                         <span className="bdg" style={{ background:u.role==="Athlete"?"rgba(37,99,235,.15)":u.role==="Coach"?"rgba(139,92,246,.15)":"rgba(249,115,22,.15)", color:u.role==="Athlete"?"#60a5fa":u.role==="Coach"?"#a78bfa":"#fb923c" }}>{u.role}</span>
//                       </td>
//                       <td style={{ padding:".65rem .75rem", fontSize:".73rem", color:"#64748b" }}>{u.joined}</td>
//                       <td style={{ padding:".65rem .75rem" }}>
//                         <span className="bdg" style={{ background:u.status==="Active"?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)", color:u.status==="Active"?"#10b981":"#ef4444" }}>{u.status}</span>
//                       </td>
//                       <td style={{ padding:".65rem .75rem" }}>
//                         <div style={{ display:"flex", gap:".4rem" }}>
//                           <button className="bo" style={{ padding:".28rem .55rem", fontSize:".65rem" }}>Edit</button>
//                           <button style={{ background:"rgba(239,68,68,.1)", color:"#ef4444", border:"1px solid rgba(239,68,68,.2)", padding:".28rem .55rem", borderRadius:6, fontSize:".65rem", cursor:"pointer" }}>Del</button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}

//         {active !== "Dashboard" && active !== "Users" && (
//           <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:"1rem" }}>
//             <div style={{ fontSize:"3rem" }}>🚧</div>
//             <h2 style={{ color:"#e2e8f0", fontWeight:700 }}>Coming Soon</h2>
//             <p style={{ color:"#64748b", fontSize:".85rem" }}>This section is under development</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }













import {useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
// import API from '../services/api';
import { getAllUsers, getAdminStats, getGrowthStats, deleteUser, updateUser } from '../services/api';

const ACTIVITY = [
  { name: "Susan Johnson",  action: "Uploaded new training video",      time: "2 min ago",  color: "#2563eb" },
  { name: "Mike Chen",      action: "Requested AI performance analysis", time: "6 min ago",  color: "#8b5cf6" },
  { name: "Emily Davis",    action: "New coach registration",            time: "12 min ago", color: "#10b981" },
  { name: "Alex Martinez",  action: "Uploaded training sessions",        time: "20 min ago", color: "#f97316" },
  { name: "Champions FC",   action: "New club registration",             time: "31 min ago", color: "#ef4444" },
];

const SYSTEM = [
  { label: "API Status",  status: "Operational", color: "#10b981" },
  { label: "Database",    status: "Healthy",     color: "#10b981" },
  { label: "AI Services", status: "Online",      color: "#10b981" },
  { label: "Storage",     status: "78% Used",    color: "#f97316" },
];

// const USERS = [
//   { name: "Sarah Johnson",  email: "sarah@example.com",  role: "Athlete", joined: "Oct 15, 2024", status: "Active"   },
//   { name: "Mike Thompson",  email: "mike@example.com",   role: "Coach",   joined: "Nov 3, 2024",  status: "Active"   },
//   { name: "Emily Parker",   email: "emily@example.com",  role: "Athlete", joined: "Nov 18, 2024", status: "Inactive" },
//   { name: "David Martinez", email: "david@example.com",  role: "Club",    joined: "Dec 5, 2024",  status: "Active"   },
//   { name: "Jessica Adams",  email: "jessica@example.com",role: "Athlete", joined: "Dec 16, 2024", status: "Active"   },
// ];

const NAV = ["Dashboard","Users","Videos","AI Analytics","Reports","Settings"];

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState({total_players: 0, total_clubs: 0, total_users: 0});
  const [growthData, setGrowthData] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: "", password: "", role: "" });

  const filtered = users.filter(u =>
  u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
  u.email?.toLowerCase().includes(search.toLowerCase())
);




  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }


    getAdminStats()
  .then(res => setStats(res.data))
  .catch(() => {});

getGrowthStats()
.then(res => setGrowthData(res.data))
.catch(() => {});

   // جيب الـ users من الـ API
  getAllUsers()
    .then(res => {
      setUsers(res.data);
      setLoadingUsers(false);
    })
    .catch(() => navigate('/login'));
}, [navigate]);






const STATS = [
  { label: "Total Athletes",   value: stats.total_players, change: "+12.5%", color: "#2563eb" },
  { label: "Registered Clubs", value: stats.total_clubs,   change: "+8.1%",  color: "#f97316" },
  { label: "Total Users",      value: stats.total_users,   change: "+10.2%", color: "#8b5cf6" },
  { label: "Uploaded Videos",  value: "—", change: "—", color: "#10b981" },
  { label: "AI Analyses",      value: "—", change: "—", color: "#f59e0b" },
  { label: "Active Sessions",  value: "—", change: "—", color: "#ef4444" },
];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f5f7fa", fontFamily:"Segoe UI,sans-serif", color:"#1a2332" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .si { padding:.65rem 1rem; border-radius:10px; cursor:pointer; color:#64748b; font-size:.82rem; font-weight:500; margin-bottom:.2rem; transition:all .2s; }
        .si:hover { background:#f0f4f8; color:#1e3a5f; }
        .si.on { background:#dbeafe; color:#2563eb; font-weight:700; }
        .sc { background:white; border:1px solid #e2eaf2; border-radius:14px; padding:1.2rem; transition:all .2s; }
        .sc:hover { border-color:#2563eb; transform:translateY(-2px); box-shadow:0 4px 16px rgba(37,99,235,.1); }
        .card { background:white; border:1px solid #e2eaf2; border-radius:14px; padding:1.2rem; }
        .bb { background:#2563eb; color:white; border:none; padding:.48rem .95rem; border-radius:8px; font-weight:600; font-size:.76rem; cursor:pointer; }
        .bb:hover { background:#1d4ed8; }
        .bo { background:transparent; color:#64748b; border:1px solid #e2eaf2; padding:.48rem .95rem; border-radius:8px; font-weight:600; font-size:.76rem; cursor:pointer; }
        .bo:hover { border-color:#2563eb; color:#2563eb; }
        .fi { background:#f8fafc; border:1px solid #e2eaf2; border-radius:8px; padding:.52rem .9rem; font-size:.8rem; color:#1a2332; outline:none; }
        .fi:focus { border-color:#2563eb; }
        .fi::placeholder { color:#cbd5e1; }
        .tr { border-bottom:1px solid #f0f4f8; }
        .tr:hover { background:#f8fafc; }
        .bdg { display:inline-block; padding:.18rem .52rem; border-radius:4px; font-size:.62rem; font-weight:700; }
      `}</style>


      {/* Edit Modal */}
      {editUser && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"white", borderRadius:16, padding:"2rem", width:"100%", maxWidth:400, boxShadow:"0 8px 40px rgba(0,0,0,.15)" }}>
                <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a2332", marginBottom:"1.25rem" }}>Edit User: {editUser.full_name}</h3>
                
                {[["Full Name", "full_name", "text"], ["Email", "email", "text"], ["New Password", "password", "password"]].map(([label, key, type]) => (
                    <div key={key} style={{ marginBottom:"1rem" }}>
                        <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>{label}</label>
                        <input
                            type={type}
                            placeholder={label}
                            value={editForm[key] || ""}
                            onChange={e => setEditForm(prev => ({...prev, [key]: e.target.value}))}
                            style={{ width:"100%", padding:".7rem .9rem", border:"1.5px solid #e2eaf2", borderRadius:8, fontSize:".88rem", outline:"none" }}
                        />
                    </div>
                ))}

                <div style={{ marginBottom:"1.25rem" }}>
                    <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>Role</label>
                    <select
                        value={editForm.role}
                        onChange={e => setEditForm(prev => ({...prev, role: e.target.value}))}
                        style={{ width:"100%", padding:".7rem .9rem", border:"1.5px solid #e2eaf2", borderRadius:8, fontSize:".88rem", outline:"none" }}
                    >
                        <option value="">-- Select Role --</option>
                        <option value="player">Player</option>
                        <option value="admin">Admin (Club)</option>
                    </select>
                </div>

                <div style={{ display:"flex", gap:".75rem" }}>
                    <button
                        onClick={() => {
                            updateUser(editUser.id, editForm)
                                .then(() => {
                                    setUsers(prev => prev.map(u => u.id === editUser.id ? {...u, ...editForm} : u));
                                    setEditUser(null);
                                    setEditForm({ full_name: "", email: "", password: "", role: "" });
                                })
                                .catch(() => alert("فشل التعديل"));
                        }}
                        style={{ flex:1, background:"#2563eb", color:"white", border:"none", padding:".75rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}
                    >Save Changes</button>
                    <button
                        onClick={() => { setEditUser(null); setEditForm({ full_name: "", email: "", password: "", role: "" }); }}
                        style={{ padding:".75rem 1rem", borderRadius:8, border:"1px solid #e2eaf2", background:"white", color:"#64748b", fontWeight:600, cursor:"pointer" }}
                    >Cancel</button>
                </div>
            </div>
        </div>
    )}

      {/* SIDEBAR */}
      <div style={{ width:220, background:"white", borderRight:"1px solid #e2eaf2", display:"flex", flexDirection:"column", padding:"1.2rem .75rem", flexShrink:0, height:"100vh", position:"sticky", top:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"1.75rem", padding:".5rem .25rem" }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:10, fontWeight:900, color:"white", fontSize:".75rem", display:"flex", alignItems:"center", justifyContent:"center" }}>SP</div>
          <div>
            <div style={{ fontWeight:800, fontSize:".88rem", color:"#1a2332" }}>SportsPro</div>
            <div style={{ fontSize:".58rem", color:"#94a3b8" }}>Admin Panel</div>
          </div>
        </div>

        {NAV.map(item => (
          <div key={item} className={"si" + (active===item?" on":"")} onClick={() => setActive(item)}>{item}</div>
        ))}

        <div style={{ marginTop:"auto", padding:".75rem .25rem", borderTop:"1px solid #e2eaf2" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:32, height:32, background:"linear-gradient(135deg,#2563eb,#8b5cf6)", borderRadius:"50%", fontWeight:800, color:"white", fontSize:".8rem", display:"flex", alignItems:"center", justifyContent:"center" }}>A</div>
            <div>
              <div style={{ fontWeight:700, fontSize:".78rem", color:"#1a2332" }}>Admin User</div>
              <div style={{ fontSize:".6rem", color:"#94a3b8" }}>admin@sportspro.com</div>
            </div>
          </div>
          <div>
          <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          style={{
            background:"#ef4444",
            color:"white",
            border:"none",
            padding:".3rem .7rem",
            borderRadius:6,
            fontSize:".68rem",
            fontWeight:700,
            cursor:"pointer",
            marginTop:".65rem",
            width:"100%",
            }}
            >
              Logout
              </button>
              </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, overflowY:"auto", padding:"1.75rem" }}>

        {/* ── DASHBOARD ── */}
        {active === "Dashboard" && (
          <>
            <h1 style={{ fontWeight:800, fontSize:"1.3rem", color:"#1a2332", marginBottom:".3rem" }}>Dashboard Overview</h1>
            <p style={{ color:"#64748b", fontSize:".78rem", marginBottom:"1.5rem" }}>Monitor your smart sports platform performance and metrics</p>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.25rem" }}>
              {STATS.map((s,i) => (
                <div key={i} className="sc">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".6rem" }}>
                    <div style={{ fontSize:".7rem", color:"#64748b", fontWeight:600 }}>{s.label}</div>
                    <div style={{ width:28, height:28, background:s.color+"15", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:s.color }} />
                    </div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:"1.35rem", color:"#1a2332", marginBottom:".25rem" }}>{s.value}</div>
                  <div style={{ fontSize:".65rem", color:"#10b981", fontWeight:600 }}>{s.change} vs last month</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", marginBottom:"1.25rem" }}>
              <div className="card">
                <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332", marginBottom:".75rem" }}>User Growth Trend</h3>
                <div style={{ display:"flex", alignItems:"flex-end", gap:".35rem", height:80 }}>
  {growthData.length > 0
    ? growthData.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontSize:8, color:"#94a3b8" }}>{d.count}</span>
          <div style={{
            width:"100%",
            background: d.role === "player" ? "rgba(37,99,235,.4)" : "rgba(249,115,22,.4)",
            borderRadius:"3px 3px 0 0",
            height: `${(d.count / Math.max(...growthData.map(x=>x.count))) * 100}%`,
            minHeight: 4
          }} />
          <span style={{ fontSize:8, color:"#94a3b8" }}>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.month-1]}
            {" "}{d.role === "player" ? "🔵" : "🟠"}
          </span>
        </div>
      ))
    : <div style={{ color:"#94a3b8", fontSize:12, margin:"auto" }}>No data yet</div>
  }
</div>
                <div style={{ display:"flex", gap:"1rem", marginTop:".65rem" }}>
                  {[["Athletes","#2563eb"],["Clubs","#f97316"],["Coaches","#8b5cf6"]].map(([l,c]) => (
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:".3rem" }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:c }} />
                      <span style={{ fontSize:".62rem", color:"#64748b" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332", marginBottom:".75rem" }}>AI Analysis and Video Activity</h3>
                <div style={{ display:"flex", alignItems:"flex-end", gap:".35rem", height:80 }}>
                  {[30,60,45,80,55,90,70,85,65,95,75,100].map((h,i) => (
                    <div key={i} style={{ flex:1, background:"rgba(249,115,22,.2)", borderRadius:"3px 3px 0 0", height:h+"%" }} />
                  ))}
                </div>
                <div style={{ display:"flex", gap:"1rem", marginTop:".65rem" }}>
                  {[["AI Analyses","#f97316"],["Videos","#10b981"]].map(([l,c]) => (
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:".3rem" }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:c }} />
                      <span style={{ fontSize:".62rem", color:"#64748b" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"1.25rem" }}>
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                  <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332" }}>Recent Activity</h3>
                  <button className="bo">View All</button>
                </div>
                {ACTIVITY.map((a,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:".65rem", padding:".55rem 0", borderBottom:"1px solid #f0f4f8" }}>
                    <div style={{ width:28, height:28, background:a.color+"15", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem", fontWeight:700, color:a.color, flexShrink:0 }}>{a.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight:600, fontSize:".75rem", color:"#1a2332" }}>{a.name}</span>
                      <span style={{ fontSize:".72rem", color:"#64748b" }}> - {a.action}</span>
                    </div>
                    <span style={{ fontSize:".6rem", color:"#94a3b8", flexShrink:0 }}>{a.time}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div className="card">
                  <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332", marginBottom:".85rem" }}>System Status</h3>
                  {SYSTEM.map((s,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".42rem 0", borderBottom:i<SYSTEM.length-1?"1px solid #f0f4f8":"none" }}>
                      <span style={{ fontSize:".76rem", color:"#64748b" }}>{s.label}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:".3rem" }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:s.color }} />
                        <span style={{ fontSize:".7rem", color:s.color, fontWeight:600 }}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ fontWeight:700, fontSize:".85rem", color:"#1a2332", marginBottom:".85rem" }}>Quick Actions</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
                    <button className="bb" style={{ width:"100%" }}>Export Data</button>
                    <button className="bo" style={{ width:"100%" }}>Clear Cache</button>
                    <button style={{ background:"rgba(239,68,68,.08)", color:"#ef4444", border:"1px solid rgba(239,68,68,.2)", padding:".48rem", borderRadius:8, fontWeight:600, fontSize:".76rem", cursor:"pointer", width:"100%" }}>Backup Now</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {active === "Users" && (
          <>
            <h1 style={{ fontWeight:800, fontSize:"1.3rem", color:"#1a2332", marginBottom:".3rem" }}>Admin Management</h1>
            <p style={{ color:"#64748b", fontSize:".78rem", marginBottom:"1.5rem" }}>Manage and view all platform users</p>

            <div style={{ display:"flex", gap:"1rem", marginBottom:"1.25rem" }}>
              {[
                ["Athletes", users.filter(u => u.role === "player").length, "#2563eb"],
                ["Clubs",    users.filter(u => u.role === "admin").length,  "#f97316"],
                ["Total",    users.length, "#8b5cf6"],
              ].map(([l,v,c],i) => (
                <div key={i} className="sc" style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:"1.4rem", fontWeight:800, color:c }}>{v}</div>
                  <div style={{ fontSize:".7rem", color:"#64748b", marginTop:".2rem" }}>{l}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <input className="fi" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:280 }} />
                <div style={{ display:"flex", gap:".5rem" }}>
                  <button className="bo">All Roles</button>
                  <button className="bo">All Status</button>
                </div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #e2eaf2" }}>
                    {["Name","Email","Role","Joined","Status","Actions"].map(h => (
                      <th key={h} style={{ textAlign:"left", padding:".55rem .75rem", fontSize:".7rem", color:"#94a3b8", fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={i} className="tr">
                      <td style={{ padding:".65rem .75rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:".55rem" }}>
                          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#2563eb,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem", fontWeight:700, color:"white" }}>
                            {u.full_name?.[0]}
                          </div>
                          <span style={{ fontSize:".8rem", fontWeight:600, color:"#1a2332" }}>{u.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding:".65rem .75rem", fontSize:".76rem", color:"#64748b" }}>{u.email}</td>
                      <td style={{ padding:".65rem .75rem" }}>
                        <span className="bdg" style={{
                          background: u.role==="player"?"#dbeafe": u.role==="admin"?"#ffedd5":"#dcfce7",
                          color: u.role==="player"?"#2563eb": u.role==="admin"?"#ea580c":"#16a34a"
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding:".65rem .75rem", fontSize:".73rem", color:"#94a3b8" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding:".65rem .75rem" }}>
                        <span className="bdg" style={{ background:"#dcfce7", color:"#16a34a" }}>Active</span>
                      </td>
                      <td style={{ padding:".65rem .75rem" }}>
                        <div style={{ display:"flex", gap:".4rem" }}>
                          <button
                              className="bo"
                              style={{ padding:".28rem .6rem", fontSize:".65rem" }}
                              onClick={() => {
                                  setEditUser(u);
                                  setEditForm({ email: u.email, password: "", role: u.role });
                              }}
                          >Edit</button>
                          <button
                              onClick={() => {
                                  if (window.confirm(`Delete? ${u.full_name}`)) {
                                      deleteUser(u.id)
                                          .then(() => setUsers(prev => prev.filter(x => x.id !== u.id)))
                                          .catch(() => alert("فشل الحذف"));
                                  }
                              }}
                              style={{ background:"#fee2e2", color:"#dc2626", border:"none", padding:".28rem .6rem", borderRadius:6, fontSize:".65rem", cursor:"pointer", fontWeight:600 }}
                          >Del</button>                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active !== "Dashboard" && active !== "Users" && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:"1rem" }}>
            <div style={{ fontSize:"3rem" }}>🚧</div>
            <h2 style={{ color:"#1a2332", fontWeight:700 }}>Coming Soon</h2>
            <p style={{ color:"#64748b", fontSize:".85rem" }}>This section is under development</p>
          </div>
        )}
      </div>
    </div>
  );
}