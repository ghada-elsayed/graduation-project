// import { useState, useRef, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { sendMessage, sendMessageWithFile, clearSession } from "../services/chatbotService";
// import SpiderChart from "../components/SpiderChart";

// // ── Session history (mock — replace with localStorage or API) ──

// const QUICK_PROMPTS = [
//   "What muscles does the squat target?",
//   "What can this app help me with?",
//   "Best nutrition plan for a football player?",
//   "How do I recover faster after training?",
// ];

// const AGENT_META = {
//   medical_rag:     { bg: "#dcfce7", color: "#15803d", label: "Medical RAG",   icon: "⚕️" },
//   guide:           { bg: "#dbeafe", color: "#1d4ed8", label: "Guide",          icon: "🧭" },
//   feedback:        { bg: "#fce7f3", color: "#be185d", label: "CV Analysis",    icon: "📄" },
//   player_analysis: { bg: "#f3e8ff", color: "#7c3aed", label: "Player Analysis",icon: "🎮" },
// };

// function saveSessions(sessions) {
//   localStorage.setItem("chat_sessions", JSON.stringify(sessions));
// }

// function loadSessions() {
//   try {
//     return JSON.parse(localStorage.getItem("chat_sessions")) || [];
//   } catch { return []; }
// }

// // ────────────────────────────────────────────────────────────────
// //  SUB-COMPONENTS
// // ────────────────────────────────────────────────────────────────

// function AgentBadge({ route, score }) {
//   const meta = AGENT_META[route];
//   if (!meta) return null;
//   return (
//     <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
//       <span style={{
//         display: "inline-flex", alignItems: "center", gap: 4,
//         background: meta.bg, color: meta.color,
//         fontSize: 11, fontWeight: 700,
//         padding: "2px 9px", borderRadius: 20,
//       }}>
//         {meta.icon} {meta.label}
//       </span>
//       {score && (
//         <span style={{
//           display: "inline-flex", alignItems: "center", gap: 4,
//           background: "#fef9c3", color: "#a16207",
//           fontSize: 11, fontWeight: 700,
//           padding: "2px 9px", borderRadius: 20,
//         }}>
//           ⭐ {score}/10
//         </span>
//       )}
//     </div>
//   );
// }

// function Avatar({ role }) {
//   const isUser = role === "user";
//   return (
//     <div style={{
//       width: 34, height: 34,
//       borderRadius: "50%",
//       background: isUser
//         ? "#2563eb"
//         : "linear-gradient(135deg,#1e3a5f,#2c5282)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       flexShrink: 0, fontSize: 15,
//     }}>
//       {isUser ? "👤" : "🤖"}
//     </div>
//   );
// }

// function MessageBubble({ msg }) {
//   const isUser = msg.role === "user";
//   return (
//     <div style={{
//       display: "flex", gap: 10, alignItems: "flex-start",
//       flexDirection: isUser ? "row-reverse" : "row",
//       animation: "fadeUp .3s ease both",
//     }}>
//       <Avatar role={msg.role} />
//       <div style={{ maxWidth: "72%" }}>
//         {!isUser && <AgentBadge route={msg.route} score={msg.reviewerScore} />}
//         <div style={{
//           background:   isUser ? "#2563eb" : "white",
//           color:        isUser ? "white"   : "#1a2332",
//           border:       isUser ? "none"    : "1px solid #e2eaf2",
//           borderRadius: isUser
//             ? "16px 16px 4px 16px"
//             : "16px 16px 16px 4px",
//           padding: "11px 15px",
//           fontSize: ".84rem",
//           lineHeight: 1.65,
//           whiteSpace: "pre-wrap",
//           wordBreak: "break-word",
//         }}>
//           {msg.content}
//         </div>
//         {msg.playerData?.spider_chart && (
//           <SpiderChart spiderJson={msg.playerData.spider_chart} />
//         )}
//         {msg.playerData?.market_value?.min && (
//   <div style={{
//     marginTop: 8,
//     background: "#f0fdf4",
//     border: "1px solid #86efac",
//     borderRadius: 10,
//     padding: "8px 14px",
//     fontSize: ".8rem",
//     color: "#15803d",
//     fontWeight: 600,
//   }}>
//     💰 Recommended Bid: ${msg.playerData.market_value.min.toLocaleString()} 
//     {" — "}
//     ${msg.playerData.market_value.max.toLocaleString()}
//   </div>
// )}
//         <div style={{
//           fontSize: ".62rem", color: "#94a3b8", marginTop: 3,
//           textAlign: isUser ? "right" : "left",
//         }}>
//           {msg.time}
//         </div>
//       </div>
//     </div>
//   );
// }

// function TypingIndicator() {
//   return (
//     <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
//       <Avatar role="ai" />
//       <div style={{
//         background: "white", border: "1px solid #e2eaf2",
//         borderRadius: "16px 16px 16px 4px",
//         padding: "13px 18px",
//         display: "flex", gap: 5, alignItems: "center",
//       }}>
//         {[0, 1, 2].map(i => (
//           <div key={i} style={{
//             width: 7, height: 7, borderRadius: "50%",
//             background: "#2563eb",
//             animation: `typingBounce .9s ease-in-out ${i * 0.15}s infinite`,
//           }} />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ────────────────────────────────────────────────────────────────
// //  MAIN PAGE
// // ────────────────────────────────────────────────────────────────

