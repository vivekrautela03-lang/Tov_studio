import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import { sendResendVerificationEmail } from "@/utils/resend";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const body = await req.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (email, password, fullName)" },
        { status: 400 }
      );
    }

    // 1. Create the user in auth.users using Admin SDK (setting email_confirm: true confirms them instantly)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true, // User is automatically confirmed
      user_metadata: {
        full_name: fullName.trim(),
        phone: (phone || "").trim(),
        role: role || "Crew"
      }
    });

    if (createError) {
      console.error("Supabase Admin createUser error:", createError);
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 400 }
      );
    }

    const user = userData.user;
    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "User object was not created successfully." },
        { status: 500 }
      );
    }

    console.log(`[AUTH SUCCESS] User ${user.email} created and automatically confirmed.`);
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error("Signup API Route Exception:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
