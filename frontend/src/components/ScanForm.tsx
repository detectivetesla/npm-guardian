"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ScanFormProps {
  onScanQueued?: (scanId: string, packageName: string) => void;
}

export default function ScanForm({ onScanQueued }: ScanFormProps) {
  const [packageName, setPackageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/scan/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_name: packageName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error || "Scan failed." });
        return;
      }

      setResult({
        type: "success",
        message: `Scan queued: ${data.scan_id?.slice(0, 8)}...`,
      });
      onScanQueued?.(data.scan_id, packageName.trim());
      setPackageName("");
    } catch {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="scan-package-input"
            type="text"
            value={packageName}
            onChange={(e) => {
              setPackageName(e.target.value);
              setResult(null);
            }}
            placeholder="Enter npm package name (e.g. express, lodash)"
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            disabled={loading}
            maxLength={214}
            autoComplete="off"
          />
        </div>
        <button
          id="scan-submit-btn"
          type="submit"
          disabled={!packageName.trim() || loading}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search size={18} />
              Scan Package
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
            result.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {result.message}
        </div>
      )}
    </form>
  );
}
