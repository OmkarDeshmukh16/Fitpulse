process.env.NODE_ENV = 'test';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

describe('System Health & Root Endpoints', () => {
  test('GET / returns 200 with API status message', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /Fitpulse/i);
  });

  test('GET /health returns health metrics and service details', async () => {
    const res = await request(app).get('/health');
    assert.ok(res.status === 200 || res.status === 503);
    assert.equal(res.body.service, 'fitpulse-saas-api');
    assert.equal(res.body.version, '1.0.0');
    assert.ok(typeof res.body.status === 'string');
    assert.ok(typeof res.body.uptimeSeconds === 'number');
    assert.ok(res.body.database && typeof res.body.database.status === 'string');
    assert.ok(res.body.memory && typeof res.body.memory.rssMb === 'number');
  });

  test('GET /non-existent-route returns 404 with structured message', async () => {
    const res = await request(app).get('/api/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not found/i);
  });
});
