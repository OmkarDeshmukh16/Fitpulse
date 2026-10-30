process.env.NODE_ENV = 'test';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const runner = require('../migrations/runner');

describe('Database Migration Runner Primitives', () => {
  test('runner exposes runUp, runDown, runStatus functions', () => {
    assert.equal(typeof runner.runUp, 'function');
    assert.equal(typeof runner.runDown, 'function');
    assert.equal(typeof runner.runStatus, 'function');
    assert.equal(typeof runner.getMigrationFiles, 'function');
  });

  test('getMigrationFiles returns an array of migration filenames', () => {
    const files = runner.getMigrationFiles();
    assert.ok(Array.isArray(files));
    // Files must not include runner.js itself
    assert.equal(files.includes('runner.js'), false);
  });
});
