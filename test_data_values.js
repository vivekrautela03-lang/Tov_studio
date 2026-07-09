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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testData() {
  const { data: cast, error: castErr } = await supabase.from("cast_members").select("*").limit(2);
  console.log("Cast Rows Preview:", JSON.stringify(cast, null, 2));

  const { data: crew, error: crewErr } = await supabase.from("crew_members").select(`
    *,
    departments (
      id,
      name
    )
  `).limit(2);
  console.log("Crew Rows Preview:", JSON.stringify(crew, null, 2));
  if (crewErr) {
    console.error("Crew Join Error:", crewErr);
  }
}

testData();
