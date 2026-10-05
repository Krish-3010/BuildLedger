// Centralized API utility for BuildLedger
// All backend requests go through these helpers.
// JWT token is stored in localStorage and attached via Authorization header.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ── Token helpers ────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem("bl_token");
export const setToken = (token) => localStorage.setItem("bl_token", token);
export const removeToken = () => localStorage.removeItem("bl_token");

/** Safely extracts a clean string ID from an entity (handles string, ObjectId object, or $oid) */
export const getObjId = (idOrItem) => {
  if (!idOrItem) return "";
  if (typeof idOrItem === "string") return idOrItem;
  if (typeof idOrItem === "object" && idOrItem !== null) {
    if (idOrItem.id) return getObjId(idOrItem.id);
    if (idOrItem.$oid) return idOrItem.$oid;
    if (idOrItem.timestamp) return idOrItem.toString();
  }
  return String(idOrItem);
};

// ── Base fetch wrapper ───────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return null; // No-Content (DELETE)

  const text = await res.text();

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    if (text) {
      try {
        const body = JSON.parse(text);
        errorMsg = body.message || body.error || errorMsg;
      } catch (_) {
        errorMsg = text;
      }
    }
    throw new Error(errorMsg);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Login with username/email + password → returns JWT token string */
export const login = async (username, password) => {
  const res = await request("/authenticate", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (typeof res === "object" && res !== null && res.token) {
    return res.token;
  }
  return res;
};

/** Register a new user */
export const register = (name, email, phone, password) =>
  request("/users", {
    method: "POST",
    body: JSON.stringify({ username: name, email, phone: Number(phone), password }),
  });

/** Fetch current authenticated user info */
export const getCurrentUser = () => request("/me");

// ── Sites ─────────────────────────────────────────────────────────────────────

export const fetchSites = () => request("/sites");

export const createSite = (site) =>
  request("/sites", { method: "POST", body: JSON.stringify(site) });

export const updateSite = (id, site) => {
  const cleanId = getObjId(id);
  return request(`/sites/${cleanId}`, { method: "PUT", body: JSON.stringify(site) });
};

export const deleteSite = (id) => {
  const cleanId = getObjId(id);
  return request(`/sites/${cleanId}`, { method: "DELETE" });
};

// ── Transactions ──────────────────────────────────────────────────────────────

export const fetchTransactions = () => request("/transactions");

export const createTransaction = (tx) =>
  request("/transactions", { method: "POST", body: JSON.stringify(tx) });

export const updateTransaction = (id, tx) => {
  const cleanId = getObjId(id);
  return request(`/transactions/${cleanId}`, { method: "PUT", body: JSON.stringify(tx) });
};

export const deleteTransaction = (id) => {
  const cleanId = getObjId(id);
  return request(`/transactions/${cleanId}`, { method: "DELETE" });
};
