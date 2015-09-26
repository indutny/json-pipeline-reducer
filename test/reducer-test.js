'use strict';

var assert = require('assert');
var pipeline = require('json-pipeline');

var fixtures = require('./fixtures');
var Reducer = require('../');

describe('Reducer', function() {
  var p;
  var reducer;

  beforeEach(function() {
    p = pipeline.create();

    var start = p.add('start');
    var one = p.add('literal').addLiteral(1);
    var two = p.add('literal').addLiteral(2);
    var add = p.add('add', [ one, two ]);
    var branch = p.add('if', add).setControl(start);

    var left = p.add('region').setControl(branch);
    var leftVal = p.add('literal').addLiteral('left');
    var leftJump = p.add('jump').setControl(left);

    var right = p.add('region').setControl(branch);
    var rightVal = p.add('literal').addLiteral('right');
    var rightJump = p.add('jump').setControl(right);

    var merge = p.add('region').setControl(leftJump, rightJump);
    var phi = p.add('ssa:phi', leftVal, rightVal).setControl(merge);
    var ret = p.add('return', [ phi ]).setControl(merge);

    reducer = Reducer.create();
  });

  it('should visit all nodes', function() {
    var visit = new fixtures.VisitReduction();
    reducer.addReduction(visit);

    var count = p.nodes.length;
    reducer.reduce(p);
    assert.equal(visit.countUnique(), count);
  });

  it('should prefix all nodes', function() {
    var prefixA = new fixtures.PrefixReduction('A:');
    var prefixB = new fixtures.PrefixReduction('B:');
    var visit = new fixtures.VisitReduction();

    reducer.addReduction(visit);
    reducer.addReduction(prefixB);
    reducer.addReduction(prefixA);

    var count = p.nodes.length;
    reducer.reduce(p);
    assert.equal(p.nodes.length, count);

    for (var i = 0; i < p.nodes.length; i++)
      assert(/^A:B:/.test(p.nodes[i].opcode));

    assert.equal(visit.countUnique(), count);

    // It should be optimal
    assert.equal(visit.visited.length, count * 3);
  });

  it('should compute math', function() {
    p = pipeline.create();

    function add(left, right) {
      if (typeof left === 'number')
        left = p.add('literal').addLiteral(left);
      if (typeof right === 'number')
        right = p.add('literal').addLiteral(right);
      return p.add('add', [ left, right ]);
    }

    var start = p.add('start');
    var value = add(
      add(
        add(
          add(1, 2),
          add(3, 4)),
        add(
          add(5, 6),
          add(7, 8))),
      add(
        add(
          add(9, 10),
          add(11, 12)),
        add(
          add(13, 14),
          add(15, 16))));
    var ret = p.add('return', value).setControl(start);

    var math = new fixtures.MathReduction();
    reducer.addReduction(math);

    var count = p.nodes.length;
    reducer.reduce(p);
    assert.equal(ret.inputs[0].opcode, 'literal');
    assert.equal(ret.inputs[0].literals[0], 136);
  });
});
