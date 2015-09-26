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
    this.queue.insertHead(item);
  }

  while (!this.queue.isEmpty()) {
    var item = this.queue.prev;
    item.remove();

    this.reduceNode(graph, item);
  }

  // Restore indexes
  for (var i = 0; i < graph.nodes.length; i++) {
    var node = graph.nodes[i];
    node.data.clear();
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
  return node.data;
};

// Helper methods for Reduction

Reducer.prototype.add = function add(node) {
  var item = this.getItem(node);
  if (!(item instanceof Queue))
    item = new Queue(node);

  // NOTE: this.change() is going to use this `item`, implicitly. Passing it
  // to just silence the jshint
  this.change(node, item);
};

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

  node.replace(other);
  this.graph.remove(node);

  this.add(other);
};

Reducer.prototype.change = function change(node) {
  var item = this.getItem(node);
  this.queue.insertHead(item);

  // Queue uses
  for (var i = 0; i < node.uses.length; i += 2)
    this.queue.insertHead(this.getItem(node.uses[i]));

  // Queue control uses
  for (var i = 0; i < node.controlUses.length; i += 2)
    this.queue.insertHead(this.getItem(node.controlUses[i]));
};
