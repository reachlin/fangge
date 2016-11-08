const vows = require('vows'),
const assert = require('assert');

const utils = require('../utils');

vows.describe('utils').addBatch({
  'test create_id': {
    topic: 3,
    'has length 3': function(topic) {
      assert.equal(topic, utils.create_id(topic).length);
    }
  }
}).export(module);
