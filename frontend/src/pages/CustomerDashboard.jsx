import { useEffect, useState } from "react";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [desc, setDesc] = useState("Tyre puncture");
  const [active, setActive] = useState(null);
  const [mechLoc, setMechLoc] = useState(null);
  const [rating, setRating] = useState("5");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function logout() {
    clearAuth();
    nav("/login");
  }

  function openInGoogleMaps(lat, lng) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }

  function openInAppleMaps(lat, lng) {
    window.open(`https://maps.apple.com/?q=${lat},${lng}`, "_blank");
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported on this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        alert(`Location captured ✅ (accuracy ~${Math.round(accuracy)}m)`);
      },
      (err) => {
        alert(`Location error (code ${err.code}): ${err.message || "No message"}`);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }

  async function loadActive() {
    try {
      const res = await api.get("/requests/my/active/");
      setActive(res.data);
    } catch {
      setActive(null);
      setMechLoc(null);
    }
  }

  async function createRequest() {
    if (!lat || !lng) {
      alert("Please click 'Use My Location' first (or enter coordinates in Advanced).");
      return;
    }
    await api.post("/requests/", {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      description: desc,
    });
    await loadActive();
  }

  async function cancelRequest() {
    if (!active) return;
    await api.post(`/requests/${active.id}/cancel/`);
    await loadActive();
  }

  async function fetchMechLoc(mechId) {
    try {
      const res = await api.get(`/mechanics/${mechId}/location/`);
      setMechLoc(res.data);
    } catch {
      setMechLoc(null);
    }
  }

  async function rateRequest() {
    if (!active) return;
    await api.post(`/requests/${active.id}/rate/`, { rating: parseInt(rating, 10) });
    alert("Thanks! Rating submitted.");
  }

  // refresh active request every 3 seconds
  useEffect(() => {
    loadActive();
    const t = setInterval(() => loadActive().catch(() => {}), 3000);
    return () => clearInterval(t);
  }, []);

  // if accepted, poll mechanic location every 3 seconds
  useEffect(() => {
    if (!active || active.status !== "accepted" || !active.mechanic) return;
    const t = setInterval(() => fetchMechLoc(active.mechanic).catch(() => {}), 3000);
    return () => clearInterval(t);
  }, [active]);

  function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    const dotColor =
      s === "pending" ? "#f59e0b" :
      s === "accepted" ? "#2563eb" :
      s === "completed" ? "#16a34a" :
      "#6b7280";

    return (
      <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor }} />
        {status}
      </span>
    );
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <div className="logo" />
            <div className="brandText">
              <h1>RoadAid</h1>
              <p>Customer dashboard</p>
            </div>
          </div>
          <button className="btn btnDanger" onClick={logout}>Logout</button>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h2>Request Help</h2>
            <span className="pill ok">{username}</span>
          </div>

          <div className="cardBody">
            {/* Create request */}
            <div className="section">
              <p className="label">1) Get your location</p>
              <div className="row">
                <button type="button" className="btn btnPrimary" onClick={useMyLocation}>
                  Use My Location
                </button>
                <button type="button" className="btn" onClick={() => setShowAdvanced(!showAdvanced)}>
                  {showAdvanced ? "Hide Advanced" : "Advanced"}
                </button>
              </div>

              {showAdvanced && (
                <div className="row" style={{ marginTop: 10 }}>
                  <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="latitude" />
                  <input className="input" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="longitude" />
                </div>
              )}

              <p className="label" style={{ marginTop: 14 }}>2) Describe the problem</p>
              <div className="row">
                <input
                  className="input inputWide"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Tyre puncture near Peradeniya"
                />
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn btnPrimary" onClick={createRequest}>
                  Request Help
                </button>
                <button className="btn" onClick={loadActive}>
                  Refresh
                </button>
              </div>

              <p className="hint">Tip: If location fails, enable Location permissions in the browser and try again.</p>
            </div>

            {/* Active request */}
            <div className="section">
              <p className="label">My Current Request</p>

              {!active ? (
                <div className="hint">No active request (pending/accepted).</div>
              ) : (
                <div style={{
                  border: "1px solid rgba(17, 24, 39, 0.10)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#ffffff",
                  boxShadow: "0 8px 22px rgba(17,24,39,0.06)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>Request #{active.id}</div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{active.description}</div>
                    </div>
                    <StatusBadge status={active.status} />
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <button className="btn" onClick={() => openInGoogleMaps(active.latitude, active.longitude)}>
                      Open in Google Maps
                    </button>
                    <button className="btn" onClick={() => openInAppleMaps(active.latitude, active.longitude)}>
                      Open in Apple Maps
                    </button>
                  </div>

                  {active.status === "pending" && (
                    <div className="row" style={{ marginTop: 12 }}>
                      <button className="btn btnDanger" onClick={cancelRequest}>Cancel Request</button>
                    </div>
                  )}

                  {active.status === "accepted" && (
                    <div style={{ marginTop: 12 }} className="hint">
                      Assigned mechanic: <b>{active.mechanic_username || active.mechanic}</b>
                    </div>
                  )}

                  <details style={{ marginTop: 12 }}>
                    <summary style={{ cursor: "pointer", color: "#6b7280" }}>Show details</summary>
                    <pre className="pre" style={{ marginTop: 10 }}>{JSON.stringify(active, null, 2)}</pre>
                  </details>
                </div>
              )}
            </div>

            {/* Mechanic location */}
            <div className="section">
              <p className="label">Mechanic Live Location</p>

              {!mechLoc ? (
                <div className="hint">No mechanic location yet (wait until request is accepted).</div>
              ) : (
                <div style={{
                  border: "1px solid rgba(17, 24, 39, 0.10)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#ffffff"
                }}>
                  <div style={{ fontWeight: 800 }}>
                    {Number(mechLoc.latitude).toFixed(6)}, {Number(mechLoc.longitude).toFixed(6)}
                  </div>
                  <div className="hint">Updated: {mechLoc.updated_at}</div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <button className="btn" onClick={() => openInGoogleMaps(mechLoc.latitude, mechLoc.longitude)}>
                      Open Mechanic in Google Maps
                    </button>
                    <button className="btn" onClick={() => openInAppleMaps(mechLoc.latitude, mechLoc.longitude)}>
                      Open Mechanic in Apple Maps
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="section">
              <p className="label">Rate Service</p>
              <div className="row">
                <input
                  className="input"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="1-5"
                  style={{ maxWidth: 120 }}
                />
                <button className="btn btnPrimary" onClick={rateRequest} disabled={!active || active.status !== "completed"}>
                  Submit Rating
                </button>
              </div>
              <p className="hint">Rating is enabled only after the request is completed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}