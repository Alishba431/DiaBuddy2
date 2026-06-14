/**
 * Applies badges RLS migration to Supabase Postgres.
 *
 * Usage:
 *   Set DATABASE_URL in diabuddy/.env (from Supabase → Settings → Database → Connection string)
 *   node scripts/apply-badges-migration.js
 */
const fs = require('fs');
const path = require('path');

async function main() {
  let databaseUrl = process.env.DATABASE_URL;
  const envPath = path.join(__dirname, '..', '.env');
  if (!databaseUrl && fs.existsSync(envPath)) {
    const line = fs.readFileSync(envPath, 'utf8').split('\n').find(l => l.startsWith('DATABASE_URL='));
    if (line) databaseUrl = line.slice('DATABASE_URL='.length).trim();
  }

  if (!databaseUrl) {
    console.error('\nMissing DATABASE_URL.');
    console.error('1. Supabase Dashboard → Project Settings → Database → Connection string (URI)');
    console.error('2. Add to diabuddy/.env:  DATABASE_URL=postgresql://postgres.[ref]:[password]@...\n');
    console.error('Or paste this file into Supabase → SQL Editor → Run:');
    console.error('  diabuddy/supabase/migrations/20250614_badges_rls_and_award_rpc.sql\n');
    process.exit(1);
  }

  let pg;
  try {
    pg = require('pg');
  } catch {
    console.error('Install pg first:  pnpm add -D pg --filter @workspace/diabuddy');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250614_badges_rls_and_award_rpc.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Badges migration applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
