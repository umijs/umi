exports.id = 967;
exports.ids = [967];
exports.modules = {

/***/ 3571:
/***/ (function(module) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;


/***/ }),

/***/ 6750:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


// A linked list to keep track of recently-used-ness
const Yallist = __webpack_require__(7350)

const MAX = Symbol('max')
const LENGTH = Symbol('length')
const LENGTH_CALCULATOR = Symbol('lengthCalculator')
const ALLOW_STALE = Symbol('allowStale')
const MAX_AGE = Symbol('maxAge')
const DISPOSE = Symbol('dispose')
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
const LRU_LIST = Symbol('lruList')
const CACHE = Symbol('cache')
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')

const naiveLength = () => 1

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options }

    if (!options)
      options = {}

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    const max = this[MAX] = options.max || Infinity

    const lc = options.length || naiveLength
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
    this[ALLOW_STALE] = options.stale || false
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0
    this[DISPOSE] = options.dispose
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
    this.reset()
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity
    trim(this)
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA
    trim(this)
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC
      this[LENGTH] = 0
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
        this[LENGTH] += hit.length
      })
    }
    trim(this)
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev
      forEachStep(this, fn, walker, thisp)
      walker = prev
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next
      forEachStep(this, fn, walker, thisp)
      walker = next
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
    }

    this[CACHE] = new Map() // hash of items by key
    this[LRU_LIST] = new Yallist() // list of items in order of use recency
    this[LENGTH] = 0 // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE]

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0
    const len = this[LENGTH_CALCULATOR](value, key)

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key))
        return false
      }

      const node = this[CACHE].get(key)
      const item = node.value

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value)
      }

      item.now = now
      item.maxAge = maxAge
      item.value = value
      this[LENGTH] += len - item.length
      item.length = len
      this.get(key)
      trim(this)
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge)

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value)

      return false
    }

    this[LENGTH] += hit.length
    this[LRU_LIST].unshift(hit)
    this[CACHE].set(key, this[LRU_LIST].head)
    trim(this)
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail
    if (!node)
      return null

    del(this, node)
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key))
  }

  load (arr) {
    // reset the cache
    this.reset()

    const now = Date.now()
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l]
      const expiresAt = hit.e || 0
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v)
      else {
        const maxAge = expiresAt - now
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge)
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false))
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key)
  if (node) {
    const hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now()
        self[LRU_LIST].unshiftNode(node)
      }
    }
    return hit.value
  }
}

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
}

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

const del = (self, node) => {
  if (node) {
    const hit = node.value
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value)

    self[LENGTH] -= hit.length
    self[CACHE].delete(hit.key)
    self[LRU_LIST].removeNode(node)
  }
}

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key
    this.value = value
    this.length = length
    this.now = now
    this.maxAge = maxAge || 0
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!self[ALLOW_STALE])
      hit = undefined
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self)
}

module.exports = LRUCache


/***/ }),

/***/ 3167:
/***/ (function(module, exports) {

exports = module.exports = SemVer

var debug
/* istanbul ignore next */
if (typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('SEMVER')
    console.log.apply(console, args)
  }
} else {
  debug = function () {}
}

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0'

var MAX_LENGTH = 256
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16

var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6

// The actual regexps go on exports.re
var re = exports.re = []
var safeRe = exports.safeRe = []
var src = exports.src = []
var t = exports.tokens = {}
var R = 0

function tok (n) {
  t[n] = R++
}

var LETTERDASHNUMBER = '[a-zA-Z0-9-]'

// Replace some greedy regex tokens to prevent regex dos issues. These regex are
// used internally via the safeRe object since all inputs in this library get
// normalized first to trim and collapse all extra whitespace. The original
// regexes are exported for userland consumption and lower level usage. A
// future breaking change could export the safer regex only with a note that
// all input should have extra whitespace removed.
var safeRegexReplacements = [
  ['\\s', 1],
  ['\\d', MAX_LENGTH],
  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
]

function makeSafeRe (value) {
  for (var i = 0; i < safeRegexReplacements.length; i++) {
    var token = safeRegexReplacements[i][0]
    var max = safeRegexReplacements[i][1]
    value = value
      .split(token + '*').join(token + '{0,' + max + '}')
      .split(token + '+').join(token + '{1,' + max + '}')
  }
  return value
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

tok('NUMERICIDENTIFIER')
src[t.NUMERICIDENTIFIER] = '0|[1-9]\\d*'
tok('NUMERICIDENTIFIERLOOSE')
src[t.NUMERICIDENTIFIERLOOSE] = '\\d+'

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

tok('NONNUMERICIDENTIFIER')
src[t.NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-]' + LETTERDASHNUMBER + '*'

// ## Main Version
// Three dot-separated numeric identifiers.

tok('MAINVERSION')
src[t.MAINVERSION] = '(' + src[t.NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[t.NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[t.NUMERICIDENTIFIER] + ')'

tok('MAINVERSIONLOOSE')
src[t.MAINVERSIONLOOSE] = '(' + src[t.NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[t.NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[t.NUMERICIDENTIFIERLOOSE] + ')'

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

tok('PRERELEASEIDENTIFIER')
src[t.PRERELEASEIDENTIFIER] = '(?:' + src[t.NUMERICIDENTIFIER] +
                            '|' + src[t.NONNUMERICIDENTIFIER] + ')'

tok('PRERELEASEIDENTIFIERLOOSE')
src[t.PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[t.NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[t.NONNUMERICIDENTIFIER] + ')'

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

tok('PRERELEASE')
src[t.PRERELEASE] = '(?:-(' + src[t.PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[t.PRERELEASEIDENTIFIER] + ')*))'

tok('PRERELEASELOOSE')
src[t.PRERELEASELOOSE] = '(?:-?(' + src[t.PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[t.PRERELEASEIDENTIFIERLOOSE] + ')*))'

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

tok('BUILDIDENTIFIER')
src[t.BUILDIDENTIFIER] = LETTERDASHNUMBER + '+'

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

tok('BUILD')
src[t.BUILD] = '(?:\\+(' + src[t.BUILDIDENTIFIER] +
             '(?:\\.' + src[t.BUILDIDENTIFIER] + ')*))'

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

tok('FULL')
tok('FULLPLAIN')
src[t.FULLPLAIN] = 'v?' + src[t.MAINVERSION] +
                  src[t.PRERELEASE] + '?' +
                  src[t.BUILD] + '?'

src[t.FULL] = '^' + src[t.FULLPLAIN] + '$'

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
tok('LOOSEPLAIN')
src[t.LOOSEPLAIN] = '[v=\\s]*' + src[t.MAINVERSIONLOOSE] +
                  src[t.PRERELEASELOOSE] + '?' +
                  src[t.BUILD] + '?'

tok('LOOSE')
src[t.LOOSE] = '^' + src[t.LOOSEPLAIN] + '$'

tok('GTLT')
src[t.GTLT] = '((?:<|>)?=?)'

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
tok('XRANGEIDENTIFIERLOOSE')
src[t.XRANGEIDENTIFIERLOOSE] = src[t.NUMERICIDENTIFIERLOOSE] + '|x|X|\\*'
tok('XRANGEIDENTIFIER')
src[t.XRANGEIDENTIFIER] = src[t.NUMERICIDENTIFIER] + '|x|X|\\*'

tok('XRANGEPLAIN')
src[t.XRANGEPLAIN] = '[v=\\s]*(' + src[t.XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[t.XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[t.XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[t.PRERELEASE] + ')?' +
                   src[t.BUILD] + '?' +
                   ')?)?'

tok('XRANGEPLAINLOOSE')
src[t.XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[t.XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[t.XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[t.XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[t.PRERELEASELOOSE] + ')?' +
                        src[t.BUILD] + '?' +
                        ')?)?'

tok('XRANGE')
src[t.XRANGE] = '^' + src[t.GTLT] + '\\s*' + src[t.XRANGEPLAIN] + '$'
tok('XRANGELOOSE')
src[t.XRANGELOOSE] = '^' + src[t.GTLT] + '\\s*' + src[t.XRANGEPLAINLOOSE] + '$'

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
tok('COERCE')
src[t.COERCE] = '(^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])'
tok('COERCERTL')
re[t.COERCERTL] = new RegExp(src[t.COERCE], 'g')
safeRe[t.COERCERTL] = new RegExp(makeSafeRe(src[t.COERCE]), 'g')

// Tilde ranges.
// Meaning is "reasonably at or greater than"
tok('LONETILDE')
src[t.LONETILDE] = '(?:~>?)'

tok('TILDETRIM')
src[t.TILDETRIM] = '(\\s*)' + src[t.LONETILDE] + '\\s+'
re[t.TILDETRIM] = new RegExp(src[t.TILDETRIM], 'g')
safeRe[t.TILDETRIM] = new RegExp(makeSafeRe(src[t.TILDETRIM]), 'g')
var tildeTrimReplace = '$1~'

tok('TILDE')
src[t.TILDE] = '^' + src[t.LONETILDE] + src[t.XRANGEPLAIN] + '$'
tok('TILDELOOSE')
src[t.TILDELOOSE] = '^' + src[t.LONETILDE] + src[t.XRANGEPLAINLOOSE] + '$'

// Caret ranges.
// Meaning is "at least and backwards compatible with"
tok('LONECARET')
src[t.LONECARET] = '(?:\\^)'

tok('CARETTRIM')
src[t.CARETTRIM] = '(\\s*)' + src[t.LONECARET] + '\\s+'
re[t.CARETTRIM] = new RegExp(src[t.CARETTRIM], 'g')
safeRe[t.CARETTRIM] = new RegExp(makeSafeRe(src[t.CARETTRIM]), 'g')
var caretTrimReplace = '$1^'

tok('CARET')
src[t.CARET] = '^' + src[t.LONECARET] + src[t.XRANGEPLAIN] + '$'
tok('CARETLOOSE')
src[t.CARETLOOSE] = '^' + src[t.LONECARET] + src[t.XRANGEPLAINLOOSE] + '$'

// A simple gt/lt/eq thing, or just "" to indicate "any version"
tok('COMPARATORLOOSE')
src[t.COMPARATORLOOSE] = '^' + src[t.GTLT] + '\\s*(' + src[t.LOOSEPLAIN] + ')$|^$'
tok('COMPARATOR')
src[t.COMPARATOR] = '^' + src[t.GTLT] + '\\s*(' + src[t.FULLPLAIN] + ')$|^$'

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
tok('COMPARATORTRIM')
src[t.COMPARATORTRIM] = '(\\s*)' + src[t.GTLT] +
                      '\\s*(' + src[t.LOOSEPLAIN] + '|' + src[t.XRANGEPLAIN] + ')'

// this one has to use the /g flag
re[t.COMPARATORTRIM] = new RegExp(src[t.COMPARATORTRIM], 'g')
safeRe[t.COMPARATORTRIM] = new RegExp(makeSafeRe(src[t.COMPARATORTRIM]), 'g')
var comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
tok('HYPHENRANGE')
src[t.HYPHENRANGE] = '^\\s*(' + src[t.XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[t.XRANGEPLAIN] + ')' +
                   '\\s*$'

tok('HYPHENRANGELOOSE')
src[t.HYPHENRANGELOOSE] = '^\\s*(' + src[t.XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[t.XRANGEPLAINLOOSE] + ')' +
                        '\\s*$'

// Star ranges basically just allow anything at all.
tok('STAR')
src[t.STAR] = '(<|>)?=?\\s*\\*'

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i])
  if (!re[i]) {
    re[i] = new RegExp(src[i])

    // Replace all greedy whitespace to prevent regex dos issues. These regex are
    // used internally via the safeRe object since all inputs in this library get
    // normalized first to trim and collapse all extra whitespace. The original
    // regexes are exported for userland consumption and lower level usage. A
    // future breaking change could export the safer regex only with a note that
    // all input should have extra whitespace removed.
    safeRe[i] = new RegExp(makeSafeRe(src[i]))
  }
}

exports.parse = parse
function parse (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  var r = options.loose ? safeRe[t.LOOSE] : safeRe[t.FULL]
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

exports.valid = valid
function valid (version, options) {
  var v = parse(version, options)
  return v ? v.version : null
}

exports.clean = clean
function clean (version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}

exports.SemVer = SemVer

function SemVer (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }
  if (version instanceof SemVer) {
    if (version.loose === options.loose) {
      return version
    } else {
      version = version.version
    }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version)
  }

  if (version.length > MAX_LENGTH) {
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')
  }

  if (!(this instanceof SemVer)) {
    return new SemVer(version, options)
  }

  debug('SemVer', version, options)
  this.options = options
  this.loose = !!options.loose

  var m = version.trim().match(options.loose ? safeRe[t.LOOSE] : safeRe[t.FULL])

  if (!m) {
    throw new TypeError('Invalid Version: ' + version)
  }

  this.raw = version

  // these are actually numbers
  this.major = +m[1]
  this.minor = +m[2]
  this.patch = +m[3]

  if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
    throw new TypeError('Invalid major version')
  }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
    throw new TypeError('Invalid minor version')
  }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
    throw new TypeError('Invalid patch version')
  }

  // numberify any prerelease numeric ids
  if (!m[4]) {
    this.prerelease = []
  } else {
    this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id
        if (num >= 0 && num < MAX_SAFE_INTEGER) {
          return num
        }
      }
      return id
    })
  }

  this.build = m[5] ? m[5].split('.') : []
  this.format()
}

SemVer.prototype.format = function () {
  this.version = this.major + '.' + this.minor + '.' + this.patch
  if (this.prerelease.length) {
    this.version += '-' + this.prerelease.join('.')
  }
  return this.version
}

SemVer.prototype.toString = function () {
  return this.version
}

SemVer.prototype.compare = function (other) {
  debug('SemVer.compare', this.version, this.options, other)
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  return this.compareMain(other) || this.comparePre(other)
}

SemVer.prototype.compareMain = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch)
}

SemVer.prototype.comparePre = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length) {
    return -1
  } else if (!this.prerelease.length && other.prerelease.length) {
    return 1
  } else if (!this.prerelease.length && !other.prerelease.length) {
    return 0
  }

  var i = 0
  do {
    var a = this.prerelease[i]
    var b = other.prerelease[i]
    debug('prerelease compare', i, a, b)
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
}

SemVer.prototype.compareBuild = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  var i = 0
  do {
    var a = this.build[i]
    var b = other.build[i]
    debug('prerelease compare', i, a, b)
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
}

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function (release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0
      this.patch = 0
      this.minor = 0
      this.major++
      this.inc('pre', identifier)
      break
    case 'preminor':
      this.prerelease.length = 0
      this.patch = 0
      this.minor++
      this.inc('pre', identifier)
      break
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0
      this.inc('patch', identifier)
      this.inc('pre', identifier)
      break
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0) {
        this.inc('patch', identifier)
      }
      this.inc('pre', identifier)
      break

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0) {
        this.major++
      }
      this.minor = 0
      this.patch = 0
      this.prerelease = []
      break
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0) {
        this.minor++
      }
      this.patch = 0
      this.prerelease = []
      break
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0) {
        this.patch++
      }
      this.prerelease = []
      break
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0) {
        this.prerelease = [0]
      } else {
        var i = this.prerelease.length
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++
            i = -2
          }
        }
        if (i === -1) {
          // didn't increment anything
          this.prerelease.push(0)
        }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1])) {
            this.prerelease = [identifier, 0]
          }
        } else {
          this.prerelease = [identifier, 0]
        }
      }
      break

    default:
      throw new Error('invalid increment argument: ' + release)
  }
  this.format()
  this.raw = this.version
  return this
}

