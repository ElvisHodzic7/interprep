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

export default function QuestionList({ formData, onCreateLink }) {
  const [loading, setLoading] = useState(true);
  const [questionList, setQuestionList] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user } = useUser();

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
      const list = Array.isArray(parsed?.interviewQuestions) ? parsed.interviewQuestions : null;
      return list;
    } catch (e) {
      console.warn("JSON parse failed, content:", maybeContent.slice(0, 200));
      return null;
    }
  };

  const GenerateQuestionList = async () => {
    setLoading(true);
    try {
      const prompt = buildQuestionsPrompt({
        lang: formData.lang,
        jobTitle: formData.jobPosition,
        jobDescription: formData.jobDescription,
        duration: formData.duration,
        type: (Array.isArray(formData.type) ? formData.type : [formData.type]).join(", "),
      });

      // Bitno: očekujemo JSON iz naše /api/ai-model rute
      const res = await axios.post("/api/ai-model", { ...formData, prompt }, { validateStatus: () => true });

      // Ako server vrati HTML umjesto JSON-a, axios će i dalje dati .data (obj/tekst)
      const raw =
        typeof res.data === "string"
          ? res.data // možda je HTML ili plain
          : (res.data?.content ?? "");

      let list = safeParseQuestions(raw);

      // Ako nismo dobili validan JSON iz .content, probaj direktno parsirati res.data (ako je već JSON)
      if (!list && typeof res.data === "object" && res.data?.content) {
        list = safeParseQuestions(String(res.data.content));
      }

      if (!list || list.length === 0) {
        throw new Error("Prazan ili nevažeći JSON iz AI rute");
      }

      setQuestionList(list);
    } catch (e) {
      console.error("AI error:", e);
      toast.error("Greška pri generisanju pitanja — prikazujem fallback.");
      setQuestionList(
        formData?.lang === "en"
          ? [
              { question: "Tell us briefly about yourself.", type: "Experience" },
              { question: "Which skills are key for this role?", type: "Technical" },
            ]
          : [
              { question: "Recite ukratko o sebi.", type: "Iskustvo" },
              { question: "Koje su ključne vještine za ovu poziciju?", type: "Tehnički" },
            ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    if (!user?.email) {
      toast.error("Korisnik se još učitava, pokušaj ponovo.");
      return;
    }
    if (!questionList.length) {
      toast.error("Nema generisanih pitanja.");
      return;
    }

    setSaveLoading(true);
    try {
      const interview_id = uuidv4(); // ✅ PRAVI UUID
      console.log("[QL] generated interview_id =", interview_id);

      const typeStr = Array.isArray(formData?.type)
        ? formData.type.join(", ")
        : (formData?.type || "");

      const payload = {
        userEmail: user.email,
        jobPosition: formData?.jobPosition || null,
        jobDescription: formData?.jobDescription || null,
        duration: formData?.duration || null,
        type: typeStr,               // VARCHAR u DB
        questionList: questionList,  // JSON u DB (ti imaš kolonu questionList json)
        lang: formData?.lang || "bs",
        interview_id,                // NOT NULL + UNIQUE
      };

      const { data, error } = await supabase
        .from("Interviews")
        .insert([payload])
        .select("interview_id")
        .single();

      console.log("[QL] insert result =", { data, error });

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error(error.message || "Greška pri spremanju u bazu.");
        setSaveLoading(false);
        return;
      }

      // (opcionalno) umanji kredite
      if (typeof user?.credits === "number") {
        const { error: creditsErr } = await supabase
          .from("Users")
          .update({ credits: user.credits - 1 })
          .eq("email", user.email);
        if (creditsErr) console.warn("Credits update error:", creditsErr);
      }

      // safety: snimi i u sessionStorage (da InterviewLink ima fallback)
      try {
        window?.sessionStorage?.setItem("last_interview_id", data.interview_id);
      } catch {}

      console.log("[QL] onCreateLink with =", data.interview_id);
      if (data.interview_id === "demo-id-123") {
        console.error("DEMO ID DETECTED – stale code negdje postoji.");
      }
      onCreateLink(data.interview_id);
    } catch (e) {
      console.error("Finish error:", e);
      toast.error(e.message || "Greška pri spremanju.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      {loading && (
        <div className="p-5 bg-blue-50 rounded-xl border border-primary flex gap-5 items-center">
          <Loader2Icon className="animate-spin" />
          <div>
            <h2 className="font-medium">Generating Interview Questions</h2>
            <p className="text-primary">
              Our AI is crafting personalized questions based on your job position
            </p>
          </div>
        </div>
      )}

      {!!questionList.length && (
        <div>
          <QuestionListContainer questionList={questionList} />
        </div>
      )}

      <div className="flex justify-end mt-10">
        <Button onClick={onFinish} disabled={saveLoading || !questionList.length}>
          {saveLoading && <Loader2 className="animate-spin mr-2" />}
          Create Interview Link & Finish
        </Button>
      </div>
    </div>
  );
}
