/*
 screenfull
 v5.0.0 - 2019-09-09
 (c) Sindre Sorhus; MIT License
 Platform.js <https://mths.be/platform>
 Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 Copyright 2011-2013 John-David Dalton
 Available under MIT license <https://mths.be/mit>
*/
!(function () {
  var a =
      "undefined" != typeof window && void 0 !== window.document
        ? window.document
        : {},
    c = "undefined" != typeof module && module.exports,
    b = (function () {
      for (
        var b,
          d = [
            "requestFullscreen exitFullscreen fullscreenElement fullscreenEnabled fullscreenchange fullscreenerror".split(
              " "
            ),
            "webkitRequestFullscreen webkitExitFullscreen webkitFullscreenElement webkitFullscreenEnabled webkitfullscreenchange webkitfullscreenerror".split(
              " "
            ),
            "webkitRequestFullScreen webkitCancelFullScreen webkitCurrentFullScreenElement webkitCancelFullScreen webkitfullscreenchange webkitfullscreenerror".split(
              " "
            ),
            "mozRequestFullScreen mozCancelFullScreen mozFullScreenElement mozFullScreenEnabled mozfullscreenchange mozfullscreenerror".split(
              " "
            ),
            "msRequestFullscreen msExitFullscreen msFullscreenElement msFullscreenEnabled MSFullscreenChange MSFullscreenError".split(
              " "
            ),
          ],
          g = 0,
          f = d.length,
          c = {};
        g < f;
        g++
      )
        if ((b = d[g]) && b[1] in a) {
          for (g = 0; g < b.length; g++) c[d[0][g]] = b[g];
          return c;
        }
      return !1;
    })(),
    e = {
      change: b.fullscreenchange,
      error: b.fullscreenerror,
    },
    h = {
      request: function (c) {
        return new Promise(
          function (d, g) {
            var f = function () {
              this.off("change", f);
              d();
            }.bind(this);
            this.on("change", f);
            c = c || a.documentElement;
            Promise.resolve(c[b.requestFullscreen]())["catch"](g);
          }.bind(this)
        );
      },
      exit: function () {
        return new Promise(
          function (c, d) {
            if (this.isFullscreen) {
              var g = function () {
                this.off("change", g);
                c();
              }.bind(this);
              this.on("change", g);
              Promise.resolve(a[b.exitFullscreen]())["catch"](d);
            } else c();
          }.bind(this)
        );
      },
      toggle: function (a) {
        return this.isFullscreen ? this.exit() : this.request(a);
      },
      onchange: function (a) {
        this.on("change", a);
      },
      onerror: function (a) {
        this.on("error", a);
      },
      on: function (b, d) {
        var g = e[b];
        g && a.addEventListener(g, d, !1);
      },
      off: function (b, d) {
        var g = e[b];
        g && a.removeEventListener(g, d, !1);
      },
      raw: b,
    };
  b
    ? (Object.defineProperties(h, {
        isFullscreen: {
          get: function () {
            return !!a[b.fullscreenElement];
          },
        },
        element: {
          enumerable: !0,
          get: function () {
            return a[b.fullscreenElement];
          },
        },
        isEnabled: {
          enumerable: !0,
          get: function () {
            return !!a[b.fullscreenEnabled];
          },
        },
      }),
      c ? (module.exports = h) : (window.screenfull = h))
    : c
    ? (module.exports = {
        isEnabled: !1,
      })
    : (window.screenfull = {
        isEnabled: !1,
      });
})();
(function () {
  function a(a) {
    a = String(a);
    return a.charAt(0).toUpperCase() + a.slice(1);
  }
  function c(a, b) {
    var d = -1,
      g = a ? a.length : 0;
    if ("number" == typeof g && -1 < g && g <= k)
      for (; ++d < g; ) b(a[d], d, a);
    else e(a, b);
  }
  function b(b) {
    b = String(b).replace(/^ +| +$/g, "");
    return /^(?:webOS|i(?:OS|P))/.test(b) ? b : a(b);
  }
  function e(a, b) {
    for (var d in a) v.call(a, d) && b(a[d], d, a);
  }
  function h(b) {
    return null == b ? a(b) : z.call(b).slice(8, -1);
  }
  function m(a, b) {
    var d = null != a ? typeof a[b] : "number";
    return (
      !/^(?:boolean|number|string|undefined)$/.test(d) &&
      ("object" == d ? !!a[b] : !0)
    );
  }
  function d(a) {
    return String(a).replace(/([ -])(?!$)/g, "$1?");
  }
  function g(a, b) {
    var d = null;
    c(a, function (g, c) {
      d = b(d, g, c, a);
    });
    return d;
  }
  function f(a) {
    function c(c) {
      return g(c, function (g, c) {
        var f = c.pattern || d(c);
        !g &&
          (g =
            RegExp("\\b" + f + " *\\d+[.\\w_]*", "i").exec(a) ||
            RegExp("\\b" + f + " *\\w+-[\\w]*", "i").exec(a) ||
            RegExp(
              "\\b" + f + "(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)",
              "i"
            ).exec(a)) &&
          ((g = String(
            c.label && !RegExp(f, "i").test(c.label) ? c.label : g
          ).split("/"))[1] &&
            !/[\d.]+/.test(g[0]) &&
            (g[0] += " " + g[1]),
          (c = c.label || c),
          (g = b(
            g[0]
              .replace(RegExp(f, "i"), c)
              .replace(RegExp("; *(?:" + c + "[_-])?", "i"), " ")
              .replace(RegExp("(" + c + ")[-_.]?(\\w)", "i"), "$1 $2")
          )));
        return g;
      });
    }
    function q(b) {
      return g(b, function (b, d) {
        return (
          b ||
          (RegExp(
            d + "(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)",
            "i"
          ).exec(a) || 0)[1] ||
          null
        );
      });
    }
    var k = p,
      l = a && "object" == typeof a && "String" != h(a);
    l && ((k = a), (a = null));
    var u = k.navigator || {},
      r = u.userAgent || "";
    a || (a = r);
    var v = l
        ? !!u.likeChrome
        : /\bChrome\b/.test(a) && !/internal|\n/i.test(z.toString()),
      y = l ? "Object" : "ScriptBridgingProxyObject",
      O = l ? "Object" : "Environment",
      L = l && k.java ? "JavaPackage" : h(k.java),
      P = l ? "Object" : "RuntimeObject";
    O = (L = /\bJava/.test(L) && k.java) && h(k.environment) == O;
    var Q = L ? "a" : "\u03b1",
      X = L ? "b" : "\u03b2",
      U = k.document || {},
      M = k.operamini || k.opera,
      R = t.test((R = l && M ? M["[[Class]]"] : h(M))) ? R : (M = null),
      n,
      S = a;
    l = [];
    var T = null,
      N = a == r;
    r = N && M && "function" == typeof M.version && M.version();
    var D = (function (b) {
        return g(b, function (b, g) {
          return (
            b ||
            (RegExp("\\b" + (g.pattern || d(g)) + "\\b", "i").exec(a) &&
              (g.label || g))
          );
        });
      })([
        {
          label: "EdgeHTML",
          pattern: "Edge",
        },
        "Trident",
        {
          label: "WebKit",
          pattern: "AppleWebKit",
        },
        "iCab",
        "Presto",
        "NetFront",
        "Tasman",
        "KHTML",
        "Gecko",
      ]),
      w = (function (b) {
        return g(b, function (b, g) {
          return (
            b ||
            (RegExp("\\b" + (g.pattern || d(g)) + "\\b", "i").exec(a) &&
              (g.label || g))
          );
        });
      })([
        "Adobe AIR",
        "Arora",
        "Avant Browser",
        "Breach",
        "Camino",
        "Electron",
        "Epiphany",
        "Fennec",
        "Flock",
        "Galeon",
        "GreenBrowser",
        "iCab",
        "Iceweasel",
        "K-Meleon",
        "Konqueror",
        "Lunascape",
        "Maxthon",
        {
          label: "Microsoft Edge",
          pattern: "Edge",
        },
        "Midori",
        "Nook Browser",
        "PaleMoon",
        "PhantomJS",
        "Raven",
        "Rekonq",
        "RockMelt",
        {
          label: "Samsung Internet",
          pattern: "SamsungBrowser",
        },
        "SeaMonkey",
        {
          label: "Silk",
          pattern: "(?:Cloud9|Silk-Accelerated)",
        },
        "Sleipnir",
        "SlimBrowser",
        {
          label: "SRWare Iron",
          pattern: "Iron",
        },
        "Sunrise",
        "Swiftfox",
        "Waterfox",
        "WebPositive",
        "Opera Mini",
        {
          label: "Opera Mini",
          pattern: "OPiOS",
        },
        "Opera",
        {
          label: "Opera",
          pattern: "OPR",
        },
        "Chrome",
        {
          label: "Chrome Mobile",
          pattern: "(?:CriOS|CrMo)",
        },
        {
          label: "Firefox",
          pattern: "(?:Firefox|Minefield)",
        },
        {
          label: "Firefox for iOS",
          pattern: "FxiOS",
        },
        {
          label: "IE",
          pattern: "IEMobile",
        },
        {
          label: "IE",
          pattern: "MSIE",
        },
        "Safari",
      ]),
      E = c([
        {
          label: "BlackBerry",
          pattern: "BB10",
        },
        "BlackBerry",
        {
          label: "Galaxy S",
          pattern: "GT-I9000",
        },
        {
          label: "Galaxy S2",
          pattern: "GT-I9100",
        },
        {
          label: "Galaxy S3",
          pattern: "GT-I9300",
        },
        {
          label: "Galaxy S4",
          pattern: "GT-I9500",
        },
        {
          label: "Galaxy S5",
          pattern: "SM-G900",
        },
        {
          label: "Galaxy S6",
          pattern: "SM-G920",
        },
        {
          label: "Galaxy S6 Edge",
          pattern: "SM-G925",
        },
        {
          label: "Galaxy S7",
          pattern: "SM-G930",
        },
        {
          label: "Galaxy S7 Edge",
          pattern: "SM-G935",
        },
        "Google TV",
        "Lumia",
        "iPad",
        "iPod",
        "iPhone",
        "Kindle",
        {
          label: "Kindle Fire",
          pattern: "(?:Cloud9|Silk-Accelerated)",
        },
        "Nexus",
        "Nook",
        "PlayBook",
        "PlayStation Vita",
        "PlayStation",
        "TouchPad",
        "Transformer",
        {
          label: "Wii U",
          pattern: "WiiU",
        },
        "Wii",
        "Xbox One",
        {
          label: "Xbox 360",
          pattern: "Xbox",
        },
        "Xoom",
      ]),
      K = (function (b) {
        return g(b, function (b, g, c) {
          return (
            b ||
            ((g[E] ||
              g[/^[a-z]+(?: +[a-z]+\b)*/i.exec(E)] ||
              RegExp("\\b" + d(c) + "(?:\\b|\\w*\\d)", "i").exec(a)) &&
              c)
          );
        });
      })({
        Apple: {
          iPad: 1,
          iPhone: 1,
          iPod: 1,
        },
        Archos: {},
        Amazon: {
          Kindle: 1,
          "Kindle Fire": 1,
        },
        Asus: {
          Transformer: 1,
        },
        "Barnes & Noble": {
          Nook: 1,
        },
        BlackBerry: {
          PlayBook: 1,
        },
        Google: {
          "Google TV": 1,
          Nexus: 1,
        },
        HP: {
          TouchPad: 1,
        },
        HTC: {},
        LG: {},
        Microsoft: {
          Xbox: 1,
          "Xbox One": 1,
        },
        Motorola: {
          Xoom: 1,
        },
        Nintendo: {
          "Wii U": 1,
          Wii: 1,
        },
        Nokia: {
          Lumia: 1,
        },
        Samsung: {
          "Galaxy S": 1,
          "Galaxy S2": 1,
          "Galaxy S3": 1,
          "Galaxy S4": 1,
        },
        Sony: {
          PlayStation: 1,
          "PlayStation Vita": 1,
        },
      }),
      x = (function (c) {
        return g(c, function (g, c) {
          var f = c.pattern || d(c);
          if (
            !g &&
            (g = RegExp("\\b" + f + "(?:/[\\d.]+|[ \\w.]*)", "i").exec(a))
          ) {
            var e = g,
              k = c.label || c,
              l = {
                "10.0": "10",
                6.4: "10 Technical Preview",
                6.3: "8.1",
                6.2: "8",
                6.1: "Server 2008 R2 / 7",
                "6.0": "Server 2008 / Vista",
                5.2: "Server 2003 / XP 64-bit",
                5.1: "XP",
                5.01: "2000 SP1",
                "5.0": "2000",
                "4.0": "NT",
                "4.90": "ME",
              };
            f &&
              k &&
              /^Win/i.test(e) &&
              !/^Windows Phone /i.test(e) &&
              (l = l[/[\d.]+$/.exec(e)]) &&
              (e = "Windows " + l);
            e = String(e);
            f && k && (e = e.replace(RegExp(f, "i"), k));
            g = e = b(
              e
                .replace(/ ce$/i, " CE")
                .replace(/\bhpw/i, "web")
                .replace(/\bMacintosh\b/, "Mac OS")
                .replace(/_PowerPC\b/i, " OS")
                .replace(/\b(OS X) [^ \d]+/i, "$1")
                .replace(/\bMac (OS X)\b/, "$1")
                .replace(/\/(\d)/, " $1")
                .replace(/_/g, ".")
                .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, "")
                .replace(/\bx86\.64\b/gi, "x86_64")
                .replace(/\b(Windows Phone) OS\b/, "$1")
                .replace(/\b(Chrome OS \w+) [\d.]+\b/, "$1")
                .split(" on ")[0]
            );
          }
          return g;
        });
      })([
        "Windows Phone",
        "Android",
        "CentOS",
        {
          label: "Chrome OS",
          pattern: "CrOS",
        },
        "Debian",
        "Fedora",
        "FreeBSD",
        "Gentoo",
        "Haiku",
        "Kubuntu",
        "Linux Mint",
        "OpenBSD",
        "Red Hat",
        "SuSE",
        "Ubuntu",
        "Xubuntu",
        "Cygwin",
        "Symbian OS",
        "hpwOS",
        "webOS ",
        "webOS",
        "Tablet OS",
        "Tizen",
        "Linux",
        "Mac OS X",
        "Macintosh",
        "Mac",
        "Windows 98;",
        "Windows ",
      ]);
    D && (D = [D]);
    K && !E && (E = c([K]));
    if ((n = /\bGoogle TV\b/.exec(E))) E = n[0];
    /\bSimulator\b/i.test(a) && (E = (E ? E + " " : "") + "Simulator");
    "Opera Mini" == w &&
      /\bOPiOS\b/.test(a) &&
      l.push("running in Turbo/Uncompressed mode");
    "IE" == w && /\blike iPhone OS\b/.test(a)
      ? ((n = f(a.replace(/like iPhone OS/, ""))),
        (K = n.manufacturer),
        (E = n.product))
      : /^iP/.test(E)
      ? (w || (w = "Safari"),
        (x =
          "iOS" +
          ((n = / OS ([\d_]+)/i.exec(a)) ? " " + n[1].replace(/_/g, ".") : "")))
      : "Konqueror" != w || /buntu/i.test(x)
      ? (K &&
          "Google" != K &&
          ((/Chrome/.test(w) && !/\bMobile Safari\b/i.test(a)) ||
            /\bVita\b/.test(E))) ||
        (/\bAndroid\b/.test(x) && /^Chrome/.test(w) && /\bVersion\//i.test(a))
        ? ((w = "Android Browser"), (x = /\bAndroid\b/.test(x) ? x : "Android"))
        : "Silk" == w
        ? (/\bMobi/i.test(a) || ((x = "Android"), l.unshift("desktop mode")),
          /Accelerated *= *true/i.test(a) && l.unshift("accelerated"))
        : "PaleMoon" == w && (n = /\bFirefox\/([\d.]+)\b/.exec(a))
        ? l.push("identifying as Firefox " + n[1])
        : "Firefox" == w && (n = /\b(Mobile|Tablet|TV)\b/i.exec(a))
        ? (x || (x = "Firefox OS"), E || (E = n[1]))
        : !w ||
          (n = !/\bMinefield\b/i.test(a) && /\b(?:Firefox|Safari)\b/.exec(w))
        ? (w &&
            !E &&
            /[\/,]|^[^(]+?\)/.test(a.slice(a.indexOf(n + "/") + 8)) &&
            (w = null),
          (n = E || K || x) &&
            (E || K || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(x)) &&
            (w =
              /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(x) ? x : n) +
              " Browser"))
        : "Electron" == w &&
          (n = (/\bChrome\/([\d.]+)\b/.exec(a) || 0)[1]) &&
          l.push("Chromium " + n)
      : (x = "Kubuntu");
    r ||
      (r = q([
        "(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))",
        "Version",
        d(w),
        "(?:Firefox|Minefield|NetFront)",
      ]));
    if (
      (n =
        ("iCab" == D && 3 < parseFloat(r) && "WebKit") ||
        (/\bOpera\b/.test(w) && (/\bOPR\b/.test(a) ? "Blink" : "Presto")) ||
        (/\b(?:Midori|Nook|Safari)\b/i.test(a) &&
          !/^(?:Trident|EdgeHTML)$/.test(D) &&
          "WebKit") ||
        (!D && /\bMSIE\b/i.test(a) && ("Mac OS" == x ? "Tasman" : "Trident")) ||
        ("WebKit" == D && /\bPlayStation\b(?! Vita\b)/i.test(w) && "NetFront"))
    )
      D = [n];
    "IE" == w && (n = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(a) || 0)[1])
      ? ((w += " Mobile"),
        (x = "Windows Phone " + (/\+$/.test(n) ? n : n + ".x")),
        l.unshift("desktop mode"))
      : /\bWPDesktop\b/i.test(a)
      ? ((w = "IE Mobile"),
        (x = "Windows Phone 8.x"),
        l.unshift("desktop mode"),
        r || (r = (/\brv:([\d.]+)/.exec(a) || 0)[1]))
      : "IE" != w &&
        "Trident" == D &&
        (n = /\brv:([\d.]+)/.exec(a)) &&
        (w && l.push("identifying as " + w + (r ? " " + r : "")),
        (w = "IE"),
        (r = n[1]));
    if (N) {
      if (m(k, "global"))
        if (
          (L &&
            ((n = L.lang.System),
            (S = n.getProperty("os.arch")),
            (x =
              x ||
              n.getProperty("os.name") + " " + n.getProperty("os.version"))),
          O)
        ) {
          try {
            (r = k.require("ringo/engine").version.join(".")), (w = "RingoJS");
          } catch (W) {
            (n = k.system) &&
              n.global.system == k.system &&
              ((w = "Narwhal"), x || (x = n[0].os || null));
          }
          w || (w = "Rhino");
        } else
          "object" == typeof k.process &&
            !k.process.browser &&
            (n = k.process) &&
            ("object" == typeof n.versions &&
              ("string" == typeof n.versions.electron
                ? (l.push("Node " + n.versions.node),
                  (w = "Electron"),
                  (r = n.versions.electron))
                : "string" == typeof n.versions.nw &&
                  (l.push("Chromium " + r, "Node " + n.versions.node),
                  (w = "NW.js"),
                  (r = n.versions.nw))),
            w ||
              ((w = "Node.js"),
              (S = n.arch),
              (x = n.platform),
              (r = (r = /[\d.]+/.exec(n.version)) ? r[0] : null)));
      else
        h((n = k.runtime)) == y
          ? ((w = "Adobe AIR"), (x = n.flash.system.Capabilities.os))
          : h((n = k.phantom)) == P
          ? ((w = "PhantomJS"),
            (r =
              (n = n.version || null) &&
              n.major + "." + n.minor + "." + n.patch))
          : "number" == typeof U.documentMode &&
            (n = /\bTrident\/(\d+)/i.exec(a))
          ? ((r = [r, U.documentMode]),
            (n = +n[1] + 4) != r[1] &&
              (l.push("IE " + r[1] + " mode"), D && (D[1] = ""), (r[1] = n)),
            (r = "IE" == w ? String(r[1].toFixed(1)) : r[0]))
          : "number" == typeof U.documentMode &&
            /^(?:Chrome|Firefox)\b/.test(w) &&
            (l.push("masking as " + w + " " + r),
            (w = "IE"),
            (r = "11.0"),
            (D = ["Trident"]),
            (x = "Windows"));
      x = x && b(x);
    }
    r &&
      (n =
        /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(r) ||
        /(?:alpha|beta)(?: ?\d)?/i.exec(a + ";" + (N && u.appMinorVersion)) ||
        (/\bMinefield\b/i.test(a) && "a")) &&
      ((T = /b/i.test(n) ? "beta" : "alpha"),
      (r =
        r.replace(RegExp(n + "\\+?$"), "") +
        ("beta" == T ? X : Q) +
        (/\d+\+?/.exec(n) || "")));
    if (
      "Fennec" == w ||
      ("Firefox" == w && /\b(?:Android|Firefox OS)\b/.test(x))
    )
      w = "Firefox Mobile";
    else if ("Maxthon" == w && r) r = r.replace(/\.[\d.]+/, ".x");
    else if (/\bXbox\b/i.test(E))
      "Xbox 360" == E && (x = null),
        "Xbox 360" == E && /\bIEMobile\b/.test(a) && l.unshift("mobile mode");
    else if (
      (!/^(?:Chrome|IE|Opera)$/.test(w) &&
        (!w || E || /Browser|Mobi/.test(w))) ||
      ("Windows CE" != x && !/Mobi/i.test(a))
    )
      if ("IE" == w && N)
        try {
          null === k.external && l.unshift("platform preview");
        } catch (W) {
          l.unshift("embedded");
        }
      else
        (/\bBlackBerry\b/.test(E) || /\bBB10\b/.test(a)) &&
        (n =
          (RegExp(E.replace(/ +/g, " *") + "/([.\\d]+)", "i").exec(a) ||
            0)[1] || r)
          ? ((n = [n, /BB10/.test(a)]),
            (x =
              (n[1] ? ((E = null), (K = "BlackBerry")) : "Device Software") +
              " " +
              n[0]),
            (r = null))
          : this != e &&
            "Wii" != E &&
            ((N && M) ||
              (/Opera/.test(w) && /\b(?:MSIE|Firefox)\b/i.test(a)) ||
              ("Firefox" == w && /\bOS X (?:\d+\.){2,}/.test(x)) ||
              ("IE" == w &&
                ((x && !/^Win/.test(x) && 5.5 < r) ||
                  (/\bWindows XP\b/.test(x) && 8 < r) ||
                  (8 == r && !/\bTrident\b/.test(a))))) &&
            !t.test((n = f.call(e, a.replace(t, "") + ";"))) &&
            n.name &&
            ((n = "ing as " + n.name + ((n = n.version) ? " " + n : "")),
            t.test(w)
              ? (/\bIE\b/.test(n) && "Mac OS" == x && (x = null),
                (n = "identify" + n))
              : ((n = "mask" + n),
                (w = R ? b(R.replace(/([a-z])([A-Z])/g, "$1 $2")) : "Opera"),
                /\bIE\b/.test(n) && (x = null),
                N || (r = null)),
            (D = ["Presto"]),
            l.push(n));
    else w += " Mobile";
    if ((n = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(a) || 0)[1])) {
      n = [parseFloat(n.replace(/\.(\d)$/, ".0$1")), n];
      if ("Safari" == w && "+" == n[1].slice(-1))
        (w = "WebKit Nightly"), (T = "alpha"), (r = n[1].slice(0, -1));
      else if (
        r == n[1] ||
        r == (n[2] = (/\bSafari\/([\d.]+\+?)/i.exec(a) || 0)[1])
      )
        r = null;
      n[1] = (/\bChrome\/([\d.]+)/i.exec(a) || 0)[1];
      537.36 == n[0] &&
        537.36 == n[2] &&
        28 <= parseFloat(n[1]) &&
        "WebKit" == D &&
        (D = ["Blink"]);
      N && (v || n[1])
        ? (D && (D[1] = "like Chrome"),
          (n =
            n[1] ||
            ((n = n[0]),
            530 > n
              ? 1
              : 532 > n
              ? 2
              : 532.05 > n
              ? 3
              : 533 > n
              ? 4
              : 534.03 > n
              ? 5
              : 534.07 > n
              ? 6
              : 534.1 > n
              ? 7
              : 534.13 > n
              ? 8
              : 534.16 > n
              ? 9
              : 534.24 > n
              ? 10
              : 534.3 > n
              ? 11
              : 535.01 > n
              ? 12
              : 535.02 > n
              ? "13+"
              : 535.07 > n
              ? 15
              : 535.11 > n
              ? 16
              : 535.19 > n
              ? 17
              : 536.05 > n
              ? 18
              : 536.1 > n
              ? 19
              : 537.01 > n
              ? 20
              : 537.11 > n
              ? "21+"
              : 537.13 > n
              ? 23
              : 537.18 > n
              ? 24
              : 537.24 > n
              ? 25
              : 537.36 > n
              ? 26
              : "Blink" != D
              ? "27"
              : "28")))
        : (D && (D[1] = "like Safari"),
          (n =
            ((n = n[0]),
            400 > n
              ? 1
              : 500 > n
              ? 2
              : 526 > n
              ? 3
              : 533 > n
              ? 4
              : 534 > n
              ? "4+"
              : 535 > n
              ? 5
              : 537 > n
              ? 6
              : 538 > n
              ? 7
              : 601 > n
              ? 8
              : "8")));
      D &&
        (D[1] +=
          " " + (n += "number" == typeof n ? ".x" : /[.+]/.test(n) ? "" : "+"));
      "Safari" == w && (!r || 45 < parseInt(r)) && (r = n);
    }
    "Opera" == w && (n = /\bzbov|zvav$/.exec(x))
      ? ((w += " "),
        l.unshift("desktop mode"),
        "zvav" == n ? ((w += "Mini"), (r = null)) : (w += "Mobile"),
        (x = x.replace(RegExp(" *" + n + "$"), "")))
      : "Safari" == w &&
        /\bChrome\b/.exec(D && D[1]) &&
        (l.unshift("desktop mode"),
        (w = "Chrome Mobile"),
        (r = null),
        /\bOS X\b/.test(x) ? ((K = "Apple"), (x = "iOS 4.3+")) : (x = null));
    r &&
      0 == r.indexOf((n = /[\d.]+$/.exec(x))) &&
      -1 < a.indexOf("/" + n + "-") &&
      (x = String(x.replace(n, "")).replace(/^ +| +$/g, ""));
    D &&
      !/\b(?:Avant|Nook)\b/.test(w) &&
      (/Browser|Lunascape|Maxthon/.test(w) ||
        ("Safari" != w && /^iOS/.test(x) && /\bSafari\b/.test(D[1])) ||
        (/^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(
          w
        ) &&
          D[1])) &&
      (n = D[D.length - 1]) &&
      l.push(n);
    l.length && (l = ["(" + l.join("; ") + ")"]);
    K && E && 0 > E.indexOf(K) && l.push("on " + K);
    E && l.push((/^on /.test(l[l.length - 1]) ? "" : "on ") + E);
    if (x) {
      var V =
        (n = / ([\d.+]+)$/.exec(x)) &&
        "/" == x.charAt(x.length - n[0].length - 1);
      x = {
        architecture: 32,
        family: n && !V ? x.replace(n[0], "") : x,
        version: n ? n[1] : null,
        toString: function () {
          var a = this.version;
          return (
            this.family +
            (a && !V ? " " + a : "") +
            (64 == this.architecture ? " 64-bit" : "")
          );
        },
      };
    }
    (n = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(S)) && !/\bi686\b/i.test(S)
      ? (x &&
          ((x.architecture = 64),
          (x.family = x.family.replace(RegExp(" *" + n), ""))),
        w &&
          (/\bWOW64\b/i.test(a) ||
            (N &&
              /\w(?:86|32)$/.test(u.cpuClass || u.platform) &&
              !/\bWin64; x64\b/i.test(a))) &&
          l.unshift("32-bit"))
      : x &&
        /^OS X/.test(x.family) &&
        "Chrome" == w &&
        39 <= parseFloat(r) &&
        (x.architecture = 64);
    a || (a = null);
    k = {};
    k.description = a;
    k.layout = D && D[0];
    k.manufacturer = K;
    k.name = w;
    k.prerelease = T;
    k.product = E;
    k.ua = a;
    k.version = w && r;
    k.os = x || {
      architecture: null,
      family: null,
      version: null,
      toString: function () {
        return "null";
      },
    };
    k.parse = f;
    k.toString = function () {
      return this.description || "";
    };
    k.version && l.unshift(r);
    k.name && l.unshift(w);
    x &&
      w &&
      (x != String(x).split(" ")[0] || (x != w.split(" ")[0] && !E)) &&
      l.push(E ? "(" + x + ")" : "on " + x);
    l.length && (k.description = l.join(" "));
    return k;
  }
  var l = {
      function: !0,
      object: !0,
    },
    p = (l[typeof window] && window) || this,
    q = l[typeof exports] && exports;
  l = l[typeof module] && module && !module.nodeType && module;
  var u = q && l && "object" == typeof global && global;
  !u || (u.global !== u && u.window !== u && u.self !== u) || (p = u);
  var k = Math.pow(2, 53) - 1,
    t = /\bOpera/;
  u = Object.prototype;
  var v = u.hasOwnProperty,
    z = u.toString,
    r = f();
  "function" == typeof define && "object" == typeof define.amd && define.amd
    ? ((p.platform = r),
      define(function () {
        return r;
      }))
    : q && l
    ? e(r, function (a, b) {
        q[b] = a;
      })
    : (p.platform = r);
}).call(this);
function buildIOSMeta() {
  for (
    var a = [
        {
          name: "viewport",
          content:
            "width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black",
        },
      ],
      c = 0;
    c < a.length;
    c++
  ) {
    var b = document.createElement("meta");
    b.name = a[c].name;
    b.content = a[c].content;
    var e = window.document.head.querySelector('meta[name="' + b.name + '"]');
    e && e.parentNode.removeChild(e);
    window.document.head.appendChild(b);
  }
}
function hideIOSFullscreenPanel() {
  jQuery(".xxx-ios-fullscreen-message").css("display", "none");
  jQuery(".xxx-ios-fullscreen-scroll").css("display", "none");
  jQuery(".xxx-game-iframe-full").removeClass("xxx-game-iframe-iphone-se");
}
function buildIOSFullscreenPanel() {
  jQuery("body").append(
    '<div class="xxx-ios-fullscreen-message"><div class="xxx-ios-fullscreen-swipe"></div></div><div class="xxx-ios-fullscreen-scroll"></div>'
  );
}
function showIOSFullscreenPanel() {
  jQuery(".xxx-ios-fullscreen-message").css("display", "block");
  jQuery(".xxx-ios-fullscreen-scroll").css("display", "block");
}
function __iosResize() {
  window.scrollTo(0, 0);
  console.log(window.devicePixelRatio);
  console.log(window.innerWidth);
  console.log(window.innerHeight);
  if ("iPhone" === platform.product)
    switch (window.devicePixelRatio) {
      case 2:
        switch (window.innerWidth) {
          case 568:
            320 !== window.innerHeight &&
              jQuery(".xxx-game-iframe-full").addClass(
                "xxx-game-iframe-iphone-se"
              );
            break;
          case 667:
            375 === window.innerHeight
              ? hideIOSFullscreenPanel()
              : showIOSFullscreenPanel();
            break;
          case 808:
            414 === window.innerHeight
              ? hideIOSFullscreenPanel()
              : showIOSFullscreenPanel();
            break;
          default:
            hideIOSFullscreenPanel();
        }
        break;
      case 3:
        switch (window.innerWidth) {
          case 736:
            414 === window.innerHeight
              ? hideIOSFullscreenPanel()
              : showIOSFullscreenPanel();
            break;
          case 724:
            375 === window.innerHeight
              ? hideIOSFullscreenPanel()
              : showIOSFullscreenPanel();
            break;
          case 808:
            414 === window.innerHeight
              ? hideIOSFullscreenPanel()
              : showIOSFullscreenPanel();
            break;
          default:
            hideIOSFullscreenPanel();
        }
        break;
      default:
        hideIOSFullscreenPanel();
    }
}
function iosResize() {
  __iosResize();
  setTimeout(function () {
    __iosResize();
  }, 500);
}
function iosInIframe() {
  try {
    return window.self !== window.top;
  } catch (a) {
    return !0;
  }
}
function isIOSLessThen13() {
  var a = platform.os,
    c = a.family.toLowerCase();
  a = parseFloat(a.version);
  return "ios" === c && 13 > a ? !0 : !1;
}
$(document).ready(function () {
  platform &&
    "iPhone" === platform.product &&
    "safari" === platform.name.toLowerCase() &&
    isIOSLessThen13() &&
    !iosInIframe() &&
    (buildIOSFullscreenPanel(), buildIOSMeta());
});
jQuery(window).resize(function () {
  platform &&
    "iPhone" === platform.product &&
    "safari" === platform.name.toLowerCase() &&
    isIOSLessThen13() &&
    !iosInIframe() &&
    iosResize();
});
var s_iScaleFactor = 1,
  s_iOffsetX,
  s_iOffsetY,
  s_bIsIphone = !1;
