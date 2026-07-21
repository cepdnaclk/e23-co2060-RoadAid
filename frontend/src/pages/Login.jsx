import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { saveAuth } from "../auth";

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

export default function Login() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [err, setErr] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/api/login/", { username, password });

      saveAuth({
        access: res.data.access,
        refresh: res.data.refresh,
        user: res.data.user,
        rememberMe,
      });

      // Staff status must take priority over a leftover customer/mechanic role.
      // Otherwise an administrator can be sent to a normal user dashboard.
      if (res.data.user.is_staff || res.data.user.is_superuser) {
        nav("/admin");
      } else if (res.data.user.role === "mechanic") {
        nav("/mechanic");
      } else if (res.data.user.role === "customer") {
        nav("/customer");
      } else {
        nav("/customer");
      }
      
    } catch (error) {
      setErr(
        getApiErrorMessage(
          error,
          "Login failed. Check username and password."
        )
      );
    }
  }

  return (
    <div className="simpleAuthPage">
      <div className="simpleAuthWrap">
        <div className="simpleAuthBrand">
          <h1>RoadAid</h1>
          <p>Smart roadside assistance</p>
        </div>

        <div className="simpleAuthCard">
          <div className="simpleAuthHeader">
            <h2>Welcome back</h2>
            <span className="pill">Customer / Mechanic</span>
          </div>

          <div className="simpleAuthBody">
            <form onSubmit={handleLogin} className="simpleAuthForm">
              <div className="simpleAuthField">
                <label>Username</label>
                <input
                  className="input inputWide"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="simpleAuthField">
                <label>Password</label>
                <input
                  className="input inputWide"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="simpleAuthOptions">
                <label className="rememberCheck">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="authTextLink">
                  Forgot password?
                </Link>
              </div>

              {err && <div className="alertBox alertError">{err}</div>}

              <button type="submit" className="authPrimaryBtn">
                Sign in
              </button>

              <div className="simpleAuthBottom">
                Don&apos;t have an account?{" "}
                <Link to="/signup/customer" className="authTextLink">
                  Customer signup
                </Link>{" "}
                /{" "}
                <Link to="/signup/mechanic" className="authTextLink">
                  Mechanic signup
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
