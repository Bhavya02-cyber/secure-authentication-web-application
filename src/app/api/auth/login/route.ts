import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { validateLogin } from "@/lib/validation";
import { createSession } from "@/lib/auth";
import { checkRateLimit, recordLoginAttempt } from "@/lib/rate-limit";
import { verifySync } from "otplib";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, totpCode } = body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    // Check rate limit
    const rateLimit = await checkRateLimit(normalizedEmail, ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many failed login attempts. Please try again in 15 minutes.",
        },
        { status: 429 }
      );
    }

    // Find user (parameterized query - safe from SQL injection)
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (userRows.length === 0) {
      await recordLoginAttempt(normalizedEmail, false, ip);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = userRows[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      await recordLoginAttempt(normalizedEmail, false, ip);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!totpCode) {
        return NextResponse.json(
          { requires2FA: true, message: "Please enter your 2FA code" },
          { status: 200 }
        );
      }

      const result = verifySync({
        token: totpCode,
        secret: user.twoFactorSecret,
      });

      if (!result.valid) {
        await recordLoginAttempt(normalizedEmail, false, ip);
        return NextResponse.json(
          { error: "Invalid 2FA code" },
          { status: 401 }
        );
      }
    }

    // Record successful attempt
    await recordLoginAttempt(normalizedEmail, true, ip);

    // Create session
    await createSession(user.id, ip, userAgent);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
