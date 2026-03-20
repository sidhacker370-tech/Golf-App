"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export default function LandingPage() {
  const [charities, setCharities] = useState<Charity[]>([]);

  useEffect(() => {
    const fetchCharities = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("charities").select("*").limit(6);
      if (data) setCharities(data);
    };
    fetchCharities();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 px-4">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-medium text-muted mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Now accepting new members
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            <span className="gradient-text">Play, Win,</span>
            <br />
            <span className="text-foreground">Give Back</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Subscribe to our golf charity platform. Enter your scores, join weekly draws, 
            and support incredible causes — all from one simple dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/signup" className="btn-primary text-base py-3 px-8">
              Get Started
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary text-base py-3 px-8">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted text-center mb-16 max-w-xl mx-auto">Three simple steps to start making a difference while enjoying the game you love.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                ),
                title: "Subscribe",
                description: "Join with a simple subscription. No complex payments — just activate and you're in.",
                color: "from-primary to-emerald-400",
              },
              {
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
                  </svg>
                ),
                title: "Enter Scores",
                description: "Submit your latest golf scores (1–45). Keep your best 5 scores in play for weekly draws.",
                color: "from-secondary to-indigo-400",
              },
              {
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
                title: "Give Back",
                description: "Choose a charity you care about. Your wins go towards making the world a better place.",
                color: "from-accent to-amber-400",
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-5 text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities Section */}
      {charities.length > 0 && (
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Our Partner Charities</h2>
            <p className="text-muted text-center mb-16 max-w-xl mx-auto">Choose from incredible causes and make a real impact with every draw.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((charity, i) => (
                <div key={charity.id} className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="h-48 bg-gradient-to-br from-card to-card-hover flex items-center justify-center overflow-hidden">
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{charity.name}</h3>
                    <p className="text-muted text-sm leading-relaxed">{charity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-muted mb-10 text-lg">Join thousands of golfers who are playing for a purpose. Subscribe today.</p>
          <Link href="/signup" className="btn-primary text-base py-3 px-10">
            Start Your Journey
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
              GC
            </div>
            <span className="text-sm text-muted">© 2026 GolfCharity. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">Login</Link>
            <Link href="/signup" className="text-sm text-muted hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
