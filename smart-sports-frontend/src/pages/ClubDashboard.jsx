// import { useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import { getMe, getAllPlayers, getNotifications, markNotifRead, markAllNotifsRead, getClubRequests, updateRequestStatus, getMyClubPlayers, createJobOffer, getMyOffers, deleteJobOffer, offerPlayer, getSentOffers, cancelOffer, removePlayerFromClub } from '../services/api';

// function load(key, fallback) {
// try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
// catch { return fallback; }
// }
// function save(key, value) {
// try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
// }

// const themes = {
// dark: {
// bg:"#0f1117",sidebar:"#13151e",card:"#1a1d2e",cardAlt:"#1e2235",
// border:"#2a2d3e",text:"#e8eaf6",textMuted:"#7b7f9e",textSub:"#4a4f6a",
// accent:"#6c63ff",accentGlow:"rgba(108,99,255,0.18)",green:"#00e676",
// blue:"#29b6f6",orange:"#ffa726",red:"#ef5350",
// navHover:"#23263a",btnPrimary:"linear-gradient(135deg,#6c63ff,#8b5cf6)",
// matchGreen:"#00e676",tagBg:"#23263a",tagText:"#9fa4c4",
// scrollbar:"#2a2d3e",shadow:"0 4px 32px rgba(0,0,0,0.4)",
// progressBg:"#2a2d3e",inputBg:"#1e2235",inputBorder:"#2a2d3e",
// },
// light: {
// bg:"#f0f2fa",sidebar:"#ffffff",card:"#ffffff",cardAlt:"#f7f8fc",
// border:"#e2e5f1",text:"#1a1d2e",textMuted:"#6b7280",textSub:"#9ca3af",
// accent:"#6c63ff",accentGlow:"rgba(108,99,255,0.10)",green:"#10b981",
// blue:"#3b82f6",orange:"#f59e0b",red:"#ef4444",
// navHover:"#f0f2fa",btnPrimary:"linear-gradient(135deg,#6c63ff,#8b5cf6)",
// matchGreen:"#10b981",tagBg:"#ede9fe",tagText:"#6c63ff",
// scrollbar:"#e2e5f1",shadow:"0 4px 32px rgba(108,99,255,0.07)",
// progressBg:"#e2e5f1",inputBg:"#f7f8fc",inputBorder:"#e2e5f1",
// },
// };

// const ALL_ATHLETES = [
// {id:1,initials:"MS",color:"#6c63ff",name:"Marcus Silva",role:"Forward",age:19,location:"São Paulo, Brazil",match:98,tags:["Speed","Dribbling","Finishing"],goals:24,assists:12,matches:31,nationality:"🇧🇷",height:"1.82m",foot:"Right"},
// {id:2,initials:"ER",color:"#00b4d8",name:"Emma Rodriguez",role:"Midfielder",age:20,location:"Madrid, Spain",match:94,tags:["Passing","Vision","Technique"],goals:8,assists:19,matches:28,nationality:"🇪🇸",height:"1.68m",foot:"Left"},
// {id:3,initials:"JT",color:"#f59e0b",name:"James Thompson",role:"Defender",age:21,location:"London, UK",match:92,tags:["Tackling","Positioning","Heading"],goals:3,assists:5,matches:30,nationality:"🇬🇧",height:"1.88m",foot:"Right"},
// {id:4,initials:"AK",color:"#10b981",name:"Ahmed Karim",role:"Forward",age:18,location:"Cairo, Egypt",match:89,tags:["Speed","Finishing","Agility"],goals:18,assists:7,matches:25,nationality:"🇪🇬",height:"1.78m",foot:"Right"},
// {id:5,initials:"LP",color:"#f43f5e",name:"Lucas Petit",role:"Goalkeeper",age:22,location:"Paris, France",match:87,tags:["Reflexes","Positioning","Distribution"],goals:0,assists:1,matches:26,nationality:"🇫🇷",height:"1.92m",foot:"Right"},
// {id:6,initials:"YN",color:"#8b5cf6",name:"Yuki Nakamura",role:"Midfielder",age:20,location:"Tokyo, Japan",match:85,tags:["Technique","Vision","Work Rate"],goals:11,assists:14,matches:29,nationality:"🇯🇵",height:"1.74m",foot:"Both"},
// {id:7,initials:"CR",color:"#06b6d4",name:"Carlos Reyes",role:"Defender",age:23,location:"Buenos Aires, Argentina",match:83,tags:["Strength","Aerial","Leadership"],goals:5,assists:3,matches:33,nationality:"🇦🇷",height:"1.90m",foot:"Right"},
// {id:8,initials:"FO",color:"#f97316",name:"Folake Okafor",role:"Forward",age:19,location:"Lagos, Nigeria",match:91,tags:["Speed","Power","Finishing"],goals:21,assists:9,matches:27,nationality:"🇳🇬",height:"1.76m",foot:"Left"},
// ];

// // const CLUB_ROSTER = [
// // {id:101,initials:"RV",color:"#e11d48",name:"Roberto Valdez",role:"Forward",age:26,location:"Madrid, Spain",nationality:"🇪🇸",height:"1.80m",foot:"Right",tags:["Speed","Finishing","Dribbling"],goals:32,assists:14,matches:42,joined:"2023-07-01",contract:"2027-06-30",number:9,status:"active"},
// // {id:102,initials:"TM",color:"#0891b2",name:"Tariq Musa",role:"Midfielder",age:24,location:"Tunis, Tunisia",nationality:"🇹🇳",height:"1.76m",foot:"Right",tags:["Vision","Passing","Leadership"],goals:9,assists:22,matches:39,joined:"2022-01-15",contract:"2026-06-30",number:8,status:"active"},
// // {id:103,initials:"PL",color:"#7c3aed",name:"Pierre Laurent",role:"Defender",age:28,location:"Lyon, France",nationality:"🇫🇷",height:"1.89m",foot:"Left",tags:["Aerial","Positioning","Strength"],goals:4,assists:6,matches:44,joined:"2021-08-10",contract:"2025-12-31",number:4,status:"active"},
// // {id:104,initials:"GS",color:"#d97706",name:"Gianluca Serra",role:"Goalkeeper",age:30,location:"Milan, Italy",nationality:"🇮🇹",height:"1.94m",foot:"Right",tags:["Reflexes","Distribution","Command"],goals:0,assists:2,matches:40,joined:"2020-06-01",contract:"2026-06-30",number:1,status:"active"},
// // {id:105,initials:"DK",color:"#059669",name:"David Kim",role:"Midfielder",age:22,location:"Seoul, South Korea",nationality:"🇰🇷",height:"1.72m",foot:"Both",tags:["Technique","Work Rate","Pressing"],goals:7,assists:11,matches:35,joined:"2024-01-20",contract:"2028-06-30",number:10,status:"active"},
// // {id:106,initials:"OB",color:"#be185d",name:"Olivier Blanc",role:"Defender",age:25,location:"Paris, France",nationality:"🇫🇷",height:"1.85m",foot:"Right",tags:["Tackling","Pace","Reading"],goals:2,assists:4,matches:38,joined:"2022-07-05",contract:"2026-12-31",number:5,status:"injured"},
// // {id:107,initials:"NS",color:"#1d4ed8",name:"Nils Svensson",role:"Forward",age:21,location:"Stockholm, Sweden",nationality:"🇸🇪",height:"1.83m",foot:"Left",tags:["Pace","Agility","Finishing"],goals:14,assists:8,matches:30,joined:"2024-07-01",contract:"2028-06-30",number:11,status:"active"},
// // {id:108,initials:"AM",color:"#c2410c",name:"Ali Mansour",role:"Midfielder",age:27,location:"Casablanca, Morocco",nationality:"🇲🇦",height:"1.78m",foot:"Right",tags:["Stamina","Pressing","Vision"],goals:5,assists:16,matches:41,joined:"2021-01-10",contract:"2025-06-30",number:6,status:"active"},
// // {id:109,initials:"BT",color:"#0f766e",name:"Bruno Teixeira",role:"Defender",age:29,location:"Porto, Portugal",nationality:"🇵🇹",height:"1.87m",foot:"Right",tags:["Strength","Leadership","Aerial"],goals:6,assists:3,matches:43,joined:"2020-08-15",contract:"2026-06-30",number:3,status:"active"},
// // {id:110,initials:"KO",color:"#9333ea",name:"Kofi Owusu",role:"Forward",age:20,location:"Accra, Ghana",nationality:"🇬🇭",height:"1.77m",foot:"Right",tags:["Pace","Power","Direct Play"],goals:18,assists:5,matches:28,joined:"2024-01-01",contract:"2027-06-30",number:7,status:"active"},
// // {id:111,initials:"ZH",color:"#0369a1",name:"Zhao Hao",role:"Midfielder",age:23,location:"Shanghai, China",nationality:"🇨🇳",height:"1.73m",foot:"Right",tags:["Technique","Dribbling","Vision"],goals:6,assists:13,matches:32,joined:"2023-07-15",contract:"2027-12-31",number:14,status:"active"},
// // {id:112,initials:"IA",color:"#b45309",name:"Ivan Andric",role:"Goalkeeper",age:25,location:"Belgrade, Serbia",nationality:"🇷🇸",height:"1.96m",foot:"Right",tags:["Shot Stopping","Positioning","Communication"],goals:0,assists:0,matches:12,joined:"2024-07-01",contract:"2027-06-30",number:13,status:"active"},
// // ];

// const INITIAL_APPLICATIONS = [
// {id:1,athleteId:4,status:"pending",date:"2026-03-10",message:"I am very interested in joining FC Barcelona Academy. I believe I can contribute greatly to the team."},
// {id:2,athleteId:6,status:"pending",date:"2026-03-09",message:"FC Barcelona Academy is my dream club. I have been training professionally for 5 years."},
// {id:3,athleteId:8,status:"accepted",date:"2026-03-07",message:"I recently won the West Africa youth championship and would love the opportunity to develop at your academy."},
// {id:4,athleteId:7,status:"rejected",date:"2026-03-05",message:"I am a strong defender with 3 years of professional experience."},
// {id:5,athleteId:5,status:"pending",date:"2026-03-03",message:"I have been training as a goalkeeper since age 12. I was recently named best GK in the French youth league."},
// ];

// const INITIAL_NOTIFS = [
// {id:1,type:"accepted",text:"Folake Okafor accepted your offer request!",time:"1 hour ago",read:false,athleteId:8},
// {id:2,type:"application",text:"Yuki Nakamura sent you a new application!",time:"3 hours ago",read:false,athleteId:6},
// {id:3,type:"application",text:"Ahmed Karim sent you a new application!",time:"5 hours ago",read:true,athleteId:4},
// {id:4,type:"accepted",text:"Carlos Reyes accepted your connection request!",time:"1 day ago",read:true,athleteId:7},
// ];

// // ── SHARED ────────────────────────────────────────────────────────────────────
// function Avatar({initials,color,size=42}){
// return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color},${color}aa)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.35,color:"#fff",flexShrink:0,boxShadow:`0 2px 12px ${color}44`}}>{initials}</div>;
// }
// function Tag({label,t}){
// return <span style={{background:t.tagBg,color:t.tagText,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{label}</span>;
// }
// function StatusBadge({status,t}){
// const m={pending:{c:t.orange,l:"Pending"},accepted:{c:t.green,l:"Accepted"},rejected:{c:t.red,l:"Rejected"}};
// const s=m[status]||m.pending;
// return <span style={{background:`${s.c}20`,color:s.c,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s.l}</span>;
// }

// // ── OFFER TOGGLE BUTTON — used everywhere ─────────────────────────────────────
// function OfferBtn({athleteId,sent,sendOffer,removeOffer,t,full=false}){
// return (
// <button
//     onClick={()=> sent ? removeOffer(athleteId) : sendOffer(athleteId)}
//     style={{
//     flex: full ? 1 : "unset",
//     padding: full ? "8px 0" : "8px 16px",
//     borderRadius:8,
//     border: sent ? `1.5px solid ${t.red}` : `1.5px solid ${t.accent}`,
//     background: sent ? `${t.red}12` : "transparent",
//     color: sent ? t.red : t.accent,
//     fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
//     transition:"all 0.2s",
//     }}
// >
//     {sent ? "🗑 Remove Offer" : "📨 Send Offer"}
// </button>
// );
// }

// // ── SIDEBAR ───────────────────────────────────────────────────────────────────
// const NAV=[
// {icon:"⊞",label:"Dashboard"},
// {icon:"🔍",label:"Search Athletes"},
// {icon:"📋",label:"Applications"},
// {icon:"📨",label:"Requests"},
// {icon:"💼",label:"Job Offers"},
// {icon:"👥",label:"My Athletes"},
// {icon:"🔔",label:"Notifications"},
// ];
// function Sidebar({page,setPage,darkMode,setDarkMode,unread,t,navigate}){
// return (
// <div style={{width:200,background:t.sidebar,display:"flex",flexDirection:"column",padding:"0 0 20px",borderRight:`1px solid ${t.border}`,flexShrink:0,transition:"background 0.3s"}}>
//     <div style={{padding:"24px 20px 20px",display:"flex",alignItems:"center",gap:10}}>
//     <div style={{width:36,height:36,borderRadius:10,background:t.btnPrimary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚽</div>
//     <div>
//         <div style={{fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",color:t.text}}>SportScout</div>
//         <div style={{fontSize:10,color:t.textMuted}}>Club Portal</div>
//     </div>
//     </div>
//     <nav style={{flex:1,padding:"0 10px"}}>
//     {NAV.map(item=>(
//         <button key={item.label} onClick={()=>setPage(item.label)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:page===item.label?t.accentGlow:"transparent",color:page===item.label?t.accent:t.textMuted,fontWeight:page===item.label?700:500,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:2,borderLeft:page===item.label?`3px solid ${t.accent}`:"3px solid transparent",transition:"all 0.15s"}}
//         onMouseEnter={e=>{if(page!==item.label)e.currentTarget.style.background=t.navHover;}}
//         onMouseLeave={e=>{if(page!==item.label)e.currentTarget.style.background="transparent";}}
//         >
//         <span style={{fontSize:15}}>{item.icon}</span>
//         {item.label}
//         {item.label==="Notifications"&&unread>0&&(
//             <span style={{marginLeft:"auto",background:t.accent,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{unread}</span>
//         )}
//         </button>
//     ))}
//     </nav>
//     <div style={{padding:"0 20px 10px"}}>
//     <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
//         <span style={{fontSize:12,color:t.textMuted}}>{darkMode?"🌙 Dark":"☀️ Light"}</span>
//         <div onClick={()=>setDarkMode(!darkMode)} style={{width:38,height:20,borderRadius:20,cursor:"pointer",background:darkMode?t.accent:t.progressBg,position:"relative",transition:"background 0.3s",marginLeft:"auto"}}>
//         <div style={{position:"absolute",width:14,height:14,borderRadius:"50%",background:"#fff",top:3,transition:"left 0.3s",left:darkMode?21:3}}/>
//         </div>
//     </div>
//     <button 
//         onClick={() => {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             navigate('/login');
//         }}
//         style={{width:"100%",padding:"9px 0",borderRadius:10,background:"transparent",color:t.textMuted,border:`1px solid ${t.border}`,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}
//         >
//         ← Logout
//         </button>
//     </div>
// </div>
// );
// }

