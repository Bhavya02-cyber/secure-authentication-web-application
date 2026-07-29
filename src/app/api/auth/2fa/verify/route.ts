import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySync } from "otplib";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code" },
        { status: 400 }
      );
    }

    // Get user's secret
    const userRows = await db
      .select({ twoFactorSecret: users.twoFactorSecret })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const secret = userRows[0]?.twoFactorSecret;
    if (!secret) {
      return NextResponse.json(
        { error: "2FA setup not initiated. Please set up 2FA first." },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const result = verifySync({ token: code, secret });

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid code. Please try again." },
        { status: 400 }
      );
    }

    // Enable 2FA
    await db
      .update(users)
      .set({ twoFactorEnabled: true, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: "Two-factor authentication has been enabled successfully",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
