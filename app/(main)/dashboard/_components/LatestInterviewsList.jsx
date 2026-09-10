// app/dashboard/_components/LatestInterviewsList.jsx
"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Video, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import InterviewCard from "./InterviewCard";
import Link from "next/link";

function LatestInterviewsList() {
  const [interviewList, setInterviewList] = useState(null); // null dok učitava
  const { user } = useUser();

  useEffect(() => {
    user && GetInterviewList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const GetInterviewList = async () => {
    const { data, error } = await supabase
      .from("Interviews")
      .select("*")
      .eq("userEmail", user?.email)
      .order("id", { ascending: false })
      .limit(6);

    if (!error) setInterviewList(data || []);
    else setInterviewList([]);
  };

  const isLoading = interviewList === null;

  return (
    <div className="my-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-2xl">Prethodno kreirani intervjui</h2>
        <Link href="/svi-interviewi">
          <Button variant="outline" size="sm">Svi intervjui</Button>
        </Link>
      </div>

      {/* Loader state */}
      {isLoading && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border bg-white animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && interviewList?.length === 0 && (
        <div className="p-6 flex flex-col gap-3 items-center bg-white rounded-xl mt-5 border text-center">
          <Video className="h-10 w-10 text-primary" />
          <h3 className="font-medium">Još nemaš kreiranih intervjua</h3>
          <p className="text-gray-500 text-sm">
            Kreiraj svoj prvi intervju i pozovi kandidata.
          </p>
          <Link href="/dashboard/kreiraj-interview">
            <Button className="mt-1">+ Kreiraj novi intervju</Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && interviewList && interviewList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
          {interviewList.map((interview, index) => (
            <InterviewCard interview={interview} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;
