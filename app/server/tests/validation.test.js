const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const validate = require('../middleware/validate');

describe('Request Validation Middleware', () => {
  test('passes validation when data satisfies schema rules', () => {
    const validator = validate({
      body: (data) => {
        const errors = [];
        if (!data.name) errors.push({ field: 'name', message: 'Name is required' });
        return errors;
      },
    });

    const req = { body: { name: 'Gold Gym' } };
    let nextCalled = false;
    let nextError = null;

    validator(req, {}, (err) => {
      nextCalled = true;
      nextError = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
  });

  test('calls next with ValidationError when required fields are missing', () => {
    const validator = validate({
      body: (data) => {
        const errors = [];
        if (!data.name) errors.push({ field: 'name', message: 'Name is required' });
        if (!data.email) errors.push({ field: 'email', message: 'Email is required' });
        return errors;
      },
    });

    const req = { body: {} };
    let capturedError = null;

    validator(req, {}, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError);
    assert.equal(capturedError.statusCode, 422);
    assert.equal(capturedError.code, 'VALIDATION_ERROR');
    assert.equal(capturedError.details.length, 2);
  });
});
