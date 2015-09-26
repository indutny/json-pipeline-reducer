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
