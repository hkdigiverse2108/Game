// Update this one value to change the API base URL everywhere in the project.
export const API_BASE_URL = "http://localhost:3000";

export const URL_KEYS = {
  AUTH: {
    LOGIN: "/authdata",
    SIGNUP: "/authdata",
    BY_ID: (id) => `/authdata/${id}`,
    CHANGE_PASSWORD: (id) => `/authdata/${id}`,
  },
  CONTACT: {
    LIST: "/contactusdata",
    BY_ID: (id) => `/contactusdata/${id}`,
  },
};

export function apiUrl(path) {
  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
