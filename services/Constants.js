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
  { name: "Početna", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Rezultati kandidata", icon: Calendar, path: "/zakazani-interviewi" },
  { name: "Svi intervjui", icon: List, path: "/svi-interviewi" },
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

/* -------------------- JEZIČKO PRAVILO -------------------- */
// Aplikacija radi isključivo na bosanskom jeziku
export const LANG_RULE = `VAŽNO: Sav tekst mora biti ISKLJUČIVO na bosanskom jeziku (latinica). Nemoj koristiti engleski niti miješati jezike.`;

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
    "type": "Tehnički | Behavioralni | Iskustveni | Rješavanje problema | Vođenje"
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
/** jobTitle/jobDescription/duration/type – iz forme */
export function buildQuestionsPrompt({ jobTitle, jobDescription, duration, type }) {
  const body = fill(QUESTIONS_PROMPT_BASE, { jobTitle, jobDescription, duration, type });
  return `${LANG_RULE}\n\n${body}`;
}

/** conversation = transkript string */
export function buildFeedbackPrompt({ conversation }) {
  const body = fill(FEEDBACK_PROMPT_BASE, { conversation });
  return `${LANG_RULE}\n\n${body}`;
}