// export default function ChatbotPage() {
//   const navigate  = useNavigate();
//   const [messages, setMessages]   = useState([
//     {
//       role:    "ai",
//       content: "Welcome! I'm SportsMed AI — your multi-agent sports assistant.\n\nI can help you with:\n• Sports medicine & injury questions\n• Nutrition & exercise planning\n• Athletic CV / profile analysis\n• App features & how-to\n\nWhat would you like to explore today?",
//       time:    now(),
//       route:   "guide",
//     },
//   ]);
//   const [input,     setInput]     = useState("");
//   const [loading,   setLoading]   = useState(false);
//   const [threadId,  setThreadId]  = useState(null);
//   const [file,      setFile]      = useState(null);
//   const [collapsed, setCollapsed] = useState(false);
//   const [activeSession, setActiveSession] = useState("current");
//   const [sessions, setSessions] = useState(loadSessions);

//   const messagesEndRef = useRef(null);
//   const fileInputRef   = useRef(null);
//   const textareaRef    = useRef(null);

//   // Auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   function now() {
//     return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   }

//   // زودي الـ useEffect ده
// useEffect(() => {
//   if (!threadId || messages.length <= 1) return;

//   setSessions(prev => {
//     const exists = prev.find(s => s.id === threadId);
//     const firstUserMsg = messages.find(m => m.role === "user");
//     const label = firstUserMsg
//       ? firstUserMsg.content.slice(0, 35) + "..."
//       : "New chat";

//     const updated = exists
//       ? prev.map(s => s.id === threadId
//           ? { ...s, messages, label, time: "Just now" }
//           : s)
//       : [{ id: threadId, label, time: "Just now", messages }, ...prev];

//     // احفظي آخر 10 محادثات بس
//     const trimmed = updated.slice(0, 10);
//     saveSessions(trimmed);
//     return trimmed;
//   });
// }, [messages, threadId]);


// const loadSession = (session) => {
//   setActiveSession(session.id);
//   setThreadId(session.id);
//   setMessages(session.messages);
// };
//   // ── Send ────────────────────────────────────────────────────
//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text && !file) return;
//     if (loading) return;

//     const userContent = file ? `📎 ${file.name}\n${text || "Please analyze this file."}` : text;

//     setMessages(prev => [...prev, {
//       role: "user", content: userContent, time: now(),
//     }]);
//     setInput("");
//     setFile(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     if (textareaRef.current)  textareaRef.current.style.height = "auto";
//     setLoading(true);

//     try {
//       let res;
//       if (file) {
//         res = await sendMessageWithFile(text || "Please analyze this file.", file, threadId);
//       } else {
//         res = await sendMessage(text, threadId);
//       }

//       if (!threadId && res.thread_id) setThreadId(res.thread_id);

//       setMessages(prev => [...prev, {
//         role:          "ai",
//         content:       res.final_answer || "❌ No response received.",
//         time:          now(),
//         route:         res.route,
//         reviewerScore: res.reviewer?.score,
//         playerData:    res.player_data || null,
//       }]);
//     } catch (err) {
//       setMessages(prev => [...prev, {
//         role:    "ai",
//         content: `❌ Error: ${err.message}\n\nPlease make sure the chatbot backend is running on port 8001.`,
//         time:    now(),
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   }, [input, file, loading, threadId]);

//   const handleKey = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   const handleClear = async () => {
//   if (threadId) {
//     try {
//       const res = await clearSession(threadId);
//       setThreadId(res.new_thread_id);
//     } catch (_) {}
//   }
//   setActiveSession("current");
//   setMessages([{
//     role: "ai",
//     content: "Session cleared. How can I help you?",
//     time: now(), route: "guide",
//   }]);
// };

//   const sendQuick = (text) => {
//     setInput(text);
//     setTimeout(() => textareaRef.current?.focus(), 50);
//   };

//   // ────────────────────────────────────────────────────────────
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column",
//       height: "100vh", background: "#f5f7fa",
//       fontFamily: "'Segoe UI', sans-serif",
//     }}>

