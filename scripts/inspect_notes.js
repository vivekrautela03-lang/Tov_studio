const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
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
    console.log("Connected to database.");
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'notes';
    `);
    console.log("Notes table columns:", res.rows);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await client.end();
  }
}

run();
