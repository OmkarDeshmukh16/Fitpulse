const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Schema to track applied migrations
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  batch: { type: Number, required: true },
  appliedAt: { type: Date, default: Date.now },
});

const getMigrationModel = () => {
  return mongoose.models.__Migration || mongoose.model('__Migration', migrationSchema, '_migrations');
};

const getMigrationFiles = () => {
  const migrationsDir = __dirname;
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.js') && file !== 'runner.js' && !file.startsWith('_'))
    .sort();
};

const runUp = async () => {
  await connectDB();
  const Migration = getMigrationModel();
  const appliedMigrations = await Migration.find().sort({ appliedAt: 1 }).lean();
  const appliedNames = new Set(appliedMigrations.map((m) => m.name));

  const allFiles = getMigrationFiles();
  const pendingFiles = allFiles.filter((file) => !appliedNames.has(file));

  if (pendingFiles.length === 0) {
    console.log('✨ Database is already up to date. No pending migrations.');
    return { applied: [] };
  }

  const latestBatch = appliedMigrations.reduce((max, m) => Math.max(max, m.batch || 0), 0);
  const currentBatch = latestBatch + 1;
  const applied = [];

  console.log(`🚀 Executing ${pendingFiles.length} pending migration(s) [Batch #${currentBatch}]...`);

  for (const file of pendingFiles) {
    const filePath = path.join(__dirname, file);
    const migration = require(filePath);
    console.log(`  ▶ Applying: ${file}...`);
    const startTime = Date.now();

    try {
      await migration.up(mongoose.connection.db, mongoose);
      await Migration.create({ name: file, batch: currentBatch, appliedAt: new Date() });
      const elapsed = Date.now() - startTime;
      console.log(`  ✅ Applied:  ${file} (${elapsed}ms)`);
      applied.push(file);
    } catch (err) {
      console.error(`  ❌ Failed:   ${file}: ${err.message}`);
      throw err;
    }
  }

  console.log(`🎉 Migrations complete. Successfully applied ${applied.length} migration(s).`);
  return { applied };
};

const runDown = async () => {
  await connectDB();
  const Migration = getMigrationModel();
  const appliedMigrations = await Migration.find().sort({ appliedAt: -1 }).lean();

  if (appliedMigrations.length === 0) {
    console.log('ℹ️ No applied migrations to roll back.');
    return { rolledBack: [] };
  }

  const latestBatch = appliedMigrations[0].batch;
  const migrationsToRollback = appliedMigrations.filter((m) => m.batch === latestBatch);
  const rolledBack = [];

  console.log(`⏪ Rolling back ${migrationsToRollback.length} migration(s) from Batch #${latestBatch}...`);

  for (const record of migrationsToRollback) {
    const filePath = path.join(__dirname, record.name);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️ Migration file ${record.name} not found on disk; removing record only.`);
      await Migration.deleteOne({ _id: record._id });
      continue;
    }

    const migration = require(filePath);
    console.log(`  ▶ Reverting: ${record.name}...`);
    const startTime = Date.now();

    try {
      if (typeof migration.down === 'function') {
        await migration.down(mongoose.connection.db, mongoose);
      }
      await Migration.deleteOne({ _id: record._id });
      const elapsed = Date.now() - startTime;
      console.log(`  ✅ Reverted: ${record.name} (${elapsed}ms)`);
      rolledBack.push(record.name);
    } catch (err) {
      console.error(`  ❌ Rollback failed for ${record.name}: ${err.message}`);
      throw err;
    }
  }

  console.log(`🎉 Rollback complete. Successfully reverted ${rolledBack.length} migration(s).`);
  return { rolledBack };
};

const runStatus = async () => {
  await connectDB();
  const Migration = getMigrationModel();
  const applied = await Migration.find().sort({ appliedAt: 1 }).lean();
  const appliedMap = new Map(applied.map((m) => [m.name, m]));
  const allFiles = getMigrationFiles();

  console.log('\n📊 Migration Status:\n');
  console.log('  Status     | Batch | Migration File');
  console.log('  -----------+-------+-------------------------------------');

  for (const file of allFiles) {
    const record = appliedMap.get(file);
    if (record) {
      const batchStr = String(record.batch).padStart(5, ' ');
      console.log(`  [APPLIED]  | ${batchStr} | ${file}`);
    } else {
      console.log(`  [PENDING]  |       | ${file}`);
    }
  }
  console.log('');
};

if (require.main === module) {
  const action = process.argv[2] || 'status';

  (async () => {
    try {
      if (action === 'up') await runUp();
      else if (action === 'down') await runDown();
      else if (action === 'status') await runStatus();
      else {
        console.error(`Unknown action: ${action}. Use 'up', 'down', or 'status'.`);
        process.exit(1);
      }
      process.exit(0);
    } catch (err) {
      console.error('Fatal migration error:', err);
      process.exit(1);
    }
  })();
}

module.exports = {
  runUp,
  runDown,
  runStatus,
  getMigrationFiles,
};
