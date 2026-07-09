import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/utils/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing email or fullName parameter" },
        { status: 400 }
      );
    }

    const result = await sendWelcomeEmail(email, fullName);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error("Welcome API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
