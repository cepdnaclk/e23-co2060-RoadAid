export function useGeo() {
  function getOnce(onSuccess, onError) {
    if (!("geolocation" in navigator)) return onError?.("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess(pos.coords),
      (err) => onError?.(`Location error (code ${err.code}): ${err.message || "No message"}`),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }

  function watch(onSuccess, onError) {
    if (!("geolocation" in navigator)) return null;

    const id = navigator.geolocation.watchPosition(
      (pos) => onSuccess(pos.coords),
      (err) => onError?.(`Location error (code ${err.code}): ${err.message || "No message"}`),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    return id;
  }

  function stopWatch(id) {
    if (id != null) navigator.geolocation.clearWatch(id);
  }

  return { getOnce, watch, stopWatch };
}