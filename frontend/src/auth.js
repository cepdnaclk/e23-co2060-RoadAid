const sessionStore = sessionStorage;
const localStore = localStorage;

function getStore(remember = false) {
  return remember ? localStore : sessionStore;
}

function clearAllStores() {
  const keys = [
    "access",
    "refresh",
    "role",
    "userId",
    "username",
    "approvalStatus",
    "rememberMe",
  ];

  keys.forEach((key) => {
    sessionStore.removeItem(key);
    localStore.removeItem(key);
  });
}

export function saveAuth({ access, refresh, user, rememberMe = false }) {
  clearAllStores();

  const store = getStore(rememberMe);

  store.setItem("access", access || "");
  store.setItem("refresh", refresh || "");
  store.setItem("role", user?.role || "");
  store.setItem("userId", user?.id ? String(user.id) : "");
  store.setItem("username", user?.username || "");
  store.setItem("approvalStatus", user?.approval_status || "");
  store.setItem("rememberMe", rememberMe ? "true" : "false");
}

export function clearAuth() {
  clearAllStores();
}

export function getAuth() {
  const access =
    localStore.getItem("access") || sessionStore.getItem("access") || "";

  const store = localStore.getItem("access") ? localStore : sessionStore;

  return {
    token: access,
    refresh: store.getItem("refresh") || "",
    role: store.getItem("role") || "",
    userId: store.getItem("userId") || "",
    username: store.getItem("username") || "",
    approvalStatus: store.getItem("approvalStatus") || "",
    rememberMe: store.getItem("rememberMe") === "true",
  };
}