// // ── PROFILE MODAL ─────────────────────────────────────────────────────────────
// function ProfileModal({athlete,onClose,sendOffer,removeOffer,offersSent,t}){
// if(!athlete) return null;
// const a=athlete;
// const sent=offersSent.includes(a.id);
// return (
// <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}}>
//     <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:20,padding:28,border:`1px solid ${t.border}`,boxShadow:"0 8px 48px rgba(0,0,0,0.5)",maxWidth:520,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
//         <span style={{fontWeight:700,fontSize:15,color:t.text}}>Athlete Profile</span>
//         <button onClick={onClose} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:24,lineHeight:1}}>×</button>
//     </div>
//     <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:20}}>
//         <Avatar initials={a.initials} color={a.color} size={72}/>
//         <div style={{flex:1}}>
//         <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:4}}>{a.nationality} {a.name}</div>
//         <div style={{color:t.textMuted,fontSize:14,marginBottom:4}}>{a.role} • {a.age} yrs • {a.height} • {a.foot} foot</div>
//         <div style={{color:t.textMuted,fontSize:12,marginBottom:10}}>📍 {a.location}</div>
//         <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
//             {a.tags.map(tag=><Tag key={tag} label={tag} t={t}/>)}
//         </div>
//         </div>
//         <div style={{textAlign:"right",flexShrink:0}}>
//         <div style={{color:t.matchGreen,fontWeight:900,fontSize:28,fontFamily:"'Syne',sans-serif"}}>{a.match}%</div>
//         <div style={{color:t.matchGreen,fontSize:11,fontWeight:700,background:`${t.matchGreen}18`,padding:"2px 8px",borderRadius:20}}>Match</div>
//         </div>
//     </div>
//     <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
//         {[["⚽","Goals",a.goals],["🎯","Assists",a.assists],["🏟","Matches",a.matches]].map(([ic,l,v])=>(
//         <div key={l} style={{background:t.cardAlt,borderRadius:12,padding:14,border:`1px solid ${t.border}`,textAlign:"center"}}>
//             <div style={{fontSize:20,marginBottom:4}}>{ic}</div>
//             <div style={{fontSize:22,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif"}}>{v}</div>
//             <div style={{fontSize:11,color:t.textMuted}}>{l}</div>
//         </div>
//         ))}
//     </div>
//     <div style={{display:"flex",gap:10}}>
//         <OfferBtn athleteId={a.id} sent={sent} sendOffer={sendOffer} removeOffer={removeOffer} t={t} full/>
//         <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${t.border}`,background:"transparent",color:t.textMuted,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
//     </div>
//     </div>
// </div>
// );
// }

// // ── DASHBOARD ─────────────────────────────────────────────────────────────────
// function DashboardPage({t, setPage, applications, sendOffer, removeOffer, offersSent, viewProfile, clubUser}){
// const activity=[
// {id:1,name:"Alex Johnson",action:"Application accepted",time:"2 hours ago",icon:"✓",color:t.green},
// {id:2,name:"Sarah Chen",action:"Viewed your profile",time:"4 hours ago",icon:"👁",color:t.blue},
// {id:3,name:"David Martinez",action:"New application",time:"6 hours ago",icon:"★",color:t.orange},
// {id:4,name:"Liao Wang",action:"Application declined",time:"1 day ago",icon:"✕",color:t.red},
// {id:5,name:"Tom Wilson",action:"Viewed your profile",time:"1 day ago",icon:"👁",color:t.blue},
// {id:6,name:"Nina Patel",action:"Application accepted",time:"2 days ago",icon:"✓",color:t.green},
// ];
// const pending=applications.filter(a=>a.status==="pending").length;
// const accepted=applications.filter(a=>a.status==="accepted").length;
// return (
// <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
//     <div style={{flex:1,minWidth:0}}>
//     <div style={{background:t.card,borderRadius:18,padding:20,border:`1px solid ${t.border}`,marginBottom:20,boxShadow:t.shadow}}>
//         <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
//         <span style={{fontWeight:700,fontSize:15,color:t.text}}>Club Profile</span>
//         <button style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16}}>✏</button>
//         </div>
//         <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:16}}>
//         <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff",marginBottom:10}}>
//         {clubUser?.full_name
//             ? clubUser.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)
//             : "FC"}
//         </div>
//         <div style={{fontWeight:800,fontSize:16,color:t.text,fontFamily:"'Syne',sans-serif"}}>
//         {clubUser?.full_name
//         ? clubUser.full_name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
//         : "Club Name"}
//         </div>
//         <div style={{color:t.textMuted,fontSize:12}}>
//         {clubUser?.sport || "Sports Club"}
//         </div>
//         </div>
//         {[
//             ["📍", clubUser?.city || clubUser?.location || "—"],
//             ["✉",  clubUser?.email || "—"],
//             ["📞", clubUser?.phone || "—"],
//             ].map(([ic,v])=>(
//         <div key={ic} style={{display:"flex",gap:8,fontSize:12,color:t.textMuted,marginBottom:6}}><span>{ic}</span>{v}</div>
//         ))}
//         <div style={{marginTop:14}}>
//         <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
//             <span style={{fontSize:12,color:t.textMuted,fontWeight:600}}>Profile Completion</span>
//             <span style={{fontSize:12,color:t.accent,fontWeight:700}}>96%</span>
//         </div>
//         <div style={{height:6,borderRadius:10,background:t.progressBg,overflow:"hidden"}}>
//             <div style={{height:"100%",width:"96%",borderRadius:10,background:"linear-gradient(90deg,#6c63ff,#8b5cf6,#00e676)"}}/>
//         </div>
//         </div>
//     </div>
//     <div style={{display:"flex",gap:12,marginBottom:20}}>
//         {[{icon:"📋",value:pending,label:"Pending Applications",change:12},{icon:"👥",value:accepted,label:"Accepted Athletes",change:8},{icon:"👁",value:3482,label:"Total Profile Views",change:25}].map(s=>(
//         <div key={s.label} style={{background:t.cardAlt,borderRadius:14,padding:"16px 18px",flex:1,border:`1px solid ${t.border}`,display:"flex",flexDirection:"column",gap:6}}>
//             <div style={{display:"flex",justifyContent:"space-between"}}>
//             <span style={{fontSize:22}}>{s.icon}</span>
//             <span style={{color:t.green,fontSize:11,fontWeight:700,background:`${t.green}18`,padding:"2px 7px",borderRadius:20}}>↑{s.change}%</span>
//             </div>
//             <div style={{fontSize:26,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif",letterSpacing:-1}}>{s.value.toLocaleString()}</div>
//             <div style={{fontSize:11,color:t.textMuted,fontWeight:500}}>{s.label}</div>
//         </div>
//         ))}
//     </div>
//     <div style={{background:t.card,borderRadius:18,padding:20,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
//         <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
//         <div style={{display:"flex",alignItems:"center",gap:8}}>
//             <span style={{fontSize:20}}>🤖</span>
//             <span style={{fontWeight:700,fontSize:15,color:t.text}}>AI Recommended Athletes</span>
//         </div>
//         <button onClick={()=>setPage("Search Athletes")} style={{background:"none",border:"none",color:t.accent,fontWeight:600,fontSize:12,cursor:"pointer"}}>View All</button>
//         </div>
//         {ALL_ATHLETES.slice(0,3).map(a=>(
//         <MiniCard key={a.id} athlete={a} t={t} sendOffer={sendOffer} removeOffer={removeOffer} sent={offersSent.includes(a.id)} viewProfile={viewProfile}/>
//         ))}
//     </div>
//     </div>
//     <div style={{width:240,flexShrink:0}}>
//     <div style={{background:t.card,borderRadius:18,padding:20,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
//         <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
//         <span style={{fontWeight:700,fontSize:15,color:t.text}}>Recent Activity</span>
//         <button style={{background:"none",border:"none",color:t.accent,fontWeight:600,fontSize:12,cursor:"pointer"}}>View All</button>
//         </div>
//         {activity.map(item=>(
//         <div key={item.id} style={{display:"flex",gap:10,padding:"10px 8px",borderRadius:10,cursor:"pointer",transition:"background 0.15s"}}
//             onMouseEnter={e=>e.currentTarget.style.background=t.navHover}
//             onMouseLeave={e=>e.currentTarget.style.background="transparent"}
//         >
//             <div style={{width:28,height:28,borderRadius:"50%",background:`${item.color}22`,color:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,fontWeight:700}}>{item.icon}</div>
//             <div>
//             <div style={{fontSize:12,fontWeight:700,color:t.text}}>{item.name}</div>
//             <div style={{fontSize:11,color:t.textMuted}}>{item.action}</div>
//             <div style={{fontSize:10,color:t.textSub,marginTop:2}}>{item.time}</div>
//             </div>
//         </div>
//         ))}
//     </div>
//     </div>
// </div>
// );
// }

// function MiniCard({athlete,t,sendOffer,removeOffer,sent,viewProfile}){
// return (
// <div style={{background:t.cardAlt,borderRadius:14,padding:16,border:`1px solid ${t.border}`,marginBottom:10,transition:"border-color 0.2s"}}
//     onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent}
//     onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}
// >
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
//     <div style={{display:"flex",gap:12,alignItems:"center"}}>
//         <Avatar initials={athlete.initials} color={athlete.color} size={44}/>
//         <div>
//         <div style={{fontWeight:700,color:t.text,fontSize:15}}>{athlete.name}</div>
//         <div style={{color:t.textMuted,fontSize:12}}>{athlete.role} • {athlete.age} yrs</div>
//         <div style={{color:t.textMuted,fontSize:11,marginTop:2}}>📍 {athlete.location}</div>
//         </div>
//     </div>
//     <div style={{textAlign:"right"}}>
//         <div style={{color:t.matchGreen,fontWeight:800,fontSize:18}}>{athlete.match}%</div>
//         <div style={{color:t.matchGreen,fontSize:10,fontWeight:600,background:`${t.matchGreen}18`,padding:"1px 7px",borderRadius:20}}>Match</div>
//     </div>
//     </div>
//     <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
//     {athlete.tags.map(tag=><Tag key={tag} label={tag} t={t}/>)}
//     </div>
//     <div style={{display:"flex",gap:20,margin:"12px 0"}}>
//     {[["Goals",athlete.goals],["Assists",athlete.assists],["Matches",athlete.matches]].map(([l,v])=>(
//         <div key={l} style={{textAlign:"center"}}>
//         <div style={{fontSize:16,fontWeight:800,color:t.text}}>{v}</div>
//         <div style={{fontSize:10,color:t.textMuted}}>{l}</div>
//         </div>
//     ))}
//     </div>
//     <div style={{display:"flex",gap:8}}>
//     <button onClick={()=>viewProfile(athlete)} style={{flex:1,padding:"8px 0",borderRadius:8,background:t.btnPrimary,color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
//         👤 View Profile
//     </button>
//     <OfferBtn athleteId={athlete.id} sent={sent} sendOffer={sendOffer} removeOffer={removeOffer} t={t} full/>
//     </div>
// </div>
// );
// }

// // ── SEARCH PAGE ───────────────────────────────────────────────────────────────
// function SearchAthletesPage({t,sendOffer,removeOffer,offersSent,viewProfile}){
// const [query,setQuery]=useState("");
// const [role,setRole]=useState("All");
// const [sort,setSort]=useState("match");
// const [dbAthletes, setDbAthletes] = useState([]);
// const [sentOffers, setSentOffers] = useState([]);
// const roles=["All","Forward","Midfielder","Defender","Goalkeeper"];
// const filtered = dbAthletes
//     .filter(a => (role === "All" || a.sport === role) && (
//         a.full_name?.toLowerCase().includes(query.toLowerCase()) ||
//         a.city?.toLowerCase().includes(query.toLowerCase())
//     ))
// .sort((a,b)=>sort==="match"?b.match-a.match:sort==="age"?a.age-b.age:a.name.localeCompare(b.name));
//     useEffect(() => {
//         getAllPlayers()
//             .then(res => {
//             const mapped = res.data.map(p => ({
//                 ...p,
//                 name: p.full_name,
//                 nationality: "🏃",
//                 match: p.matches > 0 ? Math.round((p.goals / p.matches) * 100) : 0,
//                 tags: [p.sport || "—", p.position || "—"].filter(t => t !== "—"),
//                 location: p.city || "—",
//                 height: p.height_cm ? p.height_cm + " cm" : "—",
//                 foot: "—",
//                 goals: p.goals || 0,
//                 assists: p.assists || 0,
//                 matches: p.matches || 0,
//                 initials: p.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2),
//                 color: "#6c63ff",
//             }));
//             setDbAthletes(mapped);
//             })
//             .catch(() => {});

//         // جيب الـ sent offers
//         getSentOffers()
//             .then(res => setSentOffers(res.data))
//             .catch(() => {});
//         }, []);
// return (
// <div>
//     <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:"0 0 4px"}}>Search Athletes</h2>
//     <p style={{color:t.textMuted,fontSize:13,margin:"0 0 20px"}}>Find and recruit the best talent from around the world</p>
//     <div style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:20,display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
//     <input placeholder="🔍  Search by name, location or skill..." value={query} onChange={e=>setQuery(e.target.value)}
//         style={{flex:1,minWidth:200,padding:"10px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,fontFamily:"inherit"}}/>
//     <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
//         {roles.map(r=>(
//         <button key={r} onClick={()=>setRole(r)} style={{padding:"8px 14px",borderRadius:20,border:role!==r?`1px solid ${t.border}`:"none",cursor:"pointer",background:role===r?t.btnPrimary:t.cardAlt,color:role===r?"#fff":t.textMuted,fontWeight:600,fontSize:12,fontFamily:"inherit"}}>{r}</button>
//         ))}
//     </div>
//     <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"9px 12px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:12,fontFamily:"inherit",cursor:"pointer"}}>
//         <option value="match">Best Match</option>
//         <option value="age">Youngest</option>
//         <option value="name">Name A–Z</option>
//     </select>
//     </div>
//     <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
//     {filtered.length===0
//         ?<div style={{color:t.textMuted,gridColumn:"1/-1",textAlign:"center",padding:40}}>No athletes found.</div>
//         :filtered.map(a=>(
//             <SearchCard key={a.id} athlete={a} t={t}
//                 sendOffer={sendOffer} removeOffer={removeOffer}
//                 sent={offersSent.includes(a.id)} viewProfile={viewProfile}
//                 offerSent={sentOffers.find(o => o.user_id === a.id)}
//                 onOffer={() => {
//                 const existingOffer = sentOffers.find(o => o.user_id === a.id);
                
//                 if (existingOffer?.status === "accepted" || existingOffer?.status === "rejected") return;
                
//                 if (existingOffer) {
//                     cancelOffer(a.id)
//                     .then(() => setSentOffers(prev => prev.filter(o => o.user_id !== a.id)))
//                     .catch(() => {});
//                 } else {
//                     offerPlayer(a.id)
//                     .then(() => setSentOffers(prev => [...prev, { user_id: a.id, status: "pending" }]))
//                     .catch(() => {});
//                 }
//                 }}
//             />
//             ))
//     }
//     </div>
// </div>
// );
// }

