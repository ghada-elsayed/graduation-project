// src/components/ChatFAB.jsx
// ─────────────────────────────────────────────────────────
// Floating chat button — يتحط في App.jsx مرة واحدة
// يظهر في كل الصفحات ما عدا صفحة الشات نفسها
// ─────────────────────────────────────────────────────────
import { useLocation, useNavigate } from "react-router-dom";

export default function ChatFAB() {
  const location = useLocation();
  const navigate = useNavigate();

  // متظهرش في صفحة الشات
  if (location.pathname === "/chatbot") return null;

  return (
    <>
      <style>{`
        .chat-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #1e3a5f, #f97316);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          box-shadow: 0 4px 18px rgba(249,115,22,.45);
          transition: transform .2s;
        }
        .chat-fab:hover { transform: scale(1.1); }
        .chat-fab:hover .chat-fab-tooltip { opacity: 1; }
        .chat-fab-pulse {
          position: absolute;
          top: -2px; right: -2px;
          width: 14px; height: 14px;
          background: #f97316;
          border-radius: 50%;
          border: 2.5px solid white;
          animation: fabPulse 2s ease-in-out infinite;
        }
        .chat-fab-tooltip {
          position: absolute;
          right: 64px;
          background: #1e3a5f;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity .2s;
          font-family: 'Segoe UI', sans-serif;
        }
        .chat-fab-tooltip::after {
          content: '';
          position: absolute;
          right: -5px; top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right: none;
          border-left-color: #1e3a5f;
        }
        @keyframes fabPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,.6); }
          50%      { box-shadow: 0 0 0 6px rgba(249,115,22,.0); }
        }
      `}</style>

      <button
        className="chat-fab"
        onClick={() => navigate("/chatbot")}
        title="SportsMed AI"
      >
        <div className="chat-fab-pulse" />
        <div className="chat-fab-tooltip">SportsMed AI</div>
        <svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="white"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </>
  );
}