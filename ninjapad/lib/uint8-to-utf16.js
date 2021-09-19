/*
ISC License

Copyright (c) 2020, Andrea Giammarchi, @WebReflection

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
*/

var uint8ToUtf16 = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi @WebReflection */
  var ceil = Math.ceil;
  var fromCharCode = String.fromCharCode;
  var encode = function encode(uint8array) {
    var extra = 0;
    var output = [];
    var length = uint8array.length;
    var len = ceil(length / 2);

    for (var j = 0, i = 0; i < len; i++) {
      output.push(fromCharCode((uint8array[j++] << 8) + (j < length ? uint8array[j++] : extra++)));
    }

    output.push(fromCharCode(extra));
    return output.join('');
  };
  var decode = function decode(chars) {
    var codes = [];
    var length = chars.length - 1;

    for (var i = 0; i < length; i++) {
      var c = chars.charCodeAt(i);
      codes.push(c >> 8, c & 0xFF);
    }

    if (chars.charCodeAt(length)) codes.pop();
    return Uint8Array.from(codes);
  };

  exports.decode = decode;
  exports.encode = encode;

  return exports;

}({}));
