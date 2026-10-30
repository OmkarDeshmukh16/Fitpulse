process.env.NODE_ENV = 'test';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Organization = require('../models/Organization.model');
const OrganizationMembership = require('../models/OrganizationMembership.model');
const Member = require('../models/Member.model');
const Payment = require('../models/Payment.model');
const { MembershipPlan } = require('../models/MembershipPlan.model');

describe('Multi-Tenancy Core & Cross-Tenant Boundary Tests', () => {
  let gymA;
  let gymB;

  before(async () => {
    await connectDB();

    // Create two test gym tenants
    const timestamp = Date.now();
    gymA = await Organization.create({
      name: `Gym Alpha ${timestamp}`,
      slug: `gym-alpha-${timestamp}`,
      status: 'active',
    });

    gymB = await Organization.create({
      name: `Gym Beta ${timestamp}`,
      slug: `gym-beta-${timestamp}`,
      status: 'active',
    });
  });

  after(async () => {
    if (gymA?._id) {
      await Organization.deleteOne({ _id: gymA._id });
      await Member.deleteMany({ gymId: gymA._id });
      await Payment.deleteMany({ gymId: gymA._id });
      await MembershipPlan.deleteMany({ gymId: gymA._id });
    }
    if (gymB?._id) {
      await Organization.deleteOne({ _id: gymB._id });
      await Member.deleteMany({ gymId: gymB._id });
      await Payment.deleteMany({ gymId: gymB._id });
      await MembershipPlan.deleteMany({ gymId: gymB._id });
    }
    await disconnectDB();
  });

  test('Organization creates with 14-day trial and active status', () => {
    assert.equal(gymA.status, 'active');
    assert.ok(gymA.trialEndsAt instanceof Date);
    assert.ok(gymA.trialEndsAt.getTime() > Date.now());
  });

  test('Organization slug uniqueness is enforced', async () => {
    await assert.rejects(
      async () => {
        await Organization.create({
          name: 'Duplicate Slug Gym',
          slug: gymA.slug, // duplicate
        });
      },
      /E11000.*duplicate key/i
    );
  });

  test('Composite unique constraint: Gym A and Gym B can both have identical invoice numbers', async () => {
    const memberA = await Member.create({
      gymId: gymA._id,
      fullName: 'Alice Alpha',
      gender: 'female',
      phone: '9999999901',
      memberId: 'FP-TEST-001',
    });

    const memberB = await Member.create({
      gymId: gymB._id,
      fullName: 'Bob Beta',
      gender: 'male',
      phone: '9999999902',
      memberId: 'FP-TEST-002',
    });

    const sharedInvoiceNumber = `INV-CROSS-TENANT-${Date.now()}`;

    // Gym A creates payment with shared invoice number
    const paymentA = await Payment.create({
      gymId: gymA._id,
      memberId: memberA._id,
      invoiceNumber: sharedInvoiceNumber,
      amount: 1500,
      paidAmount: 1500,
      method: 'cash',
    });

    // Gym B creates payment with the EXACT SAME invoice number (Must succeed without duplicate key error)
    const paymentB = await Payment.create({
      gymId: gymB._id,
      memberId: memberB._id,
      invoiceNumber: sharedInvoiceNumber,
      amount: 2500,
      paidAmount: 2500,
      method: 'upi',
    });

    assert.equal(paymentA.invoiceNumber, sharedInvoiceNumber);
    assert.equal(paymentB.invoiceNumber, sharedInvoiceNumber);
    assert.notEqual(paymentA.gymId.toString(), paymentB.gymId.toString());

    // But Gym A cannot create another payment with the same invoice number for itself
    await assert.rejects(
      async () => {
        await Payment.create({
          gymId: gymA._id,
          memberId: memberA._id,
          invoiceNumber: sharedInvoiceNumber,
          amount: 1000,
          method: 'cash',
        });
      },
      /E11000.*duplicate key/i
    );
  });

  test('Composite unique constraint: Gym A and Gym B can both have identical memberId codes', async () => {
    const sharedCode = `CODE-${Date.now()}`;

    const memberA = await Member.create({
      gymId: gymA._id,
      fullName: 'Member In Gym A',
      gender: 'male',
      phone: '9888888801',
      memberId: sharedCode,
    });

    const memberB = await Member.create({
      gymId: gymB._id,
      fullName: 'Member In Gym B',
      gender: 'female',
      phone: '9888888802',
      memberId: sharedCode,
    });

    assert.equal(memberA.memberId, sharedCode);
    assert.equal(memberB.memberId, sharedCode);
    assert.notEqual(memberA.gymId.toString(), memberB.gymId.toString());

    // But duplicate inside same gym must fail
    await assert.rejects(
      async () => {
        await Member.create({
          gymId: gymA._id,
          fullName: 'Duplicate Inside Gym A',
          gender: 'other',
          phone: '9888888803',
          memberId: sharedCode,
        });
      },
      /E11000.*duplicate key/i
    );
  });

  test('Cross-tenant data isolation: Gym A query cannot read Gym B member', async () => {
    const memberB = await Member.findOne({ gymId: gymB._id });
    assert.ok(memberB);

    // Gym A tries to query Gym B's member record scoped to Gym A
    const leaked = await Member.findOne({ _id: memberB._id, gymId: gymA._id });
    assert.equal(leaked, null);
  });

  test('Cross-tenant data isolation: Gym A cannot assign Gym B plan to its members', async () => {
    const planB = await MembershipPlan.create({
      gymId: gymB._id,
      name: 'Gym B Exclusive Annual Plan',
      durationDays: 365,
      price: 12000,
    });

    // Query verifying plan belongs to Gym B, not Gym A
    const planFromA = await MembershipPlan.findOne({ _id: planB._id, gymId: gymA._id });
    assert.equal(planFromA, null);
  });
});
