// scripts/audit-db.js
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load env
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

async function audit() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase DB.");

    // Audit Constraints on public.profiles
    console.log("\n--- Profiles Constraints ---");
    const constraints = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid) as condef
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND c.conrelid = 'public.profiles'::regclass;
    `);
    constraints.rows.forEach(r => {
      console.log(`  - Constraint: ${r.conname} (${r.contype}) | Def: ${r.condef}`);
    });

    // Audit RLS on public.profiles
    console.log("\n--- Profiles RLS Status & Policies ---");
    const rls = await client.query(`
      SELECT relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE oid = 'public.profiles'::regclass;
    `);
    console.log(`  - Row Security Enabled: ${rls.rows[0].relrowsecurity} | Force: ${rls.rows[0].relforcerowsecurity}`);

    const policies = await client.query(`
      SELECT policyname, cmd, roles, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles';
    `);
    policies.rows.forEach(p => {
      console.log(`  - Policy: ${p.policyname} | Cmd: ${p.cmd} | Roles: ${p.roles} | Qual: ${p.qual} | WithCheck: ${p.with_check}`);
    });

  } catch (err) {
    console.error("Audit failed:", err);
  } finally {
    await client.end();
  }
}

audit();