exports.inc = inc
function inc (version, release, loose, identifier) {
  if (typeof (loose) === 'string') {
    identifier = loose
    loose = undefined
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version
  } catch (er) {
    return null
  }
}

exports.diff = diff
function diff (version1, version2) {
  if (eq(version1, version2)) {
    return null
  } else {
    var v1 = parse(version1)
    var v2 = parse(version2)
    var prefix = ''
    if (v1.prerelease.length || v2.prerelease.length) {
      prefix = 'pre'
      var defaultResult = 'prerelease'
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}

exports.compareIdentifiers = compareIdentifiers

var numeric = /^[0-9]+$/
function compareIdentifiers (a, b) {
  var anum = numeric.test(a)
  var bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

exports.rcompareIdentifiers = rcompareIdentifiers
function rcompareIdentifiers (a, b) {
  return compareIdentifiers(b, a)
}

exports.major = major
function major (a, loose) {
  return new SemVer(a, loose).major
}

exports.minor = minor
function minor (a, loose) {
  return new SemVer(a, loose).minor
}

exports.patch = patch
function patch (a, loose) {
  return new SemVer(a, loose).patch
}

exports.compare = compare
function compare (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}

exports.compareLoose = compareLoose
function compareLoose (a, b) {
  return compare(a, b, true)
}

exports.compareBuild = compareBuild
function compareBuild (a, b, loose) {
  var versionA = new SemVer(a, loose)
  var versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}

exports.rcompare = rcompare
function rcompare (a, b, loose) {
  return compare(b, a, loose)
}

exports.sort = sort
function sort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compareBuild(a, b, loose)
  })
}

exports.rsort = rsort
function rsort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compareBuild(b, a, loose)
  })
}

exports.gt = gt
function gt (a, b, loose) {
  return compare(a, b, loose) > 0
}

exports.lt = lt
function lt (a, b, loose) {
  return compare(a, b, loose) < 0
}

exports.eq = eq
function eq (a, b, loose) {
  return compare(a, b, loose) === 0
}

exports.neq = neq
function neq (a, b, loose) {
  return compare(a, b, loose) !== 0
}

exports.gte = gte
function gte (a, b, loose) {
  return compare(a, b, loose) >= 0
}

exports.lte = lte
function lte (a, b, loose) {
  return compare(a, b, loose) <= 0
}

exports.cmp = cmp
function cmp (a, op, b, loose) {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError('Invalid operator: ' + op)
  }
}

exports.Comparator = Comparator
function Comparator (comp, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose) {
      return comp
    } else {
      comp = comp.value
    }
  }

  if (!(this instanceof Comparator)) {
    return new Comparator(comp, options)
  }

  comp = comp.trim().split(/\s+/).join(' ')
  debug('comparator', comp, options)
  this.options = options
  this.loose = !!options.loose
  this.parse(comp)

  if (this.semver === ANY) {
    this.value = ''
  } else {
    this.value = this.operator + this.semver.version
  }

  debug('comp', this)
}

var ANY = {}
Comparator.prototype.parse = function (comp) {
  var r = this.options.loose ? safeRe[t.COMPARATORLOOSE] : safeRe[t.COMPARATOR]
  var m = comp.match(r)

  if (!m) {
    throw new TypeError('Invalid comparator: ' + comp)
  }

  this.operator = m[1] !== undefined ? m[1] : ''
  if (this.operator === '=') {
    this.operator = ''
  }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2]) {
    this.semver = ANY
  } else {
    this.semver = new SemVer(m[2], this.options.loose)
  }
}

Comparator.prototype.toString = function () {
  return this.value
}

Comparator.prototype.test = function (version) {
  debug('Comparator.test', version, this.options.loose)

  if (this.semver === ANY || version === ANY) {
    return true
  }

  if (typeof version === 'string') {
    try {
      version = new SemVer(version, this.options)
    } catch (er) {
      return false
    }
  }

  return cmp(version, this.operator, this.semver, this.options)
}

Comparator.prototype.intersects = function (comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required')
  }

  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  var rangeTmp

  if (this.operator === '') {
    if (this.value === '') {
      return true
    }
    rangeTmp = new Range(comp.value, options)
    return satisfies(this.value, rangeTmp, options)
  } else if (comp.operator === '') {
    if (comp.value === '') {
      return true
    }
    rangeTmp = new Range(this.value, options)
    return satisfies(comp.semver, rangeTmp, options)
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>')
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<')
  var sameSemVer = this.semver.version === comp.semver.version
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=')
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'))
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'))

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan
}

exports.Range = Range
function Range (range, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range
    } else {
      return new Range(range.raw, options)
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options)
  }

  if (!(this instanceof Range)) {
    return new Range(range, options)
  }

  this.options = options
  this.loose = !!options.loose
  this.includePrerelease = !!options.includePrerelease

  // First reduce all whitespace as much as possible so we do not have to rely
  // on potentially slow regexes like \s*. This is then stored and used for
  // future error messages as well.
  this.raw = range
    .trim()
    .split(/\s+/)
    .join(' ')

  // First, split based on boolean or ||
  this.set = this.raw.split('||').map(function (range) {
    return this.parseRange(range.trim())
  }, this).filter(function (c) {
    // throw out any that are not relevant for whatever reason
    return c.length
  })

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + this.raw)
  }

  this.format()
}

Range.prototype.format = function () {
  this.range = this.set.map(function (comps) {
    return comps.join(' ').trim()
  }).join('||').trim()
  return this.range
}

Range.prototype.toString = function () {
  return this.range
}

Range.prototype.parseRange = function (range) {
  var loose = this.options.loose
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? safeRe[t.HYPHENRANGELOOSE] : safeRe[t.HYPHENRANGE]
  range = range.replace(hr, hyphenReplace)
  debug('hyphen replace', range)
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(safeRe[t.COMPARATORTRIM], comparatorTrimReplace)
  debug('comparator trim', range, safeRe[t.COMPARATORTRIM])

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(safeRe[t.TILDETRIM], tildeTrimReplace)

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(safeRe[t.CARETTRIM], caretTrimReplace)

  // normalize spaces
  range = range.split(/\s+/).join(' ')

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? safeRe[t.COMPARATORLOOSE] : safeRe[t.COMPARATOR]
  var set = range.split(' ').map(function (comp) {
    return parseComparator(comp, this.options)
  }, this).join(' ').split(/\s+/)
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function (comp) {
      return !!comp.match(compRe)
    })
  }
  set = set.map(function (comp) {
    return new Comparator(comp, this.options)
  }, this)

  return set
}

Range.prototype.intersects = function (range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required')
  }

  return this.set.some(function (thisComparators) {
    return (
      isSatisfiable(thisComparators, options) &&
      range.set.some(function (rangeComparators) {
        return (
          isSatisfiable(rangeComparators, options) &&
          thisComparators.every(function (thisComparator) {
            return rangeComparators.every(function (rangeComparator) {
              return thisComparator.intersects(rangeComparator, options)
            })
          })
        )
      })
    )
  })
}

// take a set of comparators and determine whether there
// exists a version which can satisfy it
function isSatisfiable (comparators, options) {
  var result = true
  var remainingComparators = comparators.slice()
  var testComparator = remainingComparators.pop()

  while (result && remainingComparators.length) {
    result = remainingComparators.every(function (otherComparator) {
      return testComparator.intersects(otherComparator, options)
    })

    testComparator = remainingComparators.pop()
  }

  return result
}

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators
function toComparators (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value
    }).join(' ').trim().split(' ')
  })
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator (comp, options) {
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

function isX (id) {
  return !id || id.toLowerCase() === 'x' || id === '*'
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceTilde(comp, options)
  }).join(' ')
}

function replaceTilde (comp, options) {
  var r = options.loose ? safeRe[t.TILDELOOSE] : safeRe[t.TILDE]
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr)
    var ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
            ' <' + M + '.' + (+m + 1) + '.0'
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0'
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceCaret(comp, options)
  }).join(' ')
}

function replaceCaret (comp, options) {
  debug('caret', comp, options)
  var r = options.loose ? safeRe[t.CARETLOOSE] : safeRe[t.CARET]
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr)
    var ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (isX(p)) {
      if (M === '0') {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
      } else {
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0'
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + m + '.' + (+p + 1)
        } else {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + (+m + 1) + '.0'
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
              ' <' + (+M + 1) + '.0.0'
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1)
        } else {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0'
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0'
      }
    }

    debug('caret return', ret)
    return ret
  })
}

function replaceXRanges (comp, options) {
  debug('replaceXRanges', comp, options)
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options)
  }).join(' ')
}

function replaceXRange (comp, options) {
  comp = comp.trim()
  var r = options.loose ? safeRe[t.XRANGELOOSE] : safeRe[t.XRANGE]
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    var xM = isX(M)
    var xm = xM || isX(m)
    var xp = xm || isX(p)
    var anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : ''

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      ret = gtlt + M + '.' + m + '.' + p + pr
    } else if (xm) {
      ret = '>=' + M + '.0.0' + pr + ' <' + (+M + 1) + '.0.0' + pr
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0' + pr +
        ' <' + M + '.' + (+m + 1) + '.0' + pr
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars (comp, options) {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(safeRe[t.STAR], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = '>=' + fM + '.0.0'
  } else if (isX(fp)) {
    from = '>=' + fM + '.' + fm + '.0'
  } else {
    from = '>=' + from
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = '<' + (+tM + 1) + '.0.0'
  } else if (isX(tp)) {
    to = '<' + tM + '.' + (+tm + 1) + '.0'
  } else if (tpr) {
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr
  } else {
    to = '<=' + to
  }

  return (from + ' ' + to).trim()
}

// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function (version) {
  if (!version) {
    return false
  }

  if (typeof version === 'string') {
    try {
      version = new SemVer(version, this.options)
    } catch (er) {
      return false
    }
  }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version, this.options)) {
      return true
    }
  }
  return false
}

