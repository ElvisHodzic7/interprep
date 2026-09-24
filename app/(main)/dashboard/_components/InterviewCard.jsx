"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Send, Users, Video } from "lucide-react";
import moment from "@/lib/moment";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function InterviewCard({ interview, viewDetail = false }) {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_HOST_URL || "");
    setBaseUrl(origin);
  }, []);

  // Share URL (ruta: /interview/[id])
  const url = useMemo(() => {
    if (!interview?.interview_id || !baseUrl) return "";
    return `${baseUrl}/interview/${interview.interview_id}`;
  }, [baseUrl, interview?.interview_id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link je kopiran!");
    } catch (e) {
      toast.error("Kopiranje linka nije uspjelo.");
      console.error(e);
    }
  };

  const onSend = () => {
    const subject = `Poziv na AI intervju – ${interview?.jobPosition || "InterPrep"}`;
    const body = `Pozdrav,\n\npozivamo vas na AI intervju. Intervju možete započeti putem sljedećeg linka:\n${url}\n\nSretno!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const created = interview?.created_at
    ? moment(interview.created_at).format("DD. MMM YYYY.")
    : "";

  const candidateCount = Array.isArray(interview?.["interview-feedback"])
    ? interview["interview-feedback"].length
    : 0;

  const Badge = ({ children }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
      {children}
    </span>
  );

  return (
    <div className="group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30">
      {/* header row */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
          <Video className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs sm:text-sm text-gray-500">{created}</span>
      </div>

      {/* title */}
      <h2 className="mt-3 font-bold text-lg leading-snug">
        {interview?.jobPosition || "Nepoznata pozicija"}
      </h2>

      {/* meta */}
      <div className="mt-2 flex items-center gap-2 flex-wrap flex-1 content-start">
        {interview?.duration && <Badge>{interview.duration}</Badge>}
        {interview?.type && <Badge>{interview.type}</Badge>}
        {viewDetail && (
          <Badge>
            <Users className="h-3 w-3" />
            {candidateCount === 1 ? "1 kandidat" : `${candidateCount} kandidata`}
          </Badge>
        )}
      </div>

      {/* actions */}
      {!viewDetail ? (
        <div className="flex gap-3 w-full mt-5">
          <Button variant="outline" className="flex-1" onClick={copyLink} disabled={!url}>
            <Copy className="h-4 w-4" />
            Kopiraj link
          </Button>
          <Button className="flex-1" onClick={onSend} disabled={!url}>
            <Send className="h-4 w-4" />
            Pošalji
          </Button>
        </div>
      ) : (
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link href={`/zakazani-interviewi/${interview?.interview_id}/detalji`}>
            Detalji <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export default InterviewCard;
