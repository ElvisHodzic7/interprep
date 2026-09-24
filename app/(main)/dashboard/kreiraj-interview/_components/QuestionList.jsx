"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import QuestionListContainer from "./QuestionListContainer";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import { v4 as uuidv4 } from "uuid";
import { buildQuestionsPrompt } from "@/services/Constants";

const FALLBACK_QUESTIONS = [
  { question: "Recite ukratko o sebi.", type: "Iskustveni" },
  { question: "Koje su ključne vještine za ovu poziciju?", type: "Tehnički" },
];

export default function QuestionList({ formData, onCreateLink }) {
  const [loading, setLoading] = useState(true);
  const [questionList, setQuestionList] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    if (formData) GenerateQuestionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const safeParseQuestions = (maybeContent) => {
    if (!maybeContent || typeof maybeContent !== "string") return null;

    // Ako je server vratio HTML (npr. 404 dev page) – prepoznaj po DOCTYPE
    const looksLikeHTML = /^\s*<!DOCTYPE\s+html/i.test(maybeContent) || maybeContent.trim().startsWith("<");
    if (looksLikeHTML) return null;

    try {
      const clean = maybeContent.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed?.interviewQuestions) ? parsed.interviewQuestions : null;
    } catch (e) {
      console.warn("JSON parse failed, content:", maybeContent.slice(0, 200));
      return null;
    }
  };

  const GenerateQuestionList = async () => {
    setLoading(true);
    try {
      const prompt = buildQuestionsPrompt({
        jobTitle: formData.jobPosition,
        jobDescription: formData.jobDescription,
        duration: formData.duration,
        type: (Array.isArray(formData.type) ? formData.type : [formData.type]).join(", "),
      });

      // Očekujemo JSON iz naše /api/ai-model rute
      const res = await axios.post("/api/ai-model", { ...formData, prompt }, { validateStatus: () => true });

      const raw = typeof res.data === "string" ? res.data : (res.data?.content ?? "");
      const list = safeParseQuestions(raw);

      if (!list || list.length === 0) {
        throw new Error("Prazan ili nevažeći JSON iz AI rute");
      }

      setQuestionList(list);
    } catch (e) {
      console.error("AI error:", e);
      toast.error("Greška pri generisanju pitanja — prikazujem rezervna pitanja.");
      setQuestionList(FALLBACK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    if (!user?.email) {
      toast.error("Korisnik se još učitava, pokušajte ponovo.");
      return;
    }
    if (!questionList.length) {
      toast.error("Nema generisanih pitanja.");
      return;
    }

    setSaveLoading(true);
    try {
      const interview_id = uuidv4();

      const typeStr = Array.isArray(formData?.type)
        ? formData.type.join(", ")
        : (formData?.type || "");

      const payload = {
        userEmail: user.email,
        jobPosition: formData?.jobPosition || null,
        jobDescription: formData?.jobDescription || null,
        duration: formData?.duration || null,
        type: typeStr,               // VARCHAR u DB
        questionList: questionList,  // JSON u DB
        lang: "bs",
        interview_id,                // NOT NULL + UNIQUE
      };

      const { data, error } = await supabase
        .from("Interviews")
        .insert([payload])
        .select("interview_id")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Greška pri spremanju intervjua u bazu.");
        return;
      }

      // umanji kredite (ako ih korisnik ima)
      if (typeof user?.credits === "number") {
        const { error: creditsErr } = await supabase
          .from("Users")
          .update({ credits: user.credits - 1 })
          .eq("email", user.email);
        if (creditsErr) console.warn("Credits update error:", creditsErr);
        else setUser({ ...user, credits: user.credits - 1 });
      }

      onCreateLink(data.interview_id, questionList.length);
    } catch (e) {
      console.error("Finish error:", e);
      toast.error("Greška pri spremanju intervjua.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      {loading && (
        <div className="p-5 bg-primary/5 rounded-xl border border-primary/30 flex gap-5 items-center">
          <Loader2Icon className="animate-spin text-primary" />
          <div>
            <h2 className="font-medium">Generišem pitanja za intervju…</h2>
            <p className="text-primary">
              AI kreira pitanja prilagođena poziciji i opisu posla.
            </p>
          </div>
        </div>
      )}

      {!loading && !!questionList.length && (
        <QuestionListContainer questionList={questionList} />
      )}

      <div className="flex justify-end mt-10">
        <Button onClick={onFinish} disabled={loading || saveLoading || !questionList.length}>
          {saveLoading && <Loader2 className="animate-spin" />}
          Kreiraj link i završi
        </Button>
      </div>
    </div>
  );
}
