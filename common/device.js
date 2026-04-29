(function (global) {
  const DEFAULT_TABLET_BREAKPOINT = 1024;
  const DESKTOP_ONLY_MESSAGE = "This game is only available on desktop devices.";

  function getBreakpoint(options) {
    if (options && Number.isFinite(options.tabletBreakpoint)) {
      return options.tabletBreakpoint;
    }
    return DEFAULT_TABLET_BREAKPOINT;
  }

  

  function isSmallScreen(options) {
    return window.innerWidth < getBreakpoint(options);
  }

  function isDesktopLikeDevice(options) {
    return !isSmallScreen(options);
  }

  function isGameSupported(gameConfig, options) {
    const config = gameConfig || {};
    if (!config.requiresKeyboard) return true;
    return isDesktopLikeDevice(options);
  }

  function getUnsupportedMessage(gameConfig, options) {
    return isGameSupported(gameConfig, options) ? "" : DESKTOP_ONLY_MESSAGE;
  }

  global.DeviceSupport = {
    DEFAULT_TABLET_BREAKPOINT,
    DESKTOP_ONLY_MESSAGE,
    isSmallScreen,
    isDesktopLikeDevice,
    isGameSupported,
    getUnsupportedMessage,
  };
})(window);
