"use client";

import { Clock, AlertTriangle, CheckCircle, Loader2, Package } from "lucide-react";

interface Scan {
  id: string;
  type: string;
  package_name: string;
  package_version: string;
  status: string;
  overall_risk_score: number;
  risk_level: string;
  started_at: string;
  completed_at: string | null;
}

interface RecentScansProps {
  scans: Scan[];
  loading: boolean;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  queued: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  running: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-400/10" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
};

const riskColors: Record<string, string> = {
  LOW: "text-emerald-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
  PENDING: "text-zinc-500",
  UNKNOWN: "text-zinc-500",
};

export default function RecentScans({ scans, loading }: RecentScansProps) {
  if (loading) {
    return (
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
        <div className="flex items-center justify-center gap-2 text-zinc-500">
          <Loader2 size={20} className="animate-spin" />
          Loading recent scans...
        </div>
      </div>
    );
  }

  if (!scans.length) {
    return (
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
        <Package size={32} className="mx-auto mb-3 text-zinc-600" />
        <p className="text-zinc-500">No scans yet. Submit your first package scan above.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {scans.map((scan) => {
          const config = statusConfig[scan.status] || statusConfig.queued;
          const StatusIcon = config.icon;
          const riskColor = riskColors[scan.risk_level] || riskColors.UNKNOWN;
          const timeAgo = getTimeAgo(scan.started_at);

          return (
            <div
              key={scan.id}
              className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <StatusIcon
                    size={16}
                    className={`${config.color} ${scan.status === "running" ? "animate-spin" : ""}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">
                    {scan.package_name}
                    <span className="text-zinc-500 font-normal">@{scan.package_version}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{timeAgo}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <span className={`text-sm font-mono ${riskColor}`}>
                  {scan.risk_level}
                </span>
                <span className="text-xs text-zinc-600 capitalize px-2 py-1 rounded bg-zinc-800">
                  {scan.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
