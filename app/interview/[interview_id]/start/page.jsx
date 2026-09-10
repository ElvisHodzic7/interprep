"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Loader2Icon, Mic, Phone, Timer } from "lucide-react";
import Image from "next/image";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);

  // --- stabilne reference / state ---
  const vapiRef = useRef(null);
  const callActiveRef = useRef(false);
  const conversationRef = useRef(""); // posljednja konverzacija
  const finalizedRef = useRef(false); // da finalizaciju pokrenemo SAMO jednom

  const { interview_id } = useParams();
  const router = useRouter();

  const [activeUser, setActiveUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // ========== INIT VAPI JEDNOM ==========
  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    }
    // safety stop na unmount
    return () => {
      try {
        vapiRef.current?.stop?.();
      } catch {}
    };
  }, []);

  // ========== HANDLERI ==========
  const handleMessage = (message) => {
    if (message?.conversation) {
      const convoString = JSON.stringify(message.conversation);
      conversationRef.current = convoString;
    }
  };

  const handleCallStart = () => {
    callActiveRef.current = true;
    toast("Poziv spojen…");
  };

  const handleSpeechStart = () => setActiveUser(false);
  const handleSpeechEnd = () => setActiveUser(true);

  const handleCallEnd = () => {
    callActiveRef.current = false;
    toast("Poziv završio.");
    finalizeOnce(); // pokreni finalizaciju čim SDK javi kraj
  };

  // ========== REGISTRACIJA LISTENERA ==========
  useEffect(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    vapi.on("message", handleMessage);
    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);

    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
    };
  }, []);

  // ========== START POZIVA KAD IMAMO interviewInfo ==========
  useEffect(() => {
    if (!interviewInfo || !vapiRef.current) return;
    if (callActiveRef.current) return; // već aktivno

    const questionList = (interviewInfo?.interviewData?.questionList ?? [])
      .map((q) => q?.question)
      .filter(Boolean)
      .join(", ");

    const assistantOptions = {
      name: "AI Interviewer",
      firstMessage: `Greetings ${interviewInfo?.userName}, are you ready for your interview for the position of ${interviewInfo?.interviewData?.jobPosition}?`,
      transcriber: { provider: "deepgram", model: "nova-3", language: "en-US" },
      voice: { provider: "11labs", voiceId: "0jvpZ98RZwx5FBOSZAc3" },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
You are an AI voice assistant conducting interviews.
Ask one question at a time. Questions: ${questionList}
If the candidate struggles, rephrase or give a hint.
Keep it friendly, concise, and on-topic. Wrap up after ~6 questions with a short summary.
`.trim(),
          },
        ],
      },
    };

    vapiRef.current.start(assistantOptions);
    callActiveRef.current = true;
  }, [interviewInfo]);

  // ========== ZAUSTAVI POZIV ==========
  const stopInterview = async () => {
    if (!vapiRef.current) return;
    setLoading(true);
    try {
      await vapiRef.current.stop?.();
      // sačekaj kratko “call-end”
      await new Promise((r) => setTimeout(r, 1200));
      if (callActiveRef.current) {
        // fallback: SDK nije javio kraj
        callActiveRef.current = false;
        finalizeOnce();
      }
      toast.success("Poziv je zaustavljen.");
    } catch (e) {
      console.error("Greška pri stopu:", e);
      toast.error("Nisam uspio zaustaviti poziv. Završavam ipak…");
      callActiveRef.current = false;
      finalizeOnce();
    } finally {
      setLoading(false);
    }
  };

  // ========== FINALIZACIJA (JEDNOM) ==========
  const finalizeOnce = async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    setLoading(true);

    try {
      const conversation = conversationRef.current || "";

      // Ako nema konverzacije — upiši minimalan zapis i idi dalje
      if (!conversation) {
        await supabase.from("interview-feedback").insert([
          {
            userName: interviewInfo?.userName,
            userEmail: interviewInfo?.userEmail,
            interview_id,
            feedback: { error: "no_conversation" },
            recommended: false,
          },
        ]);
        router.replace(`/interview/${interview_id}/zavrseno`);
        return;
      }

      // 1) AI endpoint (po potrebi skrati payload)
      const MAX_CHARS = 120_000;
      const convoSlim =
        conversation.length > MAX_CHARS
          ? conversation.slice(-MAX_CHARS)
          : conversation;

      const { data } = await axios.post("/api/ai-feedback", {
        conversation: convoSlim,
      });

      // 2) izvuci čisti JSON string
      const raw =
        data?.content ??
        data?.feedback ??
        data?.text ??
        data?.choices?.[0]?.message?.content ??
        (typeof data === "string" ? data : null);

      let parsed;
      if (raw && typeof raw === "string") {
        const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
        const jsonString = (fenced ? fenced[1] : raw).trim();
        try {
          parsed = JSON.parse(jsonString);
        } catch {
          parsed = { raw }; // fallback: spremi raw tekst
        }
      } else {
        parsed = { error: "empty_ai_response", raw: data ?? null };
      }

      // 3) transcript fallback = raw conversation
      if (
        !parsed.transcript ||
        typeof parsed.transcript !== "string" ||
        !parsed.transcript.trim()
      ) {
        parsed.transcript = convoSlim;
      }

      // 4) upis u bazu
      const { error } = await supabase.from("interview-feedback").insert([
        {
          userName: interviewInfo?.userName,
          userEmail: interviewInfo?.userEmail,
          interview_id,
          feedback: parsed,
          recommended: false,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Greška pri spremanju feedbacka.");
      }

      // 5) redirect
      router.replace(`/interview/${interview_id}/zavrseno`);
    } catch (e) {
      console.error("Finalize error:", e);
      toast.error(
        e?.response?.data?.error || e?.message || "Greška pri finalizaciji."
      );
      // fallback: upiši raw transcript i idi dalje
      try {
        await supabase.from("interview-feedback").insert([
          {
            userName: interviewInfo?.userName,
            userEmail: interviewInfo?.userEmail,
            interview_id,
            feedback: {
              fallback: true,
              transcript: conversationRef.current || "",
            },
            recommended: false,
          },
        ]);
      } catch {}
      router.replace(`/interview/${interview_id}/zavrseno`);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview
        <span className="flex gap-2 items-center">
          <Timer />
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-5">
        <div className="bg-white h-[400px] rounded-lg border flex relative flex-col gap-3 items-center justify-center">
          <div className="relative">
            {!activeUser && (
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping" />
            )}
            <Image
              src={"/ai.png"}
              alt="ai"
              width={100}
              height={100}
              className="w-[60px] h-[60px] rounded-full object-cover"
            />
          </div>
          <h2>InterPrep</h2>
        </div>

        <div className="bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center">
          <div className="relative">
            {activeUser && (
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping" />
            )}
            <h2 className="text-2xl text-white bg-primary p-3 rounded-full px-5">
              {interviewInfo?.userName?.[0] || "?"}
            </h2>
          </div>
          <h2>{interviewInfo?.userName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-5 justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full" />
        {!loading ? (
          <Phone
            className="h-12 w-12 p-3 bg-red-500 text-white rounded-full cursor-pointer"
            onClick={stopInterview}
            title="Završi poziv"
          />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </div>

      <h2 className="text-sm text-gray-400 text-center mt-5">
        {callActiveRef.current ? "Interview u toku…" : "Poziv završen."}
      </h2>
    </div>
  );
}

export default StartInterview;
