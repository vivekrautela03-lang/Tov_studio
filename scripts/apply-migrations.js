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
  console.error("❌ Error: DATABASE_URL is not defined in .env.local. Add Remote PostgreSQL Database Connection URL first.");
  process.exit(1);
}

async function applyMigrations() {
  console.log("Connecting to remote Supabase PostgreSQL database...");
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase remote connections
    }
  });

  try {
    await client.connect();
    console.log("✓ Connected successfully!");

    // Read the migration SQL file
    const sqlFilePath = path.join(__dirname, "../supabase/migrations/0001_initial_schema.sql");
    console.log(`Reading schema migration file from: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration SQL file not found at ${sqlFilePath}`);
    }

    const migrationSql = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Applying initial schema DDL migrations...");
    // Execute DDL statements
    await client.query(migrationSql);
    console.log("✓ DDL Schema applied successfully!");

    // Verify created tables
    console.log("\nVerifying table structure in 'public' schema:");
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (res.rows.length === 0) {
      console.warn("⚠ Warning: No tables were found in the public schema.");
    } else {
      console.log(`✓ Found ${res.rows.length} tables in public schema:`);
      res.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. ${row.table_name}`);
      });
    }

  } catch (error) {
    console.error("❌ Migration failed with error:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("\nDisconnected from database.");
  }
}

applyMigrations();
