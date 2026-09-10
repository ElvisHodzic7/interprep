"use client";

import { useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) setErr(error.message);
    else setOk("Lozinka uspješno promijenjena. Možeš se sada prijaviti.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleUpdate} className="w-full max-w-sm border rounded-2xl p-6 space-y-3">
        <h1 className="text-xl font-semibold">Postavi novu lozinku</h1>
        {ok && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2">{ok}</div>}
        {err && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</div>}

        <input
          type="password"
          placeholder="Nova lozinka (min 6 znakova)"
          className="w-full rounded-md border p-3 outline-none"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Spremam..." : "Spremi lozinku"}
        </Button>
      </form>
    </div>
  );
}
