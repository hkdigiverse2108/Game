import { apiUrl, URL_KEYS } from "../../common/url.js";
import { STORAGE_KEYS } from "../../common/storageKey.js";

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    return session && typeof session.id !== "undefined" ? session : null;
  } catch {
    return null;
  }
}

export function setSession(id) {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_LEGACY);
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({ id, isLoggedIn: true }));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_LEGACY);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

export function requireSession() {
  const session = getSession();
  if (!session || !session.isLoggedIn || typeof session.id === "undefined") {
    window.location.href = "login.html";
    return null;
  }

  return session;
}

export async function fetchAdminById(id) {
  const response = await fetch(apiUrl(URL_KEYS.AUTH.BY_ID(id)));
  if (!response.ok) {
    throw new Error("Unable to load admin data");
  }

  return response.json();
}
