import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { login, resetPassword } from '../services/api';
export default function LoginPage({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetForm, setResetForm] = useState({ email: "", new_password: "" });
  const [resetMsg, setResetMsg] = useState("");

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
    const res = await login({ email: form.email, password: form.password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setLoading(false);
    if (res.data.user.email === 'admin@smartsports.com') {
      navigate('/admin');
    } else if (res.data.user.role === 'club') {
      navigate('/club-dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setLoading(false);
    setErrors({ password: 'Invalid email or password' });
  }
};

  return (
    <>
    {showReset && (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:"white", borderRadius:16, padding:"2rem", width:"100%", maxWidth:400, boxShadow:"0 8px 40px rgba(0,0,0,.15)" }}>
      <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a2332", marginBottom:"1rem" }}>Reset Password</h3>
      
      <div style={{ marginBottom:"1rem" }}>
        <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>Email</label>
        <input className="fi" type="email" placeholder="example@email.com"
          value={resetForm.email}
          onChange={e => setResetForm(prev => ({...prev, email: e.target.value}))}
        />
      </div>

      <div style={{ marginBottom:"1rem" }}>
        <div style={{ marginBottom:"1rem" }}>
          <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", display:"block", marginBottom:".35rem" }}>New Password</label>
          <div style={{ position:"relative" }}>
            <input className="fi" 
              type={showPass ? "text" : "password"} 
              placeholder="••••••••"
              value={resetForm.new_password}
              onChange={e => setResetForm(prev => ({...prev, new_password: e.target.value}))}
              style={{ paddingRight:"2.5rem" }}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              style={{ position:"absolute", right:".9rem", top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:".85rem", color:"#94a3b8" }}
            >
              {showPass ? "🙈" : "👁"}
            </span>
          </div>
        </div>
      </div>

      {resetMsg && <div style={{ fontSize:".75rem", color:"#10b981", marginBottom:"1rem", fontWeight:600 }}>{resetMsg}</div>}

      <div style={{ display:"flex", gap:".75rem" }}>
        <button
          onClick={() => {
            resetPassword(resetForm)
              .then(() => {
                setResetMsg("✅ Password reset successfully!");
                setTimeout(() => { setShowReset(false); setResetMsg(""); }, 2000);
              })
              .catch(err => setResetMsg("❌ " + (err.response?.data?.detail || "Failed")));
          }}
          style={{ flex:1, background:"#f97316", color:"white", border:"none", padding:".75rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}
        >
          Reset Password
        </button>
        <button
          onClick={() => { setShowReset(false); setResetMsg(""); }}
          style={{ padding:".75rem 1rem", borderRadius:8, border:"1px solid #e2eaf2", background:"white", color:"#64748b", fontWeight:600, cursor:"pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    
    <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .fi { width:100%; padding:.7rem .9rem; border:1.5px solid #e2eaf2; border-radius:8px; font-size:.88rem; font-family:inherit; background:white; color:#1a2332; outline:none; transition:border-color .2s; }
        .fi:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
        .fi.err { border-color:#ef4444; }
        .fi::placeholder { color:#cbd5e1; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp .6s ease both; }
        @media (max-width:780px){
        .photo{
          display:none !important;
        }
          
        .fu{
        display:block !important;
        }
        nav{
          flex-wrap:wrap !important;
          justify-content:center !important;
        }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ background:"white", borderBottom:"1px solid #e2eaf2", padding:".85rem 2rem", display:"flex", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid white" }} />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:".9rem", color:"#1a2332", lineHeight:1 }}>SmartSports</div>
            <div style={{ fontSize:".58rem", color:"#94a3b8" }}>Train Smart, Live Strong</div>
          </div>
        </div>
        <div className="nav-links-login" style={{ marginLeft:"auto", display:"flex", gap:"2rem" }}>
          {[
  { label: "Home",        path: "/" },
  { label: "Fitness",     path: "/nutrition" },
  { label: "Performance", path: "/dashboard" },
].map(l => (
  <span key={l.label} onClick={() => navigate(l.path)} style={{ fontSize:".85rem", color:"#64748b", cursor:"pointer", fontWeight:500 }}>{l.label}</span>
))}
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div className="fu" style={{ background:"white", borderRadius:20, boxShadow:"0 8px 40px rgba(0,0,0,.08)", width:"100%", maxWidth:860, overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1.2fr", minHeight:520 }}>

          {/* Left — image */}
          <div className="photo" style={{ background:"linear-gradient(160deg,#1e3a5f,#2c5282)", padding:"2.5rem 1.5rem", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-50, right:-50, width:160, height:160, background:"rgba(255,255,255,.04)", borderRadius:"50%" }} />
            <div style={{ position:"absolute", bottom:-40, left:-40, width:140, height:140, background:"rgba(249,115,22,.08)", borderRadius:"50%" }} />

            <div style={{ width:"100%", height:300, borderRadius:14, overflow:"hidden", marginBottom:"1.5rem", position:"relative" }}>
              <img
                src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80"
                alt="Athlete"
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
              />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(30,58,95,.6) 0%, transparent 60%)" }} />
            </div>

            <h3 style={{ color:"white", fontWeight:800, fontSize:"1.1rem", textAlign:"center", marginBottom:".5rem" }}>Welcome Back!</h3>
            <p style={{ color:"rgba(255,255,255,.7)", fontSize:".78rem", textAlign:"center", lineHeight:1.6 }}>
              Log in to access your personalized dashboard and continue your fitness journey.
            </p>

            {/* Stats */}
            <div style={{ display:"flex", gap:"1.5rem", marginTop:"1.5rem" }}>
              {[["20K+","Athletes"],["98%","Success"],["6K+","Coaches"]].map(([v,l]) => (
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ color:"#f97316", fontWeight:800, fontSize:"1rem" }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,.6)", fontSize:".65rem" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ padding:"3rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center" }}>
            {/* Icon */}
            <div style={{ width:52, height:52, background:"linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", marginBottom:"1.25rem" }}>🔐</div>

            <h2 style={{ fontWeight:800, fontSize:"1.4rem", color:"#1a2332", marginBottom:".3rem" }}>Log In</h2>
            <p style={{ color:"#94a3b8", fontSize:".8rem", marginBottom:"2rem" }}>Enter your credentials to access your account</p>

            {/* Email */}
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", marginBottom:".35rem", display:"block" }}>Email Address</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:".9rem", top:"50%", transform:"translateY(-50%)", fontSize:".9rem", color:"#94a3b8" }}>✉</span>
                <input
                  className={`fi${errors.email?" err":""}`}
                  type="email"
                  placeholder="example@email.com"
                  style={{ paddingLeft:"2.2rem" }}
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                />
              </div>
              {errors.email && <div style={{ fontSize:".68rem", color:"#ef4444", marginTop:".25rem" }}>⚠ {errors.email}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom:"1.5rem" }}>
              <label style={{ fontSize:".78rem", fontWeight:600, color:"#475569", marginBottom:".35rem", display:"block" }}>Password</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:".9rem", top:"50%", transform:"translateY(-50%)", fontSize:".9rem", color:"#94a3b8" }}>🔒</span>
                <input
                  className={`fi${errors.password?" err":""}`}
                  // type={showPass ? "text" : "password"}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  placeholder="••••••••"
                  style={{ paddingLeft:"2.2rem", paddingRight:"2.5rem", WebkitTextSecurity: showPass ? "none" : "disc", }}
                  
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <span
                  onClick={() => setShowPass(!showPass)}
                  style={{ position:"absolute", right:".9rem", top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:".85rem", color:"#94a3b8" }}
                >{showPass ? "🙈" : "👁"}</span>
              </div>
              {errors.password && <div style={{ fontSize:".68rem", color:"#ef4444", marginTop:".25rem" }}>⚠ {errors.password}</div>}
            </div>

            {/* Forgot */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", marginTop:"-.75rem" }}>
              <label style={{ display:"flex", alignItems:"center", gap:".4rem", cursor:"pointer" }}>
                <input type="checkbox" style={{ accentColor:"#2563eb" }} />
                <span style={{ fontSize:".75rem", color:"#64748b" }}>Remember me</span>
              </label>
              <span 
                style={{ fontSize:".75rem", color:"#2563eb", cursor:"pointer", fontWeight:600 }}
                onClick={() => setShowReset(true)}
              >Forgot Password?</span>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ background:"#f97316", color:"white", border:"none", padding:".85rem", borderRadius:10, fontWeight:700, fontSize:".95rem", cursor:"pointer", width:"100%", transition:"all .2s", opacity:loading?.6:1 }}
            >
              {loading ? "Logging in..." : "Log In →"}
            </button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", margin:"1.25rem 0" }}>
              <div style={{ flex:1, height:1, background:"#e2eaf2" }} />
              <span style={{ fontSize:".72rem", color:"#94a3b8" }}>or</span>
              <div style={{ flex:1, height:1, background:"#e2eaf2" }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign:"center", fontSize:".78rem", color:"#64748b" }}>
              Don't have an account?{" "}
              <span style={{ color:"#2563eb", fontWeight:700, cursor:"pointer" }} onClick={() => navigate('/register')}>Create Account</span>
              {/* <span style={{ color:"#2563eb", fontWeight:700, cursor:"pointer" }}>Create Account</span> */}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background:"#1a2f45", color:"#94a3b8", padding:"1.5rem 2rem" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {["Home","Fitness","Interview","Performance"].map(l => <span key={l} style={{ fontSize:".72rem", cursor:"pointer" }}>{l}</span>)}
          </div>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {["FAQs","Feedback","App Download","Membership Plans"].map(l => <span key={l} style={{ fontSize:".72rem", cursor:"pointer" }}>{l}</span>)}
          </div>
          <div style={{ fontSize:".7rem" }}>
            <div>Address: 123 Fitness Street, Alexandria, Egypt</div>
            <div>Email: contact@fitneshub.com</div>
          </div>
        </div>
        <div style={{ maxWidth:860, margin:".75rem auto 0", borderTop:"1px solid #1e293b", paddingTop:".75rem", display:"flex", gap:"1.5rem" }}>
          {["Privacy Policy","Terms & Conditions","Refund Policy"].map(l => <span key={l} style={{ fontSize:".68rem", cursor:"pointer" }}>{l}</span>)}
        </div>
      </footer>
    </div>
    </>
  );
}