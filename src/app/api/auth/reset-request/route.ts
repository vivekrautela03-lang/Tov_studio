import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import { sendResendPasswordResetEmail } from "@/utils/resend";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing required email parameter." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim();

    // 1. Check if the user exists
    const { data: usersData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    if (getUserError) {
      console.error("Supabase Admin listUsers error:", getUserError);
    }

    const targetUser = usersData?.users?.find((u) => u.email?.toLowerCase() === emailTrimmed.toLowerCase());
    
    // For security reasons, do not leak whether a user exists or not. Simply return success if there's no user.
    if (!targetUser || !targetUser.email) {
      console.log(`[AUTH RESET] Requested reset for non-existent email: ${emailTrimmed}. Responding with mock success.`);
      return NextResponse.json({ success: true, message: "If the email exists, a reset link was sent." });
    }

    // 2. Generate the recovery reset link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: targetUser.email,
      options: {
        redirectTo: `${origin}/#recovery`
      }
    });

    if (linkError) {
      console.error("Supabase Admin generateLink recovery error:", linkError);
      return NextResponse.json(
        { success: false, error: "Failed to generate recovery link: " + linkError.message },
        { status: 500 }
      );
    }

    const recoveryLink = linkData.properties.action_link;

    // 3. Dispatch the reset email via Resend
    const emailResult = await sendResendPasswordResetEmail(targetUser.email, recoveryLink);
    if (!emailResult.success) {
      console.error("Resend password reset email failed to dispatch:", emailResult.error);
      return NextResponse.json(
        { success: false, error: "Reset email failed to deliver: " + (emailResult.error as any)?.message },
        { status: 500 }
      );
    }

    console.log(`[AUTH SUCCESS] Password reset recovery email sent via Resend for ${targetUser.email}.`);
    return NextResponse.json({ success: true, message: "If the email exists, a reset link was sent." });
  } catch (error: any) {
    console.error("Reset API Route Exception:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
