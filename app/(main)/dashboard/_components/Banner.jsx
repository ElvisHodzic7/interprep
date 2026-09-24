// app/dashboard/_components/Banner.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, ListChecks } from "lucide-react";

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white">
      <div className="absolute inset-0">
        <Image
          src="/dashboard-hero.png" // tvoja futuristička AI slika
          alt="InterPrep Banner"
          fill
          className="object-cover"
          priority
        />
        {/* jači, šareni overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-indigo-100/50" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <p className="text-sm text-indigo-700/80 mb-1">InterPrep</p>
        <h1 className="text-2xl md:text-3xl font-bold">
          Brže do boljih intervjua i kandidata
        </h1>
        <p className="mt-2 max-w-2xl text-slate-700">
          Kreiraj AI intervjue, podijeli link s kandidatima i prati njihove
          rezultate — sve na jednom mjestu.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/dashboard/kreiraj-interview">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Kreiraj intervju
            </Button>
          </Link>

          <Link href="/zakazani-interviewi">
            <Button variant="secondary" className="bg-violet-600/10 text-violet-800 hover:bg-violet-600/20">
              <Users className="mr-2 h-4 w-4" />
              Rezultati kandidata
            </Button>
          </Link>

          <Link href="/svi-interviewi">
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <ListChecks className="mr-2 h-4 w-4" />
              Svi intervjui
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
