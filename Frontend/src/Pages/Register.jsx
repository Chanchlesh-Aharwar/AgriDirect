import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "FARMER",
    location: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/auth/register", data);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Email might already exist.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="glass-card-static auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <h1 className="auth-title">Join AgriDirect</h1>
          <p className="auth-subtitle">Start your journey with us today</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="glass-input"
              placeholder="Enter your full name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="glass-input"
              placeholder="Enter your email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              className="glass-input"
              placeholder="Enter your phone number"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              className="glass-input"
              placeholder="Enter your city/district"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="glass-input"
              placeholder="Create a strong password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                onClick={() => setData({ ...data, role: "FARMER" })}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: data.role === "FARMER" ? '2px solid var(--fresh-leaf)' : '2px solid transparent',
                  background: data.role === "FARMER" ? 'rgba(168, 224, 95, 0.15)' : 'rgba(255,255,255,0.5)',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🌱</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--deep-moss)' }}>Farmer</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Sell crops</div>
              </div>

              <div
                onClick={() => setData({ ...data, role: "RESTAURANT" })}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: data.role === "RESTAURANT" ? '2px solid var(--fresh-leaf)' : '2px solid transparent',
                  background: data.role === "RESTAURANT" ? 'rgba(168, 224, 95, 0.15)' : 'rgba(255,255,255,0.5)',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏪</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--deep-moss)' }}>Restaurant</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Buy produce</div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/")}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;