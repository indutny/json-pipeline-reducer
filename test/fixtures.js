'use strict';

var util = require('util');

var reducer = require('../');

function VisitReduction() {
  reducer.Reduction.call(this);

  this.visited = [];
}
util.inherits(VisitReduction, reducer.Reduction);
exports.VisitReduction = VisitReduction;

VisitReduction.prototype.reduce = function reduce(node) {
  this.visited.push(node);
};

VisitReduction.prototype.countUnique = function countUnique() {
  var check = [];

  var count = 0;
  for (var i = 0; i < this.visited.length; i++) {
    var index = this.visited[i].index;
    if (check[index])
      continue;

    check[index] = true;
    count++;
  }

  return count;
};

function PrefixReduction(prefix) {
  reducer.Reduction.call(this);
  this.prefix = prefix;
}
util.inherits(PrefixReduction, reducer.Reduction);
exports.PrefixReduction = PrefixReduction;

PrefixReduction.prototype.reduce = function reduce(node, reducer) {
  if (node.opcode.indexOf(this.prefix) !== -1)
    return;

  node.opcode = this.prefix + node.opcode;
  reducer.change(node);
};
