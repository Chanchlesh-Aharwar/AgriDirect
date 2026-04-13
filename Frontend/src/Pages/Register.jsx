import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import { Phone, Lock, ShieldCheck } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "FARMER",
    location: ""
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [debugOtp, setDebugOtp] = useState("");

  const sendOtp = async () => {
    if (!data.phone || data.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/otp/send", {
        phone: data.phone,
        purpose: "REGISTRATION"
      });
      
      setOtpSent(true);
      setTimer(60);
      setDebugOtp(res.data.debugOtp || "");
      
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setSuccess(`OTP sent! Check console for OTP (development mode)`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/otp/verify", {
        phone: data.phone,
        otp: otp,
        purpose: "REGISTRATION"
      });

      if (res.data.verified) {
        setStep(2);
        setSuccess("Phone verified! Please complete your registration");
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    }
    setLoading(false);
  };

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
      <div className="glass-card-static auth-card fade-in" style={{ maxWidth: "480px" }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <h1 className="auth-title">
            {step === 1 ? "Verify Phone" : "Join AgriDirect"}
          </h1>
          <p className="auth-subtitle">
            {step === 1 
              ? "Enter your phone number to receive OTP" 
              : "Complete your registration details"}
          </p>
        </div>

        {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}
        {success && <div className="form-success" style={{ marginBottom: "16px" }}>{success}</div>}

        {step === 1 ? (
          <div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="glass-input"
                placeholder="Enter 10-digit mobile number"
                value={data.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setData({ ...data, phone: val });
                }}
                maxLength={10}
                required
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading || data.phone.length !== 10}
                onClick={sendOtp}
                style={{ width: "100%", marginTop: "8px" }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                <div className="form-group" style={{ marginTop: "16px" }}>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px" }}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={loading || otp.length !== 6}
                  onClick={verifyOtp}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div style={{ textAlign: "center", marginTop: "16px", display: "flex", justifyContent: "center", gap: "12px" }}>
                  {timer > 0 ? (
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      Resend OTP in {timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--fresh-leaf-dark)",
                        cursor: "pointer",
                        fontSize: "13px",
                        textDecoration: "underline"
                      }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(168, 224, 95, 0.1)",
                  borderRadius: "8px",
                  border: "1px dashed rgba(168, 224, 95, 0.3)",
                  textAlign: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
                    <ShieldCheck size={14} color="var(--fresh-leaf-dark)" />
                    <span style={{ fontSize: "12px", color: "var(--deep-moss)", fontWeight: 600 }}>Development Mode</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Check backend console for OTP
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              padding: "12px",
              background: "rgba(16, 185, 129, 0.1)",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Phone size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: "13px", color: "var(--accent-primary)", fontWeight: 500 }}>
                +91 {data.phone}
              </span>
            </div>

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
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  onClick={() => setData({ ...data, role: "FARMER" })}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "center",
                    border: data.role === "FARMER" ? "2px solid var(--fresh-leaf)" : "2px solid transparent",
                    background: data.role === "FARMER" ? "rgba(168, 224, 95, 0.15)" : "rgba(255,255,255,0.5)",
                    transition: "var(--transition)"
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>🌱</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--deep-moss)" }}>Farmer</div>
                </div>

                <div
                  onClick={() => setData({ ...data, role: "RESTAURANT" })}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "center",
                    border: data.role === "RESTAURANT" ? "2px solid var(--fresh-leaf)" : "2px solid transparent",
                    background: data.role === "RESTAURANT" ? "rgba(168, 224, 95, 0.15)" : "rgba(255,255,255,0.5)",
                    transition: "var(--transition)"
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>🏪</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--deep-moss)" }}>Restaurant</div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                width: "100%",
                marginTop: "12px",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              ← Change phone number
            </button>
          </form>
        )}

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
