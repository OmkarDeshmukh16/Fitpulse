/**
 * Migration: 20261030000001_multi_tenant_core
 * Purpose: Expand -> Backfill -> Constrain for multi-tenancy core
 * 1. Provision default Organization for existing Settings/Gym
 * 2. Create OrganizationMemberships for existing users
 * 3. Drop single-field global unique indexes (invoiceNumber, memberId)
 * 4. Create composite tenant-scoped unique indexes ({ gymId: 1, invoiceNumber: 1 }, { gymId: 1, memberId: 1 })
 */

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'gym';
};

module.exports = {
  name: '20261030000001_multi_tenant_core',

  async up(db, mongoose) {
    console.log('    [Step 1/4] Checking and creating Organizations...');
    const settingsColl = db.collection('settings');
    const orgsColl = db.collection('organizations');
    const usersColl = db.collection('users');
    const membershipsColl = db.collection('organizationmemberships');

    const existingSettings = await settingsColl.find({}).toArray();

    let primaryOrgId = null;

    if (existingSettings.length > 0) {
      for (const setting of existingSettings) {
        let baseSlug = slugify(setting.gymName || 'fitpulse-gym');
        let finalSlug = baseSlug;
        let counter = 1;
        while (await orgsColl.findOne({ slug: finalSlug })) {
          finalSlug = `${baseSlug}-${counter++}`;
        }

        const orgDoc = {
          name: setting.gymName || 'Fitpulse Gym',
          slug: finalSlug,
          status: 'active',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gracePeriodEndsAt: null,
          billingEmail: setting.email || '',
          phone: setting.phone || '',
          address: setting.address || '',
          city: setting.city || '',
          state: setting.state || '',
          pincode: setting.pincode || '',
          gstNumber: setting.gstNumber || '',
          currency: setting.currency || 'INR',
          currencySymbol: setting.currencySymbol || '₹',
          timezone: setting.timezone || 'Asia/Kolkata',
          settingsId: setting._id,
          branches: [],
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await orgsColl.insertOne(orgDoc);
        if (!primaryOrgId) primaryOrgId = result.insertedId;

        await settingsColl.updateOne({ _id: setting._id }, { $set: { organizationId: result.insertedId } });
      }
    } else {
      // If fresh DB with no Settings, create default organization
      const defaultOrg = await orgsColl.insertOne({
        name: 'Fitpulse Main Gym',
        slug: 'fitpulse-main',
        status: 'active',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      primaryOrgId = defaultOrg.insertedId;
    }

    console.log('    [Step 2/4] Backfilling Organization Memberships for Users...');
    const users = await usersColl.find({}).toArray();
    for (const user of users) {
      if (user.role === 'superadmin') continue;

      let orgId = primaryOrgId;
      if (user.gymId) {
        const matchingOrg = await orgsColl.findOne({ $or: [{ _id: user.gymId }, { settingsId: user.gymId }] });
        if (matchingOrg) orgId = matchingOrg._id;
      }

      if (orgId) {
        await membershipsColl.updateOne(
          { organizationId: orgId, userId: user._id },
          {
            $setOnInsert: {
              organizationId: orgId,
              userId: user._id,
              role: user.role || 'receptionist',
              status: user.isActive ? 'active' : 'inactive',
              isDefault: true,
              permissions: [],
              joinedAt: user.createdAt || new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

        // Standardize user.gymId to organization._id
        await usersColl.updateOne({ _id: user._id }, { $set: { gymId: orgId } });
      }
    }

    console.log('    [Step 3/4] Updating tenant ID references across collections...');
    const tenantCollections = [
      'members',
      'membershipplans',
      'memberships',
      'attendances',
      'payments',
      'workoutplans',
      'dietplans',
      'ptsessions',
      'progresses',
      'activitylogs',
      'aiconversations',
    ];

    if (primaryOrgId) {
      for (const collName of tenantCollections) {
        try {
          const coll = db.collection(collName);
          // If any document has null gymId, backfill to primaryOrgId
          await coll.updateMany({ gymId: null }, { $set: { gymId: primaryOrgId } });
        } catch {}
      }
    }

    console.log('    [Step 4/4] Constraining composite unique indexes...');
    // Drop single unique index on payment invoiceNumber if present
    try {
      const paymentIndexes = await db.collection('payments').indexes();
      for (const idx of paymentIndexes) {
        if (idx.key && idx.key.invoiceNumber === 1 && idx.unique && Object.keys(idx.key).length === 1) {
          console.log(`      Dropping global unique index: ${idx.name} on payments`);
          await db.collection('payments').dropIndex(idx.name);
        }
      }
    } catch (e) {
      console.log('      Notice on payments index:', e.message);
    }

    // Drop single unique index on memberId if present
    try {
      const memberIndexes = await db.collection('members').indexes();
      for (const idx of memberIndexes) {
        if (idx.key && idx.key.memberId === 1 && idx.unique && Object.keys(idx.key).length === 1) {
          console.log(`      Dropping global unique index: ${idx.name} on members`);
          await db.collection('members').dropIndex(idx.name);
        }
      }
    } catch (e) {
      console.log('      Notice on members index:', e.message);
    }

    // Create composite tenant indexes
    await db.collection('payments').createIndex({ gymId: 1, invoiceNumber: 1 }, { unique: true, sparse: true });
    await db.collection('members').createIndex({ gymId: 1, memberId: 1 }, { unique: true, sparse: true });
    await db.collection('organizations').createIndex({ slug: 1 }, { unique: true });
    await db.collection('organizationmemberships').createIndex({ organizationId: 1, userId: 1 }, { unique: true });

    console.log('    ✅ Multi-Tenant Core Migration applied successfully.');
  },

  async down(db, mongoose) {
    console.log('    [Rollback] Reverting composite indexes...');
    try {
      await db.collection('payments').dropIndex({ gymId: 1, invoiceNumber: 1 });
      await db.collection('members').dropIndex({ gymId: 1, memberId: 1 });
    } catch (e) {
      console.log('    Notice on index rollback:', e.message);
    }
  },
};
