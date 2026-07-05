// scripts/check-productions.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oldlqchpjhvqitzirxdy.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  console.log("Checking productions...");
  const { data: productions, error: pError } = await supabase.from("productions").select("id, title");
  if (pError) {
    console.error("Error fetching productions:", pError);
  } else {
    console.log("Found productions:", productions);
  }

  console.log("\nChecking profiles count...");
  const { count, error: countError } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  if (countError) {
    console.error("Error fetching profiles count:", countError);
  } else {
    console.log("Total profiles in database:", count);
  }
}

run();
