import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    id: "individual",
    icon: "👤",
    title: "Individual User",
    desc: "Get a personalized nutrition plan and track your daily calories.",
    btn: "Continue as Individual",
    color: "#2563eb",
  },
  {
    id: "athlete",
    icon: "🏆",
    title: "Athlete",
    desc: "Access nutrition plans, workout schedules, and performance tracking.",
    btn: "Continue as Athlete",
    color: "#2563eb",
  },
  {
    id: "club",
    icon: "🏟️",
    title: "Sports Club",
    desc: "Manage players, training programs, and nutrition plans.",
    btn: "Continue as Club",
    color: "#2563eb",
  },
];

export default function RoleSelectionPage({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "2rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .role-card {
          background: white;
          border: 2px solid #e2eaf2;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all .25s;
          flex: 1;
        }
        .role-card:hover {
          border-color: #2563eb;
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(37,99,235,.12);
        }
        .role-card.selected {
          border-color: #2563eb;
          box-shadow: 0 12px 32px rgba(37,99,235,.15);
        }

        .role-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem;
          margin: 0 auto 1.25rem;
        }

        .btn-blue {
          background: #2563eb;
          color: white; border: none;
          padding: .75rem 1.5rem;
          border-radius: 10px;
          font-weight: 700; font-size: .9rem;
          cursor: pointer; width: 100%;
          transition: all .2s;
          margin-top: 1.25rem;
        }
        .btn-blue:hover { background: #1d4ed8; transform: translateY(-1px); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp .6s ease both; }
        .fu1 { animation-delay: .1s; }
        .fu2 { animation-delay: .2s; }
        .fu3 { animation-delay: .3s; }
      `}</style>

      {/* Card container */}
      <div style={{
        background: "white",
        borderRadius: 24,
        padding: "3rem 2.5rem",
        maxWidth: 900,
        width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,.08)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.25rem",
            fontSize: "1.4rem",
          }}>👤</div>

          <h1 style={{ fontWeight: 800, fontSize: "1.6rem", color: "#1a2332", marginBottom: ".5rem" }}>
            Choose How You Want to Use the Platform
          </h1>
          <p style={{ color: "#64748b", fontSize: ".9rem" }}>
            Select your role to get started with personalized features tailored to your needs
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: "flex", gap: "1.25rem" }}>
          {ROLES.map((role, i) => (
            <div
              key={role.id}
              className={`role-card fu fu${i + 1}${selected === role.id ? " selected" : ""}`}
              onClick={() => setSelected(role.id)}
            >
              <div className="role-icon">
                <span>{role.icon}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2332", marginBottom: ".6rem" }}>
                {role.title}
              </h3>
              <p style={{ color: "#64748b", fontSize: ".82rem", lineHeight: 1.6 }}>
                {role.desc}
              </p>
              <button
                className="btn-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(role.id);
                  navigate('/register', { state: { role: role.id } });
                  if (onSelect) onSelect(role.id);
                }}
              >
                {role.btn}
              </button>
            </div>
          ))}
        </div>

        {/* Footer text */}
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: ".78rem", marginTop: "2rem" }}>
          Smart Sports Networking & Fitness System
        </p>
      </div>
    </div>
  );
}