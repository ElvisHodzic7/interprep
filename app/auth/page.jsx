"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import {
  Chrome,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";

const AuthPage = () => {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const appUrl =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_HOST_URL || "";

  const resetMessages = () => {
    setMessage(null);
    setErrorMsg(null);
  };

  const signInWithGoogle = async () => {
    resetMessages();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${appUrl}/dashboard` },
    });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  const signUpWithEmail = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appUrl}/dashboard` },
    });

    if (error) setErrorMsg(error.message);
    else {
      setMessage(
        "Provjeri e-mail za verifikacijski link. Nakon potvrde bit ćeš preusmjeren/a."
      );
      setMode("signin");
    }
    setLoading(false);
  };

  const signInWithEmail = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setErrorMsg(error.message);
    else window.location.href = "/dashboard";

    setLoading(false);
  };

  const sendPasswordReset = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/update-password`,
    });

    if (error) setErrorMsg(error.message);
    else setMessage("Poslali smo ti e-mail za reset lozinke. Provjeri inbox.");
    setLoading(false);
  };

  const InputRow = ({ icon: Icon, ...props }) => (
    <div className="group relative">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
      <div className="relative flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-100 focus-within:ring-2 focus-within:ring-cyan-400/40">
        <Icon className="mr-2 h-4 w-4 text-slate-300" />
        <input
          {...props}
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center
        px-4
        text-slate-100
        bg-slate-950
        bg-[radial-gradient(900px_500px_at_-10%_-10%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(800px_400px_at_110%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(700px_350px_at_50%_120%,rgba(236,72,153,0.12),transparent_60%)]
      "
    >
      {/* Neon blobs (suptilni) */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-24 h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-3xl" />

      {/* Glass card */}
      <div
        className="
          relative w-full max-w-[440px]
          overflow-hidden rounded-2xl
          border border-white/10
          bg-white/10 backdrop-blur-xl
          shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]
          p-6 sm:p-8
        "
      >
        {/* corner accents */}
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* logo + title */}
        <div className="relative flex flex-col items-center">
          <Image
            src={"/logo.png"}
            alt="InterPrep"
            width={220}
            height={80}
            className="w-[160px] select-none"
            priority
          />
          <h2 className="mt-3 text-center text-2xl font-extrabold tracking-tight">
            Dobro došli u InterPrep
          </h2>
          <p className="mt-1 text-center text-sm text-slate-300/90">
            Prijava ili registracija putem e-maila
          </p>
        </div>

        {/* mode switch */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Button
            variant={mode === "signin" ? "default" : "secondary"}
            className={
              mode === "signin"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-500 border-0"
                : "bg-white/10 border border-white/10 text-slate-100 hover:bg-white/20"
            }
            onClick={() => setMode("signin")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Prijava
          </Button>
          <Button
            variant={mode === "signup" ? "default" : "secondary"}
            className={
              mode === "signup"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-500 border-0"
                : "bg-white/10 border border-white/10 text-slate-100 hover:bg-white/20"
            }
            onClick={() => setMode("signup")}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Registracija
          </Button>
          <Button
            variant={mode === "forgot" ? "default" : "secondary"}
            className={
              mode === "forgot"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-500 border-0"
                : "bg-white/10 border border-white/10 text-slate-100 hover:bg-white/20"
            }
            onClick={() => setMode("forgot")}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Zaboravljena
          </Button>
        </div>

        {/* alerts */}
        {message && (
          <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <ShieldCheck className="mr-2 inline h-4 w-4" />
            {message}
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {errorMsg}
          </div>
        )}

        {/* forms */}
        {(mode === "signin" || mode === "signup") && (
          <form
            onSubmit={mode === "signup" ? signUpWithEmail : signInWithEmail}
            className="mt-5 space-y-3"
          >
            <InputRow
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <InputRow
              icon={Lock}
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 border-0 hover:from-cyan-400 hover:to-indigo-400"
              disabled={loading}
            >
              {loading ? "Obrada..." : mode === "signup" ? "Kreiraj nalog" : "Prijavi se"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={sendPasswordReset} className="mt-5 space-y-3">
            <InputRow
              icon={Mail}
              type="email"
              placeholder="Upiši svoj e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 border-0 hover:from-cyan-400 hover:to-indigo-400"
              disabled={loading}
            >
              {loading ? "Slanje..." : "Pošalji reset link"}
            </Button>
          </form>
        )}

        {/* divider + Google */}
        <div className="mt-6">
          <div className="relative my-3 text-center">
            <span className="relative z-10 bg-transparent px-2 text-xs text-slate-300">
              ili
            </span>
            <div className="absolute left-0 right-0 top-1/2 -z-0 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <Button
            className="
              w-full
              bg-white/10 hover:bg-white/20
              border border-white/10
              text-slate-100
            "
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Prijava putem Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
