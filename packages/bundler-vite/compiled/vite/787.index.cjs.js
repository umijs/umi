"use strict";
exports.id = 787;
exports.ids = [787];
exports.modules = {

/***/ 5365:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "l": function() { return /* binding */ lib; }
/* harmony export */ });
/* harmony import */ var node_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1041);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9411);
/* harmony import */ var node_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2033);




const __filename = (0,node_url__WEBPACK_IMPORTED_MODULE_0__.fileURLToPath)("file:///Users/xierenhong/Downloads/github/umi/node_modules/.pnpm/vite@3.1.8/node_modules/vite/dist/node/chunks/dep-07a79996.js");
const __dirname = (0,node_path__WEBPACK_IMPORTED_MODULE_1__.dirname)(__filename);
const require = (0,node_module__WEBPACK_IMPORTED_MODULE_2__.createRequire)("file:///Users/xierenhong/Downloads/github/umi/node_modules/.pnpm/vite@3.1.8/node_modules/vite/dist/node/chunks/dep-07a79996.js");
const __require = (/* unused pure expression or super */ null && (require));
var openParentheses = "(".charCodeAt(0);
var closeParentheses = ")".charCodeAt(0);
var singleQuote = "'".charCodeAt(0);
var doubleQuote = '"'.charCodeAt(0);
var backslash = "\\".charCodeAt(0);
var slash = "/".charCodeAt(0);
var comma = ",".charCodeAt(0);
var colon = ":".charCodeAt(0);
var star = "*".charCodeAt(0);
var uLower = "u".charCodeAt(0);
var uUpper = "U".charCodeAt(0);
var plus = "+".charCodeAt(0);
var isUnicodeRange = /^[a-f0-9?-]+$/i;

