// services/Constants.js
import {
  BriefcaseBusinessIcon,
  Calendar,
  Code2Icon,
  Component,
  LayoutDashboard,
  List,
  Puzzle,
  Settings,
  User2Icon,
  WalletCards
} from "lucide-react";

export const SideBarOptions = [
  { name: "Početna Stranica", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Zakazani Interview", icon: Calendar, path: "/zakazani-interviewi" },
  { name: "Svi Interview-i", icon: List, path: "/svi-interviewi" },
  // { name: "Plaćanje", icon: WalletCards, path: "/billing" },
  { name: "Postavke", icon: Settings, path: "/postavke" }
];

export const InterviewType = [
  { title: "Tehnički", icon: Code2Icon },
  { title: "Behavioralni", icon: User2Icon },
  { title: "Iskustveni", icon: BriefcaseBusinessIcon },
  { title: "Rješavanje problema", icon: Puzzle },
  { title: "Vođenje", icon: Component }
];

/* -------------------- JEZIČKA PRAVILA -------------------- */
const LANG_RULE = {
  bs: `VAŽNO: Sva pitanja/tekst moraju biti ISKLJUČIVO na bosanskom jeziku (latinica). Nemoj koristiti engleski niti miješati jezike.`,
  en: `IMPORTANT: All questions/text MUST be strictly in English (US). Do not use Bosnian or mix languages.`
};

/* mala util funkcija za popunu {{var}} mjesta */
const fill = (tpl, data) =>
  tpl.replace(/{{\s*(\w+)\s*}}/g, (_, k) => (data?.[k] ?? "").toString());

/* -------------------- BASE PROMPTOVI (bez jezika) -------------------- */
const QUESTIONS_PROMPT_BASE = `
You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}

Job Description:
{{jobDescription}}

Interview Duration: {{duration}}
Interview Type: {{type}}

Your task:
- Analyze the job description to identify key responsibilities, required skills, and expected experience.
- Generate a list of interview questions depending on the interview duration.
- Adjust the number and depth of questions to match the duration.
- Ensure the questions match the tone and structure of a real-life {{type}} interview.

Output format (JSON):
interviewQuestions = [
  {
    "question": "",
    "type": "Technical | Behavioral | Experience | Problem Solving | Leadership"
  }
]
Return ONLY valid JSON (no markdown fences).`;

const FEEDBACK_PROMPT_BASE = `
Conversation transcript (assistant ⟷ candidate):
{{conversation}}

Task:
Provide interview feedback with ratings out of 10 for:
- Technical Skills
- Communication
- Problem Solving
- Experience

Also include:
- A 3-line summary of the interview
- A final recommendation (true/false) and a one-line recommendation message

Output format (JSON only):
{
  "feedback": {
    "rating": {
      "technicalSkills": <number>,
      "communication": <number>,
      "problemSolving": <number>,
      "experience": <number>,
      "totalRating": <number>
    },
    "summary": "<max 3 lines>",
    "recommendation": true | false,
    "recommendationMsg": "<one line>"
  }
}
Return ONLY valid JSON (no markdown fences).`;

/* -------------------- PUBLIC BUILDER FUNKCIJE -------------------- */
/** Lang je 'bs' ili 'en'. jobTitle/jobDescription/duration/type – iz tvoje forme */
export function buildQuestionsPrompt({ lang = "bs", jobTitle, jobDescription, duration, type }) {
  const header = LANG_RULE[lang] ?? LANG_RULE.bs;
  const body = fill(QUESTIONS_PROMPT_BASE, { jobTitle, jobDescription, duration, type });
  return `${header}\n\n${body}`;
}

/** Lang je 'bs' ili 'en'. conversation = transkript string */
export function buildFeedbackPrompt({ lang = "bs", conversation }) {
  const header = LANG_RULE[lang] ?? LANG_RULE.bs;
  const body = fill(FEEDBACK_PROMPT_BASE, { conversation });
  return `${header}\n\n${body}`;
}
