// scripts/apply-migrations.js
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env.local manually to retrieve database connection strings securely
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is not defined in .env.local.");
  process.exit(1);
}

async function runMigrations() {
  console.log("Connecting to remote Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("✓ Connected successfully!");

    // Helper: check if a table exists
    const checkTableExists = async (tableName) => {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      return res.rows[0].exists;
    };

    const hasUsersTable = await checkTableExists("users");
    const hasProfilesTable = await checkTableExists("profiles");
    const hasMembersTable = await checkTableExists("production_members");

    // 1. Apply Initial Schema if neither users nor profiles exists
    if (!hasUsersTable && !hasProfilesTable) {
      console.log("Applying 0001_initial_schema.sql...");
      const sql1 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0001_initial_schema.sql"), "utf8");
      await client.query(sql1);
      console.log("✓ 0001_initial_schema.sql applied successfully!");
    } else {
      console.log("✓ 0001_initial_schema.sql already applied (skipped).");
    }

    // 2. Apply RBAC Schema if profiles table does not exist or members table doesn't exist
    if ((hasUsersTable && !hasProfilesTable) || !hasMembersTable) {
      console.log("Applying 0002_profiles_and_rbac.sql...");
      const sql2 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0002_profiles_and_rbac.sql"), "utf8");
      await client.query(sql2);
      console.log("✓ 0002_profiles_and_rbac.sql applied successfully!");
    } else {
      console.log("✓ 0002_profiles_and_rbac.sql already applied (skipped).");
    }

    // 3. Apply Auth Trigger Repair (always safe & idempotent)
    console.log("Applying 0003_fix_auth_trigger.sql...");
    const sql3 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0003_fix_auth_trigger.sql"), "utf8");
    await client.query(sql3);
    console.log("✓ 0003_fix_auth_trigger.sql applied successfully!");

    // 4. Apply Isolation and RBAC Policies (always safe & idempotent)
    console.log("Applying 0004_isolation_and_rbac_policies.sql...");
    const sql4 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0004_isolation_and_rbac_policies.sql"), "utf8");
    await client.query(sql4);
    console.log("✓ 0004_isolation_and_rbac_policies.sql applied successfully!");

    // Verify all tables in public schema
    console.log("\nVerifying current public tables:");
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`✓ Found ${res.rows.length} tables:`);
    res.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.table_name}`);
    });

  } catch (error) {
    console.error("❌ Migration failed with error:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("\nDisconnected from database.");
  }
}

runMigrations();
