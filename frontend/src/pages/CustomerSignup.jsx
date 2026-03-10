import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors.join(" ");
  }

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value) && value.length) return value.join(" ");
    }
  }

  return fallback;
}

export default function CustomerSignup() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      await api.post("/api/register/customer/", {
        username,
        full_name: fullName,
        email,
        phone,
        password,
      });

      setMsg("Customer account created successfully.");
      setTimeout(() => nav("/login"), 1200);
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not create customer account."));
    }
  }

  return (
    <div className="simpleAuthPage">
      <div className="simpleAuthWrap">
        <div className="simpleAuthBrand">
          <h1>RoadAid</h1>
          <p>Customer registration</p>
        </div>

        <div className="simpleAuthCard">
          <div className="simpleAuthHeader">
            <h2>Create customer account</h2>
            <span className="pill">Customer</span>
          </div>

          <div className="simpleAuthBody">
            <form onSubmit={handleSubmit} className="simpleAuthForm">
              <div className="simpleAuthField">
                <label>Username</label>
                <input className="input inputWide" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="simpleAuthField">
                <label>Full name</label>
                <input className="input inputWide" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div className="simpleAuthField">
                <label>Email</label>
                <input className="input inputWide" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="simpleAuthField">
                <label>Phone number</label>
                <input className="input inputWide" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
              </div>

              <div className="simpleAuthField">
                <label>Password</label>
                <input className="input inputWide" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {err && <div className="alertBox alertError">{err}</div>}
              {msg && <div className="alertBox alertSuccess">{msg}</div>}

              <button type="submit" className="authPrimaryBtn">
                Create account
              </button>

              <div className="simpleAuthBottom">
                Already have an account?{" "}
                <Link to="/login" className="authTextLink">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}