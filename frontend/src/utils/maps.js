export function openGoogleMaps(lat, lng) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
}
export function openAppleMaps(lat, lng) {
  window.open(`https://maps.apple.com/?q=${lat},${lng}`, "_blank");
}