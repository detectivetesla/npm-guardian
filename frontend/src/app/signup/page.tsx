"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, Loader2, Github } from "lucide-react";
import { supabasePublic } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabasePublic) {
      setError("Supabase client not initialized (missing environment variables).");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: signUpError } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess("Account created! Check your email to confirm if email confirmation is enabled, or sign in now.");
      setLoading(false);
      setTimeout(() => router.push("/login"), 4000);
    }
  };

  const handleGithubLogin = async () => {
    if (!supabasePublic) return;
    
    await supabasePublic.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <Shield size={36} className="text-emerald-400" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            npm-Guardian
          </h1>
        </Link>

        <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-center text-zinc-100">Create an account</h2>
          
          <button
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#24292e] hover:bg-[#2f363d] text-white rounded-lg font-medium transition-all border border-zinc-700 hover:border-zinc-600 mb-6"
          >
            <Github size={18} />
            Sign up with GitHub
          </button>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase tracking-wider">or email</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20 text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
                  required
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || !!success}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