var parse$1 = function(input) {
  var tokens = [];
  var value = input;

  var next,
    quote,
    prev,
    token,
    escape,
    escapePos,
    whitespacePos,
    parenthesesOpenPos;
  var pos = 0;
  var code = value.charCodeAt(pos);
  var max = value.length;
  var stack = [{ nodes: tokens }];
  var balanced = 0;
  var parent;

  var name = "";
  var before = "";
  var after = "";

  while (pos < max) {
    // Whitespaces
    if (code <= 32) {
      next = pos;
      do {
        next += 1;
        code = value.charCodeAt(next);
      } while (code <= 32);
      token = value.slice(pos, next);

      prev = tokens[tokens.length - 1];
      if (code === closeParentheses && balanced) {
        after = token;
      } else if (prev && prev.type === "div") {
        prev.after = token;
        prev.sourceEndIndex += token.length;
      } else if (
        code === comma ||
        code === colon ||
        (code === slash &&
          value.charCodeAt(next + 1) !== star &&
          (!parent ||
            (parent && parent.type === "function" && parent.value !== "calc")))
      ) {
        before = token;
      } else {
        tokens.push({
          type: "space",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      }

      pos = next;

      // Quotes
    } else if (code === singleQuote || code === doubleQuote) {
      next = pos;
      quote = code === singleQuote ? "'" : '"';
      token = {
        type: "string",
        sourceIndex: pos,
        quote: quote
      };
      do {
        escape = false;
        next = value.indexOf(quote, next + 1);
        if (~next) {
          escapePos = next;
          while (value.charCodeAt(escapePos - 1) === backslash) {
            escapePos -= 1;
            escape = !escape;
          }
        } else {
          value += quote;
          next = value.length - 1;
          token.unclosed = true;
        }
      } while (escape);
      token.value = value.slice(pos + 1, next);
      token.sourceEndIndex = token.unclosed ? next : next + 1;
      tokens.push(token);
      pos = next + 1;
      code = value.charCodeAt(pos);

      // Comments
    } else if (code === slash && value.charCodeAt(pos + 1) === star) {
      next = value.indexOf("*/", pos);

      token = {
        type: "comment",
        sourceIndex: pos,
        sourceEndIndex: next + 2
      };

      if (next === -1) {
        token.unclosed = true;
        next = value.length;
        token.sourceEndIndex = next;
      }

      token.value = value.slice(pos + 2, next);
      tokens.push(token);

      pos = next + 2;
      code = value.charCodeAt(pos);

      // Operation within calc
    } else if (
      (code === slash || code === star) &&
      parent &&
      parent.type === "function" &&
      parent.value === "calc"
    ) {
      token = value[pos];
      tokens.push({
        type: "word",
        sourceIndex: pos - before.length,
        sourceEndIndex: pos + token.length,
        value: token
      });
      pos += 1;
      code = value.charCodeAt(pos);

      // Dividers
    } else if (code === slash || code === comma || code === colon) {
      token = value[pos];

      tokens.push({
        type: "div",
        sourceIndex: pos - before.length,
        sourceEndIndex: pos + token.length,
        value: token,
        before: before,
        after: ""
      });
      before = "";

      pos += 1;
      code = value.charCodeAt(pos);

      // Open parentheses
    } else if (openParentheses === code) {
      // Whitespaces after open parentheses
      next = pos;
      do {
        next += 1;
        code = value.charCodeAt(next);
      } while (code <= 32);
      parenthesesOpenPos = pos;
      token = {
        type: "function",
        sourceIndex: pos - name.length,
        value: name,
        before: value.slice(parenthesesOpenPos + 1, next)
      };
      pos = next;

      if (name === "url" && code !== singleQuote && code !== doubleQuote) {
        next -= 1;
        do {
          escape = false;
          next = value.indexOf(")", next + 1);
          if (~next) {
            escapePos = next;
            while (value.charCodeAt(escapePos - 1) === backslash) {
              escapePos -= 1;
              escape = !escape;
            }
          } else {
            value += ")";
            next = value.length - 1;
            token.unclosed = true;
          }
        } while (escape);
        // Whitespaces before closed
        whitespacePos = next;
        do {
          whitespacePos -= 1;
          code = value.charCodeAt(whitespacePos);
        } while (code <= 32);
        if (parenthesesOpenPos < whitespacePos) {
          if (pos !== whitespacePos + 1) {
            token.nodes = [
              {
                type: "word",
                sourceIndex: pos,
                sourceEndIndex: whitespacePos + 1,
                value: value.slice(pos, whitespacePos + 1)
              }
            ];
          } else {
            token.nodes = [];
          }
          if (token.unclosed && whitespacePos + 1 !== next) {
            token.after = "";
            token.nodes.push({
              type: "space",
              sourceIndex: whitespacePos + 1,
              sourceEndIndex: next,
              value: value.slice(whitespacePos + 1, next)
            });
          } else {
            token.after = value.slice(whitespacePos + 1, next);
            token.sourceEndIndex = next;
          }
        } else {
          token.after = "";
          token.nodes = [];
        }
        pos = next + 1;
        token.sourceEndIndex = token.unclosed ? next : pos;
        code = value.charCodeAt(pos);
        tokens.push(token);
      } else {
        balanced += 1;
        token.after = "";
        token.sourceEndIndex = pos + 1;
        tokens.push(token);
        stack.push(token);
        tokens = token.nodes = [];
        parent = token;
      }
      name = "";

      // Close parentheses
    } else if (closeParentheses === code && balanced) {
      pos += 1;
      code = value.charCodeAt(pos);

      parent.after = after;
      parent.sourceEndIndex += after.length;
      after = "";
      balanced -= 1;
      stack[stack.length - 1].sourceEndIndex = pos;
      stack.pop();
      parent = stack[balanced];
      tokens = parent.nodes;

      // Words
    } else {
      next = pos;
      do {
        if (code === backslash) {
          next += 1;
        }
        next += 1;
        code = value.charCodeAt(next);
      } while (
        next < max &&
        !(
          code <= 32 ||
          code === singleQuote ||
          code === doubleQuote ||
          code === comma ||
          code === colon ||
          code === slash ||
          code === openParentheses ||
          (code === star &&
            parent &&
            parent.type === "function" &&
            parent.value === "calc") ||
          (code === slash &&
            parent.type === "function" &&
            parent.value === "calc") ||
          (code === closeParentheses && balanced)
        )
      );
      token = value.slice(pos, next);

      if (openParentheses === code) {
        name = token;
      } else if (
        (uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) &&
        plus === token.charCodeAt(1) &&
        isUnicodeRange.test(token.slice(2))
      ) {
        tokens.push({
          type: "unicode-range",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      } else {
        tokens.push({
          type: "word",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      }

      pos = next;
    }
  }

  for (pos = stack.length - 1; pos; pos -= 1) {
    stack[pos].unclosed = true;
    stack[pos].sourceEndIndex = value.length;
  }

  return stack[0].nodes;
};

var walk$1 = function walk(nodes, cb, bubble) {
  var i, max, node, result;

  for (i = 0, max = nodes.length; i < max; i += 1) {
    node = nodes[i];
    if (!bubble) {
      result = cb(node, i, nodes);
    }

    if (
      result !== false &&
      node.type === "function" &&
      Array.isArray(node.nodes)
    ) {
      walk(node.nodes, cb, bubble);
    }

    if (bubble) {
      cb(node, i, nodes);
    }
  }
};

function stringifyNode(node, custom) {
  var type = node.type;
  var value = node.value;
  var buf;
  var customResult;

  if (custom && (customResult = custom(node)) !== undefined) {
    return customResult;
  } else if (type === "word" || type === "space") {
    return value;
  } else if (type === "string") {
    buf = node.quote || "";
    return buf + value + (node.unclosed ? "" : buf);
  } else if (type === "comment") {
    return "/*" + value + (node.unclosed ? "" : "*/");
  } else if (type === "div") {
    return (node.before || "") + value + (node.after || "");
  } else if (Array.isArray(node.nodes)) {
    buf = stringify$1(node.nodes, custom);
    if (type !== "function") {
      return buf;
    }
    return (
      value +
      "(" +
      (node.before || "") +
      buf +
      (node.after || "") +
      (node.unclosed ? "" : ")")
    );
  }
  return value;
}

function stringify$1(nodes, custom) {
  var result, i;

  if (Array.isArray(nodes)) {
    result = "";
    for (i = nodes.length - 1; ~i; i -= 1) {
      result = stringifyNode(nodes[i], custom) + result;
    }
    return result;
  }
  return stringifyNode(nodes, custom);
}

var stringify_1 = stringify$1;

var unit;
var hasRequiredUnit;

function requireUnit () {
	if (hasRequiredUnit) return unit;
	hasRequiredUnit = 1;
	var minus = "-".charCodeAt(0);
	var plus = "+".charCodeAt(0);
	var dot = ".".charCodeAt(0);
	var exp = "e".charCodeAt(0);
	var EXP = "E".charCodeAt(0);

	// Check if three code points would start a number
	// https://www.w3.org/TR/css-syntax-3/#starts-with-a-number
	function likeNumber(value) {
	  var code = value.charCodeAt(0);
	  var nextCode;

	  if (code === plus || code === minus) {
	    nextCode = value.charCodeAt(1);

	    if (nextCode >= 48 && nextCode <= 57) {
	      return true;
	    }

	    var nextNextCode = value.charCodeAt(2);

	    if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
	      return true;
	    }

	    return false;
	  }

	  if (code === dot) {
	    nextCode = value.charCodeAt(1);

	    if (nextCode >= 48 && nextCode <= 57) {
	      return true;
	    }

	    return false;
	  }

	  if (code >= 48 && code <= 57) {
	    return true;
	  }

	  return false;
	}

	// Consume a number
	// https://www.w3.org/TR/css-syntax-3/#consume-number
	unit = function(value) {
	  var pos = 0;
	  var length = value.length;
	  var code;
	  var nextCode;
	  var nextNextCode;

	  if (length === 0 || !likeNumber(value)) {
	    return false;
	  }

	  code = value.charCodeAt(pos);

	  if (code === plus || code === minus) {
	    pos++;
	  }

	  while (pos < length) {
	    code = value.charCodeAt(pos);

	    if (code < 48 || code > 57) {
	      break;
	    }

	    pos += 1;
	  }

	  code = value.charCodeAt(pos);
	  nextCode = value.charCodeAt(pos + 1);

	  if (code === dot && nextCode >= 48 && nextCode <= 57) {
	    pos += 2;

	    while (pos < length) {
	      code = value.charCodeAt(pos);

	      if (code < 48 || code > 57) {
	        break;
	      }

	      pos += 1;
	    }
	  }

	  code = value.charCodeAt(pos);
	  nextCode = value.charCodeAt(pos + 1);
	  nextNextCode = value.charCodeAt(pos + 2);

	  if (
	    (code === exp || code === EXP) &&
	    ((nextCode >= 48 && nextCode <= 57) ||
	      ((nextCode === plus || nextCode === minus) &&
	        nextNextCode >= 48 &&
	        nextNextCode <= 57))
	  ) {
	    pos += nextCode === plus || nextCode === minus ? 3 : 2;

	    while (pos < length) {
	      code = value.charCodeAt(pos);

	      if (code < 48 || code > 57) {
	        break;
	      }

	      pos += 1;
	    }
	  }

	  return {
	    number: value.slice(0, pos),
	    unit: value.slice(pos)
	  };
	};
	return unit;
}

var parse = parse$1;
var walk = walk$1;
var stringify = stringify_1;

function ValueParser(value) {
  if (this instanceof ValueParser) {
    this.nodes = parse(value);
    return this;
  }
  return new ValueParser(value);
}

ValueParser.prototype.toString = function() {
  return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
};

ValueParser.prototype.walk = function(cb, bubble) {
  walk(this.nodes, cb, bubble);
  return this;
};

ValueParser.unit = requireUnit();

ValueParser.walk = walk;

ValueParser.stringify = stringify;

var lib = ValueParser;




/***/ }),

/***/ 5787:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "i": function() { return /* binding */ index; }
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1017);
/* harmony import */ var resolve__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9830);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7147);
/* harmony import */ var _dep_07a79996_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5365);
/* harmony import */ var node_url__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1041);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9411);
/* harmony import */ var node_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2033);