(function (a) {
  (jQuery.browser = jQuery.browser || {}).mobile =
    /android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|tablet|treo|up\.(browser|link)|vodafone|wap|webos|windows (ce|phone)|xda|xiino/i.test(
      a
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(
      a.substr(0, 4)
    );
})(navigator.userAgent || navigator.vendor || window.opera);
$(window).resize(function () {
  sizeHandler();
});
function NotImplementedError(a) {
  this.name = "NotImplementedError";
  this.message = a || "";
}
NotImplementedError.prototype = Error.prototype;
function error(a) {
  throw {
    name: "NotImplementedError",
    message: a,
  };
}
function trace(a) {
  console.log(a);
}
window.addEventListener("orientationchange", onOrientationChange);
function onOrientationChange() {
  sizeHandler();
}
function ifArrayContainsValue(a, c) {
  for (var b = 0; b < a.length; b++) if (a[b] === c) return !0;
  return !1;
}
function getSize(a) {
  var c = a.toLowerCase(),
    b = window.document,
    e = b.documentElement;
  if (void 0 === window["inner" + a]) a = e["client" + a];
  else if (window["inner" + a] != e["client" + a]) {
    var h = b.createElement("body");
    h.id = "vpw-test-b";
    h.style.cssText = "overflow:scroll";
    var m = b.createElement("div");
    m.id = "vpw-test-d";
    m.style.cssText = "position:absolute;top:-1000px";
    m.innerHTML =
      "<style>@media(" +
      c +
      ":" +
      e["client" + a] +
      "px){body#vpw-test-b div#vpw-test-d{" +
      c +
      ":7px!important}}</style>";
    h.appendChild(m);
    e.insertBefore(h, b.head);
    a = 7 == m["offset" + a] ? e["client" + a] : window["inner" + a];
    e.removeChild(h);
  } else a = window["inner" + a];
  return a;
}
function sizeHandler() {
  window.scrollTo(0, 1);
  if ($("#canvas")) {
    var a =
      "safari" === platform.name.toLowerCase()
        ? getIOSWindowHeight()
        : getSize("Height");
    var c = getSize("Width");
    var f = s_bMobile && a > c;
    _checkOrientation(c, a);
    s_iScaleFactor = Math.min(a / CANVAS_HEIGHT, c / CANVAS_WIDTH);
    var b = Math.round(CANVAS_WIDTH * s_iScaleFactor),
      e = Math.round(CANVAS_HEIGHT * s_iScaleFactor),
      h,
      m,
      d,
      n = 1;
    if (!f) {
      if (e < a) {
        h = a - e;
        e += h;
        b += (CANVAS_WIDTH / CANVAS_HEIGHT) * h;
      } else
        b < c &&
          ((h = c - b), (b += h), (e += (CANVAS_HEIGHT / CANVAS_WIDTH) * h));
      h = a / 2 - e / 2;
      m = c / 2 - b / 2;
      d = CANVAS_WIDTH / b;
      if (m * d < -EDGEBOARD_X || h * d < -EDGEBOARD_Y)
        (s_iScaleFactor = Math.min(
          a / (CANVAS_HEIGHT - 2 * EDGEBOARD_Y),
          c / (CANVAS_WIDTH - 2 * EDGEBOARD_X)
        )),
          (b = Math.round(CANVAS_WIDTH * s_iScaleFactor)),
          (e = Math.round(CANVAS_HEIGHT * s_iScaleFactor)),
          (h = (a - e) / 2),
          (m = (c - b) / 2),
          (d = CANVAS_WIDTH / b);
    }
    f &&
      ((s_iScaleFactor = c / CANVAS_WIDTH),
      (b = Math.round(CANVAS_WIDTH * s_iScaleFactor)),
      (e = Math.round(CANVAS_HEIGHT * s_iScaleFactor)),
      (n = 1.12),
      (h = (a - e * n) / 2),
      (m = (c - b) / 2),
      (d = CANVAS_WIDTH / b));
    s_iOffsetX = -1 * m * d;
    s_iOffsetY = -1 * h * d;
    0 <= h && (s_iOffsetY = 0);
    0 <= m && (s_iOffsetX = 0);
    null !== s_oInterface &&
      s_oInterface.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    null !== s_oMenu && s_oMenu.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    null !== s_oColourChoose &&
      s_oColourChoose.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    null !== s_oPlayersChoose &&
      s_oPlayersChoose.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    null !== s_oModeChoose &&
      s_oModeChoose.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    null !== s_oModeSelection &&
      s_oModeSelection.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    s_bIsIphone
      ? ((canvas = document.getElementById("canvas")),
        (s_oStage.canvas.width = Math.floor(2 * b)),
        (s_oStage.canvas.height = Math.floor(2 * e)),
        (canvas.style.width = Math.floor(b) + "px"),
        (canvas.style.height = Math.floor(e * n) + "px"),
        (s_oStage.scaleX = s_oStage.scaleY =
          2 * Math.min(b / CANVAS_WIDTH, e / CANVAS_HEIGHT)))
      : s_bMobile || isChrome()
      ? ($("#canvas").css("width", b + "px"),
        $("#canvas").css("height", Math.round(e * n) + "px"))
      : ((s_oStage.canvas.width = Math.floor(b)),
        (s_oStage.canvas.height = Math.floor(e)),
        (s_iScaleFactor = Math.min(b / CANVAS_WIDTH, e / CANVAS_HEIGHT)),
        (s_oStage.scaleX = s_oStage.scaleY = s_iScaleFactor));
    0 > h || (h = (a - e * n) / 2);
    $("#canvas").css("top", h + "px");
    $("#canvas").css("left", m + "px");
    fullscreenHandler();
  }
}
function _checkOrientation(a, c) {
  s_bMobile &&
    ENABLE_CHECK_ORIENTATION &&
    (a > c
      ? "landscape" === $(".orientation-msg-container").attr("data-orientation")
        ? ($(".orientation-msg-container").css("display", "none"),
          s_oMain.startUpdate())
        : ($(".orientation-msg-container").css("display", "block"),
          s_oMain.stopUpdate())
      : "portrait" === $(".orientation-msg-container").attr("data-orientation")
      ? ($(".orientation-msg-container").css("display", "none"),
        s_oMain.startUpdate())
      : ($(".orientation-msg-container").css("display", "block"),
        s_oMain.stopUpdate()));
}
function isChrome() {
  return (
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  );
}
function isIpad() {
  var a = -1 !== navigator.userAgent.toLowerCase().indexOf("ipad");
  return !a &&
    navigator.userAgent.match(/Mac/) &&
    navigator.maxTouchPoints &&
    2 < navigator.maxTouchPoints
    ? !0
    : a;
}
function isMobile() {
  return isIpad() ? !0 : jQuery.browser.mobile;
}
function isIOS() {
  var a =
    "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(
      ";"
    );
  if (-1 !== navigator.userAgent.toLowerCase().indexOf("iphone"))
    return (s_bIsIphone = !0);
  for (; a.length; )
    if (navigator.platform === a.pop()) return (s_bIsIphone = !0);
  return (s_bIsIphone = !1);
}
function getIOSWindowHeight() {
  return (
    (document.documentElement.clientWidth / window.innerWidth) *
    window.innerHeight
  );
}
function getHeightOfIOSToolbars() {
  var a =
    (0 === window.orientation ? screen.height : screen.width) -
    getIOSWindowHeight();
  return 1 < a ? a : 0;
}
function getMobileOperatingSystem() {
  var a = navigator.userAgent || navigator.vendor || window.opera;
  return a.match(/iPad/i) || a.match(/iPhone/i) || a.match(/iPod/i)
    ? "ios"
    : a.match(/Android/i)
    ? "android"
    : "unknown";
}
function inIframe() {
  try {
    return window.self !== window.top;
  } catch (a) {
    return !0;
  }
}
function stopSound(a) {
  (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) || s_aSounds[a].stop();
}
function playSound(a, c, b) {
  return !1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile
    ? (s_aSounds[a].play(),
      s_aSounds[a].volume(c),
      s_aSounds[a].loop(b),
      s_aSounds[a])
    : null;
}
function setVolume(a, c) {
  (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) || s_aSounds[a].volume(c);
}
function setMute(a, c) {
  (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) || s_aSounds[c].mute(a);
}
function createBitmap(a, c, b) {
  var e = new createjs.Bitmap(a),
    h = new createjs.Shape();
  c && b
    ? h.graphics.beginFill("#fff").drawRect(0, 0, c, b)
    : h.graphics.beginFill("#ff0").drawRect(0, 0, a.width, a.height);
  e.hitArea = h;
  return e;
}
function createSprite(a, c, b, e, h, m) {
  a = null !== c ? new createjs.Sprite(a, c) : new createjs.Sprite(a);
  c = new createjs.Shape();
  c.graphics.beginFill("#000000").drawRect(-b, -e, h, m);
  a.hitArea = c;
  return a;
}
function randomFloatBetween(a, c, b) {
  "undefined" === typeof b && (b = 2);
  return parseFloat(Math.min(a + Math.random() * (c - a), c).toFixed(b));
}
function shuffle(a) {
  for (var c = a.length, b, e; 0 !== c; )
    (e = Math.floor(Math.random() * c)),
      --c,
      (b = a[c]),
      (a[c] = a[e]),
      (a[e] = b);
  return a;
}
function easeLinear(a, c, b, e) {
  return (b * a) / e + c;
}
function easeInQuad(a, c, b, e) {
  return b * (a /= e) * a + c;
}
function easeInSine(a, c, b, e) {
  return -b * Math.cos((a / e) * (Math.PI / 2)) + b + c;
}
function easeInCubic(a, c, b, e) {
  return b * (a /= e) * a * a + c;
}
function getTrajectoryPoint(a, c) {
  var b = new createjs.Point(),
    e = (1 - a) * (1 - a),
    h = a * a;
  b.x = e * c.start.x + 2 * (1 - a) * a * c.traj.x + h * c.end.x;
  b.y = e * c.start.y + 2 * (1 - a) * a * c.traj.y + h * c.end.y;
  return b;
}
function formatTime(a) {
  a /= 1e3;
  var c = Math.floor(a / 60);
  a = parseFloat(a - 60 * c).toFixed(1);
  var b = "";
  b = 10 > c ? b + ("0" + c + ":") : b + (c + ":");
  return 10 > a ? b + ("0" + a) : b + a;
}
function degreesToRadians(a) {
  return (a * Math.PI) / 180;
}
function checkRectCollision(a, c) {
  var b = getBounds(a, 0.9);
  var e = getBounds(c, 0.98);
  return calculateIntersection(b, e);
}
function calculateIntersection(a, c) {
  var b, e, h, m;
  var d = a.x + (b = a.width / 2);
  var g = a.y + (e = a.height / 2);
  var f = c.x + (h = c.width / 2);
  var l = c.y + (m = c.height / 2);
  d = Math.abs(d - f) - (b + h);
  g = Math.abs(g - l) - (e + m);
  return 0 > d && 0 > g
    ? ((d = Math.min(Math.min(a.width, c.width), -d)),
      (g = Math.min(Math.min(a.height, c.height), -g)),
      {
        x: Math.max(a.x, c.x),
        y: Math.max(a.y, c.y),
        width: d,
        height: g,
        rect1: a,
        rect2: c,
      })
    : null;
}
function getBounds(a, c) {
  var b = {
    x: Infinity,
    y: Infinity,
    width: 0,
    height: 0,
  };
  if (a instanceof createjs.Container) {
    b.x2 = -Infinity;
    b.y2 = -Infinity;
    var e = a.children,
      h = e.length,
      m;
    for (m = 0; m < h; m++) {
      var d = getBounds(e[m], 1);
      d.x < b.x && (b.x = d.x);
      d.y < b.y && (b.y = d.y);
      d.x + d.width > b.x2 && (b.x2 = d.x + d.width);
      d.y + d.height > b.y2 && (b.y2 = d.y + d.height);
    }
    Infinity == b.x && (b.x = 0);
    Infinity == b.y && (b.y = 0);
    Infinity == b.x2 && (b.x2 = 0);
    Infinity == b.y2 && (b.y2 = 0);
    b.width = b.x2 - b.x;
    b.height = b.y2 - b.y;
    delete b.x2;
    delete b.y2;
  } else {
    if (a instanceof createjs.Bitmap) {
      h = a.sourceRect || a.image;
      m = h.width * c;
      var g = h.height * c;
    } else if (a instanceof createjs.Sprite)
      if (
        a.spriteSheet._frames &&
        a.spriteSheet._frames[a.currentFrame] &&
        a.spriteSheet._frames[a.currentFrame].image
      ) {
        h = a.spriteSheet.getFrame(a.currentFrame);
        m = h.rect.width;
        g = h.rect.height;
        e = h.regX;
        var f = h.regY;
      } else (b.x = a.x || 0), (b.y = a.y || 0);
    else (b.x = a.x || 0), (b.y = a.y || 0);
    e = e || 0;
    m = m || 0;
    f = f || 0;
    g = g || 0;
    b.regX = e;
    b.regY = f;
    h = a.localToGlobal(0 - e, 0 - f);
    d = a.localToGlobal(m - e, g - f);
    m = a.localToGlobal(m - e, 0 - f);
    e = a.localToGlobal(0 - e, g - f);
    b.x = Math.min(Math.min(Math.min(h.x, d.x), m.x), e.x);
    b.y = Math.min(Math.min(Math.min(h.y, d.y), m.y), e.y);
    b.width = Math.max(Math.max(Math.max(h.x, d.x), m.x), e.x) - b.x;
    b.height = Math.max(Math.max(Math.max(h.y, d.y), m.y), e.y) - b.y;
  }
  return b;
}
function NoClickDelay(a) {
  this.element = a;
  window.Touch && this.element.addEventListener("touchstart", this, !1);
}
NoClickDelay.prototype = {
  handleEvent: function (a) {
    switch (a.type) {
      case "touchstart":
        this.onTouchStart(a);
        break;
      case "touchmove":
        this.onTouchMove(a);
        break;
      case "touchend":
        this.onTouchEnd(a);
    }
  },
  onTouchStart: function (a) {
    a.preventDefault();
    this.moved = !1;
    this.element.addEventListener("touchmove", this, !1);
    this.element.addEventListener("touchend", this, !1);
  },
  onTouchMove: function (a) {
    this.moved = !0;
  },
  onTouchEnd: function (a) {
    this.element.removeEventListener("touchmove", this, !1);
    this.element.removeEventListener("touchend", this, !1);
    if (!this.moved) {
      a = document.elementFromPoint(
        a.changedTouches[0].clientX,
        a.changedTouches[0].clientY
      );
      3 == a.nodeType && (a = a.parentNode);
      var c = document.createEvent("MouseEvents");
      c.initEvent("click", !0, !0);
      a.dispatchEvent(c);
    }
  },
};
(function () {
  function a(a) {
    var b = {
      focus: "visible",
      focusin: "visible",
      pageshow: "visible",
      blur: "hidden",
      focusout: "hidden",
      pagehide: "hidden",
    };
    a = a || window.event;
    a.type in b
      ? (document.body.className = b[a.type])
      : ((document.body.className = this[c] ? "hidden" : "visible"),
        "hidden" === document.body.className
          ? s_oMain.stopUpdate()
          : s_oMain.startUpdate());
  }
  var c = "hidden";
  c in document
    ? document.addEventListener("visibilitychange", a)
    : (c = "mozHidden") in document
    ? document.addEventListener("mozvisibilitychange", a)
    : (c = "webkitHidden") in document
    ? document.addEventListener("webkitvisibilitychange", a)
    : (c = "msHidden") in document
    ? document.addEventListener("msvisibilitychange", a)
    : "onfocusin" in document
    ? (document.onfocusin = document.onfocusout = a)
    : (window.onpageshow =
        window.onpagehide =
        window.onfocus =
        window.onblur =
          a);
})();
String.prototype.format = function () {
  var a = this,
    c;
  for (c in arguments) a = a.replace("{" + c + "}", arguments[c]);
  return a;
};
function ctlArcadeResume() {
  null !== s_oMain && s_oMain.startUpdate();
}
function ctlArcadePause() {
  null !== s_oMain && s_oMain.stopUpdate();
}
function getParamValue(a) {
  for (
    var c = window.location.search.substring(1).split("&"), b = 0;
    b < c.length;
    b++
  ) {
    var e = c[b].split("=");
    if (e[0] == a) return e[1];
  }
}
function saveItem(a, c) {
  s_bStorageAvailable && localStorage.setItem(a, c);
}
function getItem(a) {
  return s_bStorageAvailable ? localStorage.getItem(a) : null;
}
function fullscreenHandler() {
  ENABLE_FULLSCREEN &&
    screenfull.isEnabled &&
    ((s_bFullscreen = screenfull.isFullscreen),
    null !== s_oInterface && s_oInterface.resetFullscreenBut(),
    null !== s_oMenu && s_oMenu.resetFullscreenBut(),
    null !== s_oColourChoose && s_oColourChoose.resetFullscreenBut(),
    null !== s_oPlayersChoose && s_oPlayersChoose.resetFullscreenBut(),
    null !== s_oModeChoose && s_oModeChoose.resetFullscreenBut(),
    null !== s_oModeSelection && s_oModeSelection.resetFullscreenBut());
}
if (screenfull.isEnabled)
  screenfull.on("change", function () {
    s_bFullscreen = screenfull.isFullscreen;
    null !== s_oInterface && s_oInterface.resetFullscreenBut();
    null !== s_oMenu && s_oMenu.resetFullscreenBut();
    null !== s_oColourChoose && s_oColourChoose.resetFullscreenBut();
    null !== s_oPlayersChoose && s_oPlayersChoose.resetFullscreenBut();
    null !== s_oModeChoose && s_oModeChoose.resetFullscreenBut();
    null !== s_oModeSelection && s_oModeSelection.resetFullscreenBut();
  });
