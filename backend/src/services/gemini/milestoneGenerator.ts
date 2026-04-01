import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../../lib/AppError";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateMilestones(title: string, desc: string, budget: number) {

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,              // Low = structured, deterministic output
      responseMimeType: "application/json",
    },
  });
  
  const safeDesc = sanitizeForPrompt(desc); // Strip injection vectors first
  
  try {
    const result = await model.generateContent(buildPrompt(title, safeDesc, budget));
    const parsed = JSON.parse(result.response.text());
    return validateMilestones(parsed.milestones, budget); // Schema-validate output
  } catch (err) {
    console.warn("Gemini failing/unavailable, using fallback milestones");
    return getDefaultMilestones(budget); // Never fail without a fallback
  }
}

function sanitizeForPrompt(userInput: string): string {
  return userInput
    .replace(/```/g, "")
    .replace(/\bignore\b.{0,50}\bprevious\b/gi, "[filtered]")
    .replace(/\bsystem\b.{0,20}\bprompt\b/gi, "[filtered]")
    .slice(0, 2000);
}

function buildPrompt(title: string, desc: string, budget: number): string {
  return `You are a project management expert and freelance contract advisor. Your job is to 
analyze a project description and break it down into clear, measurable, and fair 
milestones suitable for a freelancer-client escrow agreement.

Rules:
1. Always return EXACTLY between 3 and 5 milestones.
2. Budget percentages across all milestones MUST sum to exactly 100.
3. Each milestone must be independently verifiable — the client must be able to confirm it is done without ambiguity.
4. Milestones should be in chronological, logical order.
5. NEVER include payment release as a milestone itself.
6. Return ONLY valid JSON. No preamble, no markdown fences.

Output schema:
{
  "milestones": [
    {
      "title": "string (max 60 chars)",
      "description": "string (1-2 sentences, specific deliverable)",
      "budgetPercent": number (integer),
      "estimatedDays": number,
      "verificationCriteria": "string (how client confirms this is done)"
    }
  ]
}

Project Title: ${title}
Project Description: ${desc}
Total Budget: ${budget}`;
}

function validateMilestones(milestones: any[], budget: number) {
  if (!Array.isArray(milestones) || milestones.length < 3 || milestones.length > 5) {
    throw new Error("Invalid number of milestones");
  }
  
  const sum = milestones.reduce((acc, m) => acc + (typeof m.budgetPercent === "number" ? m.budgetPercent : 0), 0);
  if (Math.abs(sum - 100) > 1) {
    throw new Error("Budget percentages do not sum to 100");
  }
  
  for (const m of milestones) {
    if (m.budgetPercent > 50) {
      throw new Error("Single milestone takes more than 50% of budget - violates fairness rule");
    }
  }
  
  return milestones;
}

function getDefaultMilestones(budget: number) {
  return [
    {
      title: "Initial Draft & Architecture",
      description: "Deliver the first major phase of the project for review.",
      budgetPercent: 30,
      estimatedDays: 3,
      verificationCriteria: "Client reviews and approves the initial draft/architecture.",
    },
    {
      title: "Core Implementation",
      description: "Complete the majority of the project requirements based on initial feedback.",
      budgetPercent: 50,
      estimatedDays: 7,
      verificationCriteria: "Client verifies that all core functionality or primary deliverables are present.",
    },
    {
      title: "Final Revisions & Handoff",
      description: "Address final feedback and deliver all required source files and documentation.",
      budgetPercent: 20,
      estimatedDays: 2,
      verificationCriteria: "Client receives and approves final deliverables.",
    }
  ];
}
