process.env.NODE_ENV = 'test';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Organization = require('../models/Organization.model');
const OrganizationMembership = require('../models/OrganizationMembership.model');
const User = require('../models/User.model');
const Member = require('../models/Member.model');
const ActivityLog = require('../models/ActivityLog.model');
const { requireRole, enforceTrainerScope } = require('../middleware/rbac');
const { switchGym, impersonateGym } = require('../controllers/auth.controller');
const { initialSetup } = require('../controllers/settings.controller');
const { seedSuperAdmin } = require('../controllers/demo.controller');

describe('Auth, Multi-Org Memberships & RBAC Tests', () => {
  let gymA;
  let gymB;
  let gymC;
  let ownerUser;
  let trainerUser;
  let superadminUser;

  before(async () => {
    await connectDB();

    const timestamp = Date.now();
    gymA = await Organization.create({
      name: `RBAC Gym Alpha ${timestamp}`,
      slug: `rbac-alpha-${timestamp}`,
      status: 'active',
    });

    gymB = await Organization.create({
      name: `RBAC Gym Beta ${timestamp}`,
      slug: `rbac-beta-${timestamp}`,
      status: 'active',
    });

    gymC = await Organization.create({
      name: `RBAC Gym Gamma ${timestamp}`,
      slug: `rbac-gamma-${timestamp}`,
      status: 'active',
    });

    ownerUser = await User.create({
      name: `Owner User ${timestamp}`,
      email: `owner-${timestamp}@test.fitpulse.com`,
      password: 'Password123!',
      role: 'gymowner',
      gymId: gymA._id,
      isEmailVerified: true,
    });

    trainerUser = await User.create({
      name: `Trainer User ${timestamp}`,
      email: `trainer-${timestamp}@test.fitpulse.com`,
      password: 'Password123!',
      role: 'trainer',
      gymId: gymB._id,
      isEmailVerified: true,
    });

    superadminUser = await User.create({
      name: `SuperAdmin ${timestamp}`,
      email: `superadmin-${timestamp}@test.fitpulse.com`,
      password: 'Password123!',
      role: 'superadmin',
      isEmailVerified: true,
    });

    // Memberships:
    // ownerUser is gymowner in gymA AND trainer in gymB
    await OrganizationMembership.create({
      organizationId: gymA._id,
      userId: ownerUser._id,
      role: 'gymowner',
      status: 'active',
    });
    await OrganizationMembership.create({
      organizationId: gymB._id,
      userId: ownerUser._id,
      role: 'trainer',
      status: 'active',
    });

    // trainerUser is trainer in gymB
    await OrganizationMembership.create({
      organizationId: gymB._id,
      userId: trainerUser._id,
      role: 'trainer',
      status: 'active',
    });
  });

  after(async () => {
    if (gymA?._id) await Organization.deleteOne({ _id: gymA._id });
    if (gymB?._id) await Organization.deleteOne({ _id: gymB._id });
    if (gymC?._id) await Organization.deleteOne({ _id: gymC._id });

    if (ownerUser?._id) {
      await User.deleteOne({ _id: ownerUser._id });
      await OrganizationMembership.deleteMany({ userId: ownerUser._id });
    }
    if (trainerUser?._id) {
      await User.deleteOne({ _id: trainerUser._id });
      await OrganizationMembership.deleteMany({ userId: trainerUser._id });
    }
    if (superadminUser?._id) {
      await User.deleteOne({ _id: superadminUser._id });
      await ActivityLog.deleteMany({ userId: superadminUser._id });
    }

    await disconnectDB();
  });

  test('Multi-org memberships: A single user belongs to multiple gym organizations with distinct roles', async () => {
    const memberships = await OrganizationMembership.find({ userId: ownerUser._id }).lean();
    assert.equal(memberships.length, 2);

    const memA = memberships.find((m) => m.organizationId.toString() === gymA._id.toString());
    const memB = memberships.find((m) => m.organizationId.toString() === gymB._id.toString());

    assert.ok(memA);
    assert.equal(memA.role, 'gymowner');
    assert.ok(memB);
    assert.equal(memB.role, 'trainer');
  });

  test('switchGym: User can switch active gym to authorized membership gym', async () => {
    const req = {
      user: { _id: ownerUser._id },
      params: { orgId: gymB._id.toString() },
    };

    let responseCode = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await switchGym(req, res);

    assert.equal(responseCode, 200);
    assert.equal(responseBody.success, true);
    assert.equal(responseBody.activeRole, 'trainer');
    assert.ok(responseBody.accessToken);

    const updatedUser = await User.findById(ownerUser._id);
    assert.equal(updatedUser.gymId.toString(), gymB._id.toString());
  });

  test('switchGym: User cannot switch to a gym where they lack active membership', async () => {
    const req = {
      user: { _id: ownerUser._id },
      params: { orgId: gymC._id.toString() },
    };

    let responseCode = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await switchGym(req, res);

    assert.equal(responseCode, 403);
    assert.equal(responseBody.success, false);
  });

  test('Trainer isolation: enforceTrainerScope restricts queries to trainer assigned members', () => {
    const trainerReq = {
      user: { _id: trainerUser._id, role: 'trainer' },
      tenant: { role: 'trainer' },
    };

    const scopedFilter = enforceTrainerScope(trainerReq, { gymId: gymB._id });
    assert.equal(scopedFilter.gymId.toString(), gymB._id.toString());
    assert.equal(scopedFilter.trainerId.toString(), trainerUser._id.toString());

    const ownerReq = {
      user: { _id: ownerUser._id, role: 'gymowner' },
      tenant: { role: 'gymowner' },
    };
    const unscopedFilter = enforceTrainerScope(ownerReq, { gymId: gymB._id });
    assert.equal(unscopedFilter.trainerId, undefined);
  });

  test('RBAC requireRole middleware: blocks unauthorized roles and allows authorized roles', () => {
    const guard = requireRole('gymowner', 'admin');

    let nextCalledWith = null;
    const next = (err) => {
      nextCalledWith = err;
    };

    // Receptionist trying to access owner-only endpoint
    guard({ user: { role: 'receptionist' }, tenant: { role: 'receptionist' } }, {}, next);
    assert.ok(nextCalledWith);
    assert.equal(nextCalledWith.statusCode, 403);

    // Gymowner accessing owner-only endpoint
    nextCalledWith = null;
    guard({ user: { role: 'gymowner' }, tenant: { role: 'gymowner' } }, {}, next);
    assert.equal(nextCalledWith, undefined);

    // SuperAdmin bypasses role check
    nextCalledWith = null;
    guard({ user: { role: 'superadmin' } }, {}, next);
    assert.equal(nextCalledWith, undefined);
  });

  test('Super Admin impersonation: creates audit log and returns 1-hour support token', async () => {
    const req = {
      user: { _id: superadminUser._id, role: 'superadmin', name: 'Support Admin', email: superadminUser.email },
      params: { orgId: gymA._id.toString() },
      body: { reason: 'Resolving billing issue' },
    };

    let responseCode = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await impersonateGym(req, res);

    assert.equal(responseCode, 200);
    assert.equal(responseBody.success, true);
    assert.ok(responseBody.supportToken);

    // Verify audit log was recorded
    const log = await ActivityLog.findOne({
      gymId: gymA._id,
      action: 'superadmin.support_impersonation',
    });
    assert.ok(log);
    assert.equal(log.userId.toString(), superadminUser._id.toString());
  });

  test('initialSetup endpoint is locked when gymowner already exists in system', async () => {
    const req = {
      body: {
        gymName: 'Hacker Gym',
        adminEmail: 'hacker@example.com',
        adminPassword: 'Password123!',
      },
    };

    let responseCode = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await initialSetup(req, res);

    assert.equal(responseCode, 403);
    assert.equal(responseBody.success, false);
  });

  test('seedSuperAdmin is disabled in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const req = {};
    let responseCode = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    try {
      await seedSuperAdmin(req, res);
      assert.equal(responseCode, 403);
      assert.equal(responseBody.success, false);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
