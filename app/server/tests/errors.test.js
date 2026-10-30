const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TenantIsolationError,
} = require('../utils/errors');
const errorHandler = require('../middleware/errorHandler');

describe('Standardized Error Classes & Error Handler', () => {
  test('AppError sets status code, code, and details', () => {
    const err = new AppError('Custom Error', 418, 'TEAPOT', { extra: 'info' });
    assert.equal(err.message, 'Custom Error');
    assert.equal(err.statusCode, 418);
    assert.equal(err.code, 'TEAPOT');
    assert.deepEqual(err.details, { extra: 'info' });
    assert.equal(err.isOperational, true);
  });

  test('Subclasses instantiate with correct default status and error codes', () => {
    assert.equal(new BadRequestError().statusCode, 400);
    assert.equal(new BadRequestError().code, 'BAD_REQUEST');

    assert.equal(new UnauthorizedError().statusCode, 401);
    assert.equal(new UnauthorizedError().code, 'UNAUTHORIZED');

    assert.equal(new ForbiddenError().statusCode, 403);
    assert.equal(new ForbiddenError().code, 'FORBIDDEN');

    assert.equal(new NotFoundError().statusCode, 404);
    assert.equal(new NotFoundError().code, 'NOT_FOUND');

    assert.equal(new ConflictError().statusCode, 409);
    assert.equal(new ConflictError().code, 'CONFLICT');

    assert.equal(new ValidationError().statusCode, 422);
    assert.equal(new ValidationError().code, 'VALIDATION_ERROR');

    assert.equal(new TenantIsolationError().statusCode, 403);
    assert.equal(new TenantIsolationError().code, 'TENANT_ISOLATION_VIOLATION');
  });

  test('errorHandler formats AppError correctly into structured contract', () => {
    const err = new NotFoundError('Member record not found', { memberId: '123' });
    let capturedStatus;
    let capturedJson;

    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        capturedJson = data;
        return this;
      },
    };

    errorHandler(err, {}, res, () => {});

    assert.equal(capturedStatus, 404);
    assert.equal(capturedJson.success, false);
    assert.equal(capturedJson.message, 'Member record not found');
    assert.equal(capturedJson.error.code, 'NOT_FOUND');
    assert.deepEqual(capturedJson.error.details, { memberId: '123' });
  });

  test('errorHandler handles Mongoose duplicate key (E11000) error', () => {
    const duplicateErr = new Error('E11000 duplicate key');
    duplicateErr.code = 11000;
    duplicateErr.keyValue = { invoiceNumber: 'FP-2026-00001' };

    let capturedStatus;
    let capturedJson;

    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        capturedJson = data;
        return this;
      },
    };

    errorHandler(duplicateErr, {}, res, () => {});

    assert.equal(capturedStatus, 409);
    assert.equal(capturedJson.success, false);
    assert.equal(capturedJson.error.code, 'DUPLICATE_KEY');
    assert.match(capturedJson.message, /InvoiceNumber already exists/i);
  });
});