//       <style>{`
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes typingBounce {
//           0%,80%,100% { transform: scale(0); opacity: .4; }
//           40%          { transform: scale(1); opacity: 1; }
//         }
//         * { box-sizing: border-box; margin: 0; padding: 0; }

//         .sidebar-session {
//           padding: .55rem .85rem; border-radius: 9px; cursor: pointer;
//           font-size: .75rem; color: #64748b; transition: all .2s;
//           border: 1px solid transparent; display: flex;
//           flex-direction: column; gap: 2px;
//         }
//         .sidebar-session:hover { background: #f0f4f8; }
//         .sidebar-session.active {
//           background: #dbeafe; color: #1d4ed8;
//           border-color: #bfdbfe; font-weight: 600;
//         }
//         .quick-btn {
//           background: white; border: 1.5px solid #e2eaf2;
//           border-radius: 20px; padding: .38rem .85rem;
//           font-size: .72rem; font-weight: 600; color: #1e3a5f;
//           cursor: pointer; transition: all .2s; white-space: nowrap;
//           font-family: 'Segoe UI', sans-serif;
//         }
//         .quick-btn:hover { background: #1e3a5f; color: white; border-color: #1e3a5f; }

//         .agent-row {
//           display: flex; align-items: center; gap: 8px;
//           padding: .5rem .65rem; border-radius: 9px;
//           background: #f8fafc; margin-bottom: .4rem;
//         }
//         .chat-textarea {
//           flex: 1; border: 1.5px solid #e2eaf2; border-radius: 12px;
//           padding: .65rem 1rem; font-size: .85rem; font-family: 'Segoe UI', sans-serif;
//           resize: none; outline: none; line-height: 1.5; color: #1a2332;
//           transition: border-color .2s; background: white;
//           max-height: 120px; overflow-y: auto;
//         }
//         .chat-textarea:focus { border-color: #2563eb; }
//         .chat-textarea::placeholder { color: #94a3b8; }

//         .btn-send {
//           background: #f97316; color: white; border: none;
//           border-radius: 12px; padding: .65rem 1.2rem;
//           font-weight: 700; font-size: .82rem; cursor: pointer;
//           transition: background .2s; white-space: nowrap;
//           font-family: 'Segoe UI', sans-serif;
//         }
//         .btn-send:hover    { background: #ea580c; }
//         .btn-send:disabled { background: #d1d5db; cursor: default; }

//         .btn-upload {
//           background: #f0f4f8; border: none; border-radius: 10px;
//           padding: .65rem .9rem; cursor: pointer; color: #64748b;
//           font-size: 17px; transition: background .2s; line-height: 1;
//         }
//         .btn-upload:hover { background: #e2eaf2; }

//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
//       `}</style>

//       {/* ══ TOP BAR ══════════════════════════════════════════════ */}
//       <div style={{
//         background: "white", borderBottom: "1px solid #e2eaf2",
//         padding: ".8rem 1.75rem",
//         display: "flex", alignItems: "center", gap: "1rem",
//         flexShrink: 0,
//       }}>
//         {/* Back */}
//         <button onClick={() => navigate("/dashboard")} style={{
//           background: "#f0f4f8", border: "none", borderRadius: 8,
//           padding: ".4rem .9rem", fontSize: ".8rem", fontWeight: 600,
//           color: "#1a2332", cursor: "pointer", display: "flex",
//           alignItems: "center", gap: 5,
//         }}>
//           ← Dashboard
//         </button>

//         {/* Logo */}
//         <div style={{
//           width: 32, height: 32,
//           background: "linear-gradient(135deg,#1e3a5f,#f97316)",
//           borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
//         }}>
//           <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2.5px solid white" }} />
//         </div>
//         <div>
//           <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#1a2332", lineHeight: 1 }}>
//             SportsMed AI
//           </div>
//           <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Multi-Agent Assistant · Port 8001</div>
//         </div>

//         {/* Status */}
//         <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: ".75rem" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//             <div style={{
//               width: 8, height: 8, borderRadius: "50%", background: "#10b981",
//               boxShadow: "0 0 0 3px rgba(16,185,129,.2)",
//             }} />
//             <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>Connected</span>
//           </div>
//           {threadId && (
//             <span style={{
//               background: "#f0f4f8", borderRadius: 6,
//               padding: ".2rem .6rem", fontSize: ".65rem",
//               color: "#94a3b8", fontFamily: "monospace",
//             }}>
//               {threadId.slice(0, 12)}...
//             </span>
//           )}
//           <button onClick={handleClear} style={{
//             background: "#f0f4f8", border: "none", borderRadius: 7,
//             padding: ".35rem .85rem", fontSize: ".72rem", fontWeight: 600,
//             color: "#64748b", cursor: "pointer",
//           }}>
//             New Chat
//           </button>
//         </div>
//       </div>

//       {/* ══ BODY ═════════════════════════════════════════════════ */}
//       <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

//         {/* ── SIDEBAR ── */}
//         <div style={{
//           width: collapsed ? 0 : 230,
//           minWidth: collapsed ? 0 : 230,
//           background: "white",
//           borderRight: "1px solid #e2eaf2",
//           display: "flex", flexDirection: "column",
//           padding: collapsed ? 0 : "1rem .75rem",
//           overflow: "hidden",
//           transition: "all .3s",
//           flexShrink: 0,
//         }}>
//           {!collapsed && (
//             <>
//               {/* Agents */}
//               <div style={{ fontSize: ".68rem", color: "#94a3b8", fontWeight: 700,
//                             textTransform: "uppercase", letterSpacing: ".5px",
//                             padding: ".25rem .5rem .6rem" }}>
//                 Agents
//               </div>
//               {[
//                 { route: "medical_rag",     desc: "Sports medicine & nutrition" },
//                 { route: "guide",           desc: "App features & how-to"       },
//                 { route: "feedback",        desc: "Upload your profile PDF"     },
//                 { route: "player_analysis", desc: "Coming soon"                 },
//               ].map(({ route, desc }) => {
//                 const m = AGENT_META[route];
//                 return (
//                   <div key={route} className="agent-row">
//                     <span style={{ fontSize: 15 }}>{m.icon}</span>
//                     <div>
//                       <div style={{ fontSize: ".73rem", fontWeight: 700, color: m.color }}>{m.label}</div>
//                       <div style={{ fontSize: ".62rem", color: "#94a3b8" }}>{desc}</div>
//                     </div>
//                   </div>
//                 );
//               })}

//               {/* Divider */}
//               <div style={{ borderTop: "1px solid #e2eaf2", margin: ".75rem 0" }} />

//               {/* Sessions */}
//               <div style={{ fontSize: ".68rem", color: "#94a3b8", fontWeight: 700,
//                             textTransform: "uppercase", letterSpacing: ".5px",
//                             padding: ".25rem .5rem .5rem" }}>
//                 Recent Chats
//               </div>
//               <div style={{ flex: 1, overflowY: "auto" }}>
//                 <div
//                   className={`sidebar-session ${activeSession === "current" ? "active" : ""}`}
//                   onClick={() => setActiveSession("current")}
//                 >
//                   <span>💬 Current session</span>
//                   <span style={{ fontSize: ".6rem", color: "#94a3b8" }}>Now</span>
//                 </div>
//                 {sessions.map(s => (
//                   <div
//                   key={s.id}
//                   className={`sidebar-session ${activeSession === s.id ? "active" : ""}`}
//                   onClick={() => loadSession(s)}
//                   >
//                     <span>💬 {s.label}</span>
//                     <span style={{ fontSize: ".6rem", color: "#94a3b8" }}>{s.time}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* Upgrade box */}
//               <div style={{
//                 background: "linear-gradient(135deg,#1e3a5f,#2c5282)",
//                 borderRadius: 12, padding: "1rem", color: "white", marginTop: ".75rem",
//               }}>
//                 <div style={{ fontSize: ".68rem", opacity: .8, marginBottom: ".25rem" }}>Session</div>
//                 <div style={{ fontSize: ".65rem", fontFamily: "monospace", opacity: .6,
//                               wordBreak: "break-all", marginBottom: ".65rem" }}>
//                   {threadId || "Not started yet"}
//                 </div>
//                 <button onClick={handleClear} style={{
//                   background: "#f97316", color: "white", border: "none",
//                   padding: ".4rem .85rem", borderRadius: 7, fontWeight: 700,
//                   fontSize: ".7rem", cursor: "pointer", width: "100%",
//                 }}>
//                   Clear Session
//                 </button>
//               </div>
//             </>
//           )}
//         </div>

//         {/* ── MAIN CHAT ── */}
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

//           {/* Collapse toggle */}
//           <button
//             onClick={() => setCollapsed(!collapsed)}
//             style={{
//               position: "absolute", left: collapsed ? 0 : 218, top: "50%",
//               transform: "translateY(-50%)",
//               width: 22, height: 44, background: "white",
//               border: "1px solid #e2eaf2", borderLeft: collapsed ? "1px solid #e2eaf2" : "none",
//               borderRadius: collapsed ? "0 6px 6px 0" : "0 6px 6px 0",
//               cursor: "pointer", color: "#94a3b8", fontSize: ".7rem",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               zIndex: 10, transition: "left .3s",
//             }}
//           >
//             {collapsed ? "›" : "‹"}
//           </button>

//           {/* Messages area */}
//           <div style={{
//             flex: 1, overflowY: "auto",
//             padding: "1.5rem 2rem", display: "flex",
//             flexDirection: "column", gap: "1rem",
//           }}>

//             {/* Welcome header */}
//             <div style={{ textAlign: "center", padding: "1.5rem 0 .75rem" }}>
//               <div style={{
//                 width: 56, height: 56,
//                 background: "linear-gradient(135deg,#1e3a5f,#f97316)",
//                 borderRadius: "50%", display: "flex", alignItems: "center",
//                 justifyContent: "center", margin: "0 auto .75rem",
//               }}>
//                 <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid white" }} />
//               </div>
//               <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a2332", marginBottom: ".3rem" }}>
//                 SportsMed AI Assistant
//               </div>
//               <div style={{ fontSize: ".8rem", color: "#64748b", maxWidth: 380, margin: "0 auto", lineHeight: 1.65 }}>
//                 Your multi-agent sports medicine companion.
//                 Ask about fitness, nutrition, or upload your CV.
//               </div>
//             </div>

//             {/* Quick prompts */}
//             <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", justifyContent: "center", paddingBottom: ".25rem" }}>
//               {QUICK_PROMPTS.map(q => (
//                 <button key={q} className="quick-btn" onClick={() => sendQuick(q)}>
//                   {q}
//                 </button>
//               ))}
//             </div>

//             {/* Messages */}
//             {messages.map((msg, i) => (
//               <MessageBubble key={i} msg={msg} />
//             ))}

//             {/* Typing */}
//             {loading && <TypingIndicator />}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* File preview bar */}
//           {file && (
//             <div style={{
//               background: "#eff6ff", padding: ".5rem 1.5rem",
//               fontSize: ".75rem", color: "#1d4ed8",
//               display: "flex", alignItems: "center", gap: 8,
//               borderTop: "1px solid #bfdbfe",
//             }}>
//               <span style={{ fontSize: 15 }}>📎</span>
//               <span style={{ fontWeight: 600 }}>{file.name}</span>
//               <button
//                 onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
//                 style={{ background: "none", border: "none", color: "#ef4444",
//                          cursor: "pointer", fontSize: 18, marginLeft: "auto", lineHeight: 1 }}
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {/* Input area */}
//           <div style={{
//             background: "white", borderTop: "1px solid #e2eaf2",
//             padding: ".9rem 1.5rem",
//             display: "flex", gap: ".75rem", alignItems: "flex-end",
//           }}>
//             {/* Upload */}
//             <label className="btn-upload" title="Upload CV or PDF">
//               📎
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".pdf,.doc,.docx,.mp4,.avi,.mov"
//                 style={{ display: "none" }}
//                 onChange={e => setFile(e.target.files[0] || null)}
//               />
//             </label>

//             {/* Textarea */}
//             <textarea
//               ref={textareaRef}
//               className="chat-textarea"
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               onKeyDown={handleKey}
//               placeholder="Ask about sports medicine, nutrition, fitness... (Enter to send, Shift+Enter for new line)"
//               rows={1}
//               onInput={e => {
//                 e.target.style.height = "auto";
//                 e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
//               }}
//             />

//             {/* Send */}
//             <button
//               className="btn-send"
//               onClick={handleSend}
//               disabled={loading || (!input.trim() && !file)}
//             >
//               {loading ? "⏳" : "Send →"}
//             </button>
//           </div>

//           {/* Footer */}
//           <div style={{
//             textAlign: "center", padding: ".4rem",
//             fontSize: ".62rem", color: "#cbd5e1",
//             background: "white", borderTop: "1px solid #e2eaf2",
//           }}>
//             SportsMed AI · Powered by LangGraph + Groq · Responses may not replace professional medical advice
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage, sendMessageWithFile, clearSession } from "../services/chatbotService";
import SpiderChart from "../components/SpiderChart";

