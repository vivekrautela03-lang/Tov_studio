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

    // 5. Apply Enterprise RBAC Schema (always safe & idempotent)
    console.log("Applying 0005_enterprise_rbac_schema.sql...");
    const sql5 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0005_enterprise_rbac_schema.sql"), "utf8");
    await client.query(sql5);
    console.log("✓ 0005_enterprise_rbac_schema.sql applied successfully!");

    // 6. Apply Default Productions Seeder (always safe & idempotent)
    console.log("Applying 0006_seed_default_productions.sql...");
    const sql6 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0006_seed_default_productions.sql"), "utf8");
    await client.query(sql6);
    console.log("✓ 0006_seed_default_productions.sql applied successfully!");

    // 7. Apply Schema Standardization (always safe & idempotent)
    console.log("Applying 0007_standardize_schema_columns.sql...");
    const sql7 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0007_standardize_schema_columns.sql"), "utf8");
    await client.query(sql7);
    console.log("✓ 0007_standardize_schema_columns.sql applied successfully!");

    // 8. Apply Attendance Columns (always safe & idempotent)
    console.log("Applying 0008_add_attendance_columns.sql...");
    const sql8 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0008_add_attendance_columns.sql"), "utf8");
    await client.query(sql8);
    console.log("✓ 0008_add_attendance_columns.sql applied successfully!");

    // 9. Apply Call Sheet Write Policies (always safe & idempotent)
    console.log("Applying 0009_add_call_sheet_write_policies.sql...");
    const sql9 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0009_add_call_sheet_write_policies.sql"), "utf8");
    await client.query(sql9);
    console.log("✓ 0009_add_call_sheet_write_policies.sql applied successfully!");

    // 10. Apply Productions Insert Policy Fix (always safe & idempotent)
    console.log("Applying 0010_fix_productions_insert_policy.sql...");
    const sql10 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0010_fix_productions_insert_policy.sql"), "utf8");
    await client.query(sql10);
    console.log("✓ 0010_fix_productions_insert_policy.sql applied successfully!");

    // 11. Apply New User Trigger Role Update (always safe & idempotent)
    console.log("Applying 0011_update_new_user_trigger_for_role.sql...");
    const sql11 = fs.readFileSync(path.join(__dirname, "../supabase/migrations/0011_update_new_user_trigger_for_role.sql"), "utf8");
    await client.query(sql11);
    console.log("✓ 0011_update_new_user_trigger_for_role.sql applied successfully!");

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