function testSet (set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}

exports.satisfies = satisfies
function satisfies (version, range, options) {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}

exports.maxSatisfying = maxSatisfying
function maxSatisfying (versions, range, options) {
  var max = null
  var maxSV = null
  try {
    var rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}

exports.minSatisfying = minSatisfying
function minSatisfying (versions, range, options) {
  var min = null
  var minSV = null
  try {
    var rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}

exports.minVersion = minVersion
function minVersion (range, loose) {
  range = new Range(range, loose)

  var minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i]

    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error('Unexpected operation: ' + comparator.operator)
      }
    })
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}

exports.validRange = validRange
function validRange (range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr
function ltr (version, range, options) {
  return outside(version, range, '<', options)
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr
function gtr (version, range, options) {
  return outside(version, range, '>', options)
}

exports.outside = outside
function outside (version, range, hilo, options) {
  version = new SemVer(version, options)
  range = new Range(range, options)

  var gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i]

    var high = null
    var low = null

    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

exports.prerelease = prerelease
function prerelease (version, options) {
  var parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}

exports.intersects = intersects
function intersects (r1, r2, options) {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2)
}

exports.coerce = coerce
function coerce (version, options) {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version)
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {}

  var match = null
  if (!options.rtl) {
    match = version.match(safeRe[t.COERCE])
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    var next
    while ((next = safeRe[t.COERCERTL].exec(version)) &&
      (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
          next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }
      safeRe[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
    }
    // leave it in a clean state
    safeRe[t.COERCERTL].lastIndex = -1
  }

  if (match === null) {
    return null
  }

  return parse(match[2] +
    '.' + (match[3] || '0') +
    '.' + (match[4] || '0'), options)
}


/***/ }),

/***/ 5228:
/***/ (function(module) {

"use strict";

module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value
    }
  }
}


/***/ }),

/***/ 7350:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null

  return next
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.splice = function (start, deleteCount /*, ...nodes */) {
  if (start > this.length) {
    start = this.length - 1
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next
  }

  var ret = []
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value)
    walker = this.removeNode(walker)
  }
  if (walker === null) {
    walker = this.tail
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev
  }

  for (var i = 2; i < arguments.length; i++) {
    walker = insert(this, walker, arguments[i])
  }
  return ret;
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self)

  if (inserted.next === null) {
    self.tail = inserted
  }
  if (inserted.prev === null) {
    self.head = inserted
  }

  self.length++

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}

try {
  // add if support for Symbol.iterator is present
  __webpack_require__(5228)(Yallist)
} catch (er) {}


/***/ }),

/***/ 5174:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Todo (Babel 8): remove this file, in Babel 8 users import the .json directly
module.exports = __webpack_require__(9468);


/***/ }),

/***/ 4697:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Todo (Babel 8): remove this file, in Babel 8 users import the .json directly
module.exports = __webpack_require__(4657);


/***/ }),

/***/ 1880:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getInclusionReasons = getInclusionReasons;
var _semver = __webpack_require__(3167);
var _pretty = __webpack_require__(6947);
var _utils = __webpack_require__(274);
function getInclusionReasons(item, targetVersions, list) {
  const minVersions = list[item] || {};
  return Object.keys(targetVersions).reduce((result, env) => {
    const minVersion = (0, _utils.getLowestImplementedVersion)(minVersions, env);
    const targetVersion = targetVersions[env];
    if (!minVersion) {
      result[env] = (0, _pretty.prettifyVersion)(targetVersion);
    } else {
      const minIsUnreleased = (0, _utils.isUnreleasedVersion)(minVersion, env);
      const targetIsUnreleased = (0, _utils.isUnreleasedVersion)(targetVersion, env);
      if (!targetIsUnreleased && (minIsUnreleased || _semver.lt(targetVersion.toString(), (0, _utils.semverify)(minVersion)))) {
        result[env] = (0, _pretty.prettifyVersion)(targetVersion);
      }
    }
    return result;
  }, {});
}

//# sourceMappingURL=debug.js.map


/***/ }),

/***/ 9112:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = filterItems;
exports.isRequired = isRequired;
exports.targetsSupported = targetsSupported;
var _semver = __webpack_require__(3167);
var _utils = __webpack_require__(274);
const pluginsCompatData = __webpack_require__(4697);
function targetsSupported(target, support) {
  const targetEnvironments = Object.keys(target);
  if (targetEnvironments.length === 0) {
    return false;
  }
  const unsupportedEnvironments = targetEnvironments.filter(environment => {
    const lowestImplementedVersion = (0, _utils.getLowestImplementedVersion)(support, environment);
    if (!lowestImplementedVersion) {
      return true;
    }
    const lowestTargetedVersion = target[environment];
    if ((0, _utils.isUnreleasedVersion)(lowestTargetedVersion, environment)) {
      return false;
    }
    if ((0, _utils.isUnreleasedVersion)(lowestImplementedVersion, environment)) {
      return true;
    }
    if (!_semver.valid(lowestTargetedVersion.toString())) {
      throw new Error(`Invalid version passed for target "${environment}": "${lowestTargetedVersion}". ` + "Versions must be in semver format (major.minor.patch)");
    }
    return _semver.gt((0, _utils.semverify)(lowestImplementedVersion), lowestTargetedVersion.toString());
  });
  return unsupportedEnvironments.length === 0;
}
function isRequired(name, targets, {
  compatData = pluginsCompatData,
  includes,
  excludes
} = {}) {
  if (excludes != null && excludes.has(name)) return false;
  if (includes != null && includes.has(name)) return true;
  return !targetsSupported(targets, compatData[name]);
}
function filterItems(list, includes, excludes, targets, defaultIncludes, defaultExcludes, pluginSyntaxMap) {
  const result = new Set();
  const options = {
    compatData: list,
    includes,
    excludes
  };
  for (const item in list) {
    if (isRequired(item, targets, options)) {
      result.add(item);
    } else if (pluginSyntaxMap) {
      const shippedProposalsSyntax = pluginSyntaxMap.get(item);
      if (shippedProposalsSyntax) {
        result.add(shippedProposalsSyntax);
      }
    }
  }
  defaultIncludes == null || defaultIncludes.forEach(item => !excludes.has(item) && result.add(item));
  defaultExcludes == null || defaultExcludes.forEach(item => !includes.has(item) && result.delete(item));
  return result;
}

//# sourceMappingURL=filter-items.js.map


/***/ }),

/***/ 9287:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "TargetNames", ({
  enumerable: true,
  get: function () {
    return _options.TargetNames;
  }
}));
exports["default"] = getTargets;
Object.defineProperty(exports, "filterItems", ({
  enumerable: true,
  get: function () {
    return _filterItems.default;
  }
}));
Object.defineProperty(exports, "getInclusionReasons", ({
  enumerable: true,
  get: function () {
    return _debug.getInclusionReasons;
  }
}));
exports.isBrowsersQueryValid = isBrowsersQueryValid;
Object.defineProperty(exports, "isRequired", ({
  enumerable: true,
  get: function () {
    return _filterItems.isRequired;
  }
}));
Object.defineProperty(exports, "prettifyTargets", ({
  enumerable: true,
  get: function () {
    return _pretty.prettifyTargets;
  }
}));
Object.defineProperty(exports, "unreleasedLabels", ({
  enumerable: true,
  get: function () {
    return _targets.unreleasedLabels;
  }
}));
var _browserslist = __webpack_require__(2639);
var _helperValidatorOption = __webpack_require__(8809);
var _lruCache = __webpack_require__(6750);
var _utils = __webpack_require__(274);
var _targets = __webpack_require__(6605);
var _options = __webpack_require__(6717);
var _pretty = __webpack_require__(6947);
var _debug = __webpack_require__(1880);
var _filterItems = __webpack_require__(9112);
const browserModulesData = __webpack_require__(5174);
const ESM_SUPPORT = browserModulesData["es6.module"];
const v = new _helperValidatorOption.OptionValidator("@babel/helper-compilation-targets");
function validateTargetNames(targets) {
  const validTargets = Object.keys(_options.TargetNames);
  for (const target of Object.keys(targets)) {
    if (!(target in _options.TargetNames)) {
      throw new Error(v.formatMessage(`'${target}' is not a valid target
- Did you mean '${(0, _helperValidatorOption.findSuggestion)(target, validTargets)}'?`));
    }
  }
  return targets;
}
function isBrowsersQueryValid(browsers) {
  return typeof browsers === "string" || Array.isArray(browsers) && browsers.every(b => typeof b === "string");
}
function validateBrowsers(browsers) {
  v.invariant(browsers === undefined || isBrowsersQueryValid(browsers), `'${String(browsers)}' is not a valid browserslist query`);
  return browsers;
}
function getLowestVersions(browsers) {
  return browsers.reduce((all, browser) => {
    const [browserName, browserVersion] = browser.split(" ");
    const target = _targets.browserNameMap[browserName];
    if (!target) {
      return all;
    }
    try {
      const splitVersion = browserVersion.split("-")[0].toLowerCase();
      const isSplitUnreleased = (0, _utils.isUnreleasedVersion)(splitVersion, target);
      if (!all[target]) {
        all[target] = isSplitUnreleased ? splitVersion : (0, _utils.semverify)(splitVersion);
        return all;
      }
      const version = all[target];
      const isUnreleased = (0, _utils.isUnreleasedVersion)(version, target);
      if (isUnreleased && isSplitUnreleased) {
        all[target] = (0, _utils.getLowestUnreleased)(version, splitVersion, target);
      } else if (isUnreleased) {
        all[target] = (0, _utils.semverify)(splitVersion);
      } else if (!isUnreleased && !isSplitUnreleased) {
        const parsedBrowserVersion = (0, _utils.semverify)(splitVersion);
        all[target] = (0, _utils.semverMin)(version, parsedBrowserVersion);
      }
    } catch (_) {}
    return all;
  }, {});
}
function outputDecimalWarning(decimalTargets) {
  if (!decimalTargets.length) {
    return;
  }
  console.warn("Warning, the following targets are using a decimal version:\n");
  decimalTargets.forEach(({
    target,
    value
  }) => console.warn(`  ${target}: ${value}`));
  console.warn(`
We recommend using a string for minor/patch versions to avoid numbers like 6.10
getting parsed as 6.1, which can lead to unexpected behavior.
`);
}
function semverifyTarget(target, value) {
  try {
    return (0, _utils.semverify)(value);
  } catch (_) {
    throw new Error(v.formatMessage(`'${value}' is not a valid value for 'targets.${target}'.`));
  }
}
function nodeTargetParser(value) {
  const parsed = value === true || value === "current" ? process.versions.node.split("-")[0] : semverifyTarget("node", value);
  return ["node", parsed];
}
function defaultTargetParser(target, value) {
  const version = (0, _utils.isUnreleasedVersion)(value, target) ? value.toLowerCase() : semverifyTarget(target, value);
  return [target, version];
}
function generateTargets(inputTargets) {
  const input = Object.assign({}, inputTargets);
  delete input.esmodules;
  delete input.browsers;
  return input;
}
function resolveTargets(queries, env) {
  const resolved = _browserslist(queries, {
    mobileToDesktop: true,
    env
  });
  return getLowestVersions(resolved);
}
const targetsCache = new _lruCache({
  max: 64
});
function resolveTargetsCached(queries, env) {
  const cacheKey = typeof queries === "string" ? queries : queries.join() + env;
  let cached = targetsCache.get(cacheKey);
  if (!cached) {
    cached = resolveTargets(queries, env);
    targetsCache.set(cacheKey, cached);
  }
  return Object.assign({}, cached);
}
function getTargets(inputTargets = {}, options = {}) {
  var _browsers, _browsers2;
  let {
    browsers,
    esmodules
  } = inputTargets;
  const {
    configPath = ".",
    onBrowserslistConfigFound
  } = options;
  validateBrowsers(browsers);
  const input = generateTargets(inputTargets);
  let targets = validateTargetNames(input);
  const shouldParseBrowsers = !!browsers;
  const hasTargets = shouldParseBrowsers || Object.keys(targets).length > 0;
  const shouldSearchForConfig = !options.ignoreBrowserslistConfig && !hasTargets;
  if (!browsers && shouldSearchForConfig) {
    browsers = process.env.BROWSERSLIST;
    if (!browsers) {
      const configFile = options.configFile || process.env.BROWSERSLIST_CONFIG || _browserslist.findConfigFile(configPath);
      if (configFile != null) {
        onBrowserslistConfigFound == null || onBrowserslistConfigFound(configFile);
        browsers = _browserslist.loadConfig({
          config: configFile,
          env: options.browserslistEnv
        });
      }
    }
    if (browsers == null) {
      browsers = [];
    }
  }
  if (esmodules && (esmodules !== "intersect" || !((_browsers = browsers) != null && _browsers.length))) {
    browsers = Object.keys(ESM_SUPPORT).map(browser => `${browser} >= ${ESM_SUPPORT[browser]}`).join(", ");
    esmodules = false;
  }
  if ((_browsers2 = browsers) != null && _browsers2.length) {
    const queryBrowsers = resolveTargetsCached(browsers, options.browserslistEnv);
    if (esmodules === "intersect") {
      for (const browser of Object.keys(queryBrowsers)) {
        if (browser !== "deno" && browser !== "ie") {
          const esmSupportVersion = ESM_SUPPORT[browser === "opera_mobile" ? "op_mob" : browser];
          if (esmSupportVersion) {
            const version = queryBrowsers[browser];
            queryBrowsers[browser] = (0, _utils.getHighestUnreleased)(version, (0, _utils.semverify)(esmSupportVersion), browser);
          } else {
            delete queryBrowsers[browser];
          }
        } else {
          delete queryBrowsers[browser];
        }
      }
    }
    targets = Object.assign(queryBrowsers, targets);
  }
  const result = {};
  const decimalWarnings = [];
  for (const target of Object.keys(targets).sort()) {
    const value = targets[target];
    if (typeof value === "number" && value % 1 !== 0) {
      decimalWarnings.push({
        target,
        value
      });
    }
    const [parsedTarget, parsedValue] = target === "node" ? nodeTargetParser(value) : defaultTargetParser(target, value);
    if (parsedValue) {
      result[parsedTarget] = parsedValue;
    }
  }
  outputDecimalWarning(decimalWarnings);
  return result;
}

