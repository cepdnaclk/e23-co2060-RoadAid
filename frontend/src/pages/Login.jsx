import { useEffect, useRef, useState } from "react";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const rememberMeRef = useRef(rememberMe);

  useEffect(() => {
    rememberMeRef.current = rememberMe;
  }, [rememberMe]);

  function finishLogin(data) {
    const userData = data.user || data;

    saveAuth({
      access: data.access || data.token,
      refresh: data.refresh,
      user: userData,
      rememberMe: rememberMeRef.current,
    });

    const userRole = (userData?.role || "").toLowerCase();
    const isAdminOrStaff =
      userData?.is_staff === true ||
      userData?.is_superuser === true ||
      userRole === "admin" ||
      userRole === "staff";

    if (userRole === "mechanic") {
      nav("/mechanic");
    } else if (userRole === "customer") {
      nav("/customer");
    } else if (isAdminOrStaff) {
      nav("/admin");
    } else {
      nav("/customer");
    }
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return undefined;

    const initialiseGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setErr("");
          setGoogleLoading(true);
          try {
            const res = await api.post("/api/login/google/", { credential });
            finishLogin(res.data);
          } catch (error) {
            setErr(
              error?.request && !error?.response
                ? "Could not reach the RoadAid server. Make sure the Django backend is running, then refresh the page."
                : getApiErrorMessage(error, "Google Sign-In failed. Please try again.")
            );
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        width: 360,
      });
    };

    const existingScript = document.getElementById("google-identity-services");
    if (existingScript) {
      initialiseGoogleButton();
      existingScript.addEventListener("load", initialiseGoogleButton);
      return () => existingScript.removeEventListener("load", initialiseGoogleButton);
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initialiseGoogleButton;
    document.head.appendChild(script);
    return () => script.removeEventListener("load", initialiseGoogleButton);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/api/login/", { username, password });
      finishLogin(res.data);
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

              {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                <>
                  <div className="authDivider"><span>or</span></div>
                  <div className={googleLoading ? "googleSignIn googleSignInLoading" : "googleSignIn"} ref={googleButtonRef} />
                </>
              )}

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