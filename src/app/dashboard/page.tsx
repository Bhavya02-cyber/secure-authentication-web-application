"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";

interface User {
  id: string;
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // 2FA state
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret2FA, setSecret2FA] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  // Disable 2FA state
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState("");

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError("");
    setTwoFAMessage("");
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setTwoFAError(data.error);
        return;
      }
      setQrCode(data.qrCode);
      setSecret2FA(data.secret);
      setShow2FASetup(true);
    } catch {
      setTwoFAError("Failed to set up 2FA");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFAError(data.error);
        setTwoFALoading(false);
        return;
      }
      setTwoFAMessage("2FA enabled successfully!");
      setShow2FASetup(false);
      setVerifyCode("");
      await fetchSession();
    } catch {
      setTwoFAError("Failed to verify code");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setDisableLoading(true);
    setDisableError("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDisableError(data.error);
        setDisableLoading(false);
        return;
      }
      setTwoFAMessage("2FA has been disabled");
      setShowDisable2FA(false);
      setDisablePassword("");
      await fetchSession();
    } catch {
      setDisableError("Failed to disable 2FA");
    } finally {
      setDisableLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">SecureAuth</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span>{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} loading={loggingOut}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user.name}! 👋
          </h1>
          <p className="text-slate-400">
            Manage your account security and settings
          </p>
        </div>

        {twoFAMessage && (
          <div className="mb-6">
            <Alert type="success">{twoFAMessage}</Alert>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Account Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Account Info</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Name</p>
                <p className="text-sm text-slate-200 mt-1">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-slate-200 mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Member Since</p>
                <p className="text-sm text-slate-200 mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Security Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Password Hashing</span>
                <span className="text-xs bg-success-500/20 text-success-500 px-2.5 py-1 rounded-full font-medium">
                  bcrypt (12 rounds)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">SQL Injection</span>
                <span className="text-xs bg-success-500/20 text-success-500 px-2.5 py-1 rounded-full font-medium">
                  Protected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Session</span>
                <span className="text-xs bg-success-500/20 text-success-500 px-2.5 py-1 rounded-full font-medium">
                  JWT + DB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">2FA</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    user.twoFactorEnabled
                      ? "bg-success-500/20 text-success-500"
                      : "bg-warning-500/20 text-warning-500"
                  }`}
                >
                  {user.twoFactorEnabled ? "Enabled" : "Not Enabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Security Features Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Security Features</h3>
            </div>
            <div className="space-y-2.5">
              {[
                "Bcrypt password hashing",
                "Parameterized SQL queries",
                "HTTP-only session cookies",
                "Rate limiting on login",
                "Input validation & sanitization",
                "TOTP-based 2FA (optional)",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2FA Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">📱</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-sm text-slate-400">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>

          {!user.twoFactorEnabled ? (
            <>
              {!show2FASetup ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-1">
                      2FA is currently <span className="text-warning-500 font-semibold">disabled</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Enable 2FA to protect your account with a time-based one-time password (TOTP)
                    </p>
                  </div>
                  <Button onClick={handleSetup2FA} loading={twoFALoading} size="sm">
                    Enable 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <p className="text-sm text-slate-300 mb-4">
                      <strong>Step 1:</strong> Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    <div className="flex justify-center mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCode}
                        alt="2FA QR Code"
                        className="w-48 h-48 rounded-xl bg-white p-2"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Or enter this secret manually:</p>
                      <code className="text-xs bg-slate-700 text-primary-400 px-3 py-1.5 rounded-lg font-mono select-all">
                        {secret2FA}
                      </code>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <p className="text-sm text-slate-300 mb-3">
                      <strong>Step 2:</strong> Enter the 6-digit code from your authenticator app
                    </p>
                    {twoFAError && (
                      <div className="mb-3">
                        <Alert type="error">{twoFAError}</Alert>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          label=""
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verifyCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setVerifyCode(val);
                          }}
                          maxLength={6}
                        />
                      </div>
                      <Button
                        onClick={handleVerify2FA}
                        loading={twoFALoading}
                        disabled={verifyCode.length !== 6}
                        size="md"
                        className="self-start"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShow2FASetup(false);
                      setVerifyCode("");
                      setTwoFAError("");
                    }}
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Cancel setup
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {!showDisable2FA ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/50 rounded-xl p-5 border border-success-500/20">
                  <div className="flex-1">
                    <p className="text-sm text-slate-300 mb-1">
                      2FA is currently <span className="text-success-500 font-semibold">enabled</span> ✅
                    </p>
                    <p className="text-xs text-slate-500">
                      Your account is protected with TOTP-based two-factor authentication
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDisable2FA(true)}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-danger-500/20">
                  <p className="text-sm text-slate-300 mb-3">
                    Enter your password to confirm disabling 2FA
                  </p>
                  {disableError && (
                    <div className="mb-3">
                      <Alert type="error">{disableError}</Alert>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        label=""
                        type="password"
                        placeholder="Enter your password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="danger"
                      onClick={handleDisable2FA}
                      loading={disableLoading}
                      disabled={!disablePassword}
                      size="md"
                      className="self-start"
                    >
                      Confirm
                    </Button>
                  </div>
                  <button
                    onClick={() => {
                      setShowDisable2FA(false);
                      setDisablePassword("");
                      setDisableError("");
                    }}
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors mt-3"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Architecture Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">System Architecture</h3>
              <p className="text-sm text-slate-400">How this secure login system works</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "🔐 Password Hashing",
                desc: "Passwords are hashed using bcrypt with a cost factor of 12 rounds. Original passwords are never stored in the database.",
              },
              {
                title: "🛡️ SQL Injection Protection",
                desc: "Drizzle ORM uses parameterized queries by default, preventing SQL injection attacks on all database operations.",
              },
              {
                title: "🔑 Session Management",
                desc: "Sessions use JWT tokens stored in HTTP-only cookies. Each session is tracked in the database with IP and expiry.",
              },
              {
                title: "📱 Two-Factor Auth (2FA)",
                desc: "Optional TOTP-based 2FA using industry-standard RFC 6238 algorithm, compatible with Google Authenticator and Authy.",
              },
              {
                title: "⚡ Rate Limiting",
                desc: "Failed login attempts are tracked per email. After 5 failures within 15 minutes, the account is temporarily locked.",
              },
              {
                title: "✅ Input Validation",
                desc: "All inputs are validated server-side with regex patterns. Email, password complexity, and name format are enforced.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4"
              >
                <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