//# sourceMappingURL=index.js.map


/***/ }),

/***/ 6717:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.TargetNames = void 0;
const TargetNames = exports.TargetNames = {
  node: "node",
  deno: "deno",
  chrome: "chrome",
  opera: "opera",
  edge: "edge",
  firefox: "firefox",
  safari: "safari",
  ie: "ie",
  ios: "ios",
  android: "android",
  electron: "electron",
  samsung: "samsung",
  rhino: "rhino",
  opera_mobile: "opera_mobile"
};

//# sourceMappingURL=options.js.map


/***/ }),

/***/ 6947:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.prettifyTargets = prettifyTargets;
exports.prettifyVersion = prettifyVersion;
var _semver = __webpack_require__(3167);
var _targets = __webpack_require__(6605);
function prettifyVersion(version) {
  if (typeof version !== "string") {
    return version;
  }
  const {
    major,
    minor,
    patch
  } = _semver.parse(version);
  const parts = [major];
  if (minor || patch) {
    parts.push(minor);
  }
  if (patch) {
    parts.push(patch);
  }
  return parts.join(".");
}
function prettifyTargets(targets) {
  return Object.keys(targets).reduce((results, target) => {
    let value = targets[target];
    const unreleasedLabel = _targets.unreleasedLabels[target];
    if (typeof value === "string" && unreleasedLabel !== value) {
      value = prettifyVersion(value);
    }
    results[target] = value;
    return results;
  }, {});
}

//# sourceMappingURL=pretty.js.map


/***/ }),

/***/ 6605:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.unreleasedLabels = exports.browserNameMap = void 0;
const unreleasedLabels = exports.unreleasedLabels = {
  safari: "tp"
};
const browserNameMap = exports.browserNameMap = {
  and_chr: "chrome",
  and_ff: "firefox",
  android: "android",
  chrome: "chrome",
  edge: "edge",
  firefox: "firefox",
  ie: "ie",
  ie_mob: "ie",
  ios_saf: "ios",
  node: "node",
  deno: "deno",
  op_mob: "opera_mobile",
  opera: "opera",
  safari: "safari",
  samsung: "samsung"
};

//# sourceMappingURL=targets.js.map


/***/ }),

/***/ 274:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getHighestUnreleased = getHighestUnreleased;
exports.getLowestImplementedVersion = getLowestImplementedVersion;
exports.getLowestUnreleased = getLowestUnreleased;
exports.isUnreleasedVersion = isUnreleasedVersion;
exports.semverMin = semverMin;
exports.semverify = semverify;
var _semver = __webpack_require__(3167);
var _helperValidatorOption = __webpack_require__(8809);
var _targets = __webpack_require__(6605);
const versionRegExp = /^(?:\d+|\d(?:\d?[^\d\n\r\u2028\u2029]\d+|\d{2,}(?:[^\d\n\r\u2028\u2029]\d+)?))$/;
const v = new _helperValidatorOption.OptionValidator("@babel/helper-compilation-targets");
function semverMin(first, second) {
  return first && _semver.lt(first, second) ? first : second;
}
function semverify(version) {
  if (typeof version === "string" && _semver.valid(version)) {
    return version;
  }
  v.invariant(typeof version === "number" || typeof version === "string" && versionRegExp.test(version), `'${version}' is not a valid version`);
  version = version.toString();
  let pos = 0;
  let num = 0;
  while ((pos = version.indexOf(".", pos + 1)) > 0) {
    num++;
  }
  return version + ".0".repeat(2 - num);
}
function isUnreleasedVersion(version, env) {
  const unreleasedLabel = _targets.unreleasedLabels[env];
  return !!unreleasedLabel && unreleasedLabel === version.toString().toLowerCase();
}
function getLowestUnreleased(a, b, env) {
  const unreleasedLabel = _targets.unreleasedLabels[env];
  if (a === unreleasedLabel) {
    return b;
  }
  if (b === unreleasedLabel) {
    return a;
  }
  return semverMin(a, b);
}
function getHighestUnreleased(a, b, env) {
  return getLowestUnreleased(a, b, env) === a ? b : a;
}
function getLowestImplementedVersion(plugin, environment) {
  const result = plugin[environment];
  if (!result && environment === "android") {
    return plugin.chrome;
  }
  return result;
}

//# sourceMappingURL=utils.js.map


/***/ }),

/***/ 1663:
/***/ (function(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
exports.xe = declare;
__webpack_unused_export__ = void 0;
const apiPolyfills = {
  assertVersion: api => range => {
    throwVersionError(range, api.version);
  }
};
Object.assign(apiPolyfills, {
  targets: () => () => {
    return {};
  },
  assumption: () => () => {
    return undefined;
  },
  addExternalDependency: () => () => {}
});
function declare(builder) {
  return (api, options, dirname) => {
    let clonedApi;
    for (const name of Object.keys(apiPolyfills)) {
      if (api[name]) continue;
      clonedApi != null ? clonedApi : clonedApi = copyApiObject(api);
      clonedApi[name] = apiPolyfills[name](clonedApi);
    }
    return builder(clonedApi != null ? clonedApi : api, options || {}, dirname);
  };
}
const declarePreset = __webpack_unused_export__ = declare;
function copyApiObject(api) {
  let proto = null;
  if (typeof api.version === "string" && api.version.startsWith("7.")) {
    proto = Object.getPrototypeOf(api);
    if (proto && (!hasOwnProperty.call(proto, "version") || !hasOwnProperty.call(proto, "transform") || !hasOwnProperty.call(proto, "template") || !hasOwnProperty.call(proto, "types"))) {
      proto = null;
    }
  }
  return Object.assign({}, proto, api);
}
function throwVersionError(range, version) {
  if (typeof range === "number") {
    if (!Number.isInteger(range)) {
      throw new Error("Expected string or integer value.");
    }
    range = `^${range}.0.0-0`;
  }
  if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }
  const limit = Error.stackTraceLimit;
  if (typeof limit === "number" && limit < 25) {
    Error.stackTraceLimit = 25;
  }
  let err;
  if (version.startsWith("7.")) {
    err = new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". ` + `You'll need to update your @babel/core version.`);
  } else {
    err = new Error(`Requires Babel "${range}", but was loaded with "${version}". ` + `If you are sure you have a compatible version of @babel/core, ` + `it is likely that something in your build process is loading the ` + `wrong version. Inspect the stack trace of this error to look for ` + `the first entry that doesn't mention "@babel/core" or "babel-core" ` + `to see what is calling Babel.`);
  }
  if (typeof limit === "number") {
    Error.stackTraceLimit = limit;
  }
  throw Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}

//# sourceMappingURL=index.js.map


/***/ }),

/***/ 9147:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.findSuggestion = findSuggestion;
const {
  min
} = Math;
function levenshtein(a, b) {
  let t = [],
    u = [],
    i,
    j;
  const m = a.length,
    n = b.length;
  if (!m) {
    return n;
  }
  if (!n) {
    return m;
  }
  for (j = 0; j <= n; j++) {
    t[j] = j;
  }
  for (i = 1; i <= m; i++) {
    for (u = [i], j = 1; j <= n; j++) {
      u[j] = a[i - 1] === b[j - 1] ? t[j - 1] : min(t[j - 1], t[j], u[j - 1]) + 1;
    }
    t = u;
  }
  return u[n];
}
function findSuggestion(str, arr) {
  const distances = arr.map(el => levenshtein(el, str));
  return arr[distances.indexOf(min(...distances))];
}

//# sourceMappingURL=find-suggestion.js.map


/***/ }),

/***/ 8809:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "OptionValidator", ({
  enumerable: true,
  get: function () {
    return _validator.OptionValidator;
  }
}));
Object.defineProperty(exports, "findSuggestion", ({
  enumerable: true,
  get: function () {
    return _findSuggestion.findSuggestion;
  }
}));
var _validator = __webpack_require__(271);
var _findSuggestion = __webpack_require__(9147);

//# sourceMappingURL=index.js.map


/***/ }),

/***/ 271:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.OptionValidator = void 0;
var _findSuggestion = __webpack_require__(9147);
class OptionValidator {
  constructor(descriptor) {
    this.descriptor = descriptor;
  }
  validateTopLevelOptions(options, TopLevelOptionShape) {
    const validOptionNames = Object.keys(TopLevelOptionShape);
    for (const option of Object.keys(options)) {
      if (!validOptionNames.includes(option)) {
        throw new Error(this.formatMessage(`'${option}' is not a valid top-level option.
- Did you mean '${(0, _findSuggestion.findSuggestion)(option, validOptionNames)}'?`));
      }
    }
  }
  validateBooleanOption(name, value, defaultValue) {
    if (value === undefined) {
      return defaultValue;
    } else {
      this.invariant(typeof value === "boolean", `'${name}' option must be a boolean.`);
    }
    return value;
  }
  validateStringOption(name, value, defaultValue) {
    if (value === undefined) {
      return defaultValue;
    } else {
      this.invariant(typeof value === "string", `'${name}' option must be a string.`);
    }
    return value;
  }
  invariant(condition, message) {
    if (!condition) {
      throw new Error(this.formatMessage(message));
    }
  }
  formatMessage(message) {
    return `${this.descriptor}: ${message}`;
  }
}
exports.OptionValidator = OptionValidator;

//# sourceMappingURL=validator.js.map


/***/ }),

/***/ 8967:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
var _babel_core__WEBPACK_IMPORTED_MODULE_2___namespace_cache;
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: function() { return /* binding */ definePolyfillProvider; }
/* harmony export */ });
/* harmony import */ var _babel_helper_plugin_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1663);
/* harmony import */ var _babel_helper_compilation_targets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9287);
/* harmony import */ var _babel_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4805);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6928);
/* harmony import */ var lodash_debounce__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3571);
/* harmony import */ var resolve__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2388);
/* harmony import */ var module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(3339);








