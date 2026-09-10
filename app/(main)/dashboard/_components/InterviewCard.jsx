"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Send } from "lucide-react";
import moment from "moment";
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

  // Ispravan share URL (pretpostavka rute: /interview/[id])
  const url = useMemo(() => {
    if (!interview?.interview_id || !baseUrl) return "";
    return `${baseUrl}/interview/${interview.interview_id}`;
  }, [baseUrl, interview?.interview_id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopiran!");
    } catch (e) {
      toast.error("Nisam uspio kopirati link.");
      console.error(e);
    }
  };

  const onSend = () => {
    const mailto = `mailto:?subject=AI Interview&body=Interview Link: ${encodeURIComponent(
      url
    )}`;
    window.location.href = mailto;
  };

  const created = interview?.created_at
    ? moment(interview.created_at).format("DD MMM YYYY")
    : "";

  // badge helper
  const Badge = ({ children }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-white/10 bg-white/5 text-slate-200">
      {children}
    </span>
  );

  return (
    <div
      className="
        relative overflow-hidden rounded-2xl
        border border-white/10
        bg-slate-900/70 backdrop-blur-md
        p-5
        text-slate-100
        shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]
        transition-all duration-300
        hover:shadow-[0_20px_50px_-12px_rgba(34,211,238,0.25)]
        hover:ring-1 hover:ring-cyan-400/30
      "
    >
      {/* neon corner glows */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.6),transparent_60%)]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl opacity-25 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.55),transparent_60%)]" />

      {/* header row */}
      <div className="flex items-center justify-between">
        <div
          className="
            h-10 w-10 rounded-full
            bg-gradient-to-br from-cyan-500 to-indigo-500
            shadow-[0_0_18px_rgba(56,189,248,0.45)]
          "
        />
        <h2 className="text-xs sm:text-sm text-slate-300">{created}</h2>
      </div>

      {/* title */}
      <h2 className="mt-3 font-bold text-lg leading-snug text-white">
        {interview?.jobPosition || "Nepoznata pozicija"}
      </h2>

      {/* meta */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {interview?.duration && <Badge>{interview.duration}</Badge>}
        {interview?.lang && <Badge>Jezik: {interview.lang.toUpperCase()}</Badge>}
        {interview?.type && <Badge>Tip: {interview.type}</Badge>}
        {viewDetail && (
          <Badge>
            {Array.isArray(interview["interview-feedback"])
              ? `${interview["interview-feedback"].length} kandidata`
              : "Kandidati: 0"}
          </Badge>
        )}
      </div>

      {/* actions */}
      {!viewDetail ? (
        <div className="flex flex-col gap-3 w-full mt-5">
          <Button
            variant="outline"
            className="
              w-full
              border-white/20 text-slate-100
              bg-white/5 hover:bg-white/10
            "
            onClick={copyLink}
            disabled={!url}
          >
            <Copy className="mr-2 h-4 w-4" />
            Kopiraj link
          </Button>

          <Button
            className="
              w-full
              bg-gradient-to-r from-cyan-500 to-indigo-500
              hover:from-cyan-400 hover:to-indigo-400
              text-white border-0
              shadow-lg shadow-cyan-500/25
            "
            onClick={onSend}
            disabled={!url}
          >
            <Send className="mr-2 h-4 w-4" />
            Pošalji
          </Button>
        </div>
      ) : (
        <Link href={`/zakazani-interviewi/${interview?.interview_id}/detalji`}>
          <Button
            className="
              mt-5 w-full
              border-white/20 text-slate-100
              bg-white/5 hover:bg-white/10
            "
            variant="outline"
          >
            Detalji <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default InterviewCard;
