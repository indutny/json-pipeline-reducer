'use strict';

function Reduction() {
}
module.exports = Reduction;

Reduction.prototype.start = function start() {
  // To be overriden.
};

Reduction.prototype.reduce = function reduce() {
  // To be overriden.
};

Reduction.prototype.end = function end() {
  // To be overriden.
};
