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

function MathReduction(prefix) {
  reducer.Reduction.call(this);
  this.prefix = prefix;
}
util.inherits(MathReduction, reducer.Reduction);
exports.MathReduction = MathReduction;

MathReduction.prototype.reduce = function reduce(node, reducer) {
  if (node.opcode !== 'add')
    return;

  var left = node.inputs[0];
  var right = node.inputs[1];
  if (left.opcode !== 'literal' || right.opcode !== 'literal')
    return;

  var res = reducer.graph.add('literal')
      .addLiteral(left.literals[0] + right.literals[0]);
  reducer.replace(node, res);

  if (left.uses.length === 0)
    reducer.remove(left);
  if (right.uses.length === 0)
    reducer.remove(right);
};
