'use strict';

function Queue(node) {
  this.prev = this;
  this.next = this;

  this.node = node;
  if (node === null) {
    this.index = 0;
  } else {
    this.index = node.index;
    this.node.index = this;
  }
}
module.exports = Queue;

Queue.prototype.isEmpty = function isEmpty() {
  return this.prev === this;
};

Queue.prototype.insertTail = function insertTail(other) {
  other.prev = this.prev;
  other.next = this;
  other.prev.next = other;
  other.next.prev = other;
};

Queue.prototype.remove = function remove() {
  var next = this.next;
  var prev = this.prev;

  prev.next = next;
  next.prev = prev;

  this.prev = this;
  this.next = this;
};

Queue.prototype.clear = function clear() {
  this.node.index = this.index;
  this.node = null;
};
