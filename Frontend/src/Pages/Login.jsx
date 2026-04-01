import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";

function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", data);

      if (res.data.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.id || "");
      localStorage.setItem("user", JSON.stringify({
        id: res.data.id || "",
        email: data.email,
        name: res.data.name || "",
        role: res.data.role
      }));

      if (res.data.role === "FARMER") {
        navigate("/farmer/dashboard");
      } else {
        navigate("/restaurant/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password. Please try again.");
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
          <h1 className="auth-title">AgriDirect</h1>
          <p className="auth-subtitle">Fresh from farm to your table</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label>Password</label>
            <input
              type="password"
              className="glass-input"
              placeholder="Enter your password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/register")}>
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;