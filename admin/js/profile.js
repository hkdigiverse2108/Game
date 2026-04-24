import { renderAdminShell, setupTheme, setupPasswordToggles } from "./common.js";
import { requireSession, fetchAdminById } from "./session.js";
import { apiUrl, URL_KEYS } from "../../common/url.js";

setupTheme();

const template = document.getElementById("page-template");
const session = requireSession();

if (session) {
  (async () => {
    try {
      const admin = await fetchAdminById(session.id);

      renderAdminShell({
        pageTitle: "Profile settings",
        pageEyebrow: "Account",
        activePage: "profile",
        contentHtml: template.innerHTML,
        admin,
      });

      const profileAvatar = document.getElementById("profile-avatar");
      const profileNameHeading = document.getElementById("profile-name-heading");
      const readonlyName = document.getElementById("readonly-name");
      const readonlyEmail = document.getElementById("readonly-email");
      const readonlyPhone = document.getElementById("readonly-phone");
      const detailsPanel = document.getElementById("details-panel");
      const passwordPanel = document.getElementById("password-panel");
      const profileReadonly = document.getElementById("profile-readonly");
      const profileForm = document.getElementById("profile-form");
      const passwordForm = document.getElementById("password-form");
      const profileMessage = document.getElementById("profile-message");
      const passwordMessage = document.getElementById("password-message");
      const editProfileBtn = document.getElementById("edit-profile-btn");
      const cancelEditBtn = document.getElementById("cancel-edit-btn");
      const tabButtons = [...document.querySelectorAll(".tab-btn")];

      const profileFields = {
        firstname: document.getElementById("firstname"),
        lastname: document.getElementById("lastname"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
      };

      let currentAdmin = admin;

      const setMessage = (el, message, isError = false) => {
        el.textContent = message;
        el.className = `min-h-5 text-sm font-medium ${isError ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`;
      };

      const syncProfileView = (data) => {
        const name = `${data.firstname || ""} ${data.lastname || ""}`.trim() || "Admin";
        const email = data.email || "admin@example.com";
        const phone = data.phone || "Not provided";
        const nextInitials = `${(data.firstname || "").trim().charAt(0)}${(data.lastname || "").trim().charAt(0)}`.toUpperCase() || "A";

        profileAvatar.textContent = nextInitials;
        profileNameHeading.textContent = name;
        readonlyName.textContent = name;
        readonlyEmail.textContent = email;
        readonlyPhone.textContent = phone;
        document.getElementById("profile-name").textContent = name;
      };

      const populateProfileForm = (data) => {
        profileFields.firstname.value = data.firstname || "";
        profileFields.lastname.value = data.lastname || "";
        profileFields.email.value = data.email || "";
        profileFields.phone.value = data.phone || "";
      };

      const exitEditMode = () => {
        profileForm.classList.add("hidden");
        profileReadonly.classList.remove("hidden");
        setMessage(profileMessage, "");
      };

      const setActiveTab = (tab) => {
        tabButtons.forEach((button) => {
          const isActive = button.dataset.tab === tab;
          button.className = `tab-btn w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-white dark:text-gray-300 dark:hover:bg-white/5"}`;
        });

        detailsPanel.classList.toggle("hidden", tab !== "details");
        passwordPanel.classList.toggle("hidden", tab !== "password");

        if (tab === "details") {
          exitEditMode();
        } else {
          profileReadonly.classList.add("hidden");
          profileForm.classList.add("hidden");
          setMessage(profileMessage, "");
        }
      };

      syncProfileView(currentAdmin);
      populateProfileForm(currentAdmin);
      setActiveTab("details");
      setupPasswordToggles();

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => setActiveTab(button.dataset.tab));
      });

      editProfileBtn.addEventListener("click", () => {
        setActiveTab("details");
        profileReadonly.classList.add("hidden");
        profileForm.classList.remove("hidden");
        setMessage(profileMessage, "");
      });

      cancelEditBtn.addEventListener("click", () => {
        populateProfileForm(currentAdmin);
        exitEditMode();
      });

      profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const updatedAdmin = {
          ...currentAdmin,
          firstname: profileFields.firstname.value.trim(),
          lastname: profileFields.lastname.value.trim(),
          email: profileFields.email.value.trim(),
          phone: profileFields.phone.value.trim(),
        };

        if (!updatedAdmin.firstname || !updatedAdmin.lastname || !updatedAdmin.email) {
          setMessage(profileMessage, "First name, last name, and email are required.", true);
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedAdmin.email)) {
          setMessage(profileMessage, "Please enter a valid email address.", true);
          return;
        }

        try {
          const response = await fetch(apiUrl(URL_KEYS.AUTH.BY_ID(updatedAdmin.id)), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAdmin),
          });

          if (!response.ok) {
            throw new Error("Update failed");
          }

          currentAdmin = await response.json();
          syncProfileView(currentAdmin);
          populateProfileForm(currentAdmin);
          setMessage(profileMessage, "Profile saved successfully.");
          setTimeout(exitEditMode, 700);
        } catch (error) {
          setMessage(profileMessage, "Unable to save profile right now.", true);
        }
      });

      passwordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const oldPassword = document.getElementById("oldPassword").value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!oldPassword || !newPassword || !confirmPassword) {
          setMessage(passwordMessage, "Please complete all password fields.", true);
          return;
        }

        if (oldPassword !== currentAdmin.password) {
          setMessage(passwordMessage, "Old password is not correct.", true);
          return;
        }

        if (newPassword.length < 6) {
          setMessage(passwordMessage, "New password must be at least 6 characters.", true);
          return;
        }

        if (newPassword !== confirmPassword) {
          setMessage(passwordMessage, "New password and confirm password do not match.", true);
          return;
        }

        try {
          const response = await fetch(apiUrl(URL_KEYS.AUTH.CHANGE_PASSWORD(currentAdmin.id)), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: newPassword }),
          });

          if (!response.ok) {
            throw new Error("Password update failed");
          }

          currentAdmin = {
            ...currentAdmin,
            password: newPassword,
          };

          setMessage(passwordMessage, "Password updated successfully.");
          passwordForm.reset();
        } catch (error) {
          setMessage(passwordMessage, "Unable to update password right now.", true);
        }
      });
    } catch {
      window.location.href = "login.html";
    }
  })();
}