// function SearchCard({athlete,t,sendOffer,removeOffer,sent,viewProfile,offerSent,onOffer}){
//     const [exp,setExp]=useState(false);
// return (
// <div style={{background:t.card,borderRadius:16,padding:18,border:`1px solid ${t.border}`,boxShadow:t.shadow,transition:"border-color 0.2s,transform 0.2s"}}
//     onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.transform="translateY(-2px)";}}
//     onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.transform="translateY(0)";}}
// >
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
//     <div style={{display:"flex",gap:12,alignItems:"center"}}>
//         <Avatar initials={athlete.initials} color={athlete.color} size={48}/>
//         <div>
//         <div style={{fontWeight:800,color:t.text,fontSize:15}}>{athlete.nationality} {athlete.name}</div>
//         <div style={{color:t.textMuted,fontSize:12,marginTop:2}}>{athlete.role} • {athlete.age} yrs</div>
//         <div style={{color:t.textMuted,fontSize:11,marginTop:2}}>📍 {athlete.location}</div>
//         </div>
//     </div>
//     <div style={{textAlign:"right"}}>
//         <div style={{color:t.matchGreen,fontWeight:900,fontSize:20,fontFamily:"'Syne',sans-serif"}}>{athlete.match}%</div>
//         <div style={{color:t.matchGreen,fontSize:10,fontWeight:700,background:`${t.matchGreen}18`,padding:"2px 8px",borderRadius:20}}>Match</div>
//     </div>
//     </div>
//     <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
//     {(athlete.tags || []).map(tag=><Tag key={tag} label={tag} t={t}/>)}
//     <span style={{background:`${t.blue}18`,color:t.blue,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>⚽ {athlete.foot}</span>
//     </div>
//     <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${t.border}`,marginBottom:14}}>
//     {[["Goals",athlete.goals],["Assists",athlete.assists],["Matches",athlete.matches]].map(([l,v],i)=>(
//         <div key={l} style={{flex:1,textAlign:"center",padding:"10px 0",borderRight:i<2?`1px solid ${t.border}`:"none"}}>
//         <div style={{fontSize:18,fontWeight:800,color:t.text}}>{v}</div>
//         <div style={{fontSize:10,color:t.textMuted}}>{l}</div>
//         </div>
//     ))}
//     </div>
//     {exp&&(
//     <div style={{background:t.cardAlt,borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:t.textMuted,lineHeight:1.8}}>
//         <div><b style={{color:t.text}}>Height:</b> {athlete.height}</div>
//         <div><b style={{color:t.text}}>Preferred Foot:</b> {athlete.foot}</div>
//         <div><b style={{color:t.text}}>Location:</b> {athlete.location}</div>
//     </div>
//     )}
//     <div style={{display:"flex",gap:8,alignItems:"center"}}>
//     <button
//         onClick={onOffer}
//         style={{
//             flex:1,
//             padding:"8px 0",
//             borderRadius:8,
//             border: offerSent?.status === "accepted" ? `1.5px solid ${t.green}` :
//                     offerSent?.status === "rejected" ? `1.5px solid ${t.red}` :
//                     offerSent ? `1.5px solid ${t.orange}` : `1.5px solid ${t.accent}`,
//             background: offerSent?.status === "accepted" ? `${t.green}12` :
//                         offerSent?.status === "rejected" ? `${t.red}12` :
//                         offerSent ? `${t.orange}12` : "transparent",
//             color: offerSent?.status === "accepted" ? t.green :
//                 offerSent?.status === "rejected" ? t.red :
//                 offerSent ? t.orange : t.accent,
//             fontWeight:700, fontSize:13, 
//             cursor: offerSent?.status === "accepted" || offerSent?.status === "rejected" ? "default" : "pointer",
//             fontFamily:"inherit",
//         }}
//         >
//         {offerSent?.status === "accepted" ? "Accepted" :
//         offerSent?.status === "rejected" ? "Rejected" :
//         offerSent ? "🗑 Remove Offer" : "📨 Send Offer"}
//     </button>
//     <button onClick={()=>setExp(!exp)} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>{exp?"▲":"▼"}</button>
//     </div>
// </div>
// );
// }

// // ── APPLICATIONS ──────────────────────────────────────────────────────────────
// function ApplicationsPage({t, applications, updateAppStatus, clubRequests, updateRequestStatus, setClubRequests, setMyPlayers}){
// const [filter,setFilter]=useState("All");
// const allApps = clubRequests.filter(r => r.source === "cv");
// const filtered = allApps.filter(app => filter === "All" || app.status === filter);
// return (
// <div>
//     <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:"0 0 4px"}}>Applications</h2>
//     <p style={{color:t.textMuted,fontSize:13,margin:"0 0 20px"}}>Review athletes who applied to join your club</p>
//     <div style={{display:"flex",gap:12,marginBottom:20}}>
//     {[{l:"Total",c:t.accent,v:allApps.length},{l:"Pending",c:t.orange,v:allApps.filter(a=>a.status==="pending").length},{l:"Accepted",c:t.green,v:allApps.filter(a=>a.status==="accepted").length},{l:"Rejected",c:t.red,v:allApps.filter(a=>a.status==="rejected").length}].map(s=>(
//         <div key={s.l} style={{flex:1,background:t.card,borderRadius:14,padding:"14px 18px",border:`1px solid ${t.border}`,display:"flex",flexDirection:"column",gap:4}}>
//         <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
//         <div style={{fontSize:12,color:t.textMuted}}>{s.l}</div>
//         </div>
//     ))}
//     </div>
//     <div style={{display:"flex",gap:8,marginBottom:18}}>
//     {["All","pending","accepted","rejected"].map(f=>(
//         <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 18px",borderRadius:20,border:filter!==f?`1px solid ${t.border}`:"none",cursor:"pointer",background:filter===f?t.btnPrimary:t.card,color:filter===f?"#fff":t.textMuted,fontWeight:600,fontSize:12,fontFamily:"inherit",textTransform:"capitalize"}}>
//         {f==="All"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
//         </button>
//     ))}
//     </div>
//     <div style={{display:"flex",flexDirection:"column",gap:14}}>
//     {filtered.length===0
//         ?<div style={{color:t.textMuted,textAlign:"center",padding:40}}>No applications found.</div>
//         :filtered.map(app=>{
//         const playerName = app.player_name || "Unknown Player";
//         const position = app.position || "—";
//         const score = app.score ?? null;
//         const initials = playerName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
//         return (
//             <div key={app.id} style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
//             <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
//                 <div style={{display:"flex",gap:14,alignItems:"center"}}>
//                 <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff"}}>{initials}</div>
//                 <div>
//                     <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
//                     <span style={{fontWeight:800,color:t.text,fontSize:17}}>{playerName}</span>
//                     <StatusBadge status={app.status} t={t}/>
//                     </div>
//                     <div style={{color:t.textMuted,fontSize:13,marginTop:2}}>{position}</div>
//                     <div style={{color:t.textSub,fontSize:11,marginTop:4}}>Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
//                 </div>
//                 </div>
//                 {score !== null && score > 0 && (
//                 <div style={{textAlign:"right"}}>
//                     <div style={{color:t.matchGreen,fontWeight:900,fontSize:22}}>{score}%</div>
//                     <div style={{color:t.textMuted,fontSize:11}}>Match Score</div>
//                 </div>
//                 )}
//             </div>
//             {app.status === "pending" && (
//                 <div style={{display:"flex",gap:10,marginTop:14}}>
//                 <button onClick={()=>{
//                     updateRequestStatus(app.id,"accepted")
//                     .then(()=>{
//                         setClubRequests(prev=>prev.map(r=>r.id===app.id?{...r,status:"accepted"}:r));
//                         getMyClubPlayers().then(res=>setMyPlayers(res.data));
//                     }).catch(()=>{});
//                 }} style={{padding:"9px 22px",borderRadius:10,border:"none",cursor:"pointer",background:t.green,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>✓ Accept</button>
//                 <button onClick={()=>{
//                     updateRequestStatus(app.id,"rejected")
//                     .then(()=>setClubRequests(prev=>prev.map(r=>r.id===app.id?{...r,status:"rejected"}:r)))
//                     .catch(()=>{});
//                 }} style={{padding:"9px 22px",borderRadius:10,cursor:"pointer",background:`${t.red}20`,color:t.red,fontWeight:700,fontSize:13,fontFamily:"inherit",border:`1.5px solid ${t.red}`}}>✕ Decline</button>
//                 </div>
//             )}
//             {app.status === "accepted" && (
//                 <div style={{fontSize:13,color:t.textMuted,fontStyle:"italic",marginTop:14}}>✓ You accepted this application.</div>
//             )}
//             {app.status === "rejected" && (
//                 <div style={{fontSize:13,color:t.textMuted,fontStyle:"italic",marginTop:14}}>✕ You declined this application.</div>
//             )}
//             </div>
//         );
//         })
//     }
//     </div>
// </div>
// );
// }

// // ── MY ATHLETES ───────────────────────────────────────────────────────────────
// function MyAthletesPage({t,offersSent,removedRoster,removeFromRoster,viewProfile,myPlayers}){
// const [view,setView]=useState("grid");
// const [roleFilter,setRoleFilter]=useState("All");
// const [statusFilter,setStatusFilter]=useState("All");
// const [query,setQuery]=useState("");
// const [selected,setSelected]=useState(null);
// const [confirmRemove,setConfirmRemove]=useState(null);

// const allRoster = myPlayers.map(p => ({
//     ...p,
//     initials: p.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2),
//     color: "#6c63ff",
//     name: p.full_name,
//     role: p.position || "Player",
//     location: p.city || "—",
//     nationality: "🏃",
//     height: p.height_cm ? p.height_cm + "m" : "—",
//     foot: "—",
//     tags: [p.sport || "—"],
//     goals: p.goals || 0,
//     assists: p.assists || 0,
//     matches: p.matches || 0,
//     shot_accuracy: p.shot_accuracy || 0,
//     win_rate: p.win_rate || 0,
//     games_played: p.games_played || 0,
//     joined: "—",
//     contract: "—",
//     number: p.id,
//     status: "active",
// })).filter(a => !removedRoster.includes(a.id));

// const doRemove=(id)=>{ removeFromRoster(id); setConfirmRemove(null); setSelected(null); };

// const roles=["All","Forward","Midfielder","Defender","Goalkeeper"];
// const filtered=allRoster.filter(a=>
// (roleFilter==="All"||a.role===roleFilter)&&
// (statusFilter==="All"||a.status===statusFilter)&&
// (a.name.toLowerCase().includes(query.toLowerCase())||a.role.toLowerCase().includes(query.toLowerCase()))
// );
// const byRole=roles.slice(1).map(r=>({role:r,count:allRoster.filter(a=>a.role===r).length}));

// const ConfirmModal=()=>confirmRemove?(
// <div onClick={()=>setConfirmRemove(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
//     <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:20,padding:32,border:`1px solid ${t.border}`,boxShadow:"0 8px 48px rgba(0,0,0,0.5)",maxWidth:400,width:"90%",textAlign:"center"}}>
//     <div style={{width:60,height:60,borderRadius:"50%",background:`${t.red}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>⚠️</div>
//     <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:t.text,marginBottom:8}}>Remove Athlete?</div>
//     <div style={{color:t.textMuted,fontSize:14,marginBottom:24}}>You're about to remove <b style={{color:t.text}}>{confirmRemove.name}</b> from the club roster. This cannot be undone.</div>
//     <div style={{display:"flex",gap:10,justifyContent:"center"}}>
//         <button onClick={()=>setConfirmRemove(null)} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${t.border}`,background:"transparent",color:t.textMuted,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
//         <button onClick={()=>doRemove(confirmRemove.id)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:t.red,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Yes, Remove</button>
//     </div>
//     </div>
// </div>
// ):null;

// if(selected){
// const a=selected;
// return (
//     <div>
//     <ConfirmModal/>
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
//         <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:t.accent,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>← Back to Roster</button>
//         <button onClick={()=>setConfirmRemove(a)} style={{padding:"9px 20px",borderRadius:10,border:`1.5px solid ${t.red}`,background:`${t.red}12`,color:t.red,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>🗑 Remove from Club</button>
//     </div>
//     <div style={{background:t.card,borderRadius:20,padding:28,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
//         <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
//         <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
//             <Avatar initials={a.initials} color={a.color} size={90}/>
//             <span style={{background:`${a.status==="active"?t.green:t.orange}18`,color:a.status==="active"?t.green:t.orange,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700}}>{a.status==="active"?"● Active":"⚠ Injured"}</span>
//             <div style={{width:42,height:42,borderRadius:10,background:t.cardAlt,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:t.accent}}>#{a.number}</div>
//         </div>
//         <div style={{flex:1,minWidth:200}}>
//             <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:t.text,marginBottom:4}}>{a.nationality} {a.name}</div>
//             <div style={{color:t.textMuted,fontSize:15,marginBottom:16}}>{a.role} • {a.age} yrs • {a.height} • {a.foot} foot</div>
//             <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{a.tags.map(tag=><Tag key={tag} label={tag} t={t}/>)}</div>
//             <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
//             {[["📍","Location",a.location],["📅","Joined",a.joined],["📄","Contract Until",a.contract]].map(([ic,l,v])=>(
//                 <div key={l} style={{background:t.cardAlt,borderRadius:12,padding:"12px 14px",border:`1px solid ${t.border}`}}>
//                 <div style={{fontSize:18,marginBottom:4}}>{ic}</div>
//                 <div style={{fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:2}}>{l}</div>
//                 <div style={{fontSize:13,fontWeight:700,color:t.text}}>{v}</div>
//                 </div>
//             ))}
//             </div>
//         </div>
//         </div>
//         <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:20,paddingTop:20,borderTop:`1px solid ${t.border}`}}>
//         {[["⚽","Goals",a.goals],["🎯","Assists",a.assists],["🏟","Matches",a.matches],["📏","Height",a.height],["👟","Foot",a.foot]].map(([ic,l,v])=>(
//             <div key={l} style={{background:t.cardAlt,borderRadius:14,padding:16,border:`1px solid ${t.border}`,textAlign:"center"}}>
//             <div style={{fontSize:22,marginBottom:6}}>{ic}</div>
//             <div style={{fontSize:20,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif"}}>{v}</div>
//             <div style={{fontSize:11,color:t.textMuted,marginTop:2}}>{l}</div>
//             </div>
//         ))}
//         </div>
//     </div>
//     </div>
// );
// }

