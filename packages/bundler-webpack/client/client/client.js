var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// client.ts
import stripAnsi from "@umijs/utils/compiled/strip-ansi";
import * as ErrorOverlay from "react-error-overlay";
import { MESSAGE_TYPE } from "../constants";
import { formatWebpackMessages } from "../utils/formatWebpackMessages";
var require_client = __commonJS({
  "client.ts"(exports, module) {
    console.log("[webpack] connecting...");
    function getHost() {
      if (process.env.SOCKET_SERVER) {
        return new URL(process.env.SOCKET_SERVER);
      }
      return location;
    }
    function getSocketUrl() {
      let h = getHost();
      const host = h.host;
      const isHttps = h.protocol === "https:";
      return `${isHttps ? "wss" : "ws"}://${host}`;
    }
    function getPingUrl() {
      const h = getHost();
      return `${h.protocol}//${h.host}/__umi_ping`;
    }
    var pingTimer = null;
    var isFirstCompilation = true;
    var mostRecentCompilationHash = null;
    var hasCompileErrors = false;
    var hadRuntimeError = false;
    var pingUrl = getPingUrl();
    var socket = new WebSocket(getSocketUrl(), "webpack-hmr");
    socket.addEventListener("message", (_0) => __async(exports, [_0], function* ({ data }) {
      data = JSON.parse(data);
      if (data.type === "connected") {
        console.log(`[webpack] connected.`);
        pingTimer = setInterval(() => socket.send("ping"), 3e4);
      } else {
        handleMessage(data).catch(console.error);
      }
    }));
    function waitForSuccessfulPing(ms = 1e3) {
      return __async(this, null, function* () {
        while (true) {
          try {
            yield fetch(pingUrl);
            break;
          } catch (e) {
            yield new Promise((resolve) => setTimeout(resolve, ms));
          }
        }
      });
    }
    socket.addEventListener("close", () => __async(exports, null, function* () {
      if (pingTimer)
        clearInterval(pingTimer);
      console.info("[webpack] Dev server disconnected. Polling for restart...");
      yield waitForSuccessfulPing();
      location.reload();
    }));
    ErrorOverlay.startReportingRuntimeErrors({
      onError: function() {
        hadRuntimeError = true;
      },
      filename: "/static/js/bundle.js"
    });
    if (module.hot && typeof module.hot.dispose === "function") {
      module.hot.dispose(function() {
        ErrorOverlay.stopReportingRuntimeErrors();
      });
    }
    function handleAvailableHash(hash) {
      mostRecentCompilationHash = hash;
    }
    function handleSuccess() {
      const isHotUpdate = !isFirstCompilation;
      isFirstCompilation = false;
      hasCompileErrors = false;
      if (isHotUpdate) {
        tryApplyUpdates(function onHotUpdateSuccess() {
          tryDismissErrorOverlay();
        });
      }
    }
    function handleWarnings(warnings) {
      const isHotUpdate = !isFirstCompilation;
      isFirstCompilation = false;
      hasCompileErrors = false;
      const formatted = formatWebpackMessages({
        warnings,
        errors: []
      });
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        for (let i = 0; i < formatted.warnings.length; i++) {
          if (i === 5) {
            console.warn("There were more warnings in other files.\nYou can find a complete log in the terminal.");
            break;
          }
          console.warn(stripAnsi(formatted.warnings[i]));
        }
      }
      if (isHotUpdate) {
        tryApplyUpdates(function onSuccessfulHotUpdate() {
          tryDismissErrorOverlay();
        });
      }
    }
    function handleErrors(errors) {
      isFirstCompilation = false;
      hasCompileErrors = true;
      const formatted = formatWebpackMessages({
        warnings: [],
        errors
      });
      ErrorOverlay.reportBuildError(formatted.errors[0]);
      if (typeof console !== "undefined" && typeof console.error === "function") {
        for (let i = 0; i < formatted.errors.length; i++) {
          console.error(stripAnsi(formatted.errors[i]));
        }
      }
    }
    function tryDismissErrorOverlay() {
      if (!hasCompileErrors) {
        ErrorOverlay.dismissBuildError();
      }
    }
    function isUpdateAvailable() {
      return mostRecentCompilationHash !== __webpack_hash__;
    }
    function canApplyUpdates() {
      return module.hot.status() === "idle";
    }
    function canAcceptErrors() {
      const hasReactRefresh = process.env.FAST_REFRESH;
      const status = module.hot.status();
      return hasReactRefresh && ["abort", "fail"].indexOf(status) === -1;
    }
    function tryApplyUpdates(onHotUpdateSuccess) {
      if (!module.hot) {
        window.location.reload();
        return;
      }
      if (!isUpdateAvailable() || !canApplyUpdates()) {
        return;
      }
      function handleApplyUpdates(err, updatedModules) {
        const haveErrors = err || hadRuntimeError;
        const needsForcedReload = !err && !updatedModules;
        if (haveErrors && !canAcceptErrors() || needsForcedReload) {
          window.location.reload();
        }
        if (onHotUpdateSuccess)
          onHotUpdateSuccess();
        if (isUpdateAvailable()) {
          tryApplyUpdates();
        }
      }
      module.hot.check(true).then((updatedModules) => {
        handleApplyUpdates(null, updatedModules);
      }).catch((err) => {
        handleApplyUpdates(err, null);
      });
    }
    function handleMessage(payload) {
      return __async(this, null, function* () {
        switch (payload.type) {
          case MESSAGE_TYPE.hash:
            handleAvailableHash(payload.data);
            break;
          case MESSAGE_TYPE.stillOk:
          case MESSAGE_TYPE.ok:
            handleSuccess();
            break;
          case MESSAGE_TYPE.errors:
            handleErrors(payload.data);
            break;
          case MESSAGE_TYPE.warnings:
            handleWarnings(payload.data);
            break;
          default:
        }
      });
    }
  }
});
export default require_client();
