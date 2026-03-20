"use client";

/**
 * User Dashboard Page
 *
 * Protected route displaying the user's:
 * - Subscription status (with subscribe CTA)
 * - Scores (latest 5, add form with validation)
 * - Charity selection
 * - Winnings history
 * - Latest draw results with match highlighting
 *
 * KEY BUSINESS RULES:
 * - Features are gated behind active subscription
 * - Score entry blocked for non-subscribers (shows warning)
 * - Only 5 scores stored; newest replaces oldest automatically
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Score {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

interface Subscription {
  id: string;
  plan_type: string;
  is_active: boolean;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface CharitySelection {
  charity_id: string;
  charities: Charity;
}

interface Draw {
  id: string;
  draw_date: string;
  numbers: number[];
}

interface Winner {
  id: string;
  match_count: number;
  amount: number;
  status: string;
  draws: { draw_date: string; numbers: number[] };
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<CharitySelection | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const [newScore, setNewScore] = useState("");
  const [planType, setPlanType] = useState("monthly");
  const [loadingStates, setLoadingStates] = useState({
    subscription: true,
    scores: true,
    charities: true,
    draws: true,
    winners: true,
    addScore: false,
    subscribe: false,
    selectCharity: false,
  });

  const setLoading = (key: string, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const fetchSubscription = useCallback(async () => {
    setLoading("subscription", true);
    const res = await fetch("/api/subscriptions");
    const data = await res.json();
    setSubscription(data.subscription);
    setLoading("subscription", false);
  }, []);

  const fetchScores = useCallback(async () => {
    setLoading("scores", true);
    const res = await fetch("/api/scores");
    const data = await res.json();
    setScores(data.scores || []);
    setLoading("scores", false);
  }, []);

  const fetchCharities = useCallback(async () => {
    setLoading("charities", true);
    const res = await fetch("/api/charities");
    const data = await res.json();
    setCharities(data.charities || []);

    const selRes = await fetch("/api/charities/select");
    const selData = await selRes.json();
    setSelectedCharity(selData.selection);
    setLoading("charities", false);
  }, []);

  const fetchDraws = useCallback(async () => {
    setLoading("draws", true);
    const res = await fetch("/api/draws");
    const data = await res.json();
    setDraws(data.draws || []);
    setLoading("draws", false);
  }, []);

  const fetchWinners = useCallback(async () => {
    setLoading("winners", true);
    const res = await fetch("/api/winners");
    const data = await res.json();
    setWinners(data.winners || []);
    setLoading("winners", false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchSubscription();
      fetchScores();
      fetchCharities();
      fetchDraws();
      fetchWinners();
    }
  }, [user, authLoading, router, fetchSubscription, fetchScores, fetchCharities, fetchDraws, fetchWinners]);

  const handleSubscribe = async () => {
    setLoading("subscribe", true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: planType }),
      });
      if (res.ok) {
        showToast("Subscription activated successfully! 🎉");
        await fetchSubscription();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to subscribe", "error");
      }
    } catch {
      showToast("Failed to subscribe. Please try again.", "error");
    }
    setLoading("subscribe", false);
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseInt(newScore);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      showToast("Score must be between 1 and 45", "error");
      return;
    }

    setLoading("addScore", true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreNum }),
      });

      if (res.ok) {
        const wasAtMax = scores.length >= 5;
        showToast(
          wasAtMax
            ? `Score ${scoreNum} added! Oldest score removed (max 5).`
            : `Score ${scoreNum} added successfully!`
        );
        setNewScore("");
        await fetchScores();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add score", "error");
      }
    } catch {
      showToast("Failed to add score. Please try again.", "error");
    }
    setLoading("addScore", false);
  };

  const handleSelectCharity = async (charityId: string) => {
    setLoading("selectCharity", true);
    try {
      const res = await fetch("/api/charities/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charity_id: charityId }),
      });
      if (res.ok) {
        const charityName = charities.find(c => c.id === charityId)?.name;
        showToast(`Now supporting ${charityName}! ❤️`);
        await fetchCharities();
      } else {
        showToast("Failed to select charity", "error");
      }
    } catch {
      showToast("Failed to select charity. Please try again.", "error");
    }
    setLoading("selectCharity", false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8 border-4" />
      </div>
    );
  }

  const isSubscribed = subscription?.is_active;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted text-sm">Welcome back! Manage your scores, subscription, and charity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Subscription Card ── */}
          <div className="glass-card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Subscription</h2>
            </div>

            {loadingStates.subscription ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : isSubscribed ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-success font-semibold text-sm">Active</span>
                </div>
                <p className="text-muted text-sm">
                  Plan: <span className="text-foreground font-medium capitalize">{subscription?.plan_type}</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-muted text-sm mb-4">You&apos;re not subscribed yet. Subscribe to enter scores and join draws!</p>
                <div className="flex items-center gap-3 mb-4">
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    className="input-field w-auto"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loadingStates.subscribe}
                  className="btn-primary"
                >
                  {loadingStates.subscribe ? (
                    <><div className="spinner" /> Subscribing...</>
                  ) : (
                    "Subscribe Now"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Scores Card ── */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-indigo-400 flex items-center justify-center text-white">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Your Scores</h2>
              <span className="ml-auto text-xs text-muted">{scores.length}/5</span>
            </div>

            {/* Subscription gate: block score entry for non-subscribers */}
            {!isSubscribed ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-muted">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-muted text-sm font-medium mb-1">Subscription Required</p>
                <p className="text-muted text-xs">Subscribe to start entering scores and join draws.</p>
              </div>
            ) : loadingStates.scores ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : (
              <>
                <form onSubmit={handleAddScore} className="flex gap-3 mb-5">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="Enter score (1-45)"
                    className="input-field flex-1"
                    required
                    disabled={loadingStates.addScore}
                  />
                  <button
                    type="submit"
                    disabled={loadingStates.addScore}
                    className="btn-primary whitespace-nowrap"
                  >
                    {loadingStates.addScore ? <div className="spinner" /> : "Add"}
                  </button>
                </form>

                <div className="flex flex-wrap gap-3">
                  {scores.length === 0 ? (
                    <p className="text-muted text-sm">No scores yet. Add your first score above!</p>
                  ) : (
                    scores.map((s) => (
                      <div key={s.id} className="text-center">
                        <div className="score-ball">{s.score}</div>
                        <span className="text-[10px] text-muted mt-1 block">{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    ))
                  )}
                </div>

                {scores.length > 0 && (
                  <p className="text-[11px] text-muted mt-4 italic">
                    💡 Max 5 scores — adding a new one replaces the oldest automatically
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Charity Selection Card ── */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center text-white">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Your Charity</h2>
            </div>

            {loadingStates.charities ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : (
              <>
                {selectedCharity ? (
                  <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="text-sm font-medium text-primary">Currently supporting:</p>
                    <p className="font-bold mt-1">{selectedCharity.charities?.name}</p>
                  </div>
                ) : (
                  <p className="text-muted text-sm mb-4">Select a charity to support with your winnings.</p>
                )}

                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {charities.map((charity) => (
                    <button
                      key={charity.id}
                      onClick={() => handleSelectCharity(charity.id)}
                      disabled={loadingStates.selectCharity}
                      className={`text-left p-3 rounded-xl border transition-all text-sm ${
                        selectedCharity?.charity_id === charity.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:border-primary/30 hover:bg-card-hover text-muted"
                      }`}
                    >
                      <span className="font-medium text-foreground">{charity.name}</span>
                      <p className="text-xs mt-0.5 line-clamp-1">{charity.description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Winnings Card ── */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Winnings</h2>
            </div>

            {loadingStates.winners ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : winners.length === 0 ? (
              <p className="text-muted text-sm">No winnings yet. Enter your scores and wait for the next draw!</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {winners.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          w.match_count === 5 ? "bg-yellow-500/20 text-yellow-400" :
                          w.match_count === 4 ? "bg-purple-500/20 text-purple-400" :
                          "bg-primary/20 text-primary"
                        }`}>{w.match_count} matches</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          w.status === "paid" ? "bg-success/20 text-success" : "bg-accent/20 text-accent"
                        }`}>{w.status}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-success">${w.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Latest Draw Results ── */}
          <div className="glass-card p-6 lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Latest Draw Results</h2>
            </div>

            {loadingStates.draws ? (
              <div className="flex justify-center py-6"><div className="spinner" /></div>
            ) : draws.length === 0 ? (
              <p className="text-muted text-sm">No draws have been conducted yet. Stay tuned!</p>
            ) : (
              <div className="space-y-4">
                {draws.map((draw, i) => (
                  <div key={draw.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-muted">
                        {i === 0 && <span className="text-primary font-medium">Latest • </span>}
                        {new Date(draw.draw_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {draw.numbers.map((num, j) => {
                        const isMatch = scores.some(s => s.score === num);
                        return (
                          <div key={j} className={`score-ball ${isMatch ? "match" : ""}`} style={{ width: 42, height: 42, fontSize: 14 }}>
                            {num}
                          </div>
                        );
                      })}
                    </div>
                    {scores.length > 0 && (
                      <span className="text-xs text-muted ml-auto">
                        {draw.numbers.filter(n => scores.some(s => s.score === n)).length} match{draw.numbers.filter(n => scores.some(s => s.score === n)).length !== 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