// ── Session history (mock — replace with localStorage or API) ──

const QUICK_PROMPTS = [
  "What muscles does the squat target?",
  "What can this app help me with?",
  "Best nutrition plan for a football player?",
  "How do I recover faster after training?",
];

const AGENT_META = {
  medical_rag:      { bg: "#dcfce7", color: "#15803d", label: "Medical RAG",   icon: "⚕️" },
  guide:            { bg: "#dbeafe", color: "#1d4ed8", label: "Guide",          icon: "🧭" },
  feedback:         { bg: "#fce7f3", color: "#be185d", label: "CV Analysis",    icon: "📄" },
  player_analysis: { bg: "#f3e8ff", color: "#7c3aed", label: "Player Analysis",icon: "🎮" },
};

function saveSessions(sessions) {
  localStorage.setItem("chat_sessions", JSON.stringify(sessions));
}

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem("chat_sessions")) || [];
  } catch { return []; }
}

// ────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────

function AgentBadge({ route, score }) {
  const meta = AGENT_META[route];
  if (!meta) return null;
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: meta.bg, color: meta.color,
        fontSize: 11, fontWeight: 700,
        padding: "2px 9px", borderRadius: 20,
      }}>
        {meta.icon} {meta.label}
      </span>
      {score && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#fef9c3", color: "#a16207",
          fontSize: 11, fontWeight: 700,
          padding: "2px 9px", borderRadius: 20,
        }}>
          ⭐ {score}/10
        </span>
      )}
    </div>
  );
}

