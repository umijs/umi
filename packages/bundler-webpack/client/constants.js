export var DEFAULT_DEVTOOL = 'cheap-module-source-map';
export var DEFAULT_OUTPUT_PATH = 'dist';
export var MFSU_NAME = 'MFSU';
export var MESSAGE_TYPE;

(function (MESSAGE_TYPE) {
  MESSAGE_TYPE["ok"] = "ok";
  MESSAGE_TYPE["warnings"] = "warnings";
  MESSAGE_TYPE["errors"] = "errors";
  MESSAGE_TYPE["hash"] = "hash";
  MESSAGE_TYPE["stillOk"] = "still-ok";
  MESSAGE_TYPE["invalid"] = "invalid";
})(MESSAGE_TYPE || (MESSAGE_TYPE = {}));

export var DEFAULT_BROWSER_TARGETS = {
  chrome: 80
};
export var DEFAULT_ESBUILD_TARGET_KEYS = ['chrome', 'firefox', 'edge', 'safari'];