const __filename = (0,node_url__WEBPACK_IMPORTED_MODULE_4__.fileURLToPath)("file:///Users/xierenhong/Downloads/github/umi/node_modules/.pnpm/vite@3.1.8/node_modules/vite/dist/node/chunks/dep-42c2c4e4.js");
const __dirname = (0,node_path__WEBPACK_IMPORTED_MODULE_5__.dirname)(__filename);
const require = (0,node_module__WEBPACK_IMPORTED_MODULE_6__.createRequire)("file:///Users/xierenhong/Downloads/github/umi/node_modules/.pnpm/vite@3.1.8/node_modules/vite/dist/node/chunks/dep-42c2c4e4.js");
const __require = require;
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    var e = m[i];
    if (typeof e !== 'string' && !Array.isArray(e)) { for (var k in e) {
      if (k !== 'default' && !(k in n)) {
        n[k] = e[k];
      }
    } }
  }
  return n;
}

var joinMedia$1 = function (parentMedia, childMedia) {
  if (!parentMedia.length && childMedia.length) return childMedia
  if (parentMedia.length && !childMedia.length) return parentMedia
  if (!parentMedia.length && !childMedia.length) return []

  const media = [];

  parentMedia.forEach(parentItem => {
    childMedia.forEach(childItem => {
      if (parentItem !== childItem) media.push(`${parentItem} and ${childItem}`);
    });
  });

  return media
};

