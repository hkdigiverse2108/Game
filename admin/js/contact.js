import { renderAdminShell, setupTheme } from "./common.js";
import { requireSession, fetchAdminById } from "./session.js";
import { apiUrl, URL_KEYS } from "../../common/url.js";
import { createPaginationController, DEFAULT_PAGE_SIZE } from "../../common/pagination.js";

setupTheme();

const template = document.getElementById("page-template");
const session = requireSession();

if (session) {
  (async () => {
    try {
      const admin = await fetchAdminById(session.id);

      renderAdminShell({
        pageTitle: "Contact records",
        pageEyebrow: "Contact",
        activePage: "contact",
        contentHtml: template.innerHTML,
        admin,
      });

      const contactList = document.getElementById("contact-list");
      const contactEmpty = document.getElementById("contact-empty");
      const contactPagination = document.getElementById("contact-pagination");
      let pagination = null;
      let allRecords = [];

      const formatText = (value) => (value && String(value).trim() ? String(value).trim() : "Not provided");

      const renderRecords = ({ page, limit }) => {
        const pageSize = Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE);
        const startIndex = (page - 1) * pageSize;
        const visibleRecords = allRecords.slice(startIndex, startIndex + pageSize);

        contactEmpty.classList.add("hidden");
        contactEmpty.innerHTML = '<p class="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">No submissions have been added yet.</p>';

        contactList.innerHTML = visibleRecords
          .map(
              (record) => `
              <article class="relative w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 pr-20 shadow-sm dark:border-white/10 dark:bg-black/25">
                <span class="absolute right-5 top-5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">New</span>
                <div class="min-w-0">
                  <h4 class="break-words text-lg font-bold text-slate-900 dark:text-white">${formatText(record.firstname)} ${formatText(record.lastname)}</h4>
                  <p class="mt-1 break-words text-sm text-slate-500 dark:text-gray-400">${formatText(record.email)}</p>
                </div>
                <div class="mt-4 space-y-2 text-sm text-slate-600 dark:text-gray-300">
                  <p><span class="font-semibold text-slate-900 dark:text-white">Phone:</span> ${formatText(record.phone)}</p>
                  <p><span class="font-semibold text-slate-900 dark:text-white">Message:</span> ${formatText(record.message)}</p>
                </div>
              </article>
            `
          )
          .join("");
      };

      function showEmptyState(message) {
        contactList.innerHTML = "";
        contactEmpty.classList.remove("hidden");
        contactEmpty.innerHTML = `<p class="text-sm leading-relaxed ${message.includes("Unable") ? "text-red-500 dark:text-red-400" : "text-slate-600 dark:text-gray-400"}">${message}</p>`;
        contactPagination.innerHTML = "";
        contactPagination.classList.add("hidden");
      }

      async function loadContactData() {
        try {
          const response = await fetch(apiUrl(URL_KEYS.CONTACT.LIST));
          const records = await response.json();

          allRecords = Array.isArray(records) ? records : [];

          if (!allRecords.length) {
            showEmptyState("No submissions have been added yet.");
            return;
          }

          contactPagination.classList.remove("hidden");

          if (!pagination) {
            pagination = createPaginationController({
              container: contactPagination,
              totalItems: allRecords.length,
              initialPageSize: DEFAULT_PAGE_SIZE,
              onChange: renderRecords,
            });
          } else {
            pagination.setTotalItems(allRecords.length);
            pagination.setPage(1);
          }
        } catch (error) {
          showEmptyState("Unable to load contact records right now.");
        }
      }

      loadContactData();
    } catch {
      window.location.href = "login.html";
    }
  })();
}