// return (
// <div>
//     <ConfirmModal/>
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
//     <div>
//         <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:"0 0 4px"}}>My Athletes</h2>
//         <p style={{color:t.textMuted,fontSize:13,margin:0}}>Full club roster — {allRoster.length} athletes registered</p>
//     </div>
//     <div style={{display:"flex",gap:8}}>
//         {["grid","list"].map(v=>(
//         <button key={v} onClick={()=>setView(v)} style={{padding:"8px 14px",borderRadius:10,border:view!==v?`1px solid ${t.border}`:"none",cursor:"pointer",background:view===v?t.btnPrimary:t.card,color:view===v?"#fff":t.textMuted,fontWeight:600,fontSize:13,fontFamily:"inherit"}}>
//             {v==="grid"?"⊞ Grid":"☰ List"}
//         </button>
//         ))}
//     </div>
//     </div>
//     <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
//     {byRole.map(({role,count})=>(
//         <div key={role} style={{background:t.card,borderRadius:12,padding:"10px 16px",border:`1px solid ${t.border}`,display:"flex",gap:10,alignItems:"center"}}>
//         <span>{role==="Forward"?"⚡":role==="Midfielder"?"🎯":role==="Defender"?"🛡️":"🧤"}</span>
//         <div>
//             <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{count}</div>
//             <div style={{fontSize:10,color:t.textMuted}}>{role}s</div>
//         </div>
//         </div>
//     ))}
//     <div style={{background:t.card,borderRadius:12,padding:"10px 16px",border:`1px solid ${t.green}44`,display:"flex",gap:10,alignItems:"center"}}>
//         <span style={{color:t.green}}>●</span>
//         <div><div style={{fontSize:18,fontWeight:800,color:t.green,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{allRoster.filter(a=>a.status==="active").length}</div><div style={{fontSize:10,color:t.textMuted}}>Active</div></div>
//     </div>
//     <div style={{background:t.card,borderRadius:12,padding:"10px 16px",border:`1px solid ${t.orange}44`,display:"flex",gap:10,alignItems:"center"}}>
//         <span style={{color:t.orange}}>⚠</span>
//         <div><div style={{fontSize:18,fontWeight:800,color:t.orange,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{allRoster.filter(a=>a.status==="injured").length}</div><div style={{fontSize:10,color:t.textMuted}}>Injured</div></div>
//     </div>
//     </div>
//     <div style={{background:t.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${t.border}`,marginBottom:18,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
//     <input placeholder="🔍 Search athlete..." value={query} onChange={e=>setQuery(e.target.value)}
//         style={{flex:1,minWidth:160,padding:"9px 12px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,fontFamily:"inherit"}}/>
//     <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
//         {roles.map(r=>(
//         <button key={r} onClick={()=>setRoleFilter(r)} style={{padding:"7px 12px",borderRadius:20,border:roleFilter!==r?`1px solid ${t.border}`:"none",cursor:"pointer",background:roleFilter===r?t.btnPrimary:t.cardAlt,color:roleFilter===r?"#fff":t.textMuted,fontWeight:600,fontSize:11,fontFamily:"inherit"}}>{r}</button>
//         ))}
//     </div>
//     <div style={{display:"flex",gap:6}}>
//         {["All","active","injured"].map(s=>(
//         <button key={s} onClick={()=>setStatusFilter(s)} style={{padding:"7px 12px",borderRadius:20,border:statusFilter!==s?`1px solid ${t.border}`:"none",cursor:"pointer",background:statusFilter===s?t.btnPrimary:t.cardAlt,color:statusFilter===s?"#fff":t.textMuted,fontWeight:600,fontSize:11,fontFamily:"inherit"}}>
//             {s==="active"?"● Active":s==="injured"?"⚠ Injured":"All"}
//         </button>
//         ))}
//     </div>
//     </div>
//     {filtered.length===0
//     ?<div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>No athletes found.</div>
//     :view==="grid"
//         ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
//         {filtered.map(a=>(
//             <div key={a.id} style={{background:t.card,borderRadius:16,padding:18,border:`1px solid ${a.status==="injured"?t.orange+"44":t.border}`,boxShadow:t.shadow,transition:"border-color 0.2s,transform 0.2s"}}
//             onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.transform="translateY(-2px)";}}
//             onMouseLeave={e=>{e.currentTarget.style.borderColor=a.status==="injured"?t.orange+"44":t.border;e.currentTarget.style.transform="translateY(0)";}}
//             >
//             <div onClick={()=>setSelected(a)} style={{cursor:"pointer",marginBottom:10}}>
//                 <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
//                 <div style={{display:"flex",gap:10,alignItems:"center"}}>
//                     <Avatar initials={a.initials} color={a.color} size={46}/>
//                     <div>
//                     <div style={{fontWeight:800,color:t.text,fontSize:14}}>{a.nationality} {a.name}</div>
//                     <div style={{color:t.textMuted,fontSize:11,marginTop:1}}>{a.role} • {a.age} yrs</div>
//                     <div style={{color:t.textMuted,fontSize:10,marginTop:1}}>📍 {a.location}</div>
//                     </div>
//                 </div>
//                 <div style={{width:32,height:32,borderRadius:8,background:t.cardAlt,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:t.accent,flexShrink:0}}>#{a.number}</div>
//                 </div>
//                 <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
//                 {a.tags.slice(0,2).map(tag=><Tag key={tag} label={tag} t={t}/>)}
//                 <span style={{background:`${a.status==="active"?t.green:t.orange}18`,color:a.status==="active"?t.green:t.orange,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{a.status==="active"?"● Active":"⚠ Injured"}</span>
//                 </div>
//                 <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${t.border}`}}>
//                 {[["G",a.goals],["A",a.assists],["M",a.matches]].map(([l,v],i)=>(
//                     <div key={l} style={{flex:1,textAlign:"center",padding:"8px 0",borderRight:i<2?`1px solid ${t.border}`:"none"}}>
//                     <div style={{fontSize:15,fontWeight:800,color:t.text}}>{v}</div>
//                     <div style={{fontSize:9,color:t.textMuted}}>{l==="G"?"Goals":l==="A"?"Assists":"Matches"}</div>
//                     </div>
//                 ))}
//                 </div>
//             </div>
//             <button onClick={e=>{e.stopPropagation();setConfirmRemove(a);}} style={{width:"100%",padding:"7px 0",borderRadius:8,border:`1px solid ${t.red}`,background:`${t.red}10`,color:t.red,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
//                 🗑 Remove from Club
//             </button>
//             </div>
//         ))}
//         </div>
//         :<div style={{display:"flex",flexDirection:"column",gap:8}}>
//         {filtered.map(a=>(
//             <div key={a.id} style={{background:t.card,borderRadius:14,padding:"14px 18px",border:`1px solid ${a.status==="injured"?t.orange+"44":t.border}`,display:"flex",alignItems:"center",gap:16,transition:"border-color 0.2s"}}
//             onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent}
//             onMouseLeave={e=>e.currentTarget.style.borderColor=a.status==="injured"?t.orange+"44":t.border}
//             >
//             <div style={{width:36,height:36,borderRadius:8,background:t.cardAlt,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:t.accent,flexShrink:0}}>#{a.number}</div>
//             <Avatar initials={a.initials} color={a.color} size={42}/>
//             <div onClick={()=>setSelected(a)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
//                 <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
//                 <span style={{fontWeight:700,color:t.text,fontSize:14}}>{a.nationality} {a.name}</span>
//                 <span style={{background:`${a.status==="active"?t.green:t.orange}18`,color:a.status==="active"?t.green:t.orange,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>{a.status==="active"?"● Active":"⚠ Injured"}</span>
//                 </div>
//                 <div style={{color:t.textMuted,fontSize:12,marginTop:2}}>{a.role} • {a.age} yrs • 📍 {a.location}</div>
//             </div>
//             <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
//                 {a.tags.slice(0,3).map(tag=><Tag key={tag} label={tag} t={t}/>)}
//             </div>
//             <div style={{display:"flex",gap:20,flexShrink:0}}>
//                 {[["Goals",a.goals],["Assists",a.assists],["Matches",a.matches]].map(([l,v])=>(
//                 <div key={l} style={{textAlign:"center",minWidth:40}}>
//                     <div style={{fontSize:16,fontWeight:800,color:t.text}}>{v}</div>
//                     <div style={{fontSize:10,color:t.textMuted}}>{l}</div>
//                 </div>
//                 ))}
//             </div>
//             <button onClick={()=>setConfirmRemove(a)} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${t.red}`,background:`${t.red}10`,color:t.red,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>🗑</button>
//             <span onClick={()=>setSelected(a)} style={{color:t.textMuted,fontSize:18,flexShrink:0,cursor:"pointer"}}>›</span>
//             </div>
//         ))}
//         </div>
//     }
// </div>
// );
// }

// // ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
// function NotificationsPage({t,notifications,markAllRead,markRead}){
// const unread=notifications.filter(n=>!n.is_read).length;
// return (
// <div>
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
//     <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:0}}>Notifications</h2>
//     {unread>0&&<button onClick={markAllRead} style={{background:"none",border:"none",color:t.accent,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Mark all as read</button>}
//     </div>
//     <p style={{color:t.textMuted,fontSize:13,margin:"0 0 20px"}}>{unread>0?`You have ${unread} unread notification${unread>1?"s":""}`:"All caught up!"}</p>
//     <div style={{display:"flex",flexDirection:"column",gap:10}}>
//     {notifications.length===0
//         ?<div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>
//         <div style={{fontSize:40,marginBottom:12}}>🔔</div>
//         <div style={{fontSize:16,fontWeight:600}}>No notifications</div>
//         </div>
//         :notifications.map(n=>(
//             <div key={n.id} onClick={()=>markRead(n.id)} style={{background:n.is_read?t.card:`${t.accent}0d`,borderRadius:14,padding:"16px 20px",border:n.is_read?`1px solid ${t.border}`:`1px solid ${t.accent}44`,display:"flex",gap:14,alignItems:"center",cursor:"pointer",transition:"background 0.2s"}}
//             onMouseEnter={e=>e.currentTarget.style.background=t.navHover}
//             onMouseLeave={e=>e.currentTarget.style.background=n.is_read?t.card:`${t.accent}0d`}
//             >
//             <div style={{width:44,height:44,borderRadius:"50%",background:n.type==="application"?`${t.blue}22`:`${t.green}22`,color:n.type==="application"?t.blue:t.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
//                 {n.type==="application"?"📋":"✓"}
//             </div>
//             <div style={{flex:1}}>
//                 <div style={{fontWeight:700,color:t.text,fontSize:13}}>{n.title}</div>
//                 <div style={{fontWeight:n.is_read?500:600,color:t.textMuted,fontSize:13,marginTop:2}}>{n.message}</div>
//                 <div style={{color:t.textMuted,fontSize:11,marginTop:3}}>{new Date(n.created_at).toLocaleDateString()}</div>
//             </div>
//             {!n.is_read&&<div style={{width:10,height:10,borderRadius:"50%",background:t.accent,flexShrink:0}}/>}
//             </div>
//         ))
//     }
//     </div>
// </div>
// );
// }

// // ── ROOT APP ──────────────────────────────────────────────────────────────────
// export default function App(){
// const [darkMode,      setDarkMode]     = useState(()=>load("sc_darkMode",   true));
// const [page,          setPage]         = useState(()=>load("sc_page",       "Dashboard"));
// const [offersSent,    setOffersSent]   = useState(()=>load("sc_offersSent", []));
// const [applications,  setApplications] = useState(()=>load("sc_apps",       INITIAL_APPLICATIONS));
// const [notifications, setNotifications]= useState(()=>load("sc_notifs",     INITIAL_NOTIFS));
// const [removedRoster, setRemovedRoster]= useState(()=>load("sc_removed",    []));
// const [profileAthlete,setProfileAthlete]=useState(null);
// const [clubUser, setClubUser] = useState(null);
// const [dbNotifications, setDbNotifications] = useState([]);
// const [clubRequests, setClubRequests] = useState([]);
// const [myPlayers, setMyPlayers] = useState([]);
// const [myOffers, setMyOffers] = useState([]);
// const [offerForm, setOfferForm] = useState({ title: "", position: "", location: "", description: "", sport: "" });
// const [showOfferForm, setShowOfferForm] = useState(false);
// const [playerRequests, setPlayerRequests] = useState([]);

// const navigate = useNavigate();



// useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) { navigate('/login'); return; }
//     getMe()
//         .then(res => setClubUser(res.data))
//         .catch(() => navigate('/login'));

//     getMyOffers()
//         .then(res => setMyOffers(res.data))
//         .catch(() => {});
    
//     getNotifications()
//         .then(res => setDbNotifications(res.data))
//         .catch(() => {});

//     getClubRequests()
//         .then(res => setClubRequests(res.data))
//         .catch(() => {});

//     getMyClubPlayers()
//         .then(res => {
//             localStorage.removeItem('sc_removed');
//             setMyPlayers(res.data);
//         });
//     // جيب الـ player requests بشكل منفصل
//     getClubRequests()
//         .then(res => setPlayerRequests(res.data.filter(r => r.source === "player")))
//         .catch(() => {});
    
//     }, [navigate])

// useEffect(()=>save("sc_darkMode",   darkMode),        [darkMode]);
// useEffect(()=>save("sc_page",       page),            [page]);
// useEffect(()=>save("sc_offersSent", offersSent),      [offersSent]);
// useEffect(()=>save("sc_apps",       applications),    [applications]);
// useEffect(()=>save("sc_notifs",     notifications),   [notifications]);
// useEffect(()=>save("sc_removed",    removedRoster),   [removedRoster]);

// const t=darkMode?themes.dark:themes.light;
// const unread = dbNotifications.filter(n => !n.is_read).length;

// const sendOffer=(athleteId)=>{
// if(offersSent.includes(athleteId)) return;
// setOffersSent(prev=>[...prev,athleteId]);
// const athlete=ALL_ATHLETES.find(a=>a.id===athleteId);
// setNotifications(prev=>[{id:Date.now(),type:"offer_sent",text:`Your offer was sent to ${athlete?.name}!`,time:"Just now",read:false,athleteId},...prev]);
// };

// const removeOffer=(athleteId)=>{
// setOffersSent(prev=>prev.filter(id=>id!==athleteId));
// setRemovedRoster(prev=>[...prev,athleteId+200]);
// };

// const updateAppStatus=(appId,status)=>{
// const app=applications.find(a=>a.id===appId);
// const athlete=ALL_ATHLETES.find(a=>a.id===app?.athleteId);
// setApplications(prev=>prev.map(a=>a.id===appId?{...a,status}:a));
// if(status==="accepted"){
//     setNotifications(prev=>[{id:Date.now(),type:"accepted",text:`You accepted ${athlete?.name}'s application! 🎉`,time:"Just now",read:false,athleteId:app?.athleteId},...prev]);
// }
// };

// // const markAllRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));
// // const markRead=(id)=>setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));
// const removeFromRoster=(id)=>{
//     removePlayerFromClub(id)
//         .then(() => {
//         setRemovedRoster(prev=>[...prev,id]);
//         getMyClubPlayers().then(res => setMyPlayers(res.data));
//         })
//         .catch(() => {});
// };
// const titles={Dashboard:"Club Dashboard","Job Offers":"Job Offers", Applications:"Applications","Requests":"Player Requests","My Athletes":"My Athletes",Notifications:"Notifications"};
// const subs={Dashboard:"Welcome back! Here's your recruitment overview.","Job Offers":"Post and manage your job offers.",Applications:"Review incoming applications.","Requests":"Players who sent you join requests.","My Athletes":"Full club roster & management.",Notifications:"Your latest activity and alerts."};

// return (
// <div style={{display:"flex",height:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",background:t.bg,color:t.text,overflow:"hidden"}}>
//     <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
//     ::-webkit-scrollbar{width:5px;}
//     ::-webkit-scrollbar-thumb{background:${t.scrollbar};border-radius:10px;}
//     *{box-sizing:border-box;}
//     select,input{outline:none;}
//     `}</style>

//     <ProfileModal athlete={profileAthlete} onClose={()=>setProfileAthlete(null)} sendOffer={sendOffer} removeOffer={removeOffer} offersSent={offersSent} t={t}/>

//     <Sidebar page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} unread={unread} t={t} navigate={navigate}/>

//     <div style={{flex:1,overflow:"auto",padding:"28px 28px 40px"}}>
//     <div style={{marginBottom:22}}>
//         <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,margin:"0 0 4px",color:t.text}}>{titles[page]}</h1>
//         <p style={{color:t.textMuted,margin:0,fontSize:13}}>{subs[page]}</p>
//     </div>
//     {page==="Dashboard" && <DashboardPage t={t} setPage={setPage} applications={applications} sendOffer={sendOffer} removeOffer={removeOffer} offersSent={offersSent} viewProfile={setProfileAthlete} clubUser={clubUser} />}
//     {page==="Search Athletes" && <SearchAthletesPage t={t} sendOffer={sendOffer} removeOffer={removeOffer} offersSent={offersSent} viewProfile={setProfileAthlete}/>}
//     {page==="Applications" && <ApplicationsPage t={t} applications={applications} updateAppStatus={updateAppStatus} clubRequests={clubRequests} updateRequestStatus={updateRequestStatus} setClubRequests={setClubRequests} setMyPlayers={setMyPlayers}/>}    {page==="My Athletes" && <MyAthletesPage t={t} offersSent={offersSent} removedRoster={removedRoster} removeFromRoster={removeFromRoster} viewProfile={setProfileAthlete} myPlayers={myPlayers}/>}
//     {page==="Job Offers" && (
//     <div>
//         <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
//         <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text}}>Job Offers</h2>
//         <button onClick={()=>setShowOfferForm(!showOfferForm)} style={{padding:"10px 20px",borderRadius:10,border:"none",background:t.btnPrimary,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
//             + New Offer
//         </button>
//         </div>

//         {showOfferForm && (
//         <div style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:20}}>
//             <h3 style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:16}}>Post New Job Offer</h3>
//             <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
//             {[
//                 ["Title","title","e.g. Looking for a Striker"],
//                 ["Position","position","e.g. ST, CM, GK"],
//                 ["Location","location","e.g. Cairo, Egypt"],
//                 ["Sport","sport","e.g. Football"],
//             ].map(([label,key,placeholder])=>(
//                 <div key={key}>
//                 <label style={{fontSize:12,fontWeight:600,color:t.textMuted,display:"block",marginBottom:4}}>{label}</label>
//                 <input
//                     placeholder={placeholder}
//                     value={offerForm[key]}
//                     onChange={e=>setOfferForm(prev=>({...prev,[key]:e.target.value}))}
//                     style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,outline:"none"}}
//                 />
//                 </div>
//             ))}
//             <div style={{gridColumn:"1/-1"}}>
//                 <label style={{fontSize:12,fontWeight:600,color:t.textMuted,display:"block",marginBottom:4}}>Description</label>
//                 <textarea
//                 placeholder="Describe the job offer..."
//                 value={offerForm.description}
//                 onChange={e=>setOfferForm(prev=>({...prev,description:e.target.value}))}
//                 style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,outline:"none",minHeight:80,resize:"vertical"}}
//                 />
//             </div>
//             </div>
//             <button
//             onClick={()=>{
//                 createJobOffer(offerForm)
//                 .then(()=>{
//                     getMyOffers().then(res=>setMyOffers(res.data));
//                     setShowOfferForm(false);
//                     setOfferForm({title:"",position:"",location:"",description:"",sport:""});
//                 })
//                 .catch(()=>{});
//             }}
//             style={{marginTop:16,padding:"10px 24px",borderRadius:10,border:"none",background:t.btnPrimary,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}
//             >
//             Post Offer
//             </button>
//         </div>
//         )}

