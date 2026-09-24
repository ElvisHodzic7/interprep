// app/api/ai-model/route.js

function parseJSONSafe(text) {
  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function fallbackQuestions({ jobTitle = "", duration = "" }) {
  const base = [
    { question: "Recite ukratko o sebi.", type: "Iskustveni" },
    { question: `Šta vas motiviše za poziciju ${jobTitle || "ove uloge"}?`, type: "Behavioralni" },
    { question: "Opišite izazovan problem koji ste nedavno riješili.", type: "Rješavanje problema" },
    { question: "Kako osiguravate kvalitet i pouzdanost svog rada?", type: "Tehnički" },
    { question: "Kako sarađujete s timovima iz drugih odjela?", type: "Vođenje" },
  ];
  const countMap = { "5 Min": 4, "15 Min": 6, "30 Min": 8, "45 Min": 10, "60 Min": 12 };
  const n = countMap[duration] || 6;
  const arr = [];
  while (arr.length < n) arr.push(base[arr.length % base.length]);
  return arr;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      jobPosition = "",
      jobDescription = "",
      duration = "",
      type,
      prompt,
    } = body || {};

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Nedostaje OPENROUTER_API_KEY" }), { status: 500 });
    }
    const referer = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const typestr = Array.isArray(type) ? type.join(", ") : (type || "");
    const finalPrompt =
      prompt ||
      `Generiši pitanja za intervju na bosanskom kao JSON:
{ "interviewQuestions": [{"question":"...","type":"Tehnički|Behavioralni|Iskustveni|Rješavanje problema|Vođenje"}] }
Ulazi:
- Pozicija: ${jobPosition}
- Opis posla: ${jobDescription}
- Trajanje intervjua: ${duration}
- Tip intervjua: ${typestr}
Vrati ISKLJUČIVO JSON.`;

    const models = ["google/gemini-flash-1.5", "openai/gpt-4o-mini"];

    let text = "";

    for (const model of models) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": referer,
            "X-Title": "InterPrep",
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            max_tokens: 1800,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "Odgovaraj ISKLJUČIVO validnim JSON-om. Bez dodatnog teksta. Sav tekst mora biti na bosanskom jeziku (latinica).",
              },
              { role: "user", content: finalPrompt },
            ],
          }),
        });

        if (!res.ok) {
          const errTxt = await res.text();
          throw new Error(`[OpenRouter ${res.status}] ${errTxt}`);
        }
        const json = await res.json();
        text = json?.choices?.[0]?.message?.content || "";
        if (text) break;
      } catch (e) {
        console.warn(`ai-model: model ${model} nije uspio:`, e?.message);
      }
    }

    let parsed = text ? parseJSONSafe(text) : null;
    if (!parsed || !Array.isArray(parsed?.interviewQuestions)) {
      parsed = { interviewQuestions: fallbackQuestions({ jobTitle: jobPosition, duration }) };
    }

    return Response.json({ content: "```json\n" + JSON.stringify(parsed) + "\n```" });
  } catch (e) {
    console.error("ai-model route error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
