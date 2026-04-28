import { renderAdminShell, setupTheme } from "./common.js";
import { requireSession, fetchAdminById } from "./session.js";
import { apiUrl, URL_KEYS } from "../../common/url.js";
import { createPaginationController, DEFAULT_PAGE_SIZE } from "./pagination.js";

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

      // Truncate message to character limit with ellipsis
      const truncateMessage = (message, charLimit = 80) => {
        if (message.length > charLimit) {
          return message.substring(0, charLimit) + "......";
        }
        return message;
      };

      // Truncate email to fit in one line
      const truncateEmail = (email, charLimit = 35) => {
        if (email.length > charLimit) {
          return email.substring(0, charLimit) + "......";
        }
        return email;
      };

      // Open message modal
      window.openMessageModal = (firstname, lastname, email, phone, message) => {
        document.getElementById("modal-name").textContent = `${firstname} ${lastname}`;
        document.getElementById("modal-email").textContent = email;
        document.getElementById("modal-phone").textContent = phone;
        document.getElementById("modal-message").textContent = message;
        document.getElementById("message-modal").classList.remove("hidden");
        document.body.style.overflow = "hidden";
      };

      // Close message modal
      window.closeMessageModal = () => {
        document.getElementById("message-modal").classList.add("hidden");
        document.body.style.overflow = "auto";
      };

      // Close modal when clicking outside
      document.getElementById("message-modal")?.addEventListener("click", (e) => {
        if (e.target.id === "message-modal") {
          window.closeMessageModal();
        }
      });

      // Close modal with Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !document.getElementById("message-modal").classList.contains("hidden")) {
          window.closeMessageModal();
        }
      });

      const renderRecords = ({ page, limit }) => {
        const pageSize = Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE);
        const startIndex = (page - 1) * pageSize;
        const visibleRecords = allRecords.slice(startIndex, startIndex + pageSize);

        contactEmpty.classList.add("hidden");
        contactEmpty.innerHTML = '<p class="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">No submissions have been added yet.</p>';

        contactList.innerHTML = visibleRecords
          .map(
              (record) => {
                const emailPreview = truncateEmail(formatText(record.email));
                const messagePreview = truncateMessage(formatText(record.message));
                const fullMessage = formatText(record.message);
                const hasLongMessage = fullMessage.length > 80;

                return `
              <article class="relative w-full min-h-56 md:h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm dark:border-white/10 dark:bg-black/25 flex flex-col">
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="min-w-0 flex-1">
                    <h4 class="truncate text-base md:text-lg font-bold text-slate-900 dark:text-white">${formatText(record.firstname)} ${formatText(record.lastname)}</h4>
                    <p class="truncate text-xs md:text-sm text-slate-500 dark:text-gray-400" title="${formatText(record.email)}">${emailPreview}</p>
                  </div>
                  <span class="flex-shrink-0 rounded-full bg-primary/10 px-2 md:px-3 py-1 text-xs font-semibold text-primary whitespace-nowrap">New</span>
                </div>
                <div class="mt-3 md:mt-4 space-y-2 text-xs md:text-sm text-slate-600 dark:text-gray-300 flex-1 overflow-hidden">
                  <p><span class="font-semibold text-slate-900 dark:text-white">Phone:</span> <span class="truncate inline-block max-w-full">${formatText(record.phone)}</span></p>
                  <div>
                    <span class="font-semibold text-slate-900 dark:text-white">Message:</span>
                    <p class="mt-1 text-slate-700 dark:text-gray-200 line-clamp-2 break-words">${messagePreview}</p>
                  </div>
                </div>
                ${hasLongMessage ? `<button onclick="openMessageModal('${formatText(record.firstname).replace(/'/g, "\\'")}', '${formatText(record.lastname).replace(/'/g, "\\'")}', '${formatText(record.email).replace(/'/g, "\\'")}', '${formatText(record.phone).replace(/'/g, "\\'")}', \`${fullMessage.replace(/`/g, "\\`")}\`)" class="mt-3 text-primary hover:text-primary/80 font-semibold text-xs transition-colors">Read More →</button>` : ''}
              </article>
            `;
              }
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