const {
  types: t$1,
  template: template
} = _babel_core__WEBPACK_IMPORTED_MODULE_2__ || /*#__PURE__*/ (_babel_core__WEBPACK_IMPORTED_MODULE_2___namespace_cache || (_babel_core__WEBPACK_IMPORTED_MODULE_2___namespace_cache = __webpack_require__.t(_babel_core__WEBPACK_IMPORTED_MODULE_2__, 2)));
const PossibleGlobalObjects = new Set(["global", "globalThis", "self", "window"]);
function intersection(a, b) {
  const result = new Set();
  a.forEach(v => b.has(v) && result.add(v));
  return result;
}
function has$1(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
function resolve$1(path, seen = new Set()) {
  if (seen.has(path)) return;
  seen.add(path);
  if (path.isVariableDeclarator()) {
    if (path.get("id").isIdentifier()) {
      return resolve$1(path.get("init"), seen);
    }
  } else if (path.isReferencedIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding) return path;
    if (!binding.constant) return;
    return resolve$1(binding.path, seen);
  }
  return path;
}
function resolveId(path) {
  if (path.isIdentifier() && !path.scope.hasBinding(path.node.name, /* noGlobals */true)) {
    return path.node.name;
  }

  // globalThis.Object / window.Array / self.Map / global.Set -> resolve to
  // the property name, because accessing a built-in through a global object
  // reference is equivalent to accessing it directly.
  if (path.isMemberExpression() && !path.node.computed) {
    const object = path.get("object");
    const property = path.get("property");
    if (object.isIdentifier() && !object.scope.hasBinding(object.node.name, /* noGlobals */true) && PossibleGlobalObjects.has(object.node.name) && property.isIdentifier()) {
      return property.node.name;
    }
  }
  const resolved = resolve$1(path);
  if (resolved != null && resolved.isIdentifier()) {
    return resolved.node.name;
  }
}
function resolveKey(path, computed = false) {
  const {
    scope
  } = path;
  if (path.isStringLiteral()) return path.node.value;
  const isIdentifier = path.isIdentifier();
  if (isIdentifier && !(computed || path.parent.computed)) {
    return path.node.name;
  }
  if (computed && path.isMemberExpression() && path.get("object").isIdentifier({
    name: "Symbol"
  }) && !scope.hasBinding("Symbol", /* noGlobals */true)) {
    const sym = resolveKey(path.get("property"), path.node.computed);
    if (sym) return "Symbol." + sym;
  }
  if (isIdentifier ? scope.hasBinding(path.node.name, /* noGlobals */true) : path.isPure()) {
    const {
      value
    } = path.evaluate();
    if (typeof value === "string") return value;
  }
}
function resolveInstance(obj, seen) {
  const source = resolveSource(obj, seen);
  return source.placement === "prototype" ? source.id : null;
}
function resolveSource(obj, seen) {
  if (seen.has(obj)) {
    return {
      id: null,
      placement: null
    };
  }
  seen.add(obj);
  if (obj.isMemberExpression() && obj.get("property").isIdentifier({
    name: "prototype"
  })) {
    const id = resolveId(obj.get("object"));
    if (id) {
      return {
        id,
        placement: "prototype"
      };
    }
    return {
      id: null,
      placement: null
    };
  }
  const id = resolveId(obj);
  if (id) {
    return {
      id,
      placement: "static"
    };
  }
  const path = resolve$1(obj);
  switch (path == null ? void 0 : path.type) {
    case "NullLiteral":
      return {
        id: null,
        placement: null
      };
    case "RegExpLiteral":
      return {
        id: "RegExp",
        placement: "prototype"
      };
    case "StringLiteral":
    case "TemplateLiteral":
      return {
        id: "String",
        placement: "prototype"
      };
    case "NumericLiteral":
      return {
        id: "Number",
        placement: "prototype"
      };
    case "BooleanLiteral":
      return {
        id: "Boolean",
        placement: "prototype"
      };
    case "BigIntLiteral":
      return {
        id: "BigInt",
        placement: "prototype"
      };
    case "ObjectExpression":
      return {
        id: "Object",
        placement: "prototype"
      };
    case "ArrayExpression":
      return {
        id: "Array",
        placement: "prototype"
      };
    case "FunctionExpression":
    case "ArrowFunctionExpression":
    case "ClassExpression":
      return {
        id: "Function",
        placement: "prototype"
      };
    // new Constructor() -> resolve the constructor name
    case "NewExpression":
      {
        const calleeId = resolveId(path.get("callee"));
        if (calleeId) return {
          id: calleeId,
          placement: "prototype"
        };
        return {
          id: null,
          placement: null
        };
      }
    // Unary expressions -> result type depends on operator
    case "UnaryExpression":
      {
        const {
          operator
        } = path.node;
        if (operator === "typeof") return {
          id: "String",
          placement: "prototype"
        };
        if (operator === "!" || operator === "delete") return {
          id: "Boolean",
          placement: "prototype"
        };
        // Unary + always produces Number (throws on BigInt)
        if (operator === "+") return {
          id: "Number",
          placement: "prototype"
        };
        // Unary - and ~ can produce Number or BigInt depending on operand
        if (operator === "-" || operator === "~") {
          const arg = resolveInstance(path.get("argument"), seen);
          if (arg === "BigInt") return {
            id: "BigInt",
            placement: "prototype"
          };
          if (arg !== null) return {
            id: "Number",
            placement: "prototype"
          };
          return {
            id: null,
            placement: null
          };
        }
        return {
          id: null,
          placement: null
        };
      }
    // ++i, i++ produce Number or BigInt depending on the argument
    case "UpdateExpression":
      {
        const arg = resolveInstance(path.get("argument"), seen);
        if (arg === "BigInt") return {
          id: "BigInt",
          placement: "prototype"
        };
        if (arg !== null) return {
          id: "Number",
          placement: "prototype"
        };
        return {
          id: null,
          placement: null
        };
      }
    // Binary expressions -> result type depends on operator
    case "BinaryExpression":
      {
        const {
          operator
        } = path.node;
        if (operator === "==" || operator === "!=" || operator === "===" || operator === "!==" || operator === "<" || operator === ">" || operator === "<=" || operator === ">=" || operator === "instanceof" || operator === "in") {
          return {
            id: "Boolean",
            placement: "prototype"
          };
        }
        // >>> always produces Number
        if (operator === ">>>") {
          return {
            id: "Number",
            placement: "prototype"
          };
        }
        // Arithmetic and bitwise operators can produce Number or BigInt
        if (operator === "-" || operator === "*" || operator === "/" || operator === "%" || operator === "**" || operator === "&" || operator === "|" || operator === "^" || operator === "<<" || operator === ">>") {
          const left = resolveInstance(path.get("left"), seen);
          const right = resolveInstance(path.get("right"), seen);
          if (left === "BigInt" && right === "BigInt") {
            return {
              id: "BigInt",
              placement: "prototype"
            };
          }
          if (left !== null && right !== null) {
            return {
              id: "Number",
              placement: "prototype"
            };
          }
          return {
            id: null,
            placement: null
          };
        }
        // + depends on operand types: string wins, otherwise number or bigint
        if (operator === "+") {
          const left = resolveInstance(path.get("left"), seen);
          const right = resolveInstance(path.get("right"), seen);
          if (left === "String" || right === "String") {
            return {
              id: "String",
              placement: "prototype"
            };
          }
          if (left === "Number" && right === "Number") {
            return {
              id: "Number",
              placement: "prototype"
            };
          }
          if (left === "BigInt" && right === "BigInt") {
            return {
              id: "BigInt",
              placement: "prototype"
            };
          }
        }
        return {
          id: null,
          placement: null
        };
      }
    // (a, b, c) -> the result is the last expression
    case "SequenceExpression":
      {
        const expressions = path.get("expressions");
        return resolveSource(expressions[expressions.length - 1], seen);
      }
    // a = b -> the result is the right side
    case "AssignmentExpression":
      {
        if (path.node.operator === "=") {
          return resolveSource(path.get("right"), seen);
        }
        return {
          id: null,
          placement: null
        };
      }
    // a ? b : c -> if both branches resolve to the same type, use it
    case "ConditionalExpression":
      {
        const consequent = resolveSource(path.get("consequent"), seen);
        const alternate = resolveSource(path.get("alternate"), seen);
        if (consequent.id && consequent.id === alternate.id) {
          return consequent;
        }
        return {
          id: null,
          placement: null
        };
      }
    // (expr) -> unwrap parenthesized expressions
    case "ParenthesizedExpression":
      return resolveSource(path.get("expression"), seen);
    // TypeScript / Flow type wrappers -> unwrap to the inner expression
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "TSNonNullExpression":
    case "TSInstantiationExpression":
    case "TSTypeAssertion":
    case "TypeCastExpression":
      return resolveSource(path.get("expression"), seen);
  }
  return {
    id: null,
    placement: null
  };
}
function getImportSource({
  node
}) {
  if (node.specifiers.length === 0) return node.source.value;
}
function getRequireSource({
  node
}) {
  if (!t$1.isExpressionStatement(node)) return;
  const {
    expression
  } = node;
  if (t$1.isCallExpression(expression) && t$1.isIdentifier(expression.callee) && expression.callee.name === "require" && expression.arguments.length === 1 && t$1.isStringLiteral(expression.arguments[0])) {
    return expression.arguments[0].value;
  }
}
function hoist(node) {
  // @ts-expect-error
  node._blockHoist = 3;
  return node;
}
function createUtilsGetter(cache) {
  return path => {
    const prog = path.findParent(p => p.isProgram());
    return {
      injectGlobalImport(url, moduleName) {
        cache.storeAnonymous(prog, url, moduleName, (isScript, source) => {
          return isScript ? template.statement.ast`require(${source})` : t$1.importDeclaration([], source);
        });
      },
      injectNamedImport(url, name, hint = name, moduleName) {
        return cache.storeNamed(prog, url, name, moduleName, (isScript, source, name) => {
          const id = prog.scope.generateUidIdentifier(hint);
          return {
            node: isScript ? hoist(template.statement.ast`
                  var ${id} = require(${source}).${name}
                `) : t$1.importDeclaration([t$1.importSpecifier(id, name)], source),
            name: id.name
          };
        });
      },
      injectDefaultImport(url, hint = url, moduleName) {
        return cache.storeNamed(prog, url, "default", moduleName, (isScript, source) => {
          const id = prog.scope.generateUidIdentifier(hint);
          return {
            node: isScript ? hoist(template.statement.ast`var ${id} = require(${source})`) : t$1.importDeclaration([t$1.importDefaultSpecifier(id)], source),
            name: id.name
          };
        });
      }
    };
  };
}

const {
  types: t
} = _babel_core__WEBPACK_IMPORTED_MODULE_2__ || /*#__PURE__*/ (_babel_core__WEBPACK_IMPORTED_MODULE_2___namespace_cache || (_babel_core__WEBPACK_IMPORTED_MODULE_2___namespace_cache = __webpack_require__.t(_babel_core__WEBPACK_IMPORTED_MODULE_2__, 2)));
class ImportsCachedInjector {
  constructor(resolver, getPreferredIndex) {
    this._imports = new WeakMap();
    this._anonymousImports = new WeakMap();
    this._lastImports = new WeakMap();
    this._resolver = resolver;
    this._getPreferredIndex = getPreferredIndex;
  }
  storeAnonymous(programPath, url, moduleName, getVal) {
    const key = this._normalizeKey(programPath, url);
    const imports = this._ensure(this._anonymousImports, programPath, Set);
    if (imports.has(key)) return;
    const node = getVal(programPath.node.sourceType === "script", t.stringLiteral(this._resolver(url)));
    imports.add(key);
    this._injectImport(programPath, node, moduleName);
  }
  storeNamed(programPath, url, name, moduleName, getVal) {
    const key = this._normalizeKey(programPath, url, name);
    const imports = this._ensure(this._imports, programPath, Map);
    if (!imports.has(key)) {
      const {
        node,
        name: id
      } = getVal(programPath.node.sourceType === "script", t.stringLiteral(this._resolver(url)), t.identifier(name));
      imports.set(key, id);
      this._injectImport(programPath, node, moduleName);
    }
    return t.identifier(imports.get(key));
  }
  _injectImport(programPath, node, moduleName) {
    var _this$_lastImports$ge;
    const newIndex = this._getPreferredIndex(moduleName);
    const lastImports = (_this$_lastImports$ge = this._lastImports.get(programPath)) != null ? _this$_lastImports$ge : [];
    const isPathStillValid = path => path.node &&
    // Sometimes the AST is modified and the "last import"
    // we have has been replaced
    path.parent === programPath.node && path.container === programPath.node.body;
    let last;
    if (newIndex === Infinity) {
      // Fast path: we can always just insert at the end if newIndex is `Infinity`
      if (lastImports.length > 0) {
        last = lastImports[lastImports.length - 1].path;
        if (!isPathStillValid(last)) last = undefined;
      }
    } else {
      for (const [i, data] of lastImports.entries()) {
        const {
          path,
          index
        } = data;
        if (isPathStillValid(path)) {
          if (newIndex < index) {
            const [newPath] = path.insertBefore(node);
            lastImports.splice(i, 0, {
              path: newPath,
              index: newIndex
            });
            return;
          }
          last = path;
        }
      }
    }
    if (last) {
      const [newPath] = last.insertAfter(node);
      lastImports.push({
        path: newPath,
        index: newIndex
      });
    } else {
      const [newPath] = programPath.unshiftContainer("body", [node]);
      this._lastImports.set(programPath, [{
        path: newPath,
        index: newIndex
      }]);
    }
  }
  _ensure(map, programPath, Collection) {
    let collection = map.get(programPath);
    if (!collection) {
      collection = new Collection();
      map.set(programPath, collection);
    }
    return collection;
  }
  _normalizeKey(programPath, url, name = "") {
    const {
      sourceType
    } = programPath.node;

    // If we rely on the imported binding (the "name" parameter), we also need to cache
    // based on the sourceType. This is because the module transforms change the names
    // of the import variables.
    return `${name && sourceType}::${url}::${name}`;
  }
}

