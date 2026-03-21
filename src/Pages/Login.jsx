import { useState } from "react";
import API from "../Services/api";
import "./Auth.css";

function Login() {
  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", data);
      alert(res.data);
    } catch {
      alert("Login Failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setData({...data, email: e.target.value})}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setData({...data, password: e.target.value})}
          />

          <button>Login</button>
        </form>

        <p>Don't have account? <a href="/register">Signup</a></p>
      </div>
    </div>
  );
}

export default Login;