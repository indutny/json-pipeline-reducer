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
    reducer.addReduction(prefixB);
    reducer.addReduction(prefixA);

    var count = p.nodes.length;
    reducer.reduce(p);
    assert.equal(p.nodes.length, count);

    for (var i = 0; i < p.nodes.length; i++)
      assert(/^A:B:/.test(p.nodes[i].opcode));
  });
});
