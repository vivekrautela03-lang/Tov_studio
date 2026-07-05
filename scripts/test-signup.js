// scripts/test-signup.js
const { createClient } = require("@supabase/supabase-js");
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

// Inlined publishable info + service role
const supabaseUrl = "https://oldlqchpjhvqitzirxdy.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testFlow() {
  console.log("Initializing admin Supabase client...");
  // Using service role client to enable direct user deletions in cleanup
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const randId = Math.floor(Math.random() * 10000);
  const testEmail = `test.runner.tov.${randId}@gmail.com`;
  const testPassword = `passWordSecured${randId}`;
  const testFullName = `Test Runner ${randId}`;

  console.log(`\n1. Creating test user: ${testEmail}`);
  
  // Sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testFullName
      }
    }
  });

  if (signUpError) {
    console.error("❌ Sign up failed:", JSON.stringify(signUpError, null, 2));
    process.exit(1);
  }

  const userId = signUpData.user?.id;
  console.log(`✓ Sign up successful! User ID: ${userId}`);

  console.log("\n2. Verifying public.profiles sync...");
  // Wait 1.5 seconds for trigger insertion to settle
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("❌ Sync verification failed. Profile not found:", profileError.message);
    // Cleanup user before failing
    await supabase.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log("✓ Profile sync verified! Profile Details:");
  console.log(`   - ID: ${profile.id}`);
  console.log(`   - Email: ${profile.email}`);
  console.log(`   - Full Name: ${profile.full_name}`);
  console.log(`   - Role: ${profile.role}`);

  console.log("\n3. Cleaning up test user...");
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("❌ Cleanup deletion failed:", deleteError.message);
  } else {
    console.log("✓ Database cleaned up successfully.");
  }

  console.log("\n🎉 END-TO-END SIGNUP FLOW SUCCESSFULLY AUDITED AND VERIFIED!");
}

testFlow();
