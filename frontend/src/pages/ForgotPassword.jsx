import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [msg, setMsg] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setMsg("Password reset flow is not active yet. Backend setup is needed next.");
  }

  return (
    <div className="authSplitPage">
      <div className="authSplitLeft">
        <div className="authBrandTop">RoadAid</div>

        <div className="authFormWrap">
          <h1>Forgot password</h1>
          <p className="authSubtext">Enter your phone number or email</p>

          <form onSubmit={handleSubmit} className="authForm">
            <div className="authField">
              <label>Email or phone</label>
              <input
                className="input authInput"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="you@example.com or 07XXXXXXXX"
                required
              />
            </div>

            {msg && <div className="alertBox alertSuccess">{msg}</div>}

            <button type="submit" className="authPrimaryBtn">
              Continue
            </button>

            <div className="authBottomText">
              Back to{" "}
              <Link to="/login" className="authTextLink">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="authSplitRight">
        <div className="authIllustrationBox">
          <div className="authIllustrationTitle">Secure recovery</div>
          <div className="authIllustrationText">
            Recover access with verified email or phone reset flow.
          </div>
        </div>
      </div>
    </div>
  );
}