// app/dashboard/_components/CreateOptions.jsx
import { ArrowRight, List, Users, Video } from "lucide-react";
import Link from "next/link";
import React from "react";

const OPTIONS = [
  {
    href: "/dashboard/kreiraj-interview",
    icon: Video,
    title: "Kreiraj novi intervju",
    description: "Opiši poziciju, a AI generiše pitanja i link za kandidate.",
    cta: "Pokreni",
    gradient: "from-indigo-500 to-sky-500",
  },
  {
    href: "/zakazani-interviewi",
    icon: Users,
    title: "Rezultati kandidata",
    description: "Pogledaj ocjene, izvještaje i rang listu kandidata.",
    cta: "Otvori rezultate",
    gradient: "from-fuchsia-500 to-violet-500",
  },
  {
    href: "/svi-interviewi",
    icon: List,
    title: "Svi intervjui",
    description: "Pregledaj sve kreirane intervjue i ponovo podijeli linkove.",
    cta: "Otvori listu",
    gradient: "from-emerald-500 to-teal-500",
  },
];

function CreateOptions() {
  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
      {OPTIONS.map(({ href, icon: Icon, title, description, cta, gradient }) => (
        <Link
          key={href}
          href={href}
          className={`group flex flex-col rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg border bg-gradient-to-br ${gradient} text-white`}
        >
          <Icon className="p-3 bg-white/20 rounded-xl h-12 w-12" />
          <h3 className="mt-3 font-semibold text-lg">{title}</h3>
          <p className="text-white/90 text-sm flex-1">{description}</p>
          <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-medium transition group-hover:bg-white/25">
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export default CreateOptions;
