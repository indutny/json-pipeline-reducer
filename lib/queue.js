'use strict';

function Queue(node) {
  this.prev = this;
  this.next = this;

  this.node = node;
  if (this.node !== null)
    this.node.data = this;
}
module.exports = Queue;

Queue.prototype.isEmpty = function isEmpty() {
  return this.prev === this;
};

Queue.prototype.insertTail = function insertTail(other) {
  // Already inserted
  if (!other.isEmpty())
    return;
  other.prev = this.prev;
  other.next = this;
  other.prev.next = other;
  other.next.prev = other;
};

Queue.prototype.insertHead = function insertHead(other) {
  // Already inserted
  if (!other.isEmpty())
    return;
  other.prev = this;
  other.next = this.next;
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
  this.node.data = null;
  this.node = null;
};