//         {myOffers.length === 0
//         ? <div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>
//             <div style={{fontSize:40,marginBottom:12}}>💼</div>
//             <div style={{fontSize:16,fontWeight:600}}>No job offers yet</div>
//             </div>
//         : myOffers.map((offer,i)=>(
//             <div key={i} style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
//                 <div>
//                 <div style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:4}}>{offer.title}</div>
//                 <div style={{fontSize:12,color:t.textMuted}}>📍 {offer.location} • ⚽ {offer.sport} • 🎯 {offer.position}</div>
//                 <div style={{fontSize:11,color:t.textMuted,marginTop:4}}>{offer.description}</div>
//                 </div>
//                 <button
//                 onClick={()=>{
//                     deleteJobOffer(offer.id)
//                     .then(()=>setMyOffers(prev=>prev.filter(o=>o.id!==offer.id)))
//                     .catch(()=>{});
//                 }}
//                 style={{padding:"8px 16px",borderRadius:8,border:"none",background:`${t.red}15`,color:t.red,fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0}}
//                 >
//                 🗑 Delete
//                 </button>
//             </div>
//             ))
//         }
//     </div>
//     )}
//     {page==="Notifications" && <NotificationsPage t={t} notifications={dbNotifications} markAllRead={() => {
//         markAllNotifsRead().then(() => setDbNotifications(prev => prev.map(n => ({...n, is_read: true}))));
//         }} markRead={(id) => {
//         markNotifRead(id).then(() => setDbNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n)));
//         }}/>}
//     {page==="Requests" && (
//     <div>
//         {clubRequests.filter(r => r.source === "player").length === 0
//         ? <div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>
//             <div style={{fontSize:40,marginBottom:12}}>📨</div>
//             <div style={{fontSize:16,fontWeight:600}}>No requests yet</div>
//             </div>
//         : clubRequests.filter(r => r.source === "player").map((r, i) => (
//             <div key={i} style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
//                 <div style={{display:"flex",alignItems:"center",gap:14}}>
//                 <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff"}}>
//                     {r.player_name?.[0]}
//                 </div>
//                 <div>
//                     <div style={{fontWeight:700,fontSize:15,color:t.text}}>{r.player_name}</div>
//                     <div style={{fontSize:12,color:t.textMuted}}>{r.position}</div>
//                     <div style={{fontSize:11,color:t.textMuted,marginTop:2}}>
//                     Applied: {new Date(r.applied_at).toLocaleDateString()}
//                     </div>
//                 </div>
//                 </div>
//                 <div style={{display:"flex",gap:10,alignItems:"center"}}>
//                 <span style={{
//                     background: r.status==="pending"?"#fef9c3": r.status==="accepted"?"#dcfce7":"#fee2e2",
//                     color: r.status==="pending"?"#ca8a04": r.status==="accepted"?"#16a34a":"#dc2626",
//                     borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700
//                 }}>{r.status}</span>
//                 {r.status === "pending" && (
//                     <>
//                         <button 
//                         style={{padding:"8px 16px",borderRadius:8,border:"none",background:t.green,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}
//                         onClick={() => {
//                         updateRequestStatus(r.id, "accepted")
//                             .then(() => {
//                             setClubRequests(prev => prev.map(req => 
//                                 req.id === r.id ? {...req, status: "accepted"} : req
//                             ));
//                             getMyClubPlayers().then(res => setMyPlayers(res.data));
//                             })
//                             .catch(() => {});
//                         }}
//                         >
//                         ✓ Accept
//                         </button>
//                         <button 
//                         style={{padding:"8px 16px",borderRadius:8,border:"none",background:t.red,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}
//                         onClick={() => {
//                             updateRequestStatus(r.id, "rejected")
//                             .then(() => {
//                                 setClubRequests(prev => prev.map(req => 
//                                 req.id === r.id ? {...req, status: "rejected"} : req
//                                 ));
//                             })
//                             .catch(() => {});
//                         }}
//                         >
//                         ✕ Reject
//                         </button>
//                     </>
//                     )}
//                 </div>
//             </div>
//             ))
//         }
// </div>
// )}
//     </div>
// </div>
// );
// }
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getMe, getAllPlayers, getNotifications, markNotifRead, markAllNotifsRead, getClubRequests, updateRequestStatus, getMyClubPlayers, createJobOffer, getMyOffers, deleteJobOffer, offerPlayer, getSentOffers, cancelOffer, removePlayerFromClub } from '../services/api';

