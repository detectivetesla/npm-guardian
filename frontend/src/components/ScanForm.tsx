"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle, Package, Github, GitBranch } from "lucide-react";

interface ScanFormProps {
  onScanQueued?: (scanId: string, name: string) => void;
}

type ScanType = "package" | "repository";

export default function ScanForm({ onScanQueued }: ScanFormProps) {
  const [scanType, setScanType] = useState<ScanType>("package");
  const [packageName, setPackageName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (scanType === "package" && !packageName.trim()) return;
    if (scanType === "repository" && !repoUrl.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      let res;
      let submittedName = "";

      if (scanType === "package") {
        submittedName = packageName.trim();
        res = await fetch("/api/scan/package", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package_name: submittedName }),
        });
      } else {
        submittedName = repoUrl.trim();
        res = await fetch("/api/scan/repository", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repo_url: submittedName, branch: branch.trim() }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error || "Scan failed." });
        return;
      }

      setResult({
        type: "success",
        message: `Scan queued: ${data.scan_id?.slice(0, 8)}...`,
      });
      onScanQueued?.(data.scan_id, submittedName);
      
      if (scanType === "package") setPackageName("");
      else {
        setRepoUrl("");
        setBranch("main");
      }
    } catch {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = scanType === "package" ? !packageName.trim() : !repoUrl.trim();

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-6 backdrop-blur-sm shadow-xl">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
        <button
          onClick={() => { setScanType("package"); setResult(null); }}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
            scanType === "package" 
              ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          <Package size={16} />
          npm Package
        </button>
        <button
          onClick={() => { setScanType("repository"); setResult(null); }}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
            scanType === "repository" 
              ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          }`}
        >
          <Github size={16} />
          Git Repository
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
        {scanType === "package" ? (
          <div className="relative flex-1">
            <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={packageName}
              onChange={(e) => {
                setPackageName(e.target.value);
                setResult(null);
              }}
              placeholder="Enter npm package name (e.g. express, lodash)"
              className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              disabled={loading}
              maxLength={214}
              autoComplete="off"
            />
          </div>
        ) : (
          <div className="flex flex-1 gap-3 flex-col sm:flex-row">
            <div className="relative flex-[2]">
              <Github size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setResult(null);
                }}
                placeholder="https://github.com/user/repo"
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <div className="relative flex-1">
              <GitBranch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="branch (e.g. main)"
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono text-sm"
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled || loading}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-900/20"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search size={18} />
              Scan
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
            result.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {result.message}
        </div>
      )}
    </div>
  );
}
