const store = sessionStorage;

export function saveAuth({ token, role, userId, username }) {
  store.setItem("token", token);
  store.setItem("role", role);
  store.setItem("userId", String(userId));
  store.setItem("username", username || "");
}

export function clearAuth() {
  store.removeItem("token");
  store.removeItem("role");
  store.removeItem("userId");
  store.removeItem("username");
}

export function getAuth() {
  return {
    token: store.getItem("token") || "",
    role: store.getItem("role") || "",
    userId: store.getItem("userId") || "",
    username: store.getItem("username") || "",
  };
}