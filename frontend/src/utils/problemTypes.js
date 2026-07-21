// Keep in sync with backend `requests.models.ServiceRequest.PROBLEM_TYPE_CHOICES`.
export const PROBLEM_OPTIONS = [
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

// Keep in sync with backend `requests.models.ServiceRequest.VEHICLE_TYPE_CHOICES`.
export const VEHICLE_OPTIONS = [
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bike", label: "Bike" },
  { value: "three_wheeler", label: "Three Wheeler" },
  { value: "bus", label: "Bus" },
  { value: "lorry", label: "Lorry" },
  { value: "other", label: "Other" },
];

export function problemLabel(value) {
  const found = PROBLEM_OPTIONS.find((item) => item.value === value);
  return found ? found.label : value;
}