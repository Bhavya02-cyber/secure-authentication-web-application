import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { validateRegistration } from "@/lib/validation";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, name } = body;

    // Validate input
    const validation = validateRegistration({
      email,
      password,
      name,
      confirmPassword,
    });
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists (Drizzle uses parameterized queries - safe from SQL injection)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const newUser = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    // Create session
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    await createSession(newUser[0].id, ip, userAgent);

    return NextResponse.json(
      {
        message: "Registration successful",
        user: { id: newUser[0].id, email: newUser[0].email, name: newUser[0].name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
