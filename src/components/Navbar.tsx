"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isAdmin = user?.email === "admin@golfcharity.com";

  return (
    <nav className="sticky top-0 z-50 border-b border-border" style={{ background: "rgba(11, 15, 26, 0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110">
              GC
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Golf<span className="text-primary">Charity</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="text-sm font-medium text-accent hover:text-foreground transition-colors">
                        Admin
                      </Link>
                    )}
                    <span className="text-xs text-muted truncate max-w-[160px]">{user.email}</span>
                    <button onClick={handleSignOut} className="btn-danger text-xs py-2 px-4">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                      Login
                    </Link>
                    <Link href="/signup" className="btn-primary text-xs py-2 px-4">
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-foreground transition-colors py-1" onClick={() => setMobileOpen(false)}>
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="text-sm font-medium text-accent hover:text-foreground transition-colors py-1" onClick={() => setMobileOpen(false)}>
                          Admin
                        </Link>
                      )}
                      <span className="text-xs text-muted">{user.email}</span>
                      <button onClick={handleSignOut} className="btn-danger text-xs py-2 px-4 w-fit">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors py-1" onClick={() => setMobileOpen(false)}>
                        Login
                      </Link>
                      <Link href="/signup" className="btn-primary text-xs py-2 px-4 w-fit" onClick={() => setMobileOpen(false)}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
