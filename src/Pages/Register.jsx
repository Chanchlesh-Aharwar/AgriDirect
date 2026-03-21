import { useState } from "react";
import API from "../services/api";
import "./Auth.css";

function Register() {

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARMER"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", data);
      alert("Registered Successfully");
    } catch {
      alert("Error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input placeholder="Name"
            onChange={e => setData({...data, name:e.target.value})} />

          <input placeholder="Email"
            onChange={e => setData({...data, email:e.target.value})} />

          <input type="password" placeholder="Password"
            onChange={e => setData({...data, password:e.target.value})} />

          <select onChange={e => setData({...data, role:e.target.value})}>
            <option value="FARMER">Farmer</option>
            <option value="RESTAURANT">Restaurant</option>
          </select>

          <button>Register</button>
        </form>

        <p>Already have account? <a href="/">Login</a></p>
      </div>
    </div>
  );
}

export default Register;