function CSpriteLibrary() {
  var a = {},
    c,
    b,
    e,
    h,
    m,
    d;
  this.init = function (a, f, l) {
    c = {};
    e = b = 0;
    h = a;
    m = f;
    d = l;
  };
  this.addSprite = function (g, d) {
    if (!a.hasOwnProperty(g)) {
      var f = new Image();
      a[g] = c[g] = {
        szPath: d,
        oSprite: f,
        bLoaded: !1,
      };
      b++;
    }
  };
  this.getSprite = function (b) {
    return a.hasOwnProperty(b) ? a[b].oSprite : null;
  };
  this._onSpritesLoaded = function () {
    b = 0;
    m.call(d);
  };
  this._onSpriteLoaded = function () {
    h.call(d);
    ++e === b && this._onSpritesLoaded();
  };
  this.loadSprites = function () {
    for (var a in c)
      (c[a].oSprite.oSpriteLibrary = this),
        (c[a].oSprite.szKey = a),
        (c[a].oSprite.onload = function () {
          this.oSpriteLibrary.setLoaded(this.szKey);
          this.oSpriteLibrary._onSpriteLoaded(this.szKey);
        }),
        (c[a].oSprite.onerror = function (a) {
          var b = a.currentTarget;
          setTimeout(function () {
            c[b.szKey].oSprite.src = c[b.szKey].szPath;
          }, 500);
        }),
        (c[a].oSprite.src = c[a].szPath);
  };
  this.setLoaded = function (b) {
    a[b].bLoaded = !0;
  };
  this.isLoaded = function (b) {
    return a[b].bLoaded;
  };
  this.getNumSprites = function () {
    return b;
  };
}
var CANVAS_WIDTH = 1360,
  CANVAS_HEIGHT = 640,
  CANVAS_WIDTH_HALF = 0.5 * CANVAS_WIDTH,
  CANVAS_HEIGHT_HALF = 0.5 * CANVAS_HEIGHT,
  EDGEBOARD_X = 250,
  EDGEBOARD_Y = 5,
  FPS = 30,
  FPS_TIME = 1e3 / FPS,
  DISABLE_SOUND_MOBILE = !1,
  PRIMARY_FONT = "walibi",
  PRIMARY_FONT_COLOR = "#ffffff",
  SECONDARY_FONT_COLOR = "#004080",
  THIRD_FONT_COLOR = "#000000",
  STATE_LOADING = 0,
  STATE_MENU = 1,
  STATE_HELP = 1,
  STATE_GAME = 3,
  ON_MOUSE_DOWN = 0,
  ON_MOUSE_UP = 1,
  ON_BACK_MENU = 6,
  ON_CHECK = 7,
  ON_RESTART = 8,
  ENABLE_FULLSCREEN,
  ENABLE_CHECK_ORIENTATION,
  SOUNDTRACK_VOLUME_IN_GAME = 0.3,
  PERFECT_SCORE,
  MODE_SNAKES = 0,
  MODE_CHUTES = 1,
  MSG_GOOD = 0,
  MSG_BAD = 1,
  MSG_DICE = 2,
  HUMAN_VS_HUMAN = 0,
  HUMAN_VS_CPU = 1,
  LAST_SQUARE = 100,
  LADDERS_SQUARES = [1, 4, 9, 21, 28, 36, 51, 71, 80],
  OBSTACLES_SQUARES = [16, 47, 49, 56, 62, 64, 87, 93, 95, 98],
  OBSTACLES_ANGLES = [100, 290, 70, 240, 320, 80, 330, 290, 90, 90],
  OBSTACLES_MOVEMENT_SQUARES = [
    [16, 6],
    [47, 26],
    [49, 11],
    [56, 53],
    [62, 19],
    [64, 60],
    [87, 24],
    [93, 73],
    [95, 75],
    [98, 78],
  ],
  LADDER_MOVEMENT_SQUARES = [
    [1, 38],
    [4, 14],
    [9, 31],
    [21, 42],
    [28, 84],
    [36, 44],
    [51, 67],
    [71, 91],
    [80, 100],
  ],
  BOARD_SQUARES;
BOARD_SQUARES = [
  [334, 565],
  [435, 565],
  [490, 565],
  [540, 565],
  [600, 565],
  [655, 565],
  [710, 565],
  [765, 565],
  [820, 565],
  [875, 565],
  [925, 565],
  [925, 510],
  [875, 510],
  [820, 510],
  [765, 510],
  [710, 510],
  [655, 510],
  [600, 510],
  [540, 510],
  [490, 510],
  [435, 510],
  [435, 455],
  [490, 455],
  [540, 455],
  [600, 455],
  [655, 455],
  [710, 455],
  [765, 455],
  [820, 455],
  [875, 455],
  [925, 455],
  [925, 400],
  [875, 400],
  [820, 400],
  [765, 400],
  [710, 400],
  [655, 400],
  [600, 400],
  [540, 400],
  [490, 400],
  [435, 400],
  [435, 345],
  [490, 345],
  [540, 345],
  [600, 345],
  [655, 345],
  [710, 345],
  [765, 345],
  [820, 345],
  [875, 345],
  [925, 345],
  [925, 290],
  [875, 290],
  [820, 290],
  [765, 290],
  [710, 290],
  [655, 290],
  [600, 290],
  [540, 290],
  [490, 290],
  [435, 290],
  [435, 235],
  [490, 235],
  [540, 235],
  [600, 235],
  [655, 235],
  [710, 235],
  [765, 235],
  [820, 235],
  [875, 235],
  [925, 235],
  [925, 180],
  [875, 180],
  [820, 180],
  [765, 180],
  [710, 180],
  [655, 180],
  [600, 180],
  [540, 180],
  [490, 180],
  [435, 180],
  [435, 125],
  [490, 125],
  [540, 125],
  [600, 125],
  [655, 125],
  [710, 125],
  [765, 125],
  [820, 125],
  [875, 125],
  [925, 125],
  [925, 70],
  [875, 70],
  [820, 70],
  [765, 70],
  [710, 70],
  [655, 70],
  [600, 70],
  [540, 70],
  [490, 70],
  [435, 70],
];
var aColumn = [370, 340, 310],
  aRow = [530, 580],
  ZERO_SQUARE_POSITIONS = [
    [aColumn[0], aRow[0]],
    [aColumn[0], aRow[1]],
    [aColumn[1], aRow[0]],
    [aColumn[1], aRow[1]],
    [aColumn[2], aRow[0]],
    [aColumn[2], aRow[1]],
  ],
  CHUTES_COORDS_16 = [
    [635.8, 507.8],
    [589.7, 528.3],
    [577.3, 545.8],
    [595.15, 564.3],
    [647.7, 568.8],
    [696.15, 576.25],
  ],
  CHUTES_COORDS_47 = [
    [785.25, 348.3],
    [812.15, 367.8],
    [820.25, 388.3],
    [804.1, 409.3],
    [759.65, 423.8],
    [723.65, 441.75],
  ],
  CHUTES_COORDS_49 = [
    [878.75, 364.3],
    [892.15, 383.3],
    [898.75, 411.8],
    [904.1, 443.3],
    [913.65, 469.8],
    [930.15, 497.75],
  ],
  CHUTES_COORDS_56 = [
    [666.3, 276.8],
    [702.25, 276.8],
    [729.75, 286.8],
    [759.1, 295.3],
    [798.15, 295.3],
  ],
  CHUTES_COORDS_62 = [
    [508.3, 239.8],
    [541.8, 282.5],
    [550.3, 298.8],
    [545.65, 319.3],
    [510.7, 365.9],
    [501.6, 387.4],
    [506.2, 410.4],
    [541.8, 451.75],
    [548.7, 480.75],
    [501.6, 519.25],
  ],
  CHUTES_COORDS_64 = [
    [582.3, 228.3],
    [561.7, 229.8],
    [541.8, 241.7],
    [519.65, 258.8],
    [503.2, 273.4],
    [477.6, 285.4],
    [447.2, 295.9],
  ],
  CHUTES_COORDS_87 = [
    [767.75, 147.3],
    [750.15, 195.5],
    [736.75, 208.9],
    [647.65, 251.3],
    [629.2, 270.9],
    [623.6, 297.4],
    [640.7, 326.4],
    [677.15, 350.25],
    [693.15, 368.25],
    [694.65, 390.25],
    [683.65, 411.25],
    [663.75, 430.25],
    [621.65, 449.75],
  ],
  CHUTES_COORDS_93 = [
    [838.75, 70.85],
    [880.65, 82.5],
    [885.15, 96.9],
    [880.65, 112.3],
    [858.7, 133.9],
    [835.6, 153.4],
    [822.2, 170.9],
  ],
  CHUTES_COORDS_95 = [
    [683.75, 63.35],
    [649.2, 80.4],
    [643.7, 95.9],
    [653.6, 108.3],
    [702.2, 133.9],
    [714.1, 151.9],
    [711.7, 172.4],
  ],
  CHUTES_COORDS_98 = [
    [516.75, 62.35],
    [482.2, 79.4],
    [476.7, 94.9],
    [486.6, 107.3],
    [535.2, 132.9],
    [547.1, 150.9],
    [544.7, 171.4],
  ],
  PLAYER_SPRITE_WIDTH = [58, 50, 60, 60, 60, 52],
  PLAYER_SPRITE_HEIGHT = [70, 72, 70, 86, 70, 70],
  STEP_LENGTH = 10,
  LADDERS_SPEED = 1e3,
  SNAKE_SPEED = 800,
  TEXT_PLAYER_COLOUR = "SELECT P{0} COLOUR",
  TEXT_HELP_1 =
    "REACH THE END OF THE BOARD LAUNCHING THE DICE. ROLLING A 6 WILL GIVE THE PLAYER AN EXTRA DICE",
  TEXT_HELP2_PT1 = "LADDER: YOU GO UP!",
  TEXT_HELP2_PT2 = ": YOU GO DOWN!",
  TEXT_MODE0 = "SNAKE",
  TEXT_MODE1 = "CHUTE",
  TEXT_EXTRA_DICE = "EXTRA DICE!",
  TEXT_SELECT_MODE = "SELECT GAME MODE",
  TEXT_SELECT_OPPONENTS = "SELECT OPPONENTS",
  TEXT_SELECT_PLAYERS = "SELECT PLAYERS",
  TEXT_SELECT_COLOUR = "SELECT YOUR COLOUR",
  TEXT_GAMES_PLAYED = "GAMES PLAYED",
  TEXT_GAMES_WON = "GAMES WON",
  TEXT_WIN = "YOU WON",
  TEXT_LOSE = "YOU LOSE",
  TEXT_PAUSE = "PAUSE",
  TEXT_ARE_SURE = "ARE YOU SURE?",
  TEXT_MOTIVATIONAL0 = "GREAT!",
  TEXT_MOTIVATIONAL1 = "COOL!",
  TEXT_MOTIVATIONAL2 = "NICE!",
  TEXT_MOTIVATIONAL3 = "SUPER!",
  TEXT_MOTIVATIONAL4 = "GOOD!",
  TEXT_DEMOTIVATIONAL0 = "BAD ROLL!",
  TEXT_DEMOTIVATIONAL1 = "NOOOO!",
  TEXT_DEMOTIVATIONAL2 = "SORRY...",
  TEXT_DEMOTIVATIONAL3 = "UNLUCKY!",
  TEXT_DEMOTIVATIONAL4 = "BAD RESULT!",
  TEXT_PRELOADER_CONTINUE = "START",
  TEXT_CREDITS_DEVELOPED = "Developed by",
  TEXT_LINK = "afzalimdad9.vercel.app",
  TEXT_ERR_LS =
    "YOUR WEB BROWSER DOES NOT SUPPORT LOCAL STORAGE. IF YOU'RE USING SAFARI, IT MAY BE RELATED TO PRIVATE BROWSING. AS A RESULT, SOME INFO MAY NOT BE SAVED OR SOME FEATURES MAY NOT BE AVAILABLE.",
  TEXT_SHARE_IMAGE = "200x200.jpg",
  TEXT_SHARE_TITLE = "Congratulations!",
  TEXT_SHARE_MSG1 = "You collected <strong>",
  TEXT_SHARE_MSG2 =
    " points</strong>!<br><br>Share your score with your friends!",
  TEXT_SHARE_SHARE1 = "My score is ",
  TEXT_SHARE_SHARE2 = " points! Can you do better?";
