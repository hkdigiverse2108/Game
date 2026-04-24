import { renderAdminShell, setupTheme } from "./common.js";
import { requireSession, fetchAdminById } from "./session.js";

setupTheme();

const template = document.getElementById("page-template");
const session = requireSession();

if (session) {
  (async () => {
    try {
      const admin = await fetchAdminById(session.id);

      renderAdminShell({
        pageTitle: "Dashboard overview",
        pageEyebrow: "Dashboard",
        activePage: "dashboard",
        contentHtml: template.innerHTML,
        admin,
      });

      const adminName = document.getElementById("dashboard-admin-name");
      const adminEmail = document.getElementById("dashboard-admin-email");

      if (adminName) adminName.textContent = `${admin.firstname || "Admin"} ${admin.lastname || ""}`.trim() || "Admin";
      if (adminEmail) adminEmail.textContent = admin.email || "admin@example.com";
    } catch {
      window.location.href = "login.html";
    }
  })();
}
