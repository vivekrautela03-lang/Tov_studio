const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Parse .env.local variables manually
const envPath = path.join(__dirname, "..", ".env.local");
let dbUrl = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const matches = envContent.match(/DATABASE_URL=(.+)/);
  if (matches && matches[1]) {
    dbUrl = matches[1].trim();
  }
}

if (!dbUrl) {
  console.error("Error: DATABASE_URL not found in .env.local.");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database successfully.");

    const migrationSql = `
      ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS cover_image TEXT;
      ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS director TEXT;
      ALTER TABLE public.productions ADD COLUMN IF NOT EXISTS location TEXT;
    `;

    await client.query(migrationSql);
    console.log("Migration 0023 successfully applied!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
