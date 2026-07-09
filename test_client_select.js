const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Parse .env.local variables
const envPath = path.join(__dirname, ".env.local");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  if (urlMatch && urlMatch[1]) {
    supabaseUrl = urlMatch[1].trim();
  }

  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  if (keyMatch && keyMatch[1]) {
    supabaseAnonKey = keyMatch[1].trim();
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSelect() {
  console.log("Testing SELECT queries using public anonymous client...");
  
  const { data: depts, error: deptsErr } = await supabase.from("departments").select("*");
  if (deptsErr) {
    console.error("❌ Departments SELECT failed:", deptsErr);
  } else {
    console.log("✅ Departments SELECT successful. Count:", depts?.length);
  }

  const { data: cast, error: castErr } = await supabase.from("cast_members").select("*");
  if (castErr) {
    console.error("❌ Cast SELECT failed:", castErr);
  } else {
    console.log("✅ Cast SELECT successful. Count:", cast?.length);
  }

  const { data: crew, error: crewErr } = await supabase.from("crew_members").select("*, departments(*)");
  if (crewErr) {
    console.error("❌ Crew SELECT failed:", crewErr);
  } else {
    console.log("✅ Crew SELECT successful. Count:", crew?.length);
  }
}

testSelect();
