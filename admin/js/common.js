import { clearSession } from "./session.js";
import { STORAGE_KEYS } from "../../common/storageKey.js";

export function setupTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.ADMIN_THEME);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEYS.ADMIN_THEME, theme);
}

export function toggleTheme() {
  applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
}

export function setupPasswordToggles(root = document) {
  const buttons = root.querySelectorAll("[data-password-toggle]");

  buttons.forEach((button) => {
    const targetId = button.dataset.passwordToggle;
    const input = root.querySelector(`#${targetId}`);
    const showIcon = button.querySelector("[data-icon='show']");
    const hideIcon = button.querySelector("[data-icon='hide']");

    if (!input) return;

    const syncState = () => {
      const isVisible = input.type === "text";
      if (showIcon) showIcon.classList.toggle("hidden", isVisible);
      if (hideIcon) hideIcon.classList.toggle("hidden", !isVisible);
      button.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
    };

    button.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
      syncState();
    });

    syncState();
  });
}

export function renderAdminShell({ pageTitle, pageEyebrow, contentHtml, activePage = "dashboard", admin = {} }) {
  const initials = `${(admin.firstname || "").trim().charAt(0)}${(admin.lastname || "").trim().charAt(0)}`.toUpperCase() || "A";
  const fullName = `${admin.firstname || "Admin"} ${admin.lastname || ""}`.trim() || "Admin";
  const navLinkClass = (key) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition ${
      activePage === key
        ? "bg-primary/10 border border-primary/20 text-slate-900 dark:text-white"
        : "text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-white/5"
    }`;
  const navIconClass = (key) => `h-5 w-5 shrink-0 ${activePage === key ? "text-primary" : "text-slate-400 dark:text-gray-500"}`;

  const app = document.getElementById("admin-app");
  app.innerHTML = `
    <div class="min-h-screen bg-[#f4f6fb] text-slate-900 transition-colors duration-300 dark:bg-background dark:text-white">
      <div id="sidebar-backdrop" class="fixed inset-0 z-30 hidden bg-slate-950/45 opacity-0 transition-opacity duration-300 lg:hidden"></div>
      <aside id="admin-sidebar" class="fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-black/35 lg:translate-x-0">
        <div class="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-white/10">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.761 0-5 2.239-5 5v1h10v-1c0-2.761-2.239-5-5-5z"></path>
            </svg>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-gray-500">Admin panel</p>
            <p class="text-lg font-black text-slate-900 dark:text-white">PlayBox</p>
          </div>
        </div>

        <nav class="p-4">
          <a href="dashboard.html" class="${navLinkClass("dashboard")}">
            <svg class="${navIconClass("dashboard")}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M8 10h8M8 14h5"></path>
            </svg>
            Dashboard
          </a>
          <a href="contact.html" class="mt-2 ${navLinkClass("contact")}">
            <svg class="${navIconClass("contact")}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v7.5A2.25 2.25 0 0118.75 18H5.25A2.25 2.25 0 013 15.75v-7.5z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 9.75h9M7.5 12h9M7.5 14.25h5"></path>
            </svg>
            Contact Data
          </a>
        </nav>
      </aside>

      <div class="min-h-screen lg:pl-72">
        <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-black/35">
          <div class="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button id="sidebar-toggle" type="button" aria-label="Toggle sidebar" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:hidden">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-gray-500">${pageEyebrow}</p>
              <h1 class="truncate text-lg font-bold text-slate-900 dark:text-white">${pageTitle}</h1>
            </div>

            <div class="ml-auto flex items-center gap-2 sm:gap-3">
              <button id="theme-toggle" type="button" aria-label="Toggle theme" class="relative inline-flex h-11 w-20 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition dark:border-white/10 dark:bg-white/10">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm transition-transform duration-300 dark:translate-x-9 dark:bg-slate-900 dark:text-white">
                  <svg class="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.485-9h-1M4.515 12h-1m14.142 5.657l-.707-.707M6.05 6.05l-.707-.707m0 13.314l.707-.707M6.05 6.05l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
                  </svg>
                  <svg class="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 118.646 3.646a7 7 0 1011.708 11.708z"></path>
                  </svg>
                </span>
              </button>

              <div class="relative">
                <button id="profile-button" type="button" class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                  <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary/20">
                    ${initials}
                  </div>
                  <div class="hidden sm:block leading-tight">
                    <p class="font-semibold text-slate-900 dark:text-white" id="profile-name">${fullName}</p>
                    <p class="text-xs text-slate-500 dark:text-gray-500">Administrator</p>
                  </div>
                  <svg class="h-4 w-4 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <div id="profile-menu" class="absolute right-0 top-full mt-3 hidden w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111827]">
                  <a href="profile.html" class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-white/5">
                    Profile
                  </a>
                  <button id="logout-trigger" type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="p-4 sm:p-6 lg:p-8">
          <div class="mx-auto max-w-6xl">
            ${contentHtml}
          </div>
        </main>
      </div>
    </div>

    <div id="logout-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-slate-950/50 p-4 opacity-0 transition-opacity duration-300">
      <div class="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f172a]">
        <h3 class="text-2xl font-black text-slate-900 dark:text-white">Log out?</h3>
        <p class="mt-3 text-slate-600 dark:text-gray-400 leading-relaxed">Are you sure you want to end your admin session?</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button id="logout-cancel" type="button" class="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5">
            Cancel
          </button>
          <button id="logout-confirm" type="button" class="rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-95">
            Logout
          </button>
        </div>
      </div>
    </div>
  `;

  setupSharedInteractions(admin);
  return app;
}

function setupSharedInteractions(admin) {
  const sidebar = document.getElementById("admin-sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const profileButton = document.getElementById("profile-button");
  const profileMenu = document.getElementById("profile-menu");
  const logoutTrigger = document.getElementById("logout-trigger");
  const logoutModal = document.getElementById("logout-modal");
  const logoutCancel = document.getElementById("logout-cancel");
  const logoutConfirm = document.getElementById("logout-confirm");

  const closeSidebar = () => {
    sidebar.classList.add("-translate-x-full");
    sidebarBackdrop.classList.add("hidden");
    sidebarBackdrop.classList.remove("opacity-100");
    sidebarBackdrop.classList.add("opacity-0");
  };

  const openSidebar = () => {
    sidebar.classList.remove("-translate-x-full");
    sidebarBackdrop.classList.remove("hidden");
    requestAnimationFrame(() => sidebarBackdrop.classList.add("opacity-100"));
    sidebarBackdrop.classList.remove("opacity-0");
  };

  const toggleSidebar = () => {
    if (sidebar.classList.contains("-translate-x-full")) {
      openSidebar();
    } else {
      closeSidebar();
    }
  };

  const closeProfileMenu = () => profileMenu.classList.add("hidden");
  const toggleProfileMenu = () => profileMenu.classList.toggle("hidden");

  const openLogoutModal = () => {
    logoutModal.classList.remove("hidden");
    requestAnimationFrame(() => logoutModal.classList.add("opacity-100"));
    logoutModal.classList.remove("opacity-0");
  };

  const closeLogoutModal = () => {
    logoutModal.classList.add("opacity-0");
    logoutModal.classList.remove("opacity-100");
    setTimeout(() => logoutModal.classList.add("hidden"), 180);
  };

  sidebarToggle.addEventListener("click", toggleSidebar);
  sidebarBackdrop.addEventListener("click", closeSidebar);
  themeToggle.addEventListener("click", toggleTheme);
  profileButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProfileMenu();
  });
  logoutTrigger.addEventListener("click", () => {
    closeProfileMenu();
    openLogoutModal();
  });
  logoutCancel.addEventListener("click", closeLogoutModal);
  logoutModal.addEventListener("click", (event) => {
    if (event.target === logoutModal) closeLogoutModal();
  });
  logoutConfirm.addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  document.addEventListener("click", (event) => {
    if (!profileMenu.contains(event.target) && !profileButton.contains(event.target)) {
      closeProfileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProfileMenu();
      closeSidebar();
      closeLogoutModal();
    }
  });
}