function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div style={{
      width: 34, height: 34,
      borderRadius: "50%",
      background: isUser
        ? "#2563eb"
        : "linear-gradient(135deg,#1e3a5f,#2c5282)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: 15,
    }}>
      {isUser ? "👤" : "🤖"}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeUp .3s ease both",
    }}>
      <Avatar role={msg.role} />
      <div className="message-wrapper" style={{ maxWidth: "72%" }}>
        {!isUser && <AgentBadge route={msg.route} score={msg.reviewerScore} />}
        <div style={{
          background:   isUser ? "#2563eb" : "white",
          color:        isUser ? "white"   : "#1a2332",
          border:       isUser ? "none"    : "1px solid #e2eaf2",
          borderRadius: isUser
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",
          padding: "11px 15px",
          fontSize: ".84rem",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        {msg.playerData?.spider_chart && (
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <SpiderChart spiderJson={msg.playerData.spider_chart} />
          </div>
        )}
        {msg.playerData?.market_value?.min && (
          <div style={{
            marginTop: 8,
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: ".8rem",
            color: "#15803d",
            fontWeight: 600,
          }}>
            💰 Recommended Bid: ${msg.playerData.market_value.min.toLocaleString()} 
            {" — "}
            ${msg.playerData.market_value.max.toLocaleString()}
          </div>
        )}
        <div style={{
          fontSize: ".62rem", color: "#94a3b8", marginTop: 3,
          textAlign: isUser ? "right" : "left",
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Avatar role="ai" />
      <div style={{
        background: "white", border: "1px solid #e2eaf2",
        borderRadius: "16px 16px 16px 4px",
        padding: "13px 18px",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#2563eb",
            animation: `typingBounce .9s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ────────────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const navigate  = useNavigate();
  const [messages, setMessages]   = useState([
    {
      role:    "ai",
      content: "Welcome! I'm SportsMed AI — your multi-agent sports assistant.\n\nI can help you with:\n• Sports medicine & injury questions\n• Nutrition & exercise planning\n• Athletic CV / profile analysis\n• App features & how-to\n\nWhat would you like to explore today?",
      time:    now(),
      route:   "guide",
    },
  ]);
  const [input,      setInput]     = useState("");
  const [loading,    setLoading]   = useState(false);
  const [threadId,   setThreadId]  = useState(null);
  const [file,       setFile]      = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activeSession, setActiveSession] = useState("current");
  const [sessions, setSessions] = useState(loadSessions);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const textareaRef    = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // زودي الـ useEffect ده
  useEffect(() => {
    if (!threadId || messages.length <= 1) return;

    setSessions(prev => {
      const exists = prev.find(s => s.id === threadId);
      const firstUserMsg = messages.find(m => m.role === "user");
      const label = firstUserMsg
        ? firstUserMsg.content.slice(0, 35) + "..."
        : "New chat";

      const updated = exists
        ? prev.map(s => s.id === threadId
            ? { ...s, messages, label, time: "Just now" }
            : s)
        : [{ id: threadId, label, time: "Just now", messages }, ...prev];

      // احفظي آخر 10 محادثات بس
      const trimmed = updated.slice(0, 10);
      saveSessions(trimmed);
      return trimmed;
    });
  }, [messages, threadId]);

  const loadSession = (session) => {
    setActiveSession(session.id);
    setThreadId(session.id);
    setMessages(session.messages);
    // Auto-close sidebar on mobile after choosing a session
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  };

  // Set initial sidebar state based on screen width
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  }, []);

  // ── Send ────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !file) return;
    if (loading) return;

    const userContent = file ? `📎 ${file.name}\n${text || "Please analyze this file."}` : text;

    setMessages(prev => [...prev, {
      role: "user", content: userContent, time: now(),
    }]);
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textareaRef.current)  textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      let res;
      if (file) {
        res = await sendMessageWithFile(text || "Please analyze this file.", file, threadId);
      } else {
        res = await sendMessage(text, threadId);
      }

      if (!threadId && res.thread_id) setThreadId(res.thread_id);

      setMessages(prev => [...prev, {
        role:          "ai",
        content:       res.final_answer || "❌ No response received.",
        time:          now(),
        route:         res.route,
        reviewerScore: res.reviewer?.score,
        playerData:    res.player_data || null,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role:    "ai",
        content: `❌ Error: ${err.message}\n\nPlease make sure the chatbot backend is running on port 8001.`,
        time:    now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, file, loading, threadId]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = async () => {
    if (threadId) {
      try {
        const res = await clearSession(threadId);
        setThreadId(res.new_thread_id);
      } catch (_) {}
    }
    setActiveSession("current");
    setMessages([{
      role: "ai",
      content: "Session cleared. How can I help you?",
      time: now(), route: "guide",
    }]);
  };

  const sendQuick = (text) => {
    setInput(text);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", height: "100dvh", background: "#f5f7fa",
      fontFamily: "'Segoe UI', sans-serif",
      position: "relative", overflow: "hidden"
    }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%,80%,100% { transform: scale(0); opacity: .4; }
          40%          { transform: scale(1); opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sidebar-session {
          padding: .55rem .85rem; border-radius: 9px; cursor: pointer;
          font-size: .75rem; color: #64748b; transition: all .2s;
          border: 1px solid transparent; display: flex;
          flex-direction: column; gap: 2px;
        }
        .sidebar-session:hover { background: #f0f4f8; }
        .sidebar-session.active {
          background: #dbeafe; color: #1d4ed8;
          border-color: #bfdbfe; font-weight: 600;
        }
        .quick-btn {
          background: white; border: 1.5px solid #e2eaf2;
          border-radius: 20px; padding: .38rem .85rem;
          font-size: .72rem; font-weight: 600; color: #1e3a5f;
          cursor: pointer; transition: all .2s; white-space: nowrap;
          font-family: 'Segoe UI', sans-serif;
        }
        .quick-btn:hover { background: #1e3a5f; color: white; border-color: #1e3a5f; }

        .agent-row {
          display: flex; align-items: center; gap: 8px;
          padding: .5rem .65rem; border-radius: 9px;
          background: #f8fafc; margin-bottom: .4rem;
        }
        .chat-textarea {
          flex: 1; border: 1.5px solid #e2eaf2; border-radius: 12px;
          padding: .65rem 1rem; font-size: .85rem; font-family: 'Segoe UI', sans-serif;
          resize: none; outline: none; line-height: 1.5; color: #1a2332;
          transition: border-color .2s; background: white;
          max-height: 120px; overflow-y: auto;
        }
        .chat-textarea:focus { border-color: #2563eb; }
        .chat-textarea::placeholder { color: #94a3b8; }

        .btn-send {
          background: #f97316; color: white; border: none;
          border-radius: 12px; padding: .65rem 1.2rem;
          font-weight: 700; font-size: .82rem; cursor: pointer;
          transition: background .2s; white-space: nowrap;
          font-family: 'Segoe UI', sans-serif;
        }
        .btn-send:hover    { background: #ea580c; }
        .btn-send:disabled { background: #d1d5db; cursor: default; }

        .btn-upload {
          background: #f0f4f8; border: none; border-radius: 10px;
          padding: .65rem .9rem; cursor: pointer; color: #64748b;
          font-size: 17px; transition: background .2s; line-height: 1;
        }
        .btn-upload:hover { background: #e2eaf2; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }

        /* ── RESPONSIVENESS MEDIA QUERIES ── */
        @media (max-width: 768px) {
          .top-bar-status {
            display: none !important; /* Hide details on mobile to save space */
          }
          .top-bar-container {
            padding: .6rem 1rem !important;
            justify-content: space-between !important;
          }
          .main-chat-container {
            padding: 1rem !important;
          }
          .message-wrapper {
            maxWidth: 85% !important; /* Allow message boxes to be wider on mobile */
          }
          .quick-prompts-container {
            justify-content: flex-start !important;
            overflow-x: auto;
            padding-bottom: .5rem;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch;
          }
          .quick-btn {
            flex-shrink: 0;
          }
          .sidebar-container {
            position: absolute !important;
            z-index: 100;
            height: calc(100% - 53px);
            top: 53px;
            left: 0;
            box-shadow: 10px 0 20px rgba(0,0,0,0.05);
          }
          .toggle-sidebar-btn {
            left: ${collapsed ? "0px" : "218px"} !important;
          }
          .input-area-container {
            padding: .6rem 1rem !important;
            gap: .5rem !important;
          }
          .btn-send {
            padding: .65rem .9rem !important;
          }
        }
      `}</style>

      {/* ══ TOP BAR ══════════════════════════════════════════════ */}
      <div className="top-bar-container" style={{
        background: "white", borderBottom: "1px solid #e2eaf2",
        padding: ".8rem 1.75rem",
        display: "flex", alignItems: "center", gap: "1rem",
        flexShrink: 0,
      }}>
        {/* Back */}
        <button onClick={() => navigate("/dashboard")} style={{
          background: "#f0f4f8", border: "none", borderRadius: 8,
          padding: ".4rem .9rem", fontSize: ".8rem", fontWeight: 600,
          color: "#1a2332", cursor: "pointer", display: "flex",
          alignItems: "center", gap: 5,
        }}>
          ← Dashboard
        </button>

        {/* Logo */}
        <div style={{
          width: 32, height: 32,
          background: "linear-gradient(135deg,#1e3a5f,#f97316)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2.5px solid white" }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#1a2332", lineHeight: 1 }}>
            SportsMed AI
          </div>
          <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Multi-Agent Assistant</div>
        </div>

        {/* Status */}
        <div className="top-bar-status" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: ".75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#10b981",
              boxShadow: "0 0 0 3px rgba(16,185,129,.2)",
            }} />
            <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>Connected</span>
          </div>
          {threadId && (
            <span style={{
              background: "#f0f4f8", borderRadius: 6,
              padding: ".2rem .6rem", fontSize: ".65rem",
              color: "#94a3b8", fontFamily: "monospace",
            }} >
              {threadId.slice(0, 12)}...
            </span>
          )}
        </div>
        
        {/* New Chat Button stays visible on top bar right side for desktop/mobile context */}
        <button onClick={handleClear} style={{
          background: "#f0f4f8", border: "none", borderRadius: 7,
          padding: ".35rem .85rem", fontSize: ".72rem", fontWeight: 600,
          color: "#64748b", cursor: "pointer", marginLeft: window.innerWidth <= 768 ? "auto" : "0"
        }}>
          New Chat
        </button>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* ── SIDEBAR ── */}
        <div className="sidebar-container" style={{
          width: collapsed ? 0 : 230,
          minWidth: collapsed ? 0 : 230,
          background: "white",
          borderRight: collapsed ? "none" : "1px solid #e2eaf2",
          display: "flex", flexDirection: "column",
          padding: collapsed ? 0 : "1rem .75rem",
          overflow: "hidden",
          transition: "all .3s ease",
          flexShrink: 0,
        }}>
          {!collapsed && (
            <>
              {/* Agents */}
              <div style={{ fontSize: ".68rem", color: "#94a3b8", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: ".5px",
                            padding: ".25rem .5rem .6rem" }}>
                Agents
              </div>
              {[
                { route: "medical_rag",     desc: "Sports medicine & nutrition" },
                { route: "guide",            desc: "App features & how-to"       },
                { route: "feedback",         desc: "Upload your profile PDF"     },
                { route: "player_analysis", desc: "Coming soon"                 },
              ].map(({ route, desc }) => {
                const m = AGENT_META[route];
                return (
                  <div key={route} className="agent-row">
                    <span style={{ fontSize: 15 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: ".73rem", fontWeight: 700, color: m.color }}>{m.label}</div>
                      <div style={{ fontSize: ".62rem", color: "#94a3b8" }}>{desc}</div>
                    </div>
                  </div>
                );
              })}

              {/* Divider */}
              <div style={{ borderTop: "1px solid #e2eaf2", margin: ".75rem 0" }} />

              {/* Sessions */}
              <div style={{ fontSize: ".68rem", color: "#94a3b8", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: ".5px",
                            padding: ".25rem .5rem .5rem" }}>
                Recent Chats
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div
                  className={`sidebar-session ${activeSession === "current" ? "active" : ""}`}
                  onClick={() => setActiveSession("current")}
                >
                  <span>💬 Current session</span>
                  <span style={{ fontSize: ".6rem", color: "#94a3b8" }}>Now</span>
                </div>
                {sessions.map(s => (
                  <div
                  key={s.id}
                  className={`sidebar-session ${activeSession === s.id ? "active" : ""}`}
                  onClick={() => loadSession(s)}
                  >
                    <span>💬 {s.label}</span>
                    <span style={{ fontSize: ".6rem", color: "#94a3b8" }}>{s.time}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade box */}
              <div style={{
                background: "linear-gradient(135deg,#1e3a5f,#2c5282)",
                borderRadius: 12, padding: "1rem", color: "white", marginTop: ".75rem",
              }}>
                <div style={{ fontSize: ".68rem", opacity: .8, marginBottom: ".25rem" }}>Session</div>
                <div style={{ fontSize: ".65rem", fontFamily: "monospace", opacity: .6,
                              wordBreak: "break-all", marginBottom: ".65rem" }}>
                  {threadId || "Not started yet"}
                </div>
                <button onClick={handleClear} style={{
                  background: "#f97316", color: "white", border: "none",
                  padding: ".4rem .85rem", borderRadius: 7, fontWeight: 700,
                  fontSize: ".7rem", cursor: "pointer", width: "100%",
                }}>
                  Clear Session
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── MAIN CHAT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Collapse toggle */}
          <button
            className="toggle-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: "absolute", left: collapsed ? 0 : 218, top: "50%",
              transform: "translateY(-50%)",
              width: 22, height: 44, background: "white",
              border: "1px solid #e2eaf2", borderLeft: collapsed ? "1px solid #e2eaf2" : "none",
              borderRadius: "0 6px 6px 0",
              cursor: "pointer", color: "#94a3b8", fontSize: ".7rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 110, transition: "left .3s ease",
            }}
          >
            {collapsed ? "›" : "‹"}
          </button>

          {/* Messages area */}
          <div className="main-chat-container" style={{
            flex: 1, overflowY: "auto",
            padding: "1.5rem 2rem", display: "flex",
            flexDirection: "column", gap: "1rem",
          }}>

            {/* Welcome header */}
            <div style={{ textAlign: "center", padding: "1rem 0 .5rem" }}>
              <div style={{
                width: 56, height: 56,
                background: "linear-gradient(135deg,#1e3a5f,#f97316)",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto .75rem",
              }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid white" }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a2332", marginBottom: ".3rem" }}>
                SportsMed AI Assistant
              </div>
              <div style={{ fontSize: ".8rem", color: "#64748b", maxWidth: 380, margin: "0 auto", lineHeight: 1.65 }}>
                Your multi-agent sports medicine companion.
              </div>
            </div>

            {/* Quick prompts */}
            <div className="quick-prompts-container" style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", justifyContent: "center", paddingBottom: ".25rem" }}>
              {QUICK_PROMPTS.map(q => (
                <button key={q} className="quick-btn" onClick={() => sendQuick(q)}>
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Typing */}
            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* File preview bar */}
          {file && (
            <div style={{
              background: "#eff6ff", padding: ".5rem 1.5rem",
              fontSize: ".75rem", color: "#1d4ed8",
              display: "flex", alignItems: "center", gap: 8,
              borderTop: "1px solid #bfdbfe",
            }}>
              <span style={{ fontSize: 15 }}>📎</span>
              <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
              <button
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                style={{ background: "none", border: "none", color: "#ef4444",
                         cursor: "pointer", fontSize: 18, marginLeft: "auto", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="input-area-container" style={{
            background: "white", borderTop: "1px solid #e2eaf2",
            padding: ".9rem 1.5rem",
            display: "flex", gap: ".75rem", alignItems: "flex-end",
          }}>
            {/* Upload */}
            <label className="btn-upload" title="Upload CV or PDF">
              📎
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.mp4,.avi,.mov"
                style={{ display: "none" }}
                onChange={e => setFile(e.target.files[0] || null)}
              />
            </label>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about sports medicine, nutrition..."
              rows={1}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />

            {/* Send */}
            <button
              className="btn-send"
              onClick={handleSend}
              disabled={loading || (!input.trim() && !file)}
            >
              {loading ? "⏳" : "Send →"}
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: "center", padding: ".4rem",
            fontSize: ".62rem", color: "#cbd5e1",
            background: "white", borderTop: "1px solid #e2eaf2",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            SportsMed AI · Powered by LangGraph + Groq
          </div>
        </div>
      </div>
    </div>
  );
}