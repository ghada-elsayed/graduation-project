// src/components/Chatbot/ChatbotWidget.jsx
// ─────────────────────────────────────────────────────────────────
// Drop this component anywhere in your React app.
// It handles: text input, file upload, session memory, routing badges
// ─────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import {
  sendMessage,
  sendMessageWithFile,
  clearSession,
} from "../../services/chatbotService";

// ── Route badge colors ─────────────────────────────────────────
const ROUTE_STYLES = {
  medical_rag:     { bg: "#e8f5e9", color: "#2e7d32", label: "⚕️ Medical RAG" },
  guide:           { bg: "#e3f2fd", color: "#1565c0", label: "🧭 Guide"       },
  feedback:        { bg: "#fce4ec", color: "#c62828", label: "📄 CV Analysis"  },
  player_analysis: { bg: "#f3e5f5", color: "#6a1b9a", label: "🎮 Player"      },
};

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const route  = ROUTE_STYLES[msg.route];

  return (
    <div style={{
      display:       "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems:    "flex-start",
      marginBottom:  "16px",
      gap:           "8px",
    }}>
      {/* Avatar */}
      <div style={{
        width:          "36px",
        height:         "36px",
        borderRadius:   "50%",
        background:     isUser ? "#1976d2" : "#37474f",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "16px",
        flexShrink:     0,
      }}>
        {isUser ? "👤" : "🤖"}
      </div>

      <div style={{ maxWidth: "75%" }}>
        {/* Route badge (AI messages only) */}
        {!isUser && route && (
          <div style={{
            display:      "inline-block",
            background:   route.bg,
            color:        route.color,
            fontSize:     "11px",
            fontWeight:   600,
            padding:      "2px 8px",
            borderRadius: "12px",
            marginBottom: "4px",
          }}>
            {route.label}
          </div>
        )}

        {/* Reviewer score badge */}
        {!isUser && msg.reviewerScore && (
          <div style={{
            display:      "inline-block",
            marginLeft:   "6px",
            background:   "#fff8e1",
            color:        "#f57f17",
            fontSize:     "11px",
            fontWeight:   600,
            padding:      "2px 8px",
            borderRadius: "12px",
            marginBottom: "4px",
          }}>
            ⭐ {msg.reviewerScore}/10
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background:   isUser ? "#1976d2" : "#f5f5f5",
          color:        isUser ? "#fff" : "#212121",
          padding:      "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          fontSize:     "14px",
          lineHeight:   1.6,
          whiteSpace:   "pre-wrap",
          wordBreak:    "break-word",
        }}>
          {msg.content}
        </div>

        {/* Timestamp */}
        <div style={{ fontSize: "11px", color: "#9e9e9e", marginTop: "2px",
                      textAlign: isUser ? "right" : "left" }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ── Main chatbot widget ────────────────────────────────────────
export default function ChatbotWidget({ initialThreadId = null }) {
  const [messages,  setMessages]  = useState([
    {
      role:    "assistant",
      content: "👋 مرحباً! أنا SportsMed AI.\n\nيمكنني مساعدتك في:\n• أسئلة الطب الرياضي والتغذية\n• تحليل السيرة الذاتية الرياضية\n• الإجابة على أسئلتك عن التطبيق\n\nاكتب سؤالك أو ارفع ملف PDF!",
      time:    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      route:   null,
    },
  ]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [threadId,  setThreadId]  = useState(initialThreadId);
  const [file,      setFile]      = useState(null);
  const [error,     setError]     = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send handler ─────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !file) return;
    if (loading) return;

    const userMsg = {
      role:    "user",
      content: file ? `📎 ${file.name}\n${text}` : text,
      time:    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let response;
      if (file) {
        response = await sendMessageWithFile(text || "Please analyze this file.", file, threadId);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        response = await sendMessage(text, threadId);
      }

      // Save thread_id from first response
      if (!threadId && response.thread_id) {
        setThreadId(response.thread_id);
      }

      const aiMsg = {
        role:          "assistant",
        content:       response.final_answer || "❌ No response received.",
        time:          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        route:         response.route,
        reviewerScore: response.reviewer?.score,
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: `❌ Error: ${err.message}`,
        time:    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, file, loading, threadId]);

  // ── Clear session ────────────────────────────────────────────
  const handleClear = async () => {
    if (threadId) {
      try {
        const res = await clearSession(threadId);
        setThreadId(res.new_thread_id);
      } catch (_) {}
    }
    setMessages([{
      role:    "assistant",
      content: "🔄 Session cleared. How can I help you?",
      time:    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  // ── Enter key ─────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "600px",
      width:         "100%",
      maxWidth:      "720px",
      margin:        "0 auto",
      border:        "1px solid #e0e0e0",
      borderRadius:  "16px",
      overflow:      "hidden",
      fontFamily:    "Inter, system-ui, sans-serif",
      boxShadow:     "0 4px 24px rgba(0,0,0,0.08)",
    }}>

      {/* ── Header ── */}
      <div style={{
        background:     "#1a237e",
        color:          "#fff",
        padding:        "14px 20px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>🏋️ SportsMed AI</div>
          <div style={{ fontSize: "12px", opacity: 0.75 }}>
            {threadId ? `Session: ${threadId.slice(0, 8)}...` : "New Session"}
          </div>
        </div>
        <button
          onClick={handleClear}
          style={{
            background:   "rgba(255,255,255,0.15)",
            border:       "none",
            color:        "#fff",
            padding:      "6px 12px",
            borderRadius: "8px",
            cursor:       "pointer",
            fontSize:     "12px",
          }}
        >
          🔄 Clear
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex:       1,
        overflowY:  "auto",
        padding:    "16px",
        background: "#fafafa",
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center",
                        padding: "8px 16px", color: "#757575", fontSize: "13px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#1976d2",
                  animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── File preview ── */}
      {file && (
        <div style={{
          padding:    "8px 16px",
          background: "#e3f2fd",
          fontSize:   "13px",
          color:      "#1565c0",
          display:    "flex",
          alignItems: "center",
          gap:        "8px",
        }}>
          📎 {file.name}
          <button
            onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#c62828", fontSize: "16px" }}
          >×</button>
        </div>
      )}

      {/* ── Input area ── */}
      <div style={{
        display:    "flex",
        gap:        "8px",
        padding:    "12px 16px",
        background: "#fff",
        borderTop:  "1px solid #e0e0e0",
        alignItems: "flex-end",
      }}>
        {/* File upload button */}
        <label style={{ cursor: "pointer", color: "#757575", fontSize: "20px", paddingBottom: "6px" }}
               title="Upload CV or PDF">
          📎
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={e => setFile(e.target.files[0] || null)}
          />
        </label>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك... (Enter للإرسال، Shift+Enter لسطر جديد)"
          rows={1}
          style={{
            flex:         1,
            border:       "1px solid #e0e0e0",
            borderRadius: "12px",
            padding:      "10px 14px",
            fontSize:     "14px",
            resize:       "none",
            outline:      "none",
            lineHeight:   1.5,
            fontFamily:   "inherit",
            maxHeight:    "120px",
            overflowY:    "auto",
          }}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading || (!input.trim() && !file)}
          style={{
            background:   loading ? "#bdbdbd" : "#1976d2",
            color:        "#fff",
            border:       "none",
            borderRadius: "12px",
            padding:      "10px 18px",
            cursor:       loading ? "default" : "pointer",
            fontSize:     "14px",
            fontWeight:   600,
            transition:   "background 0.2s",
            whiteSpace:   "nowrap",
          }}
        >
          {loading ? "⏳" : "إرسال →"}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
