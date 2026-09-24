"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Video } from "lucide-react";
import Link from "next/link";
import React from "react";
import InterviewCard from "./InterviewCard";

// Lista intervjua: skeleton dok se učitava (null), prazno stanje ili responzivni grid
function InterviewGrid({ interviews, viewDetail = false }) {
  if (interviews === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl bg-white border" />
        ))}
      </div>
    );
  }

  if (!interviews.length) {
    return (
      <div className="p-8 flex flex-col gap-3 items-center text-center bg-white border rounded-xl mt-5">
        <Video className="h-10 w-10 text-primary" />
        <h3 className="font-medium">Još nemate kreiranih intervjua</h3>
        <p className="text-sm text-gray-500">Kreirajte svoj prvi intervju i pošaljite link kandidatima.</p>
        <Button asChild className="mt-1">
          <Link href="/dashboard/kreiraj-interview">
            <Plus className="h-4 w-4" /> Kreiraj novi intervju
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
      {interviews.map((interview) => (
        <InterviewCard key={interview.interview_id} interview={interview} viewDetail={viewDetail} />
      ))}
    </div>
  );
}

export default InterviewGrid;