var joinLayer$1 = function (parentLayer, childLayer) {
  if (!parentLayer.length && childLayer.length) return childLayer
  if (parentLayer.length && !childLayer.length) return parentLayer
  if (!parentLayer.length && !childLayer.length) return []

  return parentLayer.concat(childLayer)
};

// external tooling
const resolve$1 = resolve__WEBPACK_IMPORTED_MODULE_1__;

const moduleDirectories = ["web_modules", "node_modules"];

function resolveModule(id, opts) {
  return new Promise((res, rej) => {
    resolve$1(id, opts, (err, path) => (err ? rej(err) : res(path)));
  })
}

var resolveId$1 = function (id, base, options) {
  const paths = options.path;

  const resolveOpts = {
    basedir: base,
    moduleDirectory: moduleDirectories.concat(options.addModulesDirectories),
    paths,
    extensions: [".css"],
    packageFilter: function processPackage(pkg) {
      if (pkg.style) pkg.main = pkg.style;
      else if (!pkg.main || !/\.css$/.test(pkg.main)) pkg.main = "index.css";
      return pkg
    },
    preserveSymlinks: false,
  };

  return resolveModule(`./${id}`, resolveOpts)
    .catch(() => resolveModule(id, resolveOpts))
    .catch(() => {
      if (paths.indexOf(base) === -1) paths.unshift(base);

      throw new Error(
        `Failed to find '${id}'
  in [
    ${paths.join(",\n        ")}
  ]`
      )
    })
};

var readCache$1 = {exports: {}};

var pify$2 = {exports: {}};

