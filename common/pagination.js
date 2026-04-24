export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 30, 50, 100, "all"];

function normalizePageSize(value) {
  if (value === "all") return "all";
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : DEFAULT_PAGE_SIZE;
}

function getEffectivePageSize(pageSize, totalItems) {
  return pageSize === "all" ? Math.max(totalItems, 1) : pageSize;
}

export function createPaginationController({
  container,
  totalItems = 0,
  initialPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onChange = () => {},
} = {}) {
  if (!container) {
    throw new Error("Pagination container is required");
  }

  const state = {
    page: 1,
    pageSize: normalizePageSize(initialPageSize),
    totalItems: Math.max(0, Number(totalItems) || 0),
    menuOpen: false,
  };

  const api = {
    setTotalItems(count) {
      state.totalItems = Math.max(0, Number(count) || 0);
      state.page = Math.min(state.page, api.getTotalPages() || 1);
      render();
    },
    setPage(page) {
      const nextPage = Math.max(1, Math.min(Number(page) || 1, api.getTotalPages() || 1));
      if (nextPage === state.page) return;
      state.page = nextPage;
      render();
    },
    setPageSize(pageSize) {
      const nextPageSize = normalizePageSize(pageSize);
      if (nextPageSize === state.pageSize) return;
      state.pageSize = nextPageSize;
      state.page = 1;
      state.menuOpen = false;
      render();
    },
    toggleMenu() {
      state.menuOpen = !state.menuOpen;
      render();
    },
    closeMenu() {
      if (!state.menuOpen) return;
      state.menuOpen = false;
      render();
    },
    getState() {
      return { ...state, totalPages: api.getTotalPages(), pageSizeValue: api.getPageSizeValue() };
    },
    getPageSizeValue() {
      return getEffectivePageSize(state.pageSize, state.totalItems);
    },
    getTotalPages() {
      const size = api.getPageSizeValue();
      return state.totalItems > 0 ? Math.ceil(state.totalItems / size) : 0;
    },
    destroy() {
      container.innerHTML = "";
    },
  };

  const handleDocumentClick = (event) => {
    if (!state.menuOpen) return;
    const wrap = container.querySelector("#pagination-page-size-wrap");
    if (wrap && !wrap.contains(event.target)) {
      api.closeMenu();
    }
  };

  function getVisibleRange() {
    if (!state.totalItems) return { start: 0, end: 0 };

    const size = api.getPageSizeValue();
    const start = (state.page - 1) * size + 1;
    const end = Math.min(start + size - 1, state.totalItems);
    return { start, end };
  }

  function renderPageButtons(totalPages) {
    if (!totalPages) return "";

    return Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      const isActive = pageNumber === state.page;
      return `
        <button
          type="button"
          data-page-number="${pageNumber}"
          class="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2.5 text-sm font-semibold transition ${
            isActive
              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          }"
        >
          ${pageNumber}
        </button>
      `;
    }).join("");
  }

  function renderPageSizeMenu() {
    return pageSizeOptions
      .map((option) => {
        const optionValue = option === "all" ? "all" : String(option);
        const optionLabel = option === "all" ? "All" : String(option);
        const isSelected = String(state.pageSize) === optionValue;

        return `
          <button
            type="button"
            data-page-size-option="${optionValue}"
            class="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-semibold transition ${
              isSelected
                ? "bg-primary text-white"
                : "text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10"
            }"
          >
            <span>${optionLabel}</span>
          </button>
        `;
      })
      .join("");
  }

  function render() {
    const totalPages = api.getTotalPages();
    const { start, end } = getVisibleRange();
    const pageSizeValue = api.getPageSizeValue();
    const pageSizeLabel = state.pageSize === "all" ? "All" : String(state.pageSize);

    container.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2" id="pagination-pages">
            <button
              type="button"
              data-page-action="prev"
              class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition ${
                state.page <= 1 || !totalPages
                  ? "pointer-events-none border-slate-200 text-slate-400 opacity-50 dark:border-white/10 dark:text-gray-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              }"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6"></path>
              </svg>
              Previous
            </button>

            <div class="flex items-center gap-2 shrink-0">
              ${renderPageButtons(totalPages)}
            </div>

            <button
              type="button"
              data-page-action="next"
              class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition ${
                state.page >= totalPages || !totalPages
                  ? "pointer-events-none border-slate-200 text-slate-400 opacity-50 dark:border-white/10 dark:text-gray-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              }"
            >
              Next
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6l6 6-6 6"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="relative shrink-0" id="pagination-page-size-wrap">
          <button
            type="button"
            id="pagination-page-size-button"
            aria-haspopup="listbox"
            aria-expanded="${state.menuOpen ? "true" : "false"}"
            class="inline-flex h-9 min-w-[112px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition hover:border-slate-300 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-[#0b1220] dark:text-white dark:hover:border-white/20"
          >
            <span>${pageSizeLabel}</span>
            <svg class="h-4 w-4 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <div
            id="pagination-page-size-menu"
            class="${state.menuOpen ? "block" : "hidden"} absolute right-0 top-full mt-2 z-20 w-32 max-h-44 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-[#0b1220]"
            role="listbox"
          >
            ${renderPageSizeMenu()}
          </div>
        </div>
      </div>
    `;

    const pageSizeButton = container.querySelector("#pagination-page-size-button");
    const pageSizeMenu = container.querySelector("#pagination-page-size-menu");
    const prevButton = container.querySelector("[data-page-action='prev']");
    const nextButton = container.querySelector("[data-page-action='next']");
    const pageButtons = container.querySelectorAll("[data-page-number]");
    const pageSizeOptionsButtons = container.querySelectorAll("[data-page-size-option]");

    pageSizeButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      api.toggleMenu();
    });

    prevButton?.addEventListener("click", () => api.setPage(state.page - 1));
    nextButton?.addEventListener("click", () => api.setPage(state.page + 1));
    pageButtons.forEach((button) => {
      button.addEventListener("click", () => api.setPage(button.dataset.pageNumber));
    });
    pageSizeOptionsButtons.forEach((button) => {
      button.addEventListener("click", () => api.setPageSize(button.dataset.pageSizeOption));
    });

    onChange({
      page: state.page,
      pageSize: state.pageSize,
      limit: pageSizeValue,
      totalItems: state.totalItems,
      totalPages,
      start,
      end,
    });
  }

  document.addEventListener("click", handleDocumentClick);
  render();
  return api;
}
