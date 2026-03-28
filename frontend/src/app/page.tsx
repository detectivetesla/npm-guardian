"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import RiskCard from "@/components/RiskCard";
import ScanForm from "@/components/ScanForm";
import RecentScans from "@/components/RecentScans";
import DependencyGraph from "@/components/DependencyGraph";
import { Shield, User, LogOut } from "lucide-react";
import { supabasePublic } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface DashboardStats {
  totalScans: number;
  highRiskCount: number;
  reposProtected: number;
  packagesAnalyzed: number;
  recentScans: Array<{
    id: string;
    type: string;
    package_name: string;
    package_version: string;
    status: string;
    overall_risk_score: number;
    risk_level: string;
    started_at: string;
    completed_at: string | null;
  }>;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (!supabasePublic) return;

    // Get initial session
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleScanQueued = () => {
    // Refresh stats after a scan is queued
    setTimeout(fetchStats, 1000);
  };

  const handleSignOut = async () => {
    if (supabasePublic) {
      await supabasePublic.auth.signOut();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-8 bg-zinc-950 text-white">
      {/* Header */}
      <div className="z-10 w-full max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield size={32} className="text-emerald-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            npm-Guardian
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Online
          </div>

          <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>

          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                <User size={14} className="text-emerald-400" />
                <span className="truncate max-w-[120px]">{session.user.email}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-red-400 transition flex items-center gap-1 text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition">
                Log in
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full transition shadow-lg shadow-emerald-900/20">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Scan Form */}
      <div className="w-full max-w-7xl mt-8">
        <ScanForm onScanQueued={handleScanQueued} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl mt-8">
        <RiskCard title="Total Scans" value={stats?.totalScans ?? 0} status="neutral" loading={loading} />
        <RiskCard title="High Risk Found" value={stats?.highRiskCount ?? 0} status="danger" loading={loading} />
        <RiskCard title="Repos Protected" value={stats?.reposProtected ?? 0} status="success" loading={loading} />
        <RiskCard title="Packages Analyzed" value={stats?.packagesAnalyzed ?? 0} status="neutral" loading={loading} />
      </div>

      {/* Recent Scans */}
      <div className="w-full max-w-7xl mt-8">
        <RecentScans scans={stats?.recentScans ?? []} loading={loading} />
      </div>

      {/* Dependency Graph */}
      <div className="w-full max-w-7xl h-[500px] mt-8 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900 relative">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-lg font-bold bg-zinc-950/80 p-2 rounded backdrop-blur-md border border-zinc-800">
            Live Threat Graph
          </h2>
        </div>
        <DependencyGraph />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-600">
        npm-Guardian &copy; {new Date().getFullYear()} &mdash; AI-Powered Supply Chain Security
      </footer>
    </main>
  );
}