const presetEnvSilentDebugHeader = "#__secret_key__@babel/preset-env__don't_log_debug_header_and_resolved_targets";
function stringifyTargetsMultiline(targets) {
  return JSON.stringify((0,_babel_helper_compilation_targets__WEBPACK_IMPORTED_MODULE_1__.prettifyTargets)(targets), null, 2);
}

function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return pattern;
  try {
    return new RegExp(`^${pattern}$`);
  } catch {
    return null;
  }
}
function buildUnusedError(label, unused) {
  if (!unused.length) return "";
  return `  - The following "${label}" patterns didn't match any polyfill:\n` + unused.map(original => `    ${String(original)}\n`).join("");
}
function buldDuplicatesError(duplicates) {
  if (!duplicates.size) return "";
  return `  - The following polyfills were matched both by "include" and "exclude" patterns:\n` + Array.from(duplicates, name => `    ${name}\n`).join("");
}
function validateIncludeExclude(provider, polyfills, includePatterns, excludePatterns) {
  let current;
  const filter = pattern => {
    const regexp = patternToRegExp(pattern);
    if (!regexp) return false;
    let matched = false;
    for (const polyfill of polyfills.keys()) {
      if (regexp.test(polyfill)) {
        matched = true;
        current.add(polyfill);
      }
    }
    return !matched;
  };

  // prettier-ignore
  const include = current = new Set();
  const unusedInclude = Array.from(includePatterns).filter(filter);

  // prettier-ignore
  const exclude = current = new Set();
  const unusedExclude = Array.from(excludePatterns).filter(filter);
  const duplicates = intersection(include, exclude);
  if (duplicates.size > 0 || unusedInclude.length > 0 || unusedExclude.length > 0) {
    throw new Error(`Error while validating the "${provider}" provider options:\n` + buildUnusedError("include", unusedInclude) + buildUnusedError("exclude", unusedExclude) + buldDuplicatesError(duplicates));
  }
  return {
    include,
    exclude
  };
}
function applyMissingDependenciesDefaults(options, babelApi) {
  const {
    missingDependencies = {}
  } = options;
  if (missingDependencies === false) return false;
  const caller = babelApi.caller(caller => caller == null ? void 0 : caller.name);
  const {
    log = "deferred",
    inject = caller === "rollup-plugin-babel" ? "throw" : "import",
    all = false
  } = missingDependencies;
  return {
    log,
    inject,
    all
  };
}

function isRemoved(path) {
  if (path.removed) return true;
  if (!path.parentPath) return false;
  if (path.listKey) {
    var _path$parentPath$node;
    if (!((_path$parentPath$node = path.parentPath.node) != null && (_path$parentPath$node = _path$parentPath$node[path.listKey]) != null && _path$parentPath$node.includes(path.node))) return true;
  } else {
    var _path$parentPath$node2;
    if (((_path$parentPath$node2 = path.parentPath.node) == null ? void 0 : _path$parentPath$node2[path.key]) !== path.node) return true;
  }
  return isRemoved(path.parentPath);
}
var usage = callProvider => {
  function property(object, key, placement, path) {
    return callProvider({
      kind: "property",
      object,
      key,
      placement
    }, path);
  }
  function handleReferencedIdentifier(path) {
    const {
      node: {
        name
      },
      scope
    } = path;
    if (scope.getBindingIdentifier(name)) return;
    callProvider({
      kind: "global",
      name
    }, path);
  }
  function analyzeMemberExpression(path) {
    const key = resolveKey(path.get("property"), path.node.computed);
    return {
      key,
      handleAsMemberExpression: !!key && key !== "prototype"
    };
  }
  return {
    // Symbol(), new Promise
    ReferencedIdentifier(path) {
      const {
        parentPath
      } = path;
      if (parentPath.isMemberExpression({
        object: path.node
      }) && analyzeMemberExpression(parentPath).handleAsMemberExpression) {
        return;
      }
      handleReferencedIdentifier(path);
    },
    "MemberExpression|OptionalMemberExpression"(path) {
      const {
        key,
        handleAsMemberExpression
      } = analyzeMemberExpression(path);
      if (!handleAsMemberExpression) return;
      const object = path.get("object");
      let objectIsGlobalIdentifier = object.isIdentifier();
      if (objectIsGlobalIdentifier) {
        const binding = object.scope.getBinding(object.node.name);
        if (binding) {
          if (binding.path.isImportNamespaceSpecifier()) return;
          objectIsGlobalIdentifier = false;
        }
      }
      const source = resolveSource(object, new Set());
      const skipObject = property(source.id, key, source.placement, path);
      const canHandleObject = objectIsGlobalIdentifier && !path.shouldSkip && !object.shouldSkip && !isRemoved(object);
      if (canHandleObject && (!skipObject || PossibleGlobalObjects.has(source.id))) {
        handleReferencedIdentifier(object);
      }
    },
    ObjectPattern(path) {
      const {
        parentPath,
        parent
      } = path;
      let obj;

      // const { keys, values } = Object
      if (parentPath.isVariableDeclarator()) {
        obj = parentPath.get("init");
        // ({ keys, values } = Object)
      } else if (parentPath.isAssignmentExpression()) {
        obj = parentPath.get("right");
        // !function ({ keys, values }) {...} (Object)
        // resolution does not work after properties transform :-(
      } else if (parentPath.isFunction()) {
        const grand = parentPath.parentPath;
        if (grand.isCallExpression() || grand.isNewExpression()) {
          if (grand.node.callee === parent) {
            obj = grand.get("arguments")[path.key];
          }
        }
      }
      let id = null;
      let placement = null;
      if (obj) ({
        id,
        placement
      } = resolveSource(obj, new Set()));
      for (const prop of path.get("properties")) {
        if (prop.isObjectProperty()) {
          const key = resolveKey(prop.get("key"));
          if (key) property(id, key, placement, prop);
        }
      }
    },
    BinaryExpression(path) {
      if (path.node.operator !== "in") return;
      const source = resolveSource(path.get("right"), new Set());
      const key = resolveKey(path.get("left"), true);
      if (!key) return;
      callProvider({
        kind: "in",
        object: source.id,
        key,
        placement: source.placement
      }, path);
    }
  };
};

var entry = callProvider => ({
  ImportDeclaration(path) {
    const source = getImportSource(path);
    if (!source) return;
    callProvider({
      kind: "import",
      source
    }, path);
  },
  Program(path) {
    path.get("body").forEach(bodyPath => {
      const source = getRequireSource(bodyPath);
      if (!source) return;
      callProvider({
        kind: "import",
        source
      }, bodyPath);
    });
  }
});

const nativeRequireResolve = parseFloat(process.versions.node) >= 8.9;
const require = (0,module__WEBPACK_IMPORTED_MODULE_6__.createRequire)(require("url").pathToFileURL(__filename).href); // eslint-disable-line

function myResolve(name, basedir) {
  if (nativeRequireResolve) {
    return require.resolve(name, {
      paths: [basedir]
    }).replace(/\\/g, "/");
  } else {
    return resolve__WEBPACK_IMPORTED_MODULE_5__.sync(name, {
      basedir
    }).replace(/\\/g, "/");
  }
}
function resolve(dirname, moduleName, absoluteImports) {
  if (absoluteImports === false) return moduleName;
  let basedir = dirname;
  if (typeof absoluteImports === "string") {
    basedir = path__WEBPACK_IMPORTED_MODULE_3__.resolve(basedir, absoluteImports);
  }
  try {
    return myResolve(moduleName, basedir);
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;
    throw Object.assign(new Error(`Failed to resolve "${moduleName}" relative to "${dirname}"`), {
      code: "BABEL_POLYFILL_NOT_FOUND",
      polyfill: moduleName,
      dirname
    });
  }
}
function has(basedir, name) {
  try {
    myResolve(name, basedir);
    return true;
  } catch {
    return false;
  }
}
function logMissing(missingDeps) {
  if (missingDeps.size === 0) return;
  const deps = Array.from(missingDeps).sort().join(" ");
  console.warn("\nSome polyfills have been added but are not present in your dependencies.\n" + "Please run one of the following commands:\n" + `\tnpm install --save ${deps}\n` + `\tyarn add ${deps}\n`);
  process.exitCode = 1;
}
let allMissingDeps = new Set();
const laterLogMissingDependencies = lodash_debounce__WEBPACK_IMPORTED_MODULE_4__(() => {
  logMissing(allMissingDeps);
  allMissingDeps = new Set();
}, 100);
function laterLogMissing(missingDeps) {
  if (missingDeps.size === 0) return;
  missingDeps.forEach(name => allMissingDeps.add(name));
  laterLogMissingDependencies();
}

function createMetaResolver(polyfills) {
  const {
    static: staticP,
    instance: instanceP,
    global: globalP
  } = polyfills;
  return meta => {
    if (meta.kind === "global" && globalP && has$1(globalP, meta.name)) {
      return {
        kind: "global",
        desc: globalP[meta.name],
        name: meta.name
      };
    }
    if (meta.kind === "property" || meta.kind === "in") {
      const {
        placement,
        object,
        key
      } = meta;
      if (object && placement === "static") {
        if (globalP && PossibleGlobalObjects.has(object) && has$1(globalP, key)) {
          return {
            kind: "global",
            desc: globalP[key],
            name: key
          };
        }
        if (staticP && has$1(staticP, object) && has$1(staticP[object], key)) {
          return {
            kind: "static",
            desc: staticP[object][key],
            name: `${object}$${key}`
          };
        }
      }
      if (instanceP && has$1(instanceP, key)) {
        return {
          kind: "instance",
          desc: instanceP[key],
          name: `${key}`
        };
      }
    }
  };
}

