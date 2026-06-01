import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
// const [isLoggedIn, setIsLoggedIn] = useState(false);
// const [userName, setUserName] = useState("");

const NAV_LINKS = ["Home", "Fitness", "Performance"
  // , "Interview"
];

const STATS = [
  { value: "25K", label: "Active Members" },
  { value: "3M", label: "Performance Tracked" },
  { value: "6K", label: "Certified Coaches" },
  { value: "98%", label: "Success Rate" },
];

const SERVICES = [
  { title: "Performance", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&q=80" },
  { title: "Fitness", img: "data:image/jpeg;base64,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" },
  { title: "Interview", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&q=80" },
];

const TOP_RANKED = [
  { name: "Samir Ali", sport: "Foot Ball", place: "3rd Place", score: "Score: 9799", img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80", bg: "#b8d4f0" },
  { name: "Hajer Khaled", sport: "Foot Ball", place: "2nd Place", score: "Score: 9990", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRurwunpdtrWiq31H-PCrlJq3zirCWbOmv1-Q&s", bg: "#c8dff5" },
  { name: "Yousef Hassan", sport: "Boxing", place: "1st Place", score: "Score: 9999", img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80", bg: "#6b8cba" },
];

const TESTIMONIALS = [
  { name: "Sarah Mahmoud", role: "Fitness Enthusiast", text: "This platform completely changed my fitness journey! The personalized plans kept me focused and motivated every day.", rating: "4.5/5", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" },
  { name: "Omar Khaled", role: "Beginner Athlete", text: "I started with zero experience and now I feel stronger and more confident. The progress tracking feature helped me stay focused.", rating: "4.5/5", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" },
  { name: "Ahmed Hassan", role: "Football Player", text: "Finally a fitness app that covers all my athletic needs. I can track my workouts, nutrition, and sleep all in one place!", rating: "4.5/5", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" },
];

const COMMUNITY_STATS = [
  { value: "15k", label: "Active Users" },
  { value: "9k", label: "Coaches who play" },
  { value: "20k", label: "Training completers" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  if (token) {
    setIsLoggedIn(true);
    setUserName(user.full_name || "");
  }
  const onScroll = () => setScrolled(window.scrollY > 40);
  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);

  const d = dark;
  const bg = d ? "#0f1923" : "#ffffff";
  const textMain = d ? "#e8edf5" : "#1a2332";
  const textMuted = d ? "#7a9bbf" : "#64748b";
  const border = d ? "#1e3048" : "#e2eaf2";

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: bg, color: textMain, minHeight: "100vh", transition: "all .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .btn-orange { background: #f97316; color: white; border: none; padding: .65rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: .88rem; cursor: pointer; transition: all .2s; }
        .btn-orange:hover { background: #f97316; transform: translateY(-1px); }

        .btn-dark { background: #1e3a5f; color: white; border: none; padding: .65rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: .88rem; cursor: pointer; transition: all .2s; }
        .btn-dark:hover { background: #15304f; }

        .nav-link { color: ${textMuted}; text-decoration: none; font-weight: 500; font-size: .9rem; cursor: pointer; transition: color .2s; }
        .nav-link:hover { color: #1e3a5f; }
        .nav-link.active { color: #1e3a5f; font-weight: 700; border-bottom: 2px solid #f97316; padding-bottom: 2px; }

        .service-card { border-radius: 14px; overflow: hidden; position: relative; cursor: pointer; }
        .service-img { transition: transform .4s; width: 100%; height: 130px; object-fit: cover; display: block; }
        .service-card:hover .service-img { transform: scale(1.06); }

        .testimonial-card { background: ${d ? "#1e3a5f" : "#dbeafe"}; border-radius: 14px; padding: 1.25rem; flex: 1; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp .7s ease both; }
        .fu1 { animation-delay: .1s; } .fu2 { animation-delay: .2s; } .fu3 { animation-delay: .3s; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .ranked-grid { flex-direction: column !important; }
          .community-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { flex-direction: column !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          // .nav-links { display: none !important; }
        }
        @media (max-width:750px){
          nav div{
          flex-wrap:wrap !important;
          justify-content: center !important;
          gap : 1rem !important;}
          .split{
          grid-template-columns: 1fr !important;
      }
          .cards{
            display:flex;
          }
          }
      `}</style>

      {/* ══════ NAVBAR ══════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? (d ? "rgba(15,25,35,.97)" : "rgba(255,255,255,.97)") : (d ? "rgba(15,25,35,.85)" : "rgba(255,255,255,.9)"),
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${border}`,
        padding: ".85rem 0", transition: "all .3s",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "2.5rem" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginRight: "auto" }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2.5px solid white" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: ".9rem", color: textMain, lineHeight: 1 }}>SmartSports</div>
              <div style={{ fontSize: ".58rem", color: textMuted }}>Train Smart, Live Strong</div>
            </div>
          </div>

          {/* Links */}
          <div className="nav-links" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {NAV_LINKS.map((l, i) => (
              <a key={l}
                className={`nav-link${i === 0 ? " active" : ""}`}
                onClick={() => {
                  if (l === "Home") navigate('/');
                  else if (l === "Fitness") navigate('/nutrition');
                  else if (l === "Performance") navigate('/dashboard');
                }}
              >{l}</a>
            ))}

            {/* Interview بيظهر بس لو logged in */}
            {isLoggedIn && (
              <a className="nav-link" onClick={() => navigate('/jobs')}>Interview</a>
            )}
            {/* <span style={{ color: textMuted, cursor: "pointer", fontSize: "1.2rem" }}>☰</span> */}
          </div>

          {/* Login button */}
          {isLoggedIn ? (
            <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
              <span style={{ fontSize:".82rem", fontWeight:600, color:textMain }}>
                👋 {userName.split(' ')[0]}
                </span>
                <button
                onClick={() => navigate('/dashboard')}
                style={{ background:"#2563eb", color:"white", border:"none", padding:".4rem 1rem", borderRadius:8, fontWeight:600, fontSize:".82rem", cursor:"pointer" }}
                 >
                  Dashboard
                  </button>
                  <button
                  onClick={() => {
                     localStorage.removeItem('token');
                     localStorage.removeItem('user');
                     setIsLoggedIn(false);
                    }}
                    style={{ background:"#ef4444", color:"white", border:"none", padding:".4rem 1rem", borderRadius:8, fontWeight:600, fontSize:".82rem", cursor:"pointer" }}
                    >
                       Logout
                       </button>
                        </div>
                        ) : (
                        <button onClick={() => navigate('/login')} style={{
                          background:"transparent",
                          border:`1.5px solid ${border}`,
                          color:textMain,
                          padding:".4rem 1.1rem",
                          borderRadius:8,
                          fontWeight:600,
                          fontSize:".82rem",
                          cursor:"pointer",
                        }}>Log In</button>
                        )}

          {/* Dark toggle */}
          <button onClick={() => setDark(!d)} style={{
            background: d ? "#1e3a5f" : "#f0f4f8", border: "none", borderRadius: 99,
            padding: ".4rem .9rem", fontSize: ".75rem", fontWeight: 600,
            cursor: "pointer", color: d ? "#94bbdd" : "#64748b",
          }}>
            {d ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section style={{
        paddingTop: "5rem",
        background: d
          ? "linear-gradient(160deg,#0f1923 0%,#1a2f45 100%)"
          : "linear-gradient(160deg,#f0f4f8 0%,#e8f0f8 40%,#f5f0e8 100%)",
        minHeight: "88vh", display: "flex", alignItems: "center", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem", width: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "3rem", alignItems: "center" }}>

          {/* Left */}
          <div className="fu">
            <h1 style={{ fontWeight: 900, fontSize: "clamp(2.2rem,4.5vw,3.8rem)", lineHeight: 1.15, color: textMain, marginBottom: "1rem" }}>
              Unleash Your Power
            </h1>
            <p style={{ color: textMuted, fontSize: ".92rem", lineHeight: 1.75, marginBottom: "1.75rem", maxWidth: 400 }}>
              It's not just about fitness... it's about becoming the best version of yourself. Start your journey today.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
              <button className="btn-orange" onClick={() => navigate('/select-role')}>Begin Your Journey</button>
              <button className="btn-dark" onClick={() => navigate('/select-role')}>Get Started</button>
            </div>

            {/* Blue stats box */}
            <div style={{ background: d ? "#1e3a5f" : "#2c5282", borderRadius: 16, padding: "1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".8rem", maxWidth: 160, lineHeight: 1.4 }}>Where every number tells a success story</p>
                <button className="btn-orange" style={{ borderRadius: 8, padding: ".5rem 1.1rem", fontSize: ".8rem" }}>Join the Winners</button>
              </div>
              <div style={{ display: "flex", gap: ".6rem" }}>
                {STATS.map(s => (
                  <div key={s.value} style={{ background: "#f97316", color: "white", borderRadius: 8, padding: ".6rem .75rem", flex: 1, textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: ".58rem", opacity: .85, marginTop: ".2rem", lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — athlete */}
          <div className="fu fu1" style={{ position: "relative" }}>
            <div style={{
              background: d ? "linear-gradient(135deg,#1e3a5f,#2c5282)" : "linear-gradient(135deg,#c8dff5,#dbeafe)",
              borderRadius: 24, width: "100%", height: 420, overflow: "hidden",
            }}>
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                alt="Athlete"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
              />
            </div>
            {/* AI badge */}
            <div style={{
              position: "absolute", top: 16, right: -8,
              background: "#f97316", color: "white",
              borderRadius: 10, padding: ".6rem .9rem",
              boxShadow: "0 6px 20px rgba(249,115,22,.4)",
              textAlign: "center",
            }}>
              <div style={{ fontWeight: 900, fontSize: "1.1rem", lineHeight: 1 }}>AI</div>
              <div style={{ fontSize: ".55rem", letterSpacing: "1px" }}>POWERED</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SERVICES ══════ */}
      <section style={{ padding: "4rem 2rem", background: bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.35rem", color: textMain, marginBottom: ".3rem" }}>Our Services :</h2>
          <p style={{ color: textMuted, fontSize: ".82rem", marginBottom: "1.5rem" }}>Discover how we can help you reach your fitness goals with smart, personalized plans</p>
          <div className="cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card">
                <div style={{ position: "relative" }}>
                  <img src={s.img} alt={s.title} className="service-img" />
                  <div style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, background: "#f97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: ".9rem", cursor: "pointer" }}>↗</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)", padding: ".65rem", color: "white", fontWeight: 700, fontSize: ".9rem" }}>{s.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TOP RANKED ══════ */}
      <section style={{ padding: "2rem 2rem 4rem", background: bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".25rem" }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: "1.35rem", color: textMain }}>Top Ranked :</h2>
              <p style={{ color: textMuted, fontSize: ".8rem" }}>Pushing limits, breaking records</p>
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <button style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${border}`, background: "transparent", color: "#f97316", cursor: "pointer" }}>‹</button>
              <button style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${border}`, background: "transparent", color: "#f97316", cursor: "pointer" }}>›</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
            {TOP_RANKED.map((a, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 220 }}>
                <img src={a.img} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", minHeight: 220 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.8) 0%,transparent 55%)", padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: ".85rem" }}>{a.name}</div>
                  <div style={{ color: "rgba(255,255,255,.75)", fontSize: ".72rem" }}>{a.sport}</div>
                  <div style={{ color: "#f97316", fontSize: ".72rem", fontWeight: 600 }}>{a.place}</div>
                  <div style={{ color: "rgba(255,255,255,.65)", fontSize: ".68rem" }}>{a.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ COMMUNITY ══════ */}
      <section style={{ padding: "4rem 2rem", background: bg }}>
        <div className="split" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1.6rem", color: textMain, marginBottom: ".4rem" }}>Meet Our Community</h2>
            <p style={{ color: textMuted, fontSize: ".85rem", marginBottom: "1.5rem" }}>A New Way To Learn & get knowledge</p>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <button className="btn-orange" style={{ borderRadius: 99, padding: ".5rem 1.5rem" }}>Join</button>
              <button className="btn-dark" style={{ borderRadius: 99, padding: ".5rem 1.5rem" }}>learn more</button>
            </div>
            <div style={{ display: "flex", gap: "2.5rem" }}>
              {COMMUNITY_STATS.map(s => (
                <div key={s.value}>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: textMain }}>{s.value}</div>
                  <div style={{ color: textMuted, fontSize: ".7rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80" alt="" style={{ borderRadius: 12, width: "100%", height: 150, objectFit: "cover" }} />
            <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80" alt="" style={{ borderRadius: 12, width: "100%", height: 150, objectFit: "cover" }} />
            <img src="data:image/jpeg;base64,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" alt="" style={{ borderRadius: 12, width: "100%", height: 150, objectFit: "cover", gridColumn: "1/-1" }} />
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section style={{ padding: "3rem 2rem 5rem", background: bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.35rem", color: textMain, marginBottom: ".25rem" }}>Testimonials :</h2>
          <p style={{ color: textMuted, fontSize: ".82rem", marginBottom: "1.5rem" }}>Hear it from our clients</p>
          <div style={{ display: "flex", flexWrap:"wrap" , gap: "1rem" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".9rem" }}>
                  <img src={t.img} alt={t.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #f97316" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".82rem", color: d ? "white" : "#1e3a5f" }}>{t.name} –</div>
                    <div style={{ color: d ? "#94bbdd" : "#3b6cb7", fontSize: ".72rem" }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ color: d ? "rgba(255,255,255,.75)" : "#334155", fontSize: ".8rem", lineHeight: 1.65, marginBottom: ".75rem" }}>{t.text}</p>
                <div style={{ fontWeight: 800, color: "#16f9c0", fontSize: ".82rem" }}>{t.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: d ? "#080e17" : "#1a2f45", color: "#94a3b8", padding: "2.5rem 2rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: "2rem", marginBottom: "1.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".75rem" }}>
                <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid white" }} />
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: ".85rem" }}>SmartSports</div>
                  <div style={{ fontSize: ".58rem", color: "#64748b" }}>Train Smart, Live Strong</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: ".4rem", marginTop: ".75rem" }}>
                {["f", "in", "t", "▶"].map(s => (
                  <div key={s} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", cursor: "pointer", color: "#94a3b8" }}>{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: "Platform", links: ["Home", "Fitness", "Interview", "Performance"] },
              { title: "Support", links: ["FAQs", "Feedback", "App Download", "Membership Plans"] },
              { title: "Contact", links: ["Address: 123 Fitness Street, Alexandria, Egypt", "Email: contact@fitneshub.com", "Working Hours: Sat – Thu | 8:00 – 22:00"] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: "white", fontWeight: 700, fontSize: ".82rem", marginBottom: ".65rem" }}>{col.title}</h4>
                {col.links.map(l => <div key={l} style={{ fontSize: ".75rem", marginBottom: ".4rem", lineHeight: 1.5, cursor: "pointer" }}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "1.1rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
            {["Privacy Policy", "Terms & Conditions", "Refund Policy"].map(l => <span key={l} style={{ fontSize: ".72rem", cursor: "pointer" }}>{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}