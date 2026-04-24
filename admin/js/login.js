import { setupTheme, toggleTheme, setupPasswordToggles } from "./common.js";
import { getSession, setSession } from "./session.js";
import { apiUrl, URL_KEYS } from "../../common/url.js";

setupTheme();
setupPasswordToggles();

if (getSession()?.isLoggedIn) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");
const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", toggleTheme);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorEl.textContent = "Please enter both email and password.";
    return;
  }

  try {
    const response = await fetch(apiUrl(URL_KEYS.AUTH.LOGIN));
    const users = await response.json();
    const matchedUser = users.find((user) => user.email === email && user.password === password);

    if (!matchedUser) {
      errorEl.textContent = "Invalid email or password";
      return;
    }

    setSession(matchedUser.id);
    window.location.href = "dashboard.html";
  } catch (error) {
    errorEl.textContent = "Unable to sign in right now. Please try again.";
  }
});
