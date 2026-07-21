import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import { useGeo } from "../hooks/useGeo";
import { openAppleMaps, openGoogleMaps } from "../utils/maps";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
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

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  let cls = "mechBadge";
  if (s === "pending") cls += " pending";
  else if (s === "accepted") cls += " accepted";
  else if (s === "completed") cls += " completed";

  return <span className={cls}>{status || "Unknown"}</span>;
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={`mechTab ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="mechInfoItem">
      <div className="mechInfoLabel">{label}</div>
      <div className="mechInfoValue">{value || "-"}</div>
    </div>
  );
}

function EmptyState({ title, text, actionText, onAction }) {
  return (
    <div className="mechEmpty">
      <div className="mechEmptyIcon">🚗</div>
      <div className="mechEmptyTitle">{title}</div>
      <div className="mechEmptyText">{text}</div>
      {onAction && (
        <div style={{ marginTop: 18 }}>
          <button className="btn" onClick={onAction}>
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}

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

  const [view, setView] = useState("jobs");
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingActive, setLoadingActive] = useState(false);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  function logout() {
    clearAuth();
    nav("/login");
  }

  async function loadPending() {
    setLoadingPending(true);
    setPageError("");
    try {
      const res = await api.get(`/requests/pending/?radius=${radius}`);
      setPending(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setPending([]);
      setPageError(getApiErrorMessage(error, "Could not load nearby requests."));
    } finally {
      setLoadingPending(false);
    }
  }

  async function loadActive() {
    setLoadingActive(true);
    try {
      const res = await api.get("/requests/me/active/");
      setActive(res.data);
    } catch {
      setActive(null);
    } finally {
      setLoadingActive(false);
    }
  }

  async function loadSkills() {
    setLoadingSkills(true);
    try {
      const res = await api.get("/mechanics/profile/");
      setSkills(Array.isArray(res.data?.skills) ? res.data.skills : []);
    } catch {
      setSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  }

  async function accept(id) {
    setPageError("");
    setPageMessage("");
    try {
      await api.post(`/requests/${id}/accept/`);
      setPageMessage(`Request #${id} accepted successfully.`);
      await loadPending();
      await loadActive();
      setView("active");
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Could not accept this request."));
    }
  }

  async function complete() {
    if (!active) return;

    setPageError("");
    setPageMessage("");

    try {
      const res = await api.post(`/requests/${active.id}/complete/`);
      setDoneInfo(res.data);
      setDoneModal(true);
      setPageMessage(`Job #${active.id} marked as completed.`);
      await loadActive();
      await loadPending();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Could not complete the active job."));
    }
  }

  async function sendLocationOnce(latitude, longitude) {
    await api.post("/mechanics/location/", { latitude, longitude });
  }

  function useMyLocation() {
    getOnce(
      async (coords) => {
        try {
          const latitude = coords.latitude.toFixed(6);
          const longitude = coords.longitude.toFixed(6);
          setLat(latitude);
          setLng(longitude);
          await sendLocationOnce(parseFloat(latitude), parseFloat(longitude));
          setPageMessage("Location updated successfully.");
        } catch {
          setPageError("Could not send your location.");
        }
      },
      (msg) => setPageError(msg)
    );
  }

  function startSharing() {
    if (sharing) return;

    watchIdRef.current = watch(
      async (coords) => {
        try {
          const latitude = coords.latitude;
          const longitude = coords.longitude;
          setLat(latitude.toFixed(6));
          setLng(longitude.toFixed(6));
          await api.post("/mechanics/location/", { latitude, longitude });
        } catch {
          setPageError("Live location update failed.");
        }
      },
      (msg) => setPageError(msg)
    );

    setSharing(true);
    setPageMessage("Live location sharing started.");
  }

  function stopSharingNow() {
    stopWatch(watchIdRef.current);
    watchIdRef.current = null;
    setSharing(false);
    setPageMessage("Live location sharing stopped.");
  }

  async function sendAdvancedLocation() {
    setPageError("");
    setPageMessage("");

    if (!lat || !lng) {
      setPageError("Please enter both latitude and longitude.");
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setPageError("Latitude and longitude must be valid numbers.");
      return;
    }

    try {
      await sendLocationOnce(latitude, longitude);
      setPageMessage("Manual location sent successfully.");
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Could not send manual location."));
    }
  }

  function navigateToCustomerGoogle() {
    if (!active) return;
    openGoogleMaps(active.latitude, active.longitude);
  }

  function navigateToCustomerApple() {
    if (!active) return;
    openAppleMaps(active.latitude, active.longitude);
  }

  useEffect(() => {
    loadPending();
    loadActive();
    loadSkills();

    const t = setInterval(() => {
      loadPending().catch(() => {});
      loadActive().catch(() => {});
    }, 8000);

    return () => clearInterval(t);
  }, [radius]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        stopWatch(watchIdRef.current);
      }
    };
  }, [stopWatch]);

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Mechanic dashboard"
      right={
        <div className="mechTopRight">
          <span className="mechUserPill">{username}</span>
          <button className="btn" onClick={() => nav("/mechanic/history")}>
            My History
          </button>
          <button className="btn btnDanger" onClick={logout}>
            Logout
          </button>
        </div>
      }
    >
      <div className="mechHero">
        <h1 className="mechHeroTitle">
          {view === "jobs"
            ? "Nearby Requests"
            : view === "active"
            ? "My Active Job"
            : "Location & Sharing"}
        </h1>
        <div className="mechHeroSub">
          {view === "jobs"
            ? "Help drivers in your area"
            : view === "active"
            ? "Track and complete your accepted request"
            : "Keep your location updated for customers"}
        </div>
      </div>

      {pageError && <div className="alertBox alertError">{pageError}</div>}
      {pageMessage && <div className="alertBox alertSuccess">{pageMessage}</div>}

      <div className="mechTabs" style={{ marginTop: 18 }}>
        <TabButton active={view === "location"} onClick={() => setView("location")}>
          Location
        </TabButton>
        <TabButton active={view === "jobs"} onClick={() => setView("jobs")}>
          Jobs {pending.length > 0 ? `(${pending.length})` : ""}
        </TabButton>
        <TabButton active={view === "active"} onClick={() => setView("active")}>
          Active {active ? "(1)" : ""}
        </TabButton>
      </div>

      {view === "jobs" && (
        <div className="mechSection pending" style={{ marginTop: 18 }}>
          <div className="mechSectionHeader">
            <div>
              <div className="mechSectionTitle">Pending Requests</div>
              <div className="mechSectionSub">
                Nearby service requests within your selected radius
              </div>
            </div>

            <div className="row">
              <input
                className="input"
                style={{ maxWidth: 110 }}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="10"
              />
              <button className="btn" onClick={loadPending} disabled={loadingPending}>
                {loadingPending ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {pending.length === 0 ? (
            <EmptyState
              title="No requests nearby"
              text={`There are no pending help requests within ${radius}km of your location.`}
              actionText="Refresh"
              onAction={loadPending}
            />
          ) : (
            <div>
              {pending.map((r) => (
                <div key={r.id} className="mechCard">
                  <div className="mechCardTop">
                    <div>
                      <div className="mechRequestId">Request #{r.id}</div>
                      <div className="mechRequestTitle">
                        {r.problem_type_display || r.problem_type || "Roadside Help Request"}
                      </div>

                      {r.custom_problem && (
                        <div className="mechRequestMeta">
                          Custom problem: {r.custom_problem}
                        </div>
                      )}

                      {r.description && (
                        <div className="mechRequestMeta">Description: {r.description}</div>
                      )}
                    </div>

                    <StatusBadge status={r.status || "pending"} />
                  </div>

                  <div className="mechGrid">
                    <InfoItem
                      label="Vehicle Type"
                      value={r.vehicle_type_display || r.vehicle_type || "-"}
                    />
                    <InfoItem label="Created" value={formatDate(r.created_at)} />
                    <InfoItem
                      label="Distance"
                      value={
                        r.distance_km !== undefined && r.distance_km !== null
                          ? `${r.distance_km} km`
                          : "Not available"
                      }
                    />
                    <InfoItem label="Coordinates" value={`${r.latitude}, ${r.longitude}`} />
                  </div>

                  <div className="mechActions">
                    <button className="btn btnPrimaryDark" onClick={() => accept(r.id)}>
                      Accept Request
                    </button>
                    <button className="btn" onClick={() => openGoogleMaps(r.latitude, r.longitude)}>
                      Google Maps
                    </button>
                    <button className="btn" onClick={() => openAppleMaps(r.latitude, r.longitude)}>
                      Apple Maps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mechHintBox" style={{ marginTop: 16 }}>
            {skills.length > 0
              ? "You're only shown requests that match your selected skills and are within your radius. Update your skills anytime from Settings."
              : "Requests are easier to accept when your location is updated. Keep sharing turned on while travelling so customers can track you after you accept a job."}
          </div>
        </div>
      )}

      {view === "active" && (
        <div className="mechSection activeJob" style={{ marginTop: 18 }}>
          <div className="mechSectionHeader">
            <div>
              <div className="mechSectionTitle">My Active Job</div>
              <div className="mechSectionSub">Your current accepted request</div>
            </div>

            <button className="btn" onClick={loadActive} disabled={loadingActive}>
              {loadingActive ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {!active ? (
            <EmptyState
              title="No active job"
              text="You do not have any accepted request right now. Accept a nearby request to start navigating to the customer."
              actionText="View Nearby Jobs"
              onAction={() => setView("jobs")}
            />
          ) : (
            <div className="mechCard">
              <div className="mechCardTop">
                <div>
                  <div className="mechRequestId">Request #{active.id}</div>
                  <div className="mechRequestTitle">
                    {active.problem_type_display || active.problem_type || "Active Job"}
                  </div>

                  {active.custom_problem && (
                    <div className="mechRequestMeta">
                      Custom problem: {active.custom_problem}
                    </div>
                  )}

                  {active.description && (
                    <div className="mechRequestMeta">Description: {active.description}</div>
                  )}

                  {active.customer_username && (
                    <div className="mechRequestMeta">
                      Customer: {active.customer_username}
                    </div>
                  )}
                </div>

                <StatusBadge status={active.status || "accepted"} />
              </div>

              <div className="mechGrid">
                <InfoItem
                  label="Vehicle Type"
                  value={active.vehicle_type_display || active.vehicle_type || "-"}
                />
                <InfoItem label="Created" value={formatDate(active.created_at)} />
                <InfoItem label="Customer Latitude" value={active.latitude} />
                <InfoItem label="Customer Longitude" value={active.longitude} />
              </div>

              <div className="mechActions">
                <button className="btn" onClick={navigateToCustomerGoogle}>
                  Navigate (Google Maps)
                </button>
                <button className="btn" onClick={navigateToCustomerApple}>
                  Navigate (Apple Maps)
                </button>
                <button className="btn btnPrimaryDark" onClick={complete}>
                  Complete Job
                </button>
              </div>

              <details style={{ marginTop: 16 }}>
                <summary style={{ cursor: "pointer" }}>Show full details</summary>
                <pre className="pre" style={{ marginTop: 10 }}>
                  {JSON.stringify(active, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {view === "location" && (
        <div className="mechSection locationBox" style={{ marginTop: 18 }}>
          <div className="mechSectionHeader">
            <div>
              <div className="mechSectionTitle">Location & Sharing</div>
              <div className="mechSectionSub">
                Update your location for request matching and live customer tracking
              </div>
            </div>

            <span className={`mechBadge ${sharing ? "completed" : "accepted"}`}>
              {sharing ? "Live Sharing On" : "Live Sharing Off"}
            </span>
          </div>

          <div className="mechActions" style={{ marginTop: 0 }}>
            <button className="btn btnPrimaryDark" type="button" onClick={useMyLocation}>
              Use My Location
            </button>

            <button className="btn" type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "Hide Advanced" : "Advanced"}
            </button>

            {!sharing ? (
              <button className="btn" type="button" onClick={startSharing}>
                Start Sharing
              </button>
            ) : (
              <button className="btn btnDanger" type="button" onClick={stopSharingNow}>
                Stop Sharing
              </button>
            )}
          </div>

          <div className="mechGrid">
            <InfoItem label="Latitude" value={lat || "-"} />
            <InfoItem label="Longitude" value={lng || "-"} />
            <InfoItem label="Share Status" value={sharing ? "Running" : "Stopped"} />
          </div>

          {showAdvanced && (
            <div className="mechAdvancedGrid">
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
              <button className="btn" type="button" onClick={sendAdvancedLocation}>
                Send Once
              </button>
            </div>
          )}

          <div className="mechHintBox" style={{ marginTop: 16 }}>
            Use <b>Start Sharing</b> while travelling so the customer can see your live location.
            You can also use <b>Use My Location</b> or <b>Send Once</b> for one-time updates.
          </div>
        </div>
      )}

      <Modal open={doneModal} title="Job Completed ✅" onClose={() => setDoneModal(false)}>
        <div className="hint">The customer can now rate and leave a review.</div>
        <pre className="pre" style={{ marginTop: 10 }}>
          {doneInfo ? JSON.stringify(doneInfo, null, 2) : ""}
        </pre>
      </Modal>
    </AppLayout>
  );
}