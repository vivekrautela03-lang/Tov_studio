import { createClient } from "@supabase/supabase-js";

// Storing the public publishable key directly in the client bundle is standard in Supabase 
// and bypasses Next.js/Turbopack environment variable disk-caching bugs.
const supabaseUrl = "https://oldlqchpjhvqitzirxdy.supabase.co";
const supabaseAnonKey = "sb_publishable_E-XZKtLFdBnANM9QMBcs4A_9eFMSMz7";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
