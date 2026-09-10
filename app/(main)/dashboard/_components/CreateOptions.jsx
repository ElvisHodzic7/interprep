// app/dashboard/_components/CreateOptions.jsx
import { PhoneCall, Video, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";

function CreateOptions() {
  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
      <Link
        href="/dashboard/kreiraj-interview"
        className="group rounded-2xl p-5 hover:shadow-lg transition border bg-gradient-to-br from-indigo-500 to-sky-500 text-white"
      >
        <div className="flex items-center justify-between">
          <Video className="p-3 bg-white/20 rounded-xl h-12 w-12" />
          <Wand2 className="h-5 w-5 text-white/60 group-hover:text-white/80 transition" />
        </div>
        <h3 className="mt-3 font-semibold text-lg">Kreiraj novi intervju</h3>
        <p className="text-white/90 text-sm">
          Postavi pitanja, definiši trajanje i zakaži sa kandidatom.
        </p>
        <Button className="mt-4 w-full bg-white/15 hover:bg-white/25 text-white">
          Pokreni
        </Button>
      </Link>

      <Link
        href="/dashboard/telefonski-intervju"
        className="group rounded-2xl p-5 hover:shadow-lg transition border bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white"
      >
        <div className="flex items-center justify-between">
          <PhoneCall className="p-3 bg-white/20 rounded-xl h-12 w-12" />
          <Wand2 className="h-5 w-5 text-white/60 group-hover:text-white/80 transition" />
        </div>
        <h3 className="mt-3 font-semibold text-lg">Telefonski intervju</h3>
        <p className="text-white/90 text-sm">
          Brza preliminarna provjera kandidata putem telefona.
        </p>
        <Button className="mt-4 w-full bg-white/15 hover:bg-white/25 text-white" variant="secondary">
          Kreiraj poziv
        </Button>
      </Link>

      <Link
        href="/svi-interviewi"
        className="group rounded-2xl p-5 hover:shadow-lg transition border bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
      >
        <div className="flex items-center justify-between">
          <Video className="p-3 bg-white/20 rounded-xl h-12 w-12 opacity-100" />
          <Wand2 className="h-5 w-5 text-white/60 group-hover:text-white/80 transition" />
        </div>
        <h3 className="mt-3 font-semibold text-lg">Svi intervjui</h3>
        <p className="text-white/90 text-sm">
          Pogledaj listu svih kreiranih intervjua i upravljaj njima.
        </p>
        <Button className="mt-4 w-full bg-white/15 hover:bg-white/25 text-white" variant="outline">
          Otvori listu
        </Button>
      </Link>
    </div>
  );
}

export default CreateOptions;
