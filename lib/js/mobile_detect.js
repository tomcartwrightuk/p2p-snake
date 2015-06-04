'use strict';

/**
 * Returns whether browser is a mobile or not. Tests for touch support
 *
 * @returns {boolean} True if mobile.
 */
module.exports = function () {
  if (('ontouchstart' in window) || navigator.msMaxTouchPoints) {
    return true;
  }
};

