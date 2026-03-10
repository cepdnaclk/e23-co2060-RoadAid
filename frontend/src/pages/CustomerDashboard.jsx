import { useEffect, useState } from "react";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const PROBLEM_OPTIONS = [
  { value: "tyre_puncture", label: "Tyre Puncture" },
  { value: "battery_dead", label: "Battery Dead" },
  { value: "engine_overheat", label: "Engine Overheat" },
  { value: "fuel_empty", label: "Fuel Empty" },
  { value: "brake_issue", label: "Brake Issue" },
  { value: "accident", label: "Accident" },
  { value: "towing", label: "Need Towing" },
  { value: "locked_out", label: "Locked Out" },
  { value: "starting_trouble", label: "Starting Trouble" },
  { value: "oil_leak", label: "Oil Leak" },
  { value: "other", label: "Other" },
];

const VEHICLE_OPTIONS = [
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bike", label: "Bike" },
  { value: "three_wheeler", label: "Three Wheeler" },
  { value: "bus", label: "Bus" },
  { value: "lorry", label: "Lorry" },
  { value: "other", label: "Other" },
];

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function RequestProgress({ status }) {
  const s = (status || "").toLowerCase();
  const isAccepted = s === "accepted" || s === "completed";
  const isCompleted = s === "completed";

  return (
    <div className="progressCard">
      <div className="progressLine" />

      <div className="progressStep active pending">
        <div className="progressCircle">●</div>
        <div className="progressLabel">Pending</div>
      </div>

      <div className={`progressStep ${isAccepted ? "active accepted" : ""}`}>
        <div className="progressCircle">●</div>
        <div className="progressLabel">Accepted</div>
      </div>

      <div className={`progressStep ${isCompleted ? "active completed" : ""}`}>
        <div className="progressCircle">●</div>
        <div className="progressLabel">Completed</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  return (
    <span className={`statusBadge status-${s}`}>
      <span className="statusDot" />
      {status}
    </span>
  );
}

export default function CustomerDashboard() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [problemType, setProblemType] = useState("tyre_puncture");
  const [customProblem, setCustomProblem] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [desc, setDesc] = useState("");

  const [active, setActive] = useState(null);
  const [mechLoc, setMechLoc] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

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
      setTracking(null);
    }
  }

  async function loadTracking() {
    setTracking(null);
  }

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

  async function createRequest() {
    setRequestMessage("");
    setRequestError("");

    if (!lat || !lng) {
      setRequestError("Please click 'Use My Location' first or enter coordinates in Advanced.");
      return;
    }

    if (problemType === "other" && !customProblem.trim()) {
      setRequestError("Please type your custom problem.");
      return;
    }

    setSubmittingRequest(true);

    try {
      const res = await api.post("/requests/", {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        problem_type: problemType,
        custom_problem: customProblem.trim(),
        vehicle_type: vehicleType,
        description: desc.trim(),
      });

      setCustomProblem("");
      setDesc("");
      setRequestMessage(
        res?.data?.detail || "Request created successfully. We are now looking for a mechanic."
      );

      await loadActive();
      await loadTracking();
    } catch (error) {
      setRequestError(
        getApiErrorMessage(
          error,
          "Could not create the request right now. Please try again."
        )
      );

      await loadActive();
    } finally {
      setSubmittingRequest(false);
    }
  }

  async function cancelRequest() {
    if (!active) return;
    await api.post(`/requests/${active.id}/cancel/`);
    await loadActive();
    await loadTracking();
  }

  async function fetchMechLoc(mechId) {
    try {
      const res = await api.get(`/mechanics/${mechId}/location/`);
      setMechLoc(res.data);
    } catch {
      setMechLoc(null);
    }
  }

  useEffect(() => {
    loadActive();
    const id = setInterval(() => {
      loadActive();
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active || active.status !== "accepted" || !active.mechanic) {
      setTracking(null);
      setMechLoc(null);
      return;
    }

    fetchMechLoc(active.mechanic).catch(() => {});
    loadTracking().catch(() => {});

    const t = setInterval(() => {
      fetchMechLoc(active.mechanic).catch(() => {});
      loadTracking().catch(() => {});
    }, 4000);

    return () => clearInterval(t);
  }, [active]);

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Customer dashboard"
      right={
        <div className="row">
          <button className="btn" onClick={() => nav("/customer/history")}>
            My History
          </button>
          <button className="btn btnPrimaryDark" onClick={logout}>
            Logout
          </button>
        </div>
      }
    >
      <div className="card">
        <div className="cardHeader">
          <h2>Request Help</h2>
          <span className="pill ok">{username}</span>
        </div>

        <div className="cardBody">
          <div className="section">
            <p className="label">1) Get your location</p>
            <div className="row">
              <button
                type="button"
                className="btn btnPrimaryDark"
                onClick={useMyLocation}
              >
                Use My Location
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide Advanced" : "Advanced"}
              </button>
            </div>

            {showAdvanced && (
              <div className="row" style={{ marginTop: 10 }}>
                <input
                  className="input"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="latitude"
                />
                <input
                  className="input"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="longitude"
                />
              </div>
            )}

            <p className="label" style={{ marginTop: 14 }}>
              2) Select problem type
            </p>
            <div className="row">
              <select
                className="input inputWide"
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
              >
                {PROBLEM_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {problemType === "other" && (
              <>
                <p className="label" style={{ marginTop: 14 }}>
                  3) Type your problem
                </p>
                <div className="row">
                  <input
                    className="input inputWide"
                    value={customProblem}
                    onChange={(e) => setCustomProblem(e.target.value)}
                    placeholder="Enter your custom problem"
                  />
                </div>
              </>
            )}

            <p className="label" style={{ marginTop: 14 }}>
              {problemType === "other"
                ? "4) Select vehicle type"
                : "3) Select vehicle type"}
            </p>
            <div className="row">
              <select
                className="input inputWide"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                {VEHICLE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="label" style={{ marginTop: 14 }}>
              {problemType === "other" ? "5) Extra notes" : "4) Extra notes"}
            </p>
            <div className="row">
              <textarea
                className="input inputWide"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Extra details such as landmarks, vehicle condition, or anything the mechanic should know"
                rows={4}
              />
            </div>

            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn btnPrimaryDark"
                onClick={createRequest}
                disabled={submittingRequest}
              >
                {submittingRequest ? "Submitting..." : "Request Help"}
              </button>
              <button
                className="btn"
                onClick={() => {
                  loadActive();
                  loadTracking();
                }}
              >
                Refresh
              </button>
            </div>

            <p className="hint">
              Tip: If location fails, enable Location permissions in the browser and try again.
            </p>
          </div>

          {requestError && <div className="alertBox alertError">{requestError}</div>}
          {requestMessage && <div className="alertBox alertSuccess">{requestMessage}</div>}

          <div className="section">
            <p className="label">My Current Request</p>

            {!active ? (
              <div className="hint">No active request (pending/accepted).</div>
            ) : (
              <div className="requestBox">
                <div className="requestTop">
                  <div>
                    <div className="requestId">Request #{active.id}</div>
                    <div className="requestTitle">
                      {active.problem_type_display || active.problem_type}
                    </div>
                    {active.custom_problem && (
                      <div className="requestMeta">
                        Custom problem: {active.custom_problem}
                      </div>
                    )}
                    <div className="requestMeta">
                      Vehicle: {active.vehicle_type_display || active.vehicle_type}
                    </div>
                    {active.description && (
                      <div className="requestMeta">Notes: {active.description}</div>
                    )}
                  </div>

                  <StatusBadge status={active.status} />
                </div>

                <div style={{ marginTop: 18 }}>
                  <RequestProgress status={active.status} />
                </div>

                <div className="detailsCard" style={{ marginTop: 18 }}>
                  <div className="detailsTitle">Request Details</div>
                  <div className="detailsGrid">
                    <div className="detailsItem">
                      <div className="detailsItemLabel">Location</div>
                      <div className="detailsItemValue">
                        {Number(active.latitude).toFixed(4)},{" "}
                        {Number(active.longitude).toFixed(4)}
                      </div>
                    </div>

                    <div className="detailsItem">
                      <div className="detailsItemLabel">Submitted</div>
                      <div className="detailsItemValue">
                        {formatDate(active.created_at)}
                      </div>
                    </div>

                    <div className="detailsItem detailsItemFull">
                      <div className="detailsItemLabel">Description</div>
                      <div className="detailsItemValue">
                        {active.description || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="actionRowSingleLine" style={{ marginTop: 18 }}>
                  <button
                    className="btn"
                    onClick={() => openInGoogleMaps(active.latitude, active.longitude)}
                  >
                    Open in Google Maps
                  </button>
                  <button
                    className="btn"
                    onClick={() => openInAppleMaps(active.latitude, active.longitude)}
                  >
                    Open in Apple Maps
                  </button>

                  {active.status === "pending" && (
                    <button className="btn btnDanger" onClick={cancelRequest}>
                      Cancel Request
                    </button>
                  )}
                </div>

                {active.status === "accepted" && (
                  <div style={{ marginTop: 14 }} className="hint">
                    Assigned mechanic: <b>{active.mechanic_username || active.mechanic}</b>
                  </div>
                )}

                <details style={{ marginTop: 14 }}>
                  <summary>Show details</summary>
                  <pre className="pre" style={{ marginTop: 10 }}>
                    {JSON.stringify(active, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          <div className="section">
            <p className="label">Mechanic Live Location</p>

            {!mechLoc ? (
              <div className="hint">
                No mechanic location yet (wait until request is accepted).
              </div>
            ) : (
              <div className="detailsCard">
                <div className="detailsTitle">Live Mechanic Location</div>

                <div className="detailsGrid">
                  <div className="detailsItem">
                    <div className="detailsItemLabel">Coordinates</div>
                    <div className="detailsItemValue">
                      {Number(mechLoc.latitude).toFixed(6)},{" "}
                      {Number(mechLoc.longitude).toFixed(6)}
                    </div>
                  </div>

                  <div className="detailsItem">
                    <div className="detailsItemLabel">Updated</div>
                    <div className="detailsItemValue">
                      {formatDate(mechLoc.updated_at)}
                    </div>
                  </div>
                </div>

                {tracking && (
                  <div className="detailsGrid" style={{ marginTop: 14 }}>
                    <div className="detailsItem">
                      <div className="detailsItemLabel">Distance from mechanic</div>
                      <div className="detailsItemValue">{tracking.distance_km} km</div>
                    </div>

                    <div className="detailsItem">
                      <div className="detailsItemLabel">Estimated arrival time</div>
                      <div className="detailsItemValue">{tracking.eta_minutes} min</div>
                    </div>
                  </div>
                )}

                <div className="actionRowSingleLine" style={{ marginTop: 14 }}>
                  <button
                    className="btn"
                    onClick={() => openInGoogleMaps(mechLoc.latitude, mechLoc.longitude)}
                  >
                    Open Mechanic in Google Maps
                  </button>
                  <button
                    className="btn"
                    onClick={() => openInAppleMaps(mechLoc.latitude, mechLoc.longitude)}
                  >
                    Open Mechanic in Apple Maps
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}