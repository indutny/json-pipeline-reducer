'use strict';

function Reduction(options) {
  this.options = options || {};
  this._start = this.options.start;
  this._reduce = this.options.reduce;
  this._end = this.options.end;
}
module.exports = Reduction;

Reduction.prototype.start = function start(reducer) {
  // To be overriden.
  if (this._start)
    return this._start(reducer);
};

Reduction.prototype.reduce = function reduce(node, reducer) {
  // To be overriden.
  if (this._reduce)
    return this._reduce(node, reducer);
};

Reduction.prototype.end = function end(reducer) {
  // To be overriden.
  if (this._end)
    return this._end(reducer);
};
