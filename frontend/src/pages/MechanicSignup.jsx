import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { PROBLEM_OPTIONS, VEHICLE_OPTIONS } from "../utils/problemTypes";

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

export default function MechanicSignup() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  function toggleSkill(value) {
    setSkills((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleVehicleType(value) {
    setVehicleTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (skills.length === 0) {
      setErr("Please select at least one type of job you can handle.");
      return;
    }

    if (vehicleTypes.length === 0) {
      setErr("Please select at least one vehicle type you can service.");
      return;
    }

    try {
      await api.post("/api/register/mechanic/", {
        username,
        full_name: fullName,
        email,
        phone,
        skills,
        vehicle_types: vehicleTypes,
        password,
      });

      setMsg("Mechanic account submitted. Waiting for approval.");
      setTimeout(() => nav("/login"), 1400);
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not create mechanic account."));
    }
  }

  return (
    <div className="simpleAuthPage">
      <div className="simpleAuthWrap">
        <div className="simpleAuthBrand">
          <h1>RoadAid</h1>
          <p>Mechanic registration</p>
        </div>

        <div className="simpleAuthCard">
          <div className="simpleAuthHeader">
            <h2>Create mechanic account</h2>
            <span className="pill">Mechanic</span>
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
                <label>Jobs you can handle</label>
                <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                  Select every problem type you're able to repair. Customers with these
                  problems are the only ones who'll see your accepted requests match you.
                </p>
                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {PROBLEM_OPTIONS.map((item) => (
                    <label
                      key={item.value}
                      className="rememberCheck"
                      style={{
                        border: "1px solid rgba(17,24,39,0.15)",
                        borderRadius: 8,
                        padding: "6px 10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={skills.includes(item.value)}
                        onChange={() => toggleSkill(item.value)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="simpleAuthField">
                <label>Vehicle types you can service</label>
                <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                  Only customers with these vehicle types will show up in your Jobs tab -
                  like a tuk-tuk mechanic not being shown truck jobs.
                </p>
                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {VEHICLE_OPTIONS.map((item) => (
                    <label
                      key={item.value}
                      className="rememberCheck"
                      style={{
                        border: "1px solid rgba(17,24,39,0.15)",
                        borderRadius: 8,
                        padding: "6px 10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={vehicleTypes.includes(item.value)}
                        onChange={() => toggleVehicleType(item.value)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
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