function CPreloader() {
  var a, c, b, e, h, m, d, g, f, l;
  this._init = function () {
    s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
    s_oSpriteLibrary.addSprite("progress_bar", "./sprites/progress_bar.png");
    s_oSpriteLibrary.addSprite("200x200", "./sprites/200x200.jpg");
    s_oSpriteLibrary.addSprite("but_start", "./sprites/but_start.png");
    s_oSpriteLibrary.loadSprites();
    l = new createjs.Container();
    s_oStage.addChild(l);
  };
  this.unload = function () {
    l.removeAllChildren();
    f.unload();
  };
  this._onImagesLoaded = function () {};
  this._onAllImagesLoaded = function () {
    this.attachSprites();
    s_oMain.preloaderReady();
  };
  this.attachSprites = function () {
    var p = new createjs.Shape();
    p.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    l.addChild(p);
    p = s_oSpriteLibrary.getSprite("200x200");
    d = createBitmap(p);
    d.regX = 0.5 * p.width;
    d.regY = 0.5 * p.height;
    d.x = CANVAS_WIDTH_HALF;
    d.y = CANVAS_HEIGHT_HALF - 100;
    l.addChild(d);
    g = new createjs.Shape();
    g.graphics
      .beginFill("rgba(0,0,0,0.01)")
      .drawRoundRect(d.x - 100, d.y - 100, 200, 200, 10);
    l.addChild(g);
    d.mask = g;
    p = s_oSpriteLibrary.getSprite("progress_bar");
    e = createBitmap(p);
    e.x = CANVAS_WIDTH_HALF - p.width / 2;
    e.y = CANVAS_HEIGHT_HALF + 130;
    l.addChild(e);
    a = p.width;
    c = p.height;
    h = new createjs.Shape();
    h.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(e.x, e.y, 1, c);
    l.addChild(h);
    e.mask = h;
    b = new createjs.Text("", "30px " + PRIMARY_FONT, PRIMARY_FONT_COLOR);
    b.x = CANVAS_WIDTH_HALF;
    b.y = CANVAS_HEIGHT_HALF + 180;
    b.textBaseline = "alphabetic";
    b.textAlign = "center";
    l.addChild(b);
    p = s_oSpriteLibrary.getSprite("but_start");
    f = new CTextButton(
      CANVAS_WIDTH_HALF,
      CANVAS_HEIGHT_HALF + 80,
      p,
      TEXT_PRELOADER_CONTINUE,
      "Arial",
      "#000",
      "bold 50",
      l
    );
    f.addEventListener(ON_MOUSE_UP, this._onButStartRelease, this);
    f.setVisible(!1);
    m = new createjs.Shape();
    m.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    l.addChild(m);
    createjs.Tween.get(m)
      .to(
        {
          alpha: 0,
        },
        500
      )
      .call(function () {
        createjs.Tween.removeTweens(m);
        l.removeChild(m);
      });
  };
  this._onButStartRelease = function () {
    s_oMain._onRemovePreloader();
  };
  this.refreshLoader = function (d) {
    b.text = d + "%";
    100 === d &&
      (s_oMain._onRemovePreloader(),
      f.setVisible(!1),
      (b.visible = !1),
      (e.visible = !1));
    h.graphics.clear();
    d = Math.floor((d * a) / 100);
    h.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(e.x, e.y, d, c);
  };
  this._init();
}
function CMain(a) {
  var c,
    b = 0,
    e = 0,
    h = STATE_LOADING,
    m,
    d;
  this.initContainer = function () {
    var a = document.getElementById("canvas");
    s_oStage = new createjs.Stage(a);
    createjs.Touch.enable(s_oStage, !0);
    s_oStage.preventSelection = !1;
    a.opacity = 0.5;
    s_bMobile = isMobile();
    !1 === s_bMobile &&
      (s_oStage.enableMouseOver(20),
      $("body").on("contextmenu", "#canvas", function (a) {
        return !1;
      }));
    s_iPrevTime = new Date().getTime();
    createjs.Ticker.addEventListener("tick", this._update);
    createjs.Ticker.framerate = FPS;
    navigator.userAgent.match(/Windows Phone/i) && (DISABLE_SOUND_MOBILE = !0);
    s_oSpriteLibrary = new CSpriteLibrary();
    m = new CPreloader;
    c = !0;
  };
  this.soundLoaded = function () {
    b++;
    m.refreshLoader(Math.floor((b / e) * 100));
  };
  this._initSounds = function () {
    Howler.mute(!s_bAudioActive);
    s_aSoundsInfo = [];
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "soundtrack",
      loop: !0,
      volume: 1,
      ingamename: "soundtrack",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "but_press",
      loop: !1,
      volume: 1,
      ingamename: "click",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "game_win",
      loop: !1,
      volume: 1,
      ingamename: "game_win",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "game_over",
      loop: !1,
      volume: 1,
      ingamename: "game_over",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "bonus",
      loop: !1,
      volume: 1,
      ingamename: "bonus",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "malus",
      loop: !1,
      volume: 1,
      ingamename: "malus",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "step_land",
      loop: !1,
      volume: 1,
      ingamename: "step_land",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "ladder",
      loop: !1,
      volume: 1,
      ingamename: "ladder",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "dices",
      loop: !1,
      volume: 1,
      ingamename: "dices",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "snake",
      loop: !1,
      volume: 1,
      ingamename: "snake",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "eat",
      loop: !1,
      volume: 1,
      ingamename: "eat",
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "chute",
      loop: !1,
      volume: 1,
      ingamename: "chute",
    });
    e += s_aSoundsInfo.length;
    s_aSounds = [];
    for (var a = 0; a < s_aSoundsInfo.length; a++)
      this.tryToLoadSound(s_aSoundsInfo[a], !1);
  };
  this.tryToLoadSound = function (a, b) {
    setTimeout(
      function () {
        s_aSounds[a.ingamename] = new Howl({
          src: [a.path + a.filename + ".mp3"],
          autoplay: !1,
          preload: !0,
          loop: a.loop,
          volume: a.volume,
          onload: s_oMain.soundLoaded,
          onloaderror: function (a, b) {
            for (var d = 0; d < s_aSoundsInfo.length; d++)
              if (a === s_aSounds[s_aSoundsInfo[d].ingamename]._sounds[0]._id) {
                s_oMain.tryToLoadSound(s_aSoundsInfo[d], !0);
                break;
              }
          },
          onplayerror: function (a) {
            for (var b = 0; b < s_aSoundsInfo.length; b++)
              if (a === s_aSounds[s_aSoundsInfo[b].ingamename]._sounds[0]._id) {
                s_aSounds[s_aSoundsInfo[b].ingamename].once(
                  "unlock",
                  function () {
                    s_aSounds[s_aSoundsInfo[b].ingamename].play();
                    "soundtrack" === s_aSoundsInfo[b].ingamename &&
                      null !== s_oGame &&
                      setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);
                  }
                );
                break;
              }
          },
        });
      },
      b ? 200 : 0
    );
  };
  this._loadImages = function () {
    s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
    for (var a = 0; 6 > a; a++)
      s_oSpriteLibrary.addSprite(
        "player_1_" + a,
        "./sprites/players1/player_" + a + ".png"
      );
    for (a = 1; 7 > a; a++)
      s_oSpriteLibrary.addSprite("dice_" + a, "./sprites/dice_" + a + ".png");
    for (a = 0; a < LADDERS_SQUARES.length; a++)
      s_oSpriteLibrary.addSprite(
        "ladder_" + LADDERS_SQUARES[a],
        "./sprites/ladders/ladder_" + +LADDERS_SQUARES[a] + ".png"
      );
    for (a = 0; a < OBSTACLES_SQUARES.length; a++)
      s_oSpriteLibrary.addSprite(
        "snake_" + OBSTACLES_SQUARES[a],
        "./sprites/snakes/snake_" + +OBSTACLES_SQUARES[a] + ".png"
      ),
        s_oSpriteLibrary.addSprite(
          "chute_" + OBSTACLES_SQUARES[a],
          "./sprites/chutes/chute_" + +OBSTACLES_SQUARES[a] + ".png"
        );
    for (a = 0; 2 > a; a++)
      s_oSpriteLibrary.addSprite(
        "but_mode" + a,
        "./sprites/but_mode" + a + ".png"
      ),
        s_oSpriteLibrary.addSprite(
          "bg_game" + a,
          "./sprites/bg_game" + a + ".jpg"
        ),
        s_oSpriteLibrary.addSprite("turns" + a, "./sprites/turns" + a + ".png"),
        s_oSpriteLibrary.addSprite(
          "playerbig_" + a,
          "./sprites/playerbig_" + a + ".png"
        ),
        s_oSpriteLibrary.addSprite(
          "but_play" + a,
          "./sprites/but_play" + a + ".png"
        );
    s_oSpriteLibrary.addSprite("logo_menu", "./sprites/logo_menu.png");
    s_oSpriteLibrary.addSprite("but_play", "./sprites/but_play.png");
    s_oSpriteLibrary.addSprite("but_dice", "./sprites/but_dice.png");
    s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
    s_oSpriteLibrary.addSprite("but_settings", "./sprites/but_settings.png");
    s_oSpriteLibrary.addSprite("but_help", "./sprites/but_help.png");
    s_oSpriteLibrary.addSprite("but_info", "./sprites/but_info.png");
    s_oSpriteLibrary.addSprite("but_continue", "./sprites/but_skip_small.png");
    s_oSpriteLibrary.addSprite(
      "but_fullscreen",
      "./sprites/but_fullscreen.png"
    );
    s_oSpriteLibrary.addSprite("but_yes", "./sprites/but_yes.png");
    s_oSpriteLibrary.addSprite("but_no", "./sprites/but_no.png");
    s_oSpriteLibrary.addSprite(
      "but_skip_small",
      "./sprites/but_skip_small.png"
    );
    s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");
    s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
    s_oSpriteLibrary.addSprite("bg_help", "./sprites/bg_help.png");
    s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
    s_oSpriteLibrary.addSprite("but_home", "./sprites/but_home.png");
    s_oSpriteLibrary.addSprite("but_check", "./sprites/but_check.png");
    s_oSpriteLibrary.addSprite("but_restart", "./sprites/but_restart.png");
    s_oSpriteLibrary.addSprite("logo_ctl", "./sprites/logo_ctl.png");
    s_oSpriteLibrary.addSprite("launch_dice", "./sprites/launch_dices.png");
    s_oSpriteLibrary.addSprite("player_shadow", "./sprites/player_shadow.png");
    s_oSpriteLibrary.addSprite("turn_panel", "./sprites/turn_panel.png");
    s_oSpriteLibrary.addSprite("arrow", "./sprites/arrow.png");
    s_oSpriteLibrary.addSprite(
      "help_ladder_ch",
      "./sprites/help_ladder_ch.png"
    );
    s_oSpriteLibrary.addSprite(
      "help_ladder_sn",
      "./sprites/help_ladder_sn.png"
    );
    s_oSpriteLibrary.addSprite("help_snake", "./sprites/help_snake.png");
    s_oSpriteLibrary.addSprite("help_chute", "./sprites/help_chute.png");
    s_oSpriteLibrary.addSprite(
      "help_ladder_anim_sn",
      "./sprites/help_ladder_anim_sn.png"
    );
    s_oSpriteLibrary.addSprite(
      "help_ladder_anim_ch",
      "./sprites/help_ladder_anim_ch.png"
    );
    s_oSpriteLibrary.addSprite(
      "help_chute_anim",
      "./sprites/help_chute_anim.png"
    );
    s_oSpriteLibrary.addSprite("players_0", "./sprites/players_0.png");
    s_oSpriteLibrary.addSprite("vs_man_panel", "./sprites/vs_man_panel.png");
    s_oSpriteLibrary.addSprite("vs_pc_panel", "./sprites/vs_pc_panel.png");
    e += s_oSpriteLibrary.getNumSprites();
    s_oSpriteLibrary.loadSprites();
  };
  this._onImagesLoaded = function () {
    b++;
    m.refreshLoader(Math.floor((b / e) * 100));
  };
  this._onAllImagesLoaded = function () {};
  this.onAllPreloaderImagesLoaded = function () {
    this._loadImages();
  };
  this.preloaderReady = function () {
    this._loadImages();
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) || this._initSounds();
    c = !0;
  };
  this._onRemovePreloader = function () {
    try {
      saveItem("ls_available", "ok");
    } catch (g) {
      s_bStorageAvailable = !1;
    }
    m.unload();
    s_oSoundtrack = playSound("soundtrack", 1, !0);
    this.gotoMenu();
  };
  this.gotoMenu = function () {
    new CMenu();
    h = STATE_MENU;
  };
  this.gotoModeChoose = function () {
    new CModeChoose();
    h = STATE_MENU;
  };
  this.gotoModeSelection = function (a) {
    new CModeSelection(a);
    h = STATE_MENU;
  };
  this.gotoPlayersChoose = function (a, b) {
    s_iModeGame = a;
    new CPlayersChoose(b);
    h = STATE_MENU;
  };
  this.gotoColourChoose = function (a, b) {
    new CColourChoose(a, b);
    h = STATE_MENU;
  };
  this.gotoGame = function (a, b, c, e) {
    d = new CGame(a, b, c, e);
    h = STATE_GAME;
  };
  this.gotoHelp = function () {
    new CHelp();
    h = STATE_HELP;
  };
  this.stopUpdate = function () {
    c = !1;
    createjs.Ticker.paused = !0;
    $("#block_game").css("display", "block");
    s_bAudioActive && Howler.mute(!0);
  };
  this.startUpdate = function () {
    s_iPrevTime = new Date().getTime();
    c = !0;
    createjs.Ticker.paused = !1;
    $("#block_game").css("display", "none");
    s_bAudioActive && Howler.mute(!1);
  };
  this._update = function (a) {
    if (!1 !== c) {
      var b = new Date().getTime();
      s_iTimeElaps = b - s_iPrevTime;
      s_iCntTime += s_iTimeElaps;
      s_iCntFps++;
      s_iPrevTime = b;
      1e3 <= s_iCntTime &&
        ((s_iCurFps = s_iCntFps), (s_iCntTime -= 1e3), (s_iCntFps = 0));
      h === STATE_GAME && d.update();
      s_oStage.update(a);
    }
  };
  s_oMain = this;
  ENABLE_FULLSCREEN = a.fullscreen;
  ENABLE_CHECK_ORIENTATION = a.check_orientation;
  PERFECT_SCORE = a.perfect_score;
  s_bAudioActive = a.audio_enable_on_startup;
  this.initContainer();
}
var s_bMobile,
  s_bAudioActive = !1,
  s_iCntTime = 0,
  s_bFullscreen = !1,
  s_iTimeElaps = 0,
  s_iPrevTime = 0,
  s_iCntFps = 0,
  s_iCurFps = 0,
  s_oPhysicsController,
  s_oAdsLevel = 1,
  s_oDrawLayer,
  s_oStage,
  s_oScrollStage,
  s_oMain,
  s_oSpriteLibrary,
  s_oSoundTrack,
  s_aSoundsInfo,
  s_aSounds,
  s_bStorageAvailable = !0,
  s_aGamesWon = 0,
  s_aGamesPlayed = 0,
  s_iModeGame;