function load(key, fallback) {
try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
catch { return fallback; }
}
function save(key, value) {
try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const themes = {
dark: {
bg:"#0f1117",sidebar:"#13151e",card:"#1a1d2e",cardAlt:"#1e2235",
border:"#2a2d3e",text:"#e8eaf6",textMuted:"#7b7f9e",textSub:"#4a4f6a",
accent:"#6c63ff",accentGlow:"rgba(108,99,255,0.18)",green:"#00e676",
blue:"#29b6f6",orange:"#ffa726",red:"#ef5350",
navHover:"#23263a",btnPrimary:"linear-gradient(135deg,#6c63ff,#8b5cf6)",
matchGreen:"#00e676",tagBg:"#23263a",tagText:"#9fa4c4",
scrollbar:"#2a2d3e",shadow:"0 4px 32px rgba(0,0,0,0.4)",
progressBg:"#2a2d3e",inputBg:"#1e2235",inputBorder:"#2a2d3e",
},
light: {
bg:"#f0f2fa",sidebar:"#ffffff",card:"#ffffff",cardAlt:"#f7f8fc",
border:"#e2e5f1",text:"#1a1d2e",textMuted:"#6b7280",textSub:"#9ca3af",
accent:"#6c63ff",accentGlow:"rgba(108,99,255,0.10)",green:"#10b981",
blue:"#3b82f6",orange:"#f59e0b",red:"#ef4444",
navHover:"#f0f2fa",btnPrimary:"linear-gradient(135deg,#6c63ff,#8b5cf6)",
matchGreen:"#10b981",tagBg:"#ede9fe",tagText:"#6c63ff",
scrollbar:"#e2e5f1",shadow:"0 4px 32px rgba(108,99,255,0.07)",
progressBg:"#e2e5f1",inputBg:"#f7f8fc",inputBorder:"#e2e5f1",
},
};

const ALL_ATHLETES = [
{id:1,initials:"MS",color:"#6c63ff",name:"Marcus Silva",role:"Forward",age:19,location:"São Paulo, Brazil",match:98,tags:["Speed","Dribbling","Finishing"],goals:24,assists:12,matches:31,nationality:"🇧🇷",height:"1.82m",foot:"Right"},
{id:2,initials:"ER",color:"#00b4d8",name:"Emma Rodriguez",role:"Midfielder",age:20,location:"Madrid, Spain",match:94,tags:["Passing","Vision","Technique"],goals:8,assists:19,matches:28,nationality:"🇪🇸",height:"1.68m",foot:"Left"},
{id:3,initials:"JT",color:"#f59e0b",name:"James Thompson",role:"Defender",age:21,location:"London, UK",match:92,tags:["Tackling","Positioning","Heading"],goals:3,assists:5,matches:30,nationality:"🇬🇧",height:"1.88m",foot:"Right"},
{id:4,initials:"AK",color:"#10b981",name:"Ahmed Karim",role:"Forward",age:18,location:"Cairo, Egypt",match:89,tags:["Speed","Finishing","Agility"],goals:18,assists:7,matches:25,nationality:"🇪🇬",height:"1.78m",foot:"Right"},
{id:5,initials:"LP",color:"#f43f5e",name:"Lucas Petit",role:"Goalkeeper",age:22,location:"Paris, France",match:87,tags:["Reflexes","Positioning","Distribution"],goals:0,assists:1,matches:26,nationality:"🇫🇷",height:"1.92m",foot:"Right"},
{id:6,initials:"YN",color:"#8b5cf6",name:"Yuki Nakamura",role:"Midfielder",age:20,location:"Tokyo, Japan",match:85,tags:["Technique","Vision","Work Rate"],goals:11,assists:14,matches:29,nationality:"🇯🇵",height:"1.74m",foot:"Both"},
{id:7,initials:"CR",color:"#06b6d4",name:"Carlos Reyes",role:"Defender",age:23,location:"Buenos Aires, Argentina",match:83,tags:["Strength","Aerial","Leadership"],goals:5,assists:3,matches:33,nationality:"🇦🇷",height:"1.90m",foot:"Right"},
{id:8,initials:"FO",color:"#f97316",name:"Folake Okafor",role:"Forward",age:19,location:"Lagos, Nigeria",match:91,tags:["Speed","Power","Finishing"],goals:21,assists:9,matches:27,nationality:"🇳🇬",height:"1.76m",foot:"Left"},
];

const INITIAL_APPLICATIONS = [
{id:1,athleteId:4,status:"pending",date:"2026-03-10",message:"I am very interested in joining FC Barcelona Academy. I believe I can contribute greatly to the team."},
{id:2,athleteId:6,status:"pending",date:"2026-03-09",message:"FC Barcelona Academy is my dream club. I have been training professionally for 5 years."},
{id:3,athleteId:8,status:"accepted",date:"2026-03-07",message:"I recently won the West Africa youth championship and would love the opportunity to develop at your academy."},
{id:4,athleteId:7,status:"rejected",date:"2026-03-05",message:"I am a strong defender with 3 years of professional experience."},
{id:5,athleteId:5,status:"pending",date:"2026-03-03",message:"I have been training as a goalkeeper since age 12. I was recently named best GK in the French youth league."},
];

const INITIAL_NOTIFS = [
{id:1,type:"accepted",text:"Folake Okafor accepted your offer request!",time:"1 hour ago",read:false,athleteId:8},
{id:2,type:"application",text:"Yuki Nakamura sent you a new application!",time:"3 hours ago",read:false,athleteId:6},
{id:3,type:"application",text:"Ahmed Karim sent you a new application!",time:"5 hours ago",read:true,athleteId:4},
{id:4,type:"accepted",text:"Carlos Reyes accepted your connection request!",time:"1 day ago",read:true,athleteId:7},
];

// ── SHARED ────────────────────────────────────────────────────────────────────
function Avatar({initials,color,size=42}){
return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color},${color}aa)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.35,color:"#fff",flexShrink:0,boxShadow:`0 2px 12px ${color}44`}}>{initials}</div>;
}
function Tag({label,t}){
return <span style={{background:t.tagBg,color:t.tagText,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{label}</span>;
}
function StatusBadge({status,t}){
const m={pending:{c:t.orange,l:"Pending"},accepted:{c:t.green,l:"Accepted"},rejected:{c:t.red,l:"Rejected"}};
const s=m[status]||m.pending;
return <span style={{background:`${s.c}20`,color:s.c,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s.l}</span>;
}

// ── OFFER TOGGLE BUTTON — used everywhere ─────────────────────────────────────
function OfferBtn({athleteId,sent,sendOffer,removeOffer,t,full=false}){
return (
<button
    onClick={()=> sent ? removeOffer(athleteId) : sendOffer(athleteId)}
    style={{
    flex: full ? 1 : "unset",
    padding: full ? "8px 0" : "8px 16px",
    borderRadius:8,
    border: sent ? `1.5px solid ${t.red}` : `1.5px solid ${t.accent}`,
    background: sent ? `${t.red}12` : "transparent",
    color: sent ? t.red : t.accent,
    fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
    transition:"all 0.2s",
    }}
>
    {sent ? "🗑 Remove Offer" : "📨 Send Offer"}
</button>
);
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV=[
{icon:"⊞",label:"Dashboard"},
{icon:"🔍",label:"Search Athletes"},
{icon:"📋",label:"Applications"},
{icon:"📨",label:"Requests"},
{icon:"💼",label:"Job Offers"},
{icon:"👥",label:"My Athletes"},
{icon:"🔔",label:"Notifications"},
];

function Sidebar({page,setPage,darkMode,setDarkMode,unread,t,navigate,isMobile}){
if(isMobile){
  return (
    <div style={{
      position:"fixed",bottom:0,left:0,right:0,
      background:t.sidebar,
      borderTop:`1px solid ${t.border}`,
      display:"flex",alignItems:"center",justifyContent:"space-around",
      padding:"6px 4px",zIndex:1000,
      boxShadow:"0 -4px 20px rgba(0,0,0,0.15)",
    }}>
      {NAV.map(item=>(
        <button key={item.label} onClick={()=>setPage(item.label)} style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:2,
          padding:"6px 8px",borderRadius:10,border:"none",
          background:page===item.label?t.accentGlow:"transparent",
          color:page===item.label?t.accent:t.textMuted,
          fontWeight:page===item.label?700:500,fontSize:9,cursor:"pointer",
          fontFamily:"inherit",position:"relative",minWidth:36,
          transition:"all 0.15s",
        }}>
          <span style={{fontSize:18}}>{item.icon}</span>
          <span style={{fontSize:8,whiteSpace:"nowrap",overflow:"hidden",maxWidth:52,textOverflow:"ellipsis"}}>{item.label}</span>
          {item.label==="Notifications"&&unread>0&&(
            <span style={{position:"absolute",top:2,right:4,background:t.accent,color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>
          )}
        </button>
      ))}
    </div>
  );
}

return (
<div style={{width:200,background:t.sidebar,display:"flex",flexDirection:"column",padding:"0 0 20px",borderRight:`1px solid ${t.border}`,flexShrink:0,transition:"background 0.3s"}}>
    <div style={{padding:"24px 20px 20px",display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:36,height:36,borderRadius:10,background:t.btnPrimary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚽</div>
    <div>
        <div style={{fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",color:t.text}}>SportScout</div>
        <div style={{fontSize:10,color:t.textMuted}}>Club Portal</div>
    </div>
    </div>
    <nav style={{flex:1,padding:"0 10px"}}>
    {NAV.map(item=>(
        <button key={item.label} onClick={()=>setPage(item.label)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:page===item.label?t.accentGlow:"transparent",color:page===item.label?t.accent:t.textMuted,fontWeight:page===item.label?700:500,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:2,borderLeft:page===item.label?`3px solid ${t.accent}`:"3px solid transparent",transition:"all 0.15s"}}
        onMouseEnter={e=>{if(page!==item.label)e.currentTarget.style.background=t.navHover;}}
        onMouseLeave={e=>{if(page!==item.label)e.currentTarget.style.background="transparent";}}
        >
        <span style={{fontSize:15}}>{item.icon}</span>
        {item.label}
        {item.label==="Notifications"&&unread>0&&(
            <span style={{marginLeft:"auto",background:t.accent,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{unread}</span>
        )}
        </button>
    ))}
    </nav>
    <div style={{padding:"0 20px 10px"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{fontSize:12,color:t.textMuted}}>{darkMode?"🌙 Dark":"☀️ Light"}</span>
        <div onClick={()=>setDarkMode(!darkMode)} style={{width:38,height:20,borderRadius:20,cursor:"pointer",background:darkMode?t.accent:t.progressBg,position:"relative",transition:"background 0.3s",marginLeft:"auto"}}>
        <div style={{position:"absolute",width:14,height:14,borderRadius:"50%",background:"#fff",top:3,transition:"left 0.3s",left:darkMode?21:3}}/>
        </div>
    </div>
    <button 
        onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }}
        style={{width:"100%",padding:"9px 0",borderRadius:10,background:"transparent",color:t.textMuted,border:`1px solid ${t.border}`,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}
        >
        ← Logout
        </button>
    </div>
</div>
);
}

// ── PROFILE MODAL ─────────────────────────────────────────────────────────────
function ProfileModal({athlete,onClose,sendOffer,removeOffer,offersSent,t}){
if(!athlete) return null;
const a=athlete;
const sent=offersSent.includes(a.id);
return (
<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:20,padding:28,border:`1px solid ${t.border}`,boxShadow:"0 8px 48px rgba(0,0,0,0.5)",maxWidth:520,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontWeight:700,fontSize:15,color:t.text}}>Athlete Profile</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:24,lineHeight:1}}>×</button>
    </div>
    <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:20,flexWrap:"wrap"}}>
        <Avatar initials={a.initials} color={a.color} size={72}/>
        <div style={{flex:1,minWidth:160}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,marginBottom:4}}>{a.nationality} {a.name}</div>
        <div style={{color:t.textMuted,fontSize:14,marginBottom:4}}>{a.role} • {a.age} yrs • {a.height} • {a.foot} foot</div>
        <div style={{color:t.textMuted,fontSize:12,marginBottom:10}}>📍 {a.location}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {a.tags.map(tag=><Tag key={tag} label={tag} t={t}/>)}
        </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{color:t.matchGreen,fontWeight:900,fontSize:28,fontFamily:"'Syne',sans-serif"}}>{a.match}%</div>
        <div style={{color:t.matchGreen,fontSize:11,fontWeight:700,background:`${t.matchGreen}18`,padding:"2px 8px",borderRadius:20}}>Match</div>
        </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[["⚽","Goals",a.goals],["🎯","Assists",a.assists],["🏟","Matches",a.matches]].map(([ic,l,v])=>(
        <div key={l} style={{background:t.cardAlt,borderRadius:12,padding:14,border:`1px solid ${t.border}`,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>{ic}</div>
            <div style={{fontSize:22,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif"}}>{v}</div>
            <div style={{fontSize:11,color:t.textMuted}}>{l}</div>
        </div>
        ))}
    </div>
    <div style={{display:"flex",gap:10}}>
        <OfferBtn athleteId={a.id} sent={sent} sendOffer={sendOffer} removeOffer={removeOffer} t={t} full/>
        <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,border:`1px solid ${t.border}`,background:"transparent",color:t.textMuted,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
    </div>
    </div>
</div>
);
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardPage({t, setPage, applications, sendOffer, removeOffer, offersSent, viewProfile, clubUser, isMobile}){
const activity=[
{id:1,name:"Alex Johnson",action:"Application accepted",time:"2 hours ago",icon:"✓",color:t.green},
{id:2,name:"Sarah Chen",action:"Viewed your profile",time:"4 hours ago",icon:"👁",color:t.blue},
{id:3,name:"David Martinez",action:"New application",time:"6 hours ago",icon:"★",color:t.orange},
{id:4,name:"Liao Wang",action:"Application declined",time:"1 day ago",icon:"✕",color:t.red},
{id:5,name:"Tom Wilson",action:"Viewed your profile",time:"1 day ago",icon:"👁",color:t.blue},
{id:6,name:"Nina Patel",action:"Application accepted",time:"2 days ago",icon:"✓",color:t.green},
];
const pending=applications.filter(a=>a.status==="pending").length;
const accepted=applications.filter(a=>a.status==="accepted").length;
return (
<div style={{display:"flex",gap:20,alignItems:"flex-start",flexDirection:isMobile?"column":"row"}}>
    <div style={{flex:1,minWidth:0,width:"100%"}}>
    <div style={{background:t.card,borderRadius:18,padding:20,border:`1px solid ${t.border}`,marginBottom:20,boxShadow:t.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontWeight:700,fontSize:15,color:t.text}}>Club Profile</span>
        <button style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:16}}>✏</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:16}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff",marginBottom:10}}>
        {clubUser?.full_name
            ? clubUser.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)
            : "FC"}
        </div>
        <div style={{fontWeight:800,fontSize:16,color:t.text,fontFamily:"'Syne',sans-serif"}}>
        {clubUser?.full_name
        ? clubUser.full_name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "Club Name"}
        </div>
        <div style={{color:t.textMuted,fontSize:12}}>
        {clubUser?.sport || "Sports Club"}
        </div>
        </div>
        {[
            ["📍", clubUser?.city || clubUser?.location || "—"],
            ["✉",  clubUser?.email || "—"],
            ["📞", clubUser?.phone || "—"],
            ].map(([ic,v])=>(
        <div key={ic} style={{display:"flex",gap:8,fontSize:12,color:t.textMuted,marginBottom:6}}><span>{ic}</span>{v}</div>
        ))}
        <div style={{marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:t.textMuted,fontWeight:600}}>Profile Completion</span>
            <span style={{fontSize:12,color:t.accent,fontWeight:700}}>96%</span>
        </div>
        <div style={{height:6,borderRadius:10,background:t.progressBg,overflow:"hidden"}}>
            <div style={{height:"100%",width:"96%",borderRadius:10,background:"linear-gradient(90deg,#6c63ff,#8b5cf6,#00e676)"}}/>
        </div>
        </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[{icon:"📋",value:pending,label:"Pending Applications",change:12},{icon:"👥",value:accepted,label:"Accepted Athletes",change:8},{icon:"👁",value:3482,label:"Total Profile Views",change:25}].map(s=>(
        <div key={s.label} style={{background:t.cardAlt,borderRadius:14,padding:"16px 18px",flex:1,border:`1px solid ${t.border}`,display:"flex",flexDirection:"column",gap:6,gridColumn:isMobile&&s.label==="Total Profile Views"?"1 / -1":"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:22}}>{s.icon}</span>
            <span style={{color:t.green,fontSize:11,fontWeight:700,background:`${t.green}18`,padding:"2px 7px",borderRadius:20}}>↑{s.change}%</span>
            </div>
            <div style={{fontSize:26,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif",letterSpacing:-1}}>{s.value.toLocaleString()}</div>
            <div style={{fontSize:11,color:t.textMuted,fontWeight:500}}>{s.label}</div>
        </div>
        ))}
    </div>
    <div style={{background:t.card,borderRadius:18,padding:20,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>🤖</span>
            <span style={{fontWeight:700,fontSize:15,color:t.text}}>AI Recommended Athletes</span>
        </div>
        <button onClick={()=>setPage("Search Athletes")} style={{background:"none",border:"none",color:t.accent,fontWeight:600,fontSize:12,cursor:"pointer"}}>View All</button>
        </div>
        {ALL_ATHLETES.slice(0,3).map(a=>(
        <MiniCard key={a.id} athlete={a} t={t} sendOffer={sendOffer} removeOffer={removeOffer} sent={offersSent.includes(a.id)} viewProfile={viewProfile}/>
        ))}
    </div>
    </div>
    {!isMobile && (
    <div style={{width:240,flexShrink:0}}>
    <div style={{background:t.card,borderRadius:18,padding:20,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontWeight:700,fontSize:15,color:t.text}}>Recent Activity</span>
        <button style={{background:"none",border:"none",color:t.accent,fontWeight:600,fontSize:12,cursor:"pointer"}}>View All</button>
        </div>
        {activity.map(item=>(
        <div key={item.id} style={{display:"flex",gap:10,padding:"10px 8px",borderRadius:10,cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.navHover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
        >
            <div style={{width:28,height:28,borderRadius:"50%",background:`${item.color}22`,color:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,fontWeight:700}}>{item.icon}</div>
            <div>
            <div style={{fontSize:12,fontWeight:700,color:t.text}}>{item.name}</div>
            <div style={{fontSize:11,color:t.textMuted}}>{item.action}</div>
            <div style={{fontSize:10,color:t.textSub,marginTop:2}}>{item.time}</div>
            </div>
        </div>
        ))}
    </div>
    </div>
    )}
</div>
);
}

function MiniCard({athlete,t,sendOffer,removeOffer,sent,viewProfile}){
return (
<div style={{background:t.cardAlt,borderRadius:14,padding:16,border:`1px solid ${t.border}`,marginBottom:10,transition:"border-color 0.2s"}}
    onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent}
    onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}
>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
    <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <Avatar initials={athlete.initials} color={athlete.color} size={44}/>
        <div>
        <div style={{fontWeight:700,color:t.text,fontSize:15}}>{athlete.name}</div>
        <div style={{color:t.textMuted,fontSize:12}}>{athlete.role} • {athlete.age} yrs</div>
        <div style={{color:t.textMuted,fontSize:11,marginTop:2}}>📍 {athlete.location}</div>
        </div>
    </div>
    <div style={{textAlign:"right"}}>
        <div style={{color:t.matchGreen,fontWeight:800,fontSize:18}}>{athlete.match}%</div>
        <div style={{color:t.matchGreen,fontSize:10,fontWeight:600,background:`${t.matchGreen}18`,padding:"1px 7px",borderRadius:20}}>Match</div>
    </div>
    </div>
    <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
    {athlete.tags.map(tag=><Tag key={tag} label={tag} t={t}/>)}
    </div>
    <div style={{display:"flex",gap:20,margin:"12px 0"}}>
    {[["Goals",athlete.goals],["Assists",athlete.assists],["Matches",athlete.matches]].map(([l,v])=>(
        <div key={l} style={{textAlign:"center"}}>
        <div style={{fontSize:16,fontWeight:800,color:t.text}}>{v}</div>
        <div style={{fontSize:10,color:t.textMuted}}>{l}</div>
        </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8}}>
    <button onClick={()=>viewProfile(athlete)} style={{flex:1,padding:"8px 0",borderRadius:8,background:t.btnPrimary,color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
        👤 View Profile
    </button>
    <OfferBtn athleteId={athlete.id} sent={sent} sendOffer={sendOffer} removeOffer={removeOffer} t={t} full/>
    </div>
</div>
);
}

// ── SEARCH PAGE ───────────────────────────────────────────────────────────────
function SearchAthletesPage({t,sendOffer,removeOffer,offersSent,viewProfile}){
const [query,setQuery]=useState("");
const [role,setRole]=useState("All");
const [sort,setSort]=useState("match");
const [dbAthletes, setDbAthletes] = useState([]);
const [sentOffers, setSentOffers] = useState([]);
const roles=["All","Forward","Midfielder","Defender","Goalkeeper"];
const filtered = dbAthletes
    .filter(a => (role === "All" || a.sport === role) && (
        a.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        a.city?.toLowerCase().includes(query.toLowerCase())
    ))
.sort((a,b)=>sort==="match"?b.match-a.match:sort==="age"?a.age-b.age:a.name.localeCompare(b.name));
    useEffect(() => {
        getAllPlayers()
            .then(res => {
            const mapped = res.data.map(p => ({
                ...p,
                name: p.full_name,
                nationality: "🏃",
                match: p.matches > 0 ? Math.round((p.goals / p.matches) * 100) : 0,
                tags: [p.sport || "—", p.position || "—"].filter(t => t !== "—"),
                location: p.city || "—",
                height: p.height_cm ? p.height_cm + " cm" : "—",
                foot: "—",
                goals: p.goals || 0,
                assists: p.assists || 0,
                matches: p.matches || 0,
                initials: p.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2),
                color: "#6c63ff",
            }));
            setDbAthletes(mapped);
            })
            .catch(() => {});

        getSentOffers()
            .then(res => setSentOffers(res.data))
            .catch(() => {});
        }, []);
return (
<div>
    <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:"0 0 4px"}}>Search Athletes</h2>
    <p style={{color:t.textMuted,fontSize:13,margin:"0 0 20px"}}>Find and recruit the best talent from around the world</p>
    <div style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:20,display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
    <input placeholder="🔍  Search by name, location or skill..." value={query} onChange={e=>setQuery(e.target.value)}
        style={{flex:1,minWidth:200,padding:"10px 14px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,fontFamily:"inherit",width:"100%"}}/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",width:"100%"}}>
        {roles.map(r=>(
        <button key={r} onClick={()=>setRole(r)} style={{padding:"8px 14px",borderRadius:20,border:role!==r?`1px solid ${t.border}`:"none",cursor:"pointer",background:role===r?t.btnPrimary:t.cardAlt,color:role===r?"#fff":t.textMuted,fontWeight:600,fontSize:12,fontFamily:"inherit"}}>{r}</button>
        ))}
    </div>
    <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"9px 12px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:12,fontFamily:"inherit",cursor:"pointer",width:"100%"}}>
        <option value="match">Best Match</option>
        <option value="age">Youngest</option>
        <option value="name">Name A–Z</option>
    </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
    {filtered.length===0
        ?<div style={{color:t.textMuted,gridColumn:"1/-1",textAlign:"center",padding:40}}>No athletes found.</div>
        :filtered.map(a=>(
            <SearchCard key={a.id} athlete={a} t={t}
                sendOffer={sendOffer} removeOffer={removeOffer}
                sent={offersSent.includes(a.id)} viewProfile={viewProfile}
                offerSent={sentOffers.find(o => o.user_id === a.id)}
                onOffer={() => {
                const existingOffer = sentOffers.find(o => o.user_id === a.id);
                
                if (existingOffer?.status === "accepted" || existingOffer?.status === "rejected") return;
                
                if (existingOffer) {
                    cancelOffer(a.id)
                    .then(() => setSentOffers(prev => prev.filter(o => o.user_id !== a.id)))
                    .catch(() => {});
                } else {
                    offerPlayer(a.id)
                    .then(() => setSentOffers(prev => [...prev, { user_id: a.id, status: "pending" }]))
                    .catch(() => {});
                }
                }}
            />
            ))
    }
    </div>
</div>
);
}

function SearchCard({athlete,t,sendOffer,removeOffer,sent,viewProfile,offerSent,onOffer}){
    const [exp,setExp]=useState(false);
return (
<div style={{background:t.card,borderRadius:16,padding:18,border:`1px solid ${t.border}`,boxShadow:t.shadow,transition:"border-color 0.2s,transform 0.2s"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.transform="translateY(-2px)";}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.transform="translateY(0)";}}
>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
    <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <Avatar initials={athlete.initials} color={athlete.color} size={48}/>
        <div>
        <div style={{fontWeight:800,color:t.text,fontSize:15}}>{athlete.nationality} {athlete.name}</div>
        <div style={{color:t.textMuted,fontSize:12,marginTop:2}}>{athlete.role} • {athlete.age} yrs</div>
        <div style={{color:t.textMuted,fontSize:11,marginTop:2}}>📍 {athlete.location}</div>
        </div>
    </div>
    <div style={{textAlign:"right"}}>
        <div style={{color:t.matchGreen,fontWeight:900,fontSize:20,fontFamily:"'Syne',sans-serif"}}>{athlete.match}%</div>
        <div style={{color:t.matchGreen,fontSize:10,fontWeight:700,background:`${t.matchGreen}18`,padding:"2px 8px",borderRadius:20}}>Match</div>
    </div>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
    {(athlete.tags || []).map(tag=><Tag key={tag} label={tag} t={t}/>)}
    <span style={{background:`${t.blue}18`,color:t.blue,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>⚽ {athlete.foot}</span>
    </div>
    <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${t.border}`,marginBottom:14}}>
    {[["Goals",athlete.goals],["Assists",athlete.assists],["Matches",athlete.matches]].map(([l,v],i)=>(
        <div key={l} style={{flex:1,textAlign:"center",padding:"10px 0",borderRight:i<2?`1px solid ${t.border}`:"none"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text}}>{v}</div>
        <div style={{fontSize:10,color:t.textMuted}}>{l}</div>
        </div>
    ))}
    </div>
    {exp&&(
    <div style={{background:t.cardAlt,borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:t.textMuted,lineHeight:1.8}}>
        <div><b style={{color:t.text}}>Height:</b> {athlete.height}</div>
        <div><b style={{color:t.text}}>Preferred Foot:</b> {athlete.foot}</div>
        <div><b style={{color:t.text}}>Location:</b> {athlete.location}</div>
    </div>
    )}
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
    <button
        onClick={onOffer}
        style={{
            flex:1,
            padding:"8px 0",
            borderRadius:8,
            border: offerSent?.status === "accepted" ? `1.5px solid ${t.green}` :
                    offerSent?.status === "rejected" ? `1.5px solid ${t.red}` :
                    offerSent ? `1.5px solid ${t.orange}` : `1.5px solid ${t.accent}`,
            background: offerSent?.status === "accepted" ? `${t.green}12` :
                        offerSent?.status === "rejected" ? `${t.red}12` :
                        offerSent ? `${t.orange}12` : "transparent",
            color: offerSent?.status === "accepted" ? t.green :
                offerSent?.status === "rejected" ? t.red :
                offerSent ? t.orange : t.accent,
            fontWeight:700, fontSize:13, 
            cursor: offerSent?.status === "accepted" || offerSent?.status === "rejected" ? "default" : "pointer",
            fontFamily:"inherit",
        }}
        >
        {offerSent?.status === "accepted" ? "Accepted" :
        offerSent?.status === "rejected" ? "Rejected" :
        offerSent ? "🗑 Remove Offer" : "📨 Send Offer"}
    </button>
    <button onClick={()=>setExp(!exp)} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>{exp?"▲":"▼"}</button>
    </div>
</div>
);
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────────
function ApplicationsPage({t, applications, updateAppStatus, clubRequests, updateRequestStatus, setClubRequests, setMyPlayers}){
const [filter,setFilter]=useState("All");
const allApps = clubRequests.filter(r => r.source === "cv");
const filtered = allApps.filter(app => filter === "All" || app.status === filter);
return (
<div>
    <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:"0 0 4px"}}>Applications</h2>
    <p style={{color:t.textMuted,fontSize:13,margin:"0 0 20px"}}>Review athletes who applied to join your club</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
    {[{l:"Total",c:t.accent,v:allApps.length},{l:"Pending",c:t.orange,v:allApps.filter(a=>a.status==="pending").length},{l:"Accepted",c:t.green,v:allApps.filter(a=>a.status==="accepted").length},{l:"Rejected",c:t.red,v:allApps.filter(a=>a.status==="rejected").length}].map(s=>(
        <div key={s.l} style={{flex:1,background:t.card,borderRadius:14,padding:"14px 18px",border:`1px solid ${t.border}`,display:"flex",flexDirection:"column",gap:4}}>
        <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
        <div style={{fontSize:12,color:t.textMuted}}>{s.l}</div>
        </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
    {["All","pending","accepted","rejected"].map(f=>(
        <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 18px",borderRadius:20,border:filter!==f?`1px solid ${t.border}`:"none",cursor:"pointer",background:filter===f?t.btnPrimary:t.card,color:filter===f?"#fff":t.textMuted,fontWeight:600,fontSize:12,fontFamily:"inherit",textTransform:"capitalize"}}>
        {f==="All"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
        </button>
    ))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
    {filtered.length===0
        ?<div style={{color:t.textMuted,textAlign:"center",padding:40}}>No applications found.</div>
        :filtered.map(app=>{
        const playerName = app.player_name || "Unknown Player";
        const position = app.position || "—";
        const score = app.score ?? null;
        const initials = playerName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
        return (
            <div key={app.id} style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff"}}>{initials}</div>
                <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontWeight:800,color:t.text,fontSize:17}}>{playerName}</span>
                    <StatusBadge status={app.status} t={t}/>
                    </div>
                    <div style={{color:t.textMuted,fontSize:13,marginTop:2}}>{position}</div>
                    <div style={{color:t.textSub,fontSize:11,marginTop:4}}>Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
                </div>
                </div>
                {score !== null && score > 0 && (
                <div style={{textAlign:"right"}}>
                    <div style={{color:t.matchGreen,fontWeight:900,fontSize:22}}>{score}%</div>
                    <div style={{color:t.textMuted,fontSize:11}}>Match Score</div>
                </div>
                )}
            </div>
            {app.status === "pending" && (
                <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
                <button onClick={()=>{
                    updateRequestStatus(app.id,"accepted")
                    .then(()=>{
                        setClubRequests(prev=>prev.map(r=>r.id===app.id?{...r,status:"accepted"}:r));
                        getMyClubPlayers().then(res=>setMyPlayers(res.data));
                    }).catch(()=>{});
                }} style={{padding:"9px 22px",borderRadius:10,border:"none",cursor:"pointer",background:t.green,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>✓ Accept</button>
                <button onClick={()=>{
                    updateRequestStatus(app.id,"rejected")
                    .then(()=>setClubRequests(prev=>prev.map(r=>r.id===app.id?{...r,status:"rejected"}:r)))
                    .catch(()=>{});
                }} style={{padding:"9px 22px",borderRadius:10,cursor:"pointer",background:`${t.red}20`,color:t.red,fontWeight:700,fontSize:13,fontFamily:"inherit",border:`1.5px solid ${t.red}`}}>✕ Decline</button>
                </div>
            )}
            {app.status === "accepted" && (
                <div style={{fontSize:13,color:t.textMuted,fontStyle:"italic",marginTop:14}}>✓ You accepted this application.</div>
            )}
            {app.status === "rejected" && (
                <div style={{fontSize:13,color:t.textMuted,fontStyle:"italic",marginTop:14}}>✕ You declined this application.</div>
            )}
            </div>
        );
        })
    }
    </div>
</div>
);
}

// ── MY ATHLETES ───────────────────────────────────────────────────────────────
function MyAthletesPage({t,offersSent,removedRoster,removeFromRoster,viewProfile,myPlayers}){
const [view,setView]=useState("grid");
const [roleFilter,setRoleFilter]=useState("All");
const [statusFilter,setStatusFilter]=useState("All");
const [query,setQuery]=useState("");
const [selected,setSelected]=useState(null);
const [confirmRemove,setConfirmRemove]=useState(null);

const allRoster = myPlayers.map(p => ({
    ...p,
    initials: p.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2),
    color: "#6c63ff",
    name: p.full_name,
    role: p.position || "Player",
    location: p.city || "—",
    nationality: "🏃",
    height: p.height_cm ? p.height_cm + "m" : "—",
    foot: "—",
    tags: [p.sport || "—"],
    goals: p.goals || 0,
    assists: p.assists || 0,
    matches: p.matches || 0,
    shot_accuracy: p.shot_accuracy || 0,
    win_rate: p.win_rate || 0,
    games_played: p.games_played || 0,
    joined: "—",
    contract: "—",
    number: p.id,
    status: "active",
})).filter(a => !removedRoster.includes(a.id));

const doRemove=(id)=>{ removeFromRoster(id); setConfirmRemove(null); setSelected(null); };

const roles=["All","Forward","Midfielder","Defender","Goalkeeper"];
const filtered=allRoster.filter(a=>
(roleFilter==="All"||a.role===roleFilter)&&
(statusFilter==="All"||a.status===statusFilter)&&
(a.name.toLowerCase().includes(query.toLowerCase())||a.role.toLowerCase().includes(query.toLowerCase()))
);
const byRole=roles.slice(1).map(r=>({role:r,count:allRoster.filter(a=>a.role===r).length}));

const ConfirmModal=()=>confirmRemove?(
<div onClick={()=>setConfirmRemove(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:20,padding:32,border:`1px solid ${t.border}`,boxShadow:"0 8px 48px rgba(0,0,0,0.5)",maxWidth:400,width:"90%",textAlign:"center"}}>
    <div style={{width:60,height:60,borderRadius:"50%",background:`${t.red}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>⚠️</div>
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:t.text,marginBottom:8}}>Remove Athlete?</div>
    <div style={{color:t.textMuted,fontSize:14,marginBottom:24}}>You're about to remove <b style={{color:t.text}}>{confirmRemove.name}</b> from the club roster. This cannot be undone.</div>
    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button onClick={()=>setConfirmRemove(null)} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${t.border}`,background:"transparent",color:t.textMuted,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
        <button onClick={()=>doRemove(confirmRemove.id)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:t.red,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Yes, Remove</button>
    </div>
    </div>
</div>
):null;

if(selected){
const a=selected;
return (
    <div>
    <ConfirmModal/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:t.accent,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>← Back to Roster</button>
        <button onClick={()=>setConfirmRemove(a)} style={{padding:"9px 20px",borderRadius:10,border:`1.5px solid ${t.red}`,background:`${t.red}12`,color:t.red,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>🗑 Remove from Club</button>
    </div>
    <div style={{background:t.card,borderRadius:20,padding:28,border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
        <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <Avatar initials={a.initials} color={a.color} size={90}/>
            <span style={{background:`${a.status==="active"?t.green:t.orange}18`,color:a.status==="active"?t.green:t.orange,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700}}>{a.status==="active"?"● Active":"⚠ Injured"}</span>
            <div style={{width:42,height:42,borderRadius:10,background:t.cardAlt,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:t.accent}}>#{a.number}</div>
        </div>
        <div style={{flex:1,minWidth:200}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:t.text,marginBottom:4}}>{a.nationality} {a.name}</div>
            <div style={{color:t.textMuted,fontSize:15,marginBottom:16}}>{a.role} • {a.age} yrs • {a.height} • {a.foot} foot</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>{a.tags.map(tag=><Tag key={tag} label={tag} t={t}/>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
            {[["📍","Location",a.location],["📅","Joined",a.joined],["📄","Contract Until",a.contract]].map(([ic,l,v])=>(
                <div key={l} style={{background:t.cardAlt,borderRadius:12,padding:"12px 14px",border:`1px solid ${t.border}`}}>
                <div style={{fontSize:18,marginBottom:4}}>{ic}</div>
                <div style={{fontSize:10,color:t.textMuted,fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,color:t.text}}>{v}</div>
                </div>
            ))}
            </div>
        </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:12,marginTop:20,paddingTop:20,borderTop:`1px solid ${t.border}`}}>
        {[["⚽","Goals",a.goals],["🎯","Assists",a.assists],["🏟","Matches",a.matches],["📏","Height",a.height],["👟","Foot",a.foot]].map(([ic,l,v])=>(
            <div key={l} style={{background:t.cardAlt,borderRadius:14,padding:16,border:`1px solid ${t.border}`,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:6}}>{ic}</div>
            <div style={{fontSize:20,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif"}}>{v}</div>
            <div style={{fontSize:11,color:t.textMuted,marginTop:2}}>{l}</div>
            </div>
        ))}
        </div>
    </div>
    </div>
);
}

return (
<div>
    <ConfirmModal/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
    <div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:"0 0 4px"}}>My Athletes</h2>
        <p style={{color:t.textMuted,fontSize:13,margin:0}}>Full club roster — {allRoster.length} athletes registered</p>
    </div>
    <div style={{display:"flex",gap:8}}>
        {["grid","list"].map(v=>(
        <button key={v} onClick={()=>setView(v)} style={{padding:"8px 14px",borderRadius:10,border:view!==v?`1px solid ${t.border}`:"none",cursor:"pointer",background:view===v?t.btnPrimary:t.card,color:view===v?"#fff":t.textMuted,fontWeight:600,fontSize:13,fontFamily:"inherit"}}>
            {v==="grid"?"⊞ Grid":"☰ List"}
        </button>
        ))}
    </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
    {byRole.map(({role,count})=>(
        <div key={role} style={{background:t.card,borderRadius:12,padding:"10px 16px",border:`1px solid ${t.border}`,display:"flex",gap:10,alignItems:"center"}}>
        <span>{role==="Forward"?"⚡":role==="Midfielder"?"🎯":role==="Defender"?"🛡️":"🧤"}</span>
        <div>
            <div style={{fontSize:18,fontWeight:800,color:t.text,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{count}</div>
            <div style={{fontSize:10,color:t.textMuted}}>{role}s</div>
        </div>
        </div>
    ))}
    <div style={{background:t.card,borderRadius:12,padding:"10px 16px",border:`1px solid ${t.green}44`,display:"flex",gap:10,alignItems:"center"}}>
        <span style={{color:t.green}}>●</span>
        <div><div style={{fontSize:18,fontWeight:800,color:t.green,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{allRoster.filter(a=>a.status==="active").length}</div><div style={{fontSize:10,color:t.textMuted}}>Active</div></div>
    </div>
    <div style={{background:t.card,borderRadius:12,padding:"10px 16px",border:`1px solid ${t.orange}44`,display:"flex",gap:10,alignItems:"center"}}>
        <span style={{color:t.orange}}>⚠</span>
        <div><div style={{fontSize:18,fontWeight:800,color:t.orange,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{allRoster.filter(a=>a.status==="injured").length}</div><div style={{fontSize:10,color:t.textMuted}}>Injured</div></div>
    </div>
    </div>
    <div style={{background:t.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${t.border}`,marginBottom:18,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
    <input placeholder="🔍 Search athlete..." value={query} onChange={e=>setQuery(e.target.value)}
        style={{flex:1,minWidth:160,padding:"9px 12px",borderRadius:10,background:t.inputBg,border:`1px solid ${t.inputBorder}`,color:t.text,fontSize:13,fontFamily:"inherit",width:"100%"}}/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",width:"100%"}}>
        {roles.map(r=>(
        <button key={r} onClick={()=>setRoleFilter(r)} style={{padding:"7px 12px",borderRadius:20,border:roleFilter!==r?`1px solid ${t.border}`:"none",cursor:"pointer",background:roleFilter===r?t.btnPrimary:t.cardAlt,color:roleFilter===r?"#fff":t.textMuted,fontWeight:600,fontSize:11,fontFamily:"inherit"}}>{r}</button>
        ))}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["All","active","injured"].map(s=>(
        <button key={s} onClick={()=>setStatusFilter(s)} style={{padding:"7px 12px",borderRadius:20,border:statusFilter!==s?`1px solid ${t.border}`:"none",cursor:"pointer",background:statusFilter===s?t.btnPrimary:t.cardAlt,color:statusFilter===s?"#fff":t.textMuted,fontWeight:600,fontSize:11,fontFamily:"inherit"}}>
            {s==="active"?"● Active":s==="injured"?"⚠ Injured":"All"}
        </button>
        ))}
    </div>
    </div>
    {filtered.length===0
    ?<div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>No athletes found.</div>
    :view==="grid"
        ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {filtered.map(a=>(
            <div key={a.id} style={{background:t.card,borderRadius:16,padding:18,border:`1px solid ${a.status==="injured"?t.orange+"44":t.border}`,boxShadow:t.shadow,transition:"border-color 0.2s,transform 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=a.status==="injured"?t.orange+"44":t.border;e.currentTarget.style.transform="translateY(0)";}}
            >
            <div onClick={()=>setSelected(a)} style={{cursor:"pointer",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <Avatar initials={a.initials} color={a.color} size={46}/>
                    <div>
                    <div style={{fontWeight:800,color:t.text,fontSize:14}}>{a.nationality} {a.name}</div>
                    <div style={{color:t.textMuted,fontSize:11,marginTop:1}}>{a.role} • {a.age} yrs</div>
                    <div style={{color:t.textMuted,fontSize:10,marginTop:1}}>📍 {a.location}</div>
                    </div>
                </div>
                <div style={{width:32,height:32,borderRadius:8,background:t.cardAlt,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:t.accent,flexShrink:0}}>#{a.number}</div>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                {a.tags.slice(0,2).map(tag=><Tag key={tag} label={tag} t={t}/>)}
                <span style={{background:`${a.status==="active"?t.green:t.orange}18`,color:a.status==="active"?t.green:t.orange,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{a.status==="active"?"● Active":"⚠ Injured"}</span>
                </div>
                <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${t.border}`}}>
                {[["G",a.goals],["A",a.assists],["M",a.matches]].map(([l,v],i)=>(
                    <div key={l} style={{flex:1,textAlign:"center",padding:"8px 0",borderRight:i<2?`1px solid ${t.border}`:"none"}}>
                    <div style={{fontSize:15,fontWeight:800,color:t.text}}>{v}</div>
                    <div style={{fontSize:9,color:t.textMuted}}>{l==="G"?"Goals":l==="A"?"Assists":"Matches"}</div>
                    </div>
                ))}
                </div>
            </div>
            <button onClick={e=>{e.stopPropagation();setConfirmRemove(a);}} style={{width:"100%",padding:"7px 0",borderRadius:8,border:`1px solid ${t.red}`,background:`${t.red}10`,color:t.red,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                🗑 Remove from Club
            </button>
            </div>
        ))}
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(a=>(
            <div key={a.id} style={{background:t.card,borderRadius:14,padding:"14px 18px",border:`1px solid ${a.status==="injured"?t.orange+"44":t.border}`,display:"flex",alignItems:"center",gap:16,transition:"border-color 0.2s",flexWrap:"wrap"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=a.status==="injured"?t.orange+"44":t.border}
            >
            <div style={{width:36,height:36,borderRadius:8,background:t.cardAlt,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:t.accent,flexShrink:0}}>#{a.number}</div>
            <Avatar initials={a.initials} color={a.color} size={42}/>
            <div onClick={()=>setSelected(a)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,color:t.text,fontSize:14}}>{a.nationality} {a.name}</span>
                <span style={{background:`${a.status==="active"?t.green:t.orange}18`,color:a.status==="active"?t.green:t.orange,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>{a.status==="active"?"● Active":"⚠ Injured"}</span>
                </div>
                <div style={{color:t.textMuted,fontSize:12,marginTop:2}}>{a.role} • {a.age} yrs • 📍 {a.location}</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {a.tags.slice(0,3).map(tag=><Tag key={tag} label={tag} t={t}/>)}
            </div>
            <div style={{display:"flex",gap:20,flexShrink:0}}>
                {[["Goals",a.goals],["Assists",a.assists],["Matches",a.matches]].map(([l,v])=>(
                <div key={l} style={{textAlign:"center",minWidth:40}}>
                    <div style={{fontSize:16,fontWeight:800,color:t.text}}>{v}</div>
                    <div style={{fontSize:10,color:t.textMuted}}>{l}</div>
                </div>
                ))}
            </div>
            <button onClick={()=>setConfirmRemove(a)} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${t.red}`,background:`${t.red}10`,color:t.red,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>🗑</button>
            <span onClick={()=>setSelected(a)} style={{color:t.textMuted,fontSize:18,flexShrink:0,cursor:"pointer"}}>›</span>
            </div>
        ))}
        </div>
    }
</div>
);
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function NotificationsPage({t,notifications,markAllRead,markRead}){
const unread=notifications.filter(n=>!n.is_read).length;
return (
<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
    <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:0}}>Notifications</h2>
    {unread>0&&<button onClick={markAllRead} style={{background:"none",border:"none",color:t.accent,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Mark all as read</button>}
    </div>
    <p style={{color:t.textMuted,fontSize:13,margin:"0 0 20px"}}>{unread>0?`You have ${unread} unread notification${unread>1?"s":""}`:"All caught up!"}</p>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
    {notifications.length===0
        ?<div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>
        <div style={{fontSize:40,marginBottom:12}}>🔔</div>
        <div style={{fontSize:16,fontWeight:600}}>No notifications</div>
        </div>
        :notifications.map(n=>(
            <div key={n.id} onClick={()=>markRead(n.id)} style={{background:n.is_read?t.card:`${t.accent}0d`,borderRadius:14,padding:"16px 20px",border:n.is_read?`1px solid ${t.border}`:`1px solid ${t.accent}44`,display:"flex",gap:14,alignItems:"center",cursor:"pointer",transition:"background 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.navHover}
            onMouseLeave={e=>e.currentTarget.style.background=n.is_read?t.card:`${t.accent}0d`}
            >
            <div style={{width:44,height:44,borderRadius:"50%",background:n.type==="application"?`${t.blue}22`:`${t.green}22`,color:n.type==="application"?t.blue:t.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {n.type==="application"?"📋":"✓"}
            </div>
            <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,color:t.text,fontSize:13}}>{n.title}</div>
                <div style={{fontWeight:n.is_read?500:600,color:t.textMuted,fontSize:13,marginTop:2}}>{n.message}</div>
                <div style={{color:t.textMuted,fontSize:11,marginTop:3}}>{new Date(n.created_at).toLocaleDateString()}</div>
            </div>
            {!n.is_read&&<div style={{width:10,height:10,borderRadius:"50%",background:t.accent,flexShrink:0}}/>}
            </div>
        ))
    }
    </div>
</div>
);
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App(){
const [darkMode,      setDarkMode]     = useState(()=>load("sc_darkMode",   true));
const [page,          setPage]         = useState(()=>load("sc_page",       "Dashboard"));
const [offersSent,    setOffersSent]   = useState(()=>load("sc_offersSent", []));
const [applications,  setApplications] = useState(()=>load("sc_apps",       INITIAL_APPLICATIONS));
const [notifications, setNotifications]= useState(()=>load("sc_notifs",     INITIAL_NOTIFS));
const [removedRoster, setRemovedRoster]= useState(()=>load("sc_removed",    []));
const [profileAthlete,setProfileAthlete]=useState(null);
const [clubUser, setClubUser] = useState(null);
const [dbNotifications, setDbNotifications] = useState([]);
const [clubRequests, setClubRequests] = useState([]);
const [myPlayers, setMyPlayers] = useState([]);
const [myOffers, setMyOffers] = useState([]);
const [offerForm, setOfferForm] = useState({ title: "", position: "", location: "", description: "", sport: "" });
const [showOfferForm, setShowOfferForm] = useState(false);
const [playerRequests, setPlayerRequests] = useState([]);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

const navigate = useNavigate();

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    getMe()
        .then(res => setClubUser(res.data))
        .catch(() => navigate('/login'));

    getMyOffers()
        .then(res => setMyOffers(res.data))
        .catch(() => {});
    
    getNotifications()
        .then(res => setDbNotifications(res.data))
        .catch(() => {});

    getClubRequests()
        .then(res => setClubRequests(res.data))
        .catch(() => {});

    getMyClubPlayers()
        .then(res => {
            localStorage.removeItem('sc_removed');
            setMyPlayers(res.data);
        });
    getClubRequests()
        .then(res => setPlayerRequests(res.data.filter(r => r.source === "player")))
        .catch(() => {});
    
    }, [navigate])

useEffect(()=>save("sc_darkMode",   darkMode),        [darkMode]);
useEffect(()=>save("sc_page",       page),            [page]);
useEffect(()=>save("sc_offersSent", offersSent),      [offersSent]);
useEffect(()=>save("sc_apps",       applications),    [applications]);
useEffect(()=>save("sc_notifs",     notifications),   [notifications]);
useEffect(()=>save("sc_removed",    removedRoster),   [removedRoster]);

const t=darkMode?themes.dark:themes.light;
const unread = dbNotifications.filter(n => !n.is_read).length;

const sendOffer=(athleteId)=>{
if(offersSent.includes(athleteId)) return;
setOffersSent(prev=>[...prev,athleteId]);
const athlete=ALL_ATHLETES.find(a=>a.id===athleteId);
setNotifications(prev=>[{id:Date.now(),type:"offer_sent",text:`Your offer was sent to ${athlete?.name}!`,time:"Just now",read:false,athleteId},...prev]);
};

const removeOffer=(athleteId)=>{
setOffersSent(prev=>prev.filter(id=>id!==athleteId));
setRemovedRoster(prev=>[...prev,athleteId+200]);
};

const updateAppStatus=(appId,status)=>{
const app=applications.find(a=>a.id===appId);
const athlete=ALL_ATHLETES.find(a=>a.id===app?.athleteId);
setApplications(prev=>prev.map(a=>a.id===appId?{...a,status}:a));
if(status==="accepted"){
    setNotifications(prev=>[{id:Date.now(),type:"accepted",text:`You accepted ${athlete?.name}'s application! 🎉`,time:"Just now",read:false,athleteId:app?.athleteId},...prev]);
}
};

const removeFromRoster=(id)=>{
    removePlayerFromClub(id)
        .then(() => {
        setRemovedRoster(prev=>[...prev,id]);
        getMyClubPlayers().then(res => setMyPlayers(res.data));
        })
        .catch(() => {});
};

const titles={Dashboard:"Club Dashboard","Job Offers":"Job Offers", Applications:"Applications","Requests":"Player Requests","My Athletes":"My Athletes",Notifications:"Notifications"};
const subs={Dashboard:"Welcome back! Here's your recruitment overview.","Job Offers":"Post and manage your job offers.",Applications:"Review incoming applications.","Requests":"Players who sent you join requests.","My Athletes":"Full club roster & management.",Notifications:"Your latest activity and alerts."};

return (
<div style={{display:"flex",height:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",background:t.bg,color:t.text,overflow:"hidden"}}>
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-thumb{background:${t.scrollbar};border-radius:10px;}
    *{box-sizing:border-box;}
    select,input{outline:none;}
    `}</style>

    <ProfileModal athlete={profileAthlete} onClose={()=>setProfileAthlete(null)} sendOffer={sendOffer} removeOffer={removeOffer} offersSent={offersSent} t={t}/>

    <Sidebar page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} unread={unread} t={t} navigate={navigate} isMobile={isMobile}/>

    <div style={{flex:1,overflow:"auto",padding: isMobile ? "20px 16px 80px" : "28px 28px 40px"}}>
    {/* Mobile top bar */}
    {isMobile && (
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:8,background:t.btnPrimary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⚽</div>
          <div style={{fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",color:t.text}}>SportScout</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div onClick={()=>setDarkMode(!darkMode)} style={{width:36,height:20,borderRadius:20,cursor:"pointer",background:darkMode?t.accent:t.progressBg,position:"relative",transition:"background 0.3s"}}>
            <div style={{position:"absolute",width:14,height:14,borderRadius:"50%",background:"#fff",top:3,transition:"left 0.3s",left:darkMode?19:3}}/>
          </div>
          <button onClick={()=>{localStorage.removeItem('token');localStorage.removeItem('user');navigate('/login');}} style={{padding:"6px 12px",borderRadius:8,background:"transparent",color:t.textMuted,border:`1px solid ${t.border}`,fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>← Out</button>
        </div>
      </div>
    )}
    <div style={{marginBottom:22}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize: isMobile ? 20 : 24,fontWeight:800,margin:"0 0 4px",color:t.text}}>{titles[page]}</h1>
        <p style={{color:t.textMuted,margin:0,fontSize:13}}>{subs[page]}</p>
    </div>
    {page==="Dashboard" && <DashboardPage t={t} setPage={setPage} applications={applications} sendOffer={sendOffer} removeOffer={removeOffer} offersSent={offersSent} viewProfile={setProfileAthlete} clubUser={clubUser} isMobile={isMobile}/>}
    {page==="Search Athletes" && <SearchAthletesPage t={t} sendOffer={sendOffer} removeOffer={removeOffer} offersSent={offersSent} viewProfile={setProfileAthlete}/>}
    {page==="Applications" && <ApplicationsPage t={t} applications={applications} updateAppStatus={updateAppStatus} clubRequests={clubRequests} updateRequestStatus={updateRequestStatus} setClubRequests={setClubRequests} setMyPlayers={setMyPlayers}/>}
    {page==="My Athletes" && <MyAthletesPage t={t} offersSent={offersSent} removedRoster={removedRoster} removeFromRoster={removeFromRoster} viewProfile={setProfileAthlete} myPlayers={myPlayers}/>}
    {page==="Job Offers" && (
    <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.text,margin:0}}>Job Offers</h2>
        <button onClick={()=>setShowOfferForm(!showOfferForm)} style={{padding:"10px 20px",borderRadius:10,border:"none",background:t.btnPrimary,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            + New Offer
        </button>
        </div>

        {showOfferForm && (
        <div style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:20}}>
            <h3 style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:16}}>Post New Job Offer</h3>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
            {[
                ["Title","title","e.g. Looking for a Striker"],
                ["Position","position","e.g. ST, CM, GK"],
                ["Location","location","e.g. Cairo, Egypt"],
                ["Sport","sport","e.g. Football"],
            ].map(([label,key,placeholder])=>(
                <div key={key}>
                <label style={{fontSize:12,fontWeight:600,color:t.textMuted,display:"block",marginBottom:4}}>{label}</label>
                <input
                    placeholder={placeholder}
                    value={offerForm[key]}
                    onChange={e=>setOfferForm(prev=>({...prev,[key]:e.target.value}))}
                    style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,outline:"none"}}
                />
                </div>
            ))}
            <div style={{gridColumn:"1/-1"}}>
                <label style={{fontSize:12,fontWeight:600,color:t.textMuted,display:"block",marginBottom:4}}>Description</label>
                <textarea
                placeholder="Describe the job offer..."
                value={offerForm.description}
                onChange={e=>setOfferForm(prev=>({...prev,description:e.target.value}))}
                style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,outline:"none",minHeight:80,resize:"vertical"}}
                />
            </div>
            </div>
            <button
            onClick={()=>{
                createJobOffer(offerForm)
                .then(()=>{
                    getMyOffers().then(res=>setMyOffers(res.data));
                    setShowOfferForm(false);
                    setOfferForm({title:"",position:"",location:"",description:"",sport:""});
                })
                .catch(()=>{});
            }}
            style={{marginTop:16,padding:"10px 24px",borderRadius:10,border:"none",background:t.btnPrimary,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}
            >
            Post Offer
            </button>
        </div>
        )}

        {myOffers.length === 0
        ? <div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>
            <div style={{fontSize:40,marginBottom:12}}>💼</div>
            <div style={{fontSize:16,fontWeight:600}}>No job offers yet</div>
            </div>
        : myOffers.map((offer,i)=>(
            <div key={i} style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:14,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:4}}>{offer.title}</div>
                <div style={{fontSize:12,color:t.textMuted}}>📍 {offer.location} • ⚽ {offer.sport} • 🎯 {offer.position}</div>
                <div style={{fontSize:11,color:t.textMuted,marginTop:4}}>{offer.description}</div>
                </div>
                <button
                onClick={()=>{
                    deleteJobOffer(offer.id)
                    .then(()=>setMyOffers(prev=>prev.filter(o=>o.id!==offer.id)))
                    .catch(()=>{});
                }}
                style={{padding:"8px 16px",borderRadius:8,border:"none",background:`${t.red}15`,color:t.red,fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0}}
                >
                🗑 Delete
                </button>
            </div>
            ))
        }
    </div>
    )}
    {page==="Notifications" && <NotificationsPage t={t} notifications={dbNotifications} markAllRead={() => {
        markAllNotifsRead().then(() => setDbNotifications(prev => prev.map(n => ({...n, is_read: true}))));
        }} markRead={(id) => {
        markNotifRead(id).then(() => setDbNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n)));
        }}/>}
    {page==="Requests" && (
    <div>
        {clubRequests.filter(r => r.source === "player").length === 0
        ? <div style={{background:t.card,borderRadius:16,padding:40,border:`1px solid ${t.border}`,textAlign:"center",color:t.textMuted}}>
            <div style={{fontSize:40,marginBottom:12}}>📨</div>
            <div style={{fontSize:16,fontWeight:600}}>No requests yet</div>
            </div>
        : clubRequests.filter(r => r.source === "player").map((r, i) => (
            <div key={i} style={{background:t.card,borderRadius:16,padding:20,border:`1px solid ${t.border}`,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff"}}>
                    {r.player_name?.[0]}
                </div>
                <div>
                    <div style={{fontWeight:700,fontSize:15,color:t.text}}>{r.player_name}</div>
                    <div style={{fontSize:12,color:t.textMuted}}>{r.position}</div>
                    <div style={{fontSize:11,color:t.textMuted,marginTop:2}}>
                    Applied: {new Date(r.applied_at).toLocaleDateString()}
                    </div>
                </div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{
                    background: r.status==="pending"?"#fef9c3": r.status==="accepted"?"#dcfce7":"#fee2e2",
                    color: r.status==="pending"?"#ca8a04": r.status==="accepted"?"#16a34a":"#dc2626",
                    borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700
                }}>{r.status}</span>
                {r.status === "pending" && (
                    <>
                        <button 
                        style={{padding:"8px 16px",borderRadius:8,border:"none",background:t.green,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}
                        onClick={() => {
                        updateRequestStatus(r.id, "accepted")
                            .then(() => {
                            setClubRequests(prev => prev.map(req => 
                                req.id === r.id ? {...req, status: "accepted"} : req
                            ));
                            getMyClubPlayers().then(res => setMyPlayers(res.data));
                            })
                            .catch(() => {});
                        }}
                        >
                        ✓ Accept
                        </button>
                        <button 
                        style={{padding:"8px 16px",borderRadius:8,border:"none",background:t.red,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}
                        onClick={() => {
                            updateRequestStatus(r.id, "rejected")
                            .then(() => {
                                setClubRequests(prev => prev.map(req => 
                                req.id === r.id ? {...req, status: "rejected"} : req
                                ));
                            })
                            .catch(() => {});
                        }}
                        >
                        ✕ Reject
                        </button>
                    </>
                    )}
                </div>
            </div>
            ))
        }
</div>
)}
    </div>
</div>
);
}