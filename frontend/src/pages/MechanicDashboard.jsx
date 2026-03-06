import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import { useGeo } from "../hooks/useGeo";
import { openAppleMaps, openGoogleMaps } from "../utils/maps";

export default function MechanicDashboard() {
  const nav = useNavigate();
  const { username } = getAuth();
  const { getOnce, watch, stopWatch } = useGeo();

  const [radius, setRadius] = useState("10");
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState(null);

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const watchIdRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const [doneModal, setDoneModal] = useState(false);
  const [doneInfo, setDoneInfo] = useState(null);

  function logout() {
    clearAuth();
    nav("/login");
  }

  async function loadPending() {
    const res = await api.get(`/requests/pending/?radius=${radius}`);
    setPending(res.data);
  }

  async function loadActive() {
    try {
      const res = await api.get("/requests/me/active/");
      setActive(res.data);
    } catch {
      setActive(null);
    }
  }

  async function accept(id) {
    await api.post(`/requests/${id}/accept/`);
    await loadPending();
    await loadActive();
  }

  async function complete() {
    if (!active) return;
    const res = await api.post(`/requests/${active.id}/complete/`);
    setDoneInfo(res.data);
    setDoneModal(true);
    await loadActive();
  }

  async function sendLocationOnce(latitude, longitude) {
    await api.post("/mechanics/location/", { latitude, longitude });
  }

  function useMyLocation() {
    getOnce(
      async (coords) => {
        const latitude = coords.latitude.toFixed(6);
        const longitude = coords.longitude.toFixed(6);
        setLat(latitude);
        setLng(longitude);
        await sendLocationOnce(parseFloat(latitude), parseFloat(longitude));
        alert("Location updated ✅");
      },
      (msg) => alert(msg)
    );
  }

  function startSharing() {
    if (sharing) return;
    watchIdRef.current = watch(
      async (coords) => {
        const latitude = coords.latitude;
        const longitude = coords.longitude;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        // post live location
        await api.post("/mechanics/location/", { latitude, longitude });
      },
      (msg) => alert(msg)
    );
    setSharing(true);
  }

  function stopSharingNow() {
    stopWatch(watchIdRef.current);
    watchIdRef.current = null;
    setSharing(false);
  }

  function navigateToCustomer() {
    if (!active) return;
    openGoogleMaps(active.latitude, active.longitude);
  }

  useEffect(() => {
    loadPending();
    loadActive();
  }, []);

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Mechanic dashboard"
      right={<button className="btn btnDanger" onClick={logout}>Logout</button>}
    >
      <div className="section">
        <p className="label">Location</p>
        <div className="row">
          <button className="btn btnPrimary" type="button" onClick={useMyLocation}>
            Use My Location
          </button>
          <button className="btn" type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Hide Advanced" : "Advanced"}
          </button>

          {!sharing ? (
            <button className="btn" type="button" onClick={startSharing}>Start Sharing</button>
          ) : (
            <button className="btn" type="button" onClick={stopSharingNow}>Stop Sharing</button>
          )}
        </div>

        {showAdvanced && (
          <div className="row" style={{ marginTop: 10 }}>
            <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="latitude" />
            <input className="input" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="longitude" />
            <button
              className="btn"
              type="button"
              onClick={() => sendLocationOnce(parseFloat(lat), parseFloat(lng))}
              disabled={!lat || !lng}
            >
              Send Once
            </button>
          </div>
        )}

        <p className="hint">Use “Start Sharing” while traveling so customer can track you.</p>
      </div>

      <div className="section">
        <p className="label">Pending Requests (nearby)</p>
        <div className="row">
          <input className="input" style={{ maxWidth: 120 }} value={radius} onChange={(e) => setRadius(e.target.value)} />
          <button className="btn" onClick={loadPending}>Refresh</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {pending.map((r) => (
            <div key={r.id} style={{ border:"1px solid rgba(17,24,39,0.10)", borderRadius:14, padding:12, background:"#fff" }}>
              <b>#{r.id}</b> — {r.description}
              <div className="hint">({r.latitude}, {r.longitude})</div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn btnPrimary" onClick={() => accept(r.id)}>Accept</button>
                <button className="btn" onClick={() => openGoogleMaps(r.latitude, r.longitude)}>Open in Google Maps</button>
                <button className="btn" onClick={() => openAppleMaps(r.latitude, r.longitude)}>Open in Apple Maps</button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <div className="hint">No pending requests within radius.</div>}
        </div>
      </div>

      <div className="section">
        <p className="label">My Active Job</p>
        {!active ? (
          <div className="hint">No active job (accepted).</div>
        ) : (
          <div style={{ border:"1px solid rgba(17,24,39,0.10)", borderRadius:14, padding:12, background:"#fff" }}>
            <b>#{active.id}</b> — {active.description}
            <div className="hint">Customer location: {active.latitude}, {active.longitude}</div>

            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={navigateToCustomer}>Navigate (Google Maps)</button>
              <button className="btn" onClick={() => openAppleMaps(active.latitude, active.longitude)}>Navigate (Apple Maps)</button>
              <button className="btn btnPrimary" onClick={complete}>Complete Job</button>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor:"pointer", color:"#6b7280" }}>Show details</summary>
              <pre className="pre" style={{ marginTop: 10 }}>{JSON.stringify(active, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>

      <Modal open={doneModal} title="Job Completed ✅" onClose={() => setDoneModal(false)}>
        <div className="hint">The customer can now rate and leave a review.</div>
        <pre className="pre" style={{ marginTop: 10 }}>{doneInfo ? JSON.stringify(doneInfo, null, 2) : ""}</pre>
      </Modal>
    </AppLayout>
  );
}