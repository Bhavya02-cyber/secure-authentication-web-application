import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sql } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function checkRateLimit(
  email: string,
  ip: string | null
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email.toLowerCase().trim()),
        eq(loginAttempts.success, false),
        gt(loginAttempts.createdAt, windowStart)
      )
    );

  const failedCount = result[0]?.count ?? 0;
  const remaining = Math.max(0, MAX_ATTEMPTS - failedCount);

  return { allowed: failedCount < MAX_ATTEMPTS, remainingAttempts: remaining };
}

export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ip: string | null
) {
  await db.insert(loginAttempts).values({
    email: email.toLowerCase().trim(),
    success,
    ipAddress: ip,
  });
}
