(function() {
  if (localStorage.getItem('cookie-consent')) return;

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
    .cookie-banner-active {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .cookie-banner-inactive {
      animation: fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .cookie-blur {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
  `;
  document.head.appendChild(style);

  const isSubdir = window.location.pathname.includes("/gameDistribution/") || window.location.pathname.includes("/game/") || window.location.pathname.includes("/blog/");
  const privacyLink = isSubdir ? "../privacy.html" : "privacy.html";
  const cookieLink = isSubdir ? "../cookie-policy.html" : "cookie-policy.html";

  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[9999] cookie-blur bg-[#0b0f19]/90 border border-white/10 rounded-[1.75rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cookie-banner-active';
  
  // Custom glowing styling matching the template
  banner.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.15)';
  
  banner.innerHTML = `
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 class="text-white font-extrabold text-lg tracking-tight font-sans">Cookie Preferences</h3>
      </div>
      <p class="text-gray-300 text-sm leading-relaxed font-sans">
        We use cookies to enhance your gaming experience, serve personalized ads via Google AdSense, and analyze site traffic. Learn more in our <a href="${privacyLink}" class="text-indigo-400 hover:underline">Privacy Policy</a> and <a href="${cookieLink}" class="text-indigo-400 hover:underline">Cookie Policy</a>.
      </p>
      <div class="flex items-center gap-3 mt-1">
        <button id="cookie-accept-btn" class="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20">
          Accept All
        </button>
        <button id="cookie-reject-btn" class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 font-bold rounded-2xl text-sm transition-all active:scale-[0.98]">
          Reject
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  const closeBanner = (status) => {
    localStorage.setItem('cookie-consent', status);
    banner.classList.remove('cookie-banner-active');
    banner.classList.add('cookie-banner-inactive');
    setTimeout(() => {
      banner.remove();
    }, 400);
  };

  document.getElementById('cookie-accept-btn').addEventListener('click', () => closeBanner('accepted'));
  document.getElementById('cookie-reject-btn').addEventListener('click', () => closeBanner('rejected'));
})();
