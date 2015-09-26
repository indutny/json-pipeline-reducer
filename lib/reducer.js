'use strict';

var Queue = require('./queue');

function Reducer() {
  this.reductions = [];

  this.graph = null;
  this.queue = null;
}
module.exports = Reducer;

// To be inherited from
Reducer.Reduction = require('./reduction');

Reducer.create = function create() {
  return new Reducer();
};

Reducer.prototype.addReduction = function addReduction(reduction) {
  this.reductions.push(reduction);
};

Reducer.prototype.reduce = function reduce(graph) {
  this.graph = graph;
  this.queue = new Queue(null);

  // Abuse `index` field to store ptr to Queue instance
  for (var i = 0; i < graph.nodes.length; i++) {
    var node = graph.nodes[i];
    var item = new Queue(node);
    this.queue.insertTail(item);
  }

  while (!this.queue.isEmpty()) {
    var item = this.queue.prev;
    item.remove();

    this.reduceNode(graph, item);
  }

  // Restore indexes
  for (var i = 0; i < graph.nodes.length; i++) {
    var node = graph.nodes[i];
    if (node.index instanceof Queue)
      node.index.clear();
  }

  this.graph = null;
  this.queue = null;
};

Reducer.prototype.reduceNode = function reduceNode(graph, item) {
  for (var i = 0; i < this.reductions.length; i++) {
    var reduction = this.reductions[i];

    // Node added to queue again or removed
    if (!item.isEmpty() || item.node === null)
      break;

    reduction.reduce(item.node, this);
  }
};

Reducer.prototype.getItem = function getItem(node) {
  return node.index;
};

// Helper methods for Reduction

Reducer.prototype.remove = function remove(node) {
  var item = this.getItem(node);
  item.remove();
  item.clear();

  this.graph.remove(node);
};

Reducer.prototype.replace = function replace(node, other) {
  var item = this.getItem(node);
  item.remove();
  item.clear();

  var item = new Queue(other);
  this.queue.insertTail(item);

  node.replace(other);
};

Reducer.prototype.change = function change(node) {
  var item = this.getItem(node);
  if (item.isEmpty())
    this.queue.insertTail(item);
};