function CModeSelection(a) {
  var c, b, e, h, m, d, g, f, l, p, q, u, k;
  this._init = function () {
    k = a;
    var t =
      a === MODE_SNAKES
        ? s_oSpriteLibrary.getSprite("bg_game0")
        : s_oSpriteLibrary.getSprite("bg_game1");
    m = createBitmap(t);
    m.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(m);
    f = new createjs.Shape();
    f.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    f.alpha = 0.5;
    s_oStage.addChild(f);
    t = s_oSpriteLibrary.getSprite("msg_box");
    d = createBitmap(t);
    d.x = 0.5 * CANVAS_WIDTH;
    d.y = 0.5 * CANVAS_HEIGHT;
    d.regX = 0.5 * t.width;
    d.regY = 0.5 * t.height;
    s_oStage.addChild(d);
    g = new createjs.Container();
    g.x = 682;
    g.y = 135;
    s_oStage.addChild(g);
    new CTLText(
      g,
      -250,
      40,
      500,
      40,
      40,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_OPPONENTS,
      !0,
      !0,
      !1,
      !1
    ).setOutline(5);
    new CTLText(
      g,
      -250,
      40,
      500,
      40,
      40,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_OPPONENTS,
      !0,
      !0,
      !1,
      !1
    );
    var v = CANVAS_HEIGHT_HALF + 20;
    t = s_oSpriteLibrary.getSprite("vs_man_panel");
    q = new CGfxButton(CANVAS_WIDTH_HALF - 120, v, t, s_oStage);
    q.addEventListenerWithParams(
      ON_MOUSE_UP,
      this._onButModeRelease,
      this,
      HUMAN_VS_HUMAN
    );
    t = s_oSpriteLibrary.getSprite("vs_pc_panel");
    u = new CGfxButton(CANVAS_WIDTH_HALF + 120, v, t, s_oStage);
    u.addEventListenerWithParams(
      ON_MOUSE_UP,
      this._onButModeRelease,
      this,
      HUMAN_VS_CPU
    );
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile)
      (t = s_oSpriteLibrary.getSprite("audio_icon")),
        (e = CANVAS_WIDTH - t.width / 2 - 50),
        (h = t.height / 2 + 10),
        (l = new CToggle(e, h, t, s_bAudioActive, s_oStage)),
        l.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
    t = s_oSpriteLibrary.getSprite("but_exit");
    c = CANVAS_WIDTH - t.height / 2 - 10;
    b = t.height / 2 + 10;
    p = new CGfxButton(c, b, t, s_oStage);
    p.addEventListener(ON_MOUSE_UP, this._onExit, this);
    f = new createjs.Shape();
    f.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(f);
    createjs.Tween.get(f)
      .to(
        {
          alpha: 0,
        },
        1e3
      )
      .call(function () {
        f.visible = !1;
      });
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function (a, d) {
    p.setPosition(c - a, b);
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) ||
      l.setPosition(e - a, h);
  };
  this.unload = function () {
    p.unload();
    p = null;
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile) l.unload(), (l = null);
    s_oStage.removeAllChildren();
    createjs.Tween.removeAllTweens();
    s_oModeSelection = null;
  };
  this._onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onButModeRelease = function (a) {
    this.unload();
    s_oMain.gotoPlayersChoose(k, a);
  };
  s_oModeSelection = this;
  this._init();
}
var s_oModeSelection = null;
function CDiceButton(a, c, b) {
  var e,
    h,
    m,
    d,
    g,
    f,
    l,
    p,
    q = !1;
  this._init = function (a, b) {
    e = [];
    h = [];
    m = [];
    var c = {
      images: [s_oSpriteLibrary.getSprite("but_dice")],
      framerate: 0,
      frames: {
        width: 84,
        height: 87,
        regX: 42,
        regY: 43,
      },
      animations: {
        on: [0, 0, !1],
        off: [1, 1, !1],
      },
    };
    c = new createjs.SpriteSheet(c);
    f = createSprite(c, "on", 42, 42, 84, 83);
    f.x = a;
    f.y = b;
    f.gotoAndPlay("off");
    g = d = 1;
    u.addChild(f);
    this._initListener();
  };
  this.unload = function () {
    f.off("mousedown", l);
    f.off("pressup", p);
    u.removeChild(f);
  };
  this.toggle = function (a) {
    a
      ? (f.gotoAndPlay("on"), (q = !1), s_bMobile || (f.cursor = "pointer"))
      : (f.gotoAndPlay("off"), (q = !0), s_bMobile || (f.cursor = "normal"));
  };
  this.setVisible = function (a) {
    f.visible = a;
  };
  this.setCursorType = function (a) {
    f.cursor = a;
  };
  this._initListener = function () {
    l = f.on("mousedown", this.buttonDown);
    p = f.on("pressup", this.buttonRelease);
  };
  this.addEventListener = function (a, b, d) {
    e[a] = b;
    h[a] = d;
  };
  this.addEventListenerWithParams = function (a, b, d, c) {
    e[a] = b;
    h[a] = d;
    m[a] = c;
  };
  this.buttonRelease = function () {
    q ||
      ((f.scaleX = 0 < d ? 1 : -1),
      (f.scaleY = 1),
      playSound("click", 1, !1),
      e[ON_MOUSE_UP] && e[ON_MOUSE_UP].call(h[ON_MOUSE_UP], m[ON_MOUSE_UP]));
  };
  this.buttonDown = function () {
    q ||
      ((f.scaleX = 0 < d ? 0.9 : -0.9),
      (f.scaleY = 0.9),
      e[ON_MOUSE_DOWN] &&
        e[ON_MOUSE_DOWN].call(h[ON_MOUSE_DOWN], m[ON_MOUSE_DOWN]));
  };
  this.rotation = function (a) {
    f.rotation = a;
  };
  this.getButton = function () {
    return f;
  };
  this.setPosition = function (a, b) {
    f.x = a;
    f.y = b;
  };
  this.setX = function (a) {
    f.x = a;
  };
  this.setY = function (a) {
    f.y = a;
  };
  this.getButtonImage = function () {
    return f;
  };
  this.block = function (a) {
    q = a;
    f.scaleX = d;
    f.scaleY = g;
  };
  this.setScaleX = function (a) {
    d = f.scaleX = a;
  };
  this.getX = function () {
    return f.x;
  };
  this.getY = function () {
    return f.y;
  };
  this.pulseAnimation = function () {
    createjs.Tween.get(f, {
      loop: !0,
    })
      .to(
        {
          scaleX: 0.9 * d,
          scaleY: 0.9 * g,
        },
        850,
        createjs.Ease.quadOut
      )
      .to(
        {
          scaleX: d,
          scaleY: g,
        },
        650,
        createjs.Ease.quadIn
      );
  };
  this.trebleAnimation = function () {
    createjs.Tween.get(f)
      .to(
        {
          rotation: 5,
        },
        75,
        createjs.Ease.quadOut
      )
      .to(
        {
          rotation: -5,
        },
        140,
        createjs.Ease.quadIn
      )
      .to(
        {
          rotation: 0,
        },
        75,
        createjs.Ease.quadIn
      )
      .wait(750)
      .call(function () {
        k.trebleAnimation();
      });
  };
  this.removeAllTweens = function () {
    createjs.Tween.removeTweens(f);
  };
  var u = b;
  this._init(a, c);
  var k = this;
  return this;
}
function CToggle(a, c, b, e, h) {
  var m, d, g, f, l, p;
  this._init = function (a, b, c, e) {
    d = [];
    g = [];
    var k = new createjs.SpriteSheet({
      images: [c],
      frames: {
        width: c.width / 2,
        height: c.height,
        regX: c.width / 2 / 2,
        regY: c.height / 2,
      },
      animations: {
        state_true: [0],
        state_false: [1],
      },
    });
    m = e;
    f = createSprite(
      k,
      "state_" + m,
      c.width / 2 / 2,
      c.height / 2,
      c.width / 2,
      c.height
    );
    f.x = a;
    f.y = b;
    f.stop();
    s_bMobile || (f.cursor = "pointer");
    q.addChild(f);
    this._initListener();
  };
  this.unload = function () {
    f.off("mousedown", l);
    f.off("pressup", p);
    q.removeChild(f);
  };
  this._initListener = function () {
    l = f.on("mousedown", this.buttonDown);
    p = f.on("pressup", this.buttonRelease);
  };
  this.addEventListener = function (a, b, c) {
    d[a] = b;
    g[a] = c;
  };
  this.setCursorType = function (a) {
    f.cursor = a;
  };
  this.setActive = function (a) {
    m = a;
    f.gotoAndStop("state_" + m);
  };
  this.buttonRelease = function () {
    f.scaleX = 1;
    f.scaleY = 1;
    playSound("click", 1, !1);
    m = !m;
    f.gotoAndStop("state_" + m);
    d[ON_MOUSE_UP] && d[ON_MOUSE_UP].call(g[ON_MOUSE_UP], m);
  };
  this.setVisible = function (a) {
    f.visible = a;
  };
  this.buttonDown = function () {
    f.scaleX = 0.9;
    f.scaleY = 0.9;
    d[ON_MOUSE_DOWN] && d[ON_MOUSE_DOWN].call(g[ON_MOUSE_DOWN]);
  };
  this.getButtonImage = function () {
    return f;
  };
  this.setPosition = function (a, b) {
    f.x = a;
    f.y = b;
  };
  var q = h;
  this._init(a, c, b, e);
}
function CGfxButton(a, c, b, e) {
  var h,
    m,
    d,
    g,
    f,
    l,
    p,
    q,
    u = !1;
  this._init = function (a, b, c) {
    h = [];
    m = [];
    g = [];
    d = createBitmap(c);
    d.x = a;
    d.y = b;
    l = f = 1;
    d.regX = c.width / 2;
    d.regY = c.height / 2;
    s_bMobile || (d.cursor = "pointer");
    k.addChild(d);
    this._initListener();
  };
  this.unload = function () {
    d.off("mousedown", p);
    d.off("pressup", q);
    k.removeChild(d);
  };
  this.setVisible = function (a) {
    d.visible = a;
  };
  this.setCursorType = function (a) {
    d.cursor = a;
  };
  this._initListener = function () {
    p = d.on("mousedown", this.buttonDown);
    q = d.on("pressup", this.buttonRelease);
  };
  this.addEventListener = function (a, b, d) {
    h[a] = b;
    m[a] = d;
  };
  this.addEventListenerWithParams = function (a, b, d, c) {
    h[a] = b;
    m[a] = d;
    g[a] = c;
  };
  this.buttonRelease = function () {
    u ||
      ((d.scaleX = 0 < f ? 1 : -1),
      (d.scaleY = 1),
      playSound("click", 1, !1),
      h[ON_MOUSE_UP] && h[ON_MOUSE_UP].call(m[ON_MOUSE_UP], g[ON_MOUSE_UP]));
  };
  this.buttonDown = function () {
    u ||
      ((d.scaleX = 0 < f ? 0.9 : -0.9),
      (d.scaleY = 0.9),
      h[ON_MOUSE_DOWN] &&
        h[ON_MOUSE_DOWN].call(m[ON_MOUSE_DOWN], g[ON_MOUSE_DOWN]));
  };
  this.rotation = function (a) {
    d.rotation = a;
  };
  this.getButton = function () {
    return d;
  };
  this.setPosition = function (a, b) {
    d.x = a;
    d.y = b;
  };
  this.setX = function (a) {
    d.x = a;
  };
  this.setY = function (a) {
    d.y = a;
  };
  this.getButtonImage = function () {
    return d;
  };
  this.block = function (a) {
    u = a;
    d.scaleX = f;
    d.scaleY = l;
  };
  this.setScaleX = function (a) {
    f = d.scaleX = a;
  };
  this.getX = function () {
    return d.x;
  };
  this.getY = function () {
    return d.y;
  };
  this.pulseAnimation = function () {
    createjs.Tween.get(d)
      .to(
        {
          scaleX: 0.9 * f,
          scaleY: 0.9 * l,
        },
        850,
        createjs.Ease.quadOut
      )
      .to(
        {
          scaleX: f,
          scaleY: l,
        },
        650,
        createjs.Ease.quadIn
      )
      .call(function () {
        t.pulseAnimation();
      });
  };
  this.trebleAnimation = function () {
    createjs.Tween.get(d)
      .to(
        {
          rotation: 5,
        },
        75,
        createjs.Ease.quadOut
      )
      .to(
        {
          rotation: -5,
        },
        140,
        createjs.Ease.quadIn
      )
      .to(
        {
          rotation: 0,
        },
        75,
        createjs.Ease.quadIn
      )
      .wait(750)
      .call(function () {
        t.trebleAnimation();
      });
  };
  this.removeAllTweens = function () {
    createjs.Tween.removeTweens(d);
  };
  var k = e;
  this._init(a, c, b);
  var t = this;
  return this;
}
function CTextButton(a, c, b, e, h, m, d, g) {
  var f, l, p, q, u, k, t, v;
  this._init = function (a, b, d, c, g, e, h, m) {
    f = [];
    l = [];
    p = [];
    g = createBitmap(d);
    k = new createjs.Text(
      c,
      " " + h + "px " + PRIMARY_FONT,
      SECONDARY_FONT_COLOR
    );
    k.textAlign = "center";
    k.textBaseline = "alphabetic";
    var r = k.getBounds();
    k.x = d.width / 2;
    k.y = Math.floor(d.height / 2) + r.height / 3;
    u = new createjs.Text(c, " " + h + "px " + PRIMARY_FONT, e);
    u.textAlign = "center";
    u.textBaseline = "alphabetic";
    r = u.getBounds();
    u.x = d.width / 2;
    u.y = Math.floor(d.height / 2) + r.height / 3;
    q = new createjs.Container();
    q.x = a;
    q.y = b;
    q.regX = d.width / 2;
    q.regY = d.height / 2;
    q.addChild(g, k, u);
    m.addChild(q);
    s_bMobile || (q.cursor = "pointer");
    this._initListener();
  };
  this.unload = function () {
    q.off("mousedown", t);
    q.off("pressup", v);
    g.removeChild(q);
  };
  this.setVisible = function (a) {
    q.visible = a;
  };
  this._initListener = function () {
    t = q.on("mousedown", this.buttonDown);
    v = q.on("pressup", this.buttonRelease);
  };
  this.addEventListener = function (a, b, d) {
    f[a] = b;
    l[a] = d;
  };
  this.addEventListenerWithParams = function (a, b, d, c) {
    f[a] = b;
    l[a] = d;
    p[a] = c;
  };
  this.buttonRelease = function () {
    q.scaleX = 1;
    q.scaleY = 1;
    playSound("click", 1, !1);
    f[ON_MOUSE_UP] && f[ON_MOUSE_UP].call(l[ON_MOUSE_UP], p[ON_MOUSE_UP]);
  };
  this.buttonDown = function () {
    q.scaleX = 0.9;
    q.scaleY = 0.9;
    f[ON_MOUSE_DOWN] && f[ON_MOUSE_DOWN].call(l[ON_MOUSE_DOWN]);
  };
  this.setTextPosition = function (a) {
    u.y = a;
    k.y = a + 2;
  };
  this.setPosition = function (a, b) {
    q.x = a;
    q.y = b;
  };
  this.setX = function (a) {
    q.x = a;
  };
  this.setY = function (a) {
    q.y = a;
  };
  this.getButtonImage = function () {
    return q;
  };
  this.getX = function () {
    return q.x;
  };
  this.getY = function () {
    return q.y;
  };
  this._init(a, c, b, e, h, m, d, g);
  return this;
}
function CSpritesheetButton(a, c, b, e, h) {
  var m,
    d,
    g,
    f,
    l,
    p,
    q,
    u = !1,
    k,
    t,
    v = h;
  this._init = function (a, b, c, e) {
    m = [];
    d = [];
    l = [];
    g = createSprite(c, e, a / 2, b / 2, a, b);
    g.gotoAndStop(e);
    f = new createjs.Shape();
    f.graphics.beginFill("#ff0000").drawRect(0, 0, 2 * a, 2 * b);
    f.regX = a;
    f.regY = b;
    f.alpha = 0.01;
    q = p = 1;
    s_bMobile || (f.cursor = "pointer");
    v.addChild(g, f);
    this._initListener();
  };
  this.setShape = function (a) {
    f.scaleX = f.scaleY = a;
  };
  this.unload = function () {
    f.off("mousedown", k);
    f.off("pressup", t);
    v.removeChild(g);
  };
  this.setVisible = function (a) {
    g.visible = a;
    f.visible = a;
  };
  this.setCursorType = function (a) {
    g.cursor = a;
  };
  this._initListener = function () {
    k = f.on("mousedown", this.buttonDown);
    t = f.on("pressup", this.buttonRelease);
  };
  this.addEventListener = function (a, b, c) {
    m[a] = b;
    d[a] = c;
  };
  this.addEventListenerWithParams = function (a, b, c, f) {
    m[a] = b;
    d[a] = c;
    l[a] = f;
  };
  this.buttonRelease = function () {
    u ||
      ((g.scaleX = 0 < p ? 1 : -1),
      (g.scaleY = 1),
      playSound("click", 1, !1),
      m[ON_MOUSE_UP] && m[ON_MOUSE_UP].call(d[ON_MOUSE_UP], l[ON_MOUSE_UP]));
  };
  this.buttonDown = function () {
    u ||
      ((g.scaleX = 0 < p ? 0.9 : -0.9),
      (g.scaleY = 0.9),
      m[ON_MOUSE_DOWN] &&
        m[ON_MOUSE_DOWN].call(d[ON_MOUSE_DOWN], l[ON_MOUSE_DOWN]));
  };
  this.rotation = function (a) {
    g.rotation = a;
  };
  this.getButton = function () {
    return g;
  };
  this.setPosition = function (a, b) {
    g.x = f.x = a;
    g.y = f.y = b;
  };
  this.setX = function (a) {
    g.x = f.x = a;
  };
  this.setY = function (a) {
    g.y = f.y = a;
  };
  this.getButtonImage = function () {
    return g;
  };
  this.block = function (a) {
    u = a;
    g.scaleX = p;
    g.scaleY = q;
  };
  this.setScaleX = function (a) {
    p = g.scaleX = a;
  };
  this.setScaleY = function (a) {
    q = g.scaleY = a;
  };
  this.getX = function () {
    return g.x;
  };
  this.getY = function () {
    return g.y;
  };
  this.pulseAnimation = function () {
    createjs.Tween.get(g)
      .to(
        {
          scaleX: 0.9 * p,
          scaleY: 0.9 * q,
        },
        850,
        createjs.Ease.quadOut
      )
      .to(
        {
          scaleX: p,
          scaleY: q,
        },
        650,
        createjs.Ease.quadIn
      )
      .call(function () {
        z.pulseAnimation();
      });
  };
  this.trebleAnimation = function () {
    createjs.Tween.get(g)
      .to(
        {
          rotation: 5,
        },
        75,
        createjs.Ease.quadOut
      )
      .to(
        {
          rotation: -5,
        },
        140,
        createjs.Ease.quadIn
      )
      .to(
        {
          rotation: 0,
        },
        75,
        createjs.Ease.quadIn
      )
      .wait(750)
      .call(function () {
        z.trebleAnimation();
      });
  };
  this.removeAllTweens = function () {
    createjs.Tween.removeTweens(g);
  };
  v = h;
  this._init(a, c, b, e);
  var z = this;
  return this;
}
function CMenu() {
  var a,
    c,
    b,
    e,
    h,
    m,
    d,
    g,
    f,
    l,
    p,
    q,
    u,
    k,
    t,
    v = null,
    z = null;
  this._init = function () {
    f = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    f.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(f);
    l = createBitmap(s_oSpriteLibrary.getSprite("logo_menu"));
    l.regX = 304;
    l.regY = 160;
    l.x = CANVAS_WIDTH_HALF;
    l.y = -500;
    s_oStage.addChild(l);
    new createjs.Tween.get(l).to(
      {
        y: CANVAS_HEIGHT_HALF - 100,
      },
      500,
      createjs.Ease.linear
    );
    new createjs.Tween.get(l, {
      loop: !0,
    })
      .to(
        {
          scaleX: 1.1,
          scaleY: 1.1,
        },
        850,
        createjs.Ease.quadOut
      )
      .to(
        {
          scaleX: 1,
          scaleY: 1,
        },
        650,
        createjs.Ease.quadIn
      );
    var r = s_oSpriteLibrary.getSprite("but_play");
    h = CANVAS_WIDTH_HALF;
    m = CANVAS_HEIGHT - 120;
    p = new CGfxButton(h, m, r, s_oStage);
    p.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
    p.pulseAnimation();
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile)
      (r = s_oSpriteLibrary.getSprite("audio_icon")),
        (d = CANVAS_WIDTH - r.height / 2 - 10),
        (g = r.height / 2 + 10),
        (k = new CToggle(d, g, r, s_bAudioActive, s_oStage)),
        k.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
    var y = s_oSpriteLibrary.getSprite("but_info");
    b = r.height / 2 + 10;
    e = r.height / 2 + 10;
    q = new CGfxButton(b, e, y, s_oStage);
    q.addEventListener(ON_MOUSE_UP, this._onButInfoRelease, this);
    r = window.document;
    y = r.documentElement;
    v =
      y.requestFullscreen ||
      y.mozRequestFullScreen ||
      y.webkitRequestFullScreen ||
      y.msRequestFullscreen;
    z =
      r.exitFullscreen ||
      r.mozCancelFullScreen ||
      r.webkitExitFullscreen ||
      r.msExitFullscreen;
    !1 === ENABLE_FULLSCREEN && (v = !1);
    v &&
      screenfull.isEnabled &&
      ((r = s_oSpriteLibrary.getSprite("but_fullscreen")),
      (a = b + r.width / 2 + 10),
      (c = e),
      (t = new CToggle(a, c, r, s_bFullscreen, s_oStage)),
      t.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this));
    u = new createjs.Shape();
    u.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(u);
    createjs.Tween.get(u)
      .to(
        {
          alpha: 0,
        },
        1e3
      )
      .call(function () {
        u.visible = !1;
      });
    s_bStorageAvailable
      ? ((r = getItem("snakesandladders_gameswon")),
        null !== r && (s_aGamesWon = r),
        (r = getItem("snakesandladders_gamesplayed")),
        null !== r && (s_aGamesPlayed = r))
      : new CMsgBox(TEXT_ERR_LS, s_oStage);
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function (f, l) {
    p.setPosition(h, m - l);
    q.setPosition(b + f, e);
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) ||
      k.setPosition(d - f, g);
    v && screenfull.isEnabled && t.setPosition(a + f, c);
  };
  this.unload = function () {
    p.unload();
    p = null;
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile) k.unload(), (k = null);
    v && screenfull.isEnabled && t.unload();
    s_oStage.removeAllChildren();
    createjs.Tween.removeAllTweens();
    s_oMenu = null;
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onButInfoRelease = function () {
    new CCreditsPanel();
  };
  this._onButPlayRelease = function () {
    this.unload();
    s_oMain.gotoModeChoose();
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen
      ? z.call(window.document)
      : v.call(window.document.documentElement);
    sizeHandler();
  };
  this.resetFullscreenBut = function () {
    v && screenfull.isEnabled && t.setActive(s_bFullscreen);
  };
  s_oMenu = this;
  this._init();
}
var s_oMenu = null;
function CGame(a, c, b, e) {
  var h,
    m,
    d,
    g,
    f,
    l,
    p,
    q,
    u,
    k,
    t,
    v,
    z,
    r,
    y,
    B,
    F,
    A,
    C,
    G,
    I,
    H,
    J,
    O,
    L,
    P,
    Q;
  this._init = function (a, b, c, e) {
    v = c;
    f = a;
    l = b;
    d = [];
    g = [];
    $(s_oMain).trigger("start_session");
    this.resetVariables();
    s_oBezier = new CBezier();
    a = s_oSpriteLibrary.getSprite("bg_game" + s_iModeGame);
    O = createBitmap(a);
    O.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    F = new createjs.Container();
    A = new createjs.Container();
    C = new createjs.Container();
    s_oStage.addChild(O, F, A, C);
    L = new CBoard(F, A, C);
    I = new createjs.Container();
    G = new createjs.Container();
    s_oStage.addChild(I, G);
    if (v === HUMAN_VS_CPU)
      for (
        a = [0, 1, 2, 3, 4, 5],
          shuffle(a),
          e = a.indexOf(l),
          a.splice(e, 1),
          p = Math.floor(Math.random() * f),
          a.splice(p, 0, l),
          e = [],
          b = 0;
        b < f;
        b++
      )
        d.push(new CPlayers(b, G, I, a[b])), e.push(a[b]);
    else for (b = 0; b < f; b++) d.push(new CPlayers(b, G, I, e[b]));
    this.arrangePlayerZ();
    Q = new CDice();
    P = new CPlayersInterface(e);
    H = new CInterface(P);
    J = new CEndPanel(s_oSpriteLibrary.getSprite("msg_box"));
    J.addEventListener(ON_BACK_MENU, this.onExit, this);
    J.addEventListener(ON_RESTART, this.restartGame, this);
    J.addEventListener(ON_CHECK, this.checkBoard, this);
    new CHelpPanel();
    setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);
  };
  this.resetVariables = function () {
    B = y = r = z = !1;
    t = 0;
  };
  this._unload = function () {
    z = !1;
    J.unload();
    L.unload();
    Q.unload();
    H.unload();
    s_oStage.removeAllChildren();
    createjs.Tween.removeAllTweens();
    !1 === s_bMobile &&
      ((document.onkeydown = null), (document.onkeyup = null));
  };
  this.onExit = function () {
    this._unload();
    $(s_oMain).trigger("show_interlevel_ad");
    $(s_oMain).trigger("end_session");
    setVolume("soundtrack", 1);
    s_oMain.gotoMenu();
  };
  this._onExitHelp = function () {
    r = z = !0;
  };
  this.pause = function (a) {
    z = !a;
    s_oDices.setPaused(a);
  };
  this.getDiceResult = function (a) {
    u = a;
  };
  this.movePlayer = function (a) {
    q = a;
    d[t].setArrowVisible(!1);
    this.setPlayerPos(t);
  };
  this.setPlayerPos = function (a) {
    this.playerAdvance(a, q);
  };
  this.arrangeSquarePlayers = function (a, b, c) {
    c = 0 === c % 2 ? 5 * Math.floor(c / 2) : -5 * Math.floor(c / 2);
    new createjs.Tween.get(d[a].getSprite()).to(
      {
        x: this.getBoardSquareX(b) + c,
        y: this.getBoardSquareY(b) + c,
      },
      150
    );
    s_iModeGame === MODE_SNAKES &&
      new createjs.Tween.get(d[a].getShadow()).to(
        {
          x: this.getBoardSquareX(b) + c,
          y: this.getBoardSquareY(b) + c,
        },
        150
      );
  };
  this.checkForAnotherPlayer = function (a, b) {
    for (var c = 0, f = 0; f < d.length; f++)
      d[f].getPosition() === a && (c += 1);
    1 < c
      ? (s_oGame.arrangeSquarePlayers(b, a, c), s_oGame.arrangePlayerZ())
      : s_oBoard.setSquareOccupied(a, !1);
  };
  this.checkForSpecialSquares = function (a) {
    var b = d[a].getPosition();
    this.checkForAnotherPlayer(b, a);
    y = !0;
    k = 0;
    if (b === LAST_SQUARE) s_oGame.onWin(a);
    !0 === ifArrayContainsValue(OBSTACLES_SQUARES, b)
      ? (playSound("malus", 1, !1),
        new CMotivationalMsg(MSG_BAD),
        (h = this.obstacleSquare),
        (m = a))
      : !0 === ifArrayContainsValue(LADDERS_SQUARES, b)
      ? (playSound("bonus", 1, !1),
        new CMotivationalMsg(MSG_GOOD),
        (h = this.ladderSquare),
        (m = a))
      : ((h = this.changeTurn), (m = !0));
  };
  this.obstacleSquare = function (a) {
    var b = d[a].getPosition();
    s_oGame.startObstacleAnimation(b, a);
  };
  this.startObstacleAnimation = function (a, b) {
    var c = OBSTACLES_SQUARES.indexOf(a),
      f = d[b].getSprite();
    if (s_iModeGame === MODE_SNAKES) {
      d[b].getShadow().visible = !1;
      var e = L.getObstaclesArray(),
        k = this.getBoardSquareX(a),
        h = this.getBoardSquareY(a);
      e[c].gotoAndPlay("idle");
      playSound("eat", 1, !1);
      new createjs.Tween.get(f)
        .to(
          {
            scaleX: 0,
            scaleY: 0,
          },
          300,
          createjs.Ease.quadOut
        )
        .to(
          {
            x: k,
            y: h,
          },
          SNAKE_SPEED,
          createjs.Ease.quadOut
        )
        .call(function () {
          s_oGame.obstacleAnimationOver(b, c);
        });
    } else {
      d[b].animationSlide();
      g.length = 0;
      switch (a) {
        case 16:
          e = CHUTES_COORDS_16;
          break;
        case 47:
          e = CHUTES_COORDS_47;
          break;
        case 49:
          e = CHUTES_COORDS_49;
          break;
        case 56:
          e = CHUTES_COORDS_56;
          break;
        case 62:
          e = CHUTES_COORDS_62;
          break;
        case 64:
          e = CHUTES_COORDS_64;
          break;
        case 87:
          e = CHUTES_COORDS_87;
          break;
        case 93:
          e = CHUTES_COORDS_93;
          break;
        case 95:
          e = CHUTES_COORDS_95;
          break;
        case 98:
          e = CHUTES_COORDS_98;
      }
      s_oGame.initCurve(e);
    }
  };
  this.initCurve = function (a) {
    playSound("chute", 1, !1);
    for (var b = 0; b < a.length - 2; b++) {
      var c = new createjs.Point(a[b][0], a[b][1]),
        d = new createjs.Point(a[b + 1][0], a[b + 1][1]),
        e = new createjs.Point(a[b + 2][0], a[b + 2][1]);
      b += 1;
      c = s_oBezier.init(c, d, e, STEP_LENGTH);
      for (d = 1; d <= c; ++d) (e = s_oBezier.getAnchorPoint(d)), g.push(e);
    }
    B = !0;
  };
  this.obstacleAnimationOver = function (a, b) {
    var c = OBSTACLES_MOVEMENT_SQUARES[b][1],
      e = d[a].getSprite(),
      f = BOARD_SQUARES[c][0],
      g = BOARD_SQUARES[c][1];
    if (s_iModeGame === MODE_SNAKES) {
      var k = d[a].getShadow();
      playSound("snake", 1, !1);
      e.x = k.x = f;
      e.y = k.y = g;
      d[a].setVisible(!0);
      new createjs.Tween.get(e).to(
        {
          scaleX: 1,
          scaleY: 1,
        },
        250,
        createjs.Ease.cubicOut
      );
    } else
      new createjs.Tween.get(d[a].getSprite())
        .to(
          {
            x: f,
            y: g,
          },
          100,
          createjs.Ease.quadIn
        )
        .call(function () {
          d[a].animationIdle();
        });
    d[a].setPosition(c + 1);
    s_oGame.playerArrived(a);
  };
  this.ladderSquare = function (a) {
    var b = d[a].getSprite();
    if (s_iModeGame === MODE_SNAKES) var c = d[a].getShadow();
    for (var e = 0; e < LADDER_MOVEMENT_SQUARES.length; e++)
      if (d[a].getPosition() === LADDER_MOVEMENT_SQUARES[e][0]) {
        var f = LADDER_MOVEMENT_SQUARES[e][1],
          g = BOARD_SQUARES[f][0],
          k = BOARD_SQUARES[f][1];
        playSound("ladder", 1, !1);
        new createjs.Tween.get(b)
          .to(
            {
              x: g,
              y: k,
            },
            LADDERS_SPEED,
            createjs.Ease.cubicOut
          )
          .call(function () {
            d[a].setPosition(f + 1);
            s_oGame.playerArrived(a);
          });
        s_iModeGame === MODE_SNAKES &&
          new createjs.Tween.get(c).to(
            {
              x: g,
              y: k,
            },
            LADDERS_SPEED,
            createjs.Ease.cubicOut
          );
      }
  };
  this.endTimeoutSpecialSquare = function () {
    h(m);
    y = !1;
  };
  this.changeTurn = function () {
    s_oDices.fadeOutTween();
    6 !== u
      ? (t++, t > f - 1 && (t = 0), s_oGame.changePlayerTurn())
      : (playSound("bonus", 1, !1), new CMotivationalMsg(MSG_DICE));
  };
  this.extraDiceLaunch = function () {
    s_oDices.show();
  };
  this.playerArrived = function (a) {
    s_iModeGame === MODE_CHUTES && d[a].animationIdle();
    q++;
    d[a].decreasePosition();
    s_oGame.checkToFlip(a);
    this.checkForSpecialSquares(a);
  };
  this.playerBounceTween = function (a) {
    var b = s_oGame.getBoardSquareY(d[a].getPosition());
    new createjs.Tween.get(d[a].getSprite())
      .to(
        {
          y: b - 20,
        },
        150,
        createjs.Ease.quadIn
      )
      .to(
        {
          y: b,
        },
        150,
        createjs.Ease.quadIn
      );
  };
  this.playerAdvance = function (a, b) {
    s_oGame.arrangePlayerZ();
    d[a].increasePosition();
    if (0 === b) s_oGame.playerArrived(a);
    else if (0 < b) {
      var c = s_oGame.getBoardSquareX(d[a].getPosition()),
        e = s_oGame.getBoardSquareY(d[a].getPosition());
      s_oGame.checkToFlip(a);
      if (s_iModeGame === MODE_SNAKES) {
        var f = createjs.Ease.quadIn;
        this.playerBounceTween(a);
        new createjs.Tween.get(d[a].getShadow())
          .to(
            {
              alpha: 0.5,
            },
            150,
            createjs.Ease.quadIn
          )
          .to(
            {
              alpha: 1,
            },
            150,
            createjs.Ease.quadIn
          );
      } else (f = createjs.Ease.linear), d[a].animationWalk();
      new createjs.Tween.get(d[a].getSprite())
        .to(
          {
            x: c,
            y: e,
          },
          300,
          f
        )
        .call(function () {
          playSound("step_land", 1, !1);
          s_oGame.arrangePlayerZ();
          b--;
          s_oGame.checkFinalSquare(a, b);
        });
      s_iModeGame === MODE_SNAKES &&
        new createjs.Tween.get(d[a].getShadow()).to(
          {
            x: c,
            y: e,
          },
          300,
          createjs.Ease.quadIn
        );
    }
  };
  this.checkFinalSquare = function (a, b) {
    s_oGame.arrangePlayerZ();
    var c = d[a].getPosition();
    if (!0 === PERFECT_SCORE) {
      if (c === LAST_SQUARE && 0 === b) s_oGame.onWin(a);
      c >= LAST_SQUARE ? s_oGame.playerBack(a, b) : s_oGame.playerAdvance(a, b);
    } else if (c === LAST_SQUARE) s_oGame.onWin(a);
    else s_oGame.playerAdvance(a, b);
  };
  this.playerBack = function (a, b) {
    s_oGame.arrangePlayerZ();
    d[a].decreasePosition();
    if (0 === b)
      s_iModeGame === MODE_CHUTES && d[a].animationIdle(),
        q--,
        d[a].increasePosition(),
        s_oGame.checkForSpecialSquares(a);
    else if (0 < b) {
      s_oGame.checkToFlip(a);
      var c = s_oGame.getBoardSquareX(d[a].getPosition()),
        e = s_oGame.getBoardSquareY(d[a].getPosition());
      new createjs.Tween.get(d[a].getSprite())
        .to(
          {
            x: c,
            y: e,
          },
          100,
          createjs.Ease.quadIn
        )
        .call(function () {
          s_oGame.arrangePlayerZ();
          b--;
          s_oGame.playerBack(a, b);
        });
      s_iModeGame === MODE_SNAKES &&
        new createjs.Tween.get(d[a].getShadow()).to(
          {
            x: c,
            y: e,
          },
          100,
          createjs.Ease.quadIn
        );
    }
  };
  this.changePlayerTurn = function () {
    s_oGame.arrangePlayerZ();
    s_oGame.setTurnReady(!0);
    return !1;
  };
  this.setPlayerVisible = function (a) {
    d[a].setVisible(!0);
  };
  this.onWin = function (a) {
    z = !1;
    t = null;
    s_aGamesPlayed++;
    saveItem("snakesandladders_gamesplayed", s_aGamesPlayed);
    if (s_iModeGame === MODE_CHUTES)
      for (var b = 0; b < d.length; b++) d[b].animationIdle();
    v === HUMAN_VS_CPU
      ? a === p
        ? (s_aGamesWon++,
          saveItem("snakesandladders_gameswon", s_aGamesWon),
          s_oGame.gameWin())
        : s_oGame.gameOver(a)
      : (s_aGamesWon++,
        saveItem("snakesandladders_gameswon", s_aGamesWon),
        s_oGame.gameWin());
  };
  this.gameWin = function (a) {
    z = !1;
    playSound("game_win", 1, !1);
    J.show(!0);
  };
  this.setTurnReady = function (a) {
    r = a;
  };
  this.isTurnReady = function () {
    return r;
  };
  this.gameOver = function (a) {
    z = !1;
    playSound("game_over", 1, !1);
    J.show(!1);
  };
  this.restartGame = function () {
    s_oDices.hide();
    J.hide();
    s_oGame.resetVariables();
    r = z = !0;
    for (var a = 0; a < d.length; a++) d[a].reset();
    this.arrangePlayerZ();
  };
  this.checkBoard = function () {
    var a = new createjs.Shape();
    a.graphics
      .beginFill("rgba(0,0,0,0.4)")
      .drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    a.on("click", s_oGame.returnToEndPanel, s_oGame, !0, a);
    s_oStage.addChild(a);
    J.hide();
  };
  this.returnToEndPanel = function (a, b) {
    s_oStage.removeChild(b);
    J.reShow();
  };
  this.launchDices = function () {
    (v === HUMAN_VS_CPU && t !== p) ||
      !0 !== s_oInterface.DicesEnabled() ||
      !0 !== s_oGame.isTurnReady() ||
      s_oDices.show();
  };
  this.getBoardSquareX = function (a) {
    return BOARD_SQUARES[a][0];
  };
  this.getBoardSquareY = function (a) {
    return BOARD_SQUARES[a][1];
  };
  this.arrangePlayerZ = function () {
    for (var a = [], b = 0; b < G.children.length; b++) {
      var c = G.children[b];
      a.push({
        height: c.y,
        player: c,
      });
    }
    a.sort(this.compareHeight);
    for (b = c = 0; b < G.children.length; b++)
      G.setChildIndex(a[b].player, c++);
  };
  this.compareHeight = function (a, b) {
    return a.height < b.height ? -1 : a.height > b.height ? 1 : 0;
  };
  this.getPlayerX = function (a) {
    return d[a].getSprite().x;
  };
  this.getPlayerY = function (a) {
    return d[a].getSprite().y;
  };
  this.checkToFlip = function (a) {
    if (s_iModeGame !== MODE_SNAKES) {
      var b = d[a].getSprite();
      a = d[a].getPosition();
      10 >= a
        ? (b.scaleX = 1)
        : 10 < a && 20 >= a
        ? (b.scaleX = -1)
        : 20 < a && 30 >= a
        ? (b.scaleX = 1)
        : 30 < a && 40 >= a
        ? (b.scaleX = -1)
        : 40 < a && 50 >= a
        ? (b.scaleX = 1)
        : 50 < a && 60 >= a
        ? (b.scaleX = -1)
        : 60 < a && 70 >= a
        ? (b.scaleX = 1)
        : 70 < a && 80 >= a
        ? (b.scaleX = -1)
        : 80 < a && 90 >= a
        ? (b.scaleX = 1)
        : 90 < a && (b.scaleX = -1);
    }
  };
  this.setArrow = function (a) {
    d[a].setArrowX(this.getPlayerX(a));
    d[a].setArrowY(this.getPlayerY(a));
  };
  this.checkForNextTurn = function () {
    v === HUMAN_VS_CPU
      ? t !== p
        ? (d[t].setArrowVisible(!1),
          s_oDices.show(),
          H.enableDices(!1),
          H.animationDiceButtonStop())
        : (!1 === d[t].isArrowVisible() &&
            (d[t].setArrowVisible(!0), this.setArrow(t)),
          H.enableDices(!0),
          !0 === H.DicesEnabled() && H.animationDiceButton())
      : (!1 === d[t].isArrowVisible() &&
          (d[t].setArrowVisible(!0), this.setArrow(t)),
        H.enableDices(!0),
        !0 === H.DicesEnabled() && H.animationDiceButton());
    P.setTurn(t);
  };
  this.getCurveMapData = function () {
    return g;
  };
  this.checkForFirstTurn = function () {
    if (s_oDices.isFirstLaunch)
      for (var a = 0; a < d.length; a++)
        0 < d[a].getPosition()
          ? s_oDices.setFirstLaunch(!1)
          : s_oDices.setFirstLaunch(!0);
  };
  this.onEndChuteAnimation = function () {
    B = !1;
    for (
      var a = d[t].getPosition(), b = 0;
      b < OBSTACLES_MOVEMENT_SQUARES.length;
      b++
    )
      a === OBSTACLES_MOVEMENT_SQUARES[b][0] &&
        s_oGame.obstacleAnimationOver(t, b);
  };
  this.update = function () {
    !0 === z &&
      (!0 === r && this.checkForNextTurn(),
      !0 === y &&
        ((k += s_iTimeElaps), 500 < k && this.endTimeoutSpecialSquare()),
      B && d[t].update());
  };
  s_oGame = this;
  this._init(a, c, b, e);
}
var s_oGame, s_oBezier;
function CDice() {
  var a,
    c,
    b,
    e,
    h = !1,
    m;
  this._init = function () {
    m = !0;
    s_oGame.setTurnReady(!1);
    a = new createjs.Container();
    s_oStage.addChild(a);
    var c = CANVAS_WIDTH_HALF + 400,
      g = CANVAS_HEIGHT,
      f = {
        images: [s_oSpriteLibrary.getSprite("launch_dice")],
        framerate: 24,
        frames: {
          width: 154,
          height: 234,
          regX: 154,
          regY: 234,
        },
        animations: {
          stop: [8, 8],
          idle: [0, 8, "stop"],
        },
      };
    f = new createjs.SpriteSheet(f);
    e = createSprite(f, 0, 154, 234, 154, 234);
    e.x = c;
    e.y = g;
    e.visible = !1;
    a.addChild(e);
    f = {
      images: [
        s_oSpriteLibrary.getSprite("dice_1"),
        s_oSpriteLibrary.getSprite("dice_2"),
        s_oSpriteLibrary.getSprite("dice_3"),
        s_oSpriteLibrary.getSprite("dice_4"),
        s_oSpriteLibrary.getSprite("dice_5"),
        s_oSpriteLibrary.getSprite("dice_6"),
      ],
      framerate: 24,
      frames: {
        width: 150,
        height: 410,
        regX: 150,
        regY: 410,
      },
      animations: {
        stop1: [11, 11],
        idle1: [0, 11, "stop1"],
        stop2: [23, 23],
        idle2: [12, 23, "stop2"],
        stop3: [35, 35],
        idle3: [24, 35, "stop3"],
        stop4: [47, 47],
        idle4: [36, 47, "stop4"],
        stop5: [59, 59],
        idle5: [48, 59, "stop5"],
        stop6: [71, 71],
        idle6: [60, 71, "stop6"],
      },
    };
    f = new createjs.SpriteSheet(f);
    b = createSprite(f, 0, 75, 205, 150, 410);
    b.x = c;
    b.y = g - 100;
    b.visible = !1;
    a.addChild(b);
  };
  this.isAnimationOn = function () {
    return h;
  };
  this.show = function () {
    b.visible = !1;
    b.on("animationend", this.movePlayer);
    s_oGame.setTurnReady(!1);
    c = Math.floor(6 * Math.random() + 1);
    h = !0;
    playSound("dices", 1, !1);
    e.visible = !0;
    e.gotoAndPlay("idle");
    e.on("animationend", function () {
      e.visible && s_oDices.secondAnimation();
    });
  };
  this.secondAnimation = function () {
    e.visible = !1;
    b.alpha = 1;
    b.visible = !0;
    b.gotoAndPlay("idle" + c);
    s_oGame.getDiceResult(c);
    h = !1;
  };
  this.movePlayer = function () {
    !1 === h && ((h = !0), s_oGame.movePlayer(c));
  };
  this.fadeOutTween = function () {
    createjs.Tween.get(b, {
      loop: !1,
    })
      .to(
        {
          alpha: 0,
        },
        200
      )
      .call(this.hide);
  };
  this.returnDiceResult = function () {
    return c;
  };
  this.hide = function () {
    b.visible = !1;
  };
  this.unload = function () {
    s_oDices = null;
  };
  this.isFirstLaunch = function () {
    return m;
  };
  this.setFirstLaunch = function (a) {
    m = a;
  };
  this.setPaused = function (a) {
    e.tickEnabled = b.tickEnabled = !a;
  };
  s_oDices = this;
  this._init();
}
var s_oDices = this;
function CPlayers(a, c, b, e) {
  var h, m, d, g, f, l, p;
  this._init = function () {
    p = s_oGame.getCurveMapData();
    m = 0;
    h = e;
    if (s_iModeGame === MODE_SNAKES) {
      d = createBitmap(s_oSpriteLibrary.getSprite("player_shadow"));
      d.regX = 17;
      d.regY = 0;
      d.x = ZERO_SQUARE_POSITIONS[a][0];
      d.y = ZERO_SQUARE_POSITIONS[a][1];
      b.addChild(d);
      var q = [22, 22],
        u = [62, 62],
        k = {
          images: [s_oSpriteLibrary.getSprite("players_" + s_iModeGame)],
          framerate: 0,
          frames: {
            width: q[s_iModeGame],
            height: u[s_iModeGame],
            regX: q[s_iModeGame] / 2,
            regY: u[s_iModeGame] - 10,
          },
          animations: {
            0: [0, 0],
            1: [1, 1],
            2: [2, 2],
            3: [3, 3],
            4: [4, 4],
            5: [5, 5],
          },
        };
      k = new createjs.SpriteSheet(k);
      g = createSprite(
        k,
        h,
        q[s_iModeGame],
        u[s_iModeGame] - 10,
        q[s_iModeGame],
        u[s_iModeGame]
      );
      g.gotoAndStop(h);
    } else
      (k = {
        images: [s_oSpriteLibrary.getSprite("player_" + s_iModeGame + "_" + h)],
        framerate: 30,
        frames: {
          width: PLAYER_SPRITE_WIDTH[h],
          height: PLAYER_SPRITE_HEIGHT[h],
          regX: PLAYER_SPRITE_WIDTH[h] / 2,
          regY: PLAYER_SPRITE_HEIGHT[h] / 2 + 20,
        },
        animations: {
          idle: [0, 26, !0, 0.5],
          walk: [27, 40],
          slide: [41, 41, !1, 0.3],
        },
      }),
        (k = new createjs.SpriteSheet(k)),
        (g = createSprite(
          k,
          "idle",
          PLAYER_SPRITE_WIDTH[h],
          PLAYER_SPRITE_HEIGHT[h],
          PLAYER_SPRITE_WIDTH[h],
          PLAYER_SPRITE_HEIGHT[h]
        ));
    g.x = ZERO_SQUARE_POSITIONS[a][0];
    g.y = ZERO_SQUARE_POSITIONS[a][1];
    l = 0;
    c.addChild(g);
    f = createBitmap(s_oSpriteLibrary.getSprite("arrow"));
    f.regX = 15;
    f.regY = 80;
    f.visible = !1;
    c.addChild(f);
    new createjs.Tween.get(f, {
      loop: !0,
    })
      .to(
        {
          scaleY: 1.2,
        },
        500,
        createjs.Ease.quadIn
      )
      .to(
        {
          scaleY: 1,
        },
        500,
        createjs.Ease.quadIn
      );
  };
  this.animationWalk = function () {
    g.gotoAndPlay("walk");
  };
  this.animationSlide = function () {
    g.gotoAndPlay("slide");
  };
  this.animationIdle = function () {
    g.gotoAndPlay("idle");
  };
  this.getArrow = function () {
    return f;
  };
  this.setArrowVisible = function (a) {
    f.visible = a;
  };
  this.isArrowVisible = function () {
    return f.visible;
  };
  this.setArrowX = function (a) {
    f.x = a;
  };
  this.setArrowY = function (a) {
    f.y = a;
  };
  this.setVisible = function (a) {
    g.visible = a;
    d.visible = a;
  };
  this.getSprite = function () {
    return g;
  };
  this.getShadow = function () {
    return d;
  };
  this.getPosition = function () {
    return l;
  };
  this.setPosition = function (a) {
    l = a;
  };
  this.reset = function () {
    l = 0;
    g.x = ZERO_SQUARE_POSITIONS[a][0];
    g.y = ZERO_SQUARE_POSITIONS[a][1];
    s_iModeGame === MODE_SNAKES
      ? ((d.x = ZERO_SQUARE_POSITIONS[a][0]),
        (d.y = ZERO_SQUARE_POSITIONS[a][1]))
      : (g.gotoAndStop("idle"), (g.scaleX = 1));
  };
  this.getX = function () {
    return g.x;
  };
  this.getY = function () {
    return g.y;
  };
  this.setX = function (a) {
    g.x = d.x = a;
  };
  this.setY = function (a) {
    g.y = d.y = a;
  };
  this.decreasePosition = function () {
    --l;
  };
  this.increasePosition = function () {
    l += 1;
  };
  this.unload = function () {
    s_oPlayers = null;
  };
  this.update = function () {
    var a = p[m][0],
      b = p[m][1];
    s_iModeGame === MODE_CHUTES && (g.scaleX = a > g.x ? 1 : -1);
    g.x = a;
    g.y = b;
    m++;
    m >= p.length && ((m = 0), s_oGame.onEndChuteAnimation());
  };
  s_oPlayers = this;
  this._init();
}
var s_oPlayers;
function CBoard(a, c, b) {
  var e = [],
    h = [],
    m = [],
    d = [],
    g = [];
  this._init = function () {
    for (var b = 0; b <= LAST_SQUARE; b++) {
      var c = BOARD_SQUARES[b][0],
        d = BOARD_SQUARES[b][1],
        g = new createjs.Shape();
      g.graphics.beginFill("red");
      g.graphics.drawRect(0, 0, 44, 44);
      g.x = c;
      g.y = d;
      g.regX = 22;
      g.regY = 22;
      g.alpha = 0.5;
      g.visible = !1;
      g.setBounds();
      m.push(g);
      a.addChild(g);
      e.push(!1);
      h.push([!1, !1, !1, !1]);
    }
    this.initLaddersOnBoard();
    this.initObstaclesOnBoard();
  };
  this.initObstaclesOnBoard = function () {
    if (s_iModeGame === MODE_SNAKES)
      for (
        var a = [150, 150, 120, 190, 96, 170, 230, 100, 100, 100],
          b = [100, 150, 200, 72, 310, 90, 380, 130, 130, 130],
          d = [650, 780, 930, 730, 525, 525, 680, 855, 665, 495],
          e = [545, 400, 425, 280, 385, 275, 305, 120, 120, 120],
          h = 0;
        h < OBSTACLES_SQUARES.length;
        h++
      ) {
        var k = {
          images: [s_oSpriteLibrary.getSprite("snake_" + OBSTACLES_SQUARES[h])],
          framerate: 30,
          frames: {
            width: a[h],
            height: b[h],
            regX: a[h] / 2,
            regY: b[h] / 2,
          },
          animations: {
            stop: [0, 0],
            idle: [0, 31, "stop"],
          },
        };
        k = new createjs.SpriteSheet(k);
        k = createSprite(k, "stop", b[h] / 2, a[h] / 2, b[h], a[h]);
        k.x = d[h];
        k.y = e[h];
        c.addChild(k);
        g.push(k);
      }
    else
      for (
        a = [152, 131, 90, 152, 86, 162, 177, 94, 102, 101],
          b = [99, 116, 149, 54, 299, 97, 333, 118, 125, 127],
          d = [555, 700, 850, 650, 480, 440, 600, 805, 625, 465],
          e = [495, 335, 355, 265, 230, 215, 140, 60, 60, 60],
          h = 0;
        h < OBSTACLES_SQUARES.length;
        h++
      )
        (k = s_oSpriteLibrary.getSprite("chute_" + OBSTACLES_SQUARES[h])),
          (k = createBitmap(k, b[h], a[h])),
          (k.x = d[h]),
          (k.y = e[h]),
          c.addChild(k),
          g.push(k);
  };
  this.getObstaclesArray = function () {
    return g;
  };
  this.initLaddersOnBoard = function () {
    for (
      var a = [149, 172, 99, 78, 250, 74, 166, 50, 46],
        c = [189, 94, 172, 101, 348, 85, 93, 96, 95],
        e = [415, 600, 850, 420, 585, 590, 765, 900, 410],
        g = [385, 490, 400, 350, 115, 330, 215, 80, 80],
        h = 0;
      h < LADDERS_SQUARES.length;
      h++
    ) {
      var k = s_oSpriteLibrary.getSprite("ladder_" + LADDERS_SQUARES[h]);
      k = createBitmap(k, a[h], c[h]);
      k.x = e[h];
      k.y = g[h];
      b.addChild(k);
      d.push(k);
    }
  };
  this.setSquareOccupied = function (a, b) {
    e[a] = b;
  };
  this.checkFreeSquarePoints = function (a) {
    return h[a].indexOf(!1);
  };
  this.unload = function () {
    s_oBoard = null;
  };
  s_oBoard = this;
  this._init();
}
var s_oBoard;
function CInterface(a) {
  var c,
    b,
    e,
    h,
    m,
    d,
    g,
    f,
    l,
    p,
    q,
    u,
    k,
    t,
    v = null,
    z,
    r,
    y,
    B,
    F,
    A,
    C,
    G,
    I,
    H = null,
    J = null;
  this._init = function () {
    m = CANVAS_WIDTH - 50;
    d = CANVAS_HEIGHT - 50;
    B = new CDiceButton(m, d, s_oStage);
    B.addEventListener(ON_MOUSE_UP, this._onDicesLaunch, this);
    I = !1;
    k = new createjs.Container();
    t = new createjs.Container();
    s_oStage.addChild(k);
    k.addChild(t);
    var a = s_oSpriteLibrary.getSprite("but_settings");
    c = CANVAS_WIDTH - a.width / 2 - 10;
    b = a.height / 2 + 10;
    a = s_oSpriteLibrary.getSprite("but_exit");
    q = c;
    u = b + a.height + 10;
    F = new CGfxButton(q, u, a, k);
    F.addEventListener(ON_MOUSE_UP, this._onExit, this);
    F.setVisible(!1);
    a = s_oSpriteLibrary.getSprite("but_help");
    e = c;
    h = u + a.height + 10;
    C = new CGfxButton(e, h, a, k);
    C.addEventListener(
      ON_MOUSE_UP,
      function () {
        new CHelpPanel();
      },
      this
    );
    C.setVisible(!1);
    l = e;
    p = h + a.height + 10;
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile)
      (a = s_oSpriteLibrary.getSprite("audio_icon")),
        (r = new CToggle(l, p, a, s_bAudioActive, k)),
        r.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this),
        r.setVisible(!1);
    a = window.document;
    var v = a.documentElement;
    H =
      v.requestFullscreen ||
      v.mozRequestFullScreen ||
      v.webkitRequestFullScreen ||
      v.msRequestFullscreen;
    J =
      a.exitFullscreen ||
      a.mozCancelFullScreen ||
      a.webkitExitFullscreen ||
      a.msExitFullscreen;
    !1 === ENABLE_FULLSCREEN && (H = !1);
    H &&
      screenfull.isEnabled &&
      ((a = s_oSpriteLibrary.getSprite("but_fullscreen")),
      r ? ((g = l), (f = p + a.height + 10)) : ((g = l), (f = p)),
      (A = new CToggle(g, f, a, s_bFullscreen, k)),
      A.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this),
      A.setVisible(!1));
    a = s_oSpriteLibrary.getSprite("but_settings");
    y = new CGfxButton(c, b, a, k);
    y.addEventListener(ON_MOUSE_UP, this.onSettings);
    G = !1;
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.onSettings = function () {
    G
      ? s_oInterface.closePanel()
      : ((z = new CPauseButton(t)),
        (G = !0),
        F.setX(y.getX()),
        F.setY(y.getY()),
        F.setVisible(!0),
        C.setX(y.getX()),
        C.setY(y.getY()),
        C.setVisible(!0),
        r &&
          (r.setPosition(y.getX(), y.getY()),
          r.setVisible(!0),
          new createjs.Tween.get(r.getButtonImage()).to(
            {
              x: l - s_iOffsetX,
              y: p,
            },
            300,
            createjs.Ease.cubicOut
          )),
        A &&
          (A.setPosition(y.getX(), y.getY()),
          A.setVisible(!0),
          new createjs.Tween.get(A.getButtonImage()).to(
            {
              x: g - s_iOffsetX,
              y: f,
            },
            300,
            createjs.Ease.cubicOut
          )),
        new createjs.Tween.get(F.getButtonImage()).to(
          {
            x: q - s_iOffsetX,
            y: u,
          },
          300,
          createjs.Ease.cubicOut
        ),
        new createjs.Tween.get(C.getButtonImage()).to(
          {
            x: e - s_iOffsetX,
            y: h,
          },
          300,
          createjs.Ease.cubicOut
        ));
  };
  this.closePanel = function () {
    z.onExit();
    G = !1;
    new createjs.Tween.get(F.getButtonImage())
      .to(
        {
          x: y.getX(),
          y: y.getY(),
        },
        300,
        createjs.Ease.cubicIn
      )
      .call(function () {
        F.setVisible(!1);
        C.setVisible(!1);
        r && r.setVisible(!1);
        A && A.setVisible(!1);
      });
    new createjs.Tween.get(C.getButtonImage()).to(
      {
        x: y.getX(),
        y: y.getY(),
      },
      300,
      createjs.Ease.cubicIn
    );
    r &&
      new createjs.Tween.get(r.getButtonImage()).to(
        {
          x: y.getX(),
          y: y.getY(),
        },
        300,
        createjs.Ease.cubicIn
      );
    A &&
      new createjs.Tween.get(A.getButtonImage()).to(
        {
          x: y.getX(),
          y: y.getY(),
        },
        300,
        createjs.Ease.cubicIn
      );
  };
  this.unloadPause = function () {};
  this.unload = function () {
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile) r.unload(), (r = null);
    B.unload();
    F.unload();
    s_oStage.removeChild(k);
    H && screenfull.isEnabled && A.unload();
    s_oInterface = null;
  };
  this.animationDiceButton = function () {
    B.pulseAnimation();
  };
  this.animationDiceButtonStop = function () {
    B.removeAllTweens();
  };
  this.getButDicesX = function () {
    return B.getX();
  };
  this.refreshButtonPos = function (k, t) {
    y.setPosition(c - k, b);
    F.setPosition(q - k, u);
    C.setPosition(e - k, h);
    B.setPosition(m - k, d - t);
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) ||
      r.setPosition(l - k, p);
    H && screenfull.isEnabled && A.setPosition(g - k, f);
    a.refreshPosition(k);
  };
  this._onButHelpRelease = function () {
    v = new CHelpPanel();
  };
  this._onButRestartRelease = function () {
    s_oGame.restartGame();
    $(s_oMain).trigger("restart_level", 1);
  };
  this.onExitFromHelp = function () {
    v.unload();
  };
  this._onExit = function () {
    new CAreYouSurePanel(s_oGame.onExit);
  };
  this.showWin = function () {
    new CWinPanel();
  };
  this.getButtonDices = function () {
    return B;
  };
  this.enableDices = function (a) {
    I = a;
    B.toggle(a);
  };
  this.DicesEnabled = function () {
    return I;
  };
  this._onDicesLaunch = function () {
    s_oGame.launchDices();
    this.enableDices(!1);
    this.animationDiceButtonStop();
  };
  this.isAreYouSurePanel = function () {
    return null === _oAreYouSurePanel ? !1 : !0;
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen
      ? J.call(window.document)
      : H.call(window.document.documentElement);
    sizeHandler();
  };
  this._onRestart = function () {
    s_oGame.onRestart();
  };
  this.resetFullscreenBut = function () {
    H && screenfull.isEnabled && A.setActive(s_bFullscreen);
  };
  s_oInterface = this;
  this._init();
  return this;
}
var s_oInterface = null;
function CPlayersInterface(a) {
  var c, b, e, h, m;
  this._init = function () {
    m = [void 0, void 0, void 0, void 0, void 0, void 0];
    e = new createjs.Container();
    s_oStage.addChild(e);
    c = 20;
    b = 10;
    e.x = c;
    e.y = b;
    h = createBitmap(s_oSpriteLibrary.getSprite("turn_panel"));
    e.addChild(h);
    for (
      var d = [34, 44], g = [34, 44], f = "turns" + s_iModeGame, l = 0;
      l < a.length;
      l++
    ) {
      var p = {
        images: [s_oSpriteLibrary.getSprite(f)],
        framerate: 0,
        frames: {
          width: d[s_iModeGame],
          height: g[s_iModeGame],
          regX: d[s_iModeGame] / 2,
          regY: g[s_iModeGame],
        },
      };
      p = new createjs.SpriteSheet(p);
      m[l] = createSprite(
        p,
        0,
        d[s_iModeGame] / 2,
        g[s_iModeGame] / 2,
        d[s_iModeGame],
        g[s_iModeGame]
      );
      m[l].x = 45;
      m[l].y = 79.5 + 50 * l;
      m[l].gotoAndStop(a[l]);
      m[l].visible = !0;
      e.addChild(m[l]);
    }
    for (d = a.length; 6 > d; d++);
  };
  this.setTurn = function (b) {
    m[b].gotoAndStop(a[b] + 6);
    for (var c = 0; c < a.length; c++) c !== b && m[c].gotoAndStop(a[c]);
  };
  this.refreshPosition = function (a) {
    e.x = c + a;
    e.y = b;
  };
  s_oPlayersInterface = this;
  this._init();
  return this;
}
var s_oPlayersInterface = null;
function CHelpPanel() {
  var a, c, b, e, h, m, d, g, f, l, p, q, u, k, t, v;
  this._init = function () {
    var z = s_oSpriteLibrary.getSprite("bg_help");
    u = createBitmap(z);
    u.x = CANVAS_WIDTH_HALF;
    u.y = CANVAS_HEIGHT_HALF;
    u.regX = 0.5 * z.width;
    u.regY = 0.5 * z.height;
    q = new createjs.Shape();
    q.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    q.alpha = 0.7;
    v = q.on("mousedown", function () {});
    k = new createjs.Container();
    k.addChild(q, u);
    s_oStage.addChild(k);
    b = new CTLText(
      k,
      CANVAS_WIDTH_HALF - 250,
      CANVAS_HEIGHT_HALF - 160,
      500,
      70,
      22,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_HELP_1,
      !0,
      !0,
      !0,
      !1
    );
    b.setOutline(4);
    new CTLText(
      k,
      CANVAS_WIDTH_HALF - 250,
      CANVAS_HEIGHT_HALF - 160,
      500,
      70,
      22,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_HELP_1,
      !0,
      !0,
      !0,
      !1
    );
    e = new CTLText(
      k,
      CANVAS_WIDTH_HALF - 110,
      CANVAS_HEIGHT_HALF - 30,
      320,
      40,
      22,
      "left",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_HELP2_PT1,
      !0,
      !0,
      !0,
      !1
    );
    e.setOutline(4);
    new CTLText(
      k,
      CANVAS_WIDTH_HALF - 110,
      CANVAS_HEIGHT_HALF - 30,
      320,
      40,
      22,
      "left",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_HELP2_PT1,
      !0,
      !0,
      !0,
      !1
    );
    h = new CTLText(
      k,
      CANVAS_WIDTH_HALF - 200,
      CANVAS_HEIGHT_HALF + 64,
      320,
      40,
      22,
      "right",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_HELP2_PT1,
      !0,
      !0,
      !1,
      !1
    );
    h.setOutline(4);
    m = new CTLText(
      k,
      CANVAS_WIDTH_HALF - 200,
      CANVAS_HEIGHT_HALF + 64,
      320,
      40,
      22,
      "right",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_HELP2_PT1,
      !0,
      !0,
      !1,
      !1
    );
    s_iModeGame === MODE_SNAKES
      ? (h.refreshText(TEXT_MODE0 + TEXT_HELP2_PT2),
        m.refreshText(TEXT_MODE0 + TEXT_HELP2_PT2))
      : (h.refreshText(TEXT_MODE1 + TEXT_HELP2_PT2),
        m.refreshText(TEXT_MODE1 + TEXT_HELP2_PT2));
    if (s_iModeGame === MODE_SNAKES) {
      var r = s_oSpriteLibrary.getSprite("help_ladder_sn"),
        y = s_oSpriteLibrary.getSprite("help_ladder_anim_sn");
      z = s_oSpriteLibrary.getSprite("help_ladder_anim_sn");
    } else
      (r = s_oSpriteLibrary.getSprite("help_ladder_ch")),
        (y = s_oSpriteLibrary.getSprite("help_ladder_anim_ch")),
        (z = s_oSpriteLibrary.getSprite("help_chute_anim"));
    d = createBitmap(r);
    d.regX = 0.5 * r.width;
    d.regY = 0.5 * r.height;
    d.x = CANVAS_WIDTH_HALF - 200;
    d.y = CANVAS_HEIGHT_HALF - 10;
    k.addChild(d);
    g = createBitmap(y);
    g.regX = 0.5 * y.width;
    g.regY = 0.5 * y.height;
    g.x = d.x + [35, 30][s_iModeGame];
    g.y = d.y + 10;
    k.addChild(g);
    new createjs.Tween.get(g, {
      loop: !0,
    })
      .to(
        {
          x: d.x - 25,
          y: d.y - 60,
        },
        1e3,
        createjs.Ease.cubicIn
      )
      .wait(500);
    r =
      s_iModeGame === MODE_SNAKES
        ? s_oSpriteLibrary.getSprite("help_snake")
        : s_oSpriteLibrary.getSprite("help_chute");
    p = createBitmap(r);
    p.regX = 0.5 * r.width;
    p.regY = 0.5 * r.height;
    p.x = CANVAS_WIDTH_HALF + 200;
    p.y = CANVAS_HEIGHT_HALF + 80;
    k.addChild(p);
    s_iModeGame === MODE_SNAKES
      ? ((f = createBitmap(z)),
        (f.regX = 0.5 * z.width),
        (f.regY = 0.5 * z.height),
        (f.x = p.x - 20),
        (f.y = p.y - 45),
        (f.scaleX = f.scaleY = 0.6),
        k.addChild(f),
        new createjs.Tween.get(f, {
          loop: !0,
        })
          .to(
            {
              x: p.x,
              y: p.y - 15,
            },
            300,
            createjs.Ease.linear
          )
          .to(
            {
              x: p.x + 25,
              y: p.y,
            },
            300,
            createjs.Ease.linear
          )
          .to(
            {
              x: p.x + 30,
              y: p.y + 10,
            },
            300,
            createjs.Ease.linear
          )
          .wait(500))
      : ((l = createBitmap(z)),
        (l.regX = 0.5 * z.width),
        (l.regY = 0.5 * z.height),
        (l.x = p.x - 25),
        (l.y = p.y - 35),
        (l.scaleX = l.scaleY = 0.6),
        k.addChild(l),
        new createjs.Tween.get(l, {
          loop: !0,
        })
          .to(
            {
              x: p.x,
              y: p.y - 15,
            },
            300,
            createjs.Ease.linear
          )
          .to(
            {
              x: p.x + 10,
              y: p.y,
            },
            300,
            createjs.Ease.linear
          )
          .to(
            {
              x: p.x + 35,
              y: p.y + 15,
            },
            300,
            createjs.Ease.linear
          )
          .wait(500));
    z = s_oSpriteLibrary.getSprite("but_skip_small");
    a = CANVAS_WIDTH_HALF;
    c = CANVAS_HEIGHT_HALF + 180;
    t = new CGfxButton(a, c, z, s_oStage);
    t.addEventListener(ON_MOUSE_UP, this._onExitHelp, this);
    q = new createjs.Shape();
    q.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(q);
    createjs.Tween.get(q)
      .to(
        {
          alpha: 0,
        },
        1e3
      )
      .call(function () {
        q.visible = !1;
      });
  };
  this.unload = function () {
    s_oStage.removeChild(k);
    t.unload();
    q.off("mousedown", v);
  };
  this._onExitHelp = function () {
    this.unload();
    setTimeout(s_oGame._onExitHelp, 200);
  };
  this._init();
}
function CEndPanel(a) {
  var c, b, e, h, m, d, g, f, l, p, q, u, k, t, v;
  this._init = function (a) {
    b = [];
    e = [];
    v = new createjs.Shape();
    v.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    v.alpha = 0;
    v.on("click", function () {});
    s_oStage.addChild(v);
    q = new createjs.Container();
    q.alpha = 1;
    q.visible = !1;
    q.y = CANVAS_HEIGHT;
    h = createBitmap(a);
    h.x = CANVAS_WIDTH_HALF;
    h.y = CANVAS_HEIGHT_HALF;
    h.regX = 0.5 * a.width;
    h.regY = 0.5 * a.height;
    q.addChild(h);
    m = new CTLText(
      q,
      CANVAS_WIDTH_HALF - 250,
      160,
      500,
      40,
      40,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_WIN,
      !0,
      !0,
      !1,
      !1
    );
    m.setOutline(5);
    d = new CTLText(
      q,
      CANVAS_WIDTH_HALF - 250,
      160,
      500,
      40,
      40,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_WIN,
      !0,
      !0,
      !1,
      !1
    );
    g = new CTLText(
      q,
      CANVAS_WIDTH_HALF - 250,
      220,
      500,
      40,
      20,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed,
      !0,
      !0,
      !1,
      !1
    );
    g.setOutline(5);
    f = new CTLText(
      q,
      CANVAS_WIDTH_HALF - 250,
      220,
      500,
      40,
      20,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed,
      !0,
      !0,
      !1,
      !1
    );
    l = new CTLText(
      q,
      CANVAS_WIDTH_HALF - 250,
      265,
      500,
      40,
      20,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_GAMES_WON + ": " + s_aGamesWon,
      !0,
      !0,
      !1,
      !1
    );
    l.setOutline(5);
    p = new CTLText(
      q,
      CANVAS_WIDTH_HALF - 250,
      265,
      500,
      40,
      20,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_GAMES_WON + ": " + s_aGamesWon,
      !0,
      !0,
      !1,
      !1
    );
    s_oStage.addChild(q);
    a = s_oSpriteLibrary.getSprite("but_home");
    u = new CGfxButton(CANVAS_WIDTH_HALF - 180, CANVAS_HEIGHT_HALF + 80, a, q);
    u.addEventListener(ON_MOUSE_DOWN, this._onExit, this);
    a = s_oSpriteLibrary.getSprite("but_check");
    k = new CGfxButton(CANVAS_WIDTH_HALF, CANVAS_HEIGHT_HALF + 80, a, q);
    k.addEventListener(ON_MOUSE_DOWN, this._onCheck, this);
    a = s_oSpriteLibrary.getSprite("but_restart");
    t = new CGfxButton(CANVAS_WIDTH_HALF + 180, CANVAS_HEIGHT_HALF + 80, a, q);
    t.addEventListener(ON_MOUSE_DOWN, this._onRestart, this);
    t.pulseAnimation();
  };
  this.unload = function () {
    createjs.Tween.get(q)
      .to(
        {
          alpha: 0,
        },
        500,
        createjs.Ease.cubicOut
      )
      .call(function () {
        s_oStage.removeChild(q);
        u.unload();
        u = null;
        v.removeAllEventListeners();
        t.unload();
        t = null;
        k.unload();
        k = null;
      });
  };
  this.hide = function () {
    v.visible = !1;
    q.visible = !1;
  };
  this.reShow = function () {
    v.visible = !0;
    q.visible = !0;
  };
  this.show = function (a) {
    q.visible = !0;
    v.visible = !0;
    a
      ? (m.refreshText(TEXT_WIN), d.refreshText(TEXT_WIN))
      : (m.refreshText(TEXT_LOSE), d.refreshText(TEXT_LOSE));
    g.refreshText(TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed);
    f.refreshText(TEXT_GAMES_PLAYED + ": " + s_aGamesPlayed);
    l.refreshText(TEXT_GAMES_WON + ": " + s_aGamesWon);
    p.refreshText(TEXT_GAMES_WON + ": " + s_aGamesWon);
    v.alpha = 0;
    createjs.Tween.get(v).to(
      {
        alpha: 0.5,
      },
      500,
      createjs.Ease.cubicOut
    );
    $(s_oMain).trigger("share_event", s_aGamesWon);
    $(s_oMain).trigger("save_score", s_aGamesWon);
    createjs.Tween.get(q)
      .wait(250)
      .to(
        {
          y: 0,
        },
        1250,
        createjs.Ease.elasticOut
      )
      .call(function () {
        $(s_oMain).trigger("show_interlevel_ad");
      });
  };
  this.addEventListener = function (a, c, d) {
    b[a] = c;
    e[a] = d;
  };
  this._onCheck = function () {
    c = ON_CHECK;
    b[c] && b[c].call(e[c]);
  };
  this._onRestart = function () {
    c = ON_RESTART;
    b[c] && b[c].call(e[c]);
  };
  this._onExit = function () {
    c = ON_BACK_MENU;
    b[c] && b[c].call(e[c]);
  };
  this.hideRestartButton = function () {
    t.setVisible(!1);
  };
  this.hideButtons = function () {
    u.setVisible(!1);
    t.setVisible(!1);
    k.setVisible(!1);
  };
  this.showButtons = function () {
    u.setVisible(!0);
    t.setVisible(!0);
    k.setVisible(!0);
  };
  this.changeMessage = function (a) {
    m.refreshText(a);
    d.refreshText(a);
  };
  this.centerRemainingButtons = function () {
    u.setX(CANVAS_WIDTH_HALF - 150);
    u.setVisible(!0);
    k.setX(CANVAS_WIDTH_HALF + 150);
    k.setVisible(!0);
  };
  this._init(a);
  return this;
}
function CMotivationalMsg(a) {
  var c, b, e, h, m, d;
  this._init = function () {
    h = 700;
    if (a !== MSG_DICE)
      switch (Math.floor(5 * Math.random())) {
        case 0:
          e = a === MSG_GOOD ? TEXT_MOTIVATIONAL0 : TEXT_DEMOTIVATIONAL0;
          break;
        case 1:
          e = a === MSG_GOOD ? TEXT_MOTIVATIONAL1 : TEXT_DEMOTIVATIONAL1;
          break;
        case 2:
          e = a === MSG_GOOD ? TEXT_MOTIVATIONAL2 : TEXT_DEMOTIVATIONAL2;
          break;
        case 3:
          e = a === MSG_GOOD ? TEXT_MOTIVATIONAL3 : TEXT_DEMOTIVATIONAL3;
          break;
        case 4:
          e = a === MSG_GOOD ? TEXT_MOTIVATIONAL4 : TEXT_DEMOTIVATIONAL4;
      }
    else e = TEXT_EXTRA_DICE;
    b = new createjs.Container();
    a !== MSG_DICE
      ? ((b.x = 0),
        (b.y = CANVAS_HEIGHT_HALF),
        (m = CANVAS_WIDTH + 300),
        (d = CANVAS_HEIGHT_HALF))
      : ((b.x = CANVAS_WIDTH_HALF),
        (b.y = -100),
        (m = CANVAS_WIDTH_HALF),
        (d = CANVAS_HEIGHT + 300));
    s_oStage.addChild(b);
    c = new CTLText(
      b,
      -350,
      40,
      700,
      40,
      60,
      "center",
      THIRD_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      e,
      !0,
      !0,
      !1,
      !1
    );
    c.setOutline(3);
    new CTLText(
      b,
      -350,
      40,
      700,
      40,
      60,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      e,
      !0,
      !0,
      !1,
      !1
    );
    new createjs.Tween.get(b)
      .to(
        {
          x: CANVAS_WIDTH_HALF,
          y: CANVAS_HEIGHT_HALF,
        },
        h,
        createjs.Ease.cubicIn
      )
      .call(this.exit);
  };
  this.exit = function () {
    new createjs.Tween.get(b)
      .wait(h)
      .to(
        {
          x: m,
          y: d,
        },
        0.5 * h,
        createjs.Ease.cubicOut
      )
      .call(function () {
        a === MSG_DICE
          ? s_oGame.extraDiceLaunch()
          : s_oMotivationalMsg.unload();
      });
  };
  this.unload = function () {
    s_oStage.removeChild(b);
    s_oMotivationalMsg = null;
  };
  s_oMotivationalMsg = this;
  this._init();
}
var s_oMotivationalMsg;
function CMsgBox(a, c) {
  var b, e;
  this._init = function (a) {
    e = new createjs.Container();
    m.addChild(e);
    a = new createjs.Shape();
    a.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    a.alpha = 0.5;
    a.on("click", function () {});
    e.addChild(a);
    a = s_oSpriteLibrary.getSprite("msg_box");
    var c = createBitmap(a);
    c.x = CANVAS_WIDTH_HALF;
    c.y = CANVAS_HEIGHT_HALF;
    c.regX = 0.5 * a.width;
    c.regY = 0.5 * a.height;
    e.addChild(c);
    new CTLText(
      e,
      CANVAS_WIDTH_HALF - 250,
      CANVAS_HEIGHT_HALF - 140,
      500,
      160,
      20,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_ERR_LS,
      !0,
      !0,
      !0,
      !1
    );
    b = new CGfxButton(
      CANVAS_WIDTH_HALF,
      CANVAS_HEIGHT_HALF + 100,
      s_oSpriteLibrary.getSprite("but_yes"),
      e
    );
    b.addEventListener(ON_MOUSE_UP, this._onButOk, this);
  };
  this._onButOk = function () {
    h.unload();
  };
  this.unload = function () {
    b.unload();
    m.removeChild(e);
  };
  var h = this;
  var m = c;
  this._init(a);
}
function CPlayersChoose(a) {
  var c, b, e, h, m, d, g, f, l, p, q, u, k, t, v, z, r, y;
  this._init = function () {
    c = CANVAS_WIDTH_HALF;
    b = CANVAS_HEIGHT_HALF - 20;
    y = a;
    g = createBitmap(s_oSpriteLibrary.getSprite("bg_game" + s_iModeGame));
    g.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(g);
    p = new createjs.Shape();
    p.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    p.alpha = 0.5;
    s_oStage.addChild(p);
    var B = s_oSpriteLibrary.getSprite("msg_box");
    f = createBitmap(B);
    f.x = 0.5 * CANVAS_WIDTH;
    f.y = 0.5 * CANVAS_HEIGHT;
    f.regX = 0.5 * B.width;
    f.regY = 0.5 * B.height;
    s_oStage.addChild(f);
    l = new createjs.Container();
    l.x = 682;
    l.y = 135;
    s_oStage.addChild(l);
    new CTLText(
      l,
      -250,
      30,
      500,
      40,
      40,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_PLAYERS,
      !0,
      !0,
      !1,
      !1
    ).setOutline(5);
    new CTLText(
      l,
      -250,
      30,
      500,
      40,
      40,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_PLAYERS,
      !0,
      !0,
      !1,
      !1
    );
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile)
      (B = s_oSpriteLibrary.getSprite("audio_icon")),
        (m = CANVAS_WIDTH - B.width / 2 - 50),
        (d = B.height / 2 + 10),
        (q = new CToggle(m, d, B, s_bAudioActive, s_oStage)),
        q.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
    B = [120, 120];
    var F = [128, 128],
      A = {
        images: [s_oSpriteLibrary.getSprite("but_play" + s_iModeGame)],
        framerate: 0,
        frames: {
          width: B[s_iModeGame],
          height: F[s_iModeGame],
          regX: B[s_iModeGame] / 2,
          regY: F[s_iModeGame] / 2,
        },
        animations: {
          0: [0, 0],
          1: [1, 1],
          2: [2, 2],
          3: [3, 3],
          4: [4, 4],
        },
      };
    A = new createjs.SpriteSheet(A);
    var C = 0.9 * B[s_iModeGame];
    k = new CSpritesheetButton(B[s_iModeGame], F[s_iModeGame], A, 0, s_oStage);
    k.setShape(0.5);
    k.setPosition(c - 2 * C, b + 3);
    k.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(2);
      },
      this
    );
    t = new CSpritesheetButton(B[s_iModeGame], F[s_iModeGame], A, 1, s_oStage);
    t.setShape(0.5);
    t.setPosition(c - C, b + 90);
    t.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(3);
      },
      this
    );
    v = new CSpritesheetButton(B[s_iModeGame], F[s_iModeGame], A, 2, s_oStage);
    v.setShape(0.5);
    v.setPosition(c, b);
    v.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(4);
      },
      this
    );
    z = new CSpritesheetButton(B[s_iModeGame], F[s_iModeGame], A, 3, s_oStage);
    z.setShape(0.5);
    z.setPosition(c + C, b + 90);
    z.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(5);
      },
      this
    );
    r = new CSpritesheetButton(B[s_iModeGame], F[s_iModeGame], A, 4, s_oStage);
    r.setShape(0.5);
    r.setPosition(c + 2 * C, b);
    r.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(6);
      },
      this
    );
    B = s_oSpriteLibrary.getSprite("but_exit");
    e = CANVAS_WIDTH - B.height / 2 - 10;
    h = B.height / 2 + 10;
    u = new CGfxButton(e, h, B, s_oStage);
    u.addEventListener(ON_MOUSE_UP, this._onExit, this);
    p = new createjs.Shape();
    p.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(p);
    createjs.Tween.get(p)
      .to(
        {
          alpha: 0,
        },
        1e3
      )
      .call(function () {
        p.visible = !1;
      });
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function (a, b) {
    u.setPosition(e - a, h);
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) ||
      q.setPosition(m - a, d);
  };
  this.unload = function () {
    u.unload();
    k.unload();
    k = u = null;
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile) q.unload(), (q = null);
    s_oStage.removeAllChildren();
    createjs.Tween.removeAllTweens();
    s_oPlayersChoose = null;
  };
  this._onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onButPlayRelease = function (a) {
    this.unload();
    s_oMain.gotoColourChoose(a, y);
  };
  s_oPlayersChoose = this;
  this._init();
}
var s_oPlayersChoose = null;
function CModeChoose() {
  var a, c, b, e, h, m, d, g, f, l, p, q, u, k;
  this._init = function () {
    a = CANVAS_WIDTH_HALF;
    c = CANVAS_HEIGHT_HALF + 30;
    d = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    d.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(d);
    l = new createjs.Shape();
    l.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    l.alpha = 0.5;
    s_oStage.addChild(l);
    var t = s_oSpriteLibrary.getSprite("msg_box");
    g = createBitmap(t);
    g.x = 0.5 * CANVAS_WIDTH;
    g.y = 0.5 * CANVAS_HEIGHT;
    g.regX = 0.5 * t.width;
    g.regY = 0.5 * t.height;
    s_oStage.addChild(g);
    f = new createjs.Container();
    f.x = 682;
    f.y = 135;
    s_oStage.addChild(f);
    new CTLText(
      f,
      -250,
      40,
      500,
      40,
      40,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_MODE,
      !0,
      !0,
      !1,
      !1
    ).setOutline(5);
    new CTLText(
      f,
      -250,
      40,
      500,
      40,
      40,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_MODE,
      !0,
      !0,
      !1,
      !1
    );
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile)
      (t = s_oSpriteLibrary.getSprite("audio_icon")),
        (h = CANVAS_WIDTH - t.width / 2 - 50),
        (m = t.height / 2 + 10),
        (p = new CToggle(h, m, t, s_bAudioActive, s_oStage)),
        p.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
    t = s_oSpriteLibrary.getSprite("but_mode0");
    u = new CGfxButton(a - 100, c, t, s_oStage);
    u.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(MODE_SNAKES);
      },
      this
    );
    t = s_oSpriteLibrary.getSprite("but_mode1");
    k = new CGfxButton(a + 100, c, t, s_oStage);
    k.addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButPlayRelease(MODE_CHUTES);
      },
      this
    );
    t = s_oSpriteLibrary.getSprite("but_exit");
    b = CANVAS_WIDTH - t.height / 2 - 10;
    e = t.height / 2 + 10;
    q = new CGfxButton(b, e, t, s_oStage);
    q.addEventListener(ON_MOUSE_UP, this._onExit, this);
    l = new createjs.Shape();
    l.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(l);
    createjs.Tween.get(l)
      .to(
        {
          alpha: 0,
        },
        1e3
      )
      .call(function () {
        l.visible = !1;
      });
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function (a, c) {
    q.setPosition(b - a, e);
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) ||
      p.setPosition(h - a, m);
  };
  this.unload = function () {
    q.unload();
    u.unload();
    k.unload();
    k = u = q = null;
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile) p.unload(), (p = null);
    s_oStage.removeAllChildren();
    createjs.Tween.removeAllTweens();
    s_iModeGame = s_oModeChoose = null;
  };
  this._onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onButPlayRelease = function (a) {
    this.unload();
    s_oMain.gotoModeSelection(a);
  };
  s_oModeChoose = this;
  this._init();
}
var s_oModeChoose = null;
function CColourChoose(a, c) {
  var b,
    e,
    h,
    m,
    d,
    g,
    f,
    l,
    p,
    q,
    u,
    k,
    t,
    v,
    z,
    r,
    y = 1,
    B;
  this._init = function () {
    t = new createjs.Container();
    s_oStage.addChild(t);
    d = c;
    g = createBitmap(s_oSpriteLibrary.getSprite("bg_game" + s_iModeGame));
    g.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    t.addChild(g);
    p = new createjs.Shape();
    p.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    p.alpha = 0.5;
    t.addChild(p);
    var a = s_oSpriteLibrary.getSprite("msg_box");
    f = createBitmap(a);
    f.x = 0.5 * CANVAS_WIDTH;
    f.y = 0.5 * CANVAS_HEIGHT;
    f.regX = 0.5 * a.width;
    f.regY = 0.5 * a.height;
    t.addChild(f);
    l = new createjs.Container();
    z = new CTLText(
      l,
      -250,
      40,
      500,
      40,
      40,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_COLOUR,
      !0,
      !0,
      !1,
      !1
    );
    z.setOutline(5);
    r = new CTLText(
      l,
      -250,
      40,
      500,
      40,
      40,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_SELECT_COLOUR,
      !0,
      !0,
      !1,
      !1
    );
    d === HUMAN_VS_HUMAN &&
      ((B = []),
      r.refreshText(TEXT_PLAYER_COLOUR.format(y)),
      z.refreshText(TEXT_PLAYER_COLOUR.format(y)));
    l.x = 682;
    l.y = 135;
    t.addChild(l);
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile)
      (a = s_oSpriteLibrary.getSprite("audio_icon")),
        (h = CANVAS_WIDTH - a.width / 2 - 60),
        (m = a.height / 2 + 20),
        (q = new CToggle(h, m, a, s_bAudioActive, s_oStage)),
        q.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
    v = new createjs.Container();
    t.addChild(v);
    a = [50, 30];
    var A = [52, 101],
      C = [155, 112],
      G = [0, 15],
      I = {
        images: [s_oSpriteLibrary.getSprite("playerbig_" + s_iModeGame)],
        framerate: 0,
        frames: {
          width: A[s_iModeGame],
          height: C[s_iModeGame],
          regX: A[s_iModeGame] / 2,
          regY: C[s_iModeGame] / 2,
        },
        animations: {
          0: [0, 0],
          1: [1, 1],
          2: [2, 2],
          3: [3, 3],
          4: [4, 4],
          5: [5, 5],
        },
      };
    I = new createjs.SpriteSheet(I);
    k = [];
    k[0] = new CSpritesheetButton(
      A[s_iModeGame] / 2,
      C[s_iModeGame] / 2,
      I,
      0,
      v
    );
    k[0].setShape(1);
    k[0].addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButColourRelease(0);
      },
      this
    );
    k[1] = new CSpritesheetButton(
      A[s_iModeGame] / 2,
      C[s_iModeGame] / 2,
      I,
      1,
      v
    );
    k[1].setShape(1);
    k[1].addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButColourRelease(1);
      },
      this
    );
    k[2] = new CSpritesheetButton(
      A[s_iModeGame] / 2,
      C[s_iModeGame] / 2,
      I,
      2,
      v
    );
    k[2].setShape(1);
    k[2].addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButColourRelease(2);
      },
      this
    );
    k[3] = new CSpritesheetButton(
      A[s_iModeGame] / 2,
      C[s_iModeGame] / 2,
      I,
      3,
      v
    );
    k[3].setShape(1);
    k[3].addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButColourRelease(3);
      },
      this
    );
    k[4] = new CSpritesheetButton(
      A[s_iModeGame] / 2,
      C[s_iModeGame] / 2,
      I,
      4,
      v
    );
    k[4].setShape(1);
    k[4].addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButColourRelease(4);
      },
      this
    );
    k[5] = new CSpritesheetButton(
      A[s_iModeGame] / 2,
      C[s_iModeGame] / 2,
      I,
      5,
      v
    );
    k[5].setShape(1);
    k[5].addEventListener(
      ON_MOUSE_UP,
      function () {
        this._onButColourRelease(5);
      },
      this
    );
    s_iModeGame === MODE_SNAKES
      ? k[0].setPosition(
          G[s_iModeGame] + a[s_iModeGame] / 2,
          C[s_iModeGame] / 1.5
        )
      : k[0].setPosition(
          G[s_iModeGame] + a[s_iModeGame] / 2 + a[s_iModeGame],
          C[s_iModeGame] / 1.5
        );
    k[1].setPosition(
      G[s_iModeGame] + ((A[s_iModeGame] / 2) * 2 + a[s_iModeGame]),
      C[s_iModeGame] / 1.5
    );
    k[2].setPosition(
      G[s_iModeGame] + ((A[s_iModeGame] / 2) * 3 + 2 * a[s_iModeGame]),
      C[s_iModeGame] / 1.5
    );
    k[3].setPosition(
      G[s_iModeGame] + ((A[s_iModeGame] / 2) * 4 + 3 * a[s_iModeGame]),
      C[s_iModeGame] / 1.5
    );
    k[4].setPosition(
      G[s_iModeGame] + ((A[s_iModeGame] / 2) * 5 + 4 * a[s_iModeGame]),
      C[s_iModeGame] / 1.5
    );
    k[5].setPosition(
      G[s_iModeGame] + ((A[s_iModeGame] / 2) * 6 + 5 * a[s_iModeGame]),
      C[s_iModeGame] / 1.5
    );
    a = v.getBounds();
    v.x = CANVAS_WIDTH_HALF;
    v.y = CANVAS_HEIGHT_HALF;
    v.regX = a.width / 2;
    v.regY = a.height / 2;
    a = s_oSpriteLibrary.getSprite("but_exit");
    b = CANVAS_WIDTH - a.height / 2 - 20;
    e = a.height / 2 + 20;
    u = new CGfxButton(b, e, a, s_oStage);
    u.addEventListener(ON_MOUSE_UP, this._onExit, this);
    p = new createjs.Shape();
    p.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(p);
    createjs.Tween.get(p)
      .to(
        {
          alpha: 0,
        },
        1e3
      )
      .call(function () {
        p.visible = !1;
      });
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function (a, c) {
    u.setPosition(b - a, e);
    (!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile) ||
      q.setPosition(h - a, m);
  };
  this.unload = function () {
    u.unload();
    u = null;
    if (!1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile) q.unload(), (q = null);
    s_oStage.removeAllChildren();
    createjs.Tween.removeAllTweens();
    s_oColourChoose = null;
  };
  this._onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onButColourRelease = function (b) {
    d === HUMAN_VS_CPU
      ? (this.unload(), s_oMain.gotoGame(a, b, d))
      : ((B[y - 1] = b),
        y++,
        k[b].setVisible(!1),
        r.refreshText(TEXT_PLAYER_COLOUR.format(y)),
        z.refreshText(TEXT_PLAYER_COLOUR.format(y)),
        y > a && (this.unload(), s_oMain.gotoGame(a, b, d, B)));
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen
      ? null.call(window.document)
      : null.call(window.document.documentElement);
    sizeHandler();
  };
  this.resetFullscreenBut = function () {};
  s_oColourChoose = this;
  this._init();
}
var s_oColourChoose = null;
function CCreditsPanel() {
  var a, c, b, e, h, m, d, g, f, l, p, q;
  this._init = function () {
    b = new createjs.Shape();
    b.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    b.alpha = 0.5;
    s_oStage.addChild(b);
    var u = s_oSpriteLibrary.getSprite("msg_box");
    q = new createjs.Container();
    q.y = CANVAS_HEIGHT + u.height / 2;
    s_oStage.addChild(q);
    e = createBitmap(u);
    e.regX = u.width / 2;
    e.regY = u.height / 2;
    e.x = CANVAS_WIDTH_HALF;
    e.y = CANVAS_HEIGHT_HALF;
    q.addChild(e);
    g = new createjs.Text(
      TEXT_CREDITS_DEVELOPED,
      "40px " + PRIMARY_FONT,
      SECONDARY_FONT_COLOR
    );
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.x = CANVAS_WIDTH_HALF;
    g.y = CANVAS_HEIGHT_HALF - 75;
    g.outline = 5;
    q.addChild(g);
    d = new createjs.Text(
      TEXT_CREDITS_DEVELOPED,
      "40px " + PRIMARY_FONT,
      PRIMARY_FONT_COLOR
    );
    d.textAlign = "center";
    d.textBaseline = "alphabetic";
    d.x = g.x;
    d.y = g.y;
    q.addChild(d);
    u = s_oSpriteLibrary.getSprite("logo_ctl");
    h = createBitmap(u);
    h.regX = u.width / 2;
    h.regY = u.height / 2;
    h.x = CANVAS_WIDTH_HALF;
    h.y = CANVAS_HEIGHT_HALF - 5;
    q.addChild(h);
    p = new createjs.Text(
      TEXT_LINK,
      "28px " + PRIMARY_FONT,
      SECONDARY_FONT_COLOR
    );
    p.textAlign = "center";
    p.textBaseline = "alphabetic";
    p.x = CANVAS_WIDTH_HALF;
    p.y = CANVAS_HEIGHT_HALF + 75;
    p.outline = 5;
    q.addChild(p);
    l = new createjs.Text(
      TEXT_LINK,
      "28px " + PRIMARY_FONT,
      PRIMARY_FONT_COLOR
    );
    l.textAlign = "center";
    l.textBaseline = "alphabetic";
    l.x = p.x;
    l.y = p.y;
    q.addChild(l);
    f = new createjs.Shape();
    f.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    f.alpha = 0.01;
    _oListener = f.on("click", this._onLogoButRelease);
    q.addChild(f);
    s_bMobile || (f.cursor = "pointer");
    u = s_oSpriteLibrary.getSprite("but_exit");
    a = CANVAS_WIDTH_HALF + 230;
    c = CANVAS_HEIGHT_HALF - 130;
    m = new CGfxButton(a, c, u, q);
    m.addEventListener(ON_MOUSE_UP, this.unload, this);
    new createjs.Tween.get(q).to(
      {
        y: 0,
      },
      1e3,
      createjs.Ease.backOut
    );
  };
  this.unload = function () {
    f.off("click", _oListener);
    m.unload();
    m = null;
    s_oStage.removeChild(q, b);
  };
  this._onLogoButRelease = function () {
    window.open("http://afzalimdad9.vercel.app?&l=en", "_blank");
  };
  this._init();
}
function CPause() {
  var a;
  this._init = function () {
    var c = new createjs.Container();
    c.alpha = 0;
    a = new createjs.Shape();
    a.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    a.alpha = 0.5;
    var b = new createjs.Shape();
    b.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    a.hitArea = b;
    c.addChild(a);
    b = new createjs.Text(TEXT_PAUSE, "50px " + PRIMARY_FONT, THIRD_FONT_COLOR);
    b.x = 0.5 * CANVAS_WIDTH;
    b.y = 0.5 * CANVAS_HEIGHT - 130;
    b.textAlign = "center";
    b.outline = 5;
    c.addChild(b);
    var e = new createjs.Text(
      TEXT_PAUSE,
      "50px " + PRIMARY_FONT,
      PRIMARY_FONT_COLOR
    );
    e.x = b.x;
    e.y = b.y;
    e.textAlign = "center";
    c.addChild(e);
    b = s_oSpriteLibrary.getSprite("but_continue");
    new CGfxButton(
      0.5 * CANVAS_WIDTH,
      0.5 * CANVAS_HEIGHT + 70,
      b,
      c
    ).addEventListenerWithParams(ON_MOUSE_UP, this._onLeavePause, this, c);
    s_oStage.addChild(c);
    createjs.Tween.get(c).to(
      {
        alpha: 1,
      },
      300,
      createjs.quartOut
    );
  };
  this.unload = function () {
    s_oStage.removeChild(void 0);
  };
  this._onLeavePause = function (a) {
    console.log("leave pause");
    createjs.Tween.get(a)
      .to(
        {
          alpha: 0,
        },
        300,
        createjs.quartIn
      )
      .call(function () {
        s_oInterface.unloadPause();
        s_oGame.pause(!1);
      });
  };
  this._init();
  return this;
}
function CPauseButton(a) {
  var c, b, e, h, m;
  this.init = function (a) {
    s_oGame.pause(!0);
    h = new createjs.Container();
    m = a;
    m.addChild(h);
    c = new createjs.Shape();
    c.graphics.beginFill("#black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.alpha = 0.7;
    c.on("mousedown", function () {
      d.onExit();
    });
    s_bMobile || (c.cursor = "pointer");
    b = new createjs.Text(
      TEXT_PAUSE,
      " 40px " + PRIMARY_FONT,
      THIRD_FONT_COLOR
    );
    b.textBaseline = "alphabetic";
    b.textAlign = "center";
    b.x = CANVAS_WIDTH_HALF;
    b.y = CANVAS_HEIGHT_HALF;
    b.outline = 5;
    e = new createjs.Text(
      TEXT_PAUSE,
      " 40px " + PRIMARY_FONT,
      PRIMARY_FONT_COLOR
    );
    e.textBaseline = b.textBaseline;
    e.textAlign = b.textAlign;
    e.x = b.x;
    e.y = b.y;
    b.alpha = e.alpha = 1;
    h.addChild(c, b, e);
  };
  this.onExit = function () {
    c.alpha = 0;
    b.alpha = 0;
    e.alpha = 0;
    s_oStage.removeChild(h);
    s_oGame.pause(!1);
  };
  var d = this;
  this.init(a);
}
function CAreYouSurePanel() {
  var a, c, b, e, h, m;
  this._init = function () {
    e = new createjs.Shape();
    e.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    e.alpha = 0.5;
    m = e.on("mousedown", function () {});
    s_oStage.addChild(e);
    new createjs.Tween.get(e).to(
      {
        alpha: 0.7,
      },
      500
    );
    h = new createjs.Container();
    s_oStage.addChild(h);
    var d = s_oSpriteLibrary.getSprite("msg_box"),
      f = createBitmap(d);
    f.regX = d.width / 2;
    f.regY = d.height / 2;
    f.x = CANVAS_WIDTH_HALF;
    f.y = CANVAS_HEIGHT_HALF;
    h.addChild(f);
    h.y = CANVAS_HEIGHT + d.height / 2;
    a = h.y;
    new createjs.Tween.get(h).to(
      {
        y: 0,
      },
      1e3,
      createjs.Ease.backOut
    );
    new CTLText(
      h,
      CANVAS_WIDTH_HALF - 200,
      CANVAS_HEIGHT_HALF - 140,
      400,
      120,
      50,
      "center",
      SECONDARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_ARE_SURE,
      !0,
      !0,
      !0,
      !1
    ).setOutline(5);
    new CTLText(
      h,
      CANVAS_WIDTH_HALF - 200,
      CANVAS_HEIGHT_HALF - 140,
      400,
      120,
      50,
      "center",
      PRIMARY_FONT_COLOR,
      PRIMARY_FONT,
      1,
      0,
      0,
      TEXT_ARE_SURE,
      !0,
      !0,
      !0,
      !1
    );
    d = CANVAS_HEIGHT_HALF + 60;
    c = new CGfxButton(
      CANVAS_WIDTH_HALF + 100,
      d,
      s_oSpriteLibrary.getSprite("but_yes"),
      h
    );
    c.addEventListener(ON_MOUSE_UP, this._onButYes, this);
    b = new CGfxButton(
      CANVAS_WIDTH_HALF - 100,
      d,
      s_oSpriteLibrary.getSprite("but_no"),
      h
    );
    b.addEventListener(ON_MOUSE_UP, this._onButNo, this);
    s_oGame.pause(!0);
  };
  this._onButYes = function () {
    new createjs.Tween.get(e).to(
      {
        alpha: 0,
      },
      500
    );
    new createjs.Tween.get(h)
      .to(
        {
          y: a,
        },
        400,
        createjs.Ease.backIn
      )
      .call(function () {
        d.unload();
        s_oGame.onExit();
      });
  };
  this._onButNo = function () {
    s_oInterface.closePanel();
    new createjs.Tween.get(e).to(
      {
        alpha: 0,
      },
      500
    );
    new createjs.Tween.get(h)
      .to(
        {
          y: a,
        },
        400,
        createjs.Ease.backIn
      )
      .call(function () {
        d.unload();
      });
    s_oGame.pause(!1);
  };
  this.unload = function () {
    b.unload();
    c.unload();
    s_oStage.removeChild(e);
    s_oStage.removeChild(h);
    e.off("mousedown", m);
  };
  var d = this;
  this._init();
}
function CBezier() {
  var a, c, b, e, h, m, d, g, f, l, p, q;
  this.init = function (u, k, t, v) {
    a = u;
    c = k;
    b = t;
    h = a.x - 2 * c.x + b.x;
    m = a.y - 2 * c.y + b.y;
    d = 2 * c.x - 2 * a.x;
    g = 2 * c.y - 2 * a.y;
    f = 4 * (h * h + m * m);
    l = 4 * (h * d + m * g);
    p = d * d + g * g;
    q = this._length(1);
    e = Math.floor(q / v);
    q % v > v / 2 && e++;
    return e;
  };
  this._speed = function (a) {
    return Math.sqrt(f * a * a + l * a + p);
  };
  this._length = function (a) {
    var b = Math.sqrt(p + a * (l + f * a));
    return (
      (2 * Math.sqrt(f) * (2 * f * a * b + l * (b - Math.sqrt(p))) +
        (l * l - 4 * f * p) *
          (Math.log(l + 2 * Math.sqrt(f) * Math.sqrt(p)) -
            Math.log(l + 2 * f * a + 2 * Math.sqrt(f) * b))) /
      (8 * Math.pow(f, 1.5))
    );
  };
  this.invertL = function (a, b) {
    var c = a;
    do {
      var d = c - (this._length(c) - b) / this._speed(c);
      if (1e-6 > Math.abs(c - d)) break;
      c = d;
    } while (1);
    return d;
  };
  this.getAnchorPoint = function (d) {
    if (0 <= d && d <= e) {
      var f = d / e;
      f = this.invertL(f, f * q);
      d = (1 - f) * (1 - f) * a.x + 2 * (1 - f) * f * c.x + f * f * b.x;
      var g = (1 - f) * (1 - f) * a.y + 2 * (1 - f) * f * c.y + f * f * b.y,
        h = new createjs.Point(
          (1 - f) * a.x + f * c.x,
          (1 - f) * a.y + f * c.y
        );
      f = new createjs.Point((1 - f) * c.x + f * b.x, (1 - f) * c.y + f * b.y);
      return [d, g, (180 * Math.atan2(f.y - h.y, f.x - h.x)) / Math.PI];
    }
    return [];
  };
}
CTLText.prototype = {
  constructor: CTLText,
  __autofit: function () {
    if (this._bFitText) {
      for (
        var a = this._iFontSize;
        (this._oText.getBounds().height > this._iHeight - 2 * this._iPaddingV ||
          this._oText.getBounds().width > this._iWidth - 2 * this._iPaddingH) &&
        !(a--,
        (this._oText.font = a + "px " + this._szFont),
        (this._oText.lineHeight = Math.round(a * this._fLineHeightFactor)),
        this.__updateY(),
        this.__verticalAlign(),
        8 > a);

      );
      this._iFontSize = a;
    }
  },
  __verticalAlign: function () {
    if (this._bVerticalAlign) {
      var a = this._oText.getBounds().height;
      this._oText.y -= (a - this._iHeight) / 2 + this._iPaddingV;
    }
  },
  __updateY: function () {
    this._oText.y = this._y + this._iPaddingV;
    switch (this._oText.textBaseline) {
      case "middle":
        this._oText.y +=
          this._oText.lineHeight / 2 +
          (this._iFontSize * this._fLineHeightFactor - this._iFontSize);
    }
  },
  __createText: function (a) {
    this._bDebug &&
      ((this._oDebugShape = new createjs.Shape()),
      this._oDebugShape.graphics
        .beginFill("rgba(255,0,0,0.5)")
        .drawRect(this._x, this._y, this._iWidth, this._iHeight),
      this._oContainer.addChild(this._oDebugShape));
    this._oText = new createjs.Text(
      a,
      this._iFontSize + "px " + this._szFont,
      this._szColor
    );
    this._oText.textBaseline = "middle";
    this._oText.lineHeight = Math.round(
      this._iFontSize * this._fLineHeightFactor
    );
    this._oText.textAlign = this._szAlign;
    this._oText.lineWidth = this._bMultiline
      ? this._iWidth - 2 * this._iPaddingH
      : null;
    switch (this._szAlign) {
      case "center":
        this._oText.x = this._x + this._iWidth / 2;
        break;
      case "left":
        this._oText.x = this._x + this._iPaddingH;
        break;
      case "right":
        this._oText.x = this._x + this._iWidth - this._iPaddingH;
    }
    this._oContainer.addChild(this._oText);
    this.refreshText(a);
  },
  setVerticalAlign: function (a) {
    this._bVerticalAlign = a;
  },
  setOutline: function (a) {
    null !== this._oText && (this._oText.outline = a);
  },
  setShadow: function (a, c, b, e) {
    null !== this._oText &&
      (this._oText.shadow = new createjs.Shadow(a, c, b, e));
  },
  setColor: function (a) {
    this._oText.color = a;
  },
  setAlpha: function (a) {
    this._oText.alpha = a;
  },
  removeTweens: function () {
    createjs.Tween.removeTweens(this._oText);
  },
  setX: function (a) {
    this._oText.x = a;
  },
  getText: function () {
    return this._oText;
  },
  getY: function () {
    return this._y;
  },
  getFontSize: function () {
    return this._iFontSize;
  },
  refreshText: function (a) {
    "" === a && (a = " ");
    null === this._oText && this.__createText(a);
    this._oText.text = a;
    this._oText.font = this._iFontSize + "px " + this._szFont;
    this._oText.lineHeight = Math.round(
      this._iFontSize * this._fLineHeightFactor
    );
    this.__autofit();
    this.__updateY();
    this.__verticalAlign();
  },
};
function CTLText(a, c, b, e, h, m, d, g, f, l, p, q, u, k, t, v, z) {
  this._oContainer = a;
  this._x = c;
  this._y = b;
  this._iWidth = e;
  this._iHeight = h;
  this._bMultiline = v;
  this._iFontSize = m;
  this._szAlign = d;
  this._szColor = g;
  this._szFont = f;
  this._iPaddingH = p;
  this._iPaddingV = q;
  this._bVerticalAlign = t;
  this._bFitText = k;
  this._bDebug = z;
  this._oDebugShape = null;
  this._fLineHeightFactor = l;
  this._oText = null;
  u && this.__createText(u);
}
