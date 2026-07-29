"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) {
          router.push("/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">SecureAuth</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-600/20 text-primary-400 text-sm px-4 py-1.5 rounded-full mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              College Minor Project — Secure Login System
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
              Secure Login
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
                System
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              A production-ready authentication system featuring bcrypt password hashing,
              input validation, SQL injection protection, session management,
              and optional two-factor authentication (2FA).
            </p>

            <div className="flex items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: "🔐",
                title: "Bcrypt Password Hashing",
                desc: "Passwords are securely hashed using bcrypt with 12 salt rounds, making brute-force attacks computationally infeasible.",
                color: "primary",
              },
              {
                icon: "🛡️",
                title: "SQL Injection Protection",
                desc: "All database queries use parameterized statements via Drizzle ORM, completely preventing SQL injection attacks.",
                color: "success",
              },
              {
                icon: "✅",
                title: "Input Validation",
                desc: "Comprehensive server-side validation with regex patterns for email, password complexity, and name format.",
                color: "warning",
              },
              {
                icon: "🔑",
                title: "Session Management",
                desc: "JWT-based sessions stored in HTTP-only cookies with database-backed tracking, IP logging, and expiration.",
                color: "accent",
              },
              {
                icon: "📱",
                title: "Two-Factor Auth (2FA)",
                desc: "Optional TOTP-based 2FA compatible with Google Authenticator and Authy for enhanced account security.",
                color: "primary",
              },
              {
                icon: "⚡",
                title: "Rate Limiting",
                desc: "Login attempts are tracked per email. Accounts are temporarily locked after 5 failed attempts in 15 minutes.",
                color: "danger",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t border-slate-800/50 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
              Built With
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                "Next.js 16",
                "TypeScript",
                "PostgreSQL",
                "Drizzle ORM",
                "bcrypt.js",
                "JWT (jose)",
                "TOTP (otplib)",
                "Tailwind CSS",
              ].map((tech) => (
                <span
                  key={tech}
                  className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
