import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import AppLayout from "../components/AppLayout";
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

export default function MechanicSettings() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [skills, setSkills] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  function logout() {
    clearAuth();
    nav("/login");
  }

  async function loadProfile() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/mechanics/profile/");
      setSkills(Array.isArray(res.data?.skills) ? res.data.skills : []);
      setVehicleTypes(Array.isArray(res.data?.vehicle_types) ? res.data.vehicle_types : []);
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not load your profile."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

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

  async function handleSave() {
    setErr("");
    setMsg("");

    if (skills.length === 0) {
      setErr("Select at least one job type you can handle.");
      return;
    }

    setSaving(true);
    try {
      await api.patch("/mechanics/profile/", {
        skills,
        vehicle_types: vehicleTypes,
      });
      setMsg("Your skills were saved. You'll only be shown matching requests from now on.");
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not save your skills."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Mechanic settings"
      right={
        <div className="mechTopRight">
          <span className="mechUserPill">{username}</span>
          <button className="btn" onClick={() => nav("/mechanic")}>
            Back to Dashboard
          </button>
          <button className="btn btnDanger" onClick={logout}>
            Logout
          </button>
        </div>
      }
    >
      <div className="mechHero">
        <h1 className="mechHeroTitle">My Skills</h1>
        <div className="mechHeroSub">
          Choose which problems and vehicle types you can handle
        </div>
      </div>

      {err && <div className="alertBox alertError">{err}</div>}
      {msg && <div className="alertBox alertSuccess">{msg}</div>}

      <div className="mechSection skillsBox" style={{ marginTop: 18 }}>
        <div className="mechSectionHeader">
          <div>
            <div className="mechSectionTitle">Jobs You Can Handle</div>
            <div className="mechSectionSub">
              Only customers with these problem types will show up in your Jobs tab
            </div>
          </div>

          <button className="btn" onClick={loadProfile} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="row" style={{ flexWrap: "wrap", gap: 8, marginTop: 8 }}>
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

      <div className="mechSection skillsBox" style={{ marginTop: 18 }}>
        <div className="mechSectionHeader">
          <div>
            <div className="mechSectionTitle">Vehicle Types You Service</div>
            <div className="mechSectionSub">
              Optional - leave empty to be shown requests for every vehicle type
            </div>
          </div>
        </div>

        <div className="row" style={{ flexWrap: "wrap", gap: 8, marginTop: 8 }}>
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

      <div className="mechActions" style={{ marginTop: 16 }}>
        <button className="btn btnPrimaryDark" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="mechHintBox" style={{ marginTop: 16 }}>
        Requests outside your selected skills (and vehicle types, if set) won't be shown to
        you in the Jobs tab, even if they're nearby.
      </div>
    </AppLayout>
  );
}