const getTargets = _babel_helper_compilation_targets__WEBPACK_IMPORTED_MODULE_1__["default"] || _babel_helper_compilation_targets__WEBPACK_IMPORTED_MODULE_1__;
function resolveOptions(options, babelApi) {
  const {
    method,
    targets: targetsOption,
    ignoreBrowserslistConfig,
    configPath,
    debug,
    shouldInjectPolyfill,
    absoluteImports,
    ...providerOptions
  } = options;
  if (isEmpty(options)) {
    throw new Error(`\
This plugin requires options, for example:
    {
      "plugins": [
        ["<plugin name>", { method: "usage-pure" }]
      ]
    }

See more options at https://github.com/babel/babel-polyfills/blob/main/docs/usage.md`);
  }
  let methodName;
  if (method === "usage-global") methodName = "usageGlobal";else if (method === "entry-global") methodName = "entryGlobal";else if (method === "usage-pure") methodName = "usagePure";else if (typeof method !== "string") {
    throw new Error(".method must be a string");
  } else {
    throw new Error(`.method must be one of "entry-global", "usage-global"` + ` or "usage-pure" (received ${JSON.stringify(method)})`);
  }
  if (typeof shouldInjectPolyfill === "function") {
    if (options.include || options.exclude) {
      throw new Error(`.include and .exclude are not supported when using the` + ` .shouldInjectPolyfill function.`);
    }
  } else if (shouldInjectPolyfill != null) {
    throw new Error(`.shouldInjectPolyfill must be a function, or undefined` + ` (received ${JSON.stringify(shouldInjectPolyfill)})`);
  }
  if (absoluteImports != null && typeof absoluteImports !== "boolean" && typeof absoluteImports !== "string") {
    throw new Error(`.absoluteImports must be a boolean, a string, or undefined` + ` (received ${JSON.stringify(absoluteImports)})`);
  }
  let targets;
  if (
  // If any browserslist-related option is specified, fallback to the old
  // behavior of not using the targets specified in the top-level options.
  targetsOption || configPath || ignoreBrowserslistConfig) {
    const targetsObj = typeof targetsOption === "string" || Array.isArray(targetsOption) ? {
      browsers: targetsOption
    } : targetsOption;
    targets = getTargets(targetsObj, {
      ignoreBrowserslistConfig,
      configPath
    });
  } else {
    targets = babelApi.targets();
  }
  return {
    method,
    methodName,
    targets,
    absoluteImports: absoluteImports != null ? absoluteImports : false,
    shouldInjectPolyfill,
    debug: !!debug,
    providerOptions: providerOptions
  };
}
function instantiateProvider(factory, options, missingDependencies, dirname, debugLog, babelApi) {
  const {
    method,
    methodName,
    targets,
    debug,
    shouldInjectPolyfill,
    providerOptions,
    absoluteImports
  } = resolveOptions(options, babelApi);

  // eslint-disable-next-line prefer-const
  let include, exclude;
  let polyfillsSupport;
  let polyfillsNames;
  let filterPolyfills;
  const getUtils = createUtilsGetter(new ImportsCachedInjector(moduleName => resolve(dirname, moduleName, absoluteImports), name => {
    var _polyfillsNames$get, _polyfillsNames;
    return (_polyfillsNames$get = (_polyfillsNames = polyfillsNames) == null ? void 0 : _polyfillsNames.get(name)) != null ? _polyfillsNames$get : Infinity;
  }));
  const depsCache = new Map();
  const api = {
    babel: babelApi,
    getUtils,
    method: options.method,
    targets,
    createMetaResolver,
    shouldInjectPolyfill(name) {
      if (polyfillsNames === undefined) {
        throw new Error(`Internal error in the ${factory.name} provider: ` + `shouldInjectPolyfill() can't be called during initialization.`);
      }
      if (!polyfillsNames.has(name)) {
        console.warn(`Internal error in the ${providerName} provider: ` + `unknown polyfill "${name}".`);
      }
      if (filterPolyfills && !filterPolyfills(name)) return false;
      let shouldInject = (0,_babel_helper_compilation_targets__WEBPACK_IMPORTED_MODULE_1__.isRequired)(name, targets, {
        compatData: polyfillsSupport,
        includes: include,
        excludes: exclude
      });
      if (shouldInjectPolyfill) {
        shouldInject = shouldInjectPolyfill(name, shouldInject);
        if (typeof shouldInject !== "boolean") {
          throw new Error(`.shouldInjectPolyfill must return a boolean.`);
        }
      }
      return shouldInject;
    },
    debug(name) {
      var _debugLog, _debugLog$polyfillsSu;
      debugLog().found = true;
      if (!debug || !name) return;
      if (debugLog().polyfills.has(providerName)) return;
      debugLog().polyfills.add(name);
      (_debugLog$polyfillsSu = (_debugLog = debugLog()).polyfillsSupport) != null ? _debugLog$polyfillsSu : _debugLog.polyfillsSupport = polyfillsSupport;
    },
    assertDependency(name, version = "*") {
      if (missingDependencies === false) return;
      if (absoluteImports) {
        // If absoluteImports is not false, we will try resolving
        // the dependency and throw if it's not possible. We can
        // skip the check here.
        return;
      }
      const dep = version === "*" ? name : `${name}@^${version}`;
      const found = missingDependencies.all ? false : mapGetOr(depsCache, `${name} :: ${dirname}`, () => has(dirname, name));
      if (!found) {
        debugLog().missingDeps.add(dep);
      }
    }
  };
  const provider = factory(api, providerOptions, dirname);
  const providerName = provider.name || factory.name;
  if (typeof provider[methodName] !== "function") {
    throw new Error(`The "${providerName}" provider doesn't support the "${method}" polyfilling method.`);
  }
  if (Array.isArray(provider.polyfills)) {
    polyfillsNames = new Map(provider.polyfills.map((name, index) => [name, index]));
    filterPolyfills = provider.filterPolyfills;
  } else if (provider.polyfills) {
    polyfillsNames = new Map(Object.keys(provider.polyfills).map((name, index) => [name, index]));
    polyfillsSupport = provider.polyfills;
    filterPolyfills = provider.filterPolyfills;
  } else {
    polyfillsNames = new Map();
  }
  ({
    include,
    exclude
  } = validateIncludeExclude(providerName, polyfillsNames, providerOptions.include || [], providerOptions.exclude || []));
  let callProvider;
  if (methodName === "usageGlobal") {
    callProvider = (payload, path) => {
      var _ref;
      const utils = getUtils(path);
      return (_ref = provider[methodName](payload, utils, path)) != null ? _ref : false;
    };
  } else {
    callProvider = (payload, path) => {
      const utils = getUtils(path);
      provider[methodName](payload, utils, path);
      return false;
    };
  }
  return {
    debug,
    method,
    targets,
    provider,
    providerName,
    callProvider
  };
}
function definePolyfillProvider(factory) {
  return (0,_babel_helper_plugin_utils__WEBPACK_IMPORTED_MODULE_0__/* .declare */ .xe)((babelApi, options, dirname) => {
    babelApi.assertVersion("^7.0.0 || ^8.0.0-alpha.0");
    const {
      traverse
    } = babelApi;
    let debugLog;
    const missingDependencies = applyMissingDependenciesDefaults(options, babelApi);
    const {
      debug,
      method,
      targets,
      provider,
      providerName,
      callProvider
    } = instantiateProvider(factory, options, missingDependencies, dirname, () => debugLog, babelApi);
    const createVisitor = method === "entry-global" ? entry : usage;
    const visitor = provider.visitor ? traverse.visitors.merge([createVisitor(callProvider), provider.visitor]) : createVisitor(callProvider);
    if (debug && debug !== presetEnvSilentDebugHeader) {
      console.log(`${providerName}: \`DEBUG\` option`);
      console.log(`\nUsing targets: ${stringifyTargetsMultiline(targets)}`);
      console.log(`\nUsing polyfills with \`${method}\` method:`);
    }
    const {
      runtimeName
    } = provider;
    return {
      name: "inject-polyfills",
      visitor,
      pre(file) {
        var _provider$pre;
        if (runtimeName) {
          if (file.get("runtimeHelpersModuleName") && file.get("runtimeHelpersModuleName") !== runtimeName) {
            console.warn(`Two different polyfill providers` + ` (${file.get("runtimeHelpersModuleProvider")}` + ` and ${providerName}) are trying to define two` + ` conflicting @babel/runtime alternatives:` + ` ${file.get("runtimeHelpersModuleName")} and ${runtimeName}.` + ` The second one will be ignored.`);
          } else {
            file.set("runtimeHelpersModuleName", runtimeName);
            file.set("runtimeHelpersModuleProvider", providerName);
          }
        }
        debugLog = {
          polyfills: new Set(),
          polyfillsSupport: undefined,
          found: false,
          providers: new Set(),
          missingDeps: new Set()
        };
        (_provider$pre = provider.pre) == null || _provider$pre.apply(this, arguments);
      },
      post() {
        var _provider$post;
        (_provider$post = provider.post) == null || _provider$post.apply(this, arguments);
        if (missingDependencies !== false) {
          if (missingDependencies.log === "per-file") {
            logMissing(debugLog.missingDeps);
          } else {
            laterLogMissing(debugLog.missingDeps);
          }
        }
        if (!debug) return;
        if (this.filename) console.log(`\n[${this.filename}]`);
        if (debugLog.polyfills.size === 0) {
          console.log(method === "entry-global" ? debugLog.found ? `Based on your targets, the ${providerName} polyfill did not add any polyfill.` : `The entry point for the ${providerName} polyfill has not been found.` : `Based on your code and targets, the ${providerName} polyfill did not add any polyfill.`);
          return;
        }
        if (method === "entry-global") {
          console.log(`The ${providerName} polyfill entry has been replaced with ` + `the following polyfills:`);
        } else {
          console.log(`The ${providerName} polyfill added the following polyfills:`);
        }
        for (const name of debugLog.polyfills) {
          var _debugLog$polyfillsSu2;
          if ((_debugLog$polyfillsSu2 = debugLog.polyfillsSupport) != null && _debugLog$polyfillsSu2[name]) {
            const filteredTargets = (0,_babel_helper_compilation_targets__WEBPACK_IMPORTED_MODULE_1__.getInclusionReasons)(name, targets, debugLog.polyfillsSupport);
            const formattedTargets = JSON.stringify(filteredTargets).replace(/,/g, ", ").replace(/^\{"/, '{ "').replace(/"\}$/, '" }');
            console.log(`  ${name} ${formattedTargets}`);
          } else {
            console.log(`  ${name}`);
          }
        }
      }
    };
  });
}
function mapGetOr(map, key, getDefault) {
  let val = map.get(key);
  if (val === undefined) {
    val = getDefault();
    map.set(key, val);
  }
  return val;
}
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


//# sourceMappingURL=index.node.mjs.map


/***/ }),

/***/ 9468:
/***/ (function(module) {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"es6.module":{"chrome":"61","and_chr":"61","edge":"16","firefox":"60","and_ff":"60","node":"13.2.0","opera":"48","op_mob":"45","safari":"10.1","ios":"10.3","samsung":"8.2","android":"61","electron":"2.0","ios_saf":"10.3"}}');

/***/ }),

