import { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { register } from '../services/api';

const ROLES = {
  individual: { label: "Individual User", icon: "👤", fields: ["firstName","lastName","email","phone","age","gender","password","confirmPassword"] },
  athlete:    { label: "Athlete",         icon: "🏆", fields: ["firstName","lastName","email","phone","city","playerStatus","sportsExperience","position","age","gender","weight_kg","height_cm","password","confirmPassword"] },
  club:       { label: "Sports Club",     icon: "🏟️", fields: ["clubName","sportCategory","location","email","password","confirmPassword"] },
};

const FIELD_CONFIG = {
  firstName:        { label: "First Name",       type: "text",     placeholder: "Ahmed" },
  lastName:         { label: "Last Name",         type: "text",     placeholder: "Hassan" },
  email:            { label: "Email Address",     type: "email",    placeholder: "example@email.com" },
  phone:            { label: "Phone Number",      type: "tel",      placeholder: "+20 100 000 0000" },
  age:              { label: "Your Age",          type: "number",   placeholder: "25" },
  gender:           { label: "Select Gender",     type: "select",   options: ["Male","Female"] },
  playerStatus:     { label: "Player Status",     type: "select",   options: ["Amateur","Semi-Pro","Professional"] },
  sportsExperience: { label: "Sports Experience", type: "select",   options: ["Football","Basketball","Tennis","Swimming","Boxing","Other"] },
  clubName:         { label: "Club Name",         type: "text",     placeholder: "Al Ahly FC" },
  sportCategory:    { label: "Sport Category",    type: "select",   options: ["Football","Basketball","Tennis","Swimming","Multi-Sport"] },
  weight_kg:        { label: "Weight (kg)", type: "number", placeholder: "70"  },
  height_cm:        { label: "Height (cm)", type: "number", placeholder: "175" },
  sport:            { label: "Sport",       type: "text",   placeholder: "Football" },
  position:         { label: "Position",    type: "text",   placeholder: "Forward"  },
  city:             { label: "City",        type: "text",   placeholder: "Cairo"    },
  location:         { label: "Location",          type: "text",     placeholder: "City, Country" },
  password:         { label: "Password",          type: "password", placeholder: "••••••••" },
  confirmPassword:  { label: "Confirm Password",  type: "password", placeholder: "••••••••" },
};

export default function RegisterPage({ role: initialRole = "athlete", onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role || initialRole);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const currentRole = ROLES[role];

  const handleChange = (field, value) => {
    console.log("Field:", field, "Value:", value);
    if (field === "age" || field === "weight_kg" || field === "height_cm") {
    if (value !== "" && parseFloat(value) <= 0) {
      return; // تجاهل التغيير تماماً فلا يظهر الرقم السالب في الخانة
    }
  }
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // const validate = () => {
  //   const errs = {};
  //   currentRole.fields.forEach(f => { if (!form[f]) errs[f] = "Required"; });
  //   if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
  //     errs.confirmPassword = "Passwords don't match";
  //   return errs;
  // };

const validate = () => {
    const errs = {};
    currentRole.fields.forEach(f => { if (!form[f]) errs[f] = "Required"; });
    
    // التحقق من رقم الهاتف المصري
    if (form.phone) {
        const phoneRegex = /^(010|011|012|015)\d{8}$/;
        if (!phoneRegex.test(form.phone)) {
            errs.phone = "يجب أن يكون رقم مصري صالح (01x) مكون من 11 رقم";
        }
    }
    
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
        errs.confirmPassword = "Passwords don't match";
    
    return errs;
};

  const handleSubmit = async () => {
    const errs = validate();
     console.log("Errors:", errs);        // ← ضيفي السطر ده
      console.log("Form:", form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      console.log("Sending to API...");
      await register({
        full_name: `${form.firstName || form.clubName} ${form.lastName || ''}`.trim(),
        email:     form.email,
        password:  form.password,
        role:      role === 'club' ? 'club' : 'player',
        age:       form.age       ? +form.age       : null,
        weight_kg: form.weight_kg    ? +form.weight_kg    : null,
        height_cm: form.height_cm    ? +form.height_cm    : null,
        phone:     form.phone     || null,
        sport:     form.sport     || form.sportsExperience || null,
        position:  form.position  || null,
        city:      form.city      || null,
      });
      setLoading(false);
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setErrors({ email: err.response?.data?.detail || 'Registration failed' });
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .fi { width:100%; padding:.65rem .9rem; border:1.5px solid #e2eaf2; border-radius:8px; font-size:.85rem; font-family:inherit; background:white; color:#1a2332; outline:none; transition:border-color .2s; appearance:none; }
        .fi:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
        .fi.err { border-color:#ef4444; }
        .fi::placeholder { color:#cbd5e1; }
        .rtab { padding:.45rem 1rem; border-radius:8px; border:1.5px solid #e2eaf2; background:white; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .2s; color:#64748b; }
        .rtab.active { background:#2563eb; color:white; border-color:#2563eb; }
        .rtab:hover:not(.active) { border-color:#2563eb; color:#2563eb; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp .5s ease both; }
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
      <nav style={{ background:"white", borderBottom:"1px solid #e2eaf2", padding:".85rem 2rem", display:"flex", alignItems:"center", gap:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#1e3a5f,#f97316)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid white" }} />
          </div>
          <span style={{ fontWeight:800, fontSize:".9rem", color:"#1a2332" }}>SmartSports</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:"2rem" }}>
          {[
            { label: "Home",        path: "/" },
            { label: "Fitness",     path: "/nutrition" },
            { label: "Performance", path: "/dashboard" },
            { label: "Interview",   path: "/dashboard" },
          ].map(l => (
          <span
          key={l.label}
          onClick={() => navigate(l.path)}
          style={{ fontSize:".85rem", color:"#64748b", cursor:"pointer", fontWeight:500 }}
          >
            {l.label}
            </span>
          ))}
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div className="fu" style={{ background:"white", borderRadius:20, boxShadow:"0 8px 40px rgba(0,0,0,.08)", width:"100%", maxWidth:920, overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1.5fr" }}>

          {/* Left image */}
          <div className="photo" style={{ background:"linear-gradient(160deg,#1e3a5f,#2c5282)", padding:"2.5rem 1.5rem", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-60, right:-60, width:180, height:180, background:"rgba(255,255,255,.04)", borderRadius:"50%" }} />
            <div style={{ width:"100%", height:280, borderRadius:14, overflow:"hidden", marginBottom:"1.25rem", position:"relative" }}>
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" alt="Athlete" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:34, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"white", fontWeight:900, fontSize:".9rem", writingMode:"vertical-rl", textOrientation:"mixed", letterSpacing:"4px", transform:"rotate(180deg)" }}>STRENGTH</span>
              </div>
            </div>
            <p style={{ color:"rgba(255,255,255,.7)", fontSize:".75rem", textAlign:"center", lineHeight:1.6 }}>Join thousands of athletes improving their performance with SmartSports</p>
          </div>

          {/* Right form */}
          <div style={{ padding:"2rem", overflowY:"auto", maxHeight:"90vh" }}>
            <h2 style={{ fontWeight:800, fontSize:"1.3rem", color:"#1a2332", marginBottom:".2rem" }}>Create Account</h2>
            <p style={{ color:"#94a3b8", fontSize:".75rem", marginBottom:"1.2rem" }}>Fill in your details to get started</p>

            {/* Role tabs */}
            <div style={{ display:"flex", gap:".5rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
              {Object.entries(ROLES).map(([key, val]) => (
                <button key={key} className={`rtab${role===key?" active":""}`} onClick={() => { setRole(key); setForm({}); setErrors({}); }}>
                  {val.icon} {val.label}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".85rem" }}>
              {currentRole.fields.map(field => {
                const cfg = FIELD_CONFIG[field];
                return (
                  <div key={field}>
                    <label style={{ fontSize:".75rem", fontWeight:600, color:"#475569", marginBottom:".3rem", display:"block" }}>{cfg.label}</label>
                    {cfg.type === "select" ? (
                      <select className={`fi${errors[field]?" err":""}`} value={form[field]||""} onChange={e => handleChange(field, e.target.value)}>
                        <option value="">Select {cfg.label}</option>
                        {cfg.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className={`fi${errors[field]?" err":""}`} type={cfg.type} placeholder={cfg.placeholder} value={form[field]||""} onChange={e => handleChange(field, e.target.value)} />
                    )}
                    {errors[field] && <div style={{ fontSize:".68rem", color:"#ef4444", marginTop:".2rem" }}>⚠ {errors[field]}</div>}
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize:".68rem", color:"#94a3b8", margin:".9rem 0 .4rem", lineHeight:1.5 }}>
              By clicking submit, I agree to the <span style={{ color:"#2563eb", cursor:"pointer" }}>terms and conditions</span> and have the authority to register this account.
            </p>

            <button onClick={handleSubmit} disabled={loading} style={{ background:"#f97316", color:"white", border:"none", padding:".8rem", borderRadius:10, fontWeight:700, fontSize:".9rem", cursor:"pointer", width:"100%", transition:"all .2s", opacity:loading?.6:1 }}>
              {loading ? "Creating Account..." : `Create ${currentRole.label} Account`}
            </button>

            <p style={{ textAlign:"center", fontSize:".75rem", color:"#94a3b8", marginTop:".9rem" }}>
              Already have an account? <span style={{ color:"#2563eb", fontWeight:600, cursor:"pointer" }} onClick={() => navigate('/login')}>Log In</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background:"#1a2f45", color:"#94a3b8", padding:"1.5rem 2rem" }}>
        <div style={{ maxWidth:920, margin:"0 auto", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {["Home","Fitness","Interview","Performance"].map(l => <span key={l} style={{ fontSize:".72rem", cursor:"pointer" }}>{l}</span>)}
          </div>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {["FAQs","Feedback","App Download","Membership Plans"].map(l => <span key={l} style={{ fontSize:".72rem", cursor:"pointer" }}>{l}</span>)}
          </div>
          <div style={{ fontSize:".7rem", display:"flex", flexDirection:"column", gap:".25rem" }}>
            <span>Address: 123 Fitness Street, Alexandria, Egypt</span>
            <span>Email: contact@fitneshub.com</span>
          </div>
        </div>
        <div style={{ maxWidth:920, margin:".9rem auto 0", borderTop:"1px solid #1e293b", paddingTop:".9rem", display:"flex", gap:"1.5rem" }}>
          {["Privacy Policy","Terms & Conditions","Refund Policy"].map(l => <span key={l} style={{ fontSize:".68rem", cursor:"pointer" }}>{l}</span>)}
        </div>
      </footer>
    </div>
  );
}