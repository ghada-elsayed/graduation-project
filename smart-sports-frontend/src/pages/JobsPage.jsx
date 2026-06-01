import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeCV, getMyApplications, getAllJobs } from "../services/api";

// const CLUBS = [
//   {
//     id: 1,
//     name: "Al Ahly FC",
//     logo: "🔴",
//     location: "Cairo, Egypt",
//     position: "Striker (ST)",
//     age: "18-28",
//     height: "175+ cm",
//     experience: "3+ years",
//     skills: ["Shooting", "Pace", "Positioning"],
//     salary: "$5,000 - $8,000/month",
//     deadline: "May 30, 2026",
//     description: "Looking for an experienced striker with strong finishing ability and good positioning.",
//   },
//   {
//     id: 2,
//     name: "Zamalek SC",
//     logo: "⚪",
//     location: "Cairo, Egypt",
//     position: "Central Midfielder (CM)",
//     age: "20-30",
//     height: "170+ cm",
//     experience: "4+ years",
//     skills: ["Passing", "Vision", "Teamwork"],
//     salary: "$4,000 - $7,000/month",
//     deadline: "Jun 15, 2026",
//     description: "Seeking a creative midfielder with excellent passing and tactical awareness.",
//   },
//   {
//     id: 3,
//     name: "Pyramids FC",
//     logo: "🟡",
//     location: "Giza, Egypt",
//     position: "Right Winger (RW)",
//     age: "18-26",
//     height: "165+ cm",
//     experience: "2+ years",
//     skills: ["Dribbling", "Pace", "Crossing"],
//     salary: "$3,000 - $6,000/month",
//     deadline: "Jun 1, 2026",
//     description: "Looking for a fast and skillful winger with strong dribbling ability.",
//   },
//   {
//     id: 4,
//     name: "Al Masry SC",
//     logo: "🟢",
//     location: "Port Said, Egypt",
//     position: "Goalkeeper (GK)",
//     age: "20-32",
//     height: "185+ cm",
//     experience: "3+ years",
//     skills: ["Reflexes", "Distribution", "Leadership"],
//     salary: "$2,500 - $5,000/month",
//     deadline: "Jun 20, 2026",
//     description: "Seeking an experienced goalkeeper with strong reflexes and good communication.",
//   },
//   {
//     id: 5,
//     name: "Smouha SC",
//     logo: "🔵",
//     location: "Alexandria, Egypt",
//     position: "Center Back (CB)",
//     age: "20-30",
//     height: "180+ cm",
//     experience: "3+ years",
//     skills: ["Defending", "Heading", "Strength"],
//     salary: "$2,000 - $4,500/month",
//     deadline: "May 25, 2026",
//     description: "Looking for a strong and dominant center back with good aerial ability.",
//   },
//   {
//     id: 6,
//     name: "ENPPI FC",
//     logo: "🟠",
//     location: "Cairo, Egypt",
//     position: "Defensive Midfielder (CDM)",
//     age: "20-29",
//     height: "172+ cm",
//     experience: "2+ years",
//     skills: ["Defending", "Stamina", "Tackling"],
//     salary: "$2,000 - $4,000/month",
//     deadline: "Jun 10, 2026",
//     description: "Seeking a defensive midfielder with strong tackling and high work rate.",
//   },
// ];