/***/ 4657:
/***/ (function(module) {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"transform-explicit-resource-management":{"chrome":"141","edge":"141","firefox":"141","node":"25","electron":"39.0"},"transform-duplicate-named-capturing-groups-regex":{"chrome":"126","opera":"112","edge":"126","firefox":"129","safari":"17.4","node":"23","ios":"17.4","rhino":"1.9","electron":"31.0"},"transform-regexp-modifiers":{"chrome":"125","opera":"111","edge":"125","firefox":"132","node":"23","samsung":"27","electron":"31.0"},"transform-unicode-sets-regex":{"chrome":"112","opera":"98","edge":"112","firefox":"116","safari":"17","node":"20","deno":"1.32","ios":"17","samsung":"23","opera_mobile":"75","electron":"24.0"},"bugfix/transform-v8-static-class-fields-redefine-readonly":{"chrome":"98","opera":"84","edge":"98","firefox":"75","safari":"15","node":"12","deno":"1.18","ios":"15","samsung":"11","opera_mobile":"52","electron":"17.0"},"bugfix/transform-firefox-class-in-computed-class-key":{"chrome":"74","opera":"62","edge":"79","firefox":"126","safari":"16","node":"12","deno":"1","ios":"16","samsung":"11","opera_mobile":"53","electron":"6.0"},"bugfix/transform-safari-class-field-initializer-scope":{"chrome":"74","opera":"62","edge":"79","firefox":"69","safari":"16","node":"12","deno":"1","ios":"16","samsung":"11","opera_mobile":"53","electron":"6.0"},"transform-class-static-block":{"chrome":"94","opera":"80","edge":"94","firefox":"93","safari":"16.4","node":"16.11","deno":"1.14","ios":"16.4","samsung":"17","opera_mobile":"66","electron":"15.0"},"proposal-class-static-block":{"chrome":"94","opera":"80","edge":"94","firefox":"93","safari":"16.4","node":"16.11","deno":"1.14","ios":"16.4","samsung":"17","opera_mobile":"66","electron":"15.0"},"transform-private-property-in-object":{"chrome":"91","opera":"77","edge":"91","firefox":"90","safari":"15","node":"16.9","deno":"1.9","ios":"15","samsung":"16","opera_mobile":"64","electron":"13.0"},"proposal-private-property-in-object":{"chrome":"91","opera":"77","edge":"91","firefox":"90","safari":"15","node":"16.9","deno":"1.9","ios":"15","samsung":"16","opera_mobile":"64","electron":"13.0"},"transform-class-properties":{"chrome":"74","opera":"62","edge":"79","firefox":"90","safari":"14.1","node":"12","deno":"1","ios":"14.5","samsung":"11","opera_mobile":"53","electron":"6.0"},"proposal-class-properties":{"chrome":"74","opera":"62","edge":"79","firefox":"90","safari":"14.1","node":"12","deno":"1","ios":"14.5","samsung":"11","opera_mobile":"53","electron":"6.0"},"transform-private-methods":{"chrome":"84","opera":"70","edge":"84","firefox":"90","safari":"15","node":"14.6","deno":"1","ios":"15","samsung":"14","opera_mobile":"60","electron":"10.0"},"proposal-private-methods":{"chrome":"84","opera":"70","edge":"84","firefox":"90","safari":"15","node":"14.6","deno":"1","ios":"15","samsung":"14","opera_mobile":"60","electron":"10.0"},"transform-numeric-separator":{"chrome":"75","opera":"62","edge":"79","firefox":"70","safari":"13","node":"12.5","deno":"1","ios":"13","samsung":"11","rhino":"1.7.14","opera_mobile":"54","electron":"6.0"},"proposal-numeric-separator":{"chrome":"75","opera":"62","edge":"79","firefox":"70","safari":"13","node":"12.5","deno":"1","ios":"13","samsung":"11","rhino":"1.7.14","opera_mobile":"54","electron":"6.0"},"transform-logical-assignment-operators":{"chrome":"85","opera":"71","edge":"85","firefox":"79","safari":"14","node":"15","deno":"1.2","ios":"14","samsung":"14","opera_mobile":"60","electron":"10.0"},"proposal-logical-assignment-operators":{"chrome":"85","opera":"71","edge":"85","firefox":"79","safari":"14","node":"15","deno":"1.2","ios":"14","samsung":"14","opera_mobile":"60","electron":"10.0"},"transform-nullish-coalescing-operator":{"chrome":"80","opera":"67","edge":"80","firefox":"72","safari":"13.1","node":"14","deno":"1","ios":"13.4","samsung":"13","rhino":"1.8","opera_mobile":"57","electron":"8.0"},"proposal-nullish-coalescing-operator":{"chrome":"80","opera":"67","edge":"80","firefox":"72","safari":"13.1","node":"14","deno":"1","ios":"13.4","samsung":"13","rhino":"1.8","opera_mobile":"57","electron":"8.0"},"transform-optional-chaining":{"chrome":"91","opera":"77","edge":"91","firefox":"74","safari":"13.1","node":"16.9","deno":"1.9","ios":"13.4","samsung":"16","opera_mobile":"64","electron":"13.0"},"proposal-optional-chaining":{"chrome":"91","opera":"77","edge":"91","firefox":"74","safari":"13.1","node":"16.9","deno":"1.9","ios":"13.4","samsung":"16","opera_mobile":"64","electron":"13.0"},"transform-json-strings":{"chrome":"66","opera":"53","edge":"79","firefox":"62","safari":"12","node":"10","deno":"1","ios":"12","samsung":"9","rhino":"1.7.14","opera_mobile":"47","electron":"3.0"},"proposal-json-strings":{"chrome":"66","opera":"53","edge":"79","firefox":"62","safari":"12","node":"10","deno":"1","ios":"12","samsung":"9","rhino":"1.7.14","opera_mobile":"47","electron":"3.0"},"transform-optional-catch-binding":{"chrome":"66","opera":"53","edge":"79","firefox":"58","safari":"11.1","node":"10","deno":"1","ios":"11.3","samsung":"9","opera_mobile":"47","electron":"3.0"},"proposal-optional-catch-binding":{"chrome":"66","opera":"53","edge":"79","firefox":"58","safari":"11.1","node":"10","deno":"1","ios":"11.3","samsung":"9","opera_mobile":"47","electron":"3.0"},"transform-parameters":{"chrome":"49","opera":"36","edge":"18","firefox":"52","safari":"16.3","node":"6","deno":"1","ios":"16.3","samsung":"5","opera_mobile":"36","electron":"0.37"},"transform-async-generator-functions":{"chrome":"63","opera":"50","edge":"79","firefox":"57","safari":"12","node":"10","deno":"1","ios":"12","samsung":"8","opera_mobile":"46","electron":"3.0"},"proposal-async-generator-functions":{"chrome":"63","opera":"50","edge":"79","firefox":"57","safari":"12","node":"10","deno":"1","ios":"12","samsung":"8","opera_mobile":"46","electron":"3.0"},"transform-object-rest-spread":{"chrome":"60","opera":"47","edge":"79","firefox":"55","safari":"11.1","node":"8.3","deno":"1","ios":"11.3","samsung":"8","opera_mobile":"44","electron":"2.0"},"proposal-object-rest-spread":{"chrome":"60","opera":"47","edge":"79","firefox":"55","safari":"11.1","node":"8.3","deno":"1","ios":"11.3","samsung":"8","opera_mobile":"44","electron":"2.0"},"transform-dotall-regex":{"chrome":"62","opera":"49","edge":"79","firefox":"78","safari":"11.1","node":"8.10","deno":"1","ios":"11.3","samsung":"8","rhino":"1.7.15","opera_mobile":"46","electron":"3.0"},"transform-unicode-property-regex":{"chrome":"64","opera":"51","edge":"79","firefox":"78","safari":"11.1","node":"10","deno":"1","ios":"11.3","samsung":"9","rhino":"1.9","opera_mobile":"47","electron":"3.0"},"proposal-unicode-property-regex":{"chrome":"64","opera":"51","edge":"79","firefox":"78","safari":"11.1","node":"10","deno":"1","ios":"11.3","samsung":"9","rhino":"1.9","opera_mobile":"47","electron":"3.0"},"transform-named-capturing-groups-regex":{"chrome":"64","opera":"51","edge":"79","firefox":"78","safari":"11.1","node":"10","deno":"1","ios":"11.3","samsung":"9","rhino":"1.9","opera_mobile":"47","electron":"3.0"},"transform-async-to-generator":{"chrome":"55","opera":"42","edge":"15","firefox":"52","safari":"11","node":"7.6","deno":"1","ios":"11","samsung":"6","opera_mobile":"42","electron":"1.6"},"transform-exponentiation-operator":{"chrome":"52","opera":"39","edge":"14","firefox":"52","safari":"10.1","node":"7","deno":"1","ios":"10.3","samsung":"6","rhino":"1.7.14","opera_mobile":"41","electron":"1.3"},"transform-template-literals":{"chrome":"41","opera":"28","edge":"13","firefox":"34","safari":"13","node":"4","deno":"1","ios":"13","samsung":"3.4","rhino":"1.9","opera_mobile":"28","electron":"0.21"},"transform-literals":{"chrome":"44","opera":"31","edge":"12","firefox":"53","safari":"9","node":"4","deno":"1","ios":"9","samsung":"4","rhino":"1.7.15","opera_mobile":"32","electron":"0.30"},"transform-function-name":{"chrome":"51","opera":"38","edge":"79","firefox":"53","safari":"10","node":"6.5","deno":"1","ios":"10","samsung":"5","opera_mobile":"41","electron":"1.2"},"transform-arrow-functions":{"chrome":"47","opera":"34","edge":"13","firefox":"43","safari":"10","node":"6","deno":"1","ios":"10","samsung":"5","rhino":"1.7.13","opera_mobile":"34","electron":"0.36"},"transform-block-scoped-functions":{"chrome":"41","opera":"28","edge":"12","firefox":"46","safari":"10","node":"4","deno":"1","ie":"11","ios":"10","samsung":"3.4","opera_mobile":"28","electron":"0.21"},"transform-classes":{"chrome":"46","opera":"33","edge":"13","firefox":"45","safari":"10","node":"5","deno":"1","ios":"10","samsung":"5","opera_mobile":"33","electron":"0.36"},"transform-object-super":{"chrome":"46","opera":"33","edge":"13","firefox":"45","safari":"10","node":"5","deno":"1","ios":"10","samsung":"5","opera_mobile":"33","electron":"0.36"},"transform-shorthand-properties":{"chrome":"43","opera":"30","edge":"12","firefox":"33","safari":"9","node":"4","deno":"1","ios":"9","samsung":"4","rhino":"1.7.14","opera_mobile":"30","electron":"0.27"},"transform-duplicate-keys":{"chrome":"42","opera":"29","edge":"12","firefox":"34","safari":"9","node":"4","deno":"1","ios":"9","samsung":"3.4","opera_mobile":"29","electron":"0.25"},"transform-computed-properties":{"chrome":"44","opera":"31","edge":"12","firefox":"34","safari":"7.1","node":"4","deno":"1","ios":"8","samsung":"4","rhino":"1.8","opera_mobile":"32","electron":"0.30"},"transform-for-of":{"chrome":"51","opera":"38","edge":"15","firefox":"53","safari":"10","node":"6.5","deno":"1","ios":"10","samsung":"5","opera_mobile":"41","electron":"1.2"},"transform-sticky-regex":{"chrome":"49","opera":"36","edge":"13","firefox":"3","safari":"10","node":"6","deno":"1","ios":"10","samsung":"5","rhino":"1.7.15","opera_mobile":"36","electron":"0.37"},"transform-unicode-escapes":{"chrome":"44","opera":"31","edge":"12","firefox":"53","safari":"9","node":"4","deno":"1","ios":"9","samsung":"4","rhino":"1.7.15","opera_mobile":"32","electron":"0.30"},"transform-unicode-regex":{"chrome":"50","opera":"37","edge":"13","firefox":"46","safari":"12","node":"6","deno":"1","ios":"12","samsung":"5","opera_mobile":"37","electron":"1.1"},"transform-spread":{"chrome":"46","opera":"33","edge":"13","firefox":"45","safari":"10","node":"5","deno":"1","ios":"10","samsung":"5","opera_mobile":"33","electron":"0.36"},"transform-destructuring":{"chrome":"51","opera":"38","edge":"15","firefox":"53","safari":"14.1","node":"6.5","deno":"1","ios":"14.5","samsung":"5","opera_mobile":"41","electron":"1.2"},"transform-block-scoping":{"chrome":"50","opera":"37","edge":"14","firefox":"53","safari":"11","node":"6","deno":"1","ios":"11","samsung":"5","opera_mobile":"37","electron":"1.1"},"transform-typeof-symbol":{"chrome":"48","opera":"35","edge":"12","firefox":"36","safari":"9","node":"6","deno":"1","ios":"9","samsung":"5","rhino":"1.8","opera_mobile":"35","electron":"0.37"},"transform-new-target":{"chrome":"46","opera":"33","edge":"14","firefox":"41","safari":"10","node":"5","deno":"1","ios":"10","samsung":"5","opera_mobile":"33","electron":"0.36"},"transform-regenerator":{"chrome":"50","opera":"37","edge":"13","firefox":"53","safari":"10","node":"6","deno":"1","ios":"10","samsung":"5","opera_mobile":"37","electron":"1.1"},"transform-member-expression-literals":{"chrome":"7","opera":"12","edge":"12","firefox":"2","safari":"5.1","node":"0.4","deno":"1","ie":"9","android":"4","ios":"6","phantom":"1.9","samsung":"1","rhino":"1.7.13","opera_mobile":"12","electron":"0.20"},"transform-property-literals":{"chrome":"7","opera":"12","edge":"12","firefox":"2","safari":"5.1","node":"0.4","deno":"1","ie":"9","android":"4","ios":"6","phantom":"1.9","samsung":"1","rhino":"1.7.13","opera_mobile":"12","electron":"0.20"},"transform-reserved-words":{"chrome":"13","opera":"10.50","edge":"12","firefox":"2","safari":"3.1","node":"0.6","deno":"1","ie":"9","android":"4.4","ios":"6","phantom":"1.9","samsung":"1","rhino":"1.7.13","opera_mobile":"10.1","electron":"0.20"},"transform-export-namespace-from":{"chrome":"72","deno":"1.0","edge":"79","firefox":"80","node":"13.2.0","opera":"60","opera_mobile":"51","safari":"14.1","ios":"14.5","samsung":"11.0","android":"72","electron":"5.0"},"proposal-export-namespace-from":{"chrome":"72","deno":"1.0","edge":"79","firefox":"80","node":"13.2.0","opera":"60","opera_mobile":"51","safari":"14.1","ios":"14.5","samsung":"11.0","android":"72","electron":"5.0"}}');

/***/ })

};
;