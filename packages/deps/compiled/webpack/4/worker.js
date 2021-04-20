module.exports =
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 989:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __nccwpck_require__(358);
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.I = ArraySet;


/***/ }),

/***/ 675:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = __nccwpck_require__(756);

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};


/***/ }),

/***/ 756:
/***/ (function(__unused_webpack_module, exports) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};


/***/ }),

/***/ 63:
/***/ (function(__unused_webpack_module, exports) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};


/***/ }),

/***/ 397:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __nccwpck_require__(358);

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.H = MappingList;


/***/ }),

/***/ 467:
/***/ (function(__unused_webpack_module, exports) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.U = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};


/***/ }),

/***/ 161:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

var __webpack_unused_export__;
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __nccwpck_require__(358);
var binarySearch = __nccwpck_require__(63);
var ArraySet = __nccwpck_require__(989)/* .ArraySet */ .I;
var base64VLQ = __nccwpck_require__(675);
var quickSort = __nccwpck_require__(467)/* .quickSort */ .U;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

__webpack_unused_export__ = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

__webpack_unused_export__ = IndexedSourceMapConsumer;


/***/ }),

/***/ 826:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = __nccwpck_require__(675);
var util = __nccwpck_require__(358);
var ArraySet = __nccwpck_require__(989)/* .ArraySet */ .I;
var MappingList = __nccwpck_require__(397)/* .MappingList */ .H;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;


/***/ }),

/***/ 767:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = __nccwpck_require__(826).SourceMapGenerator;
var util = __nccwpck_require__(358);

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;


/***/ }),

/***/ 358:
/***/ (function(__unused_webpack_module, exports) {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;


/***/ }),

/***/ 18:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = __nccwpck_require__(826).SourceMapGenerator;
exports.SourceMapConsumer = __nccwpck_require__(161).SourceMapConsumer;
exports.SourceNode = __nccwpck_require__(767).SourceNode;


/***/ }),

/***/ 328:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _terser = __nccwpck_require__(930);

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const buildTerserOptions = ({
  ecma,
  warnings,
  parse = {},
  compress = {},
  mangle,
  module,
  output,
  toplevel,
  nameCache,
  ie8,

  /* eslint-disable camelcase */
  keep_classnames,
  keep_fnames,

  /* eslint-enable camelcase */
  safari10
} = {}) => ({
  ecma,
  warnings,
  parse: _objectSpread({}, parse),
  compress: typeof compress === 'boolean' ? compress : _objectSpread({}, compress),
  // eslint-disable-next-line no-nested-ternary
  mangle: mangle == null ? true : typeof mangle === 'boolean' ? mangle : _objectSpread({}, mangle),
  output: _objectSpread({
    shebang: true,
    comments: false,
    beautify: false,
    semicolons: true
  }, output),
  module,
  // Ignoring sourceMap from options
  sourceMap: null,
  toplevel,
  nameCache,
  ie8,
  keep_classnames,
  keep_fnames,
  safari10
});

const buildComments = (options, terserOptions, extractedComments) => {
  const condition = {};
  const commentsOpts = terserOptions.output.comments; // Use /^\**!|@preserve|@license|@cc_on/i RegExp

  if (typeof options.extractComments === 'boolean') {
    condition.preserve = commentsOpts;
    condition.extract = /^\**!|@preserve|@license|@cc_on/i;
  } else if (typeof options.extractComments === 'string' || options.extractComments instanceof RegExp) {
    // extractComments specifies the extract condition and commentsOpts specifies the preserve condition
    condition.preserve = commentsOpts;
    condition.extract = options.extractComments;
  } else if (typeof options.extractComments === 'function') {
    condition.preserve = commentsOpts;
    condition.extract = options.extractComments;
  } else if (Object.prototype.hasOwnProperty.call(options.extractComments, 'condition')) {
    // Extract condition is given in extractComments.condition
    condition.preserve = commentsOpts;
    condition.extract = options.extractComments.condition;
  } else {
    // No extract condition is given. Extract comments that match commentsOpts instead of preserving them
    condition.preserve = false;
    condition.extract = commentsOpts;
  } // Ensure that both conditions are functions


  ['preserve', 'extract'].forEach(key => {
    let regexStr;
    let regex;

    switch (typeof condition[key]) {
      case 'boolean':
        condition[key] = condition[key] ? () => true : () => false;
        break;

      case 'function':
        break;

      case 'string':
        if (condition[key] === 'all') {
          condition[key] = () => true;

          break;
        }

        if (condition[key] === 'some') {
          condition[key] = (astNode, comment) => {
            return comment.type === 'comment2' && /^\**!|@preserve|@license|@cc_on/i.test(comment.value);
          };

          break;
        }

        regexStr = condition[key];

        condition[key] = (astNode, comment) => {
          return new RegExp(regexStr).test(comment.value);
        };

        break;

      default:
        regex = condition[key];

        condition[key] = (astNode, comment) => regex.test(comment.value);

    }
  }); // Redefine the comments function to extract and preserve
  // comments according to the two conditions

  return (astNode, comment) => {
    if (condition.extract(astNode, comment)) {
      const commentText = comment.type === 'comment2' ? `/*${comment.value}*/` : `//${comment.value}`; // Don't include duplicate comments

      if (!extractedComments.includes(commentText)) {
        extractedComments.push(commentText);
      }
    }

    return condition.preserve(astNode, comment);
  };
};

const minify = options => {
  const {
    file,
    input,
    inputSourceMap,
    extractComments,
    minify: minifyFn
  } = options;

  if (minifyFn) {
    return minifyFn({
      [file]: input
    }, inputSourceMap);
  } // Copy terser options


  const terserOptions = buildTerserOptions(options.terserOptions); // Let terser generate a SourceMap

  if (inputSourceMap) {
    terserOptions.sourceMap = true;
  }

  const extractedComments = [];

  if (extractComments) {
    terserOptions.output.comments = buildComments(options, terserOptions, extractedComments);
  }

  const {
    error,
    map,
    code,
    warnings
  } = (0, _terser.minify)({
    [file]: input
  }, terserOptions);
  return {
    error,
    map,
    code,
    warnings,
    extractedComments
  };
};

var _default = minify;
exports.default = _default;

/***/ }),

/***/ 554:
/***/ (function(module, exports, __nccwpck_require__) {

"use strict";
/* module decorator */ module = __nccwpck_require__.nmd(module);


var _minify = _interopRequireDefault(__nccwpck_require__(328));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (options, callback) => {
  try {
    // 'use strict' => this === undefined (Clean Scope)
    // Safer for possible security issues, albeit not critical at all here
    // eslint-disable-next-line no-new-func, no-param-reassign
    options = new Function('exports', 'require', 'module', '__filename', '__dirname', `'use strict'\nreturn ${options}`)(exports, require, module, __filename, __dirname);
    callback(null, (0, _minify.default)(options));
  } catch (errors) {
    callback(errors);
  }
};

/***/ }),

/***/ 930:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

!function(e,t){ true?t(exports,__nccwpck_require__(18)):0}(this,(function(e,t){"use strict";function n(e){return e.split("")}function i(e,t){return t.includes(e)}t=t&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t;class r extends Error{constructor(e,t){super(),this.name="DefaultsError",this.message=e,this.defs=t}}function o(e,t,n){!0===e&&(e={});const i=e||{};if(n)for(const e in i)if(D(i,e)&&!D(t,e))throw new r("`"+e+"` is not a supported option",t);for(const n in t)if(D(t,n))if(e&&D(e,n))if("ecma"===n){let t=0|e[n];t>5&&t<2015&&(t+=2009),i[n]=t}else i[n]=e&&D(e,n)?e[n]:t[n];else i[n]=t[n];return i}function a(){}function s(){return!1}function u(){return!0}function c(){return this}function l(){return null}var f=function(){function e(e,o,a){var s,u=[],c=[];function l(){var l=o(e[s],s),f=l instanceof r;return f&&(l=l.v),l instanceof n?(l=l.v)instanceof i?c.push.apply(c,a?l.v.slice().reverse():l.v):c.push(l):l!==t&&(l instanceof i?u.push.apply(u,a?l.v.slice().reverse():l.v):u.push(l)),f}if(Array.isArray(e))if(a){for(s=e.length;--s>=0&&!l(););u.reverse(),c.reverse()}else for(s=0;s<e.length&&!l();++s);else for(s in e)if(D(e,s)&&l())break;return c.concat(u)}e.at_top=function(e){return new n(e)},e.splice=function(e){return new i(e)},e.last=function(e){return new r(e)};var t=e.skip={};function n(e){this.v=e}function i(e){this.v=e}function r(e){this.v=e}return e}();function p(e,t,n){return n||(n={}),t&&(n.start||(n.start=t.start),n.end||(n.end=t.end)),new e(n)}function _(e,t){e.includes(t)||e.push(t)}function d(e,t){return e.replace(/{(.+?)}/g,(function(e,n){return t&&t[n]}))}function m(e,t){for(var n=e.length;--n>=0;)e[n]===t&&e.splice(n,1)}function h(e,t){if(e.length<2)return e.slice();return function e(n){if(n.length<=1)return n;var i=Math.floor(n.length/2),r=n.slice(0,i),o=n.slice(i);return function(e,n){for(var i=[],r=0,o=0,a=0;r<e.length&&o<n.length;)t(e[r],n[o])<=0?i[a++]=e[r++]:i[a++]=n[o++];return r<e.length&&i.push.apply(i,e.slice(r)),o<n.length&&i.push.apply(i,n.slice(o)),i}(r=e(r),o=e(o))}(e)}function E(e){return Array.isArray(e)||(e=e.split(" ")),new Set(e)}function g(e,t,n){e.has(t)?e.get(t).push(n):e.set(t,[n])}function D(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function S(e,t){return!0===e||e instanceof RegExp&&e.test(t)}var v={"\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"};function A(e){return e.replace(/[\n\r\u2028\u2029]/g,(function(t,n){return("\\"==e[n-1]&&("\\"!=e[n-2]||/(?:^|[^\\])(?:\\{2})*$/.test(e.slice(0,n-1)))?"":"\\")+v[t]}))}function T(e,t){return e._annotations&t}function y(e,t){e._annotations|=t}var b="break case catch class const continue debugger default delete do else export extends finally for function if in instanceof let new return switch throw try typeof var void while with",C="false null true",O="enum implements import interface package private protected public static super this "+C+" "+b,F="return new delete throw else case yield await";b=E(b),O=E(O),F=E(F),C=E(C);var M=E(n("+-*&%=<>!?|~^")),R=/[0-9a-f]/i,w=/^0x[0-9a-f]+$/i,x=/^0[0-7]+$/,N=/^0o[0-7]+$/i,k=/^0b[01]+$/i,I=/^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i,L=/^(0[xob])?[0-9a-f]+n$/i,P=E(["in","instanceof","typeof","new","void","delete","++","--","+","-","!","~","&","|","^","*","**","/","%",">>","<<",">>>","<",">","<=",">=","==","===","!=","!==","?","=","+=","-=","/=","*=","**=","%=",">>=","<<=",">>>=","|=","^=","&=","&&","??","||"]),V=E(n("  \n\r\t\f\v​           \u2028\u2029  　\ufeff")),B=E(n("\n\r\u2028\u2029")),K=E(n(";]),:")),U=E(n("[{(,;:")),G=E(n("[]{}(),;:")),H={ID_Start:/[$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,ID_Continue:/(?:[$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF])+/};function X(e,t){if(z(e.charCodeAt(t))){if(W(e.charCodeAt(t+1)))return e.charAt(t)+e.charAt(t+1)}else if(W(e.charCodeAt(t))&&z(e.charCodeAt(t-1)))return e.charAt(t-1)+e.charAt(t);return e.charAt(t)}function z(e){return e>=55296&&e<=56319}function W(e){return e>=56320&&e<=57343}function Y(e){return e>=48&&e<=57}function q(e){return H.ID_Start.test(e)}function $(e){return H.ID_Continue.test(e)}function j(e){return/^[a-z_$][a-z0-9_$]*$/i.test(e)}function Z(e,t){if(/^[a-z_$][a-z0-9_$]*$/i.test(e))return!0;if(!t&&/[\ud800-\udfff]/.test(e))return!1;var n=H.ID_Start.exec(e);return!(!n||0!==n.index)&&(!(e=e.slice(n[0].length))||!!(n=H.ID_Continue.exec(e))&&n[0].length===e.length)}function J(e,t=!0){if(!t&&e.includes("e"))return NaN;if(w.test(e))return parseInt(e.substr(2),16);if(x.test(e))return parseInt(e.substr(1),8);if(N.test(e))return parseInt(e.substr(2),8);if(k.test(e))return parseInt(e.substr(2),2);if(I.test(e))return parseFloat(e);var n=parseFloat(e);return n==e?n:void 0}class Q extends Error{constructor(e,t,n,i,r){super(),this.name="SyntaxError",this.message=e,this.filename=t,this.line=n,this.col=i,this.pos=r}}function ee(e,t,n,i,r){throw new Q(e,t,n,i,r)}function te(e,t,n){return e.type==t&&(null==n||e.value==n)}var ne={};function ie(e,t,n,i){var r={text:e,filename:t,pos:0,tokpos:0,line:1,tokline:0,col:0,tokcol:0,newline_before:!1,regex_allowed:!1,brace_counter:0,template_braces:[],comments_before:[],directives:{},directive_stack:[]};function o(){return X(r.text,r.pos)}function a(e,t){var n=X(r.text,r.pos++);if(e&&!n)throw ne;return B.has(n)?(r.newline_before=r.newline_before||!t,++r.line,r.col=0,"\r"==n&&"\n"==o()&&(++r.pos,n="\n")):(n.length>1&&(++r.pos,++r.col),++r.col),n}function s(e){for(;e--;)a()}function u(e){return r.text.substr(r.pos,e.length)==e}function c(e,t){var n=r.text.indexOf(e,r.pos);if(t&&-1==n)throw ne;return n}function l(){r.tokline=r.line,r.tokcol=r.col,r.tokpos=r.pos}var f=!1,p=null;function _(n,i,o){r.regex_allowed="operator"==n&&!oe.has(i)||"keyword"==n&&F.has(i)||"punc"==n&&U.has(i)||"arrow"==n,"punc"==n&&"."==i?f=!0:o||(f=!1);var a={type:n,value:i,line:r.tokline,col:r.tokcol,pos:r.tokpos,endline:r.line,endcol:r.col,endpos:r.pos,nlb:r.newline_before,file:t};return/^(?:num|string|regexp)$/i.test(n)&&(a.raw=e.substring(a.pos,a.endpos)),o||(a.comments_before=r.comments_before,a.comments_after=r.comments_before=[]),r.newline_before=!1,a=new fe(a),o||(p=a),a}function d(){for(;V.has(o());)a()}function m(e){ee(e,t,r.tokline,r.tokcol,r.tokpos)}function h(e){var t=!1,n=!1,i=!1,r="."==e,s=!1,u=!1,c=function(e){for(var t,n="",i=0;(t=o())&&e(t,i++);)n+=a();return n}((function(o,a){if(s)return!1;switch(o.charCodeAt(0)){case 95:return u=!0;case 98:case 66:return i=!0;case 111:case 79:case 120:case 88:return!i&&(i=!0);case 101:case 69:return!!i||!t&&(t=n=!0);case 45:return n||0==a&&!e;case 43:return n;case n=!1,46:return!(r||i||t)&&(r=!0)}return"n"===o?(s=!0,!0):R.test(o)}));if(e&&(c=e+c),x.test(c)&&H.has_directive("use strict")&&m("Legacy octal literals are not allowed in strict mode"),u&&(c.endsWith("_")?m("Numeric separators are not allowed at the end of numeric literals"):c.includes("__")&&m("Only one underscore is allowed as numeric separator"),c=c.replace(/_/g,"")),c.endsWith("n")){const e=c.slice(0,-1),t=J(e,w.test(e));if(!r&&L.test(c)&&!isNaN(t))return _("big_int",e);m("Invalid or unexpected token")}var l=J(c);if(!isNaN(l))return _("num",l);m("Invalid syntax: "+c)}function E(e){return e>="0"&&e<="7"}function g(e,t,n){var i,s=a(!0,e);switch(s.charCodeAt(0)){case 110:return"\n";case 114:return"\r";case 116:return"\t";case 98:return"\b";case 118:return"\v";case 102:return"\f";case 120:return String.fromCharCode(D(2,t));case 117:if("{"==o()){for(a(!0),"}"===o()&&m("Expecting hex-character between {}");"0"==o();)a(!0);var u,l=c("}",!0)-r.pos;return(l>6||(u=D(l,t))>1114111)&&m("Unicode reference out of bounds"),a(!0),(i=u)>65535?(i-=65536,String.fromCharCode(55296+(i>>10))+String.fromCharCode(i%1024+56320)):String.fromCharCode(i)}return String.fromCharCode(D(4,t));case 10:return"";case 13:if("\n"==o())return a(!0,e),""}if(E(s)){if(n&&t){"0"===s&&!E(o())||m("Octal escape sequences are not allowed in template strings")}return function(e,t){var n=o();n>="0"&&n<="7"&&(e+=a(!0))[0]<="3"&&(n=o())>="0"&&n<="7"&&(e+=a(!0));if("0"===e)return"\0";e.length>0&&H.has_directive("use strict")&&t&&m("Legacy octal escape sequences are not allowed in strict mode");return String.fromCharCode(parseInt(e,8))}(s,t)}return s}function D(e,t){for(var n=0;e>0;--e){if(!t&&isNaN(parseInt(o(),16)))return parseInt(n,16)||"";var i=a(!0);isNaN(parseInt(i,16))&&m("Invalid hex-character pattern in string"),n+=i}return parseInt(n,16)}var S=K("Unterminated string constant",(function(){for(var e=a(),t="";;){var n=a(!0,!0);if("\\"==n)n=g(!0,!0);else if("\r"==n||"\n"==n)m("Unterminated string constant");else if(n==e)break;t+=n}var i=_("string",t);return i.quote=e,i})),v=K("Unterminated template",(function(e){e&&r.template_braces.push(r.brace_counter);var t,n,i="",s="";for(a(!0,!0);"`"!=(t=a(!0,!0));){if("\r"==t)"\n"==o()&&++r.pos,t="\n";else if("$"==t&&"{"==o())return a(!0,!0),r.brace_counter++,(n=_(e?"template_head":"template_substitution",i)).raw=s,n;if(s+=t,"\\"==t){var u=r.pos;t=g(!0,!(p&&("name"===p.type||"punc"===p.type&&(")"===p.value||"]"===p.value))),!0),s+=r.text.substr(u,r.pos-u)}i+=t}return r.template_braces.pop(),(n=_(e?"template_head":"template_substitution",i)).raw=s,n.end=!0,n}));function A(e){var t,n=r.regex_allowed,i=function(){for(var e=r.text,t=r.pos,n=r.text.length;t<n;++t){var i=e[t];if(B.has(i))return t}return-1}();return-1==i?(t=r.text.substr(r.pos),r.pos=r.text.length):(t=r.text.substring(r.pos,i),r.pos=i),r.col=r.tokcol+(r.pos-r.tokpos),r.comments_before.push(_(e,t,!0)),r.regex_allowed=n,H}var T=K("Unterminated multiline comment",(function(){var e=r.regex_allowed,t=c("*/",!0),n=r.text.substring(r.pos,t).replace(/\r\n|\r|\u2028|\u2029/g,"\n");return s(function(e){for(var t=0,n=0;n<e.length;n++)z(e.charCodeAt(n))&&W(e.charCodeAt(n+1))&&(t++,n++);return e.length-t}(n)+2),r.comments_before.push(_("comment2",n,!0)),r.newline_before=r.newline_before||n.includes("\n"),r.regex_allowed=e,H})),y=K("Unterminated identifier name",(function(){var e,t,n=!1,i=function(){return n=!0,a(),"u"!==o()&&m("Expecting UnicodeEscapeSequence -- uXXXX or u{XXXX}"),g(!1,!0)};if("\\"===(e=o()))q(e=i())||m("First identifier char is an invalid identifier char");else{if(!q(e))return"";a()}for(;null!=(t=o());){if("\\"===(t=o()))$(t=i())||m("Invalid escaped identifier char");else{if(!$(t))break;a()}e+=t}return O.has(e)&&n&&m("Escaped characters are not allowed in keywords"),e})),N=K("Unterminated regular expression",(function(e){for(var t,n=!1,i=!1;t=a(!0);)if(B.has(t))m("Unexpected line terminator");else if(n)e+="\\"+t,n=!1;else if("["==t)i=!0,e+=t;else if("]"==t&&i)i=!1,e+=t;else{if("/"==t&&!i)break;"\\"==t?n=!0:e+=t}return _("regexp",{source:e,flags:y()})}));function k(e){return _("operator",function e(t){if(!o())return t;var n=t+o();return P.has(n)?(a(),e(n)):t}(e||a()))}function I(){switch(a(),o()){case"/":return a(),A("comment1");case"*":return a(),T()}return r.regex_allowed?N(""):k("/")}function K(e,t){return function(n){try{return t(n)}catch(t){if(t!==ne)throw t;m(e)}}}function H(e){if(null!=e)return N(e);for(i&&0==r.pos&&u("#!")&&(l(),s(2),A("comment5"));;){if(d(),l(),n){if(u("\x3c!--")){s(4),A("comment3");continue}if(u("--\x3e")&&r.newline_before){s(3),A("comment4");continue}}var t=o();if(!t)return _("eof");var c=t.charCodeAt(0);switch(c){case 34:case 39:return S();case 46:return a(),Y(o().charCodeAt(0))?h("."):"."===o()?(a(),a(),_("expand","...")):_("punc",".");case 47:var p=I();if(p===H)continue;return p;case 61:return a(),">"===o()?(a(),_("arrow","=>")):k("=");case 96:return v(!0);case 123:r.brace_counter++;break;case 125:if(r.brace_counter--,r.template_braces.length>0&&r.template_braces[r.template_braces.length-1]===r.brace_counter)return v(!1)}if(Y(c))return h();if(G.has(t))return _("punc",a());if(M.has(t))return k();if(92==c||q(t))return E=void 0,E=y(),f?_("name",E):C.has(E)?_("atom",E):b.has(E)?P.has(E)?_("operator",E):_("keyword",E):_("name",E);break}var E;m("Unexpected character '"+t+"'")}return H.next=a,H.peek=o,H.context=function(e){return e&&(r=e),r},H.add_directive=function(e){r.directive_stack[r.directive_stack.length-1].push(e),void 0===r.directives[e]?r.directives[e]=1:r.directives[e]++},H.push_directives_stack=function(){r.directive_stack.push([])},H.pop_directives_stack=function(){for(var e=r.directive_stack[r.directive_stack.length-1],t=0;t<e.length;t++)r.directives[e[t]]--;r.directive_stack.pop()},H.has_directive=function(e){return r.directives[e]>0},H}var re=E(["typeof","void","delete","--","++","!","~","-","+"]),oe=E(["--","++"]),ae=E(["=","+=","-=","/=","*=","**=","%=",">>=","<<=",">>>=","|=","^=","&="]),se=function(e,t){for(var n=0;n<e.length;++n)for(var i=e[n],r=0;r<i.length;++r)t[i[r]]=n+1;return t}([["||"],["??"],["&&"],["|"],["^"],["&"],["==","===","!=","!=="],["<",">","<=",">=","in","instanceof"],[">>","<<",">>>"],["+","-"],["*","/","%"],["**"]],{}),ue=E(["atom","num","big_int","string","regexp","name"]);function ce(e,t){const n=new Map;t=o(t,{bare_returns:!1,ecma:2017,expression:!1,filename:null,html5_comments:!0,module:!1,shebang:!0,strict:!1,toplevel:null},!0);var i={input:"string"==typeof e?ie(e,t.filename,t.html5_comments,t.shebang):e,token:null,prev:null,peeked:null,in_function:0,in_async:-1,in_generator:-1,in_directives:!0,in_loop:0,labels:[]};function r(e,t){return te(i.token,e,t)}function a(){return i.peeked||(i.peeked=i.input())}function s(){return i.prev=i.token,i.peeked||a(),i.token=i.peeked,i.peeked=null,i.in_directives=i.in_directives&&("string"==i.token.type||r("punc",";")),i.token}function u(){return i.prev}function c(e,t,n,r){var o=i.input.context();ee(e,o.filename,null!=t?t:o.tokline,null!=n?n:o.tokcol,null!=r?r:o.tokpos)}function l(e,t){c(t,e.line,e.col)}function f(e){null==e&&(e=i.token),l(e,"Unexpected token: "+e.type+" ("+e.value+")")}function p(e,t){if(r(e,t))return s();l(i.token,"Unexpected token "+i.token.type+" «"+i.token.value+"», expected "+e+" «"+t+"»")}function _(e){return p("punc",e)}function d(e){return e.nlb||!e.comments_before.every(e=>!e.nlb)}function m(){return!t.strict&&(r("eof")||r("punc","}")||d(i.token))}function h(){return i.in_generator===i.in_function}function E(){return i.in_async===i.in_function}function g(e){r("punc",";")?s():e||m()||f()}function D(){_("(");var e=qe(!0);return _(")"),e}function S(e){return function(...t){const n=i.token,r=e(...t);return r.start=n,r.end=u(),r}}function v(){(r("operator","/")||r("operator","/="))&&(i.peeked=null,i.token=i.input(i.token.value.substr(1)))}i.token=s();var A=S((function(e,n,o){switch(v(),i.token.type){case"string":if(i.in_directives){var h=a();!i.token.raw.includes("\\")&&(te(h,"punc",";")||te(h,"punc","}")||d(h)||te(h,"eof"))?i.input.add_directive(i.token.value):i.in_directives=!1}var S=i.in_directives,y=T();return S&&y.body instanceof fn?new me(y.body):y;case"template_head":case"num":case"big_int":case"regexp":case"operator":case"atom":return T();case"name":if("async"==i.token.value&&te(a(),"keyword","function"))return s(),s(),n&&c("functions are not allowed as the body of a loop"),F(Be,!1,!0,e);if("import"==i.token.value&&!te(a(),"punc","(")){s();var C=function(){var e,t,n=u();r("name")&&(e=le(en));r("punc",",")&&s();((t=J(!0))||e)&&p("name","from");var o=i.token;"string"!==o.type&&f();return s(),new _t({start:n,imported_name:e,imported_names:t,module_name:new fn({start:o,value:o.value,quote:o.quote,end:o}),end:i.token})}();return g(),C}return te(a(),"punc",":")?function(){var e=le(nn);"await"===e.name&&E()&&l(i.prev,"await cannot be used as label inside async function");i.labels.some(t=>t.name===e.name)&&c("Label "+e.name+" defined twice");_(":"),i.labels.push(e);var t=A();i.labels.pop(),t instanceof ye||e.references.forEach((function(t){t instanceof je&&(t=t.label.start,c("Continue label `"+e.name+"` refers to non-IterationStatement.",t.line,t.col,t.pos))}));return new Te({body:t,label:e})}():T();case"punc":switch(i.token.value){case"{":return new Se({start:i.token,body:N(),end:u()});case"[":case"(":return T();case";":return i.in_directives=!1,s(),new ve;default:f()}case"keyword":switch(i.token.value){case"break":return s(),b($e);case"continue":return s(),b(je);case"debugger":return s(),g(),new de;case"do":s();var O=tt(A);p("keyword","while");var M=D();return g(!0),new Ce({body:O,condition:M});case"while":return s(),new Oe({condition:D(),body:tt((function(){return A(!1,!0)}))});case"for":return s(),function(){var e="`for await` invalid in this context",t=i.token;"name"==t.type&&"await"==t.value?(E()||l(t,e),s()):t=!1;_("(");var n=null;if(r("punc",";"))t&&l(t,e);else{n=r("keyword","var")?(s(),L(!0)):r("keyword","let")?(s(),P(!0)):r("keyword","const")?(s(),V(!0)):qe(!0,!0);var o=r("operator","in"),a=r("name","of");if(t&&!a&&l(t,e),o||a)return n instanceof st?n.definitions.length>1&&l(n.start,"Only one variable declaration allowed in for..in loop"):xe(n)||(n=Xe(n))instanceof Ke||l(n.start,"Invalid left-hand side in for..in loop"),s(),o?function(e){var t=qe(!0);return _(")"),new Me({init:e,object:t,body:tt((function(){return A(!1,!0)}))})}(n):function(e,t){var n=e instanceof st?e.definitions[0].name:null,i=qe(!0);return _(")"),new Re({await:t,init:e,name:n,object:i,body:tt((function(){return A(!1,!0)}))})}(n,!!t)}return function(e){_(";");var t=r("punc",";")?null:qe(!0);_(";");var n=r("punc",")")?null:qe(!0);return _(")"),new Fe({init:e,condition:t,step:n,body:tt((function(){return A(!1,!0)}))})}(n)}();case"class":return s(),n&&c("classes are not allowed as the body of a loop"),o&&c("classes are not allowed as the body of an if"),q(Pt);case"function":return s(),n&&c("functions are not allowed as the body of a loop"),F(Be,!1,!1,e);case"if":return s(),function(){var e=D(),t=A(!1,!1,!0),n=null;r("keyword","else")&&(s(),n=A(!1,!1,!0));return new Qe({condition:e,body:t,alternative:n})}();case"return":0!=i.in_function||t.bare_returns||c("'return' outside of function"),s();var w=null;return r("punc",";")?s():m()||(w=qe(!0),g()),new We({value:w});case"switch":return s(),new et({expression:D(),body:tt(k)});case"throw":s(),d(i.token)&&c("Illegal newline after 'throw'");w=qe(!0);return g(),new Ye({value:w});case"try":return s(),function(){var e=N(),t=null,n=null;if(r("keyword","catch")){var o=i.token;if(s(),r("punc","{"))var a=null;else{_("(");a=R(void 0,Qt);_(")")}t=new ot({start:o,argname:a,body:N(),end:u()})}if(r("keyword","finally")){o=i.token;s(),n=new at({start:o,body:N(),end:u()})}t||n||c("Missing catch/finally blocks");return new rt({body:e,bcatch:t,bfinally:n})}();case"var":s();C=L();return g(),C;case"let":s();C=P();return g(),C;case"const":s();C=V();return g(),C;case"with":return i.input.has_directive("use strict")&&c("Strict mode may not include a with statement"),s(),new we({expression:D(),body:A()});case"export":if(!te(a(),"punc","(")){s();C=function(){var e,t,n,o,c,l=i.token;if(r("keyword","default"))e=!0,s();else if(t=J(!1)){if(r("name","from")){s();var p=i.token;return"string"!==p.type&&f(),s(),new dt({start:l,is_default:e,exported_names:t,module_name:new fn({start:p,value:p.value,quote:p.quote,end:p}),end:u()})}return new dt({start:l,is_default:e,exported_names:t,end:u()})}r("punc","{")||e&&(r("keyword","class")||r("keyword","function"))&&te(a(),"punc")?(o=qe(!1),g()):(n=A(e))instanceof st&&e?f(n.start):n instanceof st||n instanceof Ie||n instanceof Pt?c=n:n instanceof he?o=n.body:f(n.start);return new dt({start:l,is_default:e,exported_value:o,exported_definition:c,end:u()})}();return r("punc",";")&&g(),C}}}f()}));function T(e){return new he({body:(e=qe(!0),g(),e)})}function b(e){var t,n=null;m()||(n=le(sn,!0)),null!=n?((t=i.labels.find(e=>e.name===n.name))||c("Undefined label "+n.name),n.thedef=t):0==i.in_loop&&c(e.TYPE+" not inside a loop or switch"),g();var r=new e({label:n});return t&&t.references.push(r),r}var C=function(e,t,n){d(i.token)&&c("Unexpected newline before arrow (=>)"),p("arrow","=>");var o=x(r("punc","{"),!1,n),a=o instanceof Array&&o.length?o[o.length-1].end:o instanceof Array?e:o.end;return new Ve({start:e,end:a,async:n,argnames:t,body:o})},F=function(e,t,n,i){var o=e===Be,a=r("operator","*");a&&s();var c=r("name")?le(o?Yt:jt):null;o&&!c&&(i?e=Pe:f()),!c||e===Le||c instanceof Ut||f(u());var l=[],p=x(!0,a||t,n,c,l);return new e({start:l.start,end:p.end,is_generator:a,async:n,name:c,argnames:l,body:p})};function M(e,t){var n=new Set,i=!1,r=!1,o=!1,a=!!t,s={add_parameter:function(t){if(n.has(t.value))!1===i&&(i=t),s.check_strict();else if(n.add(t.value),e)switch(t.value){case"arguments":case"eval":case"yield":a&&l(t,"Unexpected "+t.value+" identifier as parameter inside strict mode");break;default:O.has(t.value)&&f()}},mark_default_assignment:function(e){!1===r&&(r=e)},mark_spread:function(e){!1===o&&(o=e)},mark_strict_mode:function(){a=!0},is_strict:function(){return!1!==r||!1!==o||a},check_strict:function(){s.is_strict()&&!1!==i&&l(i,"Parameter "+i.value+" was used already")}};return s}function R(e,t){var n,o=!1;return void 0===e&&(e=M(!0,i.input.has_directive("use strict"))),r("expand","...")&&(o=i.token,e.mark_spread(i.token),s()),n=w(e,t),r("operator","=")&&!1===o&&(e.mark_default_assignment(i.token),s(),n=new Ot({start:n.start,left:n,operator:"=",right:qe(!1),end:i.token})),!1!==o&&(r("punc",")")||f(),n=new ke({start:o,expression:n,end:o})),e.check_strict(),n}function w(e,t){var n,o=[],l=!0,p=!1,d=i.token;if(void 0===e&&(e=M(!1,i.input.has_directive("use strict"))),t=void 0===t?Wt:t,r("punc","[")){for(s();!r("punc","]");){if(l?l=!1:_(","),r("expand","...")&&(p=!0,n=i.token,e.mark_spread(i.token),s()),r("punc"))switch(i.token.value){case",":o.push(new Dn({start:i.token,end:i.token}));continue;case"]":break;case"[":case"{":o.push(w(e,t));break;default:f()}else r("name")?(e.add_parameter(i.token),o.push(le(t))):c("Invalid function parameter");r("operator","=")&&!1===p&&(e.mark_default_assignment(i.token),s(),o[o.length-1]=new Ot({start:o[o.length-1].start,left:o[o.length-1],operator:"=",right:qe(!1),end:i.token})),p&&(r("punc","]")||c("Rest element must be last element"),o[o.length-1]=new ke({start:n,expression:o[o.length-1],end:n}))}return _("]"),e.check_strict(),new Ke({start:d,names:o,is_array:!0,end:u()})}if(r("punc","{")){for(s();!r("punc","}");){if(l?l=!1:_(","),r("expand","...")&&(p=!0,n=i.token,e.mark_spread(i.token),s()),r("name")&&(te(a(),"punc")||te(a(),"operator"))&&[",","}","="].includes(a().value)){e.add_parameter(i.token);var m=u(),h=le(t);p?o.push(new ke({start:n,expression:h,end:h.end})):o.push(new wt({start:m,key:h.name,value:h,end:h.end}))}else{if(r("punc","}"))continue;var E=i.token,g=Q();null===g?f(u()):"name"!==u().type||r("punc",":")?(_(":"),o.push(new wt({start:E,quote:E.quote,key:g,value:w(e,t),end:u()}))):o.push(new wt({start:u(),key:g,value:new t({start:u(),name:g,end:u()}),end:u()}))}p?r("punc","}")||c("Rest element must be last element"):r("operator","=")&&(e.mark_default_assignment(i.token),s(),o[o.length-1].value=new Ot({start:o[o.length-1].value.start,left:o[o.length-1].value,operator:"=",right:qe(!1),end:i.token}))}return _("}"),e.check_strict(),new Ke({start:d,names:o,is_array:!1,end:u()})}if(r("name"))return e.add_parameter(i.token),le(t);c("Invalid function parameter")}function x(e,n,o,a,u){var c=i.in_loop,l=i.labels,p=i.in_generator,d=i.in_async;if(++i.in_function,n&&(i.in_generator=i.in_function),o&&(i.in_async=i.in_function),u&&function(e){var n=M(!0,i.input.has_directive("use strict"));for(_("(");!r("punc",")");){var o=R(n);if(e.push(o),r("punc",")")||(_(","),r("punc",")")&&t.ecma<2017&&f()),o instanceof ke)break}s()}(u),e&&(i.in_directives=!0),i.in_loop=0,i.labels=[],e){i.input.push_directives_stack();var m=N();a&&ce(a),u&&u.forEach(ce),i.input.pop_directives_stack()}else m=[new We({start:i.token,value:qe(!1),end:i.token})];return--i.in_function,i.in_loop=c,i.labels=l,i.in_generator=p,i.in_async=d,m}function N(){_("{");for(var e=[];!r("punc","}");)r("eof")&&f(),e.push(A());return s(),e}function k(){_("{");for(var e,t=[],n=null,o=null;!r("punc","}");)r("eof")&&f(),r("keyword","case")?(o&&(o.end=u()),n=[],o=new it({start:(e=i.token,s(),e),expression:qe(!0),body:n}),t.push(o),_(":")):r("keyword","default")?(o&&(o.end=u()),n=[],o=new nt({start:(e=i.token,s(),_(":"),e),body:n}),t.push(o)):(n||f(),n.push(A()));return o&&(o.end=u()),s(),t}function I(e,t){for(var n,o=[];;){var a="var"===t?Gt:"const"===t?Xt:"let"===t?zt:null;if(r("punc","{")||r("punc","[")?n=new ft({start:i.token,name:w(void 0,a),value:r("operator","=")?(p("operator","="),qe(!1,e)):null,end:u()}):"import"==(n=new ft({start:i.token,name:le(a),value:r("operator","=")?(s(),qe(!1,e)):e||"const"!==t?null:c("Missing initializer in const declaration"),end:u()})).name.name&&c("Unexpected token: import"),o.push(n),!r("punc",","))break;s()}return o}var L=function(e){return new ut({start:u(),definitions:I(e,"var"),end:u()})},P=function(e){return new ct({start:u(),definitions:I(e,"let"),end:u()})},V=function(e){return new lt({start:u(),definitions:I(e,"const"),end:u()})};function B(){var e,t=i.token;switch(t.type){case"name":e=ne(rn);break;case"num":e=new pn({start:t,end:t,value:t.value});break;case"big_int":e=new _n({start:t,end:t,value:t.value});break;case"string":e=new fn({start:t,end:t,value:t.value,quote:t.quote});break;case"regexp":e=new dn({start:t,end:t,value:t.value});break;case"atom":switch(t.value){case"false":e=new An({start:t,end:t});break;case"true":e=new Tn({start:t,end:t});break;case"null":e=new hn({start:t,end:t})}}return s(),e}function U(e,t,n,i){var r=function(e,t){return t?new Ot({start:e.start,left:e,operator:"=",right:t,end:t.end}):e};return e instanceof Mt?r(new Ke({start:e.start,end:e.end,is_array:!1,names:e.properties.map(U)}),i):e instanceof wt?(e.value=U(e.value,0,[e.key]),r(e,i)):e instanceof Dn?e:e instanceof Ke?(e.names=e.names.map(U),r(e,i)):e instanceof rn?r(new Wt({name:e.name,start:e.start,end:e.end}),i):e instanceof ke?(e.expression=U(e.expression),r(e,i)):e instanceof Ft?r(new Ke({start:e.start,end:e.end,is_array:!0,names:e.elements.map(U)}),i):e instanceof Ct?r(U(e.left,void 0,void 0,e.right),i):e instanceof Ot?(e.left=U(e.left,0,[e.left]),e):void c("Invalid function parameter",e.start.line,e.start.col)}var G=function(e,o){if(r("operator","new"))return function(e){var n=i.token;if(p("operator","new"),r("punc","."))return s(),p("name","target"),_e(new Kt({start:n,end:u()}),e);var o,a=G(!1);r("punc","(")?(s(),o=X(")",t.ecma>=2017)):o=[];var c=new ht({start:n,expression:a,args:o,end:u()});return fe(c),_e(c,e)}(e);var c,l=i.token,d=r("name","async")&&"["!=(c=a()).value&&"arrow"!=c.type&&B();if(r("punc")){switch(i.token.value){case"(":if(d&&!e)break;var m=function(e,n){var o,a,c,l=[];for(_("(");!r("punc",")");)o&&f(o),r("expand","...")?(o=i.token,n&&(a=i.token),s(),l.push(new ke({start:u(),expression:qe(),end:i.token}))):l.push(qe()),r("punc",")")||(_(","),r("punc",")")&&(t.ecma<2017&&f(),c=u(),n&&(a=c)));return _(")"),e&&r("arrow","=>")?o&&c&&f(c):a&&f(a),l}(o,!d);if(o&&r("arrow","=>"))return C(l,m.map(U),!!d);var h=d?new mt({expression:d,args:m}):1==m.length?m[0]:new Et({expressions:m});if(h.start){const e=l.comments_before.length;if(n.set(l,e),h.start.comments_before.unshift(...l.comments_before),l.comments_before=h.start.comments_before,0==e&&l.comments_before.length>0){var E=l.comments_before[0];E.nlb||(E.nlb=l.nlb,l.nlb=!1)}l.comments_after=h.start.comments_after}h.start=l;var g=u();return h.end&&(g.comments_before=h.end.comments_before,h.end.comments_after.push(...g.comments_after),g.comments_after=h.end.comments_after),h.end=g,h instanceof mt&&fe(h),_e(h,e);case"[":return _e(z(),e);case"{":return _e(Y(),e)}d||f()}if(o&&r("name")&&te(a(),"arrow")){var D=new Wt({name:i.token.value,start:l,end:l});return s(),C(l,[D],!!d)}if(r("keyword","function")){s();var S=F(Pe,!1,!!d);return S.start=l,S.end=u(),_e(S,e)}if(d)return _e(d,e);if(r("keyword","class")){s();var v=q(Vt);return v.start=l,v.end=u(),_e(v,e)}return r("template_head")?_e(H(),e):ue.has(i.token.type)?_e(B(),e):void f()};function H(){var e=[],t=i.token;for(e.push(new He({start:i.token,raw:i.token.raw,value:i.token.value,end:i.token}));!i.token.end;)s(),v(),e.push(qe(!0)),te("template_substitution")||f(),e.push(new He({start:i.token,raw:i.token.raw,value:i.token.value,end:i.token}));return s(),new Ge({start:t,segments:e,end:i.token})}function X(e,t,n){for(var o=!0,a=[];!r("punc",e)&&(o?o=!1:_(","),!t||!r("punc",e));)r("punc",",")&&n?a.push(new Dn({start:i.token,end:i.token})):r("expand","...")?(s(),a.push(new ke({start:u(),expression:qe(),end:i.token}))):a.push(qe(!1));return s(),a}var z=S((function(){return _("["),new Ft({elements:X("]",!t.strict,!0)})})),W=S((e,t)=>F(Le,e,t)),Y=S((function(){var e=i.token,n=!0,o=[];for(_("{");!r("punc","}")&&(n?n=!1:_(","),t.strict||!r("punc","}"));)if("expand"!=(e=i.token).type){var a,c=Q();if(r("punc",":"))null===c?f(u()):(s(),a=qe(!1));else{var l=$(c,e);if(l){o.push(l);continue}a=new rn({start:u(),name:c,end:u()})}r("operator","=")&&(s(),a=new Ct({start:e,left:a,operator:"=",right:qe(!1),end:u()})),o.push(new wt({start:e,quote:e.quote,key:c instanceof pe?c:""+c,value:a,end:u()}))}else s(),o.push(new ke({start:e,expression:qe(!1),end:u()}));return s(),new Mt({properties:o})}));function q(e){var t,n,o,a,c=[];for(i.input.push_directives_stack(),i.input.add_directive("use strict"),"name"==i.token.type&&"extends"!=i.token.value&&(o=le(e===Pt?Zt:Jt)),e!==Pt||o||f(),"extends"==i.token.value&&(s(),a=qe(!0)),_("{");r("punc",";");)s();for(;!r("punc","}");)for(t=i.token,(n=$(Q(),t,!0))||f(),c.push(n);r("punc",";");)s();return i.input.pop_directives_stack(),s(),new e({start:t,name:o,extends:a,properties:c,end:u()})}function $(e,t,n){var o=function(e,t){return"string"==typeof e||"number"==typeof e?new qt({start:t,name:""+e,end:u()}):(null===e&&f(),e)};var a=!1,c=!1,l=!1,p=t;if(n&&"static"===e&&!r("punc","(")&&(c=!0,p=i.token,e=Q()),"async"!==e||r("punc","(")||r("punc",",")||r("punc","}")||r("operator","=")||(a=!0,p=i.token,e=Q()),null===e&&(l=!0,p=i.token,null===(e=Q())&&f()),r("punc","("))return e=o(e,t),new kt({start:t,static:c,is_generator:l,async:a,key:e,quote:e instanceof qt?p.quote:void 0,value:W(l,a),end:u()});const _=i.token;if("get"==e){if(!r("punc")||r("punc","["))return e=o(Q(),t),new Nt({start:t,static:c,key:e,quote:e instanceof qt?_.quote:void 0,value:W(),end:u()})}else if("set"==e&&(!r("punc")||r("punc","[")))return e=o(Q(),t),new xt({start:t,static:c,key:e,quote:e instanceof qt?_.quote:void 0,value:W(),end:u()});if(n){const n=(e=>"string"==typeof e||"number"==typeof e?new $t({start:p,end:p,name:""+e}):(null===e&&f(),e))(e),i=n instanceof $t?p.quote:void 0;if(r("operator","="))return s(),new Lt({start:t,static:c,quote:i,key:n,value:qe(!1),end:u()});if(r("name")||r("punc",";")||r("punc","}"))return new Lt({start:t,static:c,quote:i,key:n,end:u()})}}function j(e){function t(e){return new e({name:Q(),start:u(),end:u()})}var n,o,a=e?tn:an,c=e?en:on,l=i.token;return e?n=t(a):o=t(c),r("name","as")?(s(),e?o=t(c):n=t(a)):e?o=new c(n):n=new a(o),new pt({start:l,foreign_name:n,name:o,end:u()})}function Z(e,t){var n,r=e?tn:an,o=e?en:on,a=i.token,s=u();return t=t||new o({name:"*",start:a,end:s}),n=new r({name:"*",start:a,end:s}),new pt({start:a,foreign_name:n,name:t,end:s})}function J(e){var t;if(r("punc","{")){for(s(),t=[];!r("punc","}");)t.push(j(e)),r("punc",",")&&s();s()}else if(r("operator","*")){var n;s(),e&&r("name","as")&&(s(),n=le(e?en:an)),t=[Z(e,n)]}return t}function Q(){var e=i.token;switch(e.type){case"punc":if("["===e.value){s();var t=qe(!1);return _("]"),t}f(e);case"operator":if("*"===e.value)return s(),null;["delete","in","instanceof","new","typeof","void"].includes(e.value)||f(e);case"name":case"string":case"num":case"big_int":case"keyword":case"atom":return s(),e.value;default:f(e)}}function ne(e){var t=i.token.value;return new("this"==t?un:"super"==t?cn:e)({name:String(t),start:i.token,end:i.token})}function ce(e){var t=e.name;h()&&"yield"==t&&l(e.start,"Yield cannot be used as identifier inside generators"),i.input.has_directive("use strict")&&("yield"==t&&l(e.start,"Unexpected yield identifier inside strict mode"),e instanceof Ut&&("arguments"==t||"eval"==t)&&l(e.start,"Unexpected "+t+" in strict mode"))}function le(e,t){if(!r("name"))return t||c("Name expected"),null;var n=ne(e);return ce(n),s(),n}function fe(e){var t=e.start,i=t.comments_before;const r=n.get(t);for(var o=null!=r?r:i.length;--o>=0;){var a=i[o];if(/[@#]__/.test(a.value)){if(/[@#]__PURE__/.test(a.value)){y(e,Mn);break}if(/[@#]__INLINE__/.test(a.value)){y(e,Rn);break}if(/[@#]__NOINLINE__/.test(a.value)){y(e,wn);break}}}}var _e=function(e,t){var n,o=e.start;if(r("punc","."))return s(),_e(new Dt({start:o,expression:e,property:(n=i.token,"name"!=n.type&&f(),s(),n.value),end:u()}),t);if(r("punc","[")){s();var a=qe(!0);return _("]"),_e(new St({start:o,expression:e,property:a,end:u()}),t)}if(t&&r("punc","(")){s();var c=new mt({start:o,expression:e,args:Ee(),end:u()});return fe(c),_e(c,!0)}return r("template_head")?_e(new Ue({start:o,prefix:e,template_string:H(),end:u()}),t):e};function Ee(){for(var e=[];!r("punc",")");)r("expand","...")?(s(),e.push(new ke({start:u(),expression:qe(!1),end:u()}))):e.push(qe(!1)),r("punc",")")||(_(","),r("punc",")")&&t.ecma<2017&&f());return s(),e}var ge=function(e,t){var n=i.token;if("name"==n.type&&"await"==n.value){if(E())return s(),E()||c("Unexpected await expression outside async function",i.prev.line,i.prev.col,i.prev.pos),new Ze({start:u(),end:i.token,expression:ge(!0)});i.input.has_directive("use strict")&&l(i.token,"Unexpected await identifier inside strict mode")}if(r("operator")&&re.has(n.value)){s(),v();var o=De(At,n,ge(e));return o.start=n,o.end=u(),o}for(var a=G(e,t);r("operator")&&oe.has(i.token.value)&&!d(i.token);)a instanceof Ve&&f(),(a=De(Tt,i.token,a)).start=n,a.end=i.token,s();return a};function De(e,t,n){var r=t.value;switch(r){case"++":case"--":xe(n)||c("Invalid use of "+r+" operator",t.line,t.col,t.pos);break;case"delete":n instanceof rn&&i.input.has_directive("use strict")&&c("Calling delete on expression not allowed in strict mode",n.start.line,n.start.col,n.start.pos)}return new e({operator:r,expression:n})}var Ae=function(e,t,n){var o=r("operator")?i.token.value:null;"in"==o&&n&&(o=null),"**"==o&&e instanceof At&&!te(e.start,"punc","(")&&"--"!==e.operator&&"++"!==e.operator&&f(e.start);var a=null!=o?se[o]:null;if(null!=a&&(a>t||"**"===o&&t===a)){s();var u=Ae(ge(!0),a,n);return Ae(new yt({start:e.start,left:e,operator:o,right:u,end:u.end}),t,n)}return e};var be=function(e){var t=i.token,n=function(e){return Ae(ge(!0,!0),0,e)}(e);if(r("operator","?")){s();var o=qe(!1);return _(":"),new bt({start:t,condition:n,consequent:o,alternative:qe(!1,e),end:u()})}return n};function xe(e){return e instanceof gt||e instanceof rn}function Xe(e){if(e instanceof Mt)e=new Ke({start:e.start,names:e.properties.map(Xe),is_array:!1,end:e.end});else if(e instanceof Ft){for(var t=[],n=0;n<e.elements.length;n++)e.elements[n]instanceof ke&&(n+1!==e.elements.length&&l(e.elements[n].start,"Spread must the be last element in destructuring array"),e.elements[n].expression=Xe(e.elements[n].expression)),t.push(Xe(e.elements[n]));e=new Ke({start:e.start,names:t,is_array:!0,end:e.end})}else e instanceof Rt?e.value=Xe(e.value):e instanceof Ct&&(e=new Ot({start:e.start,left:e.left,operator:"=",right:e.right,end:e.end}));return e}var ze=function(e){v();var t=i.token;if("name"==t.type&&"yield"==t.value){if(h())return s(),function(){h()||c("Unexpected yield expression outside generator function",i.prev.line,i.prev.col,i.prev.pos);var e=i.token,t=!1,n=!0;return m()||r("punc")&&K.has(i.token.value)?n=!1:r("operator","*")&&(t=!0,s()),new Je({start:e,is_star:t,expression:n?qe():null,end:u()})}();i.input.has_directive("use strict")&&l(i.token,"Unexpected yield identifier inside strict mode")}var n=be(e),o=i.token.value;if(r("operator")&&ae.has(o)){if(xe(n)||(n=Xe(n))instanceof Ke)return s(),new Ct({start:t,left:n,operator:o,right:ze(e),end:u()});c("Invalid assignment")}return n},qe=function(e,t){for(var n=i.token,o=[];o.push(ze(t)),e&&r("punc",",");)s(),e=!0;return 1==o.length?o[0]:new Et({start:n,expressions:o,end:a()})};function tt(e){++i.in_loop;var t=e();return--i.in_loop,t}return t.expression?qe(!0):function(){var e=i.token,n=[];for(i.input.push_directives_stack(),t.module&&i.input.add_directive("use strict");!r("eof");)n.push(A());i.input.pop_directives_stack();var o=u(),a=t.toplevel;return a?(a.body=a.body.concat(n),a.end=o):a=new Ne({start:e,body:n,end:o}),a}()}function le(e,t,n,i=pe){var r=t=t?t.split(/\s+/):[];i&&i.PROPS&&(t=t.concat(i.PROPS));for(var o="return function AST_"+e+"(props){ if (props) { ",a=t.length;--a>=0;)o+="this."+t[a]+" = props."+t[a]+";";const s=i&&Object.create(i.prototype);(s&&s.initialize||n&&n.initialize)&&(o+="this.initialize();"),o+="}",o+="this.flags = 0;",o+="}";var u=new Function(o)();if(s&&(u.prototype=s,u.BASE=i),i&&i.SUBCLASSES.push(u),u.prototype.CTOR=u,u.prototype.constructor=u,u.PROPS=t||null,u.SELF_PROPS=r,u.SUBCLASSES=[],e&&(u.prototype.TYPE=u.TYPE=e),n)for(a in n)D(n,a)&&("$"===a[0]?u[a.substr(1)]=n[a]:u.prototype[a]=n[a]);return u.DEFMETHOD=function(e,t){this.prototype[e]=t},u}var fe=le("Token","type value line col pos endline endcol endpos nlb comments_before comments_after file raw quote end",{},null),pe=le("Node","start end",{_clone:function(e){if(e){var t=this.clone();return t.transform(new Fn((function(e){if(e!==t)return e.clone(!0)})))}return new this.CTOR(this)},clone:function(e){return this._clone(e)},$documentation:"Base class of all AST nodes",$propdoc:{start:"[AST_Token] The first token of this node",end:"[AST_Token] The last token of this node"},_walk:function(e){return e._visit(this)},walk:function(e){return this._walk(e)},_children_backwards:()=>{}},null);pe.warn_function=null,pe.warn=function(e,t){pe.warn_function&&pe.warn_function(d(e,t))};var _e=le("Statement",null,{$documentation:"Base class of all statements"}),de=le("Debugger",null,{$documentation:"Represents a debugger statement"},_e),me=le("Directive","value quote",{$documentation:'Represents a directive, like "use strict";',$propdoc:{value:"[string] The value of this directive as a plain string (it's not an AST_String!)",quote:"[string] the original quote character"}},_e),he=le("SimpleStatement","body",{$documentation:"A statement consisting of an expression, i.e. a = 1 + 2",$propdoc:{body:"[AST_Node] an expression node (should not be instanceof AST_Statement)"},_walk:function(e){return e._visit(this,(function(){this.body._walk(e)}))},_children_backwards(e){e(this.body)}},_e);function Ee(e,t){const n=e.body;for(var i=0,r=n.length;i<r;i++)n[i]._walk(t)}function ge(e){var t=this._clone(e);return this.block_scope&&(t.block_scope=this.block_scope.clone()),t}var De=le("Block","body block_scope",{$documentation:"A body of statements (usually braced)",$propdoc:{body:"[AST_Statement*] an array of statements",block_scope:"[AST_Scope] the block scope"},_walk:function(e){return e._visit(this,(function(){Ee(this,e)}))},_children_backwards(e){let t=this.body.length;for(;t--;)e(this.body[t])},clone:ge},_e),Se=le("BlockStatement",null,{$documentation:"A block statement"},De),ve=le("EmptyStatement",null,{$documentation:"The empty statement (empty block or simply a semicolon)"},_e),Ae=le("StatementWithBody","body",{$documentation:"Base class for all statements that contain one nested body: `For`, `ForIn`, `Do`, `While`, `With`",$propdoc:{body:"[AST_Statement] the body; this should always be present, even if it's an AST_EmptyStatement"}},_e),Te=le("LabeledStatement","label",{$documentation:"Statement with a label",$propdoc:{label:"[AST_Label] a label definition"},_walk:function(e){return e._visit(this,(function(){this.label._walk(e),this.body._walk(e)}))},_children_backwards(e){e(this.body),e(this.label)},clone:function(e){var t=this._clone(e);if(e){var n=t.label,i=this.label;t.walk(new On((function(e){e instanceof qe&&e.label&&e.label.thedef===i&&(e.label.thedef=n,n.references.push(e))})))}return t}},Ae),ye=le("IterationStatement","block_scope",{$documentation:"Internal class.  All loops inherit from it.",$propdoc:{block_scope:"[AST_Scope] the block scope for this iteration statement."},clone:ge},Ae),be=le("DWLoop","condition",{$documentation:"Base class for do/while statements",$propdoc:{condition:"[AST_Node] the loop condition.  Should not be instanceof AST_Statement"}},ye),Ce=le("Do",null,{$documentation:"A `do` statement",_walk:function(e){return e._visit(this,(function(){this.body._walk(e),this.condition._walk(e)}))},_children_backwards(e){e(this.condition),e(this.body)}},be),Oe=le("While",null,{$documentation:"A `while` statement",_walk:function(e){return e._visit(this,(function(){this.condition._walk(e),this.body._walk(e)}))},_children_backwards(e){e(this.body),e(this.condition)}},be),Fe=le("For","init condition step",{$documentation:"A `for` statement",$propdoc:{init:"[AST_Node?] the `for` initialization code, or null if empty",condition:"[AST_Node?] the `for` termination clause, or null if empty",step:"[AST_Node?] the `for` update clause, or null if empty"},_walk:function(e){return e._visit(this,(function(){this.init&&this.init._walk(e),this.condition&&this.condition._walk(e),this.step&&this.step._walk(e),this.body._walk(e)}))},_children_backwards(e){e(this.body),this.step&&e(this.step),this.condition&&e(this.condition),this.init&&e(this.init)}},ye),Me=le("ForIn","init object",{$documentation:"A `for ... in` statement",$propdoc:{init:"[AST_Node] the `for/in` initialization code",object:"[AST_Node] the object that we're looping through"},_walk:function(e){return e._visit(this,(function(){this.init._walk(e),this.object._walk(e),this.body._walk(e)}))},_children_backwards(e){e(this.body),this.object&&e(this.object),this.init&&e(this.init)}},ye),Re=le("ForOf","await",{$documentation:"A `for ... of` statement"},Me),we=le("With","expression",{$documentation:"A `with` statement",$propdoc:{expression:"[AST_Node] the `with` expression"},_walk:function(e){return e._visit(this,(function(){this.expression._walk(e),this.body._walk(e)}))},_children_backwards(e){e(this.body),e(this.expression)}},Ae),xe=le("Scope","variables functions uses_with uses_eval parent_scope enclosed cname _var_name_cache",{$documentation:"Base class for all statements introducing a lexical scope",$propdoc:{variables:"[Map/S] a map of name -> SymbolDef for all variables/functions defined in this scope",functions:"[Map/S] like `variables`, but only lists function declarations",uses_with:"[boolean/S] tells whether this scope uses the `with` statement",uses_eval:"[boolean/S] tells whether this scope contains a direct call to the global `eval`",parent_scope:"[AST_Scope?/S] link to the parent scope",enclosed:"[SymbolDef*/S] a list of all symbol definitions that are accessed from this scope or any subscopes",cname:"[integer/S] current index for mangling variables (used internally by the mangler)"},get_defun_scope:function(){for(var e=this;e.is_block_scope();)e=e.parent_scope;return e},clone:function(e){var t=this._clone(e);return this.variables&&(t.variables=new Map(this.variables)),this.functions&&(t.functions=new Map(this.functions)),this.enclosed&&(t.enclosed=this.enclosed.slice()),this._block_scope&&(t._block_scope=this._block_scope),t},pinned:function(){return this.uses_eval||this.uses_with}},De),Ne=le("Toplevel","globals",{$documentation:"The toplevel scope",$propdoc:{globals:"[Map/S] a map of name -> SymbolDef for all undeclared names"},wrap_commonjs:function(e){var t=this.body,n="(function(exports){'$ORIG';})(typeof "+e+"=='undefined'?("+e+"={}):"+e+");";return n=(n=ce(n)).transform(new Fn((function(e){if(e instanceof me&&"$ORIG"==e.value)return f.splice(t)})))},wrap_enclose:function(e){"string"!=typeof e&&(e="");var t=e.indexOf(":");t<0&&(t=e.length);var n=this.body;return ce(["(function(",e.slice(0,t),'){"$ORIG"})(',e.slice(t+1),")"].join("")).transform(new Fn((function(e){if(e instanceof me&&"$ORIG"==e.value)return f.splice(n)})))}},xe),ke=le("Expansion","expression",{$documentation:"An expandible argument, such as ...rest, a splat, such as [1,2,...all], or an expansion in a variable declaration, such as var [first, ...rest] = list",$propdoc:{expression:"[AST_Node] the thing to be expanded"},_walk:function(e){return e._visit(this,(function(){this.expression.walk(e)}))},_children_backwards(e){e(this.expression)}}),Ie=le("Lambda","name argnames uses_arguments is_generator async",{$documentation:"Base class for functions",$propdoc:{name:"[AST_SymbolDeclaration?] the name of this function",argnames:"[AST_SymbolFunarg|AST_Destructuring|AST_Expansion|AST_DefaultAssign*] array of function arguments, destructurings, or expanding arguments",uses_arguments:"[boolean/S] tells whether this function accesses the arguments array",is_generator:"[boolean] is this a generator method",async:"[boolean] is this method async"},args_as_names:function(){for(var e=[],t=0;t<this.argnames.length;t++)this.argnames[t]instanceof Ke?e.push(...this.argnames[t].all_symbols()):e.push(this.argnames[t]);return e},_walk:function(e){return e._visit(this,(function(){this.name&&this.name._walk(e);for(var t=this.argnames,n=0,i=t.length;n<i;n++)t[n]._walk(e);Ee(this,e)}))},_children_backwards(e){let t=this.body.length;for(;t--;)e(this.body[t]);for(t=this.argnames.length;t--;)e(this.argnames[t]);this.name&&e(this.name)}},xe),Le=le("Accessor",null,{$documentation:"A setter/getter function.  The `name` property is always null."},Ie),Pe=le("Function",null,{$documentation:"A function expression"},Ie),Ve=le("Arrow",null,{$documentation:"An ES6 Arrow function ((a) => b)"},Ie),Be=le("Defun",null,{$documentation:"A function definition"},Ie),Ke=le("Destructuring","names is_array",{$documentation:"A destructuring of several names. Used in destructuring assignment and with destructuring function argument names",$propdoc:{names:"[AST_Node*] Array of properties or elements",is_array:"[Boolean] Whether the destructuring represents an object or array"},_walk:function(e){return e._visit(this,(function(){this.names.forEach((function(t){t._walk(e)}))}))},_children_backwards(e){let t=this.names.length;for(;t--;)e(this.names[t])},all_symbols:function(){var e=[];return this.walk(new On((function(t){t instanceof Bt&&e.push(t)}))),e}}),Ue=le("PrefixedTemplateString","template_string prefix",{$documentation:"A templatestring with a prefix, such as String.raw`foobarbaz`",$propdoc:{template_string:"[AST_TemplateString] The template string",prefix:"[AST_SymbolRef|AST_PropAccess] The prefix, which can be a symbol such as `foo` or a dotted expression such as `String.raw`."},_walk:function(e){return e._visit(this,(function(){this.prefix._walk(e),this.template_string._walk(e)}))},_children_backwards(e){e(this.template_string),e(this.prefix)}}),Ge=le("TemplateString","segments",{$documentation:"A template string literal",$propdoc:{segments:"[AST_Node*] One or more segments, starting with AST_TemplateSegment. AST_Node may follow AST_TemplateSegment, but each AST_Node must be followed by AST_TemplateSegment."},_walk:function(e){return e._visit(this,(function(){this.segments.forEach((function(t){t._walk(e)}))}))},_children_backwards(e){let t=this.segments.length;for(;t--;)e(this.segments[t])}}),He=le("TemplateSegment","value raw",{$documentation:"A segment of a template string literal",$propdoc:{value:"Content of the segment",raw:"Raw content of the segment"}}),Xe=le("Jump",null,{$documentation:"Base class for “jumps” (for now that's `return`, `throw`, `break` and `continue`)"},_e),ze=le("Exit","value",{$documentation:"Base class for “exits” (`return` and `throw`)",$propdoc:{value:"[AST_Node?] the value returned or thrown by this statement; could be null for AST_Return"},_walk:function(e){return e._visit(this,this.value&&function(){this.value._walk(e)})},_children_backwards(e){this.value&&e(this.value)}},Xe),We=le("Return",null,{$documentation:"A `return` statement"},ze),Ye=le("Throw",null,{$documentation:"A `throw` statement"},ze),qe=le("LoopControl","label",{$documentation:"Base class for loop control statements (`break` and `continue`)",$propdoc:{label:"[AST_LabelRef?] the label, or null if none"},_walk:function(e){return e._visit(this,this.label&&function(){this.label._walk(e)})},_children_backwards(e){this.label&&e(this.label)}},Xe),$e=le("Break",null,{$documentation:"A `break` statement"},qe),je=le("Continue",null,{$documentation:"A `continue` statement"},qe),Ze=le("Await","expression",{$documentation:"An `await` statement",$propdoc:{expression:"[AST_Node] the mandatory expression being awaited"},_walk:function(e){return e._visit(this,(function(){this.expression._walk(e)}))},_children_backwards(e){e(this.expression)}}),Je=le("Yield","expression is_star",{$documentation:"A `yield` statement",$propdoc:{expression:"[AST_Node?] the value returned or thrown by this statement; could be null (representing undefined) but only when is_star is set to false",is_star:"[Boolean] Whether this is a yield or yield* statement"},_walk:function(e){return e._visit(this,this.expression&&function(){this.expression._walk(e)})},_children_backwards(e){this.expression&&e(this.expression)}}),Qe=le("If","condition alternative",{$documentation:"A `if` statement",$propdoc:{condition:"[AST_Node] the `if` condition",alternative:"[AST_Statement?] the `else` part, or null if not present"},_walk:function(e){return e._visit(this,(function(){this.condition._walk(e),this.body._walk(e),this.alternative&&this.alternative._walk(e)}))},_children_backwards(e){this.alternative&&e(this.alternative),e(this.body),e(this.condition)}},Ae),et=le("Switch","expression",{$documentation:"A `switch` statement",$propdoc:{expression:"[AST_Node] the `switch` “discriminant”"},_walk:function(e){return e._visit(this,(function(){this.expression._walk(e),Ee(this,e)}))},_children_backwards(e){let t=this.body.length;for(;t--;)e(this.body[t]);e(this.expression)}},De),tt=le("SwitchBranch",null,{$documentation:"Base class for `switch` branches"},De),nt=le("Default",null,{$documentation:"A `default` switch branch"},tt),it=le("Case","expression",{$documentation:"A `case` switch branch",$propdoc:{expression:"[AST_Node] the `case` expression"},_walk:function(e){return e._visit(this,(function(){this.expression._walk(e),Ee(this,e)}))},_children_backwards(e){let t=this.body.length;for(;t--;)e(this.body[t]);e(this.expression)}},tt),rt=le("Try","bcatch bfinally",{$documentation:"A `try` statement",$propdoc:{bcatch:"[AST_Catch?] the catch block, or null if not present",bfinally:"[AST_Finally?] the finally block, or null if not present"},_walk:function(e){return e._visit(this,(function(){Ee(this,e),this.bcatch&&this.bcatch._walk(e),this.bfinally&&this.bfinally._walk(e)}))},_children_backwards(e){this.bfinally&&e(this.bfinally),this.bcatch&&e(this.bcatch);let t=this.body.length;for(;t--;)e(this.body[t])}},De),ot=le("Catch","argname",{$documentation:"A `catch` node; only makes sense as part of a `try` statement",$propdoc:{argname:"[AST_SymbolCatch|AST_Destructuring|AST_Expansion|AST_DefaultAssign] symbol for the exception"},_walk:function(e){return e._visit(this,(function(){this.argname&&this.argname._walk(e),Ee(this,e)}))},_children_backwards(e){let t=this.body.length;for(;t--;)e(this.body[t]);this.argname&&e(this.argname)}},De),at=le("Finally",null,{$documentation:"A `finally` node; only makes sense as part of a `try` statement"},De),st=le("Definitions","definitions",{$documentation:"Base class for `var` or `const` nodes (variable declarations/initializations)",$propdoc:{definitions:"[AST_VarDef*] array of variable definitions"},_walk:function(e){return e._visit(this,(function(){for(var t=this.definitions,n=0,i=t.length;n<i;n++)t[n]._walk(e)}))},_children_backwards(e){let t=this.definitions.length;for(;t--;)e(this.definitions[t])}},_e),ut=le("Var",null,{$documentation:"A `var` statement"},st),ct=le("Let",null,{$documentation:"A `let` statement"},st),lt=le("Const",null,{$documentation:"A `const` statement"},st),ft=le("VarDef","name value",{$documentation:"A variable declaration; only appears in a AST_Definitions node",$propdoc:{name:"[AST_Destructuring|AST_SymbolConst|AST_SymbolLet|AST_SymbolVar] name of the variable",value:"[AST_Node?] initializer, or null of there's no initializer"},_walk:function(e){return e._visit(this,(function(){this.name._walk(e),this.value&&this.value._walk(e)}))},_children_backwards(e){this.value&&e(this.value),e(this.name)}}),pt=le("NameMapping","foreign_name name",{$documentation:"The part of the export/import statement that declare names from a module.",$propdoc:{foreign_name:"[AST_SymbolExportForeign|AST_SymbolImportForeign] The name being exported/imported (as specified in the module)",name:"[AST_SymbolExport|AST_SymbolImport] The name as it is visible to this module."},_walk:function(e){return e._visit(this,(function(){this.foreign_name._walk(e),this.name._walk(e)}))},_children_backwards(e){e(this.name),e(this.foreign_name)}}),_t=le("Import","imported_name imported_names module_name",{$documentation:"An `import` statement",$propdoc:{imported_name:"[AST_SymbolImport] The name of the variable holding the module's default export.",imported_names:"[AST_NameMapping*] The names of non-default imported variables",module_name:"[AST_String] String literal describing where this module came from"},_walk:function(e){return e._visit(this,(function(){this.imported_name&&this.imported_name._walk(e),this.imported_names&&this.imported_names.forEach((function(t){t._walk(e)})),this.module_name._walk(e)}))},_children_backwards(e){if(e(this.module_name),this.imported_names){let t=this.imported_names.length;for(;t--;)e(this.imported_names[t])}this.imported_name&&e(this.imported_name)}}),dt=le("Export","exported_definition exported_value is_default exported_names module_name",{$documentation:"An `export` statement",$propdoc:{exported_definition:"[AST_Defun|AST_Definitions|AST_DefClass?] An exported definition",exported_value:"[AST_Node?] An exported value",exported_names:"[AST_NameMapping*?] List of exported names",module_name:"[AST_String?] Name of the file to load exports from",is_default:"[Boolean] Whether this is the default exported value of this module"},_walk:function(e){return e._visit(this,(function(){this.exported_definition&&this.exported_definition._walk(e),this.exported_value&&this.exported_value._walk(e),this.exported_names&&this.exported_names.forEach((function(t){t._walk(e)})),this.module_name&&this.module_name._walk(e)}))},_children_backwards(e){if(this.module_name&&e(this.module_name),this.exported_names){let t=this.exported_names.length;for(;t--;)e(this.exported_names[t])}this.exported_value&&e(this.exported_value),this.exported_definition&&e(this.exported_definition)}},_e),mt=le("Call","expression args _annotations",{$documentation:"A function call expression",$propdoc:{expression:"[AST_Node] expression to invoke as function",args:"[AST_Node*] array of arguments",_annotations:"[number] bitfield containing information about the call"},initialize(){null==this._annotations&&(this._annotations=0)},_walk(e){return e._visit(this,(function(){for(var t=this.args,n=0,i=t.length;n<i;n++)t[n]._walk(e);this.expression._walk(e)}))},_children_backwards(e){let t=this.args.length;for(;t--;)e(this.args[t]);e(this.expression)}}),ht=le("New",null,{$documentation:"An object instantiation.  Derives from a function call since it has exactly the same properties"},mt),Et=le("Sequence","expressions",{$documentation:"A sequence expression (comma-separated expressions)",$propdoc:{expressions:"[AST_Node*] array of expressions (at least two)"},_walk:function(e){return e._visit(this,(function(){this.expressions.forEach((function(t){t._walk(e)}))}))},_children_backwards(e){let t=this.expressions.length;for(;t--;)e(this.expressions[t])}}),gt=le("PropAccess","expression property",{$documentation:'Base class for property access expressions, i.e. `a.foo` or `a["foo"]`',$propdoc:{expression:"[AST_Node] the “container” expression",property:"[AST_Node|string] the property to access.  For AST_Dot this is always a plain string, while for AST_Sub it's an arbitrary AST_Node"}}),Dt=le("Dot","quote",{$documentation:"A dotted property access expression",$propdoc:{quote:"[string] the original quote character when transformed from AST_Sub"},_walk:function(e){return e._visit(this,(function(){this.expression._walk(e)}))},_children_backwards(e){e(this.expression)}},gt),St=le("Sub",null,{$documentation:'Index-style property access, i.e. `a["foo"]`',_walk:function(e){return e._visit(this,(function(){this.expression._walk(e),this.property._walk(e)}))},_children_backwards(e){e(this.property),e(this.expression)}},gt),vt=le("Unary","operator expression",{$documentation:"Base class for unary expressions",$propdoc:{operator:"[string] the operator",expression:"[AST_Node] expression that this unary operator applies to"},_walk:function(e){return e._visit(this,(function(){this.expression._walk(e)}))},_children_backwards(e){e(this.expression)}}),At=le("UnaryPrefix",null,{$documentation:"Unary prefix expression, i.e. `typeof i` or `++i`"},vt),Tt=le("UnaryPostfix",null,{$documentation:"Unary postfix expression, i.e. `i++`"},vt),yt=le("Binary","operator left right",{$documentation:"Binary expression, i.e. `a + b`",$propdoc:{left:"[AST_Node] left-hand side expression",operator:"[string] the operator",right:"[AST_Node] right-hand side expression"},_walk:function(e){return e._visit(this,(function(){this.left._walk(e),this.right._walk(e)}))},_children_backwards(e){e(this.right),e(this.left)}}),bt=le("Conditional","condition consequent alternative",{$documentation:"Conditional expression using the ternary operator, i.e. `a ? b : c`",$propdoc:{condition:"[AST_Node]",consequent:"[AST_Node]",alternative:"[AST_Node]"},_walk:function(e){return e._visit(this,(function(){this.condition._walk(e),this.consequent._walk(e),this.alternative._walk(e)}))},_children_backwards(e){e(this.alternative),e(this.consequent),e(this.condition)}}),Ct=le("Assign",null,{$documentation:"An assignment expression — `a = b + 5`"},yt),Ot=le("DefaultAssign",null,{$documentation:"A default assignment expression like in `(a = 3) => a`"},yt),Ft=le("Array","elements",{$documentation:"An array literal",$propdoc:{elements:"[AST_Node*] array of elements"},_walk:function(e){return e._visit(this,(function(){for(var t=this.elements,n=0,i=t.length;n<i;n++)t[n]._walk(e)}))},_children_backwards(e){let t=this.elements.length;for(;t--;)e(this.elements[t])}}),Mt=le("Object","properties",{$documentation:"An object literal",$propdoc:{properties:"[AST_ObjectProperty*] array of properties"},_walk:function(e){return e._visit(this,(function(){for(var t=this.properties,n=0,i=t.length;n<i;n++)t[n]._walk(e)}))},_children_backwards(e){let t=this.properties.length;for(;t--;)e(this.properties[t])}}),Rt=le("ObjectProperty","key value",{$documentation:"Base class for literal object properties",$propdoc:{key:"[string|AST_Node] property name. For ObjectKeyVal this is a string. For getters, setters and computed property this is an AST_Node.",value:"[AST_Node] property value.  For getters and setters this is an AST_Accessor."},_walk:function(e){return e._visit(this,(function(){this.key instanceof pe&&this.key._walk(e),this.value._walk(e)}))},_children_backwards(e){e(this.value),this.key instanceof pe&&e(this.key)}}),wt=le("ObjectKeyVal","quote",{$documentation:"A key: value object property",$propdoc:{quote:"[string] the original quote character"},computed_key(){return this.key instanceof pe}},Rt),xt=le("ObjectSetter","quote static",{$propdoc:{quote:"[string|undefined] the original quote character, if any",static:"[boolean] whether this is a static setter (classes only)"},$documentation:"An object setter property",computed_key(){return!(this.key instanceof qt)}},Rt),Nt=le("ObjectGetter","quote static",{$propdoc:{quote:"[string|undefined] the original quote character, if any",static:"[boolean] whether this is a static getter (classes only)"},$documentation:"An object getter property",computed_key(){return!(this.key instanceof qt)}},Rt),kt=le("ConciseMethod","quote static is_generator async",{$propdoc:{quote:"[string|undefined] the original quote character, if any",static:"[boolean] is this method static (classes only)",is_generator:"[boolean] is this a generator method",async:"[boolean] is this method async"},$documentation:"An ES6 concise method inside an object or class",computed_key(){return!(this.key instanceof qt)}},Rt),It=le("Class","name extends properties",{$propdoc:{name:"[AST_SymbolClass|AST_SymbolDefClass?] optional class name.",extends:"[AST_Node]? optional parent class",properties:"[AST_ObjectProperty*] array of properties"},$documentation:"An ES6 class",_walk:function(e){return e._visit(this,(function(){this.name&&this.name._walk(e),this.extends&&this.extends._walk(e),this.properties.forEach(t=>t._walk(e))}))},_children_backwards(e){let t=this.properties.length;for(;t--;)e(this.properties[t]);this.extends&&e(this.extends),this.name&&e(this.name)}},xe),Lt=le("ClassProperty","static quote",{$documentation:"A class property",$propdoc:{static:"[boolean] whether this is a static key",quote:"[string] which quote is being used"},_walk:function(e){return e._visit(this,(function(){this.key instanceof pe&&this.key._walk(e),this.value instanceof pe&&this.value._walk(e)}))},_children_backwards(e){this.value instanceof pe&&e(this.value),this.key instanceof pe&&e(this.key)},computed_key(){return!(this.key instanceof $t)}},Rt),Pt=le("DefClass",null,{$documentation:"A class definition"},It),Vt=le("ClassExpression",null,{$documentation:"A class expression."},It),Bt=le("Symbol","scope name thedef",{$propdoc:{name:"[string] name of this symbol",scope:"[AST_Scope/S] the current scope (not necessarily the definition scope)",thedef:"[SymbolDef/S] the definition of this symbol"},$documentation:"Base class for all symbols"}),Kt=le("NewTarget",null,{$documentation:"A reference to new.target"}),Ut=le("SymbolDeclaration","init",{$documentation:"A declaration symbol (symbol in var/const, function name or argument, symbol in catch)"},Bt),Gt=le("SymbolVar",null,{$documentation:"Symbol defining a variable"},Ut),Ht=le("SymbolBlockDeclaration",null,{$documentation:"Base class for block-scoped declaration symbols"},Ut),Xt=le("SymbolConst",null,{$documentation:"A constant declaration"},Ht),zt=le("SymbolLet",null,{$documentation:"A block-scoped `let` declaration"},Ht),Wt=le("SymbolFunarg",null,{$documentation:"Symbol naming a function argument"},Gt),Yt=le("SymbolDefun",null,{$documentation:"Symbol defining a function"},Ut),qt=le("SymbolMethod",null,{$documentation:"Symbol in an object defining a method"},Bt),$t=le("SymbolClassProperty",null,{$documentation:"Symbol for a class property"},Bt),jt=le("SymbolLambda",null,{$documentation:"Symbol naming a function expression"},Ut),Zt=le("SymbolDefClass",null,{$documentation:"Symbol naming a class's name in a class declaration. Lexically scoped to its containing scope, and accessible within the class."},Ht),Jt=le("SymbolClass",null,{$documentation:"Symbol naming a class's name. Lexically scoped to the class."},Ut),Qt=le("SymbolCatch",null,{$documentation:"Symbol naming the exception in catch"},Ht),en=le("SymbolImport",null,{$documentation:"Symbol referring to an imported name"},Ht),tn=le("SymbolImportForeign",null,{$documentation:"A symbol imported from a module, but it is defined in the other module, and its real name is irrelevant for this module's purposes"},Bt),nn=le("Label","references",{$documentation:"Symbol naming a label (declaration)",$propdoc:{references:"[AST_LoopControl*] a list of nodes referring to this label"},initialize:function(){this.references=[],this.thedef=this}},Bt),rn=le("SymbolRef",null,{$documentation:"Reference to some symbol (not definition/declaration)"},Bt),on=le("SymbolExport",null,{$documentation:"Symbol referring to a name to export"},rn),an=le("SymbolExportForeign",null,{$documentation:"A symbol exported from this module, but it is used in the other module, and its real name is irrelevant for this module's purposes"},Bt),sn=le("LabelRef",null,{$documentation:"Reference to a label symbol"},Bt),un=le("This",null,{$documentation:"The `this` symbol"},Bt),cn=le("Super",null,{$documentation:"The `super` symbol"},un),ln=le("Constant",null,{$documentation:"Base class for all constants",getValue:function(){return this.value}}),fn=le("String","value quote",{$documentation:"A string literal",$propdoc:{value:"[string] the contents of this string",quote:"[string] the original quote character"}},ln),pn=le("Number","value literal",{$documentation:"A number literal",$propdoc:{value:"[number] the numeric value",literal:"[string] numeric value as string (optional)"}},ln),_n=le("BigInt","value",{$documentation:"A big int literal",$propdoc:{value:"[string] big int value"}},ln),dn=le("RegExp","value",{$documentation:"A regexp literal",$propdoc:{value:"[RegExp] the actual regexp"}},ln),mn=le("Atom",null,{$documentation:"Base class for atoms"},ln),hn=le("Null",null,{$documentation:"The `null` atom",value:null},mn),En=le("NaN",null,{$documentation:"The impossible value",value:NaN},mn),gn=le("Undefined",null,{$documentation:"The `undefined` value",value:void 0},mn),Dn=le("Hole",null,{$documentation:"A hole in an array",value:void 0},mn),Sn=le("Infinity",null,{$documentation:"The `Infinity` value",value:1/0},mn),vn=le("Boolean",null,{$documentation:"Base class for booleans"},mn),An=le("False",null,{$documentation:"The `false` atom",value:!1},vn),Tn=le("True",null,{$documentation:"The `true` atom",value:!0},vn);function yn(e,t,n=[e]){const i=n.push.bind(n);for(;n.length;){const e=n.pop(),r=t(e,n);if(r){if(r===Cn)return!0}else e._children_backwards(i)}return!1}function bn(e,t,n){const i=[e],r=i.push.bind(i),o=n?n.slice():[],a=[];let s;const u={parent:(e=0)=>-1===e?s:n&&e>=o.length?(e-=o.length,n[n.length-(e+1)]):o[o.length-(1+e)]};for(;i.length;){for(s=i.pop();a.length&&i.length==a[a.length-1];)o.pop(),a.pop();const e=t(s,u);if(e){if(e===Cn)return!0;continue}const n=i.length;s._children_backwards(r),i.length>n&&(o.push(s),a.push(n-1))}return!1}const Cn=Symbol("abort walk");class On{constructor(e){this.visit=e,this.stack=[],this.directives=Object.create(null)}_visit(e,t){this.push(e);var n=this.visit(e,t?function(){t.call(e)}:a);return!n&&t&&t.call(e),this.pop(),n}parent(e){return this.stack[this.stack.length-2-(e||0)]}push(e){e instanceof Ie?this.directives=Object.create(this.directives):e instanceof me&&!this.directives[e.value]?this.directives[e.value]=e:e instanceof It&&(this.directives=Object.create(this.directives),this.directives["use strict"]||(this.directives["use strict"]=e)),this.stack.push(e)}pop(){var e=this.stack.pop();(e instanceof Ie||e instanceof It)&&(this.directives=Object.getPrototypeOf(this.directives))}self(){return this.stack[this.stack.length-1]}find_parent(e){for(var t=this.stack,n=t.length;--n>=0;){var i=t[n];if(i instanceof e)return i}}has_directive(e){var t=this.directives[e];if(t)return t;var n=this.stack[this.stack.length-1];if(n instanceof xe&&n.body)for(var i=0;i<n.body.length;++i){var r=n.body[i];if(!(r instanceof me))break;if(r.value==e)return r}}loopcontrol_target(e){var t=this.stack;if(e.label)for(var n=t.length;--n>=0;){if((i=t[n])instanceof Te&&i.label.name==e.label.name)return i.body}else for(n=t.length;--n>=0;){var i;if((i=t[n])instanceof ye||e instanceof $e&&i instanceof et)return i}}}class Fn extends On{constructor(e,t){super(),this.before=e,this.after=t}}const Mn=1,Rn=2,wn=4;var xn=Object.freeze({__proto__:null,AST_Accessor:Le,AST_Array:Ft,AST_Arrow:Ve,AST_Assign:Ct,AST_Atom:mn,AST_Await:Ze,AST_BigInt:_n,AST_Binary:yt,AST_Block:De,AST_BlockStatement:Se,AST_Boolean:vn,AST_Break:$e,AST_Call:mt,AST_Case:it,AST_Catch:ot,AST_Class:It,AST_ClassExpression:Vt,AST_ClassProperty:Lt,AST_ConciseMethod:kt,AST_Conditional:bt,AST_Const:lt,AST_Constant:ln,AST_Continue:je,AST_Debugger:de,AST_Default:nt,AST_DefaultAssign:Ot,AST_DefClass:Pt,AST_Definitions:st,AST_Defun:Be,AST_Destructuring:Ke,AST_Directive:me,AST_Do:Ce,AST_Dot:Dt,AST_DWLoop:be,AST_EmptyStatement:ve,AST_Exit:ze,AST_Expansion:ke,AST_Export:dt,AST_False:An,AST_Finally:at,AST_For:Fe,AST_ForIn:Me,AST_ForOf:Re,AST_Function:Pe,AST_Hole:Dn,AST_If:Qe,AST_Import:_t,AST_Infinity:Sn,AST_IterationStatement:ye,AST_Jump:Xe,AST_Label:nn,AST_LabeledStatement:Te,AST_LabelRef:sn,AST_Lambda:Ie,AST_Let:ct,AST_LoopControl:qe,AST_NameMapping:pt,AST_NaN:En,AST_New:ht,AST_NewTarget:Kt,AST_Node:pe,AST_Null:hn,AST_Number:pn,AST_Object:Mt,AST_ObjectGetter:Nt,AST_ObjectKeyVal:wt,AST_ObjectProperty:Rt,AST_ObjectSetter:xt,AST_PrefixedTemplateString:Ue,AST_PropAccess:gt,AST_RegExp:dn,AST_Return:We,AST_Scope:xe,AST_Sequence:Et,AST_SimpleStatement:he,AST_Statement:_e,AST_StatementWithBody:Ae,AST_String:fn,AST_Sub:St,AST_Super:cn,AST_Switch:et,AST_SwitchBranch:tt,AST_Symbol:Bt,AST_SymbolBlockDeclaration:Ht,AST_SymbolCatch:Qt,AST_SymbolClass:Jt,AST_SymbolClassProperty:$t,AST_SymbolConst:Xt,AST_SymbolDeclaration:Ut,AST_SymbolDefClass:Zt,AST_SymbolDefun:Yt,AST_SymbolExport:on,AST_SymbolExportForeign:an,AST_SymbolFunarg:Wt,AST_SymbolImport:en,AST_SymbolImportForeign:tn,AST_SymbolLambda:jt,AST_SymbolLet:zt,AST_SymbolMethod:qt,AST_SymbolRef:rn,AST_SymbolVar:Gt,AST_TemplateSegment:He,AST_TemplateString:Ge,AST_This:un,AST_Throw:Ye,AST_Token:fe,AST_Toplevel:Ne,AST_True:Tn,AST_Try:rt,AST_Unary:vt,AST_UnaryPostfix:Tt,AST_UnaryPrefix:At,AST_Undefined:gn,AST_Var:ut,AST_VarDef:ft,AST_While:Oe,AST_With:we,AST_Yield:Je,TreeTransformer:Fn,TreeWalker:On,walk:yn,walk_abort:Cn,walk_body:Ee,walk_parent:bn,_INLINE:Rn,_NOINLINE:wn,_PURE:Mn});function Nn(e,t){e.DEFMETHOD("transform",(function(e,n){let i=void 0;if(e.push(this),e.before&&(i=e.before(this,t,n)),void 0===i&&(i=this,t(i,e),e.after)){const t=e.after(i,n);void 0!==t&&(i=t)}return e.pop(),i}))}function kn(e,t){return f(e,(function(e){return e.transform(t,!0)}))}function In(e){let t=e.parent(-1);for(let n,i=0;n=e.parent(i);i++){if(n instanceof _e&&n.body===t)return!0;if(!(n instanceof Et&&n.expressions[0]===t||"Call"===n.TYPE&&n.expression===t||n instanceof Ue&&n.prefix===t||n instanceof Dt&&n.expression===t||n instanceof St&&n.expression===t||n instanceof bt&&n.condition===t||n instanceof yt&&n.left===t||n instanceof Tt&&n.expression===t))return!1;t=n}}Nn(pe,a),Nn(Te,(function(e,t){e.label=e.label.transform(t),e.body=e.body.transform(t)})),Nn(he,(function(e,t){e.body=e.body.transform(t)})),Nn(De,(function(e,t){e.body=kn(e.body,t)})),Nn(Ce,(function(e,t){e.body=e.body.transform(t),e.condition=e.condition.transform(t)})),Nn(Oe,(function(e,t){e.condition=e.condition.transform(t),e.body=e.body.transform(t)})),Nn(Fe,(function(e,t){e.init&&(e.init=e.init.transform(t)),e.condition&&(e.condition=e.condition.transform(t)),e.step&&(e.step=e.step.transform(t)),e.body=e.body.transform(t)})),Nn(Me,(function(e,t){e.init=e.init.transform(t),e.object=e.object.transform(t),e.body=e.body.transform(t)})),Nn(we,(function(e,t){e.expression=e.expression.transform(t),e.body=e.body.transform(t)})),Nn(ze,(function(e,t){e.value&&(e.value=e.value.transform(t))})),Nn(qe,(function(e,t){e.label&&(e.label=e.label.transform(t))})),Nn(Qe,(function(e,t){e.condition=e.condition.transform(t),e.body=e.body.transform(t),e.alternative&&(e.alternative=e.alternative.transform(t))})),Nn(et,(function(e,t){e.expression=e.expression.transform(t),e.body=kn(e.body,t)})),Nn(it,(function(e,t){e.expression=e.expression.transform(t),e.body=kn(e.body,t)})),Nn(rt,(function(e,t){e.body=kn(e.body,t),e.bcatch&&(e.bcatch=e.bcatch.transform(t)),e.bfinally&&(e.bfinally=e.bfinally.transform(t))})),Nn(ot,(function(e,t){e.argname&&(e.argname=e.argname.transform(t)),e.body=kn(e.body,t)})),Nn(st,(function(e,t){e.definitions=kn(e.definitions,t)})),Nn(ft,(function(e,t){e.name=e.name.transform(t),e.value&&(e.value=e.value.transform(t))})),Nn(Ke,(function(e,t){e.names=kn(e.names,t)})),Nn(Ie,(function(e,t){e.name&&(e.name=e.name.transform(t)),e.argnames=kn(e.argnames,t),e.body instanceof pe?e.body=e.body.transform(t):e.body=kn(e.body,t)})),Nn(mt,(function(e,t){e.expression=e.expression.transform(t),e.args=kn(e.args,t)})),Nn(Et,(function(e,t){const n=kn(e.expressions,t);e.expressions=n.length?n:[new pn({value:0})]})),Nn(Dt,(function(e,t){e.expression=e.expression.transform(t)})),Nn(St,(function(e,t){e.expression=e.expression.transform(t),e.property=e.property.transform(t)})),Nn(Je,(function(e,t){e.expression&&(e.expression=e.expression.transform(t))})),Nn(Ze,(function(e,t){e.expression=e.expression.transform(t)})),Nn(vt,(function(e,t){e.expression=e.expression.transform(t)})),Nn(yt,(function(e,t){e.left=e.left.transform(t),e.right=e.right.transform(t)})),Nn(bt,(function(e,t){e.condition=e.condition.transform(t),e.consequent=e.consequent.transform(t),e.alternative=e.alternative.transform(t)})),Nn(Ft,(function(e,t){e.elements=kn(e.elements,t)})),Nn(Mt,(function(e,t){e.properties=kn(e.properties,t)})),Nn(Rt,(function(e,t){e.key instanceof pe&&(e.key=e.key.transform(t)),e.value&&(e.value=e.value.transform(t))})),Nn(It,(function(e,t){e.name&&(e.name=e.name.transform(t)),e.extends&&(e.extends=e.extends.transform(t)),e.properties=kn(e.properties,t)})),Nn(ke,(function(e,t){e.expression=e.expression.transform(t)})),Nn(pt,(function(e,t){e.foreign_name=e.foreign_name.transform(t),e.name=e.name.transform(t)})),Nn(_t,(function(e,t){e.imported_name&&(e.imported_name=e.imported_name.transform(t)),e.imported_names&&kn(e.imported_names,t),e.module_name=e.module_name.transform(t)})),Nn(dt,(function(e,t){e.exported_definition&&(e.exported_definition=e.exported_definition.transform(t)),e.exported_value&&(e.exported_value=e.exported_value.transform(t)),e.exported_names&&kn(e.exported_names,t),e.module_name&&(e.module_name=e.module_name.transform(t))})),Nn(Ge,(function(e,t){e.segments=kn(e.segments,t)})),Nn(Ue,(function(e,t){e.prefix=e.prefix.transform(t),e.template_string=e.template_string.transform(t)}));const Ln=/^$|[;{][\s\n]*$/,Pn=/[@#]__(PURE|INLINE|NOINLINE)__/g;function Vn(e){return("comment2"===e.type||"comment1"===e.type)&&/@preserve|@lic|@cc_on|^\**!/i.test(e.value)}function Bn(e){var t=!e;void 0===(e=o(e,{ascii_only:!1,beautify:!1,braces:!1,comments:"some",ecma:5,ie8:!1,indent_level:4,indent_start:0,inline_script:!0,keep_numbers:!1,keep_quoted_props:!1,max_line_len:!1,preamble:null,preserve_annotations:!1,quote_keys:!1,quote_style:0,safari10:!1,semicolons:!0,shebang:!0,shorthand:void 0,source_map:null,webkit:!1,width:80,wrap_iife:!1,wrap_func_args:!0},!0)).shorthand&&(e.shorthand=e.ecma>5);var n=s;if(e.comments){let t=e.comments;if("string"==typeof e.comments&&/^\/.*\/[a-zA-Z]*$/.test(e.comments)){var i=e.comments.lastIndexOf("/");t=new RegExp(e.comments.substr(1,i-1),e.comments.substr(i+1))}n=t instanceof RegExp?function(e){return"comment5"!=e.type&&t.test(e.value)}:"function"==typeof t?function(e){return"comment5"!=e.type&&t(this,e)}:"some"===t?Vn:u}var r=0,c=0,l=1,f=0,p="";let _=new Set;var d=e.ascii_only?function(t,n){return e.ecma>=2015&&(t=t.replace(/[\ud800-\udbff][\udc00-\udfff]/g,(function(e){return"\\u{"+function(e,t){return z(e.charCodeAt(t))?65536+(e.charCodeAt(t)-55296<<10)+e.charCodeAt(t+1)-56320:e.charCodeAt(t)}(e,0).toString(16)+"}"}))),t.replace(/[\u0000-\u001f\u007f-\uffff]/g,(function(e){var t=e.charCodeAt(0).toString(16);if(t.length<=2&&!n){for(;t.length<2;)t="0"+t;return"\\x"+t}for(;t.length<4;)t="0"+t;return"\\u"+t}))}:function(e){return e.replace(/[\ud800-\udbff][\udc00-\udfff]|([\ud800-\udbff]|[\udc00-\udfff])/g,(function(e,t){return t?"\\u"+t.charCodeAt(0).toString(16):e}))};function m(t,n){var i=function(t,n){var i=0,r=0;function o(){return"'"+t.replace(/\x27/g,"\\'")+"'"}function a(){return'"'+t.replace(/\x22/g,'\\"')+'"'}if(t=t.replace(/[\\\b\f\n\r\v\t\x22\x27\u2028\u2029\0\ufeff]/g,(function(n,o){switch(n){case'"':return++i,'"';case"'":return++r,"'";case"\\":return"\\\\";case"\n":return"\\n";case"\r":return"\\r";case"\t":return"\\t";case"\b":return"\\b";case"\f":return"\\f";case"\v":return e.ie8?"\\x0B":"\\v";case"\u2028":return"\\u2028";case"\u2029":return"\\u2029";case"\ufeff":return"\\ufeff";case"\0":return/[0-9]/.test(X(t,o+1))?"\\x00":"\\0"}return n})),t=d(t),"`"===n)return"`"+t.replace(/`/g,"\\`")+"`";switch(e.quote_style){case 1:return o();case 2:return a();case 3:return"'"==n?o():a();default:return i>r?o():a()}}(t,n);return e.inline_script&&(i=(i=(i=i.replace(/<\x2f(script)([>\/\t\n\f\r ])/gi,"<\\/$1$2")).replace(/\x3c!--/g,"\\x3c!--")).replace(/--\x3e/g,"--\\x3e")),i}var h,g,D=!1,S=!1,v=!1,A=0,T=!1,y=!1,b=-1,C="",O=e.source_map&&[],F=O?function(){O.forEach((function(t){try{e.source_map.add(t.token.file,t.line,t.col,t.token.line,t.token.col,t.name||"name"!=t.token.type?t.name:t.token.value)}catch(e){null!=t.token.file&&pe.warn("Couldn't figure out mapping for {file}:{line},{col} → {cline},{ccol} [{name}]",{file:t.token.file,line:t.token.line,col:t.token.col,cline:t.line,ccol:t.col,name:t.name||""})}})),O=[]}:a,M=e.max_line_len?function(){if(c>e.max_line_len){if(A){var t=p.slice(0,A),n=p.slice(A);if(O){var i=n.length-c;O.forEach((function(e){e.line++,e.col+=i}))}p=t+"\n"+n,l++,f++,c=n.length}c>e.max_line_len&&pe.warn("Output exceeds {max_line_len} characters",e)}A&&(A=0,F())}:a,R=E("( [ + * / - , . `");function w(t){var n=X(t=String(t),0);T&&n&&(T=!1,"\n"!==n&&(w("\n"),N())),y&&n&&(y=!1,/[\s;})]/.test(n)||x()),b=-1;var i=C.charAt(C.length-1);v&&(v=!1,(":"!==i||"}"!==n)&&(n&&";}".includes(n)||";"===i)||(e.semicolons||R.has(n)?(p+=";",c++,f++):(M(),c>0&&(p+="\n",f++,l++,c=0),/^\s+$/.test(t)&&(v=!0)),e.beautify||(S=!1))),S&&(($(i)&&($(n)||"\\"==n)||"/"==n&&n==i||("+"==n||"-"==n)&&n==C)&&(p+=" ",c++,f++),S=!1),h&&(O.push({token:h,name:g,line:l,col:c}),h=!1,A||F()),p+=t,D="("==t[t.length-1],f+=t.length;var r=t.split(/\r?\n/),o=r.length-1;l+=o,c+=r[0].length,o>0&&(M(),c=r[o].length),C=t}var x=e.beautify?function(){w(" ")}:function(){S=!0},N=e.beautify?function(t){var n;e.beautify&&w((n=t?.5:0," ".repeat(e.indent_start+r-n*e.indent_level)))}:a,k=e.beautify?function(e,t){!0===e&&(e=V());var n=r;r=e;var i=t();return r=n,i}:function(e,t){return t()},I=e.beautify?function(){if(b<0)return w("\n");"\n"!=p[b]&&(p=p.slice(0,b)+"\n"+p.slice(b),f++,l++),b++}:e.max_line_len?function(){M(),A=p.length}:a,L=e.beautify?function(){w(";")}:function(){v=!0};function P(){v=!1,w(";")}function V(){return r+e.indent_level}function B(){return A&&M(),p}function K(){let e=p.length-1;for(;e>=0;){const t=p.charCodeAt(e);if(10===t)return!0;if(32!==t)return!1;e--}return!0}function U(t){return e.preserve_annotations||(t=t.replace(Pn," ")),/^\s*$/.test(t)?"":t.replace(/(<\s*\/\s*)(script)/i,"<\\/$2")}var G=[];return{get:B,toString:B,indent:N,in_directive:!1,use_asm:null,active_scope:null,indentation:function(){return r},current_width:function(){return c-r},should_break:function(){return e.width&&this.current_width()>=e.width},has_parens:function(){return D},newline:I,print:w,star:function(){w("*")},space:x,comma:function(){w(","),x()},colon:function(){w(":"),x()},last:function(){return C},semicolon:L,force_semicolon:P,to_utf8:d,print_name:function(e){w(function(e){return e=e.toString(),e=d(e,!0)}(e))},print_string:function(e,t,n){var i=m(e,t);!0!==n||i.includes("\\")||(Ln.test(p)||P(),P()),w(i)},print_template_string_chars:function(e){var t=m(e,"`").replace(/\${/g,"\\${");return w(t.substr(1,t.length-2))},encode_string:m,next_indent:V,with_indent:k,with_block:function(e){var t;return w("{"),I(),k(V(),(function(){t=e()})),N(),w("}"),t},with_parens:function(e){w("(");var t=e();return w(")"),t},with_square:function(e){w("[");var t=e();return w("]"),t},add_mapping:O?function(e,t){h=e,g=t}:a,option:function(t){return e[t]},printed_comments:_,prepend_comments:t?a:function(t){var i=t.start;if(!i)return;var r=this.printed_comments;const o=t instanceof ze&&t.value;if(i.comments_before&&r.has(i.comments_before)){if(!o)return;i.comments_before=[]}var a=i.comments_before;if(a||(a=i.comments_before=[]),r.add(a),o){var s=new On((function(e){var t=s.parent();if(!(t instanceof ze||t instanceof yt&&t.left===e||"Call"==t.TYPE&&t.expression===e||t instanceof bt&&t.condition===e||t instanceof Dt&&t.expression===e||t instanceof Et&&t.expressions[0]===e||t instanceof St&&t.expression===e||t instanceof Tt))return!0;if(e.start){var n=e.start.comments_before;n&&!r.has(n)&&(r.add(n),a=a.concat(n))}}));s.push(t),t.value.walk(s)}if(0==f){a.length>0&&e.shebang&&"comment5"===a[0].type&&!r.has(a[0])&&(w("#!"+a.shift().value+"\n"),N());var u=e.preamble;u&&w(u.replace(/\r\n?|[\n\u2028\u2029]|\s*$/g,"\n"))}if(0!=(a=a.filter(n,t).filter(e=>!r.has(e))).length){var c=K();a.forEach((function(e,t){if(r.add(e),c||(e.nlb?(w("\n"),N(),c=!0):t>0&&x()),/comment[134]/.test(e.type))(n=U(e.value))&&(w("//"+n+"\n"),N()),c=!0;else if("comment2"==e.type){var n;(n=U(e.value))&&w("/*"+n+"*/"),c=!1}})),c||(i.nlb?(w("\n"),N()):x())}},append_comments:t||n===s?a:function(e,t){var i=e.end;if(i){var r=this.printed_comments,o=i[t?"comments_before":"comments_after"];if(o&&!r.has(o)&&(e instanceof _e||o.every(e=>!/comment[134]/.test(e.type)))){r.add(o);var a=p.length;o.filter(n,e).forEach((function(e,n){if(!r.has(e))if(r.add(e),y=!1,T?(w("\n"),N(),T=!1):e.nlb&&(n>0||!K())?(w("\n"),N()):(n>0||!t)&&x(),/comment[134]/.test(e.type)){const t=U(e.value);t&&w("//"+t),T=!0}else if("comment2"==e.type){const t=U(e.value);t&&w("/*"+t+"*/"),y=!0}})),p.length>a&&(b=a)}}},line:function(){return l},col:function(){return c},pos:function(){return f},push_node:function(e){G.push(e)},pop_node:function(){return G.pop()},parent:function(e){return G[G.length-2-(e||0)]}}}!function(){function e(e,t){e.DEFMETHOD("_codegen",t)}function t(e,n){Array.isArray(e)?e.forEach((function(e){t(e,n)})):e.DEFMETHOD("needs_parens",n)}function n(e,t,n,i){var r=e.length-1;n.in_directive=i,e.forEach((function(e,i){!0!==n.in_directive||e instanceof me||e instanceof ve||e instanceof he&&e.body instanceof fn||(n.in_directive=!1),e instanceof ve||(n.indent(),e.print(n),i==r&&t||(n.newline(),t&&n.newline())),!0===n.in_directive&&e instanceof he&&e.body instanceof fn&&(n.in_directive=!1)})),n.in_directive=!1}function i(e,t){t.print("{"),t.with_indent(t.next_indent(),(function(){t.append_comments(e,!0)})),t.print("}")}function r(e,t,r){e.body.length>0?t.with_block((function(){n(e.body,!1,t,r)})):i(e,t)}function o(e,t,n){var i=!1;n&&(i=yn(e,e=>e instanceof xe||(e instanceof yt&&"in"==e.operator?Cn:void 0))),e.print(t,i)}function u(e,t,n){return n.option("quote_keys")?n.print_string(e):""+ +e==e&&e>=0?n.option("keep_numbers")?n.print(e):n.print(p(e)):(O.has(e)?n.option("ie8"):n.option("ecma")<2015?!j(e):!Z(e,!0))||t&&n.option("keep_quoted_props")?n.print_string(e,t):n.print_name(e)}pe.DEFMETHOD("print",(function(e,t){var n=this,i=n._codegen;function r(){e.prepend_comments(n),n.add_source_map(e),i(n,e),e.append_comments(n)}n instanceof xe?e.active_scope=n:!e.use_asm&&n instanceof me&&"use asm"==n.value&&(e.use_asm=e.active_scope),e.push_node(n),t||n.needs_parens(e)?e.with_parens(r):r(),e.pop_node(),n===e.use_asm&&(e.use_asm=null)})),pe.DEFMETHOD("_print",pe.prototype.print),pe.DEFMETHOD("print_to_string",(function(e){var t=Bn(e);return this.print(t),t.get()})),t(pe,s),t(Pe,(function(e){if(!e.has_parens()&&In(e))return!0;var t;if(e.option("webkit")&&((t=e.parent())instanceof gt&&t.expression===this))return!0;if(e.option("wrap_iife")&&((t=e.parent())instanceof mt&&t.expression===this))return!0;if(e.option("wrap_func_args")&&((t=e.parent())instanceof mt&&t.args.includes(this)))return!0;return!1})),t(Ve,(function(e){var t=e.parent();return t instanceof gt&&t.expression===this})),t(Mt,(function(e){return!e.has_parens()&&In(e)})),t(Vt,In),t(vt,(function(e){var t=e.parent();return t instanceof gt&&t.expression===this||t instanceof mt&&t.expression===this||t instanceof yt&&"**"===t.operator&&this instanceof At&&t.left===this&&"++"!==this.operator&&"--"!==this.operator})),t(Ze,(function(e){var t=e.parent();return t instanceof gt&&t.expression===this||t instanceof mt&&t.expression===this||e.option("safari10")&&t instanceof At})),t(Et,(function(e){var t=e.parent();return t instanceof mt||t instanceof vt||t instanceof yt||t instanceof ft||t instanceof gt||t instanceof Ft||t instanceof Rt||t instanceof bt||t instanceof Ve||t instanceof Ot||t instanceof ke||t instanceof Re&&this===t.object||t instanceof Je||t instanceof dt})),t(yt,(function(e){var t=e.parent();if(t instanceof mt&&t.expression===this)return!0;if(t instanceof vt)return!0;if(t instanceof gt&&t.expression===this)return!0;if(t instanceof yt){const e=t.operator,n=this.operator;if("??"===n&&("||"===e||"&&"===e))return!0;const i=se[e],r=se[n];if(i>r||i==r&&(this===t.right||"**"==e))return!0}})),t(Je,(function(e){var t=e.parent();return t instanceof yt&&"="!==t.operator||(t instanceof mt&&t.expression===this||(t instanceof bt&&t.condition===this||(t instanceof vt||(t instanceof gt&&t.expression===this||void 0))))})),t(gt,(function(e){var t=e.parent();if(t instanceof ht&&t.expression===this)return yn(this,e=>e instanceof xe||(e instanceof mt?Cn:void 0))})),t(mt,(function(e){var t,n=e.parent();return!!(n instanceof ht&&n.expression===this||n instanceof dt&&n.is_default&&this.expression instanceof Pe)||this.expression instanceof Pe&&n instanceof gt&&n.expression===this&&(t=e.parent(1))instanceof Ct&&t.left===n})),t(ht,(function(e){var t=e.parent();if(0===this.args.length&&(t instanceof gt||t instanceof mt&&t.expression===this))return!0})),t(pn,(function(e){var t=e.parent();if(t instanceof gt&&t.expression===this){var n=this.getValue();if(n<0||/^0/.test(p(n)))return!0}})),t(_n,(function(e){var t=e.parent();if(t instanceof gt&&t.expression===this&&this.getValue().startsWith("-"))return!0})),t([Ct,bt],(function(e){var t=e.parent();return t instanceof vt||(t instanceof yt&&!(t instanceof Ct)||(t instanceof mt&&t.expression===this||(t instanceof bt&&t.condition===this||(t instanceof gt&&t.expression===this||(this instanceof Ct&&this.left instanceof Ke&&!1===this.left.is_array||void 0)))))})),e(me,(function(e,t){t.print_string(e.value,e.quote),t.semicolon()})),e(ke,(function(e,t){t.print("..."),e.expression.print(t)})),e(Ke,(function(e,t){t.print(e.is_array?"[":"{");var n=e.names.length;e.names.forEach((function(e,i){i>0&&t.comma(),e.print(t),i==n-1&&e instanceof Dn&&t.comma()})),t.print(e.is_array?"]":"}")})),e(de,(function(e,t){t.print("debugger"),t.semicolon()})),Ae.DEFMETHOD("_do_print_body",(function(e){f(this.body,e)})),e(_e,(function(e,t){e.body.print(t),t.semicolon()})),e(Ne,(function(e,t){n(e.body,!0,t,!0),t.print("")})),e(Te,(function(e,t){e.label.print(t),t.colon(),e.body.print(t)})),e(he,(function(e,t){e.body.print(t),t.semicolon()})),e(Se,(function(e,t){r(e,t)})),e(ve,(function(e,t){t.semicolon()})),e(Ce,(function(e,t){t.print("do"),t.space(),_(e.body,t),t.space(),t.print("while"),t.space(),t.with_parens((function(){e.condition.print(t)})),t.semicolon()})),e(Oe,(function(e,t){t.print("while"),t.space(),t.with_parens((function(){e.condition.print(t)})),t.space(),e._do_print_body(t)})),e(Fe,(function(e,t){t.print("for"),t.space(),t.with_parens((function(){e.init?(e.init instanceof st?e.init.print(t):o(e.init,t,!0),t.print(";"),t.space()):t.print(";"),e.condition?(e.condition.print(t),t.print(";"),t.space()):t.print(";"),e.step&&e.step.print(t)})),t.space(),e._do_print_body(t)})),e(Me,(function(e,t){t.print("for"),e.await&&(t.space(),t.print("await")),t.space(),t.with_parens((function(){e.init.print(t),t.space(),t.print(e instanceof Re?"of":"in"),t.space(),e.object.print(t)})),t.space(),e._do_print_body(t)})),e(we,(function(e,t){t.print("with"),t.space(),t.with_parens((function(){e.expression.print(t)})),t.space(),e._do_print_body(t)})),Ie.DEFMETHOD("_do_print",(function(e,t){var n=this;t||(n.async&&(e.print("async"),e.space()),e.print("function"),n.is_generator&&e.star(),n.name&&e.space()),n.name instanceof Bt?n.name.print(e):t&&n.name instanceof pe&&e.with_square((function(){n.name.print(e)})),e.with_parens((function(){n.argnames.forEach((function(t,n){n&&e.comma(),t.print(e)}))})),e.space(),r(n,e,!0)})),e(Ie,(function(e,t){e._do_print(t)})),e(Ue,(function(e,t){var n=e.prefix,i=n instanceof Ie||n instanceof yt||n instanceof bt||n instanceof Et||n instanceof vt||n instanceof Dt&&n.expression instanceof Mt;i&&t.print("("),e.prefix.print(t),i&&t.print(")"),e.template_string.print(t)})),e(Ge,(function(e,t){var n=t.parent()instanceof Ue;t.print("`");for(var i=0;i<e.segments.length;i++)e.segments[i]instanceof He?n?t.print(e.segments[i].raw):t.print_template_string_chars(e.segments[i].value):(t.print("${"),e.segments[i].print(t),t.print("}"));t.print("`")})),Ve.DEFMETHOD("_do_print",(function(e){var t=this,n=e.parent(),i=n instanceof yt&&!(n instanceof Ct)||n instanceof vt||n instanceof mt&&t===n.expression;i&&e.print("("),t.async&&(e.print("async"),e.space()),1===t.argnames.length&&t.argnames[0]instanceof Bt?t.argnames[0].print(e):e.with_parens((function(){t.argnames.forEach((function(t,n){n&&e.comma(),t.print(e)}))})),e.space(),e.print("=>"),e.space();const o=t.body[0];if(1===t.body.length&&o instanceof We){const t=o.value;t?!function e(t){return t instanceof Mt||(t instanceof Et?e(t.expressions[0]):"Call"===t.TYPE?e(t.expression):t instanceof Ue?e(t.prefix):t instanceof Dt||t instanceof St?e(t.expression):t instanceof bt?e(t.condition):t instanceof yt?e(t.left):t instanceof Tt&&e(t.expression))}(t)?t.print(e):(e.print("("),t.print(e),e.print(")")):e.print("{}")}else r(t,e);i&&e.print(")")})),ze.DEFMETHOD("_do_print",(function(e,t){if(e.print(t),this.value){e.space();const t=this.value.start.comments_before;t&&t.length&&!e.printed_comments.has(t)?(e.print("("),this.value.print(e),e.print(")")):this.value.print(e)}e.semicolon()})),e(We,(function(e,t){e._do_print(t,"return")})),e(Ye,(function(e,t){e._do_print(t,"throw")})),e(Je,(function(e,t){var n=e.is_star?"*":"";t.print("yield"+n),e.expression&&(t.space(),e.expression.print(t))})),e(Ze,(function(e,t){t.print("await"),t.space();var n=e.expression,i=!(n instanceof mt||n instanceof rn||n instanceof gt||n instanceof vt||n instanceof ln);i&&t.print("("),e.expression.print(t),i&&t.print(")")})),qe.DEFMETHOD("_do_print",(function(e,t){e.print(t),this.label&&(e.space(),this.label.print(e)),e.semicolon()})),e($e,(function(e,t){e._do_print(t,"break")})),e(je,(function(e,t){e._do_print(t,"continue")})),e(Qe,(function(e,t){t.print("if"),t.space(),t.with_parens((function(){e.condition.print(t)})),t.space(),e.alternative?(!function(e,t){var n=e.body;if(t.option("braces")||t.option("ie8")&&n instanceof Ce)return _(n,t);if(!n)return t.force_semicolon();for(;;)if(n instanceof Qe){if(!n.alternative)return void _(e.body,t);n=n.alternative}else{if(!(n instanceof Ae))break;n=n.body}f(e.body,t)}(e,t),t.space(),t.print("else"),t.space(),e.alternative instanceof Qe?e.alternative.print(t):f(e.alternative,t)):e._do_print_body(t)})),e(et,(function(e,t){t.print("switch"),t.space(),t.with_parens((function(){e.expression.print(t)})),t.space();var n=e.body.length-1;n<0?i(e,t):t.with_block((function(){e.body.forEach((function(e,i){t.indent(!0),e.print(t),i<n&&e.body.length>0&&t.newline()}))}))})),tt.DEFMETHOD("_do_print_body",(function(e){e.newline(),this.body.forEach((function(t){e.indent(),t.print(e),e.newline()}))})),e(nt,(function(e,t){t.print("default:"),e._do_print_body(t)})),e(it,(function(e,t){t.print("case"),t.space(),e.expression.print(t),t.print(":"),e._do_print_body(t)})),e(rt,(function(e,t){t.print("try"),t.space(),r(e,t),e.bcatch&&(t.space(),e.bcatch.print(t)),e.bfinally&&(t.space(),e.bfinally.print(t))})),e(ot,(function(e,t){t.print("catch"),e.argname&&(t.space(),t.with_parens((function(){e.argname.print(t)}))),t.space(),r(e,t)})),e(at,(function(e,t){t.print("finally"),t.space(),r(e,t)})),st.DEFMETHOD("_do_print",(function(e,t){e.print(t),e.space(),this.definitions.forEach((function(t,n){n&&e.comma(),t.print(e)}));var n=e.parent();(!(n instanceof Fe||n instanceof Me)||n&&n.init!==this)&&e.semicolon()})),e(ct,(function(e,t){e._do_print(t,"let")})),e(ut,(function(e,t){e._do_print(t,"var")})),e(lt,(function(e,t){e._do_print(t,"const")})),e(_t,(function(e,t){t.print("import"),t.space(),e.imported_name&&e.imported_name.print(t),e.imported_name&&e.imported_names&&(t.print(","),t.space()),e.imported_names&&(1===e.imported_names.length&&"*"===e.imported_names[0].foreign_name.name?e.imported_names[0].print(t):(t.print("{"),e.imported_names.forEach((function(n,i){t.space(),n.print(t),i<e.imported_names.length-1&&t.print(",")})),t.space(),t.print("}"))),(e.imported_name||e.imported_names)&&(t.space(),t.print("from"),t.space()),e.module_name.print(t),t.semicolon()})),e(pt,(function(e,t){var n=t.parent()instanceof _t,i=e.name.definition();(i&&i.mangled_name||e.name.name)!==e.foreign_name.name?(n?t.print(e.foreign_name.name):e.name.print(t),t.space(),t.print("as"),t.space(),n?e.name.print(t):t.print(e.foreign_name.name)):e.name.print(t)})),e(dt,(function(e,t){if(t.print("export"),t.space(),e.is_default&&(t.print("default"),t.space()),e.exported_names)1===e.exported_names.length&&"*"===e.exported_names[0].name.name?e.exported_names[0].print(t):(t.print("{"),e.exported_names.forEach((function(n,i){t.space(),n.print(t),i<e.exported_names.length-1&&t.print(",")})),t.space(),t.print("}"));else if(e.exported_value)e.exported_value.print(t);else if(e.exported_definition&&(e.exported_definition.print(t),e.exported_definition instanceof st))return;e.module_name&&(t.space(),t.print("from"),t.space(),e.module_name.print(t)),(e.exported_value&&!(e.exported_value instanceof Be||e.exported_value instanceof Pe||e.exported_value instanceof It)||e.module_name||e.exported_names)&&t.semicolon()})),e(ft,(function(e,t){if(e.name.print(t),e.value){t.space(),t.print("="),t.space();var n=t.parent(1),i=n instanceof Fe||n instanceof Me;o(e.value,t,i)}})),e(mt,(function(e,t){e.expression.print(t),e instanceof ht&&0===e.args.length||((e.expression instanceof mt||e.expression instanceof Ie)&&t.add_mapping(e.start),t.with_parens((function(){e.args.forEach((function(e,n){n&&t.comma(),e.print(t)}))})))})),e(ht,(function(e,t){t.print("new"),t.space(),mt.prototype._codegen(e,t)})),Et.DEFMETHOD("_do_print",(function(e){this.expressions.forEach((function(t,n){n>0&&(e.comma(),e.should_break()&&(e.newline(),e.indent())),t.print(e)}))})),e(Et,(function(e,t){e._do_print(t)})),e(Dt,(function(e,t){var n=e.expression;n.print(t);var i=e.property;(O.has(i)?t.option("ie8"):!Z(i,t.option("ecma")>=2015))?(t.print("["),t.add_mapping(e.end),t.print_string(i),t.print("]")):(n instanceof pn&&n.getValue()>=0&&(/[xa-f.)]/i.test(t.last())||t.print(".")),t.print("."),t.add_mapping(e.end),t.print_name(i))})),e(St,(function(e,t){e.expression.print(t),t.print("["),e.property.print(t),t.print("]")})),e(At,(function(e,t){var n=e.operator;t.print(n),(/^[a-z]/i.test(n)||/[+-]$/.test(n)&&e.expression instanceof At&&/^[+-]/.test(e.expression.operator))&&t.space(),e.expression.print(t)})),e(Tt,(function(e,t){e.expression.print(t),t.print(e.operator)})),e(yt,(function(e,t){var n=e.operator;e.left.print(t),">"==n[0]&&e.left instanceof Tt&&"--"==e.left.operator?t.print(" "):t.space(),t.print(n),("<"==n||"<<"==n)&&e.right instanceof At&&"!"==e.right.operator&&e.right.expression instanceof At&&"--"==e.right.expression.operator?t.print(" "):t.space(),e.right.print(t)})),e(bt,(function(e,t){e.condition.print(t),t.space(),t.print("?"),t.space(),e.consequent.print(t),t.space(),t.colon(),e.alternative.print(t)})),e(Ft,(function(e,t){t.with_square((function(){var n=e.elements,i=n.length;i>0&&t.space(),n.forEach((function(e,n){n&&t.comma(),e.print(t),n===i-1&&e instanceof Dn&&t.comma()})),i>0&&t.space()}))})),e(Mt,(function(e,t){e.properties.length>0?t.with_block((function(){e.properties.forEach((function(e,n){n&&(t.print(","),t.newline()),t.indent(),e.print(t)})),t.newline()})):i(e,t)})),e(It,(function(e,t){if(t.print("class"),t.space(),e.name&&(e.name.print(t),t.space()),e.extends){var n=!(e.extends instanceof rn||e.extends instanceof gt||e.extends instanceof Vt||e.extends instanceof Pe);t.print("extends"),n?t.print("("):t.space(),e.extends.print(t),n?t.print(")"):t.space()}e.properties.length>0?t.with_block((function(){e.properties.forEach((function(e,n){n&&t.newline(),t.indent(),e.print(t)})),t.newline()})):t.print("{}")})),e(Kt,(function(e,t){t.print("new.target")})),e(wt,(function(e,t){function n(e){var t=e.definition();return t?t.mangled_name||t.name:e.name}var i=t.option("shorthand");i&&e.value instanceof Bt&&Z(e.key,t.option("ecma")>=2015)&&n(e.value)===e.key&&!O.has(e.key)?u(e.key,e.quote,t):i&&e.value instanceof Ot&&e.value.left instanceof Bt&&Z(e.key,t.option("ecma")>=2015)&&n(e.value.left)===e.key?(u(e.key,e.quote,t),t.space(),t.print("="),t.space(),e.value.right.print(t)):(e.key instanceof pe?t.with_square((function(){e.key.print(t)})):u(e.key,e.quote,t),t.colon(),e.value.print(t))})),e(Lt,(e,t)=>{e.static&&(t.print("static"),t.space()),e.key instanceof $t?u(e.key.name,e.quote,t):(t.print("["),e.key.print(t),t.print("]")),e.value&&(t.print("="),e.value.print(t)),t.semicolon()}),Rt.DEFMETHOD("_print_getter_setter",(function(e,t){var n=this;n.static&&(t.print("static"),t.space()),e&&(t.print(e),t.space()),n.key instanceof qt?u(n.key.name,n.quote,t):t.with_square((function(){n.key.print(t)})),n.value._do_print(t,!0)})),e(xt,(function(e,t){e._print_getter_setter("set",t)})),e(Nt,(function(e,t){e._print_getter_setter("get",t)})),e(kt,(function(e,t){var n;e.is_generator&&e.async?n="async*":e.is_generator?n="*":e.async&&(n="async"),e._print_getter_setter(n,t)})),Bt.DEFMETHOD("_do_print",(function(e){var t=this.definition();e.print_name(t?t.mangled_name||t.name:this.name)})),e(Bt,(function(e,t){e._do_print(t)})),e(Dn,a),e(un,(function(e,t){t.print("this")})),e(cn,(function(e,t){t.print("super")})),e(ln,(function(e,t){t.print(e.getValue())})),e(fn,(function(e,t){t.print_string(e.getValue(),e.quote,t.in_directive)})),e(pn,(function(e,t){(t.option("keep_numbers")||t.use_asm)&&e.start&&null!=e.start.raw?t.print(e.start.raw):t.print(p(e.getValue()))})),e(_n,(function(e,t){t.print(e.getValue()+"n")}));const c=/(<\s*\/\s*script)/i,l=(e,t)=>t.replace("/","\\/");function f(e,t){t.option("braces")?_(e,t):!e||e instanceof ve?t.force_semicolon():e.print(t)}function p(e){var t,n,i,r=e.toString(10).replace(/^0\./,".").replace("e+","e"),o=[r];return Math.floor(e)===e&&(e<0?o.push("-0x"+(-e).toString(16).toLowerCase()):o.push("0x"+e.toString(16).toLowerCase())),(t=/^\.0+/.exec(r))?(n=t[0].length,i=r.slice(n),o.push(i+"e-"+(i.length+n-1))):(t=/0+$/.exec(r))?(n=t[0].length,o.push(r.slice(0,-n)+"e"+n)):(t=/^(\d)\.(\d+)e(-?\d+)$/.exec(r))&&o.push(t[1]+t[2]+"e"+(t[3]-t[2].length)),function(e){for(var t=e[0],n=t.length,i=1;i<e.length;++i)e[i].length<n&&(n=(t=e[i]).length);return t}(o)}function _(e,t){!e||e instanceof ve?t.print("{}"):e instanceof Se?e.print(t):t.with_block((function(){t.indent(),e.print(t),t.newline()}))}function d(e,t){e.forEach((function(e){e.DEFMETHOD("add_source_map",t)}))}e(dn,(function(e,t){let{source:n,flags:i}=e.getValue();n=A(n),i=i?function(e){const t=new Set(e.split(""));let n="";for(const e of"gimuy")t.has(e)&&(n+=e,t.delete(e));return t.size&&t.forEach(e=>{n+=e}),n}(i):"",n=n.replace(c,l),t.print(t.to_utf8(`/${n}/${i}`));const r=t.parent();r instanceof yt&&/^\w/.test(r.operator)&&r.left===e&&t.print(" ")})),d([pe,Te,Ne],a),d([Ft,Se,ot,It,ln,de,st,me,at,Xe,Ie,ht,Mt,Ae,Bt,et,tt,Ge,He,rt],(function(e){e.add_mapping(this.start)})),d([Nt,xt],(function(e){e.add_mapping(this.start,this.key.name)})),d([Rt],(function(e){e.add_mapping(this.start,this.key)}))}();const Kn=(e,t)=>null===e&&null===t||e.TYPE===t.TYPE&&e.shallow_cmp(t),Un=e=>{const t=Object.keys(e).map(t=>{if("eq"===e[t])return`this.${t} === other.${t}`;if("exist"===e[t])return`(this.${t} == null ? other.${t} == null : this.${t} === other.${t})`;throw new Error(`mkshallow: Unexpected instruction: ${e[t]}`)}).join(" && ");return new Function("other","return "+t)},Gn=()=>!0;pe.prototype.shallow_cmp=function(){throw new Error("did not find a shallow_cmp function for "+this.constructor.name)},de.prototype.shallow_cmp=Gn,me.prototype.shallow_cmp=Un({value:"eq"}),he.prototype.shallow_cmp=Gn,De.prototype.shallow_cmp=Gn,ve.prototype.shallow_cmp=Gn,Te.prototype.shallow_cmp=Un({"label.name":"eq"}),Ce.prototype.shallow_cmp=Gn,Oe.prototype.shallow_cmp=Gn,Fe.prototype.shallow_cmp=Un({init:"exist",condition:"exist",step:"exist"}),Me.prototype.shallow_cmp=Gn,Re.prototype.shallow_cmp=Gn,we.prototype.shallow_cmp=Gn,Ne.prototype.shallow_cmp=Gn,ke.prototype.shallow_cmp=Gn,Ie.prototype.shallow_cmp=Un({is_generator:"eq",async:"eq"}),Ke.prototype.shallow_cmp=Un({is_array:"eq"}),Ue.prototype.shallow_cmp=Gn,Ge.prototype.shallow_cmp=Gn,He.prototype.shallow_cmp=Un({value:"eq"}),Xe.prototype.shallow_cmp=Gn,qe.prototype.shallow_cmp=Gn,Ze.prototype.shallow_cmp=Gn,Je.prototype.shallow_cmp=Un({is_star:"eq"}),Qe.prototype.shallow_cmp=Un({alternative:"exist"}),et.prototype.shallow_cmp=Gn,tt.prototype.shallow_cmp=Gn,rt.prototype.shallow_cmp=Un({bcatch:"exist",bfinally:"exist"}),ot.prototype.shallow_cmp=Un({argname:"exist"}),at.prototype.shallow_cmp=Gn,st.prototype.shallow_cmp=Gn,ft.prototype.shallow_cmp=Un({value:"exist"}),pt.prototype.shallow_cmp=Gn,_t.prototype.shallow_cmp=Un({imported_name:"exist",imported_names:"exist"}),dt.prototype.shallow_cmp=Un({exported_definition:"exist",exported_value:"exist",exported_names:"exist",module_name:"eq",is_default:"eq"}),mt.prototype.shallow_cmp=Gn,Et.prototype.shallow_cmp=Gn,gt.prototype.shallow_cmp=Gn,Dt.prototype.shallow_cmp=Un({property:"eq"}),vt.prototype.shallow_cmp=Un({operator:"eq"}),yt.prototype.shallow_cmp=Un({operator:"eq"}),bt.prototype.shallow_cmp=Gn,Ft.prototype.shallow_cmp=Gn,Mt.prototype.shallow_cmp=Gn,Rt.prototype.shallow_cmp=Gn,wt.prototype.shallow_cmp=Un({key:"eq"}),xt.prototype.shallow_cmp=Un({static:"eq"}),Nt.prototype.shallow_cmp=Un({static:"eq"}),kt.prototype.shallow_cmp=Un({static:"eq",is_generator:"eq",async:"eq"}),It.prototype.shallow_cmp=Un({name:"exist",extends:"exist"}),Lt.prototype.shallow_cmp=Un({static:"eq"}),Bt.prototype.shallow_cmp=Un({name:"eq"}),Kt.prototype.shallow_cmp=Gn,un.prototype.shallow_cmp=Gn,cn.prototype.shallow_cmp=Gn,fn.prototype.shallow_cmp=Un({value:"eq"}),pn.prototype.shallow_cmp=Un({value:"eq"}),_n.prototype.shallow_cmp=Un({value:"eq"}),dn.prototype.shallow_cmp=function(e){return this.value.flags===e.value.flags&&this.value.source===e.value.source},mn.prototype.shallow_cmp=Gn;let Hn=null,Xn=null;class zn{constructor(e,t,n){this.name=t.name,this.orig=[t],this.init=n,this.eliminated=0,this.assignments=0,this.scope=e,this.replaced=0,this.global=!1,this.export=0,this.mangled_name=null,this.undeclared=!1,this.id=zn.next_id++,this.chained=!1,this.direct_access=!1,this.escaped=0,this.recursive_refs=0,this.references=[],this.should_replace=void 0,this.single_use=!1,this.fixed=!1,Object.seal(this)}fixed_value(){return!this.fixed||this.fixed instanceof pe?this.fixed:this.fixed()}unmangleable(e){return e||(e={}),!!(Hn&&Hn.has(this.id)&&S(e.keep_fnames,this.orig[0].name))||(this.global&&!e.toplevel||1&this.export||this.undeclared||!e.eval&&this.scope.pinned()||(this.orig[0]instanceof jt||this.orig[0]instanceof Yt)&&S(e.keep_fnames,this.orig[0].name)||this.orig[0]instanceof qt||(this.orig[0]instanceof Jt||this.orig[0]instanceof Zt)&&S(e.keep_classnames,this.orig[0].name))}mangle(e){const t=e.cache&&e.cache.props;if(this.global&&t&&t.has(this.name))this.mangled_name=t.get(this.name);else if(!this.mangled_name&&!this.unmangleable(e)){var n=this.scope,i=this.orig[0];e.ie8&&i instanceof jt&&(n=n.parent_scope);const r=Wn(this);this.mangled_name=r?r.mangled_name||r.name:n.next_mangled(e,this),this.global&&t&&t.set(this.name,this.mangled_name)}}}function Wn(e){if(e.orig[0]instanceof Qt&&e.scope.is_block_scope())return e.scope.get_defun_scope().variables.get(e.name)}function Yn(e,t){var n=e.enclosed;e:for(;;){var i=qn(++e.cname);if(!O.has(i)&&!(t.reserved.has(i)||Xn&&Xn.has(i))){for(let e=n.length;--e>=0;){const r=n[e];if(i==(r.mangled_name||r.unmangleable(t)&&r.name))continue e}return i}}}zn.next_id=1,xe.DEFMETHOD("figure_out_scope",(function(e,{parent_scope:t=null,toplevel:n=this}={}){if(e=o(e,{cache:null,ie8:!1,safari10:!1}),!(n instanceof Ne))throw new Error("Invalid toplevel scope");var i=this.parent_scope=t,r=new Map,a=null,s=null,u=[],c=new On((t,n)=>{if(t.is_block_scope()){const r=i;t.block_scope=i=new xe(t),i._block_scope=!0;const o=t instanceof ot?r.parent_scope:r;if(i.init_scope_vars(o),i.uses_with=r.uses_with,i.uses_eval=r.uses_eval,e.safari10&&(t instanceof Fe||t instanceof Me)&&u.push(i),t instanceof et){const e=i;i=r,t.expression.walk(c),i=e;for(let e=0;e<t.body.length;e++)t.body[e].walk(c)}else n();return i=r,!0}if(t instanceof Ke){const e=s;return s=t,n(),s=e,!0}if(t instanceof xe){t.init_scope_vars(i);var o=i,f=a,p=r;return a=i=t,r=new Map,n(),i=o,a=f,r=p,!0}if(t instanceof Te){var _=t.label;if(r.has(_.name))throw new Error(d("Label {name} defined twice",_));return r.set(_.name,_),n(),r.delete(_.name),!0}if(t instanceof we)for(var m=i;m;m=m.parent_scope)m.uses_with=!0;else{if(t instanceof Bt&&(t.scope=i),t instanceof nn&&(t.thedef=t,t.references=[]),t instanceof jt)a.def_function(t,"arguments"==t.name?void 0:a);else if(t instanceof Yt)l((t.scope=a.parent_scope.get_defun_scope()).def_function(t,a),1);else if(t instanceof Jt)l(a.def_variable(t,a),1);else if(t instanceof en)i.def_variable(t);else if(t instanceof Zt)l((t.scope=a.parent_scope).def_function(t,a),1);else if(t instanceof Gt||t instanceof zt||t instanceof Xt||t instanceof Qt){if((h=t instanceof Ht?i.def_variable(t,null):a.def_variable(t,"SymbolVar"==t.TYPE?null:void 0)).orig.every(e=>e===t||(t instanceof Ht?e instanceof jt:!(e instanceof zt||e instanceof Xt)))||ee(`"${t.name}" is redeclared`,t.start.file,t.start.line,t.start.col,t.start.pos),t instanceof Wt||l(h,2),a!==i){t.mark_enclosed();var h=i.find_variable(t);t.thedef!==h&&(t.thedef=h,t.reference())}}else if(t instanceof sn){var E=r.get(t.name);if(!E)throw new Error(d("Undefined label {name} [{line},{col}]",{name:t.name,line:t.start.line,col:t.start.col}));t.thedef=E}i instanceof Ne||!(t instanceof dt||t instanceof _t)||ee(`"${t.TYPE}" statement may only appear at the top level`,t.start.file,t.start.line,t.start.col,t.start.pos)}});function l(e,t){if(s){var n=0;do{t++}while(c.parent(n++)!==s)}var i=c.parent(t);if(e.export=i instanceof dt?1:0){var r=i.exported_definition;(r instanceof Be||r instanceof Pt)&&i.is_default&&(e.export=2)}}this.walk(c),this instanceof Ne&&(this.globals=new Map);c=new On(e=>{if(e instanceof qe&&e.label)return e.label.thedef.references.push(e),!0;if(e instanceof rn){var t,i=e.name;if("eval"==i&&c.parent()instanceof mt)for(var r=e.scope;r&&!r.uses_eval;r=r.parent_scope)r.uses_eval=!0;return c.parent()instanceof pt&&c.parent(1).module_name||!(t=e.scope.find_variable(i))?(t=n.def_global(e),e instanceof on&&(t.export=1)):t.scope instanceof Ie&&"arguments"==i&&(t.scope.uses_arguments=!0),e.thedef=t,e.reference(),!e.scope.is_block_scope()||t.orig[0]instanceof Ht||(e.scope=e.scope.get_defun_scope()),!0}var o;if(e instanceof Qt&&(o=Wn(e.definition())))for(r=e.scope;r&&(_(r.enclosed,o),r!==o.scope);)r=r.parent_scope});if(this.walk(c),(e.ie8||e.safari10)&&yn(this,e=>{if(e instanceof Qt){var t=e.name,i=e.thedef.references,r=e.scope.get_defun_scope(),o=r.find_variable(t)||n.globals.get(t)||r.def_variable(e);return i.forEach((function(e){e.thedef=o,e.reference()})),e.thedef=o,e.reference(),!0}}),e.safari10)for(const e of u)e.parent_scope.variables.forEach((function(t){_(e.enclosed,t)}))})),Ne.DEFMETHOD("def_global",(function(e){var t=this.globals,n=e.name;if(t.has(n))return t.get(n);var i=new zn(this,e);return i.undeclared=!0,i.global=!0,t.set(n,i),i})),xe.DEFMETHOD("init_scope_vars",(function(e){this.variables=new Map,this.functions=new Map,this.uses_with=!1,this.uses_eval=!1,this.parent_scope=e,this.enclosed=[],this.cname=-1,this._var_name_cache=null})),xe.DEFMETHOD("var_names",(function e(){var t=this._var_name_cache;return t||(this._var_name_cache=t=new Set(this.parent_scope?e.call(this.parent_scope):null),this._added_var_names&&this._added_var_names.forEach(e=>{t.add(e)}),this.enclosed.forEach((function(e){t.add(e.name)})),this.variables.forEach((function(e,n){t.add(n)}))),t})),xe.DEFMETHOD("add_var_name",(function(e){this._added_var_names||(this._added_var_names=new Set),this._added_var_names.add(e),this._var_name_cache||this.var_names(),this._var_name_cache.add(e)})),xe.DEFMETHOD("add_child_scope",(function(e){if(e.parent_scope===this)return;e.parent_scope=this,e._var_name_cache=null,e._added_var_names&&e._added_var_names.forEach(t=>e.add_var_name(t));const t=new Set(e.enclosed),n=(()=>{const e=[];let t=this;do{e.push(t)}while(t=t.parent_scope);return e.reverse(),e})(),i=[];for(const e of n){i.forEach(t=>_(e.enclosed,t));for(const n of e.variables.values())t.has(n)&&(_(i,n),_(e.enclosed,n))}})),pe.DEFMETHOD("is_block_scope",s),It.DEFMETHOD("is_block_scope",s),Ie.DEFMETHOD("is_block_scope",s),Ne.DEFMETHOD("is_block_scope",s),tt.DEFMETHOD("is_block_scope",s),De.DEFMETHOD("is_block_scope",u),xe.DEFMETHOD("is_block_scope",(function(){return this._block_scope||!1})),ye.DEFMETHOD("is_block_scope",u),Ie.DEFMETHOD("init_scope_vars",(function(){xe.prototype.init_scope_vars.apply(this,arguments),this.uses_arguments=!1,this.def_variable(new Wt({name:"arguments",start:this.start,end:this.end}))})),Ve.DEFMETHOD("init_scope_vars",(function(){xe.prototype.init_scope_vars.apply(this,arguments),this.uses_arguments=!1})),Bt.DEFMETHOD("mark_enclosed",(function(){for(var e=this.definition(),t=this.scope;t&&(_(t.enclosed,e),t!==e.scope);)t=t.parent_scope})),Bt.DEFMETHOD("reference",(function(){this.definition().references.push(this),this.mark_enclosed()})),xe.DEFMETHOD("find_variable",(function(e){return e instanceof Bt&&(e=e.name),this.variables.get(e)||this.parent_scope&&this.parent_scope.find_variable(e)})),xe.DEFMETHOD("def_function",(function(e,t){var n=this.def_variable(e,t);return(!n.init||n.init instanceof Be)&&(n.init=t),this.functions.set(e.name,n),n})),xe.DEFMETHOD("def_variable",(function(e,t){var n=this.variables.get(e.name);return n?(n.orig.push(e),n.init&&(n.scope!==e.scope||n.init instanceof Pe)&&(n.init=t)):(n=new zn(this,e,t),this.variables.set(e.name,n),n.global=!this.parent_scope),e.thedef=n})),xe.DEFMETHOD("next_mangled",(function(e){return Yn(this,e)})),Ne.DEFMETHOD("next_mangled",(function(e){let t;const n=this.mangled_names;do{t=Yn(this,e)}while(n.has(t));return t})),Pe.DEFMETHOD("next_mangled",(function(e,t){for(var n=t.orig[0]instanceof Wt&&this.name&&this.name.definition(),i=n?n.mangled_name||n.name:null;;){var r=Yn(this,e);if(!i||i!=r)return r}})),Bt.DEFMETHOD("unmangleable",(function(e){var t=this.definition();return!t||t.unmangleable(e)})),nn.DEFMETHOD("unmangleable",s),Bt.DEFMETHOD("unreferenced",(function(){return!this.definition().references.length&&!this.scope.pinned()})),Bt.DEFMETHOD("definition",(function(){return this.thedef})),Bt.DEFMETHOD("global",(function(){return this.thedef.global})),Ne.DEFMETHOD("_default_mangler_options",(function(e){return(e=o(e,{eval:!1,ie8:!1,keep_classnames:!1,keep_fnames:!1,module:!1,reserved:[],toplevel:!1})).module&&(e.toplevel=!0),Array.isArray(e.reserved)||e.reserved instanceof Set||(e.reserved=[]),e.reserved=new Set(e.reserved),e.reserved.add("arguments"),e})),Ne.DEFMETHOD("mangle_names",(function(e){e=this._default_mangler_options(e);var t=-1,n=[];e.keep_fnames&&(Hn=new Set);const i=this.mangled_names=new Set;e.cache&&(this.globals.forEach(o),e.cache.props&&e.cache.props.forEach((function(e){i.add(e)})));var r=new On((function(i,r){if(i instanceof Te){var a=t;return r(),t=a,!0}if(i instanceof xe)i.variables.forEach(o);else if(i.is_block_scope())i.block_scope.variables.forEach(o);else if(Hn&&i instanceof ft&&i.value instanceof Ie&&!i.value.name&&S(e.keep_fnames,i.name.name))Hn.add(i.name.definition().id);else{if(i instanceof nn){let e;do{e=qn(++t)}while(O.has(e));return i.mangled_name=e,!0}!e.ie8&&!e.safari10&&i instanceof Qt&&n.push(i.definition())}}));function o(t){!(e.reserved.has(t.name)||1&t.export)&&n.push(t)}this.walk(r),(e.keep_fnames||e.keep_classnames)&&(Xn=new Set,n.forEach(t=>{t.name.length<6&&t.unmangleable(e)&&Xn.add(t.name)})),n.forEach(t=>{t.mangle(e)}),Hn=null,Xn=null})),Ne.DEFMETHOD("find_colliding_names",(function(e){const t=e.cache&&e.cache.props,n=new Set;return e.reserved.forEach(i),this.globals.forEach(r),this.walk(new On((function(e){e instanceof xe&&e.variables.forEach(r),e instanceof Qt&&r(e.definition())}))),n;function i(e){n.add(e)}function r(n){var r=n.name;if(n.global&&t&&t.has(r))r=t.get(r);else if(!n.unmangleable(e))return;i(r)}})),Ne.DEFMETHOD("expand_names",(function(e){qn.reset(),qn.sort(),e=this._default_mangler_options(e);var t=this.find_colliding_names(e),n=0;function i(i){if(i.global&&e.cache)return;if(i.unmangleable(e))return;if(e.reserved.has(i.name))return;const r=Wn(i),o=i.name=r?r.name:function(){var e;do{e=qn(n++)}while(t.has(e)||O.has(e));return e}();i.orig.forEach((function(e){e.name=o})),i.references.forEach((function(e){e.name=o}))}this.globals.forEach(i),this.walk(new On((function(e){e instanceof xe&&e.variables.forEach(i),e instanceof Qt&&i(e.definition())})))})),pe.DEFMETHOD("tail_node",c),Et.DEFMETHOD("tail_node",(function(){return this.expressions[this.expressions.length-1]})),Ne.DEFMETHOD("compute_char_frequency",(function(e){e=this._default_mangler_options(e);try{pe.prototype.print=function(t,n){this._print(t,n),this instanceof Bt&&!this.unmangleable(e)?qn.consider(this.name,-1):e.properties&&(this instanceof Dt?qn.consider(this.property,-1):this instanceof St&&function e(t){t instanceof fn?qn.consider(t.value,-1):t instanceof bt?(e(t.consequent),e(t.alternative)):t instanceof Et&&e(t.tail_node())}(this.property))},qn.consider(this.print_to_string(),1)}finally{pe.prototype.print=pe.prototype._print}qn.sort()}));const qn=(()=>{const e="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_".split(""),t="0123456789".split("");let n,i;function r(){i=new Map,e.forEach((function(e){i.set(e,0)})),t.forEach((function(e){i.set(e,0)}))}function o(e,t){return i.get(t)-i.get(e)}function a(e){var t="",i=54;e++;do{e--,t+=n[e%i],e=Math.floor(e/i),i=64}while(e>0);return t}return a.consider=function(e,t){for(var n=e.length;--n>=0;)i.set(e[n],i.get(e[n])+t)},a.sort=function(){n=h(e,o).concat(h(t,o))},a.reset=r,r(),a})();function $n(){const e={};return Object.keys(jn({0:0})).forEach(t=>{const n=jn({[t]:{0:0}});n&&(e[t]=n)}),e}function jn(e){var t=gr("",e);return t.error&&t.error.defs}let Zn=void 0;pe.prototype.size=function(e,t){Zn=$n.mangle;let n=0;return bn(this,(e,t)=>{n+=e._size(t)},t||e&&e.stack),Zn=void 0,n},pe.prototype._size=()=>0,de.prototype._size=()=>8,me.prototype._size=function(){return 2+this.value.length};const Jn=e=>e.length&&e.length-1;De.prototype._size=function(){return 2+Jn(this.body)},Ne.prototype._size=function(){return Jn(this.body)},ve.prototype._size=()=>1,Te.prototype._size=()=>2,Ce.prototype._size=()=>9,Oe.prototype._size=()=>7,Fe.prototype._size=()=>8,Me.prototype._size=()=>8,we.prototype._size=()=>6,ke.prototype._size=()=>3;const Qn=e=>(e.is_generator?1:0)+(e.async?6:0);Le.prototype._size=function(){return Qn(this)+4+Jn(this.argnames)+Jn(this.body)},Pe.prototype._size=function(e){return 2*!!In(e)+Qn(this)+12+Jn(this.argnames)+Jn(this.body)},Be.prototype._size=function(){return Qn(this)+13+Jn(this.argnames)+Jn(this.body)},Ve.prototype._size=function(){let e=2+Jn(this.argnames);return 1===this.argnames.length&&this.argnames[0]instanceof Bt||(e+=2),Qn(this)+e+(Array.isArray(this.body)?Jn(this.body):this.body._size())},Ke.prototype._size=()=>2,Ge.prototype._size=function(){return 2+3*Math.floor(this.segments.length/2)},He.prototype._size=function(){return this.value.length},We.prototype._size=function(){return this.value?7:6},Ye.prototype._size=()=>6,$e.prototype._size=function(){return this.label?6:5},je.prototype._size=function(){return this.label?9:8},Qe.prototype._size=()=>4,et.prototype._size=function(){return 8+Jn(this.body)},it.prototype._size=function(){return 5+Jn(this.body)},nt.prototype._size=function(){return 8+Jn(this.body)},rt.prototype._size=function(){return 3+Jn(this.body)},ot.prototype._size=function(){let e=7+Jn(this.body);return this.argname&&(e+=2),e},at.prototype._size=function(){return 7+Jn(this.body)};const ei=(e,t)=>e+Jn(t.definitions);ut.prototype._size=function(){return ei(4,this)},ct.prototype._size=function(){return ei(4,this)},lt.prototype._size=function(){return ei(6,this)},ft.prototype._size=function(){return this.value?1:0},pt.prototype._size=function(){return this.name?4:0},_t.prototype._size=function(){let e=6;return this.imported_name&&(e+=1),(this.imported_name||this.imported_names)&&(e+=5),this.imported_names&&(e+=2+Jn(this.imported_names)),e},dt.prototype._size=function(){let e=7+(this.is_default?8:0);return this.exported_value&&(e+=this.exported_value._size()),this.exported_names&&(e+=2+Jn(this.exported_names)),this.module_name&&(e+=5),e},mt.prototype._size=function(){return 2+Jn(this.args)},ht.prototype._size=function(){return 6+Jn(this.args)},Et.prototype._size=function(){return Jn(this.expressions)},Dt.prototype._size=function(){return this.property.length+1},St.prototype._size=()=>2,vt.prototype._size=function(){return"typeof"===this.operator?7:"void"===this.operator?5:this.operator.length},yt.prototype._size=function(e){if("in"===this.operator)return 4;let t=this.operator.length;return("+"===this.operator||"-"===this.operator)&&this.right instanceof vt&&this.right.operator===this.operator&&(t+=1),this.needs_parens(e)&&(t+=2),t},bt.prototype._size=()=>3,Ft.prototype._size=function(){return 2+Jn(this.elements)},Mt.prototype._size=function(e){let t=2;return In(e)&&(t+=2),t+Jn(this.properties)};const ti=e=>"string"==typeof e?e.length:0;wt.prototype._size=function(){return ti(this.key)+1};const ni=e=>e?7:0;Nt.prototype._size=function(){return 5+ni(this.static)+ti(this.key)},xt.prototype._size=function(){return 5+ni(this.static)+ti(this.key)},kt.prototype._size=function(){return ni(this.static)+ti(this.key)+Qn(this)},It.prototype._size=function(){return(this.name?8:7)+(this.extends?8:0)},Lt.prototype._size=function(){return ni(this.static)+("string"==typeof this.key?this.key.length+2:0)+(this.value?1:0)},Bt.prototype._size=function(){return!Zn||this.definition().unmangleable(Zn)?this.name.length:2},$t.prototype._size=function(){return this.name.length},rn.prototype._size=function(){const{name:e,thedef:t}=this;return t&&t.global?e.length:"arguments"===e?9:2},Kt.prototype._size=()=>10,tn.prototype._size=function(){return this.name.length},an.prototype._size=function(){return this.name.length},un.prototype._size=()=>4,cn.prototype._size=()=>5,fn.prototype._size=function(){return this.value.length+2},pn.prototype._size=function(){const{value:e}=this;return 0===e?1:e>0&&Math.floor(e)===e?Math.floor(Math.log10(e)+1):e.toString().length},_n.prototype._size=function(){return this.value.length},dn.prototype._size=function(){return this.value.toString().length},hn.prototype._size=()=>4,En.prototype._size=()=>3,gn.prototype._size=()=>6,Dn.prototype._size=()=>0,Sn.prototype._size=()=>8,Tn.prototype._size=()=>4,An.prototype._size=()=>5,Ze.prototype._size=()=>6,Je.prototype._size=()=>6;const ii=(e,t)=>e.flags&t,ri=(e,t)=>{e.flags|=t},oi=(e,t)=>{e.flags&=~t};class ai extends On{constructor(e,t){super(),void 0===e.defaults||e.defaults||(t=!0),this.options=o(e,{arguments:!1,arrows:!t,booleans:!t,booleans_as_integers:!1,collapse_vars:!t,comparisons:!t,computed_props:!t,conditionals:!t,dead_code:!t,defaults:!0,directives:!t,drop_console:!1,drop_debugger:!t,ecma:5,evaluate:!t,expression:!1,global_defs:!1,hoist_funs:!1,hoist_props:!t,hoist_vars:!1,ie8:!1,if_return:!t,inline:!t,join_vars:!t,keep_classnames:!1,keep_fargs:!0,keep_fnames:!1,keep_infinity:!1,loops:!t,module:!1,negate_iife:!t,passes:1,properties:!t,pure_getters:!t&&"strict",pure_funcs:null,reduce_funcs:null,reduce_vars:!t,sequences:!t,side_effects:!t,switches:!t,top_retain:null,toplevel:!(!e||!e.top_retain),typeofs:!t,unsafe:!1,unsafe_arrows:!1,unsafe_comps:!1,unsafe_Function:!1,unsafe_math:!1,unsafe_symbols:!1,unsafe_methods:!1,unsafe_proto:!1,unsafe_regexp:!1,unsafe_undefined:!1,unused:!t,warnings:!1},!0);var n=this.options.global_defs;if("object"==typeof n)for(var i in n)"@"===i[0]&&D(n,i)&&(n[i.slice(1)]=ce(n[i],{expression:!0}));!0===this.options.inline&&(this.options.inline=3);var r=this.options.pure_funcs;this.pure_funcs="function"==typeof r?r:r?function(e){return!r.includes(e.expression.print_to_string())}:u;var a=this.options.top_retain;a instanceof RegExp?this.top_retain=function(e){return a.test(e.name)}:"function"==typeof a?this.top_retain=a:a&&("string"==typeof a&&(a=a.split(/,/)),this.top_retain=function(e){return a.includes(e.name)}),this.options.module&&(this.directives["use strict"]=!0,this.options.toplevel=!0);var s=this.options.toplevel;this.toplevel="string"==typeof s?{funcs:/funcs/.test(s),vars:/vars/.test(s)}:{funcs:s,vars:s};var c=this.options.sequences;this.sequences_limit=1==c?800:0|c,this.warnings_produced={},this.evaluated_regexps=new Map}option(e){return this.options[e]}exposed(e){if(e.export)return!0;if(e.global)for(var t=0,n=e.orig.length;t<n;t++)if(!this.toplevel[e.orig[t]instanceof Yt?"funcs":"vars"])return!0;return!1}in_boolean_context(){if(!this.option("booleans"))return!1;for(var e,t=this.self(),n=0;e=this.parent(n);n++){if(e instanceof he||e instanceof bt&&e.condition===t||e instanceof be&&e.condition===t||e instanceof Fe&&e.condition===t||e instanceof Qe&&e.condition===t||e instanceof At&&"!"==e.operator&&e.expression===t)return!0;if(!(e instanceof yt&&("&&"==e.operator||"||"==e.operator||"??"==e.operator)||e instanceof bt||e.tail_node()===t))return!1;t=e}}compress(e){e=e.resolve_defines(this),this.option("expression")&&e.process_expression(!0);for(var t=+this.options.passes||1,n=1/0,i=!1,r={ie8:this.option("ie8")},o=0;o<t;o++)if(e.figure_out_scope(r),0===o&&this.option("drop_console")&&(e=e.drop_console()),(o>0||this.option("reduce_vars"))&&e.reset_opt_flags(this),e=e.transform(this),t>1){let t=0;if(yn(e,()=>{t++}),this.info("pass "+o+": last_count: "+n+", count: "+t),t<n)n=t,i=!1;else{if(i)break;i=!0}}return this.option("expression")&&e.process_expression(!1),e}info(...e){"verbose"==this.options.warnings&&pe.warn(...e)}warn(e,t){if(this.options.warnings){var n=d(e,t);n in this.warnings_produced||(this.warnings_produced[n]=!0,pe.warn.apply(pe,arguments))}}clear_warnings(){this.warnings_produced={}}before(e,t){if(ii(e,256))return e;var n=!1;e instanceof xe&&(e=(e=e.hoist_properties(this)).hoist_declarations(this),n=!0),t(e,this),t(e,this);var i=e.optimize(this);return n&&i instanceof xe&&(i.drop_unused(this),t(i,this)),i===e&&ri(i,256),i}}function si(e,t){e.DEFMETHOD("optimize",(function(e){if(ii(this,512))return this;if(e.has_directive("use asm"))return this;var n=t(this,e);return ri(n,512),n}))}function ui(e,t){if(!((t=wi(t))instanceof pe)){var n;if(e instanceof Ft){var i=e.elements;if("length"==t)return hi(i.length,e);"number"==typeof t&&t in i&&(n=i[t])}else if(e instanceof Mt){t=""+t;for(var r=e.properties,o=r.length;--o>=0;){if(!(r[o]instanceof wt))return;n||r[o].key!==t||(n=r[o].value)}}return n instanceof rn&&n.fixed_value()||n}}function ci(e,t,n,i,r,o){var a=t.parent(r),s=Ii(n,a);if(s)return s;if(!o&&a instanceof mt&&a.expression===n&&!(i instanceof Ve)&&!(i instanceof It)&&!a.is_expr_pure(e)&&(!(i instanceof Pe)||!(a instanceof ht)&&i.contains_this()))return!0;if(a instanceof Ft)return ci(e,t,a,a,r+1);if(a instanceof wt&&n===a.value){var u=t.parent(r+1);return ci(e,t,u,u,r+2)}if(a instanceof gt&&a.expression===n){var c=ui(i,a.property);return!o&&ci(e,t,a,c,r+1)}}function li(e){return e instanceof Ve||e instanceof Pe}function fi(e){if(e instanceof un)return!0;if(e instanceof rn)return e.definition().orig[0]instanceof jt;if(e instanceof gt){if((e=e.expression)instanceof rn){if(e.is_immutable())return!1;e=e.fixed_value()}return!e||!(e instanceof dn)&&(e instanceof ln||fi(e))}return!1}function pi(e,t){if(!(e instanceof rn))return!1;for(var n=e.definition().orig,i=n.length;--i>=0;)if(n[i]instanceof t)return!0}function _i(e){for(let t=0;;t++){const n=e.parent(t);if(n instanceof Ne)return n;if(n instanceof Ie)return n;if(n.block_scope)return n.block_scope}}function di(e,t){for(var n,i=0;(n=e.parent(i++))&&!(n instanceof xe);)if(n instanceof ot&&n.argname){n=n.argname.definition().scope;break}return n.find_variable(t)}function mi(e,t){if(1==t.length)return t[0];if(0==t.length)throw new Error("trying to create a sequence with length zero!");return p(Et,e,{expressions:t.reduce(gi,[])})}function hi(e,t){switch(typeof e){case"string":return p(fn,t,{value:e});case"number":return isNaN(e)?p(En,t):isFinite(e)?1/e<0?p(At,t,{operator:"-",expression:p(pn,t,{value:-e})}):p(pn,t,{value:e}):e<0?p(At,t,{operator:"-",expression:p(Sn,t)}):p(Sn,t);case"boolean":return p(e?Tn:An,t);case"undefined":return p(gn,t);default:if(null===e)return p(hn,t,{value:null});if(e instanceof RegExp)return p(dn,t,{value:{source:A(e.source),flags:e.flags}});throw new Error(d("Can't handle constant of type: {type}",{type:typeof e}))}}function Ei(e,t,n){return e instanceof At&&"delete"==e.operator||e instanceof mt&&e.expression===t&&(n instanceof gt||n instanceof rn&&"eval"==n.name)?mi(t,[p(pn,t,{value:0}),n]):n}function gi(e,t){return t instanceof Et?e.push(...t.expressions):e.push(t),e}function Di(e){if(null===e)return[];if(e instanceof Se)return e.body;if(e instanceof ve)return[];if(e instanceof _e)return[e];throw new Error("Can't convert thing to statement array")}function Si(e){return null===e||(e instanceof ve||e instanceof Se&&0==e.body.length)}function vi(e){return!(e instanceof Pt||e instanceof Be||e instanceof ct||e instanceof lt||e instanceof dt||e instanceof _t)}function Ai(e){return e instanceof ye&&e.body instanceof Se?e.body:e}function Ti(e){return"Call"==e.TYPE&&(e.expression instanceof Pe||Ti(e.expression))}function yi(e){return e instanceof rn&&e.definition().undeclared}si(pe,(function(e){return e})),Ne.DEFMETHOD("drop_console",(function(){return this.transform(new Fn((function(e){if("Call"==e.TYPE){var t=e.expression;if(t instanceof gt){for(var n=t.expression;n.expression;)n=n.expression;if(yi(n)&&"console"==n.name)return p(gn,e)}}})))})),pe.DEFMETHOD("equivalent_to",(function(e){return((e,t)=>{if(!Kn(e,t))return!1;const n=[e],i=[t],r=n.push.bind(n),o=i.push.bind(i);for(;n.length&&i.length;){const e=n.pop(),t=i.pop();if(!Kn(e,t))return!1;if(e._children_backwards(r),t._children_backwards(o),n.length!==i.length)return!1}return 0==n.length&&0==i.length})(this,e)})),xe.DEFMETHOD("process_expression",(function(e,t){var n=this,i=new Fn((function(r){if(e&&r instanceof he)return p(We,r,{value:r.body});if(!e&&r instanceof We){if(t){var o=r.value&&r.value.drop_side_effect_free(t,!0);return o?p(he,r,{body:o}):p(ve,r)}return p(he,r,{body:r.value||p(At,r,{operator:"void",expression:p(pn,r,{value:0})})})}if(r instanceof It||r instanceof Ie&&r!==n)return r;if(r instanceof De){var a=r.body.length-1;a>=0&&(r.body[a]=r.body[a].transform(i))}else r instanceof Qe?(r.body=r.body.transform(i),r.alternative&&(r.alternative=r.alternative.transform(i))):r instanceof we&&(r.body=r.body.transform(i));return r}));n.transform(i)})),function(e){function t(e,t){t.assignments=0,t.chained=!1,t.direct_access=!1,t.escaped=0,t.recursive_refs=0,t.references=[],t.should_replace=void 0,t.single_use=void 0,t.scope.pinned()?t.fixed=!1:t.orig[0]instanceof Xt||!e.exposed(t)?t.fixed=t.init:t.fixed=!1}function n(e,n,i){i.variables.forEach((function(i){t(n,i),null===i.fixed?(e.defs_to_safe_ids.set(i.id,e.safe_ids),s(e,i,!0)):i.fixed&&(e.loop_ids.set(i.id,e.in_loop),s(e,i,!0))}))}function i(e,n){n.block_scope&&n.block_scope.variables.forEach(n=>{t(e,n)})}function r(e){e.safe_ids=Object.create(e.safe_ids)}function o(e){e.safe_ids=Object.getPrototypeOf(e.safe_ids)}function s(e,t,n){e.safe_ids[t.id]=n}function u(e,t){if("m"==t.single_use)return!1;if(e.safe_ids[t.id]){if(null==t.fixed){var n=t.orig[0];if(n instanceof Wt||"arguments"==n.name)return!1;t.fixed=p(gn,n)}return!0}return t.fixed instanceof Be}function c(e,t,n,i){if(void 0===t.fixed)return!0;let r;return null===t.fixed&&(r=e.defs_to_safe_ids.get(t.id))?(r[t.id]=!1,e.defs_to_safe_ids.delete(t.id),!0):!!D(e.safe_ids,t.id)&&(!!u(e,t)&&(!1!==t.fixed&&(!(null!=t.fixed&&(!i||t.references.length>t.assignments))&&(t.fixed instanceof Be?i instanceof pe&&t.fixed.parent_scope===n:t.orig.every(e=>!(e instanceof Xt||e instanceof Yt||e instanceof jt))))))}function l(e,t,n,i,r,o,a){var s=e.parent(o);if(r){if(r.is_constant())return;if(r instanceof Vt)return}if(s instanceof Ct&&"="==s.operator&&i===s.right||s instanceof mt&&(i!==s.expression||s instanceof ht)||s instanceof ze&&i===s.value&&i.scope!==t.scope||s instanceof ft&&i===s.value||s instanceof Je&&i===s.value&&i.scope!==t.scope)return!(a>1)||r&&r.is_constant_expression(n)||(a=1),void((!t.escaped||t.escaped>a)&&(t.escaped=a));if(s instanceof Ft||s instanceof Ze||s instanceof yt&&Ni.has(s.operator)||s instanceof bt&&i!==s.condition||s instanceof ke||s instanceof Et&&i===s.tail_node())l(e,t,n,s,s,o+1,a);else if(s instanceof wt&&i===s.value){var u=e.parent(o+1);l(e,t,n,u,u,o+2,a)}else if(s instanceof gt&&i===s.expression&&(l(e,t,n,s,r=ui(r,s.property),o+1,a+1),r))return;o>0||s instanceof Et&&i!==s.tail_node()||s instanceof he||(t.direct_access=!0)}e(pe,a);const f=e=>yn(e,e=>{if(e instanceof Bt){var t=e.definition();t&&(e instanceof rn&&t.references.push(e),t.fixed=!1)}});e(Le,(function(e,t,i){return r(e),n(e,i,this),t(),o(e),!0})),e(Ct,(function(e,t,n){var i=this;if(i.left instanceof Ke)f(i.left);else{var r=i.left;if(r instanceof rn){var o=r.definition(),a=c(e,o,r.scope,i.right);if(o.assignments++,a){var u=o.fixed;if(u||"="==i.operator){var _="="==i.operator,d=_?i.right:i;if(!ci(n,e,i,d,0))return o.references.push(r),_||(o.chained=!0),o.fixed=_?function(){return i.right}:function(){return p(yt,i,{operator:i.operator.slice(0,-1),left:u instanceof pe?u:u(),right:i.right})},s(e,o,!1),i.right.walk(e),s(e,o,!0),l(e,o,r.scope,i,d,0,1),!0}}}}})),e(yt,(function(e){if(Ni.has(this.operator))return this.left.walk(e),r(e),this.right.walk(e),o(e),!0})),e(De,(function(e,t,n){i(n,this)})),e(it,(function(e){return r(e),this.expression.walk(e),o(e),r(e),Ee(this,e),o(e),!0})),e(It,(function(e,t){return oi(this,16),r(e),t(),o(e),!0})),e(bt,(function(e){return this.condition.walk(e),r(e),this.consequent.walk(e),o(e),r(e),this.alternative.walk(e),o(e),!0})),e(nt,(function(e,t){return r(e),t(),o(e),!0})),e(Ie,(function(e,t,i){return oi(this,16),r(e),n(e,i,this),this.uses_arguments?(t(),void o(e)):(!this.name&&(a=e.parent())instanceof mt&&a.expression===this&&!a.args.some(e=>e instanceof ke)&&this.argnames.every(e=>e instanceof Bt)&&this.argnames.forEach((t,n)=>{if(t.definition){var i=t.definition();i.orig.length>1||(void 0!==i.fixed||this.uses_arguments&&!e.has_directive("use strict")?i.fixed=!1:(i.fixed=function(){return a.args[n]||p(gn,a)},e.loop_ids.set(i.id,e.in_loop),s(e,i,!0)))}}),t(),o(e),!0);var a})),e(Ce,(function(e,t,n){i(n,this);const a=e.in_loop;return e.in_loop=this,r(e),this.body.walk(e),$i(this)&&(o(e),r(e)),this.condition.walk(e),o(e),e.in_loop=a,!0})),e(Fe,(function(e,t,n){i(n,this),this.init&&this.init.walk(e);const a=e.in_loop;return e.in_loop=this,r(e),this.condition&&this.condition.walk(e),this.body.walk(e),this.step&&($i(this)&&(o(e),r(e)),this.step.walk(e)),o(e),e.in_loop=a,!0})),e(Me,(function(e,t,n){i(n,this),f(this.init),this.object.walk(e);const a=e.in_loop;return e.in_loop=this,r(e),this.body.walk(e),o(e),e.in_loop=a,!0})),e(Qe,(function(e){return this.condition.walk(e),r(e),this.body.walk(e),o(e),this.alternative&&(r(e),this.alternative.walk(e),o(e)),!0})),e(Te,(function(e){return r(e),this.body.walk(e),o(e),!0})),e(Qt,(function(){this.definition().fixed=!1})),e(rn,(function(e,t,n){var i,r,o=this.definition();o.references.push(this),1==o.references.length&&!o.fixed&&o.orig[0]instanceof Yt&&e.loop_ids.set(o.id,e.in_loop),void 0!==o.fixed&&u(e,o)?o.fixed&&((i=this.fixed_value())instanceof Ie&&Ji(e,o)?o.recursive_refs++:i&&!n.exposed(o)&&function(e,t,n){return t.option("unused")&&!n.scope.pinned()&&n.references.length-n.recursive_refs==1&&e.loop_ids.get(n.id)===e.in_loop}(e,n,o)?o.single_use=i instanceof Ie&&!i.pinned()||i instanceof It||o.scope===this.scope&&i.is_constant_expression():o.single_use=!1,ci(n,e,this,i,0,!!(r=i)&&(r.is_constant()||r instanceof Ie||r instanceof un))&&(o.single_use?o.single_use="m":o.fixed=!1)):o.fixed=!1,l(e,o,this.scope,this,i,0,1)})),e(Ne,(function(e,i,r){this.globals.forEach((function(e){t(r,e)})),n(e,r,this)})),e(rt,(function(e,t,n){return i(n,this),r(e),Ee(this,e),o(e),this.bcatch&&(r(e),this.bcatch.walk(e),o(e)),this.bfinally&&this.bfinally.walk(e),!0})),e(vt,(function(e){var t=this;if("++"===t.operator||"--"===t.operator){var n=t.expression;if(n instanceof rn){var i=n.definition(),r=c(e,i,n.scope,!0);if(i.assignments++,r){var o=i.fixed;if(o)return i.references.push(n),i.chained=!0,i.fixed=function(){return p(yt,t,{operator:t.operator.slice(0,-1),left:p(At,t,{operator:"+",expression:o instanceof pe?o:o()}),right:p(pn,t,{value:1})})},s(e,i,!0),!0}}}})),e(ft,(function(e,t){var n=this;if(n.name instanceof Ke)f(n.name);else{var i=n.name.definition();if(n.value){if(c(e,i,n.name.scope,n.value))return i.fixed=function(){return n.value},e.loop_ids.set(i.id,e.in_loop),s(e,i,!1),t(),s(e,i,!0),!0;i.fixed=!1}}})),e(Oe,(function(e,t,n){i(n,this);const a=e.in_loop;return e.in_loop=this,r(e),t(),o(e),e.in_loop=a,!0}))}((function(e,t){e.DEFMETHOD("reduce_vars",t)})),Ne.DEFMETHOD("reset_opt_flags",(function(e){const t=this,n=e.option("reduce_vars"),i=new On((function(r,o){if(oi(r,1792),n)return e.top_retain&&r instanceof Be&&i.parent()===t&&ri(r,1024),r.reduce_vars(i,o,e)}));i.safe_ids=Object.create(null),i.in_loop=null,i.loop_ids=new Map,i.defs_to_safe_ids=new Map,t.walk(i)})),Bt.DEFMETHOD("fixed_value",(function(){var e=this.thedef.fixed;return!e||e instanceof pe?e:e()})),rn.DEFMETHOD("is_immutable",(function(){var e=this.definition().orig;return 1==e.length&&e[0]instanceof jt}));var bi=E("Array Boolean clearInterval clearTimeout console Date decodeURI decodeURIComponent encodeURI encodeURIComponent Error escape eval EvalError Function isFinite isNaN JSON Math Number parseFloat parseInt RangeError ReferenceError RegExp Object setInterval setTimeout String SyntaxError TypeError unescape URIError");rn.DEFMETHOD("is_declared",(function(e){return!this.definition().undeclared||e.option("unsafe")&&bi.has(this.name)}));var Ci,Oi=E("Infinity NaN undefined");function Fi(e){return e instanceof Sn||e instanceof En||e instanceof gn}function Mi(e,t){var n,r,o=t.find_parent(xe).get_defun_scope();!function(){var e=t.self(),i=0;do{if(e instanceof ot||e instanceof at)i++;else if(e instanceof ye)n=!0;else{if(e instanceof xe){o=e;break}e instanceof rt&&(r=!0)}}while(e=t.parent(i++))}();var a,s=10;do{a=!1,c(e),t.option("dead_code")&&_(e,t),t.option("if_return")&&l(e,t),t.sequences_limit>0&&(h(e,t),g(e,t)),t.option("join_vars")&&S(e),t.option("collapse_vars")&&u(e,t)}while(a&&s-- >0);function u(e,t){if(o.pinned())return e;for(var s,u=[],c=e.length,l=new Fn((function(e){if(M)return e;if(!F)return e!==d[m]?e:++m<d.length?I(e):(F=!0,(g=function e(t,n,i){var r=l.parent(n);if(r instanceof Ct)return i&&!(r.left instanceof gt||v.has(r.left.name))?e(r,n+1,i):t;if(r instanceof yt)return!i||Ni.has(r.operator)&&r.left!==t?t:e(r,n+1,i);if(r instanceof mt)return t;if(r instanceof it)return t;if(r instanceof bt)return i&&r.condition===t?e(r,n+1,i):t;if(r instanceof st)return e(r,n+1,!0);if(r instanceof ze)return i?e(r,n+1,i):t;if(r instanceof Qe)return i&&r.condition===t?e(r,n+1,i):t;if(r instanceof ye)return t;if(r instanceof Et)return e(r,n+1,r.tail_node()!==t);if(r instanceof he)return e(r,n+1,!0);return r instanceof et||r instanceof ft?t:null}(e,0))===e&&(M=!0),e);var n,i=l.parent();if(e instanceof Ct&&"="!=e.operator&&S.equivalent_to(e.left)||e instanceof Ze||e instanceof mt&&S instanceof gt&&S.equivalent_to(e.expression)||e instanceof de||e instanceof Ke||e instanceof ke&&e.expression instanceof Bt&&e.expression.definition().references.length>1||e instanceof ye&&!(e instanceof Fe)||e instanceof qe||e instanceof rt||e instanceof we||e instanceof Je||e instanceof dt||e instanceof It||i instanceof Fe&&e!==i.init||!b&&e instanceof rn&&!e.is_declared(t)&&!Xi.has(e)||e instanceof rn&&i instanceof mt&&T(i,wn))return M=!0,e;if(D||A&&b||!(i instanceof yt&&Ni.has(i.operator)&&i.left!==e||i instanceof bt&&i.condition!==e||i instanceof Qe&&i.condition!==e)||(D=i),w&&!(e instanceof Ut)&&S.equivalent_to(e)){if(D)return M=!0,e;if(Ii(e,i))return E&&R++,e;if(R++,E&&h instanceof ft)return e;if(a=M=!0,t.info("Collapsing {name} [{file}:{line},{col}]",{name:e.print_to_string(),file:e.start.file,line:e.start.line,col:e.start.col}),h instanceof Tt)return p(At,h,h);if(h instanceof ft){var s=h.name.definition(),u=h.value;return s.references.length-s.replaced!=1||t.exposed(s)?p(Ct,h,{operator:"=",left:p(rn,h.name,h.name),right:u}):(s.replaced++,O&&Fi(u)?u.transform(t):Ei(i,e,u))}return oi(h,32),h}return(e instanceof mt||e instanceof ze&&(y||S instanceof gt||W(S))||e instanceof gt&&(y||e.expression.may_throw_on_access(t))||e instanceof rn&&(v.get(e.name)||y&&W(e))||e instanceof ft&&e.value&&(v.has(e.name.name)||y&&W(e.name))||(n=Ii(e.left,e))&&(n instanceof gt||v.has(n.name))||C&&(r?e.has_side_effects(t):function e(t,n){if(t instanceof Ct)return e(t.left,!0);if(t instanceof vt)return e(t.expression,!0);if(t instanceof ft)return t.value&&e(t.value);if(n){if(t instanceof Dt)return e(t.expression,!0);if(t instanceof St)return e(t.expression,!0);if(t instanceof rn)return t.definition().scope!==o}return!1}(e)))&&(g=e,e instanceof xe&&(M=!0)),I(e)}),(function(e){M||(g===e&&(M=!0),D===e&&(D=null))})),_=new Fn((function(e){if(M)return e;if(!F){if(e!==d[m])return e;if(++m<d.length)return;return F=!0,e}return e instanceof rn&&e.name==k.name?(--R||(M=!0),Ii(e,_.parent())?e:(k.replaced++,E.replaced--,h.value)):e instanceof nt||e instanceof xe?e:void 0}));--c>=0;){0==c&&t.option("unused")&&P();var d=[];for(V(e[c]);u.length>0;){d=u.pop();var m=0,h=d[d.length-1],E=null,g=null,D=null,S=B(h);if(S&&!fi(S)&&!S.has_side_effects(t)){var v=U(h),A=H(S);S instanceof rn&&v.set(S.name,!1);var y=X(h),b=z(),C=h.may_throw(t),O=h.name instanceof Wt,F=O,M=!1,R=0,w=!s||!F;if(!w){for(var x=t.self().argnames.lastIndexOf(h.name)+1;!M&&x<s.length;x++)s[x].transform(l);w=!0}for(var N=c;!M&&N<e.length;N++)e[N].transform(l);if(E){var k=h.name.definition();if(M&&k.references.length-k.replaced>R)R=!1;else{M=!1,m=0,F=O;for(N=c;!M&&N<e.length;N++)e[N].transform(_);E.single_use=!1}}R&&!G(h)&&e.splice(c,1)}}}function I(e){if(e instanceof xe)return e;if(e instanceof et){e.expression=e.expression.transform(l);for(var t=0,n=e.body.length;!M&&t<n;t++){var i=e.body[t];if(i instanceof it){if(!F){if(i!==d[m])continue;m++}if(i.expression=i.expression.transform(l),!b)break}}return M=!0,e}}function L(e,t,n){var i=!1,r=!(e instanceof Ve);return t.walk(new On((function(t,a){if(i)return!0;if(t instanceof rn&&(e.variables.has(t.name)||function(e,t){if(e.global)return!1;let n=e.scope;for(;n&&n!==t;){if(n.variables.has(e.name))return!0;n=n.parent_scope}return!1}(t.definition(),e))){var s=t.definition().scope;if(s!==o)for(;s=s.parent_scope;)if(s===o)return!0;return i=!0}if((n||r)&&t instanceof un)return i=!0;if(t instanceof xe&&!(t instanceof Ve)){var u=r;return r=!1,a(),r=u,!0}}))),i}function P(){var e,n=t.self();if(li(n)&&!n.name&&!n.uses_arguments&&!n.pinned()&&(e=t.parent())instanceof mt&&e.expression===n&&e.args.every(e=>!(e instanceof ke))){var r=t.has_directive("use strict");r&&!i(r,n.body)&&(r=!1);var o=n.argnames.length;s=e.args.slice(o);for(var a=new Set,c=o;--c>=0;){var l=n.argnames[c],f=e.args[c];const i=l.definition&&l.definition();if(!(i&&i.orig.length>1)&&(s.unshift(p(ft,l,{name:l,value:f})),!a.has(l.name)))if(a.add(l.name),l instanceof ke){var _=e.args.slice(c);_.every(e=>!L(n,e,r))&&u.unshift([p(ft,l,{name:l.expression,value:p(Ft,e,{elements:_})})])}else f?(f instanceof Ie&&f.pinned()||L(n,f,r))&&(f=null):f=p(gn,l).transform(t),f&&u.unshift([p(ft,l,{name:l,value:f})])}}}function V(e){if(d.push(e),e instanceof Ct)e.left.has_side_effects(t)||u.push(d.slice()),V(e.right);else if(e instanceof yt)V(e.left),V(e.right);else if(e instanceof mt&&!T(e,wn))V(e.expression),e.args.forEach(V);else if(e instanceof it)V(e.expression);else if(e instanceof bt)V(e.condition),V(e.consequent),V(e.alternative);else if(e instanceof st){var n=e.definitions.length,i=n-200;for(i<0&&(i=0);i<n;i++)V(e.definitions[i])}else e instanceof be?(V(e.condition),e.body instanceof De||V(e.body)):e instanceof ze?e.value&&V(e.value):e instanceof Fe?(e.init&&V(e.init),e.condition&&V(e.condition),e.step&&V(e.step),e.body instanceof De||V(e.body)):e instanceof Me?(V(e.object),e.body instanceof De||V(e.body)):e instanceof Qe?(V(e.condition),e.body instanceof De||V(e.body),!e.alternative||e.alternative instanceof De||V(e.alternative)):e instanceof Et?e.expressions.forEach(V):e instanceof he?V(e.body):e instanceof et?(V(e.expression),e.body.forEach(V)):e instanceof vt?"++"!=e.operator&&"--"!=e.operator||u.push(d.slice()):e instanceof ft&&e.value&&(u.push(d.slice()),V(e.value));d.pop()}function B(e){if(!(e instanceof ft&&e.name instanceof Ut)){const t=e[e instanceof Ct?"left":"expression"];return!pi(t,Xt)&&!pi(t,zt)&&t}var n=e.name.definition();if(i(e.name,n.orig)){var r=n.references.length-n.replaced;if(r)return n.orig.length-n.eliminated>1&&!(e.name instanceof Wt)||(r>1?function(e){var t=e.value;if(t instanceof rn&&"arguments"!=t.name){var n=t.definition();if(!n.undeclared)return E=n}}(e):!t.exposed(n))?p(rn,e.name,e.name):void 0}}function K(e){return e[e instanceof Ct?"right":"value"]}function U(e){var n=new Map;if(e instanceof vt)return n;var i=new On((function(e){for(var r=e;r instanceof gt;)r=r.expression;(r instanceof rn||r instanceof un)&&n.set(r.name,n.get(r.name)||ci(t,i,e,e,0))}));return K(e).walk(i),n}function G(n){if(n.name instanceof Wt){var i=t.parent(),r=t.self().argnames,o=r.indexOf(n.name);if(o<0)i.args.length=Math.min(i.args.length,r.length-1);else{var a=i.args;a[o]&&(a[o]=p(pn,a[o],{value:0}))}return!0}var s=!1;return e[c].transform(new Fn((function(e,t,i){return s?e:e===n||e.body===n?(s=!0,e instanceof ft?(e.value=e.name instanceof Xt?p(gn,e.value):null,e):i?f.skip:null):void 0}),(function(e){if(e instanceof Et)switch(e.expressions.length){case 0:return null;case 1:return e.expressions[0]}})))}function H(e){for(;e instanceof gt;)e=e.expression;return e instanceof rn&&e.definition().scope===o&&!(n&&(v.has(e.name)||h instanceof vt||h instanceof Ct&&"="!=h.operator))}function X(e){return e instanceof vt?ki.has(e.operator):K(e).has_side_effects(t)}function z(){if(y)return!1;if(E)return!0;if(S instanceof rn){var e=S.definition();if(e.references.length-e.replaced==(h instanceof ft?1:2))return!0}return!1}function W(e){if(!e.definition)return!0;var t=e.definition();return!(1==t.orig.length&&t.orig[0]instanceof Yt)&&(t.scope.get_defun_scope()!==o||!t.references.every(e=>{var t=e.scope.get_defun_scope();return"Scope"==t.TYPE&&(t=t.parent_scope),t===o}))}}function c(e){for(var t=[],n=0;n<e.length;){var i=e[n];i instanceof Se&&i.body.every(vi)?(a=!0,c(i.body),e.splice(n,1,...i.body),n+=i.body.length):i instanceof ve?(a=!0,e.splice(n,1)):i instanceof me?t.indexOf(i.value)<0?(n++,t.push(i.value)):(a=!0,e.splice(n,1)):n++}}function l(e,t){for(var n=t.self(),i=function(e){for(var t=0,n=e.length;--n>=0;){var i=e[n];if(i instanceof Qe&&i.body instanceof We&&++t>1)return!0}return!1}(e),r=n instanceof Ie,o=e.length;--o>=0;){var s=e[o],u=S(o),c=e[u];if(r&&!c&&s instanceof We){if(!s.value){a=!0,e.splice(o,1);continue}if(s.value instanceof At&&"void"==s.value.operator){a=!0,e[o]=p(he,s,{body:s.value.expression});continue}}if(s instanceof Qe){var l;if(E(l=zi(s.body))){l.label&&m(l.label.thedef.references,l),a=!0,(s=s.clone()).condition=s.condition.negate(t);var f=D(s.body,l);s.body=p(Se,s,{body:Di(s.alternative).concat(g())}),s.alternative=p(Se,s,{body:f}),e[o]=s.transform(t);continue}if(E(l=zi(s.alternative))){l.label&&m(l.label.thedef.references,l),a=!0,(s=s.clone()).body=p(Se,s.body,{body:Di(s.body).concat(g())});f=D(s.alternative,l);s.alternative=p(Se,s.alternative,{body:f}),e[o]=s.transform(t);continue}}if(s instanceof Qe&&s.body instanceof We){var _=s.body.value;if(!_&&!s.alternative&&(r&&!c||c instanceof We&&!c.value)){a=!0,e[o]=p(he,s.condition,{body:s.condition});continue}if(_&&!s.alternative&&c instanceof We&&c.value){a=!0,(s=s.clone()).alternative=c,e[o]=s.transform(t),e.splice(u,1);continue}if(_&&!s.alternative&&(!c&&r&&i||c instanceof We)){a=!0,(s=s.clone()).alternative=c||p(We,s,{value:null}),e[o]=s.transform(t),c&&e.splice(u,1);continue}var h=e[v(o)];if(t.option("sequences")&&r&&!s.alternative&&h instanceof Qe&&h.body instanceof We&&S(u)==e.length&&c instanceof he){a=!0,(s=s.clone()).alternative=p(Se,c,{body:[c,p(We,c,{value:null})]}),e[o]=s.transform(t),e.splice(u,1);continue}}}function E(i){if(!i)return!1;for(var a=o+1,s=e.length;a<s;a++){var u=e[a];if(u instanceof lt||u instanceof ct)return!1}var c=i instanceof qe?t.loopcontrol_target(i):null;return i instanceof We&&r&&function(e){return!e||e instanceof At&&"void"==e.operator}(i.value)||i instanceof je&&n===Ai(c)||i instanceof $e&&c instanceof Se&&n===c}function g(){var t=e.slice(o+1);return e.length=o+1,t.filter((function(t){return!(t instanceof Be)||(e.push(t),!1)}))}function D(e,t){var n=Di(e).slice(0,-1);return t.value&&n.push(p(he,t.value,{body:t.value.expression})),n}function S(t){for(var n=t+1,i=e.length;n<i;n++){var r=e[n];if(!(r instanceof ut&&d(r)))break}return n}function v(t){for(var n=t;--n>=0;){var i=e[n];if(!(i instanceof ut&&d(i)))break}return n}}function _(e,t){for(var n,i=t.self(),r=0,o=0,s=e.length;r<s;r++){var u=e[r];if(u instanceof qe){var c=t.loopcontrol_target(u);u instanceof $e&&!(c instanceof ye)&&Ai(c)===i||u instanceof je&&Ai(c)===i?u.label&&m(u.label.thedef.references,u):e[o++]=u}else e[o++]=u;if(zi(u)){n=e.slice(r+1);break}}e.length=o,a=o!=s,n&&n.forEach((function(n){Ri(t,n,e)}))}function d(e){return e.definitions.every(e=>!e.value)}function h(e,t){if(!(e.length<2)){for(var n=[],i=0,r=0,o=e.length;r<o;r++){var s=e[r];if(s instanceof he){n.length>=t.sequences_limit&&c();var u=s.body;n.length>0&&(u=u.drop_side_effect_free(t)),u&&gi(n,u)}else s instanceof st&&d(s)||s instanceof Be||c(),e[i++]=s}c(),e.length=i,i!=o&&(a=!0)}function c(){if(n.length){var t=mi(n[0],n);e[i++]=p(he,t,{body:t}),n=[]}}}function E(e,t){if(!(e instanceof Se))return e;for(var n=null,i=0,r=e.body.length;i<r;i++){var o=e.body[i];if(o instanceof ut&&d(o))t.push(o);else{if(n)return!1;n=o}}return n}function g(e,t){function n(e){r--,a=!0;var n=i.body;return mi(n,[n,e]).transform(t)}for(var i,r=0,o=0;o<e.length;o++){var s=e[o];if(i)if(s instanceof ze)s.value=n(s.value||p(gn,s).transform(t));else if(s instanceof Fe){if(!(s.init instanceof st)){yn(i.body,e=>e instanceof xe||(e instanceof yt&&"in"===e.operator?Cn:void 0))||(s.init?s.init=n(s.init):(s.init=i.body,r--,a=!0))}}else s instanceof Me?s.init instanceof lt||s.init instanceof ct||(s.object=n(s.object)):s instanceof Qe?s.condition=n(s.condition):(s instanceof et||s instanceof we)&&(s.expression=n(s.expression));if(t.option("conditionals")&&s instanceof Qe){var u=[],c=E(s.body,u),l=E(s.alternative,u);if(!1!==c&&!1!==l&&u.length>0){var f=u.length;u.push(p(Qe,s,{condition:s.condition,body:c||p(ve,s.body),alternative:l})),u.unshift(r,1),[].splice.apply(e,u),o+=f,r+=f+1,i=null,a=!0;continue}}e[r++]=s,i=s instanceof he?s:null}e.length=r}function D(e,n){if(e instanceof st){var i,r=e.definitions[e.definitions.length-1];if(r.value instanceof Mt)if(n instanceof Ct?i=[n]:n instanceof Et&&(i=n.expressions.slice()),i){var a=!1;do{var s=i[0];if(!(s instanceof Ct))break;if("="!=s.operator)break;if(!(s.left instanceof gt))break;var u=s.left.expression;if(!(u instanceof rn))break;if(r.name.name!=u.name)break;if(!s.right.is_constant_expression(o))break;var c=s.left.property;if(c instanceof pe&&(c=c.evaluate(t)),c instanceof pe)break;c=""+c;var l=t.option("ecma")<2015&&t.has_directive("use strict")?function(e){return e.key!=c&&e.key&&e.key.name!=c}:function(e){return e.key&&e.key.name!=c};if(!r.value.properties.every(l))break;var f=r.value.properties.filter((function(e){return e.key===c}))[0];f?f.value=new Et({start:f.start,expressions:[f.value.clone(),s.right.clone()],end:f.end}):r.value.properties.push(p(wt,s,{key:c,value:s.right})),i.shift(),a=!0}while(i.length);return a&&i}}}function S(e){for(var t,n=0,i=-1,r=e.length;n<r;n++){var o=e[n],s=e[i];if(o instanceof st)s&&s.TYPE==o.TYPE?(s.definitions=s.definitions.concat(o.definitions),a=!0):t&&t.TYPE==o.TYPE&&d(o)?(t.definitions=t.definitions.concat(o.definitions),a=!0):(e[++i]=o,t=o);else if(o instanceof ze)o.value=c(o.value);else if(o instanceof Fe){(u=D(s,o.init))?(a=!0,o.init=u.length?mi(o.init,u):null,e[++i]=o):s instanceof ut&&(!o.init||o.init.TYPE==s.TYPE)?(o.init&&(s.definitions=s.definitions.concat(o.init.definitions)),o.init=s,e[i]=o,a=!0):t&&o.init&&t.TYPE==o.init.TYPE&&d(o.init)?(t.definitions=t.definitions.concat(o.init.definitions),o.init=null,e[++i]=o,a=!0):e[++i]=o}else if(o instanceof Me)o.object=c(o.object);else if(o instanceof Qe)o.condition=c(o.condition);else if(o instanceof he){var u;if(u=D(s,o.body)){if(a=!0,!u.length)continue;o.body=mi(o.body,u)}e[++i]=o}else o instanceof et||o instanceof we?o.expression=c(o.expression):e[++i]=o}function c(t){e[++i]=o;var n=D(s,t);return n?(a=!0,n.length?mi(t,n):t instanceof Et?t.tail_node().left:t.left):t}e.length=i+1}}function Ri(e,t,n){t instanceof Be||e.warn("Dropping unreachable code [{file}:{line},{col}]",t.start),yn(t,i=>i instanceof ut?(e.warn("Declarations in unreachable code! [{file}:{line},{col}]",i.start),i.remove_initializers(),n.push(i),!0):i instanceof Be&&(i===t||!e.has_directive("use strict"))?(n.push(i===t?i:p(ut,i,{definitions:[p(ft,i,{name:p(Gt,i.name,i.name),value:null})]})),!0):i instanceof xe||void 0)}function wi(e){return e instanceof ln?e.getValue():e instanceof At&&"void"==e.operator&&e.expression instanceof ln?void 0:e}function xi(e,t){return ii(e,8)||e instanceof gn||e instanceof At&&"void"==e.operator&&!e.expression.has_side_effects(t)}!function(e){function t(e){return/strict/.test(e.option("pure_getters"))}pe.DEFMETHOD("may_throw_on_access",(function(e){return!e.option("pure_getters")||this._dot_throw(e)})),e(pe,t),e(hn,u),e(gn,u),e(ln,s),e(Ft,s),e(Mt,(function(e){if(!t(e))return!1;for(var n=this.properties.length;--n>=0;)if(this.properties[n]._dot_throw(e))return!0;return!1})),e(It,s),e(Rt,s),e(Nt,u),e(ke,(function(e){return this.expression._dot_throw(e)})),e(Pe,s),e(Ve,s),e(Tt,s),e(At,(function(){return"void"==this.operator})),e(yt,(function(e){return("&&"==this.operator||"||"==this.operator||"??"==this.operator)&&(this.left._dot_throw(e)||this.right._dot_throw(e))})),e(Ct,(function(e){return"="==this.operator&&this.right._dot_throw(e)})),e(bt,(function(e){return this.consequent._dot_throw(e)||this.alternative._dot_throw(e)})),e(Dt,(function(e){return!!t(e)&&!(this.expression instanceof Pe&&"prototype"==this.property)})),e(Et,(function(e){return this.tail_node()._dot_throw(e)})),e(rn,(function(e){if("arguments"===this.name)return!1;if(ii(this,8))return!0;if(!t(e))return!1;if(yi(this)&&this.is_declared(e))return!1;if(this.is_immutable())return!1;var n=this.fixed_value();return!n||n._dot_throw(e)}))}((function(e,t){e.DEFMETHOD("_dot_throw",t)})),function(e){const t=E("! delete"),n=E("in instanceof == != === !== < <= >= >");e(pe,s),e(At,(function(){return t.has(this.operator)})),e(yt,(function(){return n.has(this.operator)||Ni.has(this.operator)&&this.left.is_boolean()&&this.right.is_boolean()})),e(bt,(function(){return this.consequent.is_boolean()&&this.alternative.is_boolean()})),e(Ct,(function(){return"="==this.operator&&this.right.is_boolean()})),e(Et,(function(){return this.tail_node().is_boolean()})),e(Tn,u),e(An,u)}((function(e,t){e.DEFMETHOD("is_boolean",t)})),function(e){e(pe,s),e(pn,u);var t=E("+ - ~ ++ --");e(vt,(function(){return t.has(this.operator)}));var n=E("- * / % & | ^ << >> >>>");e(yt,(function(e){return n.has(this.operator)||"+"==this.operator&&this.left.is_number(e)&&this.right.is_number(e)})),e(Ct,(function(e){return n.has(this.operator.slice(0,-1))||"="==this.operator&&this.right.is_number(e)})),e(Et,(function(e){return this.tail_node().is_number(e)})),e(bt,(function(e){return this.consequent.is_number(e)&&this.alternative.is_number(e)}))}((function(e,t){e.DEFMETHOD("is_number",t)})),(Ci=function(e,t){e.DEFMETHOD("is_string",t)})(pe,s),Ci(fn,u),Ci(Ge,u),Ci(At,(function(){return"typeof"==this.operator})),Ci(yt,(function(e){return"+"==this.operator&&(this.left.is_string(e)||this.right.is_string(e))})),Ci(Ct,(function(e){return("="==this.operator||"+="==this.operator)&&this.right.is_string(e)})),Ci(Et,(function(e){return this.tail_node().is_string(e)})),Ci(bt,(function(e){return this.consequent.is_string(e)&&this.alternative.is_string(e)}));var Ni=E("&& || ??"),ki=E("delete ++ --");function Ii(e,t){return t instanceof vt&&ki.has(t.operator)?t.expression:t instanceof Ct&&t.left===e?e:void 0}function Li(e,t){return e.size()>t.size()?t:e}function Pi(e,t){return Li(p(he,e,{body:e}),p(he,t,{body:t})).body}function Vi(e,t,n){return(In(e)?Pi:Li)(t,n)}function Bi(e){const t=new Map;for(var n of Object.keys(e))t.set(n,E(e[n]));return t}!function(e){function t(e,t){e.warn("global_defs "+t.print_to_string()+" redefined [{file}:{line},{col}]",t.start)}Ne.DEFMETHOD("resolve_defines",(function(e){return e.option("global_defs")?(this.figure_out_scope({ie8:e.option("ie8")}),this.transform(new Fn((function(n){var i=n._find_defs(e,"");if(i){for(var r,o=0,a=n;(r=this.parent(o++))&&r instanceof gt&&r.expression===a;)a=r;if(!Ii(a,r))return i;t(e,n)}})))):this})),e(pe,a),e(Dt,(function(e,t){return this.expression._find_defs(e,"."+this.property+t)})),e(Ut,(function(e){this.global()&&D(e.option("global_defs"),this.name)&&t(e,this)})),e(rn,(function(e,t){if(this.global()){var n=e.option("global_defs"),i=this.name+t;return D(n,i)?function e(t,n){if(t instanceof pe)return p(t.CTOR,n,t);if(Array.isArray(t))return p(Ft,n,{elements:t.map((function(t){return e(t,n)}))});if(t&&"object"==typeof t){var i=[];for(var r in t)D(t,r)&&i.push(p(wt,n,{key:r,value:e(t[r],n)}));return p(Mt,n,{properties:i})}return hi(t,n)}(n[i],this):void 0}}))}((function(e,t){e.DEFMETHOD("_find_defs",t)}));var Ki=["constructor","toString","valueOf"],Ui=Bi({Array:["indexOf","join","lastIndexOf","slice"].concat(Ki),Boolean:Ki,Function:Ki,Number:["toExponential","toFixed","toPrecision"].concat(Ki),Object:Ki,RegExp:["test"].concat(Ki),String:["charAt","charCodeAt","concat","indexOf","italics","lastIndexOf","match","replace","search","slice","split","substr","substring","toLowerCase","toUpperCase","trim"].concat(Ki)}),Gi=Bi({Array:["isArray"],Math:["abs","acos","asin","atan","ceil","cos","exp","floor","log","round","sin","sqrt","tan","atan2","pow","max","min"],Number:["isFinite","isNaN"],Object:["create","getOwnPropertyDescriptor","getOwnPropertyNames","getPrototypeOf","isExtensible","isFrozen","isSealed","keys"],String:["fromCharCode"]});!function(e){pe.DEFMETHOD("evaluate",(function(e){if(!e.option("evaluate"))return this;var t=this._eval(e,1);return!t||t instanceof RegExp?t:"function"==typeof t||"object"==typeof t?this:t}));var t=E("! ~ - + void");pe.DEFMETHOD("is_constant",(function(){return this instanceof ln?!(this instanceof dn):this instanceof At&&this.expression instanceof ln&&t.has(this.operator)})),e(_e,(function(){throw new Error(d("Cannot evaluate a statement [{file}:{line},{col}]",this.start))})),e(Ie,c),e(It,c),e(pe,c),e(ln,(function(){return this.getValue()})),e(_n,c),e(dn,(function(e){let t=e.evaluated_regexps.get(this);if(void 0===t){try{t=(0,eval)(this.print_to_string())}catch(e){t=null}e.evaluated_regexps.set(this,t)}return t||this})),e(Ge,(function(){return 1!==this.segments.length?this:this.segments[0].value})),e(Pe,(function(e){if(e.option("unsafe")){var t=function(){};return t.node=this,t.toString=function(){return this.node.print_to_string()},t}return this})),e(Ft,(function(e,t){if(e.option("unsafe")){for(var n=[],i=0,r=this.elements.length;i<r;i++){var o=this.elements[i],a=o._eval(e,t);if(o===a)return this;n.push(a)}return n}return this})),e(Mt,(function(e,t){if(e.option("unsafe")){for(var n={},i=0,r=this.properties.length;i<r;i++){var o=this.properties[i];if(o instanceof ke)return this;var a=o.key;if(a instanceof Bt)a=a.name;else if(a instanceof pe&&(a=a._eval(e,t))===o.key)return this;if("function"==typeof Object.prototype[a])return this;if(!(o.value instanceof Pe)&&(n[a]=o.value._eval(e,t),n[a]===o.value))return this}return n}return this}));var n=E("! typeof void");e(At,(function(e,t){var i=this.expression;if(e.option("typeofs")&&"typeof"==this.operator&&(i instanceof Ie||i instanceof rn&&i.fixed_value()instanceof Ie))return"function";if(n.has(this.operator)||t++,(i=i._eval(e,t))===this.expression)return this;switch(this.operator){case"!":return!i;case"typeof":return i instanceof RegExp?this:typeof i;case"void":return;case"~":return~i;case"-":return-i;case"+":return+i}return this}));var i=E("&& || ?? === !==");e(yt,(function(e,t){i.has(this.operator)||t++;var n=this.left._eval(e,t);if(n===this.left)return this;var r,o=this.right._eval(e,t);if(o===this.right)return this;switch(this.operator){case"&&":r=n&&o;break;case"||":r=n||o;break;case"??":r=null!=n?n:o;break;case"|":r=n|o;break;case"&":r=n&o;break;case"^":r=n^o;break;case"+":r=n+o;break;case"*":r=n*o;break;case"**":r=Math.pow(n,o);break;case"/":r=n/o;break;case"%":r=n%o;break;case"-":r=n-o;break;case"<<":r=n<<o;break;case">>":r=n>>o;break;case">>>":r=n>>>o;break;case"==":r=n==o;break;case"===":r=n===o;break;case"!=":r=n!=o;break;case"!==":r=n!==o;break;case"<":r=n<o;break;case"<=":r=n<=o;break;case">":r=n>o;break;case">=":r=n>=o;break;default:return this}return isNaN(r)&&e.find_parent(we)?this:r})),e(bt,(function(e,t){var n=this.condition._eval(e,t);if(n===this.condition)return this;var i=n?this.consequent:this.alternative,r=i._eval(e,t);return r===i?this:r})),e(rn,(function(e,t){var n,i=this.fixed_value();if(!i)return this;if(D(i,"_eval"))n=i._eval();else{if(this._eval=c,n=i._eval(e,t),delete this._eval,n===i)return this;i._eval=function(){return n}}if(n&&"object"==typeof n){var r=this.definition().escaped;if(r&&t>r)return this}return n}));var r={Array:Array,Math:Math,Number:Number,Object:Object,String:String},o=Bi({Math:["E","LN10","LN2","LOG2E","LOG10E","PI","SQRT1_2","SQRT2"],Number:["MAX_VALUE","MIN_VALUE","NaN","NEGATIVE_INFINITY","POSITIVE_INFINITY"]});e(gt,(function(e,t){if(e.option("unsafe")){var n=this.property;if(n instanceof pe&&(n=n._eval(e,t))===this.property)return this;var i,a=this.expression;if(yi(a)){var s,u="hasOwnProperty"===a.name&&"call"===n&&(s=e.parent()&&e.parent().args)&&s&&s[0]&&s[0].evaluate(e);if(null==(u=u instanceof Dt?u.expression:u)||u.thedef&&u.thedef.undeclared)return this.clone();var c=o.get(a.name);if(!c||!c.has(n))return this;i=r[a.name]}else{if(!(i=a._eval(e,t+1))||i===a||!D(i,n))return this;if("function"==typeof i)switch(n){case"name":return i.node.name?i.node.name.name:"";case"length":return i.node.argnames.length;default:return this}}return i[n]}return this})),e(mt,(function(e,t){var n=this.expression;if(e.option("unsafe")&&n instanceof gt){var i,o=n.property;if(o instanceof pe&&(o=o._eval(e,t))===n.property)return this;var a=n.expression;if(yi(a)){var s="hasOwnProperty"===a.name&&"call"===o&&this.args[0]&&this.args[0].evaluate(e);if(null==(s=s instanceof Dt?s.expression:s)||s.thedef&&s.thedef.undeclared)return this.clone();var u=Gi.get(a.name);if(!u||!u.has(o))return this;i=r[a.name]}else{if((i=a._eval(e,t+1))===a||!i)return this;var c=Ui.get(i.constructor.name);if(!c||!c.has(o))return this}for(var l=[],f=0,p=this.args.length;f<p;f++){var _=this.args[f],d=_._eval(e,t);if(_===d)return this;l.push(d)}try{return i[o].apply(i,l)}catch(t){e.warn("Error evaluating {code} [{file}:{line},{col}]",{code:this.print_to_string(),file:this.start.file,line:this.start.line,col:this.start.col})}}return this})),e(ht,c)}((function(e,t){e.DEFMETHOD("_eval",t)})),function(e){function t(e){return p(At,e,{operator:"!",expression:e})}function n(e,n,i){var r=t(e);if(i){var o=p(he,n,{body:n});return Li(r,o)===o?n:r}return Li(r,n)}e(pe,(function(){return t(this)})),e(_e,(function(){throw new Error("Cannot negate a statement")})),e(Pe,(function(){return t(this)})),e(Ve,(function(){return t(this)})),e(At,(function(){return"!"==this.operator?this.expression:t(this)})),e(Et,(function(e){var t=this.expressions.slice();return t.push(t.pop().negate(e)),mi(this,t)})),e(bt,(function(e,t){var i=this.clone();return i.consequent=i.consequent.negate(e),i.alternative=i.alternative.negate(e),n(this,i,t)})),e(yt,(function(e,i){var r=this.clone(),o=this.operator;if(e.option("unsafe_comps"))switch(o){case"<=":return r.operator=">",r;case"<":return r.operator=">=",r;case">=":return r.operator="<",r;case">":return r.operator="<=",r}switch(o){case"==":return r.operator="!=",r;case"!=":return r.operator="==",r;case"===":return r.operator="!==",r;case"!==":return r.operator="===",r;case"&&":return r.operator="||",r.left=r.left.negate(e,i),r.right=r.right.negate(e),n(this,r,i);case"||":return r.operator="&&",r.left=r.left.negate(e,i),r.right=r.right.negate(e),n(this,r,i);case"??":return r.right=r.right.negate(e),n(this,r,i)}return t(this)}))}((function(e,t){e.DEFMETHOD("negate",(function(e,n){return t.call(this,e,n)}))}));var Hi=E("Boolean decodeURI decodeURIComponent Date encodeURI encodeURIComponent Error escape EvalError isFinite isNaN Number Object parseFloat parseInt RangeError ReferenceError String SyntaxError TypeError unescape URIError");mt.DEFMETHOD("is_expr_pure",(function(e){if(e.option("unsafe")){var t=this.expression,n=this.args&&this.args[0]&&this.args[0].evaluate(e);if(t.expression&&"hasOwnProperty"===t.expression.name&&(null==n||n.thedef&&n.thedef.undeclared))return!1;if(yi(t)&&Hi.has(t.name))return!0;let i;if(t instanceof Dt&&yi(t.expression)&&(i=Gi.get(t.expression.name))&&i.has(t.property))return!0}return!!T(this,Mn)||!e.pure_funcs(this)})),pe.DEFMETHOD("is_call_pure",s),Dt.DEFMETHOD("is_call_pure",(function(e){if(!e.option("unsafe"))return;const t=this.expression;let n;return t instanceof Ft?n=Ui.get("Array"):t.is_boolean()?n=Ui.get("Boolean"):t.is_number(e)?n=Ui.get("Number"):t instanceof dn?n=Ui.get("RegExp"):t.is_string(e)?n=Ui.get("String"):this.may_throw_on_access(e)||(n=Ui.get("Object")),n&&n.has(this.property)}));const Xi=new Set(["Number","String","Array","Object","Function","Promise"]);function zi(e){return e&&e.aborts()}!function(e){function t(e,t){for(var n=e.length;--n>=0;)if(e[n].has_side_effects(t))return!0;return!1}e(pe,u),e(ve,s),e(ln,s),e(un,s),e(De,(function(e){return t(this.body,e)})),e(mt,(function(e){return!(this.is_expr_pure(e)||this.expression.is_call_pure(e)&&!this.expression.has_side_effects(e))||t(this.args,e)})),e(et,(function(e){return this.expression.has_side_effects(e)||t(this.body,e)})),e(it,(function(e){return this.expression.has_side_effects(e)||t(this.body,e)})),e(rt,(function(e){return t(this.body,e)||this.bcatch&&this.bcatch.has_side_effects(e)||this.bfinally&&this.bfinally.has_side_effects(e)})),e(Qe,(function(e){return this.condition.has_side_effects(e)||this.body&&this.body.has_side_effects(e)||this.alternative&&this.alternative.has_side_effects(e)})),e(Te,(function(e){return this.body.has_side_effects(e)})),e(he,(function(e){return this.body.has_side_effects(e)})),e(Ie,s),e(It,(function(e){return!(!this.extends||!this.extends.has_side_effects(e))||t(this.properties,e)})),e(yt,(function(e){return this.left.has_side_effects(e)||this.right.has_side_effects(e)})),e(Ct,u),e(bt,(function(e){return this.condition.has_side_effects(e)||this.consequent.has_side_effects(e)||this.alternative.has_side_effects(e)})),e(vt,(function(e){return ki.has(this.operator)||this.expression.has_side_effects(e)})),e(rn,(function(e){return!this.is_declared(e)&&!Xi.has(this.name)})),e($t,s),e(Ut,s),e(Mt,(function(e){return t(this.properties,e)})),e(Rt,(function(e){return this.computed_key()&&this.key.has_side_effects(e)||this.value.has_side_effects(e)})),e(Lt,(function(e){return this.computed_key()&&this.key.has_side_effects(e)||this.static&&this.value&&this.value.has_side_effects(e)})),e(kt,(function(e){return this.computed_key()&&this.key.has_side_effects(e)})),e(Nt,(function(e){return this.computed_key()&&this.key.has_side_effects(e)})),e(xt,(function(e){return this.computed_key()&&this.key.has_side_effects(e)})),e(Ft,(function(e){return t(this.elements,e)})),e(Dt,(function(e){return this.expression.may_throw_on_access(e)||this.expression.has_side_effects(e)})),e(St,(function(e){return this.expression.may_throw_on_access(e)||this.expression.has_side_effects(e)||this.property.has_side_effects(e)})),e(Et,(function(e){return t(this.expressions,e)})),e(st,(function(e){return t(this.definitions,e)})),e(ft,(function(){return this.value})),e(He,s),e(Ge,(function(e){return t(this.segments,e)}))}((function(e,t){e.DEFMETHOD("has_side_effects",t)})),function(e){function t(e,t){for(var n=e.length;--n>=0;)if(e[n].may_throw(t))return!0;return!1}e(pe,u),e(ln,s),e(ve,s),e(Ie,s),e(Ut,s),e(un,s),e(It,(function(e){return!(!this.extends||!this.extends.may_throw(e))||t(this.properties,e)})),e(Ft,(function(e){return t(this.elements,e)})),e(Ct,(function(e){return!!this.right.may_throw(e)||!(!e.has_directive("use strict")&&"="==this.operator&&this.left instanceof rn)&&this.left.may_throw(e)})),e(yt,(function(e){return this.left.may_throw(e)||this.right.may_throw(e)})),e(De,(function(e){return t(this.body,e)})),e(mt,(function(e){return!!t(this.args,e)||!this.is_expr_pure(e)&&(!!this.expression.may_throw(e)||(!(this.expression instanceof Ie)||t(this.expression.body,e)))})),e(it,(function(e){return this.expression.may_throw(e)||t(this.body,e)})),e(bt,(function(e){return this.condition.may_throw(e)||this.consequent.may_throw(e)||this.alternative.may_throw(e)})),e(st,(function(e){return t(this.definitions,e)})),e(Dt,(function(e){return this.expression.may_throw_on_access(e)||this.expression.may_throw(e)})),e(Qe,(function(e){return this.condition.may_throw(e)||this.body&&this.body.may_throw(e)||this.alternative&&this.alternative.may_throw(e)})),e(Te,(function(e){return this.body.may_throw(e)})),e(Mt,(function(e){return t(this.properties,e)})),e(Rt,(function(e){return this.value.may_throw(e)})),e(Lt,(function(e){return this.computed_key()&&this.key.may_throw(e)||this.static&&this.value&&this.value.may_throw(e)})),e(kt,(function(e){return this.computed_key()&&this.key.may_throw(e)})),e(Nt,(function(e){return this.computed_key()&&this.key.may_throw(e)})),e(xt,(function(e){return this.computed_key()&&this.key.may_throw(e)})),e(We,(function(e){return this.value&&this.value.may_throw(e)})),e(Et,(function(e){return t(this.expressions,e)})),e(he,(function(e){return this.body.may_throw(e)})),e(St,(function(e){return this.expression.may_throw_on_access(e)||this.expression.may_throw(e)||this.property.may_throw(e)})),e(et,(function(e){return this.expression.may_throw(e)||t(this.body,e)})),e(rn,(function(e){return!this.is_declared(e)&&!Xi.has(this.name)})),e($t,s),e(rt,(function(e){return this.bcatch?this.bcatch.may_throw(e):t(this.body,e)||this.bfinally&&this.bfinally.may_throw(e)})),e(vt,(function(e){return!("typeof"==this.operator&&this.expression instanceof rn)&&this.expression.may_throw(e)})),e(ft,(function(e){return!!this.value&&this.value.may_throw(e)}))}((function(e,t){e.DEFMETHOD("may_throw",t)})),function(e){function t(e){let t=!0;return yn(this,n=>{if(n instanceof rn){if(ii(this,16))return t=!1,Cn;var r=n.definition();if(i(r,this.enclosed)&&!this.variables.has(r.name)){if(e){var o=e.find_variable(n);if(r.undeclared?!o:o===r)return t="f",!0}return t=!1,Cn}return!0}if(n instanceof un&&this instanceof Ve)return t=!1,Cn}),t}e(pe,s),e(ln,u),e(It,(function(e){if(this.extends&&!this.extends.is_constant_expression(e))return!1;for(const t of this.properties){if(t.computed_key()&&!t.key.is_constant_expression(e))return!1;if(t.static&&t.value&&!t.value.is_constant_expression(e))return!1}return t.call(this,e)})),e(Ie,t),e(vt,(function(){return this.expression.is_constant_expression()})),e(yt,(function(){return this.left.is_constant_expression()&&this.right.is_constant_expression()})),e(Ft,(function(){return this.elements.every(e=>e.is_constant_expression())})),e(Mt,(function(){return this.properties.every(e=>e.is_constant_expression())})),e(Rt,(function(){return!(this.key instanceof pe)&&this.value.is_constant_expression()}))}((function(e,t){e.DEFMETHOD("is_constant_expression",t)})),function(e){function t(){for(var e=0;e<this.body.length;e++)if(zi(this.body[e]))return this.body[e];return null}e(_e,l),e(Xe,c),e(_t,(function(){return null})),e(Se,t),e(tt,t),e(Qe,(function(){return this.alternative&&zi(this.body)&&zi(this.alternative)&&this}))}((function(e,t){e.DEFMETHOD("aborts",t)}));var Wi=new Set(["use asm","use strict"]);function Yi(e,t){return Mi(e.body,t),t.option("side_effects")&&1==e.body.length&&e.body[0]===t.has_directive("use strict")&&(e.body.length=0),e}si(me,(function(e,t){return!t.option("directives")||Wi.has(e.value)&&t.has_directive(e.value)===e?e:p(ve,e)})),si(de,(function(e,t){return t.option("drop_debugger")?p(ve,e):e})),si(Te,(function(e,t){return e.body instanceof $e&&t.loopcontrol_target(e.body)===e.body?p(ve,e):0==e.label.references.length?e.body:e})),si(De,(function(e,t){return Mi(e.body,t),e})),si(Se,(function(e,t){switch(Mi(e.body,t),e.body.length){case 1:if(!t.has_directive("use strict")&&t.parent()instanceof Qe&&!((n=e.body[0])instanceof lt||n instanceof ct||n instanceof It)||vi(e.body[0]))return e.body[0];break;case 0:return p(ve,e)}var n;return e})),si(Ie,Yi);const qi=/keep_assign/;function $i(e,t){var n=!1,i=new On((function(t){return!!(n||t instanceof xe)||(t instanceof qe&&i.loopcontrol_target(t)===e?n=!0:void 0)}));return t instanceof Te&&i.push(t),i.push(e),e.body.walk(i),n}function ji(e,t){return t.top_retain&&e instanceof Be&&ii(e,1024)&&e.name&&t.top_retain(e.name)}xe.DEFMETHOD("drop_unused",(function(e){if(!e.option("unused"))return;if(e.has_directive("use asm"))return;var t=this;if(t.pinned())return;var n=!(t instanceof Ne)||e.toplevel.funcs,i=!(t instanceof Ne)||e.toplevel.vars;const r=qi.test(e.option("unused"))?s:function(e){return e instanceof Ct&&(ii(e,32)||"="==e.operator)?e.left:e instanceof vt&&ii(e,32)?e.expression:void 0};var o=new Map,a=new Map;t instanceof Ne&&e.top_retain&&t.variables.forEach((function(t){e.top_retain(t)&&!o.has(t.id)&&o.set(t.id,t)}));var u=new Map,c=new Map,l=this,_=new On((function(r,s){if(r instanceof Ie&&r.uses_arguments&&!_.has_directive("use strict")&&r.argnames.forEach((function(e){if(e instanceof Ut){var t=e.definition();o.has(t.id)||o.set(t.id,t)}})),r!==t){if(r instanceof Be||r instanceof Pt){var f=r.name.definition();if((_.parent()instanceof dt||!n&&l===t)&&f.global&&!o.has(f.id)&&o.set(f.id,f),r instanceof Pt){r.extends&&(r.extends.has_side_effects(e)||r.extends.may_throw(e))&&r.extends.walk(_);for(const t of r.properties)(t.has_side_effects(e)||t.may_throw(e))&&t.walk(_)}return g(c,f.id,r),!0}if(r instanceof Wt&&l===t&&g(u,r.definition().id,r),r instanceof st&&l===t){const t=_.parent()instanceof dt;return r.definitions.forEach((function(n){if(n.name instanceof Gt&&g(u,n.name.definition().id,n),!t&&i||yn(n.name,e=>{if(e instanceof Ut){const n=e.definition();!t&&!n.global||o.has(n.id)||o.set(n.id,n)}}),n.value){if(n.name instanceof Ke)n.walk(_);else{var r=n.name.definition();g(c,r.id,n.value),r.chained||n.name.fixed_value()!==n.value||a.set(r.id,n)}n.value.has_side_effects(e)&&n.value.walk(_)}})),!0}return h(r,s)}}));t.walk(_),_=new On(h),o.forEach((function(e){var t=c.get(e.id);t&&t.forEach((function(e){e.walk(_)}))}));var d=new Fn((function(s,c,_){var h=d.parent();if(i){const e=r(s);if(e instanceof rn){var E=e.definition(),g=o.has(E.id);if(s instanceof Ct){if(!g||a.has(E.id)&&a.get(E.id)!==s)return Ei(h,s,s.right.transform(d))}else if(!g)return _?f.skip:p(pn,s,{value:0})}}if(l===t){if(s.name&&(s instanceof Vt&&!S(e.option("keep_classnames"),(E=s.name.definition()).name)||s instanceof Pe&&!S(e.option("keep_fnames"),(E=s.name.definition()).name))&&(!o.has(E.id)||E.orig.length>1)&&(s.name=null),s instanceof Ie&&!(s instanceof Le))for(var D=!e.option("keep_fargs"),v=s.argnames,A=v.length;--A>=0;){var T=v[A];T instanceof ke&&(T=T.expression),T instanceof Ot&&(T=T.left),T instanceof Ke||o.has(T.definition().id)?D=!1:(ri(T,1),D&&(v.pop(),e[T.unreferenced()?"warn":"info"]("Dropping unused function argument {name} [{file}:{line},{col}]",R(T))))}if((s instanceof Be||s instanceof Pt)&&s!==t){const t=s.name.definition();if(!(t.global&&!n||o.has(t.id))){if(e[s.name.unreferenced()?"warn":"info"]("Dropping unused function {name} [{file}:{line},{col}]",R(s.name)),t.eliminated++,s instanceof Pt){const t=s.drop_side_effect_free(e);if(t)return p(he,s,{body:t})}return _?f.skip:p(ve,s)}}if(s instanceof st&&!(h instanceof Me&&h.init===s)){var y=!(h instanceof Ne||s instanceof ut),b=[],C=[],O=[],F=[];switch(s.definitions.forEach((function(t){t.value&&(t.value=t.value.transform(d));var n=t.name instanceof Ke,r=n?new zn(null,{name:"<destructure>"}):t.name.definition();if(y&&r.global)return O.push(t);if(!i&&!y||n&&(t.name.names.length||t.name.is_array||1!=e.option("pure_getters"))||o.has(r.id)){if(t.value&&a.has(r.id)&&a.get(r.id)!==t&&(t.value=t.value.drop_side_effect_free(e)),t.name instanceof Gt){var c=u.get(r.id);if(c.length>1&&(!t.value||r.orig.indexOf(t.name)>r.eliminated)){if(e.warn("Dropping duplicated definition of variable {name} [{file}:{line},{col}]",R(t.name)),t.value){var l=p(rn,t.name,t.name);r.references.push(l);var f=p(Ct,t,{operator:"=",left:l,right:t.value});a.get(r.id)===t&&a.set(r.id,f),F.push(f.transform(d))}return m(c,t),void r.eliminated++}}t.value?(F.length>0&&(O.length>0?(F.push(t.value),t.value=mi(t.value,F)):b.push(p(he,s,{body:mi(s,F)})),F=[]),O.push(t)):C.push(t)}else if(r.orig[0]instanceof Qt){(_=t.value&&t.value.drop_side_effect_free(e))&&F.push(_),t.value=null,C.push(t)}else{var _;(_=t.value&&t.value.drop_side_effect_free(e))?(n||e.warn("Side effects in initialization of unused variable {name} [{file}:{line},{col}]",R(t.name)),F.push(_)):n||e[t.name.unreferenced()?"warn":"info"]("Dropping unused variable {name} [{file}:{line},{col}]",R(t.name)),r.eliminated++}})),(C.length>0||O.length>0)&&(s.definitions=C.concat(O),b.push(s)),F.length>0&&b.push(p(he,s,{body:mi(s,F)})),b.length){case 0:return _?f.skip:p(ve,s);case 1:return b[0];default:return _?f.splice(b):p(Se,s,{body:b})}}if(s instanceof Fe)return c(s,this),s.init instanceof Se&&(M=s.init,s.init=M.body.pop(),M.body.push(s)),s.init instanceof he?s.init=s.init.body:Si(s.init)&&(s.init=null),M?_?f.splice(M.body):M:s;if(s instanceof Te&&s.body instanceof Fe){if(c(s,this),s.body instanceof Se){var M=s.body;return s.body=M.body.pop(),M.body.push(s),_?f.splice(M.body):M}return s}if(s instanceof Se)return c(s,this),_&&s.body.every(vi)?f.splice(s.body):s;if(s instanceof xe){const e=l;return l=s,c(s,this),l=e,s}}function R(e){return{name:e.name,file:e.start.file,line:e.start.line,col:e.start.col}}}));function h(e,n){var i;const s=r(e);if(s instanceof rn&&!pi(e.left,Ht)&&t.variables.get(s.name)===(i=s.definition()))return e instanceof Ct&&(e.right.walk(_),i.chained||e.left.fixed_value()!==e.right||a.set(i.id,e)),!0;if(e instanceof rn){if(i=e.definition(),!o.has(i.id)&&(o.set(i.id,i),i.orig[0]instanceof Qt)){const e=i.scope.is_block_scope()&&i.scope.get_defun_scope().variables.get(i.name);e&&o.set(e.id,e)}return!0}if(e instanceof xe){var u=l;return l=e,n(),l=u,!0}}t.transform(d)})),xe.DEFMETHOD("hoist_declarations",(function(e){var t=this;if(e.has_directive("use asm"))return t;if(!Array.isArray(t.body))return t;var n=e.option("hoist_funs"),i=e.option("hoist_vars");if(n||i){var r=[],o=[],a=new Map,s=0,u=0;yn(t,e=>e instanceof xe&&e!==t||(e instanceof ut?(++u,!0):void 0)),i=i&&u>1;var c=new Fn((function(u){if(u!==t){if(u instanceof me)return r.push(u),p(ve,u);if(n&&u instanceof Be&&!(c.parent()instanceof dt)&&c.parent()===t)return o.push(u),p(ve,u);if(i&&u instanceof ut){u.definitions.forEach((function(e){e.name instanceof Ke||(a.set(e.name.name,e),++s)}));var l=u.to_assignments(e),f=c.parent();if(f instanceof Me&&f.init===u){if(null==l){var _=u.definitions[0].name;return p(rn,_,_)}return l}return f instanceof Fe&&f.init===u?l:l?p(he,u,{body:l}):p(ve,u)}if(u instanceof xe)return u}}));if(t=t.transform(c),s>0){var l=[];const e=t instanceof Ie,n=e?t.args_as_names():null;if(a.forEach((t,i)=>{e&&n.some(e=>e.name===t.name.name)?a.delete(i):((t=t.clone()).value=null,l.push(t),a.set(i,t))}),l.length>0){for(var f=0;f<t.body.length;){if(t.body[f]instanceof he){var _,d,h=t.body[f].body;if(h instanceof Ct&&"="==h.operator&&(_=h.left)instanceof Bt&&a.has(_.name)){if((E=a.get(_.name)).value)break;E.value=h.right,m(l,E),l.push(E),t.body.splice(f,1);continue}if(h instanceof Et&&(d=h.expressions[0])instanceof Ct&&"="==d.operator&&(_=d.left)instanceof Bt&&a.has(_.name)){var E;if((E=a.get(_.name)).value)break;E.value=d.right,m(l,E),l.push(E),t.body[f].body=mi(h,h.expressions.slice(1));continue}}if(t.body[f]instanceof ve)t.body.splice(f,1);else{if(!(t.body[f]instanceof Se))break;var g=[f,1].concat(t.body[f].body);t.body.splice.apply(t.body,g)}}l=p(ut,t,{definitions:l}),o.push(l)}}t.body=r.concat(o,t.body)}return t})),xe.DEFMETHOD("make_var_name",(function(e){for(var t=this.var_names(),n=e=e.replace(/(?:^[^a-z_$]|[^a-z0-9_$])/gi,"_"),i=0;t.has(n);i++)n=e+"$"+i;return this.add_var_name(n),n})),xe.DEFMETHOD("hoist_properties",(function(e){var t=this;if(!e.option("hoist_props")||e.has_directive("use asm"))return t;var n=t instanceof Ne&&e.top_retain||s,i=new Map,r=new Fn((function(o,a){if(o instanceof st&&r.parent()instanceof dt)return o;if(o instanceof ft){const r=o.name;let u,c;if(r.scope===t&&1!=(u=r.definition()).escaped&&!u.assignments&&!u.direct_access&&!u.single_use&&!e.exposed(u)&&!n(u)&&(c=r.fixed_value())===o.value&&c instanceof Mt&&c.properties.every(e=>"string"==typeof e.key)){a(o,this);const e=new Map,t=[];return c.properties.forEach((function(n){t.push(p(ft,o,{name:s(r,n.key,e),value:n.value}))})),i.set(u.id,e),f.splice(t)}}else if(o instanceof gt&&o.expression instanceof rn){const e=i.get(o.expression.definition().id);if(e){const t=e.get(String(wi(o.property))),n=p(rn,o,{name:t.name,scope:o.expression.scope,thedef:t});return n.reference({}),n}}function s(e,n,i){const r=p(e.CTOR,e,{name:t.make_var_name(e.name+"_"+n),scope:t}),o=t.def_variable(r);return i.set(String(n),o),t.enclosed.push(o),r}}));return t.transform(r)})),function(e){function t(e,t,n){var i=e.length;if(!i)return null;for(var r=[],o=!1,a=0;a<i;a++){var s=e[a].drop_side_effect_free(t,n);o|=s!==e[a],s&&(r.push(s),n=!1)}return o?r.length?r:null:e}e(pe,c),e(ln,l),e(un,l),e(mt,(function(e,n){if(!this.is_expr_pure(e)){if(this.expression.is_call_pure(e)){var i=this.args.slice();return i.unshift(this.expression.expression),(i=t(i,e,n))&&mi(this,i)}if(li(this.expression)&&(!this.expression.name||!this.expression.name.definition().references.length)){var r=this.clone();return r.expression.process_expression(!1,e),r}return this}T(this,Mn)&&e.warn("Dropping __PURE__ call [{file}:{line},{col}]",this.start);var o=t(this.args,e,n);return o&&mi(this,o)})),e(Le,l),e(Pe,l),e(Ve,l),e(It,(function(e){const t=[],n=this.extends&&this.extends.drop_side_effect_free(e);n&&t.push(n);for(const n of this.properties){const i=n.drop_side_effect_free(e);i&&t.push(i)}return t.length?mi(this,t):null})),e(yt,(function(e,t){var n=this.right.drop_side_effect_free(e);if(!n)return this.left.drop_side_effect_free(e,t);if(Ni.has(this.operator)){if(n===this.right)return this;var i=this.clone();return i.right=n,i}var r=this.left.drop_side_effect_free(e,t);return r?mi(this,[r,n]):this.right.drop_side_effect_free(e,t)})),e(Ct,(function(e){var t=this.left;if(t.has_side_effects(e)||e.has_directive("use strict")&&t instanceof gt&&t.expression.is_constant())return this;for(ri(this,32);t instanceof gt;)t=t.expression;return t.is_constant_expression(e.find_parent(xe))?this.right.drop_side_effect_free(e):this})),e(bt,(function(e){var t=this.consequent.drop_side_effect_free(e),n=this.alternative.drop_side_effect_free(e);if(t===this.consequent&&n===this.alternative)return this;if(!t)return n?p(yt,this,{operator:"||",left:this.condition,right:n}):this.condition.drop_side_effect_free(e);if(!n)return p(yt,this,{operator:"&&",left:this.condition,right:t});var i=this.clone();return i.consequent=t,i.alternative=n,i})),e(vt,(function(e,t){if(ki.has(this.operator))return this.expression.has_side_effects(e)?oi(this,32):ri(this,32),this;if("typeof"==this.operator&&this.expression instanceof rn)return null;var n=this.expression.drop_side_effect_free(e,t);return t&&n&&Ti(n)?n===this.expression&&"!"==this.operator?this:n.negate(e,t):n})),e(rn,(function(e){return this.is_declared(e)||Xi.has(this.name)?null:this})),e(Mt,(function(e,n){var i=t(this.properties,e,n);return i&&mi(this,i)})),e(Rt,(function(e,t){const n=this instanceof wt&&this.key instanceof pe&&this.key.drop_side_effect_free(e,t),i=this.value.drop_side_effect_free(e,t);return n&&i?mi(this,[n,i]):n||i})),e(Lt,(function(e){const t=this.computed_key()&&this.key.drop_side_effect_free(e),n=this.static&&this.value&&this.value.drop_side_effect_free(e);return t&&n?mi(this,[t,n]):t||n||null})),e(kt,(function(){return this.computed_key()?this.key:null})),e(Nt,(function(){return this.computed_key()?this.key:null})),e(xt,(function(){return this.computed_key()?this.key:null})),e(Ft,(function(e,n){var i=t(this.elements,e,n);return i&&mi(this,i)})),e(Dt,(function(e,t){return this.expression.may_throw_on_access(e)?this:this.expression.drop_side_effect_free(e,t)})),e(St,(function(e,t){if(this.expression.may_throw_on_access(e))return this;var n=this.expression.drop_side_effect_free(e,t);if(!n)return this.property.drop_side_effect_free(e,t);var i=this.property.drop_side_effect_free(e);return i?mi(this,[n,i]):n})),e(Et,(function(e){var t=this.tail_node(),n=t.drop_side_effect_free(e);if(n===t)return this;var i=this.expressions.slice(0,-1);return n&&i.push(n),i.length?mi(this,i):p(pn,this,{value:0})})),e(ke,(function(e,t){return this.expression.drop_side_effect_free(e,t)})),e(He,l),e(Ge,(function(e){var n=t(this.segments,e,In);return n&&mi(this,n)}))}((function(e,t){e.DEFMETHOD("drop_side_effect_free",t)})),si(he,(function(e,t){if(t.option("side_effects")){var n=e.body,i=n.drop_side_effect_free(t,!0);if(!i)return t.warn("Dropping side-effect-free statement [{file}:{line},{col}]",e.start),p(ve,e);if(i!==n)return p(he,e,{body:i})}return e})),si(Oe,(function(e,t){return t.option("loops")?p(Fe,e,e).optimize(t):e})),si(Ce,(function(e,t){if(!t.option("loops"))return e;var n=e.condition.tail_node().evaluate(t);if(!(n instanceof pe)){if(n)return p(Fe,e,{body:p(Se,e.body,{body:[e.body,p(he,e.condition,{body:e.condition})]})}).optimize(t);if(!$i(e,t.parent()))return p(Se,e.body,{body:[e.body,p(he,e.condition,{body:e.condition})]}).optimize(t)}return e})),si(Fe,(function(e,t){if(!t.option("loops"))return e;if(t.option("side_effects")&&e.init&&(e.init=e.init.drop_side_effect_free(t)),e.condition){var n=e.condition.evaluate(t);if(!(n instanceof pe))if(n)e.condition=null;else if(!t.option("dead_code")){var i=e.condition;e.condition=hi(n,e.condition),e.condition=Li(e.condition.transform(t),i)}if(t.option("dead_code")&&(n instanceof pe&&(n=e.condition.tail_node().evaluate(t)),!n)){var r=[];return Ri(t,e.body,r),e.init instanceof _e?r.push(e.init):e.init&&r.push(p(he,e.init,{body:e.init})),r.push(p(he,e.condition,{body:e.condition})),p(Se,e,{body:r}).optimize(t)}}return function e(t,n){var i=t.body instanceof Se?t.body.body[0]:t.body;if(n.option("dead_code")&&o(i)){var r=[];return t.init instanceof _e?r.push(t.init):t.init&&r.push(p(he,t.init,{body:t.init})),t.condition&&r.push(p(he,t.condition,{body:t.condition})),Ri(n,t.body,r),p(Se,t,{body:r})}return i instanceof Qe&&(o(i.body)?(t.condition?t.condition=p(yt,t.condition,{left:t.condition,operator:"&&",right:i.condition.negate(n)}):t.condition=i.condition.negate(n),a(i.alternative)):o(i.alternative)&&(t.condition?t.condition=p(yt,t.condition,{left:t.condition,operator:"&&",right:i.condition}):t.condition=i.condition,a(i.body))),t;function o(e){return e instanceof $e&&n.loopcontrol_target(e)===n.self()}function a(i){i=Di(i),t.body instanceof Se?(t.body=t.body.clone(),t.body.body=i.concat(t.body.body.slice(1)),t.body=t.body.transform(n)):t.body=p(Se,t.body,{body:i}).transform(n),t=e(t,n)}}(e,t)})),si(Qe,(function(e,t){if(Si(e.alternative)&&(e.alternative=null),!t.option("conditionals"))return e;var n=e.condition.evaluate(t);if(!(t.option("dead_code")||n instanceof pe)){var i=e.condition;e.condition=hi(n,i),e.condition=Li(e.condition.transform(t),i)}if(t.option("dead_code")){if(n instanceof pe&&(n=e.condition.tail_node().evaluate(t)),!n){t.warn("Condition always false [{file}:{line},{col}]",e.condition.start);var r=[];return Ri(t,e.body,r),r.push(p(he,e.condition,{body:e.condition})),e.alternative&&r.push(e.alternative),p(Se,e,{body:r}).optimize(t)}if(!(n instanceof pe))return t.warn("Condition always true [{file}:{line},{col}]",e.condition.start),(r=[]).push(p(he,e.condition,{body:e.condition})),r.push(e.body),e.alternative&&Ri(t,e.alternative,r),p(Se,e,{body:r}).optimize(t)}var o=e.condition.negate(t),a=e.condition.size(),s=o.size(),u=s<a;if(e.alternative&&u){u=!1,e.condition=o;var c=e.body;e.body=e.alternative||p(ve,e),e.alternative=c}if(Si(e.body)&&Si(e.alternative))return p(he,e.condition,{body:e.condition.clone()}).optimize(t);if(e.body instanceof he&&e.alternative instanceof he)return p(he,e,{body:p(bt,e,{condition:e.condition,consequent:e.body.body,alternative:e.alternative.body})}).optimize(t);if(Si(e.alternative)&&e.body instanceof he)return a===s&&!u&&e.condition instanceof yt&&"||"==e.condition.operator&&(u=!0),u?p(he,e,{body:p(yt,e,{operator:"||",left:o,right:e.body.body})}).optimize(t):p(he,e,{body:p(yt,e,{operator:"&&",left:e.condition,right:e.body.body})}).optimize(t);if(e.body instanceof ve&&e.alternative instanceof he)return p(he,e,{body:p(yt,e,{operator:"||",left:e.condition,right:e.alternative.body})}).optimize(t);if(e.body instanceof ze&&e.alternative instanceof ze&&e.body.TYPE==e.alternative.TYPE)return p(e.body.CTOR,e,{value:p(bt,e,{condition:e.condition,consequent:e.body.value||p(gn,e.body),alternative:e.alternative.value||p(gn,e.alternative)}).transform(t)}).optimize(t);if(e.body instanceof Qe&&!e.body.alternative&&!e.alternative&&(e=p(Qe,e,{condition:p(yt,e.condition,{operator:"&&",left:e.condition,right:e.body.condition}),body:e.body.body,alternative:null})),zi(e.body)&&e.alternative){var l=e.alternative;return e.alternative=null,p(Se,e,{body:[e,l]}).optimize(t)}if(zi(e.alternative)){r=e.body;return e.body=e.alternative,e.condition=u?o:e.condition.negate(t),e.alternative=null,p(Se,e,{body:[e,r]}).optimize(t)}return e})),si(et,(function(e,t){if(!t.option("switches"))return e;var n,i=e.expression.evaluate(t);if(!(i instanceof pe)){var r=e.expression;e.expression=hi(i,r),e.expression=Li(e.expression.transform(t),r)}if(!t.option("dead_code"))return e;i instanceof pe&&(i=e.expression.tail_node().evaluate(t));for(var o,a,s=[],u=[],c=0,l=e.body.length;c<l&&!a;c++){if((n=e.body[c])instanceof nt)o?D(n,u[u.length-1]):o=n;else if(!(i instanceof pe)){if(!((E=n.expression.evaluate(t))instanceof pe)&&E!==i){D(n,u[u.length-1]);continue}if(E instanceof pe&&(E=n.expression.tail_node().evaluate(t)),E===i&&(a=n,o)){var f=u.indexOf(o);u.splice(f,1),D(o,u[f-1]),o=null}}if(zi(n)){var _=u[u.length-1];zi(_)&&_.body.length==n.body.length&&p(Se,_,_).equivalent_to(p(Se,n,n))&&(_.body=[])}u.push(n)}for(;c<l;)D(e.body[c++],u[u.length-1]);for(u.length>0&&(u[0].body=s.concat(u[0].body)),e.body=u;n=u[u.length-1];){var d=n.body[n.body.length-1];if(d instanceof $e&&t.loopcontrol_target(d)===e&&n.body.pop(),n.body.length||n instanceof it&&(o||n.expression.has_side_effects(t)))break;u.pop()===o&&(o=null)}if(0==u.length)return p(Se,e,{body:s.concat(p(he,e.expression,{body:e.expression}))}).optimize(t);if(1==u.length&&(u[0]===a||u[0]===o)){var m=!1,h=new On((function(t){if(m||t instanceof Ie||t instanceof he)return!0;t instanceof $e&&h.loopcontrol_target(t)===e&&(m=!0)}));if(e.walk(h),!m){var E,g=u[0].body.slice();return(E=u[0].expression)&&g.unshift(p(he,E,{body:E})),g.unshift(p(he,e.expression,{body:e.expression})),p(Se,e,{body:g}).optimize(t)}}return e;function D(e,n){n&&!zi(n)?n.body=n.body.concat(e.body):Ri(t,e,s)}})),si(rt,(function(e,t){if(Mi(e.body,t),e.bcatch&&e.bfinally&&e.bfinally.body.every(Si)&&(e.bfinally=null),t.option("dead_code")&&e.body.every(Si)){var n=[];return e.bcatch&&Ri(t,e.bcatch,n),e.bfinally&&n.push(...e.bfinally.body),p(Se,e,{body:n}).optimize(t)}return e})),st.DEFMETHOD("remove_initializers",(function(){var e=[];this.definitions.forEach((function(t){t.name instanceof Ut?(t.value=null,e.push(t)):yn(t.name,n=>{n instanceof Ut&&e.push(p(ft,t,{name:n,value:null}))})})),this.definitions=e})),st.DEFMETHOD("to_assignments",(function(e){var t=e.option("reduce_vars"),n=this.definitions.reduce((function(e,n){if(!n.value||n.name instanceof Ke){if(n.value){var i=p(ft,n,{name:n.name,value:n.value}),r=p(ut,n,{definitions:[i]});e.push(r)}}else{var o=p(rn,n.name,n.name);e.push(p(Ct,n,{operator:"=",left:o,right:n.value})),t&&(o.definition().fixed=!1)}return(n=n.name.definition()).eliminated++,n.replaced--,e}),[]);return 0==n.length?null:mi(this,n)})),si(st,(function(e){return 0==e.definitions.length?p(ve,e):e})),si(_t,(function(e){return e})),si(mt,(function(e,t){var n=e.expression,i=n;sr(e,t,e.args);var r=e.args.every(e=>!(e instanceof ke));if(t.option("reduce_vars")&&i instanceof rn&&!T(e,wn)){const e=i.fixed_value();ji(e,t)||(i=e)}var o=i instanceof Ie;if(t.option("unused")&&r&&o&&!i.uses_arguments&&!i.pinned()){for(var a=0,s=0,u=0,c=e.args.length;u<c;u++){if(i.argnames[u]instanceof ke){if(ii(i.argnames[u].expression,1))for(;u<c;){(D=e.args[u++].drop_side_effect_free(t))&&(e.args[a++]=D)}else for(;u<c;)e.args[a++]=e.args[u++];s=a;break}var l=u>=i.argnames.length;if(l||ii(i.argnames[u],1)){if(D=e.args[u].drop_side_effect_free(t))e.args[a++]=D;else if(!l){e.args[a++]=p(pn,e.args[u],{value:0});continue}}else e.args[a++]=e.args[u];s=a}e.args.length=s}if(t.option("unsafe"))if(yi(n))switch(n.name){case"Array":if(1!=e.args.length)return p(Ft,e,{elements:e.args}).optimize(t);if(e.args[0]instanceof pn&&e.args[0].value<=11){const t=[];for(let n=0;n<e.args[0].value;n++)t.push(new Dn);return new Ft({elements:t})}break;case"Object":if(0==e.args.length)return p(Mt,e,{properties:[]});break;case"String":if(0==e.args.length)return p(fn,e,{value:""});if(e.args.length<=1)return p(yt,e,{left:e.args[0],operator:"+",right:p(fn,e,{value:""})}).optimize(t);break;case"Number":if(0==e.args.length)return p(pn,e,{value:0});if(1==e.args.length&&t.option("unsafe_math"))return p(At,e,{expression:e.args[0],operator:"+"}).optimize(t);break;case"Symbol":1==e.args.length&&e.args[0]instanceof fn&&t.option("unsafe_symbols")&&(e.args.length=0);break;case"Boolean":if(0==e.args.length)return p(An,e);if(1==e.args.length)return p(At,e,{expression:p(At,e,{expression:e.args[0],operator:"!"}),operator:"!"}).optimize(t);break;case"RegExp":var f=[];if(e.args.length>=1&&e.args.length<=2&&e.args.every(e=>{var n=e.evaluate(t);return f.push(n),e!==n})){let[n,i]=f;n=A(new RegExp(n).source);const r=p(dn,e,{value:{source:n,flags:i}});if(r._eval(t)!==r)return r;t.warn("Error converting {expr} [{file}:{line},{col}]",{expr:e.print_to_string(),file:e.start.file,line:e.start.line,col:e.start.col})}}else if(n instanceof Dt)switch(n.property){case"toString":if(0==e.args.length&&!n.expression.may_throw_on_access(t))return p(yt,e,{left:p(fn,e,{value:""}),operator:"+",right:n.expression}).optimize(t);break;case"join":if(n.expression instanceof Ft)e:{var _;if(!(e.args.length>0&&(_=e.args[0].evaluate(t))===e.args[0])){var d,m=[],h=[];for(u=0,c=n.expression.elements.length;u<c;u++){var E=n.expression.elements[u];if(E instanceof ke)break e;var g=E.evaluate(t);g!==E?h.push(g):(h.length>0&&(m.push(p(fn,e,{value:h.join(_)})),h.length=0),m.push(E))}return h.length>0&&m.push(p(fn,e,{value:h.join(_)})),0==m.length?p(fn,e,{value:""}):1==m.length?m[0].is_string(t)?m[0]:p(yt,m[0],{operator:"+",left:p(fn,e,{value:""}),right:m[0]}):""==_?(d=m[0].is_string(t)||m[1].is_string(t)?m.shift():p(fn,e,{value:""}),m.reduce((function(e,t){return p(yt,t,{operator:"+",left:e,right:t})}),d).optimize(t)):((D=e.clone()).expression=D.expression.clone(),D.expression.expression=D.expression.expression.clone(),D.expression.expression.elements=m,Vi(t,e,D));var D}}break;case"charAt":if(n.expression.is_string(t)){var S=e.args[0],v=S?S.evaluate(t):0;if(v!==S)return p(St,n,{expression:n.expression,property:hi(0|v,S||n)}).optimize(t)}break;case"apply":if(2==e.args.length&&e.args[1]instanceof Ft)return(L=e.args[1].elements.slice()).unshift(e.args[0]),p(mt,e,{expression:p(Dt,n,{expression:n.expression,property:"call"}),args:L}).optimize(t);break;case"call":var y=n.expression;if(y instanceof rn&&(y=y.fixed_value()),y instanceof Ie&&!y.contains_this())return(e.args.length?mi(this,[e.args[0],p(mt,e,{expression:n.expression,args:e.args.slice(1)})]):p(mt,e,{expression:n.expression,args:[]})).optimize(t)}if(t.option("unsafe_Function")&&yi(n)&&"Function"==n.name){if(0==e.args.length)return p(Pe,e,{argnames:[],body:[]}).optimize(t);if(e.args.every(e=>e instanceof fn))try{var b=ce(M="n(function("+e.args.slice(0,-1).map((function(e){return e.value})).join(",")+"){"+e.args[e.args.length-1].value+"})"),C={ie8:t.option("ie8")};b.figure_out_scope(C);var O,F=new ai(t.options);(b=b.transform(F)).figure_out_scope(C),qn.reset(),b.compute_char_frequency(C),b.mangle_names(C),yn(b,e=>{if(li(e))return O=e,Cn});var M=Bn();return Se.prototype._codegen.call(O,O,M),e.args=[p(fn,e,{value:O.argnames.map((function(e){return e.print_to_string()})).join(",")}),p(fn,e.args[e.args.length-1],{value:M.get().replace(/^{|}$/g,"")})],e}catch(n){if(!(n instanceof Q))throw n;t.warn("Error parsing code passed to new Function [{file}:{line},{col}]",e.args[e.args.length-1].start),t.warn(n.toString())}}var R=o&&i.body[0],w=o&&!i.is_generator&&!i.async,x=w&&t.option("inline")&&!e.is_expr_pure(t);if(x&&R instanceof We){let n=R.value;if(!n||n.is_constant_expression()){n=n?n.clone(!0):p(gn,e);const i=e.args.concat(n);return mi(e,i).optimize(t)}if(1===i.argnames.length&&i.argnames[0]instanceof Wt&&e.args.length<2&&n instanceof rn&&n.name===i.argnames[0].name){let n;return e.args[0]instanceof gt&&(n=t.parent())instanceof mt&&n.expression===e?mi(e,[p(pn,e,{value:0}),e.args[0].optimize(t)]):(e.args[0]||p(gn)).optimize(t)}}if(x){var N,k,I=-1;let o,a,s;if(r&&!i.uses_arguments&&!i.pinned()&&!(t.parent()instanceof It)&&!(i.name&&i instanceof Pe)&&(a=function(e){var n=i.body,r=n.length;if(t.option("inline")<3)return 1==r&&V(e);e=null;for(var o=0;o<r;o++){var a=n[o];if(a instanceof ut){if(e&&!a.definitions.every(e=>!e.value))return!1}else{if(e)return!1;a instanceof ve||(e=a)}}return V(e)}(R))&&(n===i||T(e,Rn)||t.option("unused")&&1==(o=n.definition()).references.length&&!Ji(t,o)&&i.is_constant_expression(n.scope))&&!T(e,Mn|wn)&&!i.contains_this()&&function(){var n=new Set;do{if((N=t.parent(++I)).is_block_scope()&&N.block_scope&&N.block_scope.variables.forEach((function(e){n.add(e.name)})),N instanceof ot)N.argname&&n.add(N.argname.name);else if(N instanceof ye)k=[];else if(N instanceof rn&&N.fixed_value()instanceof xe)return!1}while(!(N instanceof xe));var r=!(N instanceof Ne)||t.toplevel.vars,o=t.option("inline");return!!function(e,t){for(var n=i.body.length,r=0;r<n;r++){var o=i.body[r];if(o instanceof ut){if(!t)return!1;for(var a=o.definitions.length;--a>=0;){var s=o.definitions[a].name;if(s instanceof Ke||e.has(s.name)||Oi.has(s.name)||N.var_names().has(s.name))return!1;k&&k.push(s.definition())}}}return!0}(n,o>=3&&r)&&(!!function(e,t){for(var n=0,r=i.argnames.length;n<r;n++){var o=i.argnames[n];if(o instanceof Ot){if(ii(o.left,1))continue;return!1}if(o instanceof Ke)return!1;if(o instanceof ke){if(ii(o.expression,1))continue;return!1}if(!ii(o,1)){if(!t||e.has(o.name)||Oi.has(o.name)||N.var_names().has(o.name))return!1;k&&k.push(o.definition())}}return!0}(n,o>=2&&r)&&(!!function(){var t=new Set;const n=e=>{if(e instanceof xe){var n=new Set;return e.enclosed.forEach((function(e){n.add(e.name)})),e.variables.forEach((function(e){n.delete(e)})),n.forEach((function(e){t.add(e)})),!0}};for(let t=0;t<e.args.length;t++)yn(e.args[t],n);if(0==t.size)return!0;for(let e=0,n=i.argnames.length;e<n;e++){var r=i.argnames[e];if(!(r instanceof Ot&&ii(r.left,1))&&(!(r instanceof ke&&ii(r.expression,1))&&!ii(r,1)&&t.has(r.name)))return!1}for(let e=0,n=i.body.length;e<n;e++){var o=i.body[e];if(o instanceof ut)for(var a=o.definitions.length;--a>=0;){var s=o.definitions[a].name;if(s instanceof Ke||t.has(s.name))return!1}}return!0}()&&(!k||0==k.length||!tr(i,k))))}()&&(s=_i(t))&&!Qi(s,i)&&!function(){let e,n=0;for(;e=t.parent(n++);){if(e instanceof Ot)return!0;if(e instanceof De)break}return!1}()&&!(N instanceof It))return ri(i,256),s.add_child_scope(i),mi(e,function(n){var r=[],o=[];if(function(t,n){for(var r=i.argnames.length,o=e.args.length;--o>=r;)n.push(e.args[o]);for(o=r;--o>=0;){var a=i.argnames[o],s=e.args[o];if(ii(a,1)||!a.name||N.var_names().has(a.name))s&&n.push(s);else{var u=p(Gt,a,a);a.definition().orig.push(u),!s&&k&&(s=p(gn,e)),B(t,n,u,s)}}t.reverse(),n.reverse()}(r,o),function(e,t){for(var n=t.length,r=0,o=i.body.length;r<o;r++){var a=i.body[r];if(a instanceof ut)for(var s=0,u=a.definitions.length;s<u;s++){var c=a.definitions[s],l=c.name;if(B(e,t,l,c.value),k&&i.argnames.every(e=>e.name!=l.name)){var f=i.variables.get(l.name),_=p(rn,l,l);f.references.push(_),t.splice(n++,0,p(Ct,c,{operator:"=",left:_,right:p(gn,l)}))}}}}(r,o),o.push(n),r.length){const e=N.body.indexOf(t.parent(I-1))+1;N.body.splice(e,0,p(ut,i,{definitions:r}))}return o.map(e=>e.clone(!0))}(a)).optimize(t)}if(w&&t.option("side_effects")&&i.body.every(Si)){var L=e.args.concat(p(gn,e));return mi(e,L).optimize(t)}if(t.option("negate_iife")&&t.parent()instanceof he&&Ti(e))return e.negate(t,!0);var P=e.evaluate(t);return P!==e?(P=hi(P,e).optimize(t),Vi(t,P,e)):e;function V(t){return t?t instanceof We?t.value?t.value.clone(!0):p(gn,e):t instanceof he?p(At,t,{operator:"void",expression:t.body.clone(!0)}):void 0:p(gn,e)}function B(t,n,i,r){var o=i.definition();N.variables.set(i.name,o),N.enclosed.push(o),N.var_names().has(i.name)||(N.add_var_name(i.name),t.push(p(ft,i,{name:i,value:null})));var a=p(rn,i,i);o.references.push(a),r&&n.push(p(Ct,e,{operator:"=",left:a,right:r.clone()}))}})),si(ht,(function(e,t){return t.option("unsafe")&&yi(e.expression)&&["Object","RegExp","Function","Error","Array"].includes(e.expression.name)?p(mt,e,e).transform(t):e})),si(Et,(function(e,t){if(!t.option("side_effects"))return e;var n,i,r=[];n=In(t),i=e.expressions.length-1,e.expressions.forEach((function(e,o){o<i&&(e=e.drop_side_effect_free(t,n)),e&&(gi(r,e),n=!1)}));var o=r.length-1;return function(){for(;o>0&&xi(r[o],t);)o--;o<r.length-1&&(r[o]=p(At,e,{operator:"void",expression:r[o]}),r.length=o+1)}(),0==o?((e=Ei(t.parent(),t.self(),r[0]))instanceof Et||(e=e.optimize(t)),e):(e.expressions=r,e)})),vt.DEFMETHOD("lift_sequences",(function(e){if(e.option("sequences")&&this.expression instanceof Et){var t=this.expression.expressions.slice(),n=this.clone();return n.expression=t.pop(),t.push(n),mi(this,t).optimize(e)}return this})),si(Tt,(function(e,t){return e.lift_sequences(t)})),si(At,(function(e,t){var n=e.expression;if("delete"==e.operator&&!(n instanceof rn||n instanceof gt||Fi(n))){if(n instanceof Et){const i=n.expressions.slice();return i.push(p(Tn,e)),mi(e,i).optimize(t)}return mi(e,[n,p(Tn,e)]).optimize(t)}var i=e.lift_sequences(t);if(i!==e)return i;if(t.option("side_effects")&&"void"==e.operator)return(n=n.drop_side_effect_free(t))?(e.expression=n,e):p(gn,e).optimize(t);if(t.in_boolean_context())switch(e.operator){case"!":if(n instanceof At&&"!"==n.operator)return n.expression;n instanceof yt&&(e=Vi(t,e,n.negate(t,In(t))));break;case"typeof":return t.warn("Boolean expression always true [{file}:{line},{col}]",e.start),(n instanceof rn?p(Tn,e):mi(e,[n,p(Tn,e)])).optimize(t)}if("-"==e.operator&&n instanceof Sn&&(n=n.transform(t)),n instanceof yt&&("+"==e.operator||"-"==e.operator)&&("*"==n.operator||"/"==n.operator||"%"==n.operator))return p(yt,e,{operator:n.operator,left:p(At,n.left,{operator:e.operator,expression:n.left}),right:n.right});if("-"!=e.operator||!(n instanceof pn||n instanceof Sn||n instanceof _n)){var r=e.evaluate(t);if(r!==e)return Vi(t,r=hi(r,e).optimize(t),e)}return e})),yt.DEFMETHOD("lift_sequences",(function(e){if(e.option("sequences")){if(this.left instanceof Et){var t=this.left.expressions.slice();return(n=this.clone()).left=t.pop(),t.push(n),mi(this,t).optimize(e)}if(this.right instanceof Et&&!this.left.has_side_effects(e)){for(var n,i="="==this.operator&&this.left instanceof rn,r=(t=this.right.expressions).length-1,o=0;o<r&&(i||!t[o].has_side_effects(e));o++);if(o==r)return t=t.slice(),(n=this.clone()).right=t.pop(),t.push(n),mi(this,t).optimize(e);if(o>0)return(n=this.clone()).right=mi(this.right,t.slice(o)),(t=t.slice(0,o)).push(n),mi(this,t).optimize(e)}}return this}));var Zi=E("== === != !== * & | ^");function Ji(e,t){for(var n,i=0;n=e.parent(i);i++)if(n instanceof Ie||n instanceof It){var r=n.name;if(r&&r.definition()===t)break}return n}function Qi(e,t){for(const n of t.enclosed){if(t.variables.has(n.name))continue;const i=e.find_variable(n.name);if(i){if(i===n)continue;return!0}}return!1}function er(e,t){return e instanceof rn||e.TYPE===t.TYPE}function tr(e,t){const n=e=>{if(e instanceof rn&&i(e.definition(),t))return Cn};return bn(e,(t,i)=>{if(t instanceof xe&&t!==e){var r=i.parent();if(r instanceof mt&&r.expression===t)return;return!yn(t,n)||Cn}})}si(yt,(function(e,t){function n(){return e.left.is_constant()||e.right.is_constant()||!e.left.has_side_effects(t)&&!e.right.has_side_effects(t)}function i(t){if(n()){t&&(e.operator=t);var i=e.left;e.left=e.right,e.right=i}}if(Zi.has(e.operator)&&e.right.is_constant()&&!e.left.is_constant()&&(e.left instanceof yt&&se[e.left.operator]>=se[e.operator]||i()),e=e.lift_sequences(t),t.option("comparisons"))switch(e.operator){case"===":case"!==":var r=!0;(e.left.is_string(t)&&e.right.is_string(t)||e.left.is_number(t)&&e.right.is_number(t)||e.left.is_boolean()&&e.right.is_boolean()||e.left.equivalent_to(e.right))&&(e.operator=e.operator.substr(0,2));case"==":case"!=":if(!r&&xi(e.left,t))e.left=p(hn,e.left);else if(t.option("typeofs")&&e.left instanceof fn&&"undefined"==e.left.value&&e.right instanceof At&&"typeof"==e.right.operator){var o=e.right.expression;(o instanceof rn?!o.is_declared(t):o instanceof gt&&t.option("ie8"))||(e.right=o,e.left=p(gn,e.left).optimize(t),2==e.operator.length&&(e.operator+="="))}else if(e.left instanceof rn&&e.right instanceof rn&&e.left.definition()===e.right.definition()&&((u=e.left.fixed_value())instanceof Ft||u instanceof Ie||u instanceof Mt||u instanceof It))return p("="==e.operator[0]?Tn:An,e);break;case"&&":case"||":var a=e.left;if(a.operator==e.operator&&(a=a.right),a instanceof yt&&a.operator==("&&"==e.operator?"!==":"===")&&e.right instanceof yt&&a.operator==e.right.operator&&(xi(a.left,t)&&e.right.left instanceof hn||a.left instanceof hn&&xi(e.right.left,t))&&!a.right.has_side_effects(t)&&a.right.equivalent_to(e.right.right)){var s=p(yt,e,{operator:a.operator.slice(0,-1),left:p(hn,e),right:a.right});return a!==e.left&&(s=p(yt,e,{operator:e.operator,left:e.left.left,right:s})),s}}var u;if("+"==e.operator&&t.in_boolean_context()){var c=e.left.evaluate(t),l=e.right.evaluate(t);if(c&&"string"==typeof c)return t.warn("+ in boolean context always true [{file}:{line},{col}]",e.start),mi(e,[e.right,p(Tn,e)]).optimize(t);if(l&&"string"==typeof l)return t.warn("+ in boolean context always true [{file}:{line},{col}]",e.start),mi(e,[e.left,p(Tn,e)]).optimize(t)}if(t.option("comparisons")&&e.is_boolean()){if(!(t.parent()instanceof yt)||t.parent()instanceof Ct){var f=p(At,e,{operator:"!",expression:e.negate(t,In(t))});e=Vi(t,e,f)}if(t.option("unsafe_comps"))switch(e.operator){case"<":i(">");break;case"<=":i(">=")}}if("+"==e.operator){if(e.right instanceof fn&&""==e.right.getValue()&&e.left.is_string(t))return e.left;if(e.left instanceof fn&&""==e.left.getValue()&&e.right.is_string(t))return e.right;if(e.left instanceof yt&&"+"==e.left.operator&&e.left.left instanceof fn&&""==e.left.left.getValue()&&e.right.is_string(t))return e.left=e.left.right,e.transform(t)}if(t.option("evaluate")){switch(e.operator){case"&&":if(!(c=!!ii(e.left,2)||!ii(e.left,4)&&e.left.evaluate(t)))return t.warn("Condition left of && always false [{file}:{line},{col}]",e.start),Ei(t.parent(),t.self(),e.left).optimize(t);if(!(c instanceof pe))return t.warn("Condition left of && always true [{file}:{line},{col}]",e.start),mi(e,[e.left,e.right]).optimize(t);if(l=e.right.evaluate(t)){if(!(l instanceof pe)){if("&&"==(_=t.parent()).operator&&_.left===t.self()||t.in_boolean_context())return t.warn("Dropping side-effect-free && [{file}:{line},{col}]",e.start),e.left.optimize(t)}}else{if(t.in_boolean_context())return t.warn("Boolean && always false [{file}:{line},{col}]",e.start),mi(e,[e.left,p(An,e)]).optimize(t);ri(e,4)}if("||"==e.left.operator)if(!(d=e.left.right.evaluate(t)))return p(bt,e,{condition:e.left.left,consequent:e.right,alternative:e.left.right}).optimize(t);break;case"||":var _,d;if(!(c=!!ii(e.left,2)||!ii(e.left,4)&&e.left.evaluate(t)))return t.warn("Condition left of || always false [{file}:{line},{col}]",e.start),mi(e,[e.left,e.right]).optimize(t);if(!(c instanceof pe))return t.warn("Condition left of || always true [{file}:{line},{col}]",e.start),Ei(t.parent(),t.self(),e.left).optimize(t);if(l=e.right.evaluate(t)){if(!(l instanceof pe)){if(t.in_boolean_context())return t.warn("Boolean || always true [{file}:{line},{col}]",e.start),mi(e,[e.left,p(Tn,e)]).optimize(t);ri(e,2)}}else if("||"==(_=t.parent()).operator&&_.left===t.self()||t.in_boolean_context())return t.warn("Dropping side-effect-free || [{file}:{line},{col}]",e.start),e.left.optimize(t);if("&&"==e.left.operator)if((d=e.left.right.evaluate(t))&&!(d instanceof pe))return p(bt,e,{condition:e.left.left,consequent:e.left.right,alternative:e.right}).optimize(t);break;case"??":if(rr(e.left))return e.right;if(!((c=e.left.evaluate(t))instanceof pe))return null==c?e.right:e.left;if(t.in_boolean_context()){const n=e.right.evaluate(t);if(!(n instanceof pe||n))return e.left}}var m=!0;switch(e.operator){case"+":if(e.left instanceof ln&&e.right instanceof yt&&"+"==e.right.operator&&e.right.is_string(t)){var h=(g=p(yt,e,{operator:"+",left:e.left,right:e.right.left})).optimize(t);g!==h&&(e=p(yt,e,{operator:"+",left:h,right:e.right.right}))}if(e.right instanceof ln&&e.left instanceof yt&&"+"==e.left.operator&&e.left.is_string(t)){var E=(g=p(yt,e,{operator:"+",left:e.left.right,right:e.right})).optimize(t);g!==E&&(e=p(yt,e,{operator:"+",left:e.left.left,right:E}))}if(e.left instanceof yt&&"+"==e.left.operator&&e.left.is_string(t)&&e.right instanceof yt&&"+"==e.right.operator&&e.right.is_string(t)){var g,D=(g=p(yt,e,{operator:"+",left:e.left.right,right:e.right.left})).optimize(t);g!==D&&(e=p(yt,e,{operator:"+",left:p(yt,e.left,{operator:"+",left:e.left.left,right:D}),right:e.right.right}))}if(e.right instanceof At&&"-"==e.right.operator&&e.left.is_number(t)){e=p(yt,e,{operator:"-",left:e.left,right:e.right.expression});break}if(e.left instanceof At&&"-"==e.left.operator&&n()&&e.right.is_number(t)){e=p(yt,e,{operator:"-",left:e.right,right:e.left.expression});break}if(e.left instanceof Ge){h=e.left;if((E=e.right.evaluate(t))!=e.right)return h.segments[h.segments.length-1].value+=E.toString(),h}if(e.right instanceof Ge){E=e.right;if((h=e.left.evaluate(t))!=e.left)return E.segments[0].value=h.toString()+E.segments[0].value,E}if(e.left instanceof Ge&&e.right instanceof Ge){var S=(h=e.left).segments;E=e.right;S[S.length-1].value+=E.segments[0].value;for(var v=1;v<E.segments.length;v++)S.push(E.segments[v]);return h}case"*":m=t.option("unsafe_math");case"&":case"|":case"^":if(e.left.is_number(t)&&e.right.is_number(t)&&n()&&!(e.left instanceof yt&&e.left.operator!=e.operator&&se[e.left.operator]>=se[e.operator])){var A=p(yt,e,{operator:e.operator,left:e.right,right:e.left});e=e.right instanceof ln&&!(e.left instanceof ln)?Vi(t,A,e):Vi(t,e,A)}m&&e.is_number(t)&&(e.right instanceof yt&&e.right.operator==e.operator&&(e=p(yt,e,{operator:e.operator,left:p(yt,e.left,{operator:e.operator,left:e.left,right:e.right.left,start:e.left.start,end:e.right.left.end}),right:e.right.right})),e.right instanceof ln&&e.left instanceof yt&&e.left.operator==e.operator&&(e.left.left instanceof ln?e=p(yt,e,{operator:e.operator,left:p(yt,e.left,{operator:e.operator,left:e.left.left,right:e.right,start:e.left.left.start,end:e.right.end}),right:e.left.right}):e.left.right instanceof ln&&(e=p(yt,e,{operator:e.operator,left:p(yt,e.left,{operator:e.operator,left:e.left.right,right:e.right,start:e.left.right.start,end:e.right.end}),right:e.left.left}))),e.left instanceof yt&&e.left.operator==e.operator&&e.left.right instanceof ln&&e.right instanceof yt&&e.right.operator==e.operator&&e.right.left instanceof ln&&(e=p(yt,e,{operator:e.operator,left:p(yt,e.left,{operator:e.operator,left:p(yt,e.left.left,{operator:e.operator,left:e.left.right,right:e.right.left,start:e.left.right.start,end:e.right.left.end}),right:e.left.left}),right:e.right.right})))}}if(e.right instanceof yt&&e.right.operator==e.operator&&(Ni.has(e.operator)||"+"==e.operator&&(e.right.left.is_string(t)||e.left.is_string(t)&&e.right.right.is_string(t))))return e.left=p(yt,e.left,{operator:e.operator,left:e.left,right:e.right.left}),e.right=e.right.right,e.transform(t);var T=e.evaluate(t);return T!==e?(T=hi(T,e).optimize(t),Vi(t,T,e)):e})),si(on,(function(e){return e})),si(rn,(function(e,t){if(!t.option("ie8")&&yi(e)&&(!e.scope.uses_with||!t.find_parent(we)))switch(e.name){case"undefined":return p(gn,e).optimize(t);case"NaN":return p(En,e).optimize(t);case"Infinity":return p(Sn,e).optimize(t)}var n=t.parent();if(t.option("reduce_vars")&&Ii(e,n)!==e){const f=e.definition();if(t.top_retain&&f.global&&t.top_retain(f))return f.fixed=!1,f.should_replace=!1,f.single_use=!1,e;var i=e.fixed_value(),r=f.single_use&&!(n instanceof mt&&n.is_expr_pure(t)||T(n,wn));if(r&&(i instanceof Ie||i instanceof It))if(ji(i,t))r=!1;else if(f.scope!==e.scope&&(1==f.escaped||ii(i,16)||function(e){for(var t,n=0;t=e.parent(n++);){if(t instanceof _e)return!1;if(t instanceof Ft||t instanceof wt||t instanceof Mt)return!0}return!1}(t)))r=!1;else if(Ji(t,f))r=!1;else if((f.scope!==e.scope||f.orig[0]instanceof Wt)&&"f"==(r=i.is_constant_expression(e.scope))){var o=e.scope;do{(o instanceof Be||li(o))&&ri(o,16)}while(o=o.parent_scope)}if(r&&i instanceof Ie){const o=_i(t);r=f.scope===e.scope&&!Qi(o,i)||n instanceof mt&&n.expression===e&&!Qi(o,i)}if(r&&i instanceof It){r=(!i.extends||!i.extends.may_throw(t)&&!i.extends.has_side_effects(t))&&!i.properties.some(e=>e.may_throw(t)||e.has_side_effects(t))}if(r&&i){if(i instanceof Pt&&(ri(i,256),i=p(Vt,i,i)),i instanceof Be&&(ri(i,256),i=p(Pe,i,i)),f.recursive_refs>0&&i.name instanceof Yt){const e=i.name.definition();let t=i.variables.get(i.name.name),n=t&&t.orig[0];n instanceof jt||(n=p(jt,i.name,i.name),n.scope=i,i.name=n,t=i.def_function(n)),yn(i,n=>{n instanceof rn&&n.definition()===e&&(n.thedef=t,t.references.push(n))})}return(i instanceof Ie||i instanceof It)&&_i(t).add_child_scope(i),i.optimize(t)}if(i&&void 0===f.should_replace){let e;if(i instanceof un)f.orig[0]instanceof Wt||!f.references.every(e=>f.scope===e.scope)||(e=i);else{var a=i.evaluate(t);a===i||!t.option("unsafe_regexp")&&a instanceof RegExp||(e=hi(a,i))}if(e){var s,u=e.optimize(t).size();yn(i,e=>{if(e instanceof rn)return Cn})?s=function(){var n=e.optimize(t);return n===e?n.clone(!0):n}:(u=Math.min(u,i.size()),s=function(){var n=Li(e.optimize(t),i);return n===e||n===i?n.clone(!0):n});var c=f.name.length,l=0;t.option("unused")&&!t.exposed(f)&&(l=(c+2+u)/(f.references.length-f.assignments)),f.should_replace=u<=c+l&&s}else f.should_replace=!1}if(f.should_replace)return f.should_replace()}return e})),si(gn,(function(e,t){if(t.option("unsafe_undefined")){var n=di(t,"undefined");if(n){var i=p(rn,e,{name:"undefined",scope:n.scope,thedef:n});return ri(i,8),i}}var r=Ii(t.self(),t.parent());return r&&er(r,e)?e:p(At,e,{operator:"void",expression:p(pn,e,{value:0})})})),si(Sn,(function(e,t){var n=Ii(t.self(),t.parent());return n&&er(n,e)?e:!t.option("keep_infinity")||n&&!er(n,e)||di(t,"Infinity")?p(yt,e,{operator:"/",left:p(pn,e,{value:1}),right:p(pn,e,{value:0})}):e})),si(En,(function(e,t){var n=Ii(t.self(),t.parent());return n&&!er(n,e)||di(t,"NaN")?p(yt,e,{operator:"/",left:p(pn,e,{value:0}),right:p(pn,e,{value:0})}):e}));const nr=E("+ - / * % >> << >>> | ^ &"),ir=E("* | ^ &");function rr(e){let t;return e instanceof hn||xi(e)||e instanceof rn&&(t=e.definition().fixed)instanceof pe&&rr(t)}function or(e,t){return e instanceof rn&&(e=e.fixed_value()),!!e&&(!(e instanceof Ie||e instanceof It)||(!(e instanceof Ie&&e.contains_this())||t.parent()instanceof ht))}function ar(e,t){return t.in_boolean_context()?Vi(t,e,mi(e,[e,p(Tn,e)]).optimize(t)):e}function sr(e,t,n){for(var i=0;i<n.length;i++){var r=n[i];if(r instanceof ke){var o=r.expression;o instanceof Ft&&(n.splice(i,1,...o.elements),i--)}}return e}function ur(e,t){if(!t.option("computed_props"))return e;if(!(e.key instanceof ln))return e;if(e.key instanceof fn||e.key instanceof pn){if("__proto__"===e.key.value)return e;if("constructor"==e.key.value&&t.parent()instanceof It)return e;e.key=e instanceof wt?e.key.value:p(e instanceof Lt?$t:qt,e.key,{name:e.key.value})}return e}si(Ct,(function(e,t){var n;if(t.option("dead_code")&&e.left instanceof rn&&(n=e.left.definition()).scope===t.find_parent(Ie)){var i,r=0,o=e;do{if(i=o,(o=t.parent(r++))instanceof ze){if(a(r,o))break;if(tr(n.scope,[n]))break;return"="==e.operator?e.right:(n.fixed=!1,p(yt,e,{operator:e.operator.slice(0,-1),left:e.left,right:e.right}).optimize(t))}}while(o instanceof yt&&o.right===i||o instanceof Et&&o.tail_node()===i)}return"="==(e=e.lift_sequences(t)).operator&&e.left instanceof rn&&e.right instanceof yt&&(e.right.left instanceof rn&&e.right.left.name==e.left.name&&nr.has(e.right.operator)?(e.operator=e.right.operator+"=",e.right=e.right.right):e.right.right instanceof rn&&e.right.right.name==e.left.name&&ir.has(e.right.operator)&&!e.right.left.has_side_effects(t)&&(e.operator=e.right.operator+"=",e.right=e.right.left)),e;function a(n,i){var r=e.right;e.right=p(hn,r);var o=i.may_throw(t);e.right=r;for(var a,s=e.left.definition().scope;(a=t.parent(n++))!==s;)if(a instanceof rt){if(a.bfinally)return!0;if(o&&a.bcatch)return!0}}})),si(Ot,(function(e,t){if(!t.option("evaluate"))return e;var n=e.right.evaluate(t);return void 0===n?e=e.left:n!==e.right&&(n=hi(n,e.right),e.right=Li(n,e.right)),e})),si(bt,(function(e,t){if(!t.option("conditionals"))return e;if(e.condition instanceof Et){var n=e.condition.expressions.slice();return e.condition=n.pop(),n.push(e),mi(e,n)}var i=e.condition.evaluate(t);if(i!==e.condition)return i?(t.warn("Condition always true [{file}:{line},{col}]",e.start),Ei(t.parent(),t.self(),e.consequent)):(t.warn("Condition always false [{file}:{line},{col}]",e.start),Ei(t.parent(),t.self(),e.alternative));var r=i.negate(t,In(t));Vi(t,i,r)===r&&(e=p(bt,e,{condition:r,consequent:e.alternative,alternative:e.consequent}));var o,a=e.condition,s=e.consequent,u=e.alternative;if(a instanceof rn&&s instanceof rn&&a.definition()===s.definition())return p(yt,e,{operator:"||",left:a,right:u});if(s instanceof Ct&&u instanceof Ct&&s.operator==u.operator&&s.left.equivalent_to(u.left)&&(!e.condition.has_side_effects(t)||"="==s.operator&&!s.left.has_side_effects(t)))return p(Ct,e,{operator:s.operator,left:s.left,right:p(bt,e,{condition:e.condition,consequent:s.right,alternative:u.right})});if(s instanceof mt&&u.TYPE===s.TYPE&&s.args.length>0&&s.args.length==u.args.length&&s.expression.equivalent_to(u.expression)&&!e.condition.has_side_effects(t)&&!s.expression.has_side_effects(t)&&"number"==typeof(o=function(){for(var e=s.args,t=u.args,n=0,i=e.length;n<i;n++){if(e[n]instanceof ke)return;if(!e[n].equivalent_to(t[n])){if(t[n]instanceof ke)return;for(var r=n+1;r<i;r++){if(e[r]instanceof ke)return;if(!e[r].equivalent_to(t[r]))return}return n}}}())){var c=s.clone();return c.args[o]=p(bt,e,{condition:e.condition,consequent:s.args[o],alternative:u.args[o]}),c}if(u instanceof bt&&s.equivalent_to(u.consequent))return p(bt,e,{condition:p(yt,e,{operator:"||",left:a,right:u.condition}),consequent:s,alternative:u.alternative}).optimize(t);if(t.option("ecma")>=2020&&function(e,t,n){if(t.may_throw(n))return!1;let i;if(e instanceof yt&&"=="===e.operator&&((i=rr(e.left)&&e.left)||(i=rr(e.right)&&e.right))&&(i===e.left?e.right:e.left).equivalent_to(t))return!0;if(e instanceof yt&&"||"===e.operator){let n,i;const r=e=>{if(!(e instanceof yt)||"==="!==e.operator&&"=="!==e.operator)return!1;let r,o=0;return e.left instanceof hn&&(o++,n=e,r=e.right),e.right instanceof hn&&(o++,n=e,r=e.left),xi(e.left)&&(o++,i=e,r=e.right),xi(e.right)&&(o++,i=e,r=e.left),1===o&&!!r.equivalent_to(t)};if(!r(e.left))return!1;if(!r(e.right))return!1;if(n&&i&&n!==i)return!0}return!1}(a,u,t))return p(yt,e,{operator:"??",left:u,right:s}).optimize(t);if(u instanceof Et&&s.equivalent_to(u.expressions[u.expressions.length-1]))return mi(e,[p(yt,e,{operator:"||",left:a,right:mi(e,u.expressions.slice(0,-1))}),s]).optimize(t);if(u instanceof yt&&"&&"==u.operator&&s.equivalent_to(u.right))return p(yt,e,{operator:"&&",left:p(yt,e,{operator:"||",left:a,right:u.left}),right:s}).optimize(t);if(s instanceof bt&&s.alternative.equivalent_to(u))return p(bt,e,{condition:p(yt,e,{left:e.condition,operator:"&&",right:s.condition}),consequent:s.consequent,alternative:u});if(s.equivalent_to(u))return mi(e,[e.condition,s]).optimize(t);if(s instanceof yt&&"||"==s.operator&&s.right.equivalent_to(u))return p(yt,e,{operator:"||",left:p(yt,e,{operator:"&&",left:e.condition,right:s.left}),right:u}).optimize(t);var l=t.in_boolean_context();return _(e.consequent)?d(e.alternative)?f(e.condition):p(yt,e,{operator:"||",left:f(e.condition),right:e.alternative}):d(e.consequent)?_(e.alternative)?f(e.condition.negate(t)):p(yt,e,{operator:"&&",left:f(e.condition.negate(t)),right:e.alternative}):_(e.alternative)?p(yt,e,{operator:"||",left:f(e.condition.negate(t)),right:e.consequent}):d(e.alternative)?p(yt,e,{operator:"&&",left:f(e.condition),right:e.consequent}):e;function f(e){return e.is_boolean()?e:p(At,e,{operator:"!",expression:e.negate(t)})}function _(e){return e instanceof Tn||l&&e instanceof ln&&e.getValue()||e instanceof At&&"!"==e.operator&&e.expression instanceof ln&&!e.expression.getValue()}function d(e){return e instanceof An||l&&e instanceof ln&&!e.getValue()||e instanceof At&&"!"==e.operator&&e.expression instanceof ln&&e.expression.getValue()}})),si(vn,(function(e,t){if(t.in_boolean_context())return p(pn,e,{value:+e.value});var n=t.parent();return t.option("booleans_as_integers")?(n instanceof yt&&("==="==n.operator||"!=="==n.operator)&&(n.operator=n.operator.replace(/=$/,"")),p(pn,e,{value:+e.value})):t.option("booleans")?n instanceof yt&&("=="==n.operator||"!="==n.operator)?(t.warn("Non-strict equality against boolean: {operator} {value} [{file}:{line},{col}]",{operator:n.operator,value:e.value,file:n.start.file,line:n.start.line,col:n.start.col}),p(pn,e,{value:+e.value})):p(At,e,{operator:"!",expression:p(pn,e,{value:1-e.value})}):e})),si(St,(function(e,t){var n,i=e.expression,r=e.property;if(t.option("properties")){var o=r.evaluate(t);if(o!==r){if("string"==typeof o)if("undefined"==o)o=void 0;else(A=parseFloat(o)).toString()==o&&(o=A);r=e.property=Li(r,hi(o,r).transform(t));var a=""+o;if(j(a)&&a.length<=r.size()+1)return p(Dt,e,{expression:i,property:a,quote:r.quote}).optimize(t)}}e:if(t.option("arguments")&&i instanceof rn&&"arguments"==i.name&&1==i.definition().orig.length&&(n=i.scope)instanceof Ie&&n.uses_arguments&&!(n instanceof Ve)&&r instanceof pn){for(var s=r.getValue(),u=new Set,c=n.argnames,l=0;l<c.length;l++){if(!(c[l]instanceof Wt))break e;var f=c[l].name;if(u.has(f))break e;u.add(f)}var _=n.argnames[s];if(_&&t.has_directive("use strict")){var d=_.definition();(!t.option("reduce_vars")||d.assignments||d.orig.length>1)&&(_=null)}else if(!_&&!t.option("keep_fargs")&&s<n.argnames.length+5)for(;s>=n.argnames.length;)_=p(Wt,n,{name:n.make_var_name("argument_"+n.argnames.length),scope:n}),n.argnames.push(_),n.enclosed.push(n.def_variable(_));if(_){var m=p(rn,e,_);return m.reference({}),oi(_,1),m}}if(Ii(e,t.parent()))return e;if(o!==r){var h=e.flatten_object(a,t);h&&(i=e.expression=h.expression,r=e.property=h.property)}if(t.option("properties")&&t.option("side_effects")&&r instanceof pn&&i instanceof Ft){s=r.getValue();var E=i.elements,g=E[s];e:if(or(g,t)){for(var D=!0,S=[],v=E.length;--v>s;){(A=E[v].drop_side_effect_free(t))&&(S.unshift(A),D&&A.has_side_effects(t)&&(D=!1))}if(g instanceof ke)break e;for(g=g instanceof Dn?p(gn,g):g,D||S.unshift(g);--v>=0;){var A;if((A=E[v])instanceof ke)break e;(A=A.drop_side_effect_free(t))?S.unshift(A):s--}return D?(S.push(g),mi(e,S).optimize(t)):p(St,e,{expression:p(Ft,i,{elements:S}),property:p(pn,r,{value:s})})}}var T=e.evaluate(t);return T!==e?Vi(t,T=hi(T,e).optimize(t),e):e})),Ie.DEFMETHOD("contains_this",(function(){return yn(this,e=>e instanceof un?Cn:e!==this&&e instanceof xe&&!(e instanceof Ve)||void 0)})),gt.DEFMETHOD("flatten_object",(function(e,t){if(t.option("properties")){var n=t.option("unsafe_arrows")&&t.option("ecma")>=2015,i=this.expression;if(i instanceof Mt)for(var r=i.properties,o=r.length;--o>=0;){var a=r[o];if(""+(a instanceof kt?a.key.name:a.key)==e){if(!r.every(e=>e instanceof wt||n&&e instanceof kt&&!e.is_generator))break;if(!or(a.value,t))break;return p(St,this,{expression:p(Ft,i,{elements:r.map((function(e){var t=e.value;t instanceof Le&&(t=p(Pe,t,t));var n=e.key;return n instanceof pe&&!(n instanceof qt)?mi(e,[n,t]):t}))}),property:p(pn,this,{value:o})})}}}})),si(Dt,(function(e,t){"arguments"!=e.property&&"caller"!=e.property||t.warn("Function.prototype.{prop} not supported [{file}:{line},{col}]",{prop:e.property,file:e.start.file,line:e.start.line,col:e.start.col});const n=t.parent();if(Ii(e,n))return e;if(t.option("unsafe_proto")&&e.expression instanceof Dt&&"prototype"==e.expression.property){var i=e.expression.expression;if(yi(i))switch(i.name){case"Array":e.expression=p(Ft,e.expression,{elements:[]});break;case"Function":e.expression=p(Pe,e.expression,{argnames:[],body:[]});break;case"Number":e.expression=p(pn,e.expression,{value:0});break;case"Object":e.expression=p(Mt,e.expression,{properties:[]});break;case"RegExp":e.expression=p(dn,e.expression,{value:{source:"t",flags:""}});break;case"String":e.expression=p(fn,e.expression,{value:""})}}if(!(n instanceof mt&&T(n,wn))){const n=e.flatten_object(e.property,t);if(n)return n.optimize(t)}let r=e.evaluate(t);return r!==e?(r=hi(r,e).optimize(t),Vi(t,r,e)):e})),si(Ft,(function(e,t){var n=ar(e,t);return n!==e?n:sr(e,0,e.elements)})),si(Mt,(function(e,t){var n=ar(e,t);if(n!==e)return n;for(var i=e.properties,r=0;r<i.length;r++){var o=i[r];if(o instanceof ke){var a=o.expression;a instanceof Mt?(i.splice.apply(i,[r,1].concat(o.expression.properties)),r--):a instanceof ln&&!(a instanceof fn)&&i.splice(r,1)}}return e})),si(dn,ar),si(We,(function(e,t){return e.value&&xi(e.value,t)&&(e.value=null),e})),si(Ve,Yi),si(Pe,(function(e,t){if(e=Yi(e,t),t.option("unsafe_arrows")&&t.option("ecma")>=2015&&!e.name&&!e.is_generator&&!e.uses_arguments&&!e.pinned()){if(!yn(e,e=>{if(e instanceof un)return Cn}))return p(Ve,e,e).optimize(t)}return e})),si(It,(function(e){return e})),si(Je,(function(e,t){return e.expression&&!e.is_star&&xi(e.expression,t)&&(e.expression=null),e})),si(Ge,(function(e,t){if(!t.option("evaluate")||t.parent()instanceof Ue)return e;for(var n=[],i=0;i<e.segments.length;i++){var r=e.segments[i];if(r instanceof pe){var o=r.evaluate(t);if(o!==r&&(o+"").length<=r.size()+"${}".length){n[n.length-1].value=n[n.length-1].value+o+e.segments[++i].value;continue}if(r instanceof Ge){var a=r.segments;n[n.length-1].value+=a[0].value;for(var s=1;s<a.length;s++)r=a[s],n.push(r);continue}}n.push(r)}if(e.segments=n,1==n.length)return p(fn,e,n[0]);if(3===n.length&&n[1]instanceof pe){if(""===n[2].value)return p(yt,e,{operator:"+",left:p(fn,e,{value:n[0].value}),right:n[1]});if(""===n[0].value)return p(yt,e,{operator:"+",left:n[1],right:p(fn,e,{value:n[2].value})})}return e})),si(Ue,(function(e){return e})),si(Rt,ur),si(kt,(function(e,t){if(ur(e,t),t.option("arrows")&&t.parent()instanceof Mt&&!e.is_generator&&!e.value.uses_arguments&&!e.value.pinned()&&1==e.value.body.length&&e.value.body[0]instanceof We&&e.value.body[0].value&&!e.value.contains_this()){var n=p(Ve,e.value,e.value);return n.async=e.async,n.is_generator=e.is_generator,p(wt,e,{key:e.key instanceof qt?e.key.name:e.key,value:n,quote:e.quote})}return e})),si(wt,(function(e,t){ur(e,t);var n=t.option("unsafe_methods");if(n&&t.option("ecma")>=2015&&(!(n instanceof RegExp)||n.test(e.key+""))){var i=e.key,r=e.value;if((r instanceof Ve&&Array.isArray(r.body)&&!r.contains_this()||r instanceof Pe)&&!r.name)return p(kt,e,{async:r.async,is_generator:r.is_generator,key:i instanceof pe?i:p(qt,e,{name:i}),value:p(Le,r,r),quote:e.quote})}return e})),si(Ke,(function(e,t){if(1==t.option("pure_getters")&&t.option("unused")&&!e.is_array&&Array.isArray(e.names)&&!function(e){for(var t=[/^VarDef$/,/^(Const|Let|Var)$/,/^Export$/],n=0,i=0,r=t.length;n<r;i++){var o=e.parent(i);if(!o)return!1;if(0!==n||"Destructuring"!=o.TYPE){if(!t[n].test(o.TYPE))return!1;n++}}return!0}(t)){for(var n=[],i=0;i<e.names.length;i++){var r=e.names[i];r instanceof wt&&"string"==typeof r.key&&r.value instanceof Ut&&!o(t,r.value.definition())||n.push(r)}n.length!=e.names.length&&(e.names=n)}return e;function o(e,t){return!!t.references.length||!!t.global&&(!e.toplevel.vars||!!e.top_retain&&e.top_retain(t))}}));var cr=["$&","$'","$*","$+","$1","$2","$3","$4","$5","$6","$7","$8","$9","$_","$`","$input","@@iterator","ABORT_ERR","ACTIVE","ACTIVE_ATTRIBUTES","ACTIVE_TEXTURE","ACTIVE_UNIFORMS","ADDITION","ALIASED_LINE_WIDTH_RANGE","ALIASED_POINT_SIZE_RANGE","ALLOW_KEYBOARD_INPUT","ALLPASS","ALPHA","ALPHA_BITS","ALT_MASK","ALWAYS","ANY_TYPE","ANY_UNORDERED_NODE_TYPE","ARRAY_BUFFER","ARRAY_BUFFER_BINDING","ATTACHED_SHADERS","ATTRIBUTE_NODE","AT_TARGET","AddSearchProvider","AnalyserNode","AnimationEvent","AnonXMLHttpRequest","ApplicationCache","ApplicationCacheErrorEvent","Array","ArrayBuffer","Attr","Audio","AudioBuffer","AudioBufferSourceNode","AudioContext","AudioDestinationNode","AudioListener","AudioNode","AudioParam","AudioProcessingEvent","AudioStreamTrack","AutocompleteErrorEvent","BACK","BAD_BOUNDARYPOINTS_ERR","BANDPASS","BLEND","BLEND_COLOR","BLEND_DST_ALPHA","BLEND_DST_RGB","BLEND_EQUATION","BLEND_EQUATION_ALPHA","BLEND_EQUATION_RGB","BLEND_SRC_ALPHA","BLEND_SRC_RGB","BLUE_BITS","BLUR","BOOL","BOOLEAN_TYPE","BOOL_VEC2","BOOL_VEC3","BOOL_VEC4","BOTH","BROWSER_DEFAULT_WEBGL","BUBBLING_PHASE","BUFFER_SIZE","BUFFER_USAGE","BYTE","BYTES_PER_ELEMENT","BarProp","BaseHref","BatteryManager","BeforeLoadEvent","BeforeUnloadEvent","BiquadFilterNode","Blob","BlobEvent","Boolean","CAPTURING_PHASE","CCW","CDATASection","CDATA_SECTION_NODE","CHANGE","CHARSET_RULE","CHECKING","CLAMP_TO_EDGE","CLICK","CLOSED","CLOSING","COLOR_ATTACHMENT0","COLOR_BUFFER_BIT","COLOR_CLEAR_VALUE","COLOR_WRITEMASK","COMMENT_NODE","COMPILE_STATUS","COMPRESSED_RGBA_S3TC_DXT1_EXT","COMPRESSED_RGBA_S3TC_DXT3_EXT","COMPRESSED_RGBA_S3TC_DXT5_EXT","COMPRESSED_RGB_S3TC_DXT1_EXT","COMPRESSED_TEXTURE_FORMATS","CONNECTING","CONSTANT_ALPHA","CONSTANT_COLOR","CONSTRAINT_ERR","CONTEXT_LOST_WEBGL","CONTROL_MASK","COUNTER_STYLE_RULE","CSS","CSS2Properties","CSSCharsetRule","CSSConditionRule","CSSCounterStyleRule","CSSFontFaceRule","CSSFontFeatureValuesRule","CSSGroupingRule","CSSImportRule","CSSKeyframeRule","CSSKeyframesRule","CSSMediaRule","CSSMozDocumentRule","CSSNameSpaceRule","CSSPageRule","CSSPrimitiveValue","CSSRule","CSSRuleList","CSSStyleDeclaration","CSSStyleRule","CSSStyleSheet","CSSSupportsRule","CSSUnknownRule","CSSValue","CSSValueList","CSSVariablesDeclaration","CSSVariablesRule","CSSViewportRule","CSS_ATTR","CSS_CM","CSS_COUNTER","CSS_CUSTOM","CSS_DEG","CSS_DIMENSION","CSS_EMS","CSS_EXS","CSS_FILTER_BLUR","CSS_FILTER_BRIGHTNESS","CSS_FILTER_CONTRAST","CSS_FILTER_CUSTOM","CSS_FILTER_DROP_SHADOW","CSS_FILTER_GRAYSCALE","CSS_FILTER_HUE_ROTATE","CSS_FILTER_INVERT","CSS_FILTER_OPACITY","CSS_FILTER_REFERENCE","CSS_FILTER_SATURATE","CSS_FILTER_SEPIA","CSS_GRAD","CSS_HZ","CSS_IDENT","CSS_IN","CSS_INHERIT","CSS_KHZ","CSS_MATRIX","CSS_MATRIX3D","CSS_MM","CSS_MS","CSS_NUMBER","CSS_PC","CSS_PERCENTAGE","CSS_PERSPECTIVE","CSS_PRIMITIVE_VALUE","CSS_PT","CSS_PX","CSS_RAD","CSS_RECT","CSS_RGBCOLOR","CSS_ROTATE","CSS_ROTATE3D","CSS_ROTATEX","CSS_ROTATEY","CSS_ROTATEZ","CSS_S","CSS_SCALE","CSS_SCALE3D","CSS_SCALEX","CSS_SCALEY","CSS_SCALEZ","CSS_SKEW","CSS_SKEWX","CSS_SKEWY","CSS_STRING","CSS_TRANSLATE","CSS_TRANSLATE3D","CSS_TRANSLATEX","CSS_TRANSLATEY","CSS_TRANSLATEZ","CSS_UNKNOWN","CSS_URI","CSS_VALUE_LIST","CSS_VH","CSS_VMAX","CSS_VMIN","CSS_VW","CULL_FACE","CULL_FACE_MODE","CURRENT_PROGRAM","CURRENT_VERTEX_ATTRIB","CUSTOM","CW","CanvasGradient","CanvasPattern","CanvasRenderingContext2D","CaretPosition","ChannelMergerNode","ChannelSplitterNode","CharacterData","ClientRect","ClientRectList","Clipboard","ClipboardEvent","CloseEvent","Collator","CommandEvent","Comment","CompositionEvent","Console","Controllers","ConvolverNode","Counter","Crypto","CryptoKey","CustomEvent","DATABASE_ERR","DATA_CLONE_ERR","DATA_ERR","DBLCLICK","DECR","DECR_WRAP","DELETE_STATUS","DEPTH_ATTACHMENT","DEPTH_BITS","DEPTH_BUFFER_BIT","DEPTH_CLEAR_VALUE","DEPTH_COMPONENT","DEPTH_COMPONENT16","DEPTH_FUNC","DEPTH_RANGE","DEPTH_STENCIL","DEPTH_STENCIL_ATTACHMENT","DEPTH_TEST","DEPTH_WRITEMASK","DIRECTION_DOWN","DIRECTION_LEFT","DIRECTION_RIGHT","DIRECTION_UP","DISABLED","DISPATCH_REQUEST_ERR","DITHER","DOCUMENT_FRAGMENT_NODE","DOCUMENT_NODE","DOCUMENT_POSITION_CONTAINED_BY","DOCUMENT_POSITION_CONTAINS","DOCUMENT_POSITION_DISCONNECTED","DOCUMENT_POSITION_FOLLOWING","DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC","DOCUMENT_POSITION_PRECEDING","DOCUMENT_TYPE_NODE","DOMCursor","DOMError","DOMException","DOMImplementation","DOMImplementationLS","DOMMatrix","DOMMatrixReadOnly","DOMParser","DOMPoint","DOMPointReadOnly","DOMQuad","DOMRect","DOMRectList","DOMRectReadOnly","DOMRequest","DOMSTRING_SIZE_ERR","DOMSettableTokenList","DOMStringList","DOMStringMap","DOMTokenList","DOMTransactionEvent","DOM_DELTA_LINE","DOM_DELTA_PAGE","DOM_DELTA_PIXEL","DOM_INPUT_METHOD_DROP","DOM_INPUT_METHOD_HANDWRITING","DOM_INPUT_METHOD_IME","DOM_INPUT_METHOD_KEYBOARD","DOM_INPUT_METHOD_MULTIMODAL","DOM_INPUT_METHOD_OPTION","DOM_INPUT_METHOD_PASTE","DOM_INPUT_METHOD_SCRIPT","DOM_INPUT_METHOD_UNKNOWN","DOM_INPUT_METHOD_VOICE","DOM_KEY_LOCATION_JOYSTICK","DOM_KEY_LOCATION_LEFT","DOM_KEY_LOCATION_MOBILE","DOM_KEY_LOCATION_NUMPAD","DOM_KEY_LOCATION_RIGHT","DOM_KEY_LOCATION_STANDARD","DOM_VK_0","DOM_VK_1","DOM_VK_2","DOM_VK_3","DOM_VK_4","DOM_VK_5","DOM_VK_6","DOM_VK_7","DOM_VK_8","DOM_VK_9","DOM_VK_A","DOM_VK_ACCEPT","DOM_VK_ADD","DOM_VK_ALT","DOM_VK_ALTGR","DOM_VK_AMPERSAND","DOM_VK_ASTERISK","DOM_VK_AT","DOM_VK_ATTN","DOM_VK_B","DOM_VK_BACKSPACE","DOM_VK_BACK_QUOTE","DOM_VK_BACK_SLASH","DOM_VK_BACK_SPACE","DOM_VK_C","DOM_VK_CANCEL","DOM_VK_CAPS_LOCK","DOM_VK_CIRCUMFLEX","DOM_VK_CLEAR","DOM_VK_CLOSE_BRACKET","DOM_VK_CLOSE_CURLY_BRACKET","DOM_VK_CLOSE_PAREN","DOM_VK_COLON","DOM_VK_COMMA","DOM_VK_CONTEXT_MENU","DOM_VK_CONTROL","DOM_VK_CONVERT","DOM_VK_CRSEL","DOM_VK_CTRL","DOM_VK_D","DOM_VK_DECIMAL","DOM_VK_DELETE","DOM_VK_DIVIDE","DOM_VK_DOLLAR","DOM_VK_DOUBLE_QUOTE","DOM_VK_DOWN","DOM_VK_E","DOM_VK_EISU","DOM_VK_END","DOM_VK_ENTER","DOM_VK_EQUALS","DOM_VK_EREOF","DOM_VK_ESCAPE","DOM_VK_EXCLAMATION","DOM_VK_EXECUTE","DOM_VK_EXSEL","DOM_VK_F","DOM_VK_F1","DOM_VK_F10","DOM_VK_F11","DOM_VK_F12","DOM_VK_F13","DOM_VK_F14","DOM_VK_F15","DOM_VK_F16","DOM_VK_F17","DOM_VK_F18","DOM_VK_F19","DOM_VK_F2","DOM_VK_F20","DOM_VK_F21","DOM_VK_F22","DOM_VK_F23","DOM_VK_F24","DOM_VK_F25","DOM_VK_F26","DOM_VK_F27","DOM_VK_F28","DOM_VK_F29","DOM_VK_F3","DOM_VK_F30","DOM_VK_F31","DOM_VK_F32","DOM_VK_F33","DOM_VK_F34","DOM_VK_F35","DOM_VK_F36","DOM_VK_F4","DOM_VK_F5","DOM_VK_F6","DOM_VK_F7","DOM_VK_F8","DOM_VK_F9","DOM_VK_FINAL","DOM_VK_FRONT","DOM_VK_G","DOM_VK_GREATER_THAN","DOM_VK_H","DOM_VK_HANGUL","DOM_VK_HANJA","DOM_VK_HASH","DOM_VK_HELP","DOM_VK_HK_TOGGLE","DOM_VK_HOME","DOM_VK_HYPHEN_MINUS","DOM_VK_I","DOM_VK_INSERT","DOM_VK_J","DOM_VK_JUNJA","DOM_VK_K","DOM_VK_KANA","DOM_VK_KANJI","DOM_VK_L","DOM_VK_LEFT","DOM_VK_LEFT_TAB","DOM_VK_LESS_THAN","DOM_VK_M","DOM_VK_META","DOM_VK_MODECHANGE","DOM_VK_MULTIPLY","DOM_VK_N","DOM_VK_NONCONVERT","DOM_VK_NUMPAD0","DOM_VK_NUMPAD1","DOM_VK_NUMPAD2","DOM_VK_NUMPAD3","DOM_VK_NUMPAD4","DOM_VK_NUMPAD5","DOM_VK_NUMPAD6","DOM_VK_NUMPAD7","DOM_VK_NUMPAD8","DOM_VK_NUMPAD9","DOM_VK_NUM_LOCK","DOM_VK_O","DOM_VK_OEM_1","DOM_VK_OEM_102","DOM_VK_OEM_2","DOM_VK_OEM_3","DOM_VK_OEM_4","DOM_VK_OEM_5","DOM_VK_OEM_6","DOM_VK_OEM_7","DOM_VK_OEM_8","DOM_VK_OEM_COMMA","DOM_VK_OEM_MINUS","DOM_VK_OEM_PERIOD","DOM_VK_OEM_PLUS","DOM_VK_OPEN_BRACKET","DOM_VK_OPEN_CURLY_BRACKET","DOM_VK_OPEN_PAREN","DOM_VK_P","DOM_VK_PA1","DOM_VK_PAGEDOWN","DOM_VK_PAGEUP","DOM_VK_PAGE_DOWN","DOM_VK_PAGE_UP","DOM_VK_PAUSE","DOM_VK_PERCENT","DOM_VK_PERIOD","DOM_VK_PIPE","DOM_VK_PLAY","DOM_VK_PLUS","DOM_VK_PRINT","DOM_VK_PRINTSCREEN","DOM_VK_PROCESSKEY","DOM_VK_PROPERITES","DOM_VK_Q","DOM_VK_QUESTION_MARK","DOM_VK_QUOTE","DOM_VK_R","DOM_VK_REDO","DOM_VK_RETURN","DOM_VK_RIGHT","DOM_VK_S","DOM_VK_SCROLL_LOCK","DOM_VK_SELECT","DOM_VK_SEMICOLON","DOM_VK_SEPARATOR","DOM_VK_SHIFT","DOM_VK_SLASH","DOM_VK_SLEEP","DOM_VK_SPACE","DOM_VK_SUBTRACT","DOM_VK_T","DOM_VK_TAB","DOM_VK_TILDE","DOM_VK_U","DOM_VK_UNDERSCORE","DOM_VK_UNDO","DOM_VK_UNICODE","DOM_VK_UP","DOM_VK_V","DOM_VK_VOLUME_DOWN","DOM_VK_VOLUME_MUTE","DOM_VK_VOLUME_UP","DOM_VK_W","DOM_VK_WIN","DOM_VK_WINDOW","DOM_VK_WIN_ICO_00","DOM_VK_WIN_ICO_CLEAR","DOM_VK_WIN_ICO_HELP","DOM_VK_WIN_OEM_ATTN","DOM_VK_WIN_OEM_AUTO","DOM_VK_WIN_OEM_BACKTAB","DOM_VK_WIN_OEM_CLEAR","DOM_VK_WIN_OEM_COPY","DOM_VK_WIN_OEM_CUSEL","DOM_VK_WIN_OEM_ENLW","DOM_VK_WIN_OEM_FINISH","DOM_VK_WIN_OEM_FJ_JISHO","DOM_VK_WIN_OEM_FJ_LOYA","DOM_VK_WIN_OEM_FJ_MASSHOU","DOM_VK_WIN_OEM_FJ_ROYA","DOM_VK_WIN_OEM_FJ_TOUROKU","DOM_VK_WIN_OEM_JUMP","DOM_VK_WIN_OEM_PA1","DOM_VK_WIN_OEM_PA2","DOM_VK_WIN_OEM_PA3","DOM_VK_WIN_OEM_RESET","DOM_VK_WIN_OEM_WSCTRL","DOM_VK_X","DOM_VK_XF86XK_ADD_FAVORITE","DOM_VK_XF86XK_APPLICATION_LEFT","DOM_VK_XF86XK_APPLICATION_RIGHT","DOM_VK_XF86XK_AUDIO_CYCLE_TRACK","DOM_VK_XF86XK_AUDIO_FORWARD","DOM_VK_XF86XK_AUDIO_LOWER_VOLUME","DOM_VK_XF86XK_AUDIO_MEDIA","DOM_VK_XF86XK_AUDIO_MUTE","DOM_VK_XF86XK_AUDIO_NEXT","DOM_VK_XF86XK_AUDIO_PAUSE","DOM_VK_XF86XK_AUDIO_PLAY","DOM_VK_XF86XK_AUDIO_PREV","DOM_VK_XF86XK_AUDIO_RAISE_VOLUME","DOM_VK_XF86XK_AUDIO_RANDOM_PLAY","DOM_VK_XF86XK_AUDIO_RECORD","DOM_VK_XF86XK_AUDIO_REPEAT","DOM_VK_XF86XK_AUDIO_REWIND","DOM_VK_XF86XK_AUDIO_STOP","DOM_VK_XF86XK_AWAY","DOM_VK_XF86XK_BACK","DOM_VK_XF86XK_BACK_FORWARD","DOM_VK_XF86XK_BATTERY","DOM_VK_XF86XK_BLUE","DOM_VK_XF86XK_BLUETOOTH","DOM_VK_XF86XK_BOOK","DOM_VK_XF86XK_BRIGHTNESS_ADJUST","DOM_VK_XF86XK_CALCULATOR","DOM_VK_XF86XK_CALENDAR","DOM_VK_XF86XK_CD","DOM_VK_XF86XK_CLOSE","DOM_VK_XF86XK_COMMUNITY","DOM_VK_XF86XK_CONTRAST_ADJUST","DOM_VK_XF86XK_COPY","DOM_VK_XF86XK_CUT","DOM_VK_XF86XK_CYCLE_ANGLE","DOM_VK_XF86XK_DISPLAY","DOM_VK_XF86XK_DOCUMENTS","DOM_VK_XF86XK_DOS","DOM_VK_XF86XK_EJECT","DOM_VK_XF86XK_EXCEL","DOM_VK_XF86XK_EXPLORER","DOM_VK_XF86XK_FAVORITES","DOM_VK_XF86XK_FINANCE","DOM_VK_XF86XK_FORWARD","DOM_VK_XF86XK_FRAME_BACK","DOM_VK_XF86XK_FRAME_FORWARD","DOM_VK_XF86XK_GAME","DOM_VK_XF86XK_GO","DOM_VK_XF86XK_GREEN","DOM_VK_XF86XK_HIBERNATE","DOM_VK_XF86XK_HISTORY","DOM_VK_XF86XK_HOME_PAGE","DOM_VK_XF86XK_HOT_LINKS","DOM_VK_XF86XK_I_TOUCH","DOM_VK_XF86XK_KBD_BRIGHTNESS_DOWN","DOM_VK_XF86XK_KBD_BRIGHTNESS_UP","DOM_VK_XF86XK_KBD_LIGHT_ON_OFF","DOM_VK_XF86XK_LAUNCH0","DOM_VK_XF86XK_LAUNCH1","DOM_VK_XF86XK_LAUNCH2","DOM_VK_XF86XK_LAUNCH3","DOM_VK_XF86XK_LAUNCH4","DOM_VK_XF86XK_LAUNCH5","DOM_VK_XF86XK_LAUNCH6","DOM_VK_XF86XK_LAUNCH7","DOM_VK_XF86XK_LAUNCH8","DOM_VK_XF86XK_LAUNCH9","DOM_VK_XF86XK_LAUNCH_A","DOM_VK_XF86XK_LAUNCH_B","DOM_VK_XF86XK_LAUNCH_C","DOM_VK_XF86XK_LAUNCH_D","DOM_VK_XF86XK_LAUNCH_E","DOM_VK_XF86XK_LAUNCH_F","DOM_VK_XF86XK_LIGHT_BULB","DOM_VK_XF86XK_LOG_OFF","DOM_VK_XF86XK_MAIL","DOM_VK_XF86XK_MAIL_FORWARD","DOM_VK_XF86XK_MARKET","DOM_VK_XF86XK_MEETING","DOM_VK_XF86XK_MEMO","DOM_VK_XF86XK_MENU_KB","DOM_VK_XF86XK_MENU_PB","DOM_VK_XF86XK_MESSENGER","DOM_VK_XF86XK_MON_BRIGHTNESS_DOWN","DOM_VK_XF86XK_MON_BRIGHTNESS_UP","DOM_VK_XF86XK_MUSIC","DOM_VK_XF86XK_MY_COMPUTER","DOM_VK_XF86XK_MY_SITES","DOM_VK_XF86XK_NEW","DOM_VK_XF86XK_NEWS","DOM_VK_XF86XK_OFFICE_HOME","DOM_VK_XF86XK_OPEN","DOM_VK_XF86XK_OPEN_URL","DOM_VK_XF86XK_OPTION","DOM_VK_XF86XK_PASTE","DOM_VK_XF86XK_PHONE","DOM_VK_XF86XK_PICTURES","DOM_VK_XF86XK_POWER_DOWN","DOM_VK_XF86XK_POWER_OFF","DOM_VK_XF86XK_RED","DOM_VK_XF86XK_REFRESH","DOM_VK_XF86XK_RELOAD","DOM_VK_XF86XK_REPLY","DOM_VK_XF86XK_ROCKER_DOWN","DOM_VK_XF86XK_ROCKER_ENTER","DOM_VK_XF86XK_ROCKER_UP","DOM_VK_XF86XK_ROTATE_WINDOWS","DOM_VK_XF86XK_ROTATION_KB","DOM_VK_XF86XK_ROTATION_PB","DOM_VK_XF86XK_SAVE","DOM_VK_XF86XK_SCREEN_SAVER","DOM_VK_XF86XK_SCROLL_CLICK","DOM_VK_XF86XK_SCROLL_DOWN","DOM_VK_XF86XK_SCROLL_UP","DOM_VK_XF86XK_SEARCH","DOM_VK_XF86XK_SEND","DOM_VK_XF86XK_SHOP","DOM_VK_XF86XK_SPELL","DOM_VK_XF86XK_SPLIT_SCREEN","DOM_VK_XF86XK_STANDBY","DOM_VK_XF86XK_START","DOM_VK_XF86XK_STOP","DOM_VK_XF86XK_SUBTITLE","DOM_VK_XF86XK_SUPPORT","DOM_VK_XF86XK_SUSPEND","DOM_VK_XF86XK_TASK_PANE","DOM_VK_XF86XK_TERMINAL","DOM_VK_XF86XK_TIME","DOM_VK_XF86XK_TOOLS","DOM_VK_XF86XK_TOP_MENU","DOM_VK_XF86XK_TO_DO_LIST","DOM_VK_XF86XK_TRAVEL","DOM_VK_XF86XK_USER1KB","DOM_VK_XF86XK_USER2KB","DOM_VK_XF86XK_USER_PB","DOM_VK_XF86XK_UWB","DOM_VK_XF86XK_VENDOR_HOME","DOM_VK_XF86XK_VIDEO","DOM_VK_XF86XK_VIEW","DOM_VK_XF86XK_WAKE_UP","DOM_VK_XF86XK_WEB_CAM","DOM_VK_XF86XK_WHEEL_BUTTON","DOM_VK_XF86XK_WLAN","DOM_VK_XF86XK_WORD","DOM_VK_XF86XK_WWW","DOM_VK_XF86XK_XFER","DOM_VK_XF86XK_YELLOW","DOM_VK_XF86XK_ZOOM_IN","DOM_VK_XF86XK_ZOOM_OUT","DOM_VK_Y","DOM_VK_Z","DOM_VK_ZOOM","DONE","DONT_CARE","DOWNLOADING","DRAGDROP","DST_ALPHA","DST_COLOR","DYNAMIC_DRAW","DataChannel","DataTransfer","DataTransferItem","DataTransferItemList","DataView","Date","DateTimeFormat","DelayNode","DesktopNotification","DesktopNotificationCenter","DeviceLightEvent","DeviceMotionEvent","DeviceOrientationEvent","DeviceProximityEvent","DeviceStorage","DeviceStorageChangeEvent","Document","DocumentFragment","DocumentType","DragEvent","DynamicsCompressorNode","E","ELEMENT_ARRAY_BUFFER","ELEMENT_ARRAY_BUFFER_BINDING","ELEMENT_NODE","EMPTY","ENCODING_ERR","ENDED","END_TO_END","END_TO_START","ENTITY_NODE","ENTITY_REFERENCE_NODE","EPSILON","EQUAL","EQUALPOWER","ERROR","EXPONENTIAL_DISTANCE","Element","ElementQuery","Entity","EntityReference","Error","ErrorEvent","EvalError","Event","EventException","EventSource","EventTarget","External","FASTEST","FIDOSDK","FILTER_ACCEPT","FILTER_INTERRUPT","FILTER_REJECT","FILTER_SKIP","FINISHED_STATE","FIRST_ORDERED_NODE_TYPE","FLOAT","FLOAT_MAT2","FLOAT_MAT3","FLOAT_MAT4","FLOAT_VEC2","FLOAT_VEC3","FLOAT_VEC4","FOCUS","FONT_FACE_RULE","FONT_FEATURE_VALUES_RULE","FRAGMENT_SHADER","FRAGMENT_SHADER_DERIVATIVE_HINT_OES","FRAMEBUFFER","FRAMEBUFFER_ATTACHMENT_OBJECT_NAME","FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE","FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE","FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL","FRAMEBUFFER_BINDING","FRAMEBUFFER_COMPLETE","FRAMEBUFFER_INCOMPLETE_ATTACHMENT","FRAMEBUFFER_INCOMPLETE_DIMENSIONS","FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT","FRAMEBUFFER_UNSUPPORTED","FRONT","FRONT_AND_BACK","FRONT_FACE","FUNC_ADD","FUNC_REVERSE_SUBTRACT","FUNC_SUBTRACT","Feed","FeedEntry","File","FileError","FileList","FileReader","FindInPage","Float32Array","Float64Array","FocusEvent","FontFace","FormData","Function","GENERATE_MIPMAP_HINT","GEQUAL","GREATER","GREEN_BITS","GainNode","Gamepad","GamepadButton","GamepadEvent","GestureEvent","HAVE_CURRENT_DATA","HAVE_ENOUGH_DATA","HAVE_FUTURE_DATA","HAVE_METADATA","HAVE_NOTHING","HEADERS_RECEIVED","HIDDEN","HIERARCHY_REQUEST_ERR","HIGHPASS","HIGHSHELF","HIGH_FLOAT","HIGH_INT","HORIZONTAL","HORIZONTAL_AXIS","HRTF","HTMLAllCollection","HTMLAnchorElement","HTMLAppletElement","HTMLAreaElement","HTMLAudioElement","HTMLBRElement","HTMLBaseElement","HTMLBaseFontElement","HTMLBlockquoteElement","HTMLBodyElement","HTMLButtonElement","HTMLCanvasElement","HTMLCollection","HTMLCommandElement","HTMLContentElement","HTMLDListElement","HTMLDataElement","HTMLDataListElement","HTMLDetailsElement","HTMLDialogElement","HTMLDirectoryElement","HTMLDivElement","HTMLDocument","HTMLElement","HTMLEmbedElement","HTMLFieldSetElement","HTMLFontElement","HTMLFormControlsCollection","HTMLFormElement","HTMLFrameElement","HTMLFrameSetElement","HTMLHRElement","HTMLHeadElement","HTMLHeadingElement","HTMLHtmlElement","HTMLIFrameElement","HTMLImageElement","HTMLInputElement","HTMLIsIndexElement","HTMLKeygenElement","HTMLLIElement","HTMLLabelElement","HTMLLegendElement","HTMLLinkElement","HTMLMapElement","HTMLMarqueeElement","HTMLMediaElement","HTMLMenuElement","HTMLMenuItemElement","HTMLMetaElement","HTMLMeterElement","HTMLModElement","HTMLOListElement","HTMLObjectElement","HTMLOptGroupElement","HTMLOptionElement","HTMLOptionsCollection","HTMLOutputElement","HTMLParagraphElement","HTMLParamElement","HTMLPictureElement","HTMLPreElement","HTMLProgressElement","HTMLPropertiesCollection","HTMLQuoteElement","HTMLScriptElement","HTMLSelectElement","HTMLShadowElement","HTMLSourceElement","HTMLSpanElement","HTMLStyleElement","HTMLTableCaptionElement","HTMLTableCellElement","HTMLTableColElement","HTMLTableElement","HTMLTableRowElement","HTMLTableSectionElement","HTMLTemplateElement","HTMLTextAreaElement","HTMLTimeElement","HTMLTitleElement","HTMLTrackElement","HTMLUListElement","HTMLUnknownElement","HTMLVideoElement","HashChangeEvent","Headers","History","ICE_CHECKING","ICE_CLOSED","ICE_COMPLETED","ICE_CONNECTED","ICE_FAILED","ICE_GATHERING","ICE_WAITING","IDBCursor","IDBCursorWithValue","IDBDatabase","IDBDatabaseException","IDBFactory","IDBFileHandle","IDBFileRequest","IDBIndex","IDBKeyRange","IDBMutableFile","IDBObjectStore","IDBOpenDBRequest","IDBRequest","IDBTransaction","IDBVersionChangeEvent","IDLE","IMPLEMENTATION_COLOR_READ_FORMAT","IMPLEMENTATION_COLOR_READ_TYPE","IMPORT_RULE","INCR","INCR_WRAP","INDEX_SIZE_ERR","INT","INT_VEC2","INT_VEC3","INT_VEC4","INUSE_ATTRIBUTE_ERR","INVALID_ACCESS_ERR","INVALID_CHARACTER_ERR","INVALID_ENUM","INVALID_EXPRESSION_ERR","INVALID_FRAMEBUFFER_OPERATION","INVALID_MODIFICATION_ERR","INVALID_NODE_TYPE_ERR","INVALID_OPERATION","INVALID_STATE_ERR","INVALID_VALUE","INVERSE_DISTANCE","INVERT","IceCandidate","Image","ImageBitmap","ImageData","Infinity","InputEvent","InputMethodContext","InstallTrigger","Int16Array","Int32Array","Int8Array","Intent","InternalError","Intl","IsSearchProviderInstalled","Iterator","JSON","KEEP","KEYDOWN","KEYFRAMES_RULE","KEYFRAME_RULE","KEYPRESS","KEYUP","KeyEvent","KeyboardEvent","LENGTHADJUST_SPACING","LENGTHADJUST_SPACINGANDGLYPHS","LENGTHADJUST_UNKNOWN","LEQUAL","LESS","LINEAR","LINEAR_DISTANCE","LINEAR_MIPMAP_LINEAR","LINEAR_MIPMAP_NEAREST","LINES","LINE_LOOP","LINE_STRIP","LINE_WIDTH","LINK_STATUS","LIVE","LN10","LN2","LOADED","LOADING","LOG10E","LOG2E","LOWPASS","LOWSHELF","LOW_FLOAT","LOW_INT","LSException","LSParserFilter","LUMINANCE","LUMINANCE_ALPHA","LocalMediaStream","Location","MAX_COMBINED_TEXTURE_IMAGE_UNITS","MAX_CUBE_MAP_TEXTURE_SIZE","MAX_FRAGMENT_UNIFORM_VECTORS","MAX_RENDERBUFFER_SIZE","MAX_SAFE_INTEGER","MAX_TEXTURE_IMAGE_UNITS","MAX_TEXTURE_MAX_ANISOTROPY_EXT","MAX_TEXTURE_SIZE","MAX_VALUE","MAX_VARYING_VECTORS","MAX_VERTEX_ATTRIBS","MAX_VERTEX_TEXTURE_IMAGE_UNITS","MAX_VERTEX_UNIFORM_VECTORS","MAX_VIEWPORT_DIMS","MEDIA_ERR_ABORTED","MEDIA_ERR_DECODE","MEDIA_ERR_ENCRYPTED","MEDIA_ERR_NETWORK","MEDIA_ERR_SRC_NOT_SUPPORTED","MEDIA_KEYERR_CLIENT","MEDIA_KEYERR_DOMAIN","MEDIA_KEYERR_HARDWARECHANGE","MEDIA_KEYERR_OUTPUT","MEDIA_KEYERR_SERVICE","MEDIA_KEYERR_UNKNOWN","MEDIA_RULE","MEDIUM_FLOAT","MEDIUM_INT","META_MASK","MIN_SAFE_INTEGER","MIN_VALUE","MIRRORED_REPEAT","MODE_ASYNCHRONOUS","MODE_SYNCHRONOUS","MODIFICATION","MOUSEDOWN","MOUSEDRAG","MOUSEMOVE","MOUSEOUT","MOUSEOVER","MOUSEUP","MOZ_KEYFRAMES_RULE","MOZ_KEYFRAME_RULE","MOZ_SOURCE_CURSOR","MOZ_SOURCE_ERASER","MOZ_SOURCE_KEYBOARD","MOZ_SOURCE_MOUSE","MOZ_SOURCE_PEN","MOZ_SOURCE_TOUCH","MOZ_SOURCE_UNKNOWN","MSGESTURE_FLAG_BEGIN","MSGESTURE_FLAG_CANCEL","MSGESTURE_FLAG_END","MSGESTURE_FLAG_INERTIA","MSGESTURE_FLAG_NONE","MSPOINTER_TYPE_MOUSE","MSPOINTER_TYPE_PEN","MSPOINTER_TYPE_TOUCH","MS_ASYNC_CALLBACK_STATUS_ASSIGN_DELEGATE","MS_ASYNC_CALLBACK_STATUS_CANCEL","MS_ASYNC_CALLBACK_STATUS_CHOOSEANY","MS_ASYNC_CALLBACK_STATUS_ERROR","MS_ASYNC_CALLBACK_STATUS_JOIN","MS_ASYNC_OP_STATUS_CANCELED","MS_ASYNC_OP_STATUS_ERROR","MS_ASYNC_OP_STATUS_SUCCESS","MS_MANIPULATION_STATE_ACTIVE","MS_MANIPULATION_STATE_CANCELLED","MS_MANIPULATION_STATE_COMMITTED","MS_MANIPULATION_STATE_DRAGGING","MS_MANIPULATION_STATE_INERTIA","MS_MANIPULATION_STATE_PRESELECT","MS_MANIPULATION_STATE_SELECTING","MS_MANIPULATION_STATE_STOPPED","MS_MEDIA_ERR_ENCRYPTED","MS_MEDIA_KEYERR_CLIENT","MS_MEDIA_KEYERR_DOMAIN","MS_MEDIA_KEYERR_HARDWARECHANGE","MS_MEDIA_KEYERR_OUTPUT","MS_MEDIA_KEYERR_SERVICE","MS_MEDIA_KEYERR_UNKNOWN","Map","Math","MediaController","MediaDevices","MediaElementAudioSourceNode","MediaEncryptedEvent","MediaError","MediaKeyError","MediaKeyEvent","MediaKeyMessageEvent","MediaKeyNeededEvent","MediaKeySession","MediaKeyStatusMap","MediaKeySystemAccess","MediaKeys","MediaList","MediaQueryList","MediaQueryListEvent","MediaRecorder","MediaSource","MediaStream","MediaStreamAudioDestinationNode","MediaStreamAudioSourceNode","MediaStreamEvent","MediaStreamTrack","MediaStreamTrackEvent","MessageChannel","MessageEvent","MessagePort","Methods","MimeType","MimeTypeArray","MouseEvent","MouseScrollEvent","MozAnimation","MozAnimationDelay","MozAnimationDirection","MozAnimationDuration","MozAnimationFillMode","MozAnimationIterationCount","MozAnimationName","MozAnimationPlayState","MozAnimationTimingFunction","MozAppearance","MozBackfaceVisibility","MozBinding","MozBorderBottomColors","MozBorderEnd","MozBorderEndColor","MozBorderEndStyle","MozBorderEndWidth","MozBorderImage","MozBorderLeftColors","MozBorderRightColors","MozBorderStart","MozBorderStartColor","MozBorderStartStyle","MozBorderStartWidth","MozBorderTopColors","MozBoxAlign","MozBoxDirection","MozBoxFlex","MozBoxOrdinalGroup","MozBoxOrient","MozBoxPack","MozBoxSizing","MozCSSKeyframeRule","MozCSSKeyframesRule","MozColumnCount","MozColumnFill","MozColumnGap","MozColumnRule","MozColumnRuleColor","MozColumnRuleStyle","MozColumnRuleWidth","MozColumnWidth","MozColumns","MozContactChangeEvent","MozFloatEdge","MozFontFeatureSettings","MozFontLanguageOverride","MozForceBrokenImageIcon","MozHyphens","MozImageRegion","MozMarginEnd","MozMarginStart","MozMmsEvent","MozMmsMessage","MozMobileMessageThread","MozOSXFontSmoothing","MozOrient","MozOutlineRadius","MozOutlineRadiusBottomleft","MozOutlineRadiusBottomright","MozOutlineRadiusTopleft","MozOutlineRadiusTopright","MozPaddingEnd","MozPaddingStart","MozPerspective","MozPerspectiveOrigin","MozPowerManager","MozSettingsEvent","MozSmsEvent","MozSmsMessage","MozStackSizing","MozTabSize","MozTextAlignLast","MozTextDecorationColor","MozTextDecorationLine","MozTextDecorationStyle","MozTextSizeAdjust","MozTransform","MozTransformOrigin","MozTransformStyle","MozTransition","MozTransitionDelay","MozTransitionDuration","MozTransitionProperty","MozTransitionTimingFunction","MozUserFocus","MozUserInput","MozUserModify","MozUserSelect","MozWindowDragging","MozWindowShadow","MutationEvent","MutationObserver","MutationRecord","NAMESPACE_ERR","NAMESPACE_RULE","NEAREST","NEAREST_MIPMAP_LINEAR","NEAREST_MIPMAP_NEAREST","NEGATIVE_INFINITY","NETWORK_EMPTY","NETWORK_ERR","NETWORK_IDLE","NETWORK_LOADED","NETWORK_LOADING","NETWORK_NO_SOURCE","NEVER","NEW","NEXT","NEXT_NO_DUPLICATE","NICEST","NODE_AFTER","NODE_BEFORE","NODE_BEFORE_AND_AFTER","NODE_INSIDE","NONE","NON_TRANSIENT_ERR","NOTATION_NODE","NOTCH","NOTEQUAL","NOT_ALLOWED_ERR","NOT_FOUND_ERR","NOT_READABLE_ERR","NOT_SUPPORTED_ERR","NO_DATA_ALLOWED_ERR","NO_ERR","NO_ERROR","NO_MODIFICATION_ALLOWED_ERR","NUMBER_TYPE","NUM_COMPRESSED_TEXTURE_FORMATS","NaN","NamedNodeMap","Navigator","NearbyLinks","NetworkInformation","Node","NodeFilter","NodeIterator","NodeList","Notation","Notification","NotifyPaintEvent","Number","NumberFormat","OBSOLETE","ONE","ONE_MINUS_CONSTANT_ALPHA","ONE_MINUS_CONSTANT_COLOR","ONE_MINUS_DST_ALPHA","ONE_MINUS_DST_COLOR","ONE_MINUS_SRC_ALPHA","ONE_MINUS_SRC_COLOR","OPEN","OPENED","OPENING","ORDERED_NODE_ITERATOR_TYPE","ORDERED_NODE_SNAPSHOT_TYPE","OUT_OF_MEMORY","Object","OfflineAudioCompletionEvent","OfflineAudioContext","OfflineResourceList","Option","OscillatorNode","OverflowEvent","PACK_ALIGNMENT","PAGE_RULE","PARSE_ERR","PATHSEG_ARC_ABS","PATHSEG_ARC_REL","PATHSEG_CLOSEPATH","PATHSEG_CURVETO_CUBIC_ABS","PATHSEG_CURVETO_CUBIC_REL","PATHSEG_CURVETO_CUBIC_SMOOTH_ABS","PATHSEG_CURVETO_CUBIC_SMOOTH_REL","PATHSEG_CURVETO_QUADRATIC_ABS","PATHSEG_CURVETO_QUADRATIC_REL","PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS","PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL","PATHSEG_LINETO_ABS","PATHSEG_LINETO_HORIZONTAL_ABS","PATHSEG_LINETO_HORIZONTAL_REL","PATHSEG_LINETO_REL","PATHSEG_LINETO_VERTICAL_ABS","PATHSEG_LINETO_VERTICAL_REL","PATHSEG_MOVETO_ABS","PATHSEG_MOVETO_REL","PATHSEG_UNKNOWN","PATH_EXISTS_ERR","PEAKING","PERMISSION_DENIED","PERSISTENT","PI","PLAYING_STATE","POINTS","POLYGON_OFFSET_FACTOR","POLYGON_OFFSET_FILL","POLYGON_OFFSET_UNITS","POSITION_UNAVAILABLE","POSITIVE_INFINITY","PREV","PREV_NO_DUPLICATE","PROCESSING_INSTRUCTION_NODE","PageChangeEvent","PageTransitionEvent","PaintRequest","PaintRequestList","PannerNode","Path2D","Performance","PerformanceEntry","PerformanceMark","PerformanceMeasure","PerformanceNavigation","PerformanceResourceTiming","PerformanceTiming","PeriodicWave","Plugin","PluginArray","PopStateEvent","PopupBlockedEvent","ProcessingInstruction","ProgressEvent","Promise","PropertyNodeList","Proxy","PushManager","PushSubscription","Q","QUOTA_ERR","QUOTA_EXCEEDED_ERR","QueryInterface","READ_ONLY","READ_ONLY_ERR","READ_WRITE","RED_BITS","REMOVAL","RENDERBUFFER","RENDERBUFFER_ALPHA_SIZE","RENDERBUFFER_BINDING","RENDERBUFFER_BLUE_SIZE","RENDERBUFFER_DEPTH_SIZE","RENDERBUFFER_GREEN_SIZE","RENDERBUFFER_HEIGHT","RENDERBUFFER_INTERNAL_FORMAT","RENDERBUFFER_RED_SIZE","RENDERBUFFER_STENCIL_SIZE","RENDERBUFFER_WIDTH","RENDERER","RENDERING_INTENT_ABSOLUTE_COLORIMETRIC","RENDERING_INTENT_AUTO","RENDERING_INTENT_PERCEPTUAL","RENDERING_INTENT_RELATIVE_COLORIMETRIC","RENDERING_INTENT_SATURATION","RENDERING_INTENT_UNKNOWN","REPEAT","REPLACE","RGB","RGB565","RGB5_A1","RGBA","RGBA4","RGBColor","ROTATION_CLOCKWISE","ROTATION_COUNTERCLOCKWISE","RTCDataChannelEvent","RTCIceCandidate","RTCPeerConnectionIceEvent","RTCRtpReceiver","RTCRtpSender","RTCSessionDescription","RTCStatsReport","RadioNodeList","Range","RangeError","RangeException","RecordErrorEvent","Rect","ReferenceError","RegExp","Request","Response","SAMPLER_2D","SAMPLER_CUBE","SAMPLES","SAMPLE_ALPHA_TO_COVERAGE","SAMPLE_BUFFERS","SAMPLE_COVERAGE","SAMPLE_COVERAGE_INVERT","SAMPLE_COVERAGE_VALUE","SAWTOOTH","SCHEDULED_STATE","SCISSOR_BOX","SCISSOR_TEST","SCROLL_PAGE_DOWN","SCROLL_PAGE_UP","SDP_ANSWER","SDP_OFFER","SDP_PRANSWER","SECURITY_ERR","SELECT","SERIALIZE_ERR","SEVERITY_ERROR","SEVERITY_FATAL_ERROR","SEVERITY_WARNING","SHADER_COMPILER","SHADER_TYPE","SHADING_LANGUAGE_VERSION","SHIFT_MASK","SHORT","SHOWING","SHOW_ALL","SHOW_ATTRIBUTE","SHOW_CDATA_SECTION","SHOW_COMMENT","SHOW_DOCUMENT","SHOW_DOCUMENT_FRAGMENT","SHOW_DOCUMENT_TYPE","SHOW_ELEMENT","SHOW_ENTITY","SHOW_ENTITY_REFERENCE","SHOW_NOTATION","SHOW_PROCESSING_INSTRUCTION","SHOW_TEXT","SINE","SOUNDFIELD","SQLException","SQRT1_2","SQRT2","SQUARE","SRC_ALPHA","SRC_ALPHA_SATURATE","SRC_COLOR","START_TO_END","START_TO_START","STATIC_DRAW","STENCIL_ATTACHMENT","STENCIL_BACK_FAIL","STENCIL_BACK_FUNC","STENCIL_BACK_PASS_DEPTH_FAIL","STENCIL_BACK_PASS_DEPTH_PASS","STENCIL_BACK_REF","STENCIL_BACK_VALUE_MASK","STENCIL_BACK_WRITEMASK","STENCIL_BITS","STENCIL_BUFFER_BIT","STENCIL_CLEAR_VALUE","STENCIL_FAIL","STENCIL_FUNC","STENCIL_INDEX","STENCIL_INDEX8","STENCIL_PASS_DEPTH_FAIL","STENCIL_PASS_DEPTH_PASS","STENCIL_REF","STENCIL_TEST","STENCIL_VALUE_MASK","STENCIL_WRITEMASK","STREAM_DRAW","STRING_TYPE","STYLE_RULE","SUBPIXEL_BITS","SUPPORTS_RULE","SVGAElement","SVGAltGlyphDefElement","SVGAltGlyphElement","SVGAltGlyphItemElement","SVGAngle","SVGAnimateColorElement","SVGAnimateElement","SVGAnimateMotionElement","SVGAnimateTransformElement","SVGAnimatedAngle","SVGAnimatedBoolean","SVGAnimatedEnumeration","SVGAnimatedInteger","SVGAnimatedLength","SVGAnimatedLengthList","SVGAnimatedNumber","SVGAnimatedNumberList","SVGAnimatedPreserveAspectRatio","SVGAnimatedRect","SVGAnimatedString","SVGAnimatedTransformList","SVGAnimationElement","SVGCircleElement","SVGClipPathElement","SVGColor","SVGComponentTransferFunctionElement","SVGCursorElement","SVGDefsElement","SVGDescElement","SVGDiscardElement","SVGDocument","SVGElement","SVGElementInstance","SVGElementInstanceList","SVGEllipseElement","SVGException","SVGFEBlendElement","SVGFEColorMatrixElement","SVGFEComponentTransferElement","SVGFECompositeElement","SVGFEConvolveMatrixElement","SVGFEDiffuseLightingElement","SVGFEDisplacementMapElement","SVGFEDistantLightElement","SVGFEDropShadowElement","SVGFEFloodElement","SVGFEFuncAElement","SVGFEFuncBElement","SVGFEFuncGElement","SVGFEFuncRElement","SVGFEGaussianBlurElement","SVGFEImageElement","SVGFEMergeElement","SVGFEMergeNodeElement","SVGFEMorphologyElement","SVGFEOffsetElement","SVGFEPointLightElement","SVGFESpecularLightingElement","SVGFESpotLightElement","SVGFETileElement","SVGFETurbulenceElement","SVGFilterElement","SVGFontElement","SVGFontFaceElement","SVGFontFaceFormatElement","SVGFontFaceNameElement","SVGFontFaceSrcElement","SVGFontFaceUriElement","SVGForeignObjectElement","SVGGElement","SVGGeometryElement","SVGGlyphElement","SVGGlyphRefElement","SVGGradientElement","SVGGraphicsElement","SVGHKernElement","SVGImageElement","SVGLength","SVGLengthList","SVGLineElement","SVGLinearGradientElement","SVGMPathElement","SVGMarkerElement","SVGMaskElement","SVGMatrix","SVGMetadataElement","SVGMissingGlyphElement","SVGNumber","SVGNumberList","SVGPaint","SVGPathElement","SVGPathSeg","SVGPathSegArcAbs","SVGPathSegArcRel","SVGPathSegClosePath","SVGPathSegCurvetoCubicAbs","SVGPathSegCurvetoCubicRel","SVGPathSegCurvetoCubicSmoothAbs","SVGPathSegCurvetoCubicSmoothRel","SVGPathSegCurvetoQuadraticAbs","SVGPathSegCurvetoQuadraticRel","SVGPathSegCurvetoQuadraticSmoothAbs","SVGPathSegCurvetoQuadraticSmoothRel","SVGPathSegLinetoAbs","SVGPathSegLinetoHorizontalAbs","SVGPathSegLinetoHorizontalRel","SVGPathSegLinetoRel","SVGPathSegLinetoVerticalAbs","SVGPathSegLinetoVerticalRel","SVGPathSegList","SVGPathSegMovetoAbs","SVGPathSegMovetoRel","SVGPatternElement","SVGPoint","SVGPointList","SVGPolygonElement","SVGPolylineElement","SVGPreserveAspectRatio","SVGRadialGradientElement","SVGRect","SVGRectElement","SVGRenderingIntent","SVGSVGElement","SVGScriptElement","SVGSetElement","SVGStopElement","SVGStringList","SVGStyleElement","SVGSwitchElement","SVGSymbolElement","SVGTRefElement","SVGTSpanElement","SVGTextContentElement","SVGTextElement","SVGTextPathElement","SVGTextPositioningElement","SVGTitleElement","SVGTransform","SVGTransformList","SVGUnitTypes","SVGUseElement","SVGVKernElement","SVGViewElement","SVGViewSpec","SVGZoomAndPan","SVGZoomEvent","SVG_ANGLETYPE_DEG","SVG_ANGLETYPE_GRAD","SVG_ANGLETYPE_RAD","SVG_ANGLETYPE_UNKNOWN","SVG_ANGLETYPE_UNSPECIFIED","SVG_CHANNEL_A","SVG_CHANNEL_B","SVG_CHANNEL_G","SVG_CHANNEL_R","SVG_CHANNEL_UNKNOWN","SVG_COLORTYPE_CURRENTCOLOR","SVG_COLORTYPE_RGBCOLOR","SVG_COLORTYPE_RGBCOLOR_ICCCOLOR","SVG_COLORTYPE_UNKNOWN","SVG_EDGEMODE_DUPLICATE","SVG_EDGEMODE_NONE","SVG_EDGEMODE_UNKNOWN","SVG_EDGEMODE_WRAP","SVG_FEBLEND_MODE_COLOR","SVG_FEBLEND_MODE_COLOR_BURN","SVG_FEBLEND_MODE_COLOR_DODGE","SVG_FEBLEND_MODE_DARKEN","SVG_FEBLEND_MODE_DIFFERENCE","SVG_FEBLEND_MODE_EXCLUSION","SVG_FEBLEND_MODE_HARD_LIGHT","SVG_FEBLEND_MODE_HUE","SVG_FEBLEND_MODE_LIGHTEN","SVG_FEBLEND_MODE_LUMINOSITY","SVG_FEBLEND_MODE_MULTIPLY","SVG_FEBLEND_MODE_NORMAL","SVG_FEBLEND_MODE_OVERLAY","SVG_FEBLEND_MODE_SATURATION","SVG_FEBLEND_MODE_SCREEN","SVG_FEBLEND_MODE_SOFT_LIGHT","SVG_FEBLEND_MODE_UNKNOWN","SVG_FECOLORMATRIX_TYPE_HUEROTATE","SVG_FECOLORMATRIX_TYPE_LUMINANCETOALPHA","SVG_FECOLORMATRIX_TYPE_MATRIX","SVG_FECOLORMATRIX_TYPE_SATURATE","SVG_FECOLORMATRIX_TYPE_UNKNOWN","SVG_FECOMPONENTTRANSFER_TYPE_DISCRETE","SVG_FECOMPONENTTRANSFER_TYPE_GAMMA","SVG_FECOMPONENTTRANSFER_TYPE_IDENTITY","SVG_FECOMPONENTTRANSFER_TYPE_LINEAR","SVG_FECOMPONENTTRANSFER_TYPE_TABLE","SVG_FECOMPONENTTRANSFER_TYPE_UNKNOWN","SVG_FECOMPOSITE_OPERATOR_ARITHMETIC","SVG_FECOMPOSITE_OPERATOR_ATOP","SVG_FECOMPOSITE_OPERATOR_IN","SVG_FECOMPOSITE_OPERATOR_OUT","SVG_FECOMPOSITE_OPERATOR_OVER","SVG_FECOMPOSITE_OPERATOR_UNKNOWN","SVG_FECOMPOSITE_OPERATOR_XOR","SVG_INVALID_VALUE_ERR","SVG_LENGTHTYPE_CM","SVG_LENGTHTYPE_EMS","SVG_LENGTHTYPE_EXS","SVG_LENGTHTYPE_IN","SVG_LENGTHTYPE_MM","SVG_LENGTHTYPE_NUMBER","SVG_LENGTHTYPE_PC","SVG_LENGTHTYPE_PERCENTAGE","SVG_LENGTHTYPE_PT","SVG_LENGTHTYPE_PX","SVG_LENGTHTYPE_UNKNOWN","SVG_MARKERUNITS_STROKEWIDTH","SVG_MARKERUNITS_UNKNOWN","SVG_MARKERUNITS_USERSPACEONUSE","SVG_MARKER_ORIENT_ANGLE","SVG_MARKER_ORIENT_AUTO","SVG_MARKER_ORIENT_UNKNOWN","SVG_MASKTYPE_ALPHA","SVG_MASKTYPE_LUMINANCE","SVG_MATRIX_NOT_INVERTABLE","SVG_MEETORSLICE_MEET","SVG_MEETORSLICE_SLICE","SVG_MEETORSLICE_UNKNOWN","SVG_MORPHOLOGY_OPERATOR_DILATE","SVG_MORPHOLOGY_OPERATOR_ERODE","SVG_MORPHOLOGY_OPERATOR_UNKNOWN","SVG_PAINTTYPE_CURRENTCOLOR","SVG_PAINTTYPE_NONE","SVG_PAINTTYPE_RGBCOLOR","SVG_PAINTTYPE_RGBCOLOR_ICCCOLOR","SVG_PAINTTYPE_UNKNOWN","SVG_PAINTTYPE_URI","SVG_PAINTTYPE_URI_CURRENTCOLOR","SVG_PAINTTYPE_URI_NONE","SVG_PAINTTYPE_URI_RGBCOLOR","SVG_PAINTTYPE_URI_RGBCOLOR_ICCCOLOR","SVG_PRESERVEASPECTRATIO_NONE","SVG_PRESERVEASPECTRATIO_UNKNOWN","SVG_PRESERVEASPECTRATIO_XMAXYMAX","SVG_PRESERVEASPECTRATIO_XMAXYMID","SVG_PRESERVEASPECTRATIO_XMAXYMIN","SVG_PRESERVEASPECTRATIO_XMIDYMAX","SVG_PRESERVEASPECTRATIO_XMIDYMID","SVG_PRESERVEASPECTRATIO_XMIDYMIN","SVG_PRESERVEASPECTRATIO_XMINYMAX","SVG_PRESERVEASPECTRATIO_XMINYMID","SVG_PRESERVEASPECTRATIO_XMINYMIN","SVG_SPREADMETHOD_PAD","SVG_SPREADMETHOD_REFLECT","SVG_SPREADMETHOD_REPEAT","SVG_SPREADMETHOD_UNKNOWN","SVG_STITCHTYPE_NOSTITCH","SVG_STITCHTYPE_STITCH","SVG_STITCHTYPE_UNKNOWN","SVG_TRANSFORM_MATRIX","SVG_TRANSFORM_ROTATE","SVG_TRANSFORM_SCALE","SVG_TRANSFORM_SKEWX","SVG_TRANSFORM_SKEWY","SVG_TRANSFORM_TRANSLATE","SVG_TRANSFORM_UNKNOWN","SVG_TURBULENCE_TYPE_FRACTALNOISE","SVG_TURBULENCE_TYPE_TURBULENCE","SVG_TURBULENCE_TYPE_UNKNOWN","SVG_UNIT_TYPE_OBJECTBOUNDINGBOX","SVG_UNIT_TYPE_UNKNOWN","SVG_UNIT_TYPE_USERSPACEONUSE","SVG_WRONG_TYPE_ERR","SVG_ZOOMANDPAN_DISABLE","SVG_ZOOMANDPAN_MAGNIFY","SVG_ZOOMANDPAN_UNKNOWN","SYNTAX_ERR","SavedPages","Screen","ScreenOrientation","Script","ScriptProcessorNode","ScrollAreaEvent","SecurityPolicyViolationEvent","Selection","ServiceWorker","ServiceWorkerContainer","ServiceWorkerRegistration","SessionDescription","Set","ShadowRoot","SharedWorker","SimpleGestureEvent","SpeechSynthesisEvent","SpeechSynthesisUtterance","StopIteration","Storage","StorageEvent","String","StyleSheet","StyleSheetList","SubtleCrypto","Symbol","SyntaxError","TEMPORARY","TEXTPATH_METHODTYPE_ALIGN","TEXTPATH_METHODTYPE_STRETCH","TEXTPATH_METHODTYPE_UNKNOWN","TEXTPATH_SPACINGTYPE_AUTO","TEXTPATH_SPACINGTYPE_EXACT","TEXTPATH_SPACINGTYPE_UNKNOWN","TEXTURE","TEXTURE0","TEXTURE1","TEXTURE10","TEXTURE11","TEXTURE12","TEXTURE13","TEXTURE14","TEXTURE15","TEXTURE16","TEXTURE17","TEXTURE18","TEXTURE19","TEXTURE2","TEXTURE20","TEXTURE21","TEXTURE22","TEXTURE23","TEXTURE24","TEXTURE25","TEXTURE26","TEXTURE27","TEXTURE28","TEXTURE29","TEXTURE3","TEXTURE30","TEXTURE31","TEXTURE4","TEXTURE5","TEXTURE6","TEXTURE7","TEXTURE8","TEXTURE9","TEXTURE_2D","TEXTURE_BINDING_2D","TEXTURE_BINDING_CUBE_MAP","TEXTURE_CUBE_MAP","TEXTURE_CUBE_MAP_NEGATIVE_X","TEXTURE_CUBE_MAP_NEGATIVE_Y","TEXTURE_CUBE_MAP_NEGATIVE_Z","TEXTURE_CUBE_MAP_POSITIVE_X","TEXTURE_CUBE_MAP_POSITIVE_Y","TEXTURE_CUBE_MAP_POSITIVE_Z","TEXTURE_MAG_FILTER","TEXTURE_MAX_ANISOTROPY_EXT","TEXTURE_MIN_FILTER","TEXTURE_WRAP_S","TEXTURE_WRAP_T","TEXT_NODE","TIMEOUT","TIMEOUT_ERR","TOO_LARGE_ERR","TRANSACTION_INACTIVE_ERR","TRIANGLE","TRIANGLES","TRIANGLE_FAN","TRIANGLE_STRIP","TYPE_BACK_FORWARD","TYPE_ERR","TYPE_MISMATCH_ERR","TYPE_NAVIGATE","TYPE_RELOAD","TYPE_RESERVED","Text","TextDecoder","TextEncoder","TextEvent","TextMetrics","TextTrack","TextTrackCue","TextTrackCueList","TextTrackList","TimeEvent","TimeRanges","Touch","TouchEvent","TouchList","TrackEvent","TransitionEvent","TreeWalker","TypeError","UIEvent","UNCACHED","UNKNOWN_ERR","UNKNOWN_RULE","UNMASKED_RENDERER_WEBGL","UNMASKED_VENDOR_WEBGL","UNORDERED_NODE_ITERATOR_TYPE","UNORDERED_NODE_SNAPSHOT_TYPE","UNPACK_ALIGNMENT","UNPACK_COLORSPACE_CONVERSION_WEBGL","UNPACK_FLIP_Y_WEBGL","UNPACK_PREMULTIPLY_ALPHA_WEBGL","UNSCHEDULED_STATE","UNSENT","UNSIGNED_BYTE","UNSIGNED_INT","UNSIGNED_SHORT","UNSIGNED_SHORT_4_4_4_4","UNSIGNED_SHORT_5_5_5_1","UNSIGNED_SHORT_5_6_5","UNSPECIFIED_EVENT_TYPE_ERR","UPDATEREADY","URIError","URL","URLSearchParams","URLUnencoded","URL_MISMATCH_ERR","UTC","Uint16Array","Uint32Array","Uint8Array","Uint8ClampedArray","UserMessageHandler","UserMessageHandlersNamespace","UserProximityEvent","VALIDATE_STATUS","VALIDATION_ERR","VARIABLES_RULE","VENDOR","VERSION","VERSION_CHANGE","VERSION_ERR","VERTEX_ATTRIB_ARRAY_BUFFER_BINDING","VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE","VERTEX_ATTRIB_ARRAY_ENABLED","VERTEX_ATTRIB_ARRAY_NORMALIZED","VERTEX_ATTRIB_ARRAY_POINTER","VERTEX_ATTRIB_ARRAY_SIZE","VERTEX_ATTRIB_ARRAY_STRIDE","VERTEX_ATTRIB_ARRAY_TYPE","VERTEX_SHADER","VERTICAL","VERTICAL_AXIS","VER_ERR","VIEWPORT","VIEWPORT_RULE","VTTCue","VTTRegion","ValidityState","VideoStreamTrack","WEBKIT_FILTER_RULE","WEBKIT_KEYFRAMES_RULE","WEBKIT_KEYFRAME_RULE","WEBKIT_REGION_RULE","WRONG_DOCUMENT_ERR","WaveShaperNode","WeakMap","WeakSet","WebGLActiveInfo","WebGLBuffer","WebGLContextEvent","WebGLFramebuffer","WebGLProgram","WebGLRenderbuffer","WebGLRenderingContext","WebGLShader","WebGLShaderPrecisionFormat","WebGLTexture","WebGLUniformLocation","WebGLVertexArray","WebKitAnimationEvent","WebKitBlobBuilder","WebKitCSSFilterRule","WebKitCSSFilterValue","WebKitCSSKeyframeRule","WebKitCSSKeyframesRule","WebKitCSSMatrix","WebKitCSSRegionRule","WebKitCSSTransformValue","WebKitDataCue","WebKitGamepad","WebKitMediaKeyError","WebKitMediaKeyMessageEvent","WebKitMediaKeySession","WebKitMediaKeys","WebKitMediaSource","WebKitMutationObserver","WebKitNamespace","WebKitPlaybackTargetAvailabilityEvent","WebKitPoint","WebKitShadowRoot","WebKitSourceBuffer","WebKitSourceBufferList","WebKitTransitionEvent","WebSocket","WheelEvent","Window","Worker","XMLDocument","XMLHttpRequest","XMLHttpRequestEventTarget","XMLHttpRequestException","XMLHttpRequestProgressEvent","XMLHttpRequestUpload","XMLSerializer","XMLStylesheetProcessingInstruction","XPathEvaluator","XPathException","XPathExpression","XPathNSResolver","XPathResult","XSLTProcessor","ZERO","_XD0M_","_YD0M_","__defineGetter__","__defineSetter__","__lookupGetter__","__lookupSetter__","__opera","__proto__","_browserjsran","a","aLink","abbr","abort","abs","absolute","acceleration","accelerationIncludingGravity","accelerator","accept","acceptCharset","acceptNode","accessKey","accessKeyLabel","accuracy","acos","acosh","action","actionURL","active","activeCues","activeElement","activeSourceBuffers","activeSourceCount","activeTexture","add","addBehavior","addCandidate","addColorStop","addCue","addElement","addEventListener","addFilter","addFromString","addFromUri","addIceCandidate","addImport","addListener","addNamed","addPageRule","addPath","addPointer","addRange","addRegion","addRule","addSearchEngine","addSourceBuffer","addStream","addTextTrack","addTrack","addWakeLockListener","addedNodes","additionalName","additiveSymbols","addons","adoptNode","adr","advance","alert","algorithm","align","align-content","align-items","align-self","alignContent","alignItems","alignSelf","alignmentBaseline","alinkColor","all","allSettled","allowFullscreen","allowedDirections","alpha","alt","altGraphKey","altHtml","altKey","altLeft","altitude","altitudeAccuracy","amplitude","ancestorOrigins","anchor","anchorNode","anchorOffset","anchors","angle","animVal","animate","animatedInstanceRoot","animatedNormalizedPathSegList","animatedPathSegList","animatedPoints","animation","animation-delay","animation-direction","animation-duration","animation-fill-mode","animation-iteration-count","animation-name","animation-play-state","animation-timing-function","animationDelay","animationDirection","animationDuration","animationFillMode","animationIterationCount","animationName","animationPlayState","animationStartTime","animationTimingFunction","animationsPaused","anniversary","any","app","appCodeName","appMinorVersion","appName","appNotifications","appVersion","append","appendBuffer","appendChild","appendData","appendItem","appendMedium","appendNamed","appendRule","appendStream","appendWindowEnd","appendWindowStart","applets","applicationCache","apply","applyElement","arc","arcTo","archive","areas","arguments","arrayBuffer","asin","asinh","assert","assign","async","atEnd","atan","atan2","atanh","atob","attachEvent","attachShader","attachShadow","attachments","attack","attrChange","attrName","attributeFilter","attributeName","attributeNamespace","attributeOldValue","attributes","audioTracks","autoIncrement","autobuffer","autocapitalize","autocomplete","autocorrect","autofocus","autoplay","availHeight","availLeft","availTop","availWidth","availability","available","aversion","axes","axis","azimuth","b","back","backface-visibility","backfaceVisibility","background","background-attachment","background-blend-mode","background-clip","background-color","background-image","background-origin","background-position","background-repeat","background-size","backgroundAttachment","backgroundBlendMode","backgroundClip","backgroundColor","backgroundImage","backgroundOrigin","backgroundPosition","backgroundPositionX","backgroundPositionY","backgroundRepeat","backgroundSize","badInput","balance","baseFrequencyX","baseFrequencyY","baseNode","baseOffset","baseURI","baseVal","baselineShift","battery","bday","beginElement","beginElementAt","beginPath","behavior","behaviorCookie","behaviorPart","behaviorUrns","beta","bezierCurveTo","bgColor","bgProperties","bias","big","binaryType","bind","bindAttribLocation","bindBuffer","bindFramebuffer","bindRenderbuffer","bindTexture","blendColor","blendEquation","blendEquationSeparate","blendFunc","blendFuncSeparate","blink","blob","blockDirection","blue","blur","body","bodyUsed","bold","bookmarks","booleanValue","border","border-bottom","border-bottom-color","border-bottom-left-radius","border-bottom-right-radius","border-bottom-style","border-bottom-width","border-collapse","border-color","border-image","border-image-outset","border-image-repeat","border-image-slice","border-image-source","border-image-width","border-left","border-left-color","border-left-style","border-left-width","border-radius","border-right","border-right-color","border-right-style","border-right-width","border-spacing","border-style","border-top","border-top-color","border-top-left-radius","border-top-right-radius","border-top-style","border-top-width","border-width","borderBottom","borderBottomColor","borderBottomLeftRadius","borderBottomRightRadius","borderBottomStyle","borderBottomWidth","borderCollapse","borderColor","borderColorDark","borderColorLight","borderImage","borderImageOutset","borderImageRepeat","borderImageSlice","borderImageSource","borderImageWidth","borderLeft","borderLeftColor","borderLeftStyle","borderLeftWidth","borderRadius","borderRight","borderRightColor","borderRightStyle","borderRightWidth","borderSpacing","borderStyle","borderTop","borderTopColor","borderTopLeftRadius","borderTopRightRadius","borderTopStyle","borderTopWidth","borderWidth","bottom","bottomMargin","bound","boundElements","boundingClientRect","boundingHeight","boundingLeft","boundingTop","boundingWidth","bounds","box-decoration-break","box-shadow","box-sizing","boxDecorationBreak","boxShadow","boxSizing","breakAfter","breakBefore","breakInside","browserLanguage","btoa","bubbles","buffer","bufferData","bufferDepth","bufferSize","bufferSubData","buffered","bufferedAmount","buildID","buildNumber","button","buttonID","buttons","byteLength","byteOffset","c","call","caller","canBeFormatted","canBeMounted","canBeShared","canHaveChildren","canHaveHTML","canPlayType","cancel","cancelAnimationFrame","cancelBubble","cancelScheduledValues","cancelable","candidate","canvas","caption","caption-side","captionSide","capture","captureEvents","captureStackTrace","caretPositionFromPoint","caretRangeFromPoint","cast","catch","category","cbrt","cd","ceil","cellIndex","cellPadding","cellSpacing","cells","ch","chOff","chain","challenge","changedTouches","channel","channelCount","channelCountMode","channelInterpretation","char","charAt","charCode","charCodeAt","charIndex","characterData","characterDataOldValue","characterSet","charging","chargingTime","charset","checkEnclosure","checkFramebufferStatus","checkIntersection","checkValidity","checked","childElementCount","childList","childNodes","children","chrome","ciphertext","cite","classList","className","classid","clear","clearAttributes","clearColor","clearData","clearDepth","clearImmediate","clearInterval","clearMarks","clearMeasures","clearParameters","clearRect","clearResourceTimings","clearShadow","clearStencil","clearTimeout","clearWatch","click","clickCount","clientHeight","clientInformation","clientLeft","clientRect","clientRects","clientTop","clientWidth","clientX","clientY","clip","clip-path","clip-rule","clipBottom","clipLeft","clipPath","clipPathUnits","clipRight","clipRule","clipTop","clipboardData","clone","cloneContents","cloneNode","cloneRange","close","closePath","closed","closest","clz","clz32","cmp","code","codeBase","codePointAt","codeType","colSpan","collapse","collapseToEnd","collapseToStart","collapsed","collect","colno","color","color-interpolation","color-interpolation-filters","colorDepth","colorInterpolation","colorInterpolationFilters","colorMask","colorType","cols","columnCount","columnFill","columnGap","columnNumber","columnRule","columnRuleColor","columnRuleStyle","columnRuleWidth","columnSpan","columnWidth","columns","command","commitPreferences","commonAncestorContainer","compact","compareBoundaryPoints","compareDocumentPosition","compareEndPoints","compareNode","comparePoint","compatMode","compatible","compile","compileShader","complete","componentFromPoint","compositionEndOffset","compositionStartOffset","compressedTexImage2D","compressedTexSubImage2D","concat","conditionText","coneInnerAngle","coneOuterAngle","coneOuterGain","confirm","confirmComposition","confirmSiteSpecificTrackingException","confirmWebWideTrackingException","connect","connectEnd","connectStart","connected","connection","connectionSpeed","console","consolidate","constrictionActive","constructor","contactID","contains","containsNode","content","contentDocument","contentEditable","contentOverflow","contentScriptType","contentStyleType","contentType","contentWindow","context","contextMenu","contextmenu","continue","continuous","control","controller","controls","convertToSpecifiedUnits","cookie","cookieEnabled","coords","copyFromChannel","copyTexImage2D","copyTexSubImage2D","copyToChannel","copyWithin","correspondingElement","correspondingUseElement","cos","cosh","count","counter-increment","counter-reset","counterIncrement","counterReset","cpuClass","cpuSleepAllowed","create","createAnalyser","createAnswer","createAttribute","createAttributeNS","createBiquadFilter","createBuffer","createBufferSource","createCDATASection","createCSSStyleSheet","createCaption","createChannelMerger","createChannelSplitter","createComment","createContextualFragment","createControlRange","createConvolver","createDTMFSender","createDataChannel","createDelay","createDelayNode","createDocument","createDocumentFragment","createDocumentType","createDynamicsCompressor","createElement","createElementNS","createEntityReference","createEvent","createEventObject","createExpression","createFramebuffer","createFunction","createGain","createGainNode","createHTMLDocument","createImageBitmap","createImageData","createIndex","createJavaScriptNode","createLinearGradient","createMediaElementSource","createMediaKeys","createMediaStreamDestination","createMediaStreamSource","createMutableFile","createNSResolver","createNodeIterator","createNotification","createObjectStore","createObjectURL","createOffer","createOscillator","createPanner","createPattern","createPeriodicWave","createPopup","createProcessingInstruction","createProgram","createRadialGradient","createRange","createRangeCollection","createRenderbuffer","createSVGAngle","createSVGLength","createSVGMatrix","createSVGNumber","createSVGPathSegArcAbs","createSVGPathSegArcRel","createSVGPathSegClosePath","createSVGPathSegCurvetoCubicAbs","createSVGPathSegCurvetoCubicRel","createSVGPathSegCurvetoCubicSmoothAbs","createSVGPathSegCurvetoCubicSmoothRel","createSVGPathSegCurvetoQuadraticAbs","createSVGPathSegCurvetoQuadraticRel","createSVGPathSegCurvetoQuadraticSmoothAbs","createSVGPathSegCurvetoQuadraticSmoothRel","createSVGPathSegLinetoAbs","createSVGPathSegLinetoHorizontalAbs","createSVGPathSegLinetoHorizontalRel","createSVGPathSegLinetoRel","createSVGPathSegLinetoVerticalAbs","createSVGPathSegLinetoVerticalRel","createSVGPathSegMovetoAbs","createSVGPathSegMovetoRel","createSVGPoint","createSVGRect","createSVGTransform","createSVGTransformFromMatrix","createScriptProcessor","createSession","createShader","createShadowRoot","createStereoPanner","createStyleSheet","createTBody","createTFoot","createTHead","createTextNode","createTextRange","createTexture","createTouch","createTouchList","createTreeWalker","createWaveShaper","creationTime","crossOrigin","crypto","csi","cssFloat","cssRules","cssText","cssValueType","ctrlKey","ctrlLeft","cues","cullFace","currentNode","currentPage","currentScale","currentScript","currentSrc","currentState","currentStyle","currentTarget","currentTime","currentTranslate","currentView","cursor","curve","customError","cx","cy","d","data","dataFld","dataFormatAs","dataPageSize","dataSrc","dataTransfer","database","dataset","dateTime","db","debug","debuggerEnabled","declare","decode","decodeAudioData","decodeURI","decodeURIComponent","decodingInfo","decrypt","default","defaultCharset","defaultChecked","defaultMuted","defaultPlaybackRate","defaultPrevented","defaultSelected","defaultStatus","defaultURL","defaultValue","defaultView","defaultstatus","defer","defineMagicFunction","defineMagicVariable","defineProperties","defineProperty","delayTime","delete","deleteBuffer","deleteCaption","deleteCell","deleteContents","deleteData","deleteDatabase","deleteFramebuffer","deleteFromDocument","deleteIndex","deleteMedium","deleteObjectStore","deleteProgram","deleteRenderbuffer","deleteRow","deleteRule","deleteShader","deleteTFoot","deleteTHead","deleteTexture","deliverChangeRecords","delivery","deliveryInfo","deliveryStatus","deliveryTimestamp","delta","deltaMode","deltaX","deltaY","deltaZ","depthFunc","depthMask","depthRange","deriveBits","deriveKey","description","deselectAll","designMode","destination","destinationURL","detach","detachEvent","detachShader","detail","detune","devicePixelRatio","deviceXDPI","deviceYDPI","diffuseConstant","digest","dimensions","dir","dirName","direction","dirxml","disable","disableVertexAttribArray","disabled","dischargingTime","disconnect","dispatchEvent","display","distanceModel","divisor","djsapi","djsproxy","doImport","doNotTrack","doScroll","doctype","document","documentElement","documentMode","documentURI","dolphin","dolphinGameCenter","dolphininfo","dolphinmeta","domComplete","domContentLoadedEventEnd","domContentLoadedEventStart","domInteractive","domLoading","domain","domainLookupEnd","domainLookupStart","dominant-baseline","dominantBaseline","done","dopplerFactor","download","dragDrop","draggable","drawArrays","drawArraysInstancedANGLE","drawCustomFocusRing","drawElements","drawElementsInstancedANGLE","drawFocusIfNeeded","drawImage","drawImageFromRect","drawSystemFocusRing","drawingBufferHeight","drawingBufferWidth","dropEffect","droppedVideoFrames","dropzone","dump","duplicate","duration","dvname","dvnum","dx","dy","dynsrc","e","edgeMode","effectAllowed","elapsedTime","elementFromPoint","elements","elevation","ellipse","email","embeds","empty","empty-cells","emptyCells","enable","enableBackground","enableStyleSheetsForSet","enableVertexAttribArray","enabled","enabledPlugin","encode","encodeURI","encodeURIComponent","encoding","encrypt","enctype","end","endContainer","endElement","endElementAt","endOfStream","endOffset","endTime","ended","endsWith","entities","entries","entryType","enumerate","enumerateEditable","error","errorCode","escape","eval","evaluate","event","eventPhase","every","exception","exec","execCommand","execCommandShowHelp","execScript","exitFullscreen","exitPointerLock","exp","expand","expandEntityReferences","expando","expansion","expiryDate","explicitOriginalTarget","expm1","exponent","exponentialRampToValueAtTime","exportKey","extend","extensions","extentNode","extentOffset","external","externalResourcesRequired","extractContents","extractable","f","face","factoryReset","fallback","familyName","farthestViewportElement","fastSeek","fatal","fetch","fetchStart","fftSize","fgColor","fileCreatedDate","fileHandle","fileModifiedDate","fileName","fileSize","fileUpdatedDate","filename","files","fill","fill-opacity","fill-rule","fillOpacity","fillRect","fillRule","fillStyle","fillText","filter","filterResX","filterResY","filterUnits","filters","finally","find","findIndex","findRule","findText","finish","fireEvent","firstChild","firstElementChild","firstPage","fixed","flex","flex-basis","flex-direction","flex-flow","flex-grow","flex-shrink","flex-wrap","flexBasis","flexDirection","flexFlow","flexGrow","flexShrink","flexWrap","flipX","flipY","float","flood-color","flood-opacity","floodColor","floodOpacity","floor","flush","focus","focusNode","focusOffset","font","font-family","font-feature-settings","font-kerning","font-language-override","font-size","font-size-adjust","font-stretch","font-style","font-synthesis","font-variant","font-variant-alternates","font-variant-caps","font-variant-east-asian","font-variant-ligatures","font-variant-numeric","font-variant-position","font-weight","fontFamily","fontFeatureSettings","fontKerning","fontLanguageOverride","fontSize","fontSizeAdjust","fontSmoothingEnabled","fontStretch","fontStyle","fontSynthesis","fontVariant","fontVariantAlternates","fontVariantCaps","fontVariantEastAsian","fontVariantLigatures","fontVariantNumeric","fontVariantPosition","fontWeight","fontcolor","fonts","fontsize","for","forEach","forceRedraw","form","formAction","formEnctype","formMethod","formNoValidate","formTarget","format","formatToParts","forms","forward","fr","frame","frameBorder","frameElement","frameSpacing","framebufferRenderbuffer","framebufferTexture2D","frames","freeSpace","freeze","frequency","frequencyBinCount","from","fromCharCode","fromCodePoint","fromElement","frontFace","fround","fullScreen","fullscreenElement","fullscreenEnabled","fx","fy","gain","gamepad","gamma","genderIdentity","generateKey","generateMipmap","generateRequest","geolocation","gestureObject","get","getActiveAttrib","getActiveUniform","getAdjacentText","getAll","getAllResponseHeaders","getAsFile","getAsString","getAttachedShaders","getAttribLocation","getAttribute","getAttributeNS","getAttributeNode","getAttributeNodeNS","getAudioTracks","getBBox","getBattery","getBlob","getBookmark","getBoundingClientRect","getBufferParameter","getByteFrequencyData","getByteTimeDomainData","getCSSCanvasContext","getCTM","getCandidateWindowClientRect","getChannelData","getCharNumAtPosition","getClientRect","getClientRects","getCompositionAlternatives","getComputedStyle","getComputedTextLength","getConfiguration","getContext","getContextAttributes","getCounterValue","getCueAsHTML","getCueById","getCurrentPosition","getCurrentTime","getData","getDatabaseNames","getDate","getDay","getDefaultComputedStyle","getDestinationInsertionPoints","getDistributedNodes","getEditable","getElementById","getElementsByClassName","getElementsByName","getElementsByTagName","getElementsByTagNameNS","getEnclosureList","getEndPositionOfChar","getEntries","getEntriesByName","getEntriesByType","getError","getExtension","getExtentOfChar","getFeature","getFile","getFloat32","getFloat64","getFloatFrequencyData","getFloatTimeDomainData","getFloatValue","getFramebufferAttachmentParameter","getFrequencyResponse","getFullYear","getGamepads","getHours","getImageData","getInt16","getInt32","getInt8","getIntersectionList","getItem","getItems","getKey","getLineDash","getLocalStreams","getMarks","getMatchedCSSRules","getMeasures","getMetadata","getMilliseconds","getMinutes","getModifierState","getMonth","getNamedItem","getNamedItemNS","getNotifier","getNumberOfChars","getOverrideHistoryNavigationMode","getOverrideStyle","getOwnPropertyDescriptor","getOwnPropertyNames","getOwnPropertySymbols","getParameter","getPathSegAtLength","getPointAtLength","getPreference","getPreferenceDefault","getPresentationAttribute","getPreventDefault","getProgramInfoLog","getProgramParameter","getPropertyCSSValue","getPropertyPriority","getPropertyShorthand","getPropertyValue","getPrototypeOf","getRGBColorValue","getRandomValues","getRangeAt","getReceivers","getRectValue","getRegistration","getRemoteStreams","getRenderbufferParameter","getResponseHeader","getRoot","getRotationOfChar","getSVGDocument","getScreenCTM","getSeconds","getSelection","getSenders","getShaderInfoLog","getShaderParameter","getShaderPrecisionFormat","getShaderSource","getSimpleDuration","getSiteIcons","getSources","getSpeculativeParserUrls","getStartPositionOfChar","getStartTime","getStats","getStorageUpdates","getStreamById","getStringValue","getSubStringLength","getSubscription","getSupportedExtensions","getTexParameter","getTime","getTimezoneOffset","getTotalLength","getTrackById","getTracks","getTransformToElement","getUTCDate","getUTCDay","getUTCFullYear","getUTCHours","getUTCMilliseconds","getUTCMinutes","getUTCMonth","getUTCSeconds","getUint16","getUint32","getUint8","getUniform","getUniformLocation","getUserMedia","getValues","getVarDate","getVariableValue","getVertexAttrib","getVertexAttribOffset","getVideoPlaybackQuality","getVideoTracks","getWakeLockState","getYear","givenName","global","globalAlpha","globalCompositeOperation","glyphOrientationHorizontal","glyphOrientationVertical","glyphRef","go","gradientTransform","gradientUnits","grammars","green","group","groupCollapsed","groupEnd","hardwareConcurrency","has","hasAttribute","hasAttributeNS","hasAttributes","hasChildNodes","hasComposition","hasExtension","hasFeature","hasFocus","hasLayout","hasOwnProperty","hash","head","headers","heading","height","hidden","hide","hideFocus","high","hint","history","honorificPrefix","honorificSuffix","horizontalOverflow","host","hostname","href","hreflang","hspace","html5TagCheckInerface","htmlFor","htmlText","httpEquiv","hwTimestamp","hypot","iccId","iceConnectionState","iceGatheringState","icon","id","identifier","identity","ignoreBOM","ignoreCase","image-orientation","image-rendering","imageOrientation","imageRendering","images","ime-mode","imeMode","implementation","importKey","importNode","importStylesheet","imports","impp","imul","in1","in2","inBandMetadataTrackDispatchType","inRange","includes","incremental","indeterminate","index","indexNames","indexOf","indexedDB","inertiaDestinationX","inertiaDestinationY","info","init","initAnimationEvent","initBeforeLoadEvent","initClipboardEvent","initCloseEvent","initCommandEvent","initCompositionEvent","initCustomEvent","initData","initDeviceMotionEvent","initDeviceOrientationEvent","initDragEvent","initErrorEvent","initEvent","initFocusEvent","initGestureEvent","initHashChangeEvent","initKeyEvent","initKeyboardEvent","initMSManipulationEvent","initMessageEvent","initMouseEvent","initMouseScrollEvent","initMouseWheelEvent","initMutationEvent","initNSMouseEvent","initOverflowEvent","initPageEvent","initPageTransitionEvent","initPointerEvent","initPopStateEvent","initProgressEvent","initScrollAreaEvent","initSimpleGestureEvent","initStorageEvent","initTextEvent","initTimeEvent","initTouchEvent","initTransitionEvent","initUIEvent","initWebKitAnimationEvent","initWebKitTransitionEvent","initWebKitWheelEvent","initWheelEvent","initialTime","initialize","initiatorType","inner","innerHTML","innerHeight","innerText","innerWidth","input","inputBuffer","inputEncoding","inputMethod","insertAdjacentElement","insertAdjacentHTML","insertAdjacentText","insertBefore","insertCell","insertData","insertItemBefore","insertNode","insertRow","insertRule","instanceRoot","intercept","interimResults","internalSubset","intersectsNode","interval","invalidIteratorState","inverse","invertSelf","is","is2D","isAlternate","isArray","isBingCurrentSearchDefault","isBuffer","isCandidateWindowVisible","isChar","isCollapsed","isComposing","isContentEditable","isContentHandlerRegistered","isContextLost","isDefaultNamespace","isDisabled","isEnabled","isEqual","isEqualNode","isExtensible","isFinite","isFramebuffer","isFrozen","isGenerator","isId","isInjected","isInteger","isMap","isMultiLine","isNaN","isOpen","isPointInFill","isPointInPath","isPointInRange","isPointInStroke","isPrefAlternate","isPrimary","isProgram","isPropertyImplicit","isProtocolHandlerRegistered","isPrototypeOf","isRenderbuffer","isSafeInteger","isSameNode","isSealed","isShader","isSupported","isTextEdit","isTexture","isTrusted","isTypeSupported","isView","isolation","italics","item","itemId","itemProp","itemRef","itemScope","itemType","itemValue","iterateNext","iterator","javaEnabled","jobTitle","join","json","justify-content","justifyContent","k1","k2","k3","k4","kernelMatrix","kernelUnitLengthX","kernelUnitLengthY","kerning","key","keyCode","keyFor","keyIdentifier","keyLightEnabled","keyLocation","keyPath","keySystem","keyText","keyUsage","keys","keytype","kind","knee","label","labels","lang","language","languages","largeArcFlag","lastChild","lastElementChild","lastEventId","lastIndex","lastIndexOf","lastMatch","lastMessageSubject","lastMessageType","lastModified","lastModifiedDate","lastPage","lastParen","lastState","lastStyleSheetSet","latitude","layerX","layerY","layoutFlow","layoutGrid","layoutGridChar","layoutGridLine","layoutGridMode","layoutGridType","lbound","left","leftContext","leftMargin","length","lengthAdjust","lengthComputable","letter-spacing","letterSpacing","level","lighting-color","lightingColor","limitingConeAngle","line","line-height","lineAlign","lineBreak","lineCap","lineDashOffset","lineHeight","lineJoin","lineNumber","lineTo","lineWidth","linearRampToValueAtTime","lineno","link","linkColor","linkProgram","links","list","list-style","list-style-image","list-style-position","list-style-type","listStyle","listStyleImage","listStylePosition","listStyleType","listener","load","loadEventEnd","loadEventStart","loadTimes","loaded","localDescription","localName","localStorage","locale","localeCompare","location","locationbar","lock","lockedFile","log","log10","log1p","log2","logicalXDPI","logicalYDPI","longDesc","longitude","lookupNamespaceURI","lookupPrefix","loop","loopEnd","loopStart","looping","low","lower","lowerBound","lowerOpen","lowsrc","m11","m12","m13","m14","m21","m22","m23","m24","m31","m32","m33","m34","m41","m42","m43","m44","manifest","map","mapping","margin","margin-bottom","margin-left","margin-right","margin-top","marginBottom","marginHeight","marginLeft","marginRight","marginTop","marginWidth","mark","marker","marker-end","marker-mid","marker-offset","marker-start","markerEnd","markerHeight","markerMid","markerOffset","markerStart","markerUnits","markerWidth","marks","mask","mask-type","maskContentUnits","maskType","maskUnits","match","matchMedia","matchMedium","matches","matrix","matrixTransform","max","max-height","max-width","maxAlternatives","maxChannelCount","maxConnectionsPerServer","maxDecibels","maxDistance","maxHeight","maxLength","maxTouchPoints","maxValue","maxWidth","measure","measureText","media","mediaCapabilities","mediaDevices","mediaElement","mediaGroup","mediaKeys","mediaText","meetOrSlice","memory","menubar","mergeAttributes","message","messageClass","messageHandlers","metaKey","method","mimeType","mimeTypes","min","min-height","min-width","minDecibels","minHeight","minValue","minWidth","miterLimit","mix-blend-mode","mixBlendMode","mode","modify","mount","move","moveBy","moveEnd","moveFirst","moveFocusDown","moveFocusLeft","moveFocusRight","moveFocusUp","moveNext","moveRow","moveStart","moveTo","moveToBookmark","moveToElementText","moveToPoint","mozAdd","mozAnimationStartTime","mozAnon","mozApps","mozAudioCaptured","mozAudioChannelType","mozAutoplayEnabled","mozCancelAnimationFrame","mozCancelFullScreen","mozCancelRequestAnimationFrame","mozCaptureStream","mozCaptureStreamUntilEnded","mozClearDataAt","mozContact","mozContacts","mozCreateFileHandle","mozCurrentTransform","mozCurrentTransformInverse","mozCursor","mozDash","mozDashOffset","mozDecodedFrames","mozExitPointerLock","mozFillRule","mozFragmentEnd","mozFrameDelay","mozFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozGetAll","mozGetAllKeys","mozGetAsFile","mozGetDataAt","mozGetMetadata","mozGetUserMedia","mozHasAudio","mozHasItem","mozHidden","mozImageSmoothingEnabled","mozIndexedDB","mozInnerScreenX","mozInnerScreenY","mozInputSource","mozIsTextField","mozItem","mozItemCount","mozItems","mozLength","mozLockOrientation","mozMatchesSelector","mozMovementX","mozMovementY","mozOpaque","mozOrientation","mozPaintCount","mozPaintedFrames","mozParsedFrames","mozPay","mozPointerLockElement","mozPresentedFrames","mozPreservesPitch","mozPressure","mozPrintCallback","mozRTCIceCandidate","mozRTCPeerConnection","mozRTCSessionDescription","mozRemove","mozRequestAnimationFrame","mozRequestFullScreen","mozRequestPointerLock","mozSetDataAt","mozSetImageElement","mozSourceNode","mozSrcObject","mozSystem","mozTCPSocket","mozTextStyle","mozTypesAt","mozUnlockOrientation","mozUserCancelled","mozVisibilityState","msAnimation","msAnimationDelay","msAnimationDirection","msAnimationDuration","msAnimationFillMode","msAnimationIterationCount","msAnimationName","msAnimationPlayState","msAnimationStartTime","msAnimationTimingFunction","msBackfaceVisibility","msBlockProgression","msCSSOMElementFloatMetrics","msCaching","msCachingEnabled","msCancelRequestAnimationFrame","msCapsLockWarningOff","msClearImmediate","msClose","msContentZoomChaining","msContentZoomFactor","msContentZoomLimit","msContentZoomLimitMax","msContentZoomLimitMin","msContentZoomSnap","msContentZoomSnapPoints","msContentZoomSnapType","msContentZooming","msConvertURL","msCrypto","msDoNotTrack","msElementsFromPoint","msElementsFromRect","msExitFullscreen","msExtendedCode","msFillRule","msFirstPaint","msFlex","msFlexAlign","msFlexDirection","msFlexFlow","msFlexItemAlign","msFlexLinePack","msFlexNegative","msFlexOrder","msFlexPack","msFlexPositive","msFlexPreferredSize","msFlexWrap","msFlowFrom","msFlowInto","msFontFeatureSettings","msFullscreenElement","msFullscreenEnabled","msGetInputContext","msGetRegionContent","msGetUntransformedBounds","msGraphicsTrustStatus","msGridColumn","msGridColumnAlign","msGridColumnSpan","msGridColumns","msGridRow","msGridRowAlign","msGridRowSpan","msGridRows","msHidden","msHighContrastAdjust","msHyphenateLimitChars","msHyphenateLimitLines","msHyphenateLimitZone","msHyphens","msImageSmoothingEnabled","msImeAlign","msIndexedDB","msInterpolationMode","msIsStaticHTML","msKeySystem","msKeys","msLaunchUri","msLockOrientation","msManipulationViewsEnabled","msMatchMedia","msMatchesSelector","msMaxTouchPoints","msOrientation","msOverflowStyle","msPerspective","msPerspectiveOrigin","msPlayToDisabled","msPlayToPreferredSourceUri","msPlayToPrimary","msPointerEnabled","msRegionOverflow","msReleasePointerCapture","msRequestAnimationFrame","msRequestFullscreen","msSaveBlob","msSaveOrOpenBlob","msScrollChaining","msScrollLimit","msScrollLimitXMax","msScrollLimitXMin","msScrollLimitYMax","msScrollLimitYMin","msScrollRails","msScrollSnapPointsX","msScrollSnapPointsY","msScrollSnapType","msScrollSnapX","msScrollSnapY","msScrollTranslation","msSetImmediate","msSetMediaKeys","msSetPointerCapture","msTextCombineHorizontal","msTextSizeAdjust","msToBlob","msTouchAction","msTouchSelect","msTraceAsyncCallbackCompleted","msTraceAsyncCallbackStarting","msTraceAsyncOperationCompleted","msTraceAsyncOperationStarting","msTransform","msTransformOrigin","msTransformStyle","msTransition","msTransitionDelay","msTransitionDuration","msTransitionProperty","msTransitionTimingFunction","msUnlockOrientation","msUpdateAsyncCallbackRelation","msUserSelect","msVisibilityState","msWrapFlow","msWrapMargin","msWrapThrough","msWriteProfilerMark","msZoom","msZoomTo","mt","multiEntry","multiSelectionObj","multiline","multiple","multiply","multiplySelf","mutableFile","muted","n","name","nameProp","namedItem","namedRecordset","names","namespaceURI","namespaces","naturalHeight","naturalWidth","navigate","navigation","navigationMode","navigationStart","navigator","near","nearestViewportElement","negative","netscape","networkState","newScale","newTranslate","newURL","newValue","newValueSpecifiedUnits","newVersion","newhome","next","nextElementSibling","nextNode","nextPage","nextSibling","nickname","noHref","noResize","noShade","noValidate","noWrap","nodeName","nodeType","nodeValue","normalize","normalizedPathSegList","notationName","notations","note","noteGrainOn","noteOff","noteOn","now","numOctaves","number","numberOfChannels","numberOfInputs","numberOfItems","numberOfOutputs","numberValue","oMatchesSelector","object","object-fit","object-position","objectFit","objectPosition","objectStore","objectStoreNames","observe","of","offscreenBuffering","offset","offsetHeight","offsetLeft","offsetNode","offsetParent","offsetTop","offsetWidth","offsetX","offsetY","ok","oldURL","oldValue","oldVersion","olderShadowRoot","onLine","onabort","onactivate","onactive","onaddstream","onaddtrack","onafterprint","onafterscriptexecute","onafterupdate","onaudioend","onaudioprocess","onaudiostart","onautocomplete","onautocompleteerror","onbeforeactivate","onbeforecopy","onbeforecut","onbeforedeactivate","onbeforeeditfocus","onbeforepaste","onbeforeprint","onbeforescriptexecute","onbeforeunload","onbeforeupdate","onblocked","onblur","onbounce","onboundary","oncached","oncancel","oncandidatewindowhide","oncandidatewindowshow","oncandidatewindowupdate","oncanplay","oncanplaythrough","once","oncellchange","onchange","onchargingchange","onchargingtimechange","onchecking","onclick","onclose","oncompassneedscalibration","oncomplete","oncontextmenu","oncontrolselect","oncopy","oncuechange","oncut","ondataavailable","ondatachannel","ondatasetchanged","ondatasetcomplete","ondblclick","ondeactivate","ondevicelight","ondevicemotion","ondeviceorientation","ondeviceproximity","ondischargingtimechange","ondisplay","ondownloading","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onencrypted","onend","onended","onenter","onerror","onerrorupdate","onexit","onfilterchange","onfinish","onfocus","onfocusin","onfocusout","onfullscreenchange","onfullscreenerror","ongesturechange","ongestureend","ongesturestart","ongotpointercapture","onhashchange","onhelp","onicecandidate","oniceconnectionstatechange","oninactive","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onlanguagechange","onlayoutcomplete","onlevelchange","onload","onloadeddata","onloadedmetadata","onloadend","onloadstart","onlosecapture","onlostpointercapture","only","onmark","onmessage","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup","onmousewheel","onmove","onmoveend","onmovestart","onmozfullscreenchange","onmozfullscreenerror","onmozorientationchange","onmozpointerlockchange","onmozpointerlockerror","onmscontentzoom","onmsfullscreenchange","onmsfullscreenerror","onmsgesturechange","onmsgesturedoubletap","onmsgestureend","onmsgesturehold","onmsgesturestart","onmsgesturetap","onmsgotpointercapture","onmsinertiastart","onmslostpointercapture","onmsmanipulationstatechanged","onmsneedkey","onmsorientationchange","onmspointercancel","onmspointerdown","onmspointerenter","onmspointerhover","onmspointerleave","onmspointermove","onmspointerout","onmspointerover","onmspointerup","onmssitemodejumplistitemremoved","onmsthumbnailclick","onnegotiationneeded","onnomatch","onnoupdate","onobsolete","onoffline","ononline","onopen","onorientationchange","onpagechange","onpagehide","onpageshow","onpaste","onpause","onplay","onplaying","onpluginstreamstart","onpointercancel","onpointerdown","onpointerenter","onpointerleave","onpointerlockchange","onpointerlockerror","onpointermove","onpointerout","onpointerover","onpointerup","onpopstate","onprogress","onpropertychange","onratechange","onreadystatechange","onremovestream","onremovetrack","onreset","onresize","onresizeend","onresizestart","onresourcetimingbufferfull","onresult","onresume","onrowenter","onrowexit","onrowsdelete","onrowsinserted","onscroll","onsearch","onseeked","onseeking","onselect","onselectionchange","onselectstart","onshow","onsignalingstatechange","onsoundend","onsoundstart","onspeechend","onspeechstart","onstalled","onstart","onstatechange","onstop","onstorage","onstoragecommit","onsubmit","onsuccess","onsuspend","ontextinput","ontimeout","ontimeupdate","ontoggle","ontouchcancel","ontouchend","ontouchmove","ontouchstart","ontransitionend","onunload","onupdateready","onupgradeneeded","onuserproximity","onversionchange","onvoiceschanged","onvolumechange","onwaiting","onwarning","onwebkitanimationend","onwebkitanimationiteration","onwebkitanimationstart","onwebkitcurrentplaybacktargetiswirelesschanged","onwebkitfullscreenchange","onwebkitfullscreenerror","onwebkitkeyadded","onwebkitkeyerror","onwebkitkeymessage","onwebkitneedkey","onwebkitorientationchange","onwebkitplaybacktargetavailabilitychanged","onwebkitpointerlockchange","onwebkitpointerlockerror","onwebkitresourcetimingbufferfull","onwebkittransitionend","onwheel","onzoom","opacity","open","openCursor","openDatabase","openKeyCursor","opener","opera","operationType","operator","opr","optimum","options","order","orderX","orderY","ordered","org","orient","orientAngle","orientType","orientation","origin","originalTarget","orphans","oscpu","outerHTML","outerHeight","outerText","outerWidth","outline","outline-color","outline-offset","outline-style","outline-width","outlineColor","outlineOffset","outlineStyle","outlineWidth","outputBuffer","overflow","overflow-x","overflow-y","overflowX","overflowY","overrideMimeType","oversample","ownerDocument","ownerElement","ownerNode","ownerRule","ownerSVGElement","owningElement","p1","p2","p3","p4","pad","padding","padding-bottom","padding-left","padding-right","padding-top","paddingBottom","paddingLeft","paddingRight","paddingTop","page","page-break-after","page-break-before","page-break-inside","pageBreakAfter","pageBreakBefore","pageBreakInside","pageCount","pageX","pageXOffset","pageY","pageYOffset","pages","paint-order","paintOrder","paintRequests","paintType","palette","panningModel","parent","parentElement","parentNode","parentRule","parentStyleSheet","parentTextEdit","parentWindow","parse","parseFloat","parseFromString","parseInt","participants","passive","password","pasteHTML","path","pathLength","pathSegList","pathSegType","pathSegTypeAsLetter","pathname","pattern","patternContentUnits","patternMismatch","patternTransform","patternUnits","pause","pauseAnimations","pauseOnExit","paused","pending","performance","permission","persisted","personalbar","perspective","perspective-origin","perspectiveOrigin","phoneticFamilyName","phoneticGivenName","photo","ping","pitch","pixelBottom","pixelDepth","pixelHeight","pixelLeft","pixelRight","pixelStorei","pixelTop","pixelUnitToMillimeterX","pixelUnitToMillimeterY","pixelWidth","placeholder","platform","play","playbackRate","playbackState","playbackTime","played","plugins","pluginspage","pname","pointer-events","pointerBeforeReferenceNode","pointerEnabled","pointerEvents","pointerId","pointerLockElement","pointerType","points","pointsAtX","pointsAtY","pointsAtZ","polygonOffset","pop","popupWindowFeatures","popupWindowName","popupWindowURI","port","port1","port2","ports","posBottom","posHeight","posLeft","posRight","posTop","posWidth","position","positionAlign","postError","postMessage","poster","pow","powerOff","preMultiplySelf","precision","preferredStyleSheetSet","preferredStylesheetSet","prefix","preload","prepend","preserveAlpha","preserveAspectRatio","preserveAspectRatioString","pressed","pressure","prevValue","preventDefault","preventExtensions","previousElementSibling","previousNode","previousPage","previousScale","previousSibling","previousTranslate","primaryKey","primitiveType","primitiveUnits","principals","print","privateKey","probablySupportsContext","process","processIceMessage","product","productSub","profile","profileEnd","profiles","prompt","properties","propertyIsEnumerable","propertyName","protocol","protocolLong","prototype","pseudoClass","pseudoElement","publicId","publicKey","published","push","pushNotification","pushState","put","putImageData","quadraticCurveTo","qualifier","queryCommandEnabled","queryCommandIndeterm","queryCommandState","queryCommandSupported","queryCommandText","queryCommandValue","querySelector","querySelectorAll","quote","quotes","r","r1","r2","race","radiogroup","radiusX","radiusY","random","range","rangeCount","rangeMax","rangeMin","rangeOffset","rangeOverflow","rangeParent","rangeUnderflow","rate","ratio","raw","read","readAsArrayBuffer","readAsBinaryString","readAsBlob","readAsDataURL","readAsText","readOnly","readPixels","readReportRequested","readyState","reason","reboot","receiver","receivers","recordNumber","recordset","rect","red","redirectCount","redirectEnd","redirectStart","reduce","reduceRight","reduction","refDistance","refX","refY","referenceNode","referrer","refresh","region","regionAnchorX","regionAnchorY","regionId","regions","register","registerContentHandler","registerElement","registerProtocolHandler","reject","rel","relList","relatedNode","relatedTarget","release","releaseCapture","releaseEvents","releasePointerCapture","releaseShaderCompiler","reliable","reload","remainingSpace","remoteDescription","remove","removeAllRanges","removeAttribute","removeAttributeNS","removeAttributeNode","removeBehavior","removeChild","removeCue","removeEventListener","removeFilter","removeImport","removeItem","removeListener","removeNamedItem","removeNamedItemNS","removeNode","removeParameter","removeProperty","removeRange","removeRegion","removeRule","removeSiteSpecificTrackingException","removeSourceBuffer","removeStream","removeTrack","removeVariable","removeWakeLockListener","removeWebWideTrackingException","removedNodes","renderbufferStorage","renderedBuffer","renderingMode","repeat","replace","replaceAdjacentText","replaceChild","replaceData","replaceId","replaceItem","replaceNode","replaceState","replaceTrack","replaceWholeText","reportValidity","requestAnimationFrame","requestAutocomplete","requestData","requestFullscreen","requestMediaKeySystemAccess","requestPermission","requestPointerLock","requestStart","requestingWindow","required","requiredExtensions","requiredFeatures","reset","resetTransform","resize","resizeBy","resizeTo","resolve","response","responseBody","responseEnd","responseStart","responseText","responseType","responseURL","responseXML","restore","result","resultType","resume","returnValue","rev","reverse","reversed","revocable","revokeObjectURL","rgbColor","right","rightContext","rightMargin","rolloffFactor","root","rootElement","rotate","rotateAxisAngle","rotateAxisAngleSelf","rotateFromVector","rotateFromVectorSelf","rotateSelf","rotation","rotationRate","round","rowIndex","rowSpan","rows","rubyAlign","rubyOverhang","rubyPosition","rules","runtime","runtimeStyle","rx","ry","safari","sampleCoverage","sampleRate","sandbox","save","scale","scale3d","scale3dSelf","scaleNonUniform","scaleNonUniformSelf","scaleSelf","scheme","scissor","scope","scopeName","scoped","screen","screenBrightness","screenEnabled","screenLeft","screenPixelToMillimeterX","screenPixelToMillimeterY","screenTop","screenX","screenY","scripts","scroll","scroll-behavior","scrollAmount","scrollBehavior","scrollBy","scrollByLines","scrollByPages","scrollDelay","scrollHeight","scrollIntoView","scrollIntoViewIfNeeded","scrollLeft","scrollLeftMax","scrollMaxX","scrollMaxY","scrollTo","scrollTop","scrollTopMax","scrollWidth","scrollX","scrollY","scrollbar3dLightColor","scrollbarArrowColor","scrollbarBaseColor","scrollbarDarkShadowColor","scrollbarFaceColor","scrollbarHighlightColor","scrollbarShadowColor","scrollbarTrackColor","scrollbars","scrolling","sdp","sdpMLineIndex","sdpMid","seal","search","searchBox","searchBoxJavaBridge_","searchParams","sectionRowIndex","secureConnectionStart","security","seed","seekable","seeking","select","selectAllChildren","selectNode","selectNodeContents","selectNodes","selectSingleNode","selectSubString","selected","selectedIndex","selectedOptions","selectedStyleSheetSet","selectedStylesheetSet","selection","selectionDirection","selectionEnd","selectionStart","selector","selectorText","self","send","sendAsBinary","sendBeacon","sender","sentTimestamp","separator","serializeToString","serviceWorker","sessionId","sessionStorage","set","setActive","setAlpha","setAttribute","setAttributeNS","setAttributeNode","setAttributeNodeNS","setBaseAndExtent","setBingCurrentSearchDefault","setCapture","setColor","setCompositeOperation","setCurrentTime","setCustomValidity","setData","setDate","setDragImage","setEnd","setEndAfter","setEndBefore","setEndPoint","setFillColor","setFilterRes","setFloat32","setFloat64","setFloatValue","setFullYear","setHours","setImmediate","setInt16","setInt32","setInt8","setInterval","setItem","setLineCap","setLineDash","setLineJoin","setLineWidth","setLocalDescription","setMatrix","setMatrixValue","setMediaKeys","setMilliseconds","setMinutes","setMiterLimit","setMonth","setNamedItem","setNamedItemNS","setNonUserCodeExceptions","setOrientToAngle","setOrientToAuto","setOrientation","setOverrideHistoryNavigationMode","setPaint","setParameter","setPeriodicWave","setPointerCapture","setPosition","setPreference","setProperty","setPrototypeOf","setRGBColor","setRGBColorICCColor","setRadius","setRangeText","setRemoteDescription","setRequestHeader","setResizable","setResourceTimingBufferSize","setRotate","setScale","setSeconds","setSelectionRange","setServerCertificate","setShadow","setSkewX","setSkewY","setStart","setStartAfter","setStartBefore","setStdDeviation","setStringValue","setStrokeColor","setSuggestResult","setTargetAtTime","setTargetValueAtTime","setTime","setTimeout","setTransform","setTranslate","setUTCDate","setUTCFullYear","setUTCHours","setUTCMilliseconds","setUTCMinutes","setUTCMonth","setUTCSeconds","setUint16","setUint32","setUint8","setUri","setValueAtTime","setValueCurveAtTime","setVariable","setVelocity","setVersion","setYear","settingName","settingValue","sex","shaderSource","shadowBlur","shadowColor","shadowOffsetX","shadowOffsetY","shadowRoot","shape","shape-rendering","shapeRendering","sheet","shift","shiftKey","shiftLeft","show","showHelp","showModal","showModalDialog","showModelessDialog","showNotification","sidebar","sign","signalingState","sin","singleNodeValue","sinh","size","sizeToContent","sizes","skewX","skewXSelf","skewY","skewYSelf","slice","slope","small","smil","smooth","smoothingTimeConstant","snapToLines","snapshotItem","snapshotLength","some","sort","source","sourceBuffer","sourceBuffers","sourceIndex","spacing","span","speakAs","speaking","specified","specularConstant","specularExponent","speechSynthesis","speed","speedOfSound","spellcheck","splice","split","splitText","spreadMethod","sqrt","src","srcElement","srcFilter","srcUrn","srcdoc","srclang","srcset","stack","stackTraceLimit","stacktrace","standalone","standby","start","startContainer","startIce","startOffset","startRendering","startTime","startsWith","state","status","statusMessage","statusText","statusbar","stdDeviationX","stdDeviationY","stencilFunc","stencilFuncSeparate","stencilMask","stencilMaskSeparate","stencilOp","stencilOpSeparate","step","stepDown","stepMismatch","stepUp","sticky","stitchTiles","stop","stop-color","stop-opacity","stopColor","stopImmediatePropagation","stopOpacity","stopPropagation","storageArea","storageName","storageStatus","storeSiteSpecificTrackingException","storeWebWideTrackingException","stpVersion","stream","strike","stringValue","stringify","stroke","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke-width","strokeDasharray","strokeDashoffset","strokeLinecap","strokeLinejoin","strokeMiterlimit","strokeOpacity","strokeRect","strokeStyle","strokeText","strokeWidth","style","styleFloat","styleMedia","styleSheet","styleSheetSets","styleSheets","sub","subarray","subject","submit","subscribe","substr","substring","substringData","subtle","subtree","suffix","suffixes","summary","sup","supports","surfaceScale","surroundContents","suspend","suspendRedraw","swapCache","swapNode","sweepFlag","symbols","system","systemCode","systemId","systemLanguage","systemXDPI","systemYDPI","tBodies","tFoot","tHead","tabIndex","table","table-layout","tableLayout","tableValues","tag","tagName","tagUrn","tags","taintEnabled","takeRecords","tan","tanh","target","targetElement","targetTouches","targetX","targetY","tel","terminate","test","texImage2D","texParameterf","texParameteri","texSubImage2D","text","text-align","text-anchor","text-decoration","text-decoration-color","text-decoration-line","text-decoration-style","text-indent","text-overflow","text-rendering","text-shadow","text-transform","textAlign","textAlignLast","textAnchor","textAutospace","textBaseline","textContent","textDecoration","textDecorationBlink","textDecorationColor","textDecorationLine","textDecorationLineThrough","textDecorationNone","textDecorationOverline","textDecorationStyle","textDecorationUnderline","textIndent","textJustify","textJustifyTrim","textKashida","textKashidaSpace","textLength","textOverflow","textRendering","textShadow","textTracks","textTransform","textUnderlinePosition","then","threadId","threshold","tiltX","tiltY","time","timeEnd","timeStamp","timeout","timestamp","timestampOffset","timing","title","toArray","toBlob","toDataURL","toDateString","toElement","toExponential","toFixed","toFloat32Array","toFloat64Array","toGMTString","toISOString","toJSON","toLocaleDateString","toLocaleFormat","toLocaleLowerCase","toLocaleString","toLocaleTimeString","toLocaleUpperCase","toLowerCase","toMethod","toPrecision","toSdp","toSource","toStaticHTML","toString","toStringTag","toTimeString","toUTCString","toUpperCase","toggle","toggleLongPressEnabled","tooLong","toolbar","top","topMargin","total","totalFrameDelay","totalVideoFrames","touchAction","touches","trace","track","transaction","transactions","transform","transform-origin","transform-style","transformOrigin","transformPoint","transformString","transformStyle","transformToDocument","transformToFragment","transition","transition-delay","transition-duration","transition-property","transition-timing-function","transitionDelay","transitionDuration","transitionProperty","transitionTimingFunction","translate","translateSelf","translationX","translationY","trim","trimLeft","trimRight","trueSpeed","trunc","truncate","type","typeDetail","typeMismatch","typeMustMatch","types","ubound","undefined","unescape","uneval","unicode-bidi","unicodeBidi","uniform1f","uniform1fv","uniform1i","uniform1iv","uniform2f","uniform2fv","uniform2i","uniform2iv","uniform3f","uniform3fv","uniform3i","uniform3iv","uniform4f","uniform4fv","uniform4i","uniform4iv","uniformMatrix2fv","uniformMatrix3fv","uniformMatrix4fv","unique","uniqueID","uniqueNumber","unitType","units","unloadEventEnd","unloadEventStart","unlock","unmount","unobserve","unpause","unpauseAnimations","unreadCount","unregister","unregisterContentHandler","unregisterProtocolHandler","unscopables","unselectable","unshift","unsubscribe","unsuspendRedraw","unsuspendRedrawAll","unwatch","unwrapKey","update","updateCommands","updateIce","updateInterval","updateSettings","updated","updating","upload","upper","upperBound","upperOpen","uri","url","urn","urns","usages","useCurrentView","useMap","useProgram","usedSpace","userAgent","userLanguage","username","v8BreakIterator","vAlign","vLink","valid","validateProgram","validationMessage","validity","value","valueAsDate","valueAsNumber","valueAsString","valueInSpecifiedUnits","valueMissing","valueOf","valueText","valueType","values","vector-effect","vectorEffect","velocityAngular","velocityExpansion","velocityX","velocityY","vendor","vendorSub","verify","version","vertexAttrib1f","vertexAttrib1fv","vertexAttrib2f","vertexAttrib2fv","vertexAttrib3f","vertexAttrib3fv","vertexAttrib4f","vertexAttrib4fv","vertexAttribDivisorANGLE","vertexAttribPointer","vertical","vertical-align","verticalAlign","verticalOverflow","vibrate","videoHeight","videoTracks","videoWidth","view","viewBox","viewBoxString","viewTarget","viewTargetString","viewport","viewportAnchorX","viewportAnchorY","viewportElement","visibility","visibilityState","visible","vlinkColor","voice","volume","vrml","vspace","w","wand","warn","wasClean","watch","watchPosition","webdriver","webkitAddKey","webkitAnimation","webkitAnimationDelay","webkitAnimationDirection","webkitAnimationDuration","webkitAnimationFillMode","webkitAnimationIterationCount","webkitAnimationName","webkitAnimationPlayState","webkitAnimationTimingFunction","webkitAppearance","webkitAudioContext","webkitAudioDecodedByteCount","webkitAudioPannerNode","webkitBackfaceVisibility","webkitBackground","webkitBackgroundAttachment","webkitBackgroundClip","webkitBackgroundColor","webkitBackgroundImage","webkitBackgroundOrigin","webkitBackgroundPosition","webkitBackgroundPositionX","webkitBackgroundPositionY","webkitBackgroundRepeat","webkitBackgroundSize","webkitBackingStorePixelRatio","webkitBorderImage","webkitBorderImageOutset","webkitBorderImageRepeat","webkitBorderImageSlice","webkitBorderImageSource","webkitBorderImageWidth","webkitBoxAlign","webkitBoxDirection","webkitBoxFlex","webkitBoxOrdinalGroup","webkitBoxOrient","webkitBoxPack","webkitBoxSizing","webkitCancelAnimationFrame","webkitCancelFullScreen","webkitCancelKeyRequest","webkitCancelRequestAnimationFrame","webkitClearResourceTimings","webkitClosedCaptionsVisible","webkitConvertPointFromNodeToPage","webkitConvertPointFromPageToNode","webkitCreateShadowRoot","webkitCurrentFullScreenElement","webkitCurrentPlaybackTargetIsWireless","webkitDirectionInvertedFromDevice","webkitDisplayingFullscreen","webkitEnterFullScreen","webkitEnterFullscreen","webkitExitFullScreen","webkitExitFullscreen","webkitExitPointerLock","webkitFullScreenKeyboardInputAllowed","webkitFullscreenElement","webkitFullscreenEnabled","webkitGenerateKeyRequest","webkitGetAsEntry","webkitGetDatabaseNames","webkitGetEntries","webkitGetEntriesByName","webkitGetEntriesByType","webkitGetFlowByName","webkitGetGamepads","webkitGetImageDataHD","webkitGetNamedFlows","webkitGetRegionFlowRanges","webkitGetUserMedia","webkitHasClosedCaptions","webkitHidden","webkitIDBCursor","webkitIDBDatabase","webkitIDBDatabaseError","webkitIDBDatabaseException","webkitIDBFactory","webkitIDBIndex","webkitIDBKeyRange","webkitIDBObjectStore","webkitIDBRequest","webkitIDBTransaction","webkitImageSmoothingEnabled","webkitIndexedDB","webkitInitMessageEvent","webkitIsFullScreen","webkitKeys","webkitLineDashOffset","webkitLockOrientation","webkitMatchesSelector","webkitMediaStream","webkitNotifications","webkitOfflineAudioContext","webkitOrientation","webkitPeerConnection00","webkitPersistentStorage","webkitPointerLockElement","webkitPostMessage","webkitPreservesPitch","webkitPutImageDataHD","webkitRTCPeerConnection","webkitRegionOverset","webkitRequestAnimationFrame","webkitRequestFileSystem","webkitRequestFullScreen","webkitRequestFullscreen","webkitRequestPointerLock","webkitResolveLocalFileSystemURL","webkitSetMediaKeys","webkitSetResourceTimingBufferSize","webkitShadowRoot","webkitShowPlaybackTargetPicker","webkitSlice","webkitSpeechGrammar","webkitSpeechGrammarList","webkitSpeechRecognition","webkitSpeechRecognitionError","webkitSpeechRecognitionEvent","webkitStorageInfo","webkitSupportsFullscreen","webkitTemporaryStorage","webkitTextSizeAdjust","webkitTransform","webkitTransformOrigin","webkitTransition","webkitTransitionDelay","webkitTransitionDuration","webkitTransitionProperty","webkitTransitionTimingFunction","webkitURL","webkitUnlockOrientation","webkitUserSelect","webkitVideoDecodedByteCount","webkitVisibilityState","webkitWirelessVideoPlaybackDisabled","webkitdropzone","webstore","weight","whatToShow","wheelDelta","wheelDeltaX","wheelDeltaY","which","white-space","whiteSpace","wholeText","widows","width","will-change","willChange","willValidate","window","withCredentials","word-break","word-spacing","word-wrap","wordBreak","wordSpacing","wordWrap","wrap","wrapKey","write","writeln","writingMode","x","x1","x2","xChannelSelector","xmlEncoding","xmlStandalone","xmlVersion","xmlbase","xmllang","xmlspace","y","y1","y2","yChannelSelector","yandex","z","z-index","zIndex","zoom","zoomAndPan","zoomRectScreen"];function lr(e,t){function n(e){_(t,e)}e.walk(new On((function(e){e instanceof wt&&e.quote?n(e.key):e instanceof Rt&&e.quote?n(e.key.name):e instanceof St&&fr(e.property,n)})))}function fr(e,t){e.walk(new On((function(e){return e instanceof Et?fr(e.tail_node(),t):e instanceof fn?t(e.value):e instanceof bt&&(fr(e.consequent,t),fr(e.alternative,t)),!0})))}function pr(e,t){var n=(t=o(t,{builtins:!1,cache:null,debug:!1,keep_quoted:!1,only_cache:!1,regex:null,reserved:null,undeclared:!1},!0)).reserved;Array.isArray(n)||(n=[n]);var i=new Set(n);t.builtins||function(e){cr.forEach(i);var t={},n="object"==typeof global?global:self;function i(t){e.add(t)}["Symbol","Map","Promise","Proxy","Reflect","Set","WeakMap","WeakSet"].forEach((function(e){t[e]=n[e]||new Function})),["null","true","false","NaN","Infinity","-Infinity","undefined"].forEach(i),[Object,Array,Function,Number,String,Boolean,Error,Math,Date,RegExp,t.Symbol,ArrayBuffer,DataView,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,eval,EvalError,Float32Array,Float64Array,Int8Array,Int16Array,Int32Array,isFinite,isNaN,JSON,t.Map,parseFloat,parseInt,t.Promise,t.Proxy,RangeError,ReferenceError,t.Reflect,t.Set,SyntaxError,TypeError,Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,URIError,t.WeakMap,t.WeakSet].forEach((function(e){Object.getOwnPropertyNames(e).map(i),e.prototype&&Object.getOwnPropertyNames(e.prototype).map(i)}))}(i);var r,a=-1;t.cache?(r=t.cache.props).forEach((function(e){i.add(e)})):r=new Map;var s,u=t.regex&&new RegExp(t.regex),c=!1!==t.debug;c&&(s=!0===t.debug?"":t.debug);var l=new Set,f=new Set,p="strict"===t.keep_quoted;return e.walk(new On((function(e){if(e instanceof wt)"string"!=typeof e.key||p&&e.quote||m(e.key);else if(e instanceof Rt)p&&e.key.end.quote||m(e.key.name);else if(e instanceof Dt){var n=!!t.undeclared;if(!n){for(var i=e;i.expression;)i=i.expression;n=!(i.thedef&&i.thedef.undeclared)}!n||p&&e.quote||m(e.property)}else e instanceof St?p||fr(e.property,m):e instanceof mt&&"Object.defineProperty"==e.expression.print_to_string()&&fr(e.args[1],m)}))),e.transform(new Fn((function(e){e instanceof wt?"string"!=typeof e.key||p&&e.quote||(e.key=h(e.key)):e instanceof Rt?p&&e.key.end.quote||(e.key.name=h(e.key.name)):e instanceof Dt?p&&e.quote||(e.property=h(e.property)):!t.keep_quoted&&e instanceof St?e.property=E(e.property):e instanceof mt&&"Object.defineProperty"==e.expression.print_to_string()&&(e.args[1]=E(e.args[1]))})));function _(e){return!f.has(e)&&(!i.has(e)&&(t.only_cache?r.has(e):!/^-?[0-9]+(\.[0-9]+)?(e[+-][0-9]+)?$/.test(e)))}function d(e){return!(u&&!u.test(e))&&(!i.has(e)&&(r.has(e)||l.has(e)))}function m(e){_(e)&&l.add(e),d(e)||f.add(e)}function h(e){if(!d(e))return e;var t=r.get(e);if(!t){if(c){var n="_$"+e+"$"+s+"_";_(n)&&(t=n)}if(!t)do{t=qn(++a)}while(!_(t));r.set(e,t)}return t}function E(e){return e.transform(new Fn((function(e){if(e instanceof Et){var t=e.expressions.length-1;e.expressions[t]=E(e.expressions[t])}else e instanceof fn?e.value=h(e.value):e instanceof bt&&(e.consequent=E(e.consequent),e.alternative=E(e.alternative));return e})))}}var _r="undefined"==typeof atob?function(e){return Buffer.from(e,"base64").toString()}:atob,dr="undefined"==typeof btoa?function(e){return Buffer.from(e).toString("base64")}:btoa;function mr(e,t,n){t[e]&&n.forEach((function(n){t[n]&&("object"!=typeof t[n]&&(t[n]={}),e in t[n]||(t[n][e]=t[e]))}))}function hr(e){e&&("props"in e?e.props instanceof Map||(e.props=function(e){var t=new Map;for(var n in e)D(e,n)&&"$"===n.charAt(0)&&t.set(n.substr(1),e[n]);return t}(e.props)):e.props=new Map)}function Er(e){return{props:(t=e.props,n=Object.create(null),t.forEach((function(e,t){n["$"+t]=e})),n)};var t,n}function gr(e,n){var i,r,a=pe.warn_function;try{var s,u=(n=o(n,{compress:{},ecma:void 0,enclose:!1,ie8:!1,keep_classnames:void 0,keep_fnames:!1,mangle:{},module:!1,nameCache:null,output:{},parse:{},rename:void 0,safari10:!1,sourceMap:!1,timings:!1,toplevel:!1,warnings:!1,wrap:!1},!0)).timings&&{start:Date.now()};void 0===n.keep_classnames&&(n.keep_classnames=n.keep_fnames),void 0===n.rename&&(n.rename=n.compress&&n.mangle),mr("ecma",n,["parse","compress","output"]),mr("ie8",n,["compress","mangle","output"]),mr("keep_classnames",n,["compress","mangle"]),mr("keep_fnames",n,["compress","mangle"]),mr("module",n,["parse","compress","mangle"]),mr("safari10",n,["mangle","output"]),mr("toplevel",n,["compress","mangle"]),mr("warnings",n,["compress"]),n.mangle&&(n.mangle=o(n.mangle,{cache:n.nameCache&&(n.nameCache.vars||{}),eval:!1,ie8:!1,keep_classnames:!1,keep_fnames:!1,module:!1,properties:!1,reserved:[],safari10:!1,toplevel:!1},!0),n.mangle.properties&&("object"!=typeof n.mangle.properties&&(n.mangle.properties={}),n.mangle.properties.keep_quoted&&(s=n.mangle.properties.reserved,Array.isArray(s)||(s=[]),n.mangle.properties.reserved=s),!n.nameCache||"cache"in n.mangle.properties||(n.mangle.properties.cache=n.nameCache.props||{})),hr(n.mangle.cache),hr(n.mangle.properties.cache)),n.sourceMap&&(n.sourceMap=o(n.sourceMap,{asObject:!1,content:null,filename:null,includeSources:!1,root:null,url:null},!0));var c,l=[];if(n.warnings&&!pe.warn_function&&(pe.warn_function=function(e){l.push(e)}),u&&(u.parse=Date.now()),e instanceof Ne)c=e;else{for(var f in"string"==typeof e&&(e=[e]),n.parse=n.parse||{},n.parse.toplevel=null,e)if(D(e,f)&&(n.parse.filename=f,n.parse.toplevel=ce(e[f],n.parse),n.sourceMap&&"inline"==n.sourceMap.content)){if(Object.keys(e).length>1)throw new Error("inline source map only works with singular input");n.sourceMap.content=(i=e[f],r=void 0,(r=/(?:^|[^.])\/\/# sourceMappingURL=data:application\/json(;[\w=-]*)?;base64,([+/0-9A-Za-z]*=*)\s*$/.exec(i))?_r(r[2]):(pe.warn("inline source map not found"),null))}c=n.parse.toplevel}s&&"strict"!==n.mangle.properties.keep_quoted&&lr(c,s),n.wrap&&(c=c.wrap_commonjs(n.wrap)),n.enclose&&(c=c.wrap_enclose(n.enclose)),u&&(u.rename=Date.now()),u&&(u.compress=Date.now()),n.compress&&(c=new ai(n.compress).compress(c)),u&&(u.scope=Date.now()),n.mangle&&c.figure_out_scope(n.mangle),u&&(u.mangle=Date.now()),n.mangle&&(qn.reset(),c.compute_char_frequency(n.mangle),c.mangle_names(n.mangle)),u&&(u.properties=Date.now()),n.mangle&&n.mangle.properties&&(c=pr(c,n.mangle.properties)),u&&(u.output=Date.now());var p={};if(n.output.ast&&(p.ast=c),!D(n.output,"code")||n.output.code){if(n.sourceMap&&("string"==typeof n.sourceMap.content&&(n.sourceMap.content=JSON.parse(n.sourceMap.content)),n.output.source_map=function(e){e=o(e,{file:null,root:null,orig:null,orig_line_diff:0,dest_line_diff:0});var n=new t.SourceMapGenerator({file:e.file,sourceRoot:e.root}),i=e.orig&&new t.SourceMapConsumer(e.orig);return i&&i.sources.forEach((function(e){var t=i.sourceContentFor(e,!0);t&&n.setSourceContent(e,t)})),{add:function(t,r,o,a,s,u){if(i){var c=i.originalPositionFor({line:a,column:s});if(null===c.source)return;t=c.source,a=c.line,s=c.column,u=c.name||u}n.addMapping({generated:{line:r+e.dest_line_diff,column:o},original:{line:a+e.orig_line_diff,column:s},source:t,name:u})},get:function(){return n},toString:function(){return JSON.stringify(n.toJSON())}}}({file:n.sourceMap.filename,orig:n.sourceMap.content,root:n.sourceMap.root}),n.sourceMap.includeSources)){if(e instanceof Ne)throw new Error("original source content unavailable");for(var f in e)D(e,f)&&n.output.source_map.get().setSourceContent(f,e[f])}delete n.output.ast,delete n.output.code;var _=Bn(n.output);if(c.print(_),p.code=_.get(),n.sourceMap)if(n.sourceMap.asObject?p.map=n.output.source_map.get().toJSON():p.map=n.output.source_map.toString(),"inline"==n.sourceMap.url){var d="object"==typeof p.map?JSON.stringify(p.map):p.map;p.code+="\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,"+dr(d)}else n.sourceMap.url&&(p.code+="\n//# sourceMappingURL="+n.sourceMap.url)}return n.nameCache&&n.mangle&&(n.mangle.cache&&(n.nameCache.vars=Er(n.mangle.cache)),n.mangle.properties&&n.mangle.properties.cache&&(n.nameCache.props=Er(n.mangle.properties.cache))),u&&(u.end=Date.now(),p.timings={parse:.001*(u.rename-u.parse),rename:.001*(u.compress-u.rename),compress:.001*(u.scope-u.compress),scope:.001*(u.mangle-u.scope),mangle:.001*(u.properties-u.mangle),properties:.001*(u.output-u.properties),output:.001*(u.end-u.output),total:.001*(u.end-u.start)}),l.length&&(p.warnings=l),p}catch(e){return{error:e}}finally{pe.warn_function=a}}!function(){var e=function(e){for(var t=!0,n=0;n<e.length;n++)t&&e[n]instanceof _e&&e[n].body instanceof fn?e[n]=new me({start:e[n].start,end:e[n].end,value:e[n].body.value}):!t||e[n]instanceof _e&&e[n].body instanceof fn||(t=!1);return e},t={Program:function(t){return new Ne({start:i(t),end:r(t),body:e(t.body.map(s))})},ArrayPattern:function(e){return new Ke({start:i(e),end:r(e),names:e.elements.map((function(e){return null===e?new Dn:s(e)})),is_array:!0})},ObjectPattern:function(e){return new Ke({start:i(e),end:r(e),names:e.properties.map(s),is_array:!1})},AssignmentPattern:function(e){return new Ot({start:i(e),end:r(e),left:s(e.left),operator:"=",right:s(e.right)})},SpreadElement:function(e){return new ke({start:i(e),end:r(e),expression:s(e.argument)})},RestElement:function(e){return new ke({start:i(e),end:r(e),expression:s(e.argument)})},TemplateElement:function(e){return new He({start:i(e),end:r(e),value:e.value.cooked,raw:e.value.raw})},TemplateLiteral:function(e){for(var t=[],n=0;n<e.quasis.length;n++)t.push(s(e.quasis[n])),e.expressions[n]&&t.push(s(e.expressions[n]));return new Ge({start:i(e),end:r(e),segments:t})},TaggedTemplateExpression:function(e){return new Ue({start:i(e),end:r(e),template_string:s(e.quasi),prefix:s(e.tag)})},FunctionDeclaration:function(t){return new Be({start:i(t),end:r(t),name:s(t.id),argnames:t.params.map(s),is_generator:t.generator,async:t.async,body:e(s(t.body).body)})},FunctionExpression:function(t){return new Pe({start:i(t),end:r(t),name:s(t.id),argnames:t.params.map(s),is_generator:t.generator,async:t.async,body:e(s(t.body).body)})},ArrowFunctionExpression:function(e){const t="BlockStatement"===e.body.type?s(e.body).body:[p(We,{},{value:s(e.body)})];return new Ve({start:i(e),end:r(e),argnames:e.params.map(s),body:t,async:e.async})},ExpressionStatement:function(e){return new he({start:i(e),end:r(e),body:s(e.expression)})},TryStatement:function(e){var t=e.handlers||[e.handler];if(t.length>1||e.guardedHandlers&&e.guardedHandlers.length)throw new Error("Multiple catch clauses are not supported.");return new rt({start:i(e),end:r(e),body:s(e.block).body,bcatch:s(t[0]),bfinally:e.finalizer?new at(s(e.finalizer)):null})},Property:function(e){var t=e.key,n={start:i(t||e.value),end:r(e.value),key:"Identifier"==t.type?t.name:t.value,value:s(e.value)};return e.computed&&(n.key=s(e.key)),e.method?(n.is_generator=e.value.generator,n.async=e.value.async,e.computed?n.key=s(e.key):n.key=new qt({name:n.key}),new kt(n)):"init"==e.kind?("Identifier"!=t.type&&"Literal"!=t.type&&(n.key=s(t)),new wt(n)):("string"!=typeof n.key&&"number"!=typeof n.key||(n.key=new qt({name:n.key})),n.value=new Le(n.value),"get"==e.kind?new Nt(n):"set"==e.kind?new xt(n):"method"==e.kind?(n.async=e.value.async,n.is_generator=e.value.generator,n.quote=e.computed?'"':null,new kt(n)):void 0)},MethodDefinition:function(e){var t={start:i(e),end:r(e),key:e.computed?s(e.key):new qt({name:e.key.name||e.key.value}),value:s(e.value),static:e.static};return"get"==e.kind?new Nt(t):"set"==e.kind?new xt(t):(t.is_generator=e.value.generator,t.async=e.value.async,new kt(t))},FieldDefinition:function(e){let t;if(e.computed)t=s(e.key);else{if("Identifier"!==e.key.type)throw new Error("Non-Identifier key in FieldDefinition");t=s(e.key)}return new Lt({start:i(e),end:r(e),key:t,value:s(e.value),static:e.static})},ArrayExpression:function(e){return new Ft({start:i(e),end:r(e),elements:e.elements.map((function(e){return null===e?new Dn:s(e)}))})},ObjectExpression:function(e){return new Mt({start:i(e),end:r(e),properties:e.properties.map((function(e){return"SpreadElement"===e.type||(e.type="Property"),s(e)}))})},SequenceExpression:function(e){return new Et({start:i(e),end:r(e),expressions:e.expressions.map(s)})},MemberExpression:function(e){return new(e.computed?St:Dt)({start:i(e),end:r(e),property:e.computed?s(e.property):e.property.name,expression:s(e.object)})},SwitchCase:function(e){return new(e.test?it:nt)({start:i(e),end:r(e),expression:s(e.test),body:e.consequent.map(s)})},VariableDeclaration:function(e){return new("const"===e.kind?lt:"let"===e.kind?ct:ut)({start:i(e),end:r(e),definitions:e.declarations.map(s)})},ImportDeclaration:function(e){var t=null,n=null;return e.specifiers.forEach((function(e){"ImportSpecifier"===e.type?(n||(n=[]),n.push(new pt({start:i(e),end:r(e),foreign_name:s(e.imported),name:s(e.local)}))):"ImportDefaultSpecifier"===e.type?t=s(e.local):"ImportNamespaceSpecifier"===e.type&&(n||(n=[]),n.push(new pt({start:i(e),end:r(e),foreign_name:new tn({name:"*"}),name:s(e.local)})))})),new _t({start:i(e),end:r(e),imported_name:t,imported_names:n,module_name:s(e.source)})},ExportAllDeclaration:function(e){return new dt({start:i(e),end:r(e),exported_names:[new pt({name:new an({name:"*"}),foreign_name:new an({name:"*"})})],module_name:s(e.source)})},ExportNamedDeclaration:function(e){return new dt({start:i(e),end:r(e),exported_definition:s(e.declaration),exported_names:e.specifiers&&e.specifiers.length?e.specifiers.map((function(e){return new pt({foreign_name:s(e.exported),name:s(e.local)})})):null,module_name:s(e.source)})},ExportDefaultDeclaration:function(e){return new dt({start:i(e),end:r(e),exported_value:s(e.declaration),is_default:!0})},Literal:function(e){var t=e.value,n={start:i(e),end:r(e)},o=e.regex;if(o&&o.pattern)return n.value={source:o.pattern,flags:o.flags},new dn(n);if(o){const i=e.raw||t,r=i.match(/^\/(.*)\/(\w*)$/);if(!r)throw new Error("Invalid regex source "+i);const[o,a,s]=r;return n.value={source:a,flags:s},new dn(n)}if(null===t)return new hn(n);switch(typeof t){case"string":return n.value=t,new fn(n);case"number":return n.value=t,new pn(n);case"boolean":return new(t?Tn:An)(n)}},MetaProperty:function(e){if("new"===e.meta.name&&"target"===e.property.name)return new Kt({start:i(e),end:r(e)})},Identifier:function(e){var t=a[a.length-2];return new("LabeledStatement"==t.type?nn:"VariableDeclarator"==t.type&&t.id===e?"const"==t.kind?Xt:"let"==t.kind?zt:Gt:/Import.*Specifier/.test(t.type)?t.local===e?en:tn:"ExportSpecifier"==t.type?t.local===e?on:an:"FunctionExpression"==t.type?t.id===e?jt:Wt:"FunctionDeclaration"==t.type?t.id===e?Yt:Wt:"ArrowFunctionExpression"==t.type?t.params.includes(e)?Wt:rn:"ClassExpression"==t.type?t.id===e?Jt:rn:"Property"==t.type?t.key===e&&t.computed||t.value===e?rn:qt:"FieldDefinition"==t.type?t.key===e&&t.computed||t.value===e?rn:$t:"ClassDeclaration"==t.type?t.id===e?Zt:rn:"MethodDefinition"==t.type?t.computed?rn:qt:"CatchClause"==t.type?Qt:"BreakStatement"==t.type||"ContinueStatement"==t.type?sn:rn)({start:i(e),end:r(e),name:e.name})},BigIntLiteral:e=>new _n({start:i(e),end:r(e),value:e.value})};function n(e){if("Literal"==e.type)return null!=e.raw?e.raw:e.value+""}function i(e){var t=e.loc,i=t&&t.start,r=e.range;return new fe({file:t&&t.source,line:i&&i.line,col:i&&i.column,pos:r?r[0]:e.start,endline:i&&i.line,endcol:i&&i.column,endpos:r?r[0]:e.start,raw:n(e)})}function r(e){var t=e.loc,i=t&&t.end,r=e.range;return new fe({file:t&&t.source,line:i&&i.line,col:i&&i.column,pos:r?r[1]:e.end,endline:i&&i.line,endcol:i&&i.column,endpos:r?r[1]:e.end,raw:n(e)})}function o(e,n,o){var a="function From_Moz_"+e+"(M){\n";a+="return new U2."+n.name+"({\nstart: my_start_token(M),\nend: my_end_token(M)";var c="function To_Moz_"+e+"(M){\n";c+="return {\ntype: "+JSON.stringify(e),o&&o.split(/\s*,\s*/).forEach((function(e){var t=/([a-z0-9$_]+)([=@>%])([a-z0-9$_]+)/i.exec(e);if(!t)throw new Error("Can't understand property map: "+e);var n=t[1],i=t[2],r=t[3];switch(a+=",\n"+r+": ",c+=",\n"+n+": ",i){case"@":a+="M."+n+".map(from_moz)",c+="M."+r+".map(to_moz)";break;case">":a+="from_moz(M."+n+")",c+="to_moz(M."+r+")";break;case"=":a+="M."+n,c+="M."+r;break;case"%":a+="from_moz(M."+n+").body",c+="to_moz_block(M)";break;default:throw new Error("Can't understand operator in propmap: "+e)}})),a+="\n})\n}",c+="\n}\n}",a=new Function("U2","my_start_token","my_end_token","from_moz","return("+a+")")(xn,i,r,s),c=new Function("to_moz","to_moz_block","to_moz_scope","return("+c+")")(l,_,d),t[e]=a,u(n,c)}t.UpdateExpression=t.UnaryExpression=function(e){return new(("prefix"in e?e.prefix:"UnaryExpression"==e.type)?At:Tt)({start:i(e),end:r(e),operator:e.operator,expression:s(e.argument)})},t.ClassDeclaration=t.ClassExpression=function(e){return new("ClassDeclaration"===e.type?Pt:Vt)({start:i(e),end:r(e),name:s(e.id),extends:s(e.superClass),properties:e.body.body.map(s)})},o("EmptyStatement",ve),o("BlockStatement",Se,"body@body"),o("IfStatement",Qe,"test>condition, consequent>body, alternate>alternative"),o("LabeledStatement",Te,"label>label, body>body"),o("BreakStatement",$e,"label>label"),o("ContinueStatement",je,"label>label"),o("WithStatement",we,"object>expression, body>body"),o("SwitchStatement",et,"discriminant>expression, cases@body"),o("ReturnStatement",We,"argument>value"),o("ThrowStatement",Ye,"argument>value"),o("WhileStatement",Oe,"test>condition, body>body"),o("DoWhileStatement",Ce,"test>condition, body>body"),o("ForStatement",Fe,"init>init, test>condition, update>step, body>body"),o("ForInStatement",Me,"left>init, right>object, body>body"),o("ForOfStatement",Re,"left>init, right>object, body>body, await=await"),o("AwaitExpression",Ze,"argument>expression"),o("YieldExpression",Je,"argument>expression, delegate=is_star"),o("DebuggerStatement",de),o("VariableDeclarator",ft,"id>name, init>value"),o("CatchClause",ot,"param>argname, body%body"),o("ThisExpression",un),o("Super",cn),o("BinaryExpression",yt,"operator=operator, left>left, right>right"),o("LogicalExpression",yt,"operator=operator, left>left, right>right"),o("AssignmentExpression",Ct,"operator=operator, left>left, right>right"),o("ConditionalExpression",bt,"test>condition, consequent>consequent, alternate>alternative"),o("NewExpression",ht,"callee>expression, arguments@args"),o("CallExpression",mt,"callee>expression, arguments@args"),u(Ne,(function(e){return d("Program",e)})),u(ke,(function(e){return{type:f()?"RestElement":"SpreadElement",argument:l(e.expression)}})),u(Ue,(function(e){return{type:"TaggedTemplateExpression",tag:l(e.prefix),quasi:l(e.template_string)}})),u(Ge,(function(e){for(var t=[],n=[],i=0;i<e.segments.length;i++)i%2!=0?n.push(l(e.segments[i])):t.push({type:"TemplateElement",value:{raw:e.segments[i].raw,cooked:e.segments[i].value},tail:i===e.segments.length-1});return{type:"TemplateLiteral",quasis:t,expressions:n}})),u(Be,(function(e){return{type:"FunctionDeclaration",id:l(e.name),params:e.argnames.map(l),generator:e.is_generator,async:e.async,body:d("BlockStatement",e)}})),u(Pe,(function(e,t){var n=void 0!==t.is_generator?t.is_generator:e.is_generator;return{type:"FunctionExpression",id:l(e.name),params:e.argnames.map(l),generator:n,async:e.async,body:d("BlockStatement",e)}})),u(Ve,(function(e){var t={type:"BlockStatement",body:e.body.map(l)};return{type:"ArrowFunctionExpression",params:e.argnames.map(l),async:e.async,body:t}})),u(Ke,(function(e){return e.is_array?{type:"ArrayPattern",elements:e.names.map(l)}:{type:"ObjectPattern",properties:e.names.map(l)}})),u(me,(function(e){return{type:"ExpressionStatement",expression:{type:"Literal",value:e.value,raw:e.print_to_string()},directive:e.value}})),u(he,(function(e){return{type:"ExpressionStatement",expression:l(e.body)}})),u(tt,(function(e){return{type:"SwitchCase",test:l(e.expression),consequent:e.body.map(l)}})),u(rt,(function(e){return{type:"TryStatement",block:_(e),handler:l(e.bcatch),guardedHandlers:[],finalizer:l(e.bfinally)}})),u(ot,(function(e){return{type:"CatchClause",param:l(e.argname),guard:null,body:_(e)}})),u(st,(function(e){return{type:"VariableDeclaration",kind:e instanceof lt?"const":e instanceof ct?"let":"var",declarations:e.definitions.map(l)}})),u(dt,(function(e){return e.exported_names?"*"===e.exported_names[0].name.name?{type:"ExportAllDeclaration",source:l(e.module_name)}:{type:"ExportNamedDeclaration",specifiers:e.exported_names.map((function(e){return{type:"ExportSpecifier",exported:l(e.foreign_name),local:l(e.name)}})),declaration:l(e.exported_definition),source:l(e.module_name)}:{type:e.is_default?"ExportDefaultDeclaration":"ExportNamedDeclaration",declaration:l(e.exported_value||e.exported_definition)}})),u(_t,(function(e){var t=[];return e.imported_name&&t.push({type:"ImportDefaultSpecifier",local:l(e.imported_name)}),e.imported_names&&"*"===e.imported_names[0].foreign_name.name?t.push({type:"ImportNamespaceSpecifier",local:l(e.imported_names[0].name)}):e.imported_names&&e.imported_names.forEach((function(e){t.push({type:"ImportSpecifier",local:l(e.name),imported:l(e.foreign_name)})})),{type:"ImportDeclaration",specifiers:t,source:l(e.module_name)}})),u(Et,(function(e){return{type:"SequenceExpression",expressions:e.expressions.map(l)}})),u(gt,(function(e){var t=e instanceof St;return{type:"MemberExpression",object:l(e.expression),computed:t,property:t?l(e.property):{type:"Identifier",name:e.property}}})),u(vt,(function(e){return{type:"++"==e.operator||"--"==e.operator?"UpdateExpression":"UnaryExpression",operator:e.operator,prefix:e instanceof At,argument:l(e.expression)}})),u(yt,(function(e){if("="==e.operator&&f())return{type:"AssignmentPattern",left:l(e.left),right:l(e.right)};return{type:"&&"==e.operator||"||"==e.operator||"??"===e.operator?"LogicalExpression":"BinaryExpression",left:l(e.left),operator:e.operator,right:l(e.right)}})),u(Ft,(function(e){return{type:"ArrayExpression",elements:e.elements.map(l)}})),u(Mt,(function(e){return{type:"ObjectExpression",properties:e.properties.map(l)}})),u(Rt,(function(e,t){var n,i=e.key instanceof pe?l(e.key):{type:"Identifier",value:e.key};"number"==typeof e.key&&(i={type:"Literal",value:Number(e.key)}),"string"==typeof e.key&&(i={type:"Identifier",name:e.key});var r="string"==typeof e.key||"number"==typeof e.key,o=!r&&(!(e.key instanceof Bt)||e.key instanceof rn);return e instanceof wt?(n="init",o=!r):e instanceof Nt?n="get":e instanceof xt&&(n="set"),e instanceof Lt?{type:"FieldDefinition",computed:o,key:i,value:l(e.value),static:e.static}:t instanceof It?{type:"MethodDefinition",computed:o,kind:n,static:e.static,key:l(e.key),value:l(e.value)}:{type:"Property",computed:o,kind:n,key:i,value:l(e.value)}})),u(kt,(function(e,t){return t instanceof Mt?{type:"Property",computed:!(e.key instanceof Bt)||e.key instanceof rn,kind:"init",method:!0,shorthand:!1,key:l(e.key),value:l(e.value)}:{type:"MethodDefinition",computed:!(e.key instanceof Bt)||e.key instanceof rn,kind:"constructor"===e.key?"constructor":"method",static:e.static,key:l(e.key),value:l(e.value)}})),u(It,(function(e){return{type:e instanceof Vt?"ClassExpression":"ClassDeclaration",superClass:l(e.extends),id:e.name?l(e.name):null,body:{type:"ClassBody",body:e.properties.map(l)}}})),u(Kt,(function(){return{type:"MetaProperty",meta:{type:"Identifier",name:"new"},property:{type:"Identifier",name:"target"}}})),u(Bt,(function(e,t){if(e instanceof qt&&t.quote)return{type:"Literal",value:e.name};var n=e.definition();return{type:"Identifier",name:n?n.mangled_name||n.name:e.name}})),u(dn,(function(e){const t=e.value.source,n=e.value.flags;return{type:"Literal",value:null,raw:e.print_to_string(),regex:{pattern:t,flags:n}}})),u(ln,(function(e){var t=e.value;return"number"==typeof t&&(t<0||0===t&&1/t<0)?{type:"UnaryExpression",operator:"-",prefix:!0,argument:{type:"Literal",value:-t,raw:e.start.raw}}:{type:"Literal",value:t,raw:e.start.raw}})),u(mn,(function(e){return{type:"Identifier",name:String(e.value)}})),u(_n,e=>({type:"BigIntLiteral",value:e.value})),vn.DEFMETHOD("to_mozilla_ast",ln.prototype.to_mozilla_ast),hn.DEFMETHOD("to_mozilla_ast",ln.prototype.to_mozilla_ast),Dn.DEFMETHOD("to_mozilla_ast",(function(){return null})),De.DEFMETHOD("to_mozilla_ast",Se.prototype.to_mozilla_ast),Ie.DEFMETHOD("to_mozilla_ast",Pe.prototype.to_mozilla_ast);var a=null;function s(e){a.push(e);var n=null!=e?t[e.type](e):null;return a.pop(),n}function u(e,t){e.DEFMETHOD("to_mozilla_ast",(function(e){return n=this,i=t(this,e),r=n.start,o=n.end,r&&o?(null!=r.pos&&null!=o.endpos&&(i.range=[r.pos,o.endpos]),r.line&&(i.loc={start:{line:r.line,column:r.col},end:o.endline?{line:o.endline,column:o.endcol}:null},r.file&&(i.loc.source=r.file)),i):i;var n,i,r,o}))}pe.from_mozilla_ast=function(e){var t=a;a=[];var n=s(e);return a=t,n};var c=null;function l(e){null===c&&(c=[]),c.push(e);var t=null!=e?e.to_mozilla_ast(c[c.length-2]):null;return c.pop(),0===c.length&&(c=null),t}function f(){for(var e=c.length;e--;)if(c[e]instanceof Ke)return!0;return!1}function _(e){return{type:"BlockStatement",body:e.body.map(l)}}function d(e,t){var n=t.body.map(l);return t.body[0]instanceof he&&t.body[0].body instanceof fn&&n.unshift(l(new ve(t.body[0]))),{type:e,body:n}}}(),e.AST_Accessor=Le,e.AST_Array=Ft,e.AST_Arrow=Ve,e.AST_Assign=Ct,e.AST_Atom=mn,e.AST_Await=Ze,e.AST_Binary=yt,e.AST_Block=De,e.AST_BlockStatement=Se,e.AST_Boolean=vn,e.AST_Break=$e,e.AST_Call=mt,e.AST_Case=it,e.AST_Catch=ot,e.AST_Class=It,e.AST_ClassExpression=Vt,e.AST_ConciseMethod=kt,e.AST_Conditional=bt,e.AST_Const=lt,e.AST_Constant=ln,e.AST_Continue=je,e.AST_DWLoop=be,e.AST_Debugger=de,e.AST_DefClass=Pt,e.AST_Default=nt,e.AST_DefaultAssign=Ot,e.AST_Definitions=st,e.AST_Defun=Be,e.AST_Destructuring=Ke,e.AST_Directive=me,e.AST_Do=Ce,e.AST_Dot=Dt,e.AST_EmptyStatement=ve,e.AST_Exit=ze,e.AST_Expansion=ke,e.AST_Export=dt,e.AST_False=An,e.AST_Finally=at,e.AST_For=Fe,e.AST_ForIn=Me,e.AST_ForOf=Re,e.AST_Function=Pe,e.AST_Hole=Dn,e.AST_If=Qe,e.AST_Import=_t,e.AST_Infinity=Sn,e.AST_IterationStatement=ye,e.AST_Jump=Xe,e.AST_Label=nn,e.AST_LabelRef=sn,e.AST_LabeledStatement=Te,e.AST_Lambda=Ie,e.AST_Let=ct,e.AST_LoopControl=qe,e.AST_NaN=En,e.AST_NameMapping=pt,e.AST_New=ht,e.AST_NewTarget=Kt,e.AST_Node=pe,e.AST_Null=hn,e.AST_Number=pn,e.AST_Object=Mt,e.AST_ObjectGetter=Nt,e.AST_ObjectKeyVal=wt,e.AST_ObjectProperty=Rt,e.AST_ObjectSetter=xt,e.AST_PrefixedTemplateString=Ue,e.AST_PropAccess=gt,e.AST_RegExp=dn,e.AST_Return=We,e.AST_Scope=xe,e.AST_Sequence=Et,e.AST_SimpleStatement=he,e.AST_Statement=_e,e.AST_StatementWithBody=Ae,e.AST_String=fn,e.AST_Sub=St,e.AST_Super=cn,e.AST_Switch=et,e.AST_SwitchBranch=tt,e.AST_Symbol=Bt,e.AST_SymbolBlockDeclaration=Ht,e.AST_SymbolCatch=Qt,e.AST_SymbolClass=Jt,e.AST_SymbolConst=Xt,e.AST_SymbolDeclaration=Ut,e.AST_SymbolDefClass=Zt,e.AST_SymbolDefun=Yt,e.AST_SymbolExport=on,e.AST_SymbolExportForeign=an,e.AST_SymbolFunarg=Wt,e.AST_SymbolImport=en,e.AST_SymbolImportForeign=tn,e.AST_SymbolLambda=jt,e.AST_SymbolLet=zt,e.AST_SymbolMethod=qt,e.AST_SymbolRef=rn,e.AST_SymbolVar=Gt,e.AST_TemplateSegment=He,e.AST_TemplateString=Ge,e.AST_This=un,e.AST_Throw=Ye,e.AST_Token=fe,e.AST_Toplevel=Ne,e.AST_True=Tn,e.AST_Try=rt,e.AST_Unary=vt,e.AST_UnaryPostfix=Tt,e.AST_UnaryPrefix=At,e.AST_Undefined=gn,e.AST_Var=ut,e.AST_VarDef=ft,e.AST_While=Oe,e.AST_With=we,e.AST_Yield=Je,e.Compressor=ai,e.OutputStream=Bn,e.TreeTransformer=Fn,e.TreeWalker=On,e._INLINE=Rn,e._JS_Parse_Error=Q,e._NOINLINE=wn,e._PURE=Mn,e._has_annotation=T,e._tokenizer=ie,e.base54=qn,e.default_options=$n,e.defaults=o,e.mangle_properties=pr,e.minify=gr,e.parse=ce,e.push_uniq=_,e.reserve_quoted_keys=lr,e.string_template=d,e.to_ascii=_r}));
//# sourceMappingURL=bundle.min.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	!function() {
/******/ 		__nccwpck_require__.nmd = function(module) {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(554);
/******/ })()
;