export default function JobsPage() {
  const navigate = useNavigate();
  const [uploadingId, setUploadingId]   = useState(null);
  const [results, setResults]           = useState({});
  const [search, setSearch]             = useState("");
  const [filterPos, setFilterPos]       = useState("All");
  const [clubs, setClubs] = useState([]);


  useEffect(() => {

  getAllJobs()
    .then(res => setClubs(res.data))
    .catch(() => {});

  getMyApplications()
    .then(res => {
        console.log("Applications:", res.data);
      const saved = {};
      res.data.forEach(app => {
        // console.log("App club_id:", app.club_id, typeof app.club_id);
        const id = Number(app.club_id);
        if (!saved[id]) {
        saved[id] = {
          score:      app.score,
          status:     app.status,
          color:      app.score >= 80 ? "#10b981" : app.score >= 60 ? "#f97316" : "#ef4444",
          met_skills: app.met_skills ? app.met_skills.split(", ") : [],
        };
    }
      });
      console.log("Saved results:", saved);
      setResults(saved);
    })
    .catch(err => console.log("Error:", err));
}, []);


  const positions = ["All", "ST", "CM", "RW", "GK", "CB", "CDM"];

const filtered = clubs.filter(c => {
  const matchSearch = c.club_name?.toLowerCase().includes(search.toLowerCase()) ||
                      c.position?.toLowerCase().includes(search.toLowerCase());
  const matchPos = filterPos === "All" || c.position?.includes(filterPos);
  return matchSearch && matchPos;
});

  const handleUpload = async (e, club) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploadingId(club.id);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await analyzeCV(club.club_id, formData);
    const data = res.data;

    setResults(prev => ({
      ...prev,
      [club.id]: {
        score:   data.score,
        status:  data.status,
        color:   data.score >= 80 ? "#10b981" : data.score >= 60 ? "#f97316" : "#ef4444",
        met_skills:      data.met_skills      || [],
        player_position: data.player_position || "Unknown",
        is_sports_cv:    data.is_sports_cv,
        player_info:     data.player_info     || {},
      }
    }));

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.detail || "Error analyzing CV");
  } finally {
    setUploadingId(null);
  }
};

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:"Segoe UI,sans-serif",display:"flex", flexDirection:"column" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .card { background:white; border:1px solid #e2eaf2; border-radius:16px; padding:1.5rem; transition:all .2s; }
        .card:hover { box-shadow:0 8px 24px rgba(37,99,235,.1); transform:translateY(-2px); }
        .badge { display:inline-block; padding:.2rem .6rem; border-radius:6px; font-size:.68rem; font-weight:700; }
        .btn-orange { background:#f97316; color:white; border:none; padding:.6rem 1.2rem; border-radius:8px; font-weight:700; font-size:.82rem; cursor:pointer; transition:all .2s; width:100%; }
        .btn-orange:hover { background:#ea580c; }
        .fi { background:#f8fafc; border:1px solid #e2eaf2; border-radius:8px; padding:.5rem .9rem; font-size:.82rem; color:#1a2332; outline:none; }
        .fi:focus { border-color:#2563eb; }
        .filter-btn { padding:.4rem .9rem; border-radius:8px; border:1.5px solid #e2eaf2; background:white; font-size:.75rem; font-weight:600; cursor:pointer; color:#64748b; transition:all .2s; }
        .filter-btn.on { background:#2563eb; color:white; border-color:#2563eb; }
      `}</style>

      {/* Navbar */}
      <nav style={{ background:"white", borderBottom:"1px solid #e2eaf2", padding:".85rem 2rem", display:"flex", alignItems:"center", gap:"1rem", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid white" }} />
          </div>
          <span style={{ fontWeight:800, fontSize:".9rem", color:"#1a2332" }}>SmartSports</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:"1.5rem", alignItems:"center" }}>
          <span onClick={() => navigate('/')}         style={{ fontSize:".85rem", color:"#64748b", cursor:"pointer" }}>Home</span>
          <span onClick={() => navigate('/dashboard')} style={{ fontSize:".85rem", color:"#64748b", cursor:"pointer" }}>Dashboard</span>
          <span onClick={() => navigate('/nutrition')} style={{ fontSize:".85rem", color:"#64748b", cursor:"pointer" }}>Nutrition</span>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem",flex:1, width:"100%" }}>

        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          <h1 style={{ fontWeight:800, fontSize:"1.8rem", color:"#1a2332", marginBottom:".4rem" }}>Club Job Offers 🏟️</h1>
          <p style={{ color:"#64748b", fontSize:".88rem" }}>Upload your CV to apply and see how well you match each club's requirements</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display:"flex", gap:"1rem", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          <input
            className="fi"
            placeholder="Search clubs or positions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:220 }}
          />
          <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
            {positions.map(p => (
              <button key={p} className={"filter-btn" + (filterPos===p?" on":"")} onClick={() => setFilterPos(p)}>{p}</button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem" }}>
          {[
            ["Total Offers", clubs.length, "#2563eb"],
            ["Applied",       Object.keys(results).length,            "#10b981"],
            ["Great Matches", Object.values(results).filter(r=>r.score>=80).length, "#f97316"],
          ].map(([l,v,c]) => (
            <div key={l} style={{ background:"white", border:"1px solid #e2eaf2", borderRadius:12, padding:".85rem 1.25rem", display:"flex", alignItems:"center", gap:".75rem" }}>
              <div style={{ fontWeight:800, fontSize:"1.4rem", color:c }}>{v}</div>
              <div style={{ fontSize:".75rem", color:"#64748b", fontWeight:500 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Cards Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.25rem" }}>
          {filtered.map(club => {
            const result    = results[club.id];
            const uploading = uploadingId === club.id;

            return (
              <div key={club.id} className="card">
                {/* Club header */}
                <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:"1rem" }}>
                  <div style={{ width:44, height:44, background:"linear-gradient(135deg,#1e3a5f,#2c5282)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", color:"white", fontWeight:700, flexShrink:0 }}>
                    {club.club_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:".92rem", color:"#1a2332" }}>{club.club_name}</div>
                    <div style={{ fontSize:".72rem", color:"#94a3b8" }}>📍 {club.location || "—"}</div>
                  </div>
                </div>

                {/* Position badge */}
                <span className="badge" style={{ background:"#dbeafe", color:"#2563eb", marginBottom:".75rem" }}>
                  {club.position}
                </span>

                {/* Description */}
                <p style={{ fontSize:".78rem", color:"#64748b", lineHeight:1.6, marginBottom:"1rem" }}>
                  {club.description || "No description available"}
                </p>
                {/* Requirements */}
                <div style={{ background:"#f8fafc", borderRadius:10, padding:".75rem", marginBottom:"1rem" }}>
                  <div style={{ fontSize:".7rem", fontWeight:600, color:"#475569", marginBottom:".5rem" }}>Details</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:".3rem" }}>
                    {[
                      ["Sport",    club.sport    || "—"],
                      ["Position", club.position || "—"],
                      ["Location", club.location || "—"],
                    ].map(([l,v]) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem" }}>
                        <span style={{ color:"#94a3b8" }}>{l}</span>
                        <span style={{ color:"#1a2332", fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills
                <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1rem" }}>
                  {club.skills.map(s => (
                    <span key={s} className="badge" style={{ background:"#f0fdf4", color:"#16a34a" }}>{s}</span>
                  ))}
                </div>

                Deadline 
                <div style={{ fontSize:".7rem", color:"#94a3b8", marginBottom:"1rem" }}>⏰ Deadline: {club.deadline}</div> */}

                {/* Result */}
                {result && (
                  <div style={{ background:result.color+"15", border:`1px solid ${result.color}30`, borderRadius:10, padding:".75rem", marginBottom:"1rem" }}>
                    <div style={{ textAlign:"center", marginBottom:".5rem" }}>
                      <div style={{ fontWeight:800, fontSize:"1.5rem", color:result.color }}>{result.score}%</div>
                      <div style={{ fontSize:".75rem", color:result.color, fontWeight:600 }}>{result.status}</div>
                    </div>
                    {result.player_position && (
                      <div style={{ fontSize:".7rem", color:"#64748b", marginBottom:".35rem" }}>
                        Your Position: <strong>{result.player_position}</strong>
                      </div>
                    )}
                    {result.met_skills && result.met_skills.length > 0 && (
                      <div style={{ fontSize:".7rem", color:"#64748b" }}>
                        Matched Skills: <strong style={{ color:"#10b981" }}>{result.met_skills.join(", ")}</strong>
                      </div>
                    )}
                    {result.is_sports_cv === false && (
                      <div style={{ fontSize:".7rem", color:"#ef4444", marginTop:".35rem" }}>
                        ⚠ CV doesn't appear to be sports-related
                      </div>
                    )}
                  </div>
                )}

                {/* Upload CV */}
                {uploading ? (
                  <div style={{ background:"#eff6ff", borderRadius:8, padding:".75rem", textAlign:"center", fontSize:".78rem", color:"#2563eb", fontWeight:600 }}>
                    ⏳ Analyzing your CV...
                  </div>
                ) : result ? (
                  <label style={{ display:"block", background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", padding:".6rem", borderRadius:8, textAlign:"center", fontSize:".78rem", fontWeight:600, cursor:"pointer" }}>
                    ✅ Applied — Upload Again?
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleUpload(e, club)} style={{ display:"none" }} />
                  </label>
                ) : (
                  <label style={{ display:"block" }}>
                    <div className="btn-orange" style={{ textAlign:"center" }}>📄 Upload CV to Apply</div>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleUpload(e, club)} style={{ display:"none" }} />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background:"#1a2f45", color:"#94a3b8", padding:"1.5rem 2rem", marginTop:"auto" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {["Home","Fitness","Interview","Performance"].map(l => <span key={l} style={{ fontSize:".72rem", cursor:"pointer" }}>{l}</span>)}
          </div>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {["FAQs","Feedback","App Download","Membership Plans"].map(l => <span key={l} style={{ fontSize:".72rem", cursor:"pointer" }}>{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}