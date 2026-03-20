"use client";

/**
 * Admin Panel
 *
 * Protected route accessible only to admin@golfcharity.com.
 * Provides platform management capabilities:
 * - View all registered users with subscription & score status
 * - Trigger new draws (generates random numbers, matches against user scores)
 * - View all winners with match counts and prize amounts
 *
 * NOTE: Admin access is hardcoded via email check for MVP simplicity.
 * In production, this would use role-based access control (RBAC).
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface UserInfo {
  id: string;
  is_active: boolean;
  plan_type: string;
  score_count: number;
  joined: string | null;
}

interface Winner {
  id: string;
  user_id: string;
  match_count: number;
  amount: number;
  status: string;
  draws: { draw_date: string; numbers: number[] };
}

interface Draw {
  id: string;
  draw_date: string;
  numbers: number[];
}

// Hardcoded admin email — in production, use RBAC
const ADMIN_EMAIL = "admin@golfcharity.com";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingWinners, setLoadingWinners] = useState(true);
  const [loadingDraws, setLoadingDraws] = useState(true);
  const [triggeringDraw, setTriggeringDraw] = useState(false);
  const [drawResult, setDrawResult] = useState<{ numbers: number[]; winnersCount: number } | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoadingUsers(false);
  }, []);

  const fetchWinners = useCallback(async () => {
    setLoadingWinners(true);
    const res = await fetch("/api/winners");
    const data = await res.json();
    setWinners(data.winners || []);
    setLoadingWinners(false);
  }, []);

  const fetchDraws = useCallback(async () => {
    setLoadingDraws(true);
    const res = await fetch("/api/draws");
    const data = await res.json();
    setDraws(data.draws || []);
    setLoadingDraws(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && !isAdmin) {
      router.push("/dashboard");
      return;
    }
    if (user && isAdmin) {
      fetchUsers();
      fetchWinners();
      fetchDraws();
    }
  }, [user, authLoading, isAdmin, router, fetchUsers, fetchWinners, fetchDraws]);

  const handleTriggerDraw = async () => {
    setTriggeringDraw(true);
    setDrawResult(null);
    try {
      const res = await fetch("/api/draws", { method: "POST" });
      const data = await res.json();
      if (data.draw) {
        setDrawResult({ numbers: data.draw.numbers, winnersCount: data.winnersCount });
        showToast(`Draw complete! ${data.winnersCount} winner${data.winnersCount !== 1 ? "s" : ""} found.`);
        await fetchDraws();
        await fetchWinners();
      } else {
        showToast(data.error || "Failed to trigger draw", "error");
      }
    } catch {
      showToast("Error triggering draw. Please try again.", "error");
    }
    setTriggeringDraw(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8 border-4" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold mb-2 text-danger">Access Denied</h2>
          <p className="text-muted text-sm">Admin access is required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
          <p className="text-muted text-sm">Manage draws, view users, and track winners.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold gradient-text">{users.length}</p>
            <p className="text-xs text-muted mt-1">Total Users</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-success">{users.filter(u => u.is_active).length}</p>
            <p className="text-xs text-muted mt-1">Active Subscribers</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-accent">{winners.length}</p>
            <p className="text-xs text-muted mt-1">Total Winners</p>
          </div>
        </div>

        {/* ── Trigger Draw ── */}
        <div className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold">Trigger New Draw</h2>
          </div>

          <p className="text-muted text-sm mb-4">
            Generate 5 random numbers (1–45) and compare against all users&apos; scores. Winners with 3+ matches will be recorded.
          </p>

          <button
            onClick={handleTriggerDraw}
            disabled={triggeringDraw}
            className="btn-secondary"
          >
            {triggeringDraw ? (
              <><div className="spinner" /> Running Draw...</>
            ) : (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Trigger Draw
              </>
            )}
          </button>

          {drawResult && (
            <div className="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in">
              <p className="text-sm font-medium text-primary mb-3">Draw Complete!</p>
              <div className="flex gap-2 mb-3">
                {drawResult.numbers.map((num, i) => (
                  <div key={i} className="score-ball">{num}</div>
                ))}
              </div>
              <p className="text-sm text-muted">
                <span className="text-foreground font-medium">{drawResult.winnersCount}</span> winner{drawResult.winnersCount !== 1 ? "s" : ""} found
              </p>
            </div>
          )}
        </div>

        {/* ── Recent Draws ── */}
        <div className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-bold mb-4">Recent Draws</h2>
          {loadingDraws ? (
            <div className="flex justify-center py-6"><div className="spinner" /></div>
          ) : draws.length === 0 ? (
            <p className="text-muted text-sm">No draws yet.</p>
          ) : (
            <div className="space-y-3">
              {draws.map((draw) => (
                <div key={draw.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                  <span className="text-xs text-muted min-w-[100px]">
                    {new Date(draw.draw_date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {draw.numbers.map((num, j) => (
                      <div key={j} className="score-ball" style={{ width: 36, height: 36, fontSize: 12 }}>{num}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Users & Winners Tables ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Table */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-lg font-bold mb-4">All Users</h2>
            {loadingUsers ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : users.length === 0 ? (
              <p className="text-muted text-sm">No users registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="text-left py-3 pr-4 font-medium">User ID</th>
                      <th className="text-left py-3 pr-4 font-medium">Status</th>
                      <th className="text-left py-3 pr-4 font-medium">Plan</th>
                      <th className="text-right py-3 font-medium">Scores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-card-hover/30 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-muted">{u.id.substring(0, 8)}...</td>
                        <td className="py-3 pr-4">
                          {u.is_active ? (
                            <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-xs bg-muted/20 text-muted px-2 py-0.5 rounded-full">Inactive</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 capitalize text-xs">{u.plan_type}</td>
                        <td className="py-3 text-right">{u.score_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Winners Table */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-bold mb-4">Winners</h2>
            {loadingWinners ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : winners.length === 0 ? (
              <p className="text-muted text-sm">No winners yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="text-left py-3 pr-4 font-medium">User</th>
                      <th className="text-left py-3 pr-4 font-medium">Matches</th>
                      <th className="text-left py-3 pr-4 font-medium">Amount</th>
                      <th className="text-right py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((w) => (
                      <tr key={w.id} className="border-b border-border/50 hover:bg-card-hover/30 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-muted">{w.user_id.substring(0, 8)}...</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            w.match_count === 5 ? "bg-yellow-500/20 text-yellow-400" :
                            w.match_count === 4 ? "bg-purple-500/20 text-purple-400" :
                            "bg-primary/20 text-primary"
                          }`}>{w.match_count} match</span>
                        </td>
                        <td className="py-3 pr-4 text-success font-bold">${w.amount}</td>
                        <td className="py-3 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            w.status === "paid" ? "bg-success/20 text-success" : "bg-accent/20 text-accent"
                          }`}>{w.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
