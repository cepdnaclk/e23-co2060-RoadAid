import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { saveAuth } from "../auth";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("customer001");
  const [password, setPassword] = useState("12345678");
  const [err, setErr] = useState("");

  async function handleLogin() {
    setErr("");
    try {
      const res = await api.post("/api/login/", { username, password });
      const token = res.data.access;

      // decode JWT payload -> user_id
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.user_id;

      // Save temporarily, then detect role by trying mechanic-only endpoint
      saveAuth({ token, role: "unknown", userId, username });

      try {
        await api.get("/requests/pending/?radius=1"); // mechanic-only
        saveAuth({ token, role: "mechanic", userId, username });
        nav("/mechanic");
      } catch {
        saveAuth({ token, role: "customer", userId, username });
        nav("/customer");
      }
    } catch {
      setErr("Login failed. Check username/password.");
    }
  }

  return (
    <div className="page">
      <div className="shell">
        {/* Centered brand */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div className="brand">
            <div className="logo" />
            <div className="brandText">
              <h1>RoadAid</h1>
              <p>Smart roadside assistance • MVP</p>
            </div>
          </div>
        </div>

        {/* Centered card */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="card" style={{ width: "100%", maxWidth: 520 }}>
            <div className="cardHeader">
              <h2>Sign in</h2>
              <span className="pill">Customer / Mechanic</span>
            </div>

            <div className="cardBody">
              <div className="section">
                <p className="label">Username</p>
                <input
                  className="input inputWide"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. customer001"
                />
              </div>

              <div className="section">
                <p className="label">Password</p>
                <input
                  className="input inputWide"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <div className="section">
                <button
                  className="btn btnPrimary"
                  style={{ width: "100%" }}
                  onClick={handleLogin}
                >
                  Login
                </button>

                {err && (
                  <p className="hint" style={{ marginTop: 10 }}>
                    {err}
                  </p>
                )}

                <p className="hint">
                  Demo accounts: <b>customer001</b> / 12345678 •{" "}
                  <b>mechanic_02</b> / 12345678
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}