var processFn = function (fn, P, opts) {
	return function () {
		var that = this;
		var args = new Array(arguments.length);

		for (var i = 0; i < arguments.length; i++) {
			args[i] = arguments[i];
		}

		return new P(function (resolve, reject) {
			args.push(function (err, result) {
				if (err) {
					reject(err);
				} else if (opts.multiArgs) {
					var results = new Array(arguments.length - 1);

					for (var i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});

			fn.apply(that, args);
		});
	};
};

var pify$1 = pify$2.exports = function (obj, P, opts) {
	if (typeof P !== 'function') {
		opts = P;
		P = Promise;
	}

	opts = opts || {};
	opts.exclude = opts.exclude || [/.+Sync$/];

	var filter = function (key) {
		var match = function (pattern) {
			return typeof pattern === 'string' ? key === pattern : pattern.test(key);
		};

		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	var ret = typeof obj === 'function' ? function () {
		if (opts.excludeMain) {
			return obj.apply(this, arguments);
		}

		return processFn(obj, P, opts).apply(this, arguments);
	} : {};

	return Object.keys(obj).reduce(function (ret, key) {
		var x = obj[key];

		ret[key] = typeof x === 'function' && filter(key) ? processFn(x, P, opts) : x;

		return ret;
	}, ret);
};

pify$1.all = pify$1;

var fs = fs__WEBPACK_IMPORTED_MODULE_2__;
var path$2 = path__WEBPACK_IMPORTED_MODULE_0__;
var pify = pify$2.exports;

var stat = pify(fs.stat);
var readFile = pify(fs.readFile);
var resolve = path$2.resolve;

var cache = Object.create(null);

function convert(content, encoding) {
	if (Buffer.isEncoding(encoding)) {
		return content.toString(encoding);
	}
	return content;
}

readCache$1.exports = function (path, encoding) {
	path = resolve(path);

	return stat(path).then(function (stats) {
		var item = cache[path];

		if (item && item.mtime.getTime() === stats.mtime.getTime()) {
			return convert(item.content, encoding);
		}

		return readFile(path).then(function (data) {
			cache[path] = {
				mtime: stats.mtime,
				content: data
			};

			return convert(data, encoding);
		});
	}).catch(function (err) {
		cache[path] = null;
		return Promise.reject(err);
	});
};

readCache$1.exports.sync = function (path, encoding) {
	path = resolve(path);

	try {
		var stats = fs.statSync(path);
		var item = cache[path];

		if (item && item.mtime.getTime() === stats.mtime.getTime()) {
			return convert(item.content, encoding);
		}

		var data = fs.readFileSync(path);

		cache[path] = {
			mtime: stats.mtime,
			content: data
		};

		return convert(data, encoding);
	} catch (err) {
		cache[path] = null;
		throw err;
	}

};

readCache$1.exports.get = function (path, encoding) {
	path = resolve(path);
	if (cache[path]) {
		return convert(cache[path].content, encoding);
	}
	return null;
};

readCache$1.exports.clear = function () {
	cache = Object.create(null);
};

const readCache = readCache$1.exports;

var loadContent$1 = filename => readCache(filename, "utf-8");

// builtin tooling
const path$1 = path__WEBPACK_IMPORTED_MODULE_0__;

// placeholder tooling
let sugarss;

var processContent$1 = function processContent(
  result,
  content,
  filename,
  options,
  postcss
) {
  const { plugins } = options;
  const ext = path$1.extname(filename);

  const parserList = [];

  // SugarSS support:
  if (ext === ".sss") {
    if (!sugarss) {
      try {
        sugarss = __require('sugarss');
      } catch {} // Ignore
    }
    if (sugarss)
      return runPostcss(postcss, content, filename, plugins, [sugarss])
  }

  // Syntax support:
  if (result.opts.syntax?.parse) {
    parserList.push(result.opts.syntax.parse);
  }

  // Parser support:
  if (result.opts.parser) parserList.push(result.opts.parser);
  // Try the default as a last resort:
  parserList.push(null);

  return runPostcss(postcss, content, filename, plugins, parserList)
};

function runPostcss(postcss, content, filename, plugins, parsers, index) {
  if (!index) index = 0;
  return postcss(plugins)
    .process(content, {
      from: filename,
      parser: parsers[index],
    })
    .catch(err => {
      // If there's an error, try the next parser
      index++;
      // If there are no parsers left, throw it
      if (index === parsers.length) throw err
      return runPostcss(postcss, content, filename, plugins, parsers, index)
    })
}

// external tooling
const valueParser = _dep_07a79996_js__WEBPACK_IMPORTED_MODULE_3__.l;

// extended tooling
const { stringify } = valueParser;

function split(params, start) {
  const list = [];
  const last = params.reduce((item, node, index) => {
    if (index < start) return ""
    if (node.type === "div" && node.value === ",") {
      list.push(item);
      return ""
    }
    return item + stringify(node)
  }, "");
  list.push(last);
  return list
}

var parseStatements$1 = function (result, styles) {
  const statements = [];
  let nodes = [];

  styles.each(node => {
    let stmt;
    if (node.type === "atrule") {
      if (node.name === "import") stmt = parseImport(result, node);
      else if (node.name === "media") stmt = parseMedia(result, node);
      else if (node.name === "charset") stmt = parseCharset(result, node);
    }

    if (stmt) {
      if (nodes.length) {
        statements.push({
          type: "nodes",
          nodes,
          media: [],
          layer: [],
        });
        nodes = [];
      }
      statements.push(stmt);
    } else nodes.push(node);
  });

  if (nodes.length) {
    statements.push({
      type: "nodes",
      nodes,
      media: [],
      layer: [],
    });
  }

  return statements
};

function parseMedia(result, atRule) {
  const params = valueParser(atRule.params).nodes;
  return {
    type: "media",
    node: atRule,
    media: split(params, 0),
    layer: [],
  }
}

function parseCharset(result, atRule) {
  if (atRule.prev()) {
    return result.warn("@charset must precede all other statements", {
      node: atRule,
    })
  }
  return {
    type: "charset",
    node: atRule,
    media: [],
    layer: [],
  }
}

function parseImport(result, atRule) {
  let prev = atRule.prev();
  if (prev) {
    do {
      if (
        prev.type !== "comment" &&
        (prev.type !== "atrule" ||
          (prev.name !== "import" &&
            prev.name !== "charset" &&
            !(prev.name === "layer" && !prev.nodes)))
      ) {
        return result.warn(
          "@import must precede all other statements (besides @charset or empty @layer)",
          { node: atRule }
        )
      }
      prev = prev.prev();
    } while (prev)
  }

  if (atRule.nodes) {
    return result.warn(
      "It looks like you didn't end your @import statement correctly. " +
        "Child nodes are attached to it.",
      { node: atRule }
    )
  }

  const params = valueParser(atRule.params).nodes;
  const stmt = {
    type: "import",
    node: atRule,
    media: [],
    layer: [],
  };

  // prettier-ignore
  if (
    !params.length ||
    (
      params[0].type !== "string" ||
      !params[0].value
    ) &&
    (
      params[0].type !== "function" ||
      params[0].value !== "url" ||
      !params[0].nodes.length ||
      !params[0].nodes[0].value
    )
  ) {
    return result.warn(`Unable to find uri in '${  atRule.toString()  }'`, {
      node: atRule,
    })
  }

  if (params[0].type === "string") stmt.uri = params[0].value;
  else stmt.uri = params[0].nodes[0].value;
  stmt.fullUri = stringify(params[0]);

  let remainder = params;
  if (remainder.length > 2) {
    if (
      (remainder[2].type === "word" || remainder[2].type === "function") &&
      remainder[2].value === "layer"
    ) {
      if (remainder[1].type !== "space") {
        return result.warn("Invalid import layer statement", { node: atRule })
      }

      if (remainder[2].nodes) {
        stmt.layer = [stringify(remainder[2].nodes)];
      } else {
        stmt.layer = [""];
      }
      remainder = remainder.slice(2);
    }
  }

  if (remainder.length > 2) {
    if (remainder[1].type !== "space") {
      return result.warn("Invalid import media statement", { node: atRule })
    }

    stmt.media = split(remainder, 2);
  }

  return stmt
}

// builtin tooling
const path = path__WEBPACK_IMPORTED_MODULE_0__;

// internal tooling
const joinMedia = joinMedia$1;
const joinLayer = joinLayer$1;
const resolveId = resolveId$1;
const loadContent = loadContent$1;
const processContent = processContent$1;
const parseStatements = parseStatements$1;

function AtImport(options) {
  options = {
    root: process.cwd(),
    path: [],
    skipDuplicates: true,
    resolve: resolveId,
    load: loadContent,
    plugins: [],
    addModulesDirectories: [],
    nameLayer: null,
    ...options,
  };

  options.root = path.resolve(options.root);

  // convert string to an array of a single element
  if (typeof options.path === "string") options.path = [options.path];

  if (!Array.isArray(options.path)) options.path = [];

  options.path = options.path.map(p => path.resolve(options.root, p));

  return {
    postcssPlugin: "postcss-import",
    Once(styles, { result, atRule, postcss }) {
      const state = {
        importedFiles: {},
        hashFiles: {},
        rootFilename: null,
        anonymousLayerCounter: 0,
      };

      if (styles.source?.input?.file) {
        state.rootFilename = styles.source.input.file;
        state.importedFiles[styles.source.input.file] = {};
      }

      if (options.plugins && !Array.isArray(options.plugins)) {
        throw new Error("plugins option must be an array")
      }

      if (options.nameLayer && typeof options.nameLayer !== "function") {
        throw new Error("nameLayer option must be a function")
      }

      return parseStyles(result, styles, options, state, [], []).then(
        bundle => {
          applyRaws(bundle);
          applyMedia(bundle);
          applyStyles(bundle, styles);
        }
      )

      function applyRaws(bundle) {
        bundle.forEach((stmt, index) => {
          if (index === 0) return

          if (stmt.parent) {
            const { before } = stmt.parent.node.raws;
            if (stmt.type === "nodes") stmt.nodes[0].raws.before = before;
            else stmt.node.raws.before = before;
          } else if (stmt.type === "nodes") {
            stmt.nodes[0].raws.before = stmt.nodes[0].raws.before || "\n";
          }
        });
      }

      function applyMedia(bundle) {
        bundle.forEach(stmt => {
          if (
            (!stmt.media.length && !stmt.layer.length) ||
            stmt.type === "charset"
          ) {
            return
          }

          if (stmt.type === "import") {
            stmt.node.params = `${stmt.fullUri} ${stmt.media.join(", ")}`;
          } else if (stmt.type === "media") {
            if (stmt.layer.length) {
              const layerNode = atRule({
                name: "layer",
                params: stmt.layer.filter(layer => layer !== "").join("."),
                source: stmt.node.source,
              });

              if (stmt.parentMedia?.length) {
                const mediaNode = atRule({
                  name: "media",
                  params: stmt.parentMedia.join(", "),
                  source: stmt.node.source,
                });

                mediaNode.append(layerNode);
                layerNode.append(stmt.node);
                stmt.node = mediaNode;
              } else {
                layerNode.append(stmt.node);
                stmt.node = layerNode;
              }
            } else {
              stmt.node.params = stmt.media.join(", ");
            }
          } else {
            const { nodes } = stmt;
            const { parent } = nodes[0];

            let outerAtRule;
            let innerAtRule;
            if (stmt.media.length && stmt.layer.length) {
              const mediaNode = atRule({
                name: "media",
                params: stmt.media.join(", "),
                source: parent.source,
              });

              const layerNode = atRule({
                name: "layer",
                params: stmt.layer.filter(layer => layer !== "").join("."),
                source: parent.source,
              });

              mediaNode.append(layerNode);
              innerAtRule = layerNode;
              outerAtRule = mediaNode;
            } else if (stmt.media.length) {
              const mediaNode = atRule({
                name: "media",
                params: stmt.media.join(", "),
                source: parent.source,
              });

              innerAtRule = mediaNode;
              outerAtRule = mediaNode;
            } else if (stmt.layer.length) {
              const layerNode = atRule({
                name: "layer",
                params: stmt.layer.filter(layer => layer !== "").join("."),
                source: parent.source,
              });

              innerAtRule = layerNode;
              outerAtRule = layerNode;
            }

            parent.insertBefore(nodes[0], outerAtRule);

            // remove nodes
            nodes.forEach(node => {
              node.parent = undefined;
            });

            // better output
            nodes[0].raws.before = nodes[0].raws.before || "\n";

            // wrap new rules with media query and/or layer at rule
            innerAtRule.append(nodes);

            stmt.type = "media";
            stmt.node = outerAtRule;
            delete stmt.nodes;
          }
        });
      }

      function applyStyles(bundle, styles) {
        styles.nodes = [];

        // Strip additional statements.
        bundle.forEach(stmt => {
          if (["charset", "import", "media"].includes(stmt.type)) {
            stmt.node.parent = undefined;
            styles.append(stmt.node);
          } else if (stmt.type === "nodes") {
            stmt.nodes.forEach(node => {
              node.parent = undefined;
              styles.append(node);
            });
          }
        });
      }

      function parseStyles(result, styles, options, state, media, layer) {
        const statements = parseStatements(result, styles);

        return Promise.resolve(statements)
          .then(stmts => {
            // process each statement in series
            return stmts.reduce((promise, stmt) => {
              return promise.then(() => {
                stmt.media = joinMedia(media, stmt.media || []);
                stmt.parentMedia = media;
                stmt.layer = joinLayer(layer, stmt.layer || []);

                // skip protocol base uri (protocol://url) or protocol-relative
                if (
                  stmt.type !== "import" ||
                  /^(?:[a-z]+:)?\/\//i.test(stmt.uri)
                ) {
                  return
                }

                if (options.filter && !options.filter(stmt.uri)) {
                  // rejected by filter
                  return
                }

                return resolveImportId(result, stmt, options, state)
              })
            }, Promise.resolve())
          })
          .then(() => {
            let charset;
            const imports = [];
            const bundle = [];

            function handleCharset(stmt) {
              if (!charset) charset = stmt;
              // charsets aren't case-sensitive, so convert to lower case to compare
              else if (
                stmt.node.params.toLowerCase() !==
                charset.node.params.toLowerCase()
              ) {
                throw new Error(
                  `Incompatable @charset statements:
  ${stmt.node.params} specified in ${stmt.node.source.input.file}
  ${charset.node.params} specified in ${charset.node.source.input.file}`
                )
              }
            }

            // squash statements and their children
            statements.forEach(stmt => {
              if (stmt.type === "charset") handleCharset(stmt);
              else if (stmt.type === "import") {
                if (stmt.children) {
                  stmt.children.forEach((child, index) => {
                    if (child.type === "import") imports.push(child);
                    else if (child.type === "charset") handleCharset(child);
                    else bundle.push(child);
                    // For better output
                    if (index === 0) child.parent = stmt;
                  });
                } else imports.push(stmt);
              } else if (stmt.type === "media" || stmt.type === "nodes") {
                bundle.push(stmt);
              }
            });

            return charset
              ? [charset, ...imports.concat(bundle)]
              : imports.concat(bundle)
          })
      }

      function resolveImportId(result, stmt, options, state) {
        const atRule = stmt.node;
        let sourceFile;
        if (atRule.source?.input?.file) {
          sourceFile = atRule.source.input.file;
        }
        const base = sourceFile
          ? path.dirname(atRule.source.input.file)
          : options.root;

        return Promise.resolve(options.resolve(stmt.uri, base, options))
          .then(paths => {
            if (!Array.isArray(paths)) paths = [paths];
            // Ensure that each path is absolute:
            return Promise.all(
              paths.map(file => {
                return !path.isAbsolute(file)
                  ? resolveId(file, base, options)
                  : file
              })
            )
          })
          .then(resolved => {
            // Add dependency messages:
            resolved.forEach(file => {
              result.messages.push({
                type: "dependency",
                plugin: "postcss-import",
                file,
                parent: sourceFile,
              });
            });

            return Promise.all(
              resolved.map(file => {
                return loadImportContent(result, stmt, file, options, state)
              })
            )
          })
          .then(result => {
            // Merge loaded statements
            stmt.children = result.reduce((result, statements) => {
              return statements ? result.concat(statements) : result
            }, []);
          })
      }

      function loadImportContent(result, stmt, filename, options, state) {
        const atRule = stmt.node;
        const { media, layer } = stmt;
        layer.forEach((layerPart, i) => {
          if (layerPart === "") {
            if (options.nameLayer) {
              layer[i] = options
                .nameLayer(state.anonymousLayerCounter++, state.rootFilename)
                .toString();
            } else {
              throw atRule.error(
                `When using anonymous layers in @import you must also set the "nameLayer" plugin option`
              )
            }
          }
        });

        if (options.skipDuplicates) {
          // skip files already imported at the same scope
          if (state.importedFiles[filename]?.[media]?.[layer]) {
            return
          }

          // save imported files to skip them next time
          if (!state.importedFiles[filename]) {
            state.importedFiles[filename] = {};
          }
          if (!state.importedFiles[filename][media]) {
            state.importedFiles[filename][media] = {};
          }
          state.importedFiles[filename][media][layer] = true;
        }

        return Promise.resolve(options.load(filename, options)).then(
          content => {
            if (content.trim() === "") {
              result.warn(`${filename} is empty`, { node: atRule });
              return
            }

            // skip previous imported files not containing @import rules
            if (state.hashFiles[content]?.[media]?.[layer]) {
              return
            }

            return processContent(
              result,
              content,
              filename,
              options,
              postcss
            ).then(importedResult => {
              const styles = importedResult.root;
              result.messages = result.messages.concat(importedResult.messages);

              if (options.skipDuplicates) {
                const hasImport = styles.some(child => {
                  return child.type === "atrule" && child.name === "import"
                });
                if (!hasImport) {
                  // save hash files to skip them next time
                  if (!state.hashFiles[content]) {
                    state.hashFiles[content] = {};
                  }
                  if (!state.hashFiles[content][media]) {
                    state.hashFiles[content][media] = {};
                  }
                  state.hashFiles[content][media][layer] = true;
                }
              }

              // recursion: import @import from imported file
              return parseStyles(result, styles, options, state, media, layer)
            })
          }
        )
      }
    },
  }
}

AtImport.postcss = true;

var postcssImport = AtImport;

var index = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  'default': postcssImport
}, [postcssImport]);




/***/ })

};
;