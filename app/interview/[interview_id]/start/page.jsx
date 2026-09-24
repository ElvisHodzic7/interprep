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
import AlertConfirmation from "./_components/AlertConfirmation";

const formatVrijeme = (sekunde) => {
  const m = String(Math.floor(sekunde / 60)).padStart(2, "0");
  const s = String(sekunde % 60).padStart(2, "0");
  return `${m}:${s}`;
};

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);

  // --- stabilne reference / state ---
  const vapiRef = useRef(null);
  const callActiveRef = useRef(false);
  const conversationRef = useRef(""); // posljednja konverzacija
  const finalizedRef = useRef(false); // da finalizaciju pokrenemo SAMO jednom
  // Vapi listeneri se registruju jednom, pa im trebaju svježi podaci preko ref-a
  const interviewInfoRef = useRef(interviewInfo);
  interviewInfoRef.current = interviewInfo;

  const { interview_id } = useParams();
  const router = useRouter();

  const [activeUser, setActiveUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [sekunde, setSekunde] = useState(0);

  // Bez podataka o kandidatu (npr. refresh stranice) vrati na stranicu za prijavu
  useEffect(() => {
    if (!interviewInfo) router.replace(`/interview/${interview_id}`);
  }, [interviewInfo, interview_id, router]);

  // Tajmer trajanja poziva
  useEffect(() => {
    if (!callActive) return;
    const id = setInterval(() => setSekunde((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [callActive]);

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
    setCallActive(true);
    toast("Poziv spojen…");
  };

  const handleSpeechStart = () => setActiveUser(false);
  const handleSpeechEnd = () => setActiveUser(true);

  const handleCallEnd = () => {
    callActiveRef.current = false;
    setCallActive(false);
    toast("Poziv je završen.");
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

    const questions = (interviewInfo?.interviewData?.questionList ?? [])
      .map((q) => q?.question)
      .filter(Boolean);
    const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

    const assistantOptions = {
      name: "AI intervjuer",
      firstMessage: `Zdravo ${interviewInfo?.userName}, jeste li spremni za intervju za poziciju ${interviewInfo?.interviewData?.jobPosition}?`,
      // Azure podržava bosanski (bs-BA); Deepgram ga ne podržava
      transcriber: { provider: "azure", language: "bs-BA" },
      voice: { provider: "11labs", voiceId: "0jvpZ98RZwx5FBOSZAc3", model: "eleven_multilingual_v2" },
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
Ti si AI glasovni asistent koji vodi intervju za posao.
VAŽNO: Razgovaraj ISKLJUČIVO na bosanskom jeziku, čak i ako kandidat pređe na drugi jezik.
Postavljaj jedno po jedno pitanje i sačekaj odgovor prije sljedećeg.
Pitanja:
${questionList}
Ako se kandidat muči, preformuliši pitanje ili daj kratak nagovještaj.
Budi ljubazan, sažet i drži se teme.
Kada postaviš svih ${questions.length} pitanja, zahvali se kandidatu, ukratko rezimiraj razgovor i reci da će rezultate dobiti uskoro.
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
            userName: interviewInfoRef.current?.userName,
            userEmail: interviewInfoRef.current?.userEmail,
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
          userName: interviewInfoRef.current?.userName,
          userEmail: interviewInfoRef.current?.userEmail,
          interview_id,
          feedback: parsed,
          recommended: parsed?.recommendation === true,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Greška pri spremanju rezultata intervjua.");
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
            userName: interviewInfoRef.current?.userName,
            userEmail: interviewInfoRef.current?.userEmail,
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
    <div className="px-5 py-10 md:px-20 lg:px-48 xl:px-56">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl">AI intervju</h2>
          {interviewInfo?.interviewData?.jobPosition && (
            <p className="text-sm text-gray-500">
              Pozicija: {interviewInfo.interviewData.jobPosition}
            </p>
          )}
        </div>
        <span className="flex gap-2 items-center rounded-full border bg-white px-3 py-1 font-mono text-sm">
          <Timer className="h-4 w-4 text-primary" />
          {formatVrijeme(sekunde)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-5">
        <div className="bg-white h-[300px] md:h-[400px] rounded-xl border shadow-sm flex relative flex-col gap-3 items-center justify-center">
          <div className="relative">
            {callActive && !activeUser && (
              <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping" />
            )}
            <Image
              src={"/ai.png"}
              alt="ai"
              width={100}
              height={100}
              className="w-[60px] h-[60px] rounded-full object-cover"
            />
          </div>
          <h2 className="font-medium">AI intervjuer</h2>
        </div>

        <div className="bg-white h-[300px] md:h-[400px] rounded-xl border shadow-sm flex flex-col gap-3 items-center justify-center">
          <div className="relative">
            {callActive && activeUser && (
              <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping" />
            )}
            <h2 className="text-2xl text-white bg-primary p-3 rounded-full px-5">
              {interviewInfo?.userName?.[0] || "?"}
            </h2>
          </div>
          <h2 className="font-medium">{interviewInfo?.userName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-5 justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full" />
        {!loading ? (
          <AlertConfirmation stopInterview={stopInterview}>
            <Phone
              className="h-12 w-12 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full cursor-pointer"
              aria-label="Završi intervju"
            />
          </AlertConfirmation>
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </div>

      <h2 className="text-sm text-gray-400 text-center mt-5">
        {loading
          ? "Obrađujem rezultate intervjua…"
          : callActive
            ? "Intervju je u toku…"
            : "Povezivanje…"}
      </h2>
    </div>
  );
}

export default StartInterview;
