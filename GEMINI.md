# GEMINI.md — AI Integration Guide for Trust-Bound

> **Purpose:** This file is the definitive reference for every Gemini API interaction in the Trust-Bound platform. It documents system prompts, few-shot examples, output schemas, and safety configurations so that any team member (or AI agent) can understand and replicate the AI behavior consistently.

---

## 1. Why Gemini?

Gemini 1.5 Flash is chosen for Trust-Bound because it offers a generous free-tier rate limit suitable for a hackathon demo, supports structured JSON output mode natively, handles long-context inputs (useful for reading full project descriptions), and is multimodal (future: reading uploaded project briefs as PDFs or images).

For this prototype, Gemini is used in three distinct features:

1. **Milestone Breakdown Generator** — reads a project description and suggests 3–5 milestones with budget splits.
2. **Contract Clause Drafting** — converts natural-language project scope into formal contract language.
3. **Dispute Mediation Summarizer** — reads a dispute chat log and produces a neutral summary + resolution suggestion.

---

## 2. Environment Setup

```env
# .env (never commit this file)
GEMINI_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.3
```

The temperature is deliberately low (0.3) because we need **deterministic, structured** outputs — especially for milestone splits and contract clauses. Creative generation is not desirable here; accuracy and consistency are.

---

## 3. Feature: Milestone Breakdown Generator

### Purpose
When a client types a free-form project description (e.g., "Build me a portfolio website with 5 pages, contact form, and animations"), the generator returns a structured milestone plan with names, descriptions, and budget percentages.

### API Call Pattern

```typescript
// services/gemini/milestoneGenerator.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateMilestones(
  projectTitle: string,
  projectDescription: string,
  totalBudget: number,
  deadline: string
): Promise<MilestoneSuggestion[]> {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: "application/json", // Forces structured JSON output
    },
  });

  const prompt = buildMilestonePrompt(projectTitle, projectDescription, totalBudget, deadline);
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  // Safely parse; fallback to default milestones if parse fails
  try {
    const parsed = JSON.parse(raw);
    return validateMilestones(parsed.milestones, totalBudget);
  } catch {
    return getDefaultMilestones(totalBudget);
  }
}
```

### System Prompt

```
You are a project management expert and freelance contract advisor. Your job is to 
analyze a project description and break it down into clear, measurable, and fair 
milestones suitable for a freelancer-client escrow agreement.

Rules:
1. Always return EXACTLY between 3 and 5 milestones.
2. Budget percentages across all milestones MUST sum to exactly 100.
3. Each milestone must be independently verifiable — the client must be able to 
   confirm it is done without ambiguity.
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
```

### Few-Shot Example (included in prompt for consistency)

**Input:**
- Title: "Social Media Brand Kit"
- Description: "Design a complete brand identity for my bakery Instagram. Needs logo, 3 color palette options, font pairing, and 10 post templates in Canva."
- Budget: ₹12,000
- Deadline: 14 days

**Expected Output:**
```json
{
  "milestones": [
    {
      "title": "Logo Design & Brand Concepts",
      "description": "Deliver 3 logo concept variations with rationale for each design direction.",
      "budgetPercent": 30,
      "estimatedDays": 3,
      "verificationCriteria": "Client receives 3 distinct logo PNGs with source files and selects preferred direction."
    },
    {
      "title": "Color Palette & Typography System",
      "description": "Finalize brand color palette (primary + 2 accents) and paired font system.",
      "budgetPercent": 20,
      "estimatedDays": 2,
      "verificationCriteria": "Brand style guide PDF shared; client approves hex codes and font names."
    },
    {
      "title": "Post Template Set (10 Templates)",
      "description": "Deliver 10 ready-to-use Canva Instagram post templates using approved brand identity.",
      "budgetPercent": 40,
      "estimatedDays": 6,
      "verificationCriteria": "Canva folder shared with edit access; all 10 templates visible and functional."
    },
    {
      "title": "Final Handoff & Revisions",
      "description": "Incorporate up to 2 rounds of feedback and deliver all final source files.",
      "budgetPercent": 10,
      "estimatedDays": 3,
      "verificationCriteria": "Google Drive link with all source files (AI, PNG, PDF) confirmed by client."
    }
  ]
}
```

### Validation Logic

After parsing, the backend validates:
- Exactly 3–5 milestones exist.
- Budget percentages sum to 100 (±1 rounding tolerance).
- No single milestone takes more than 50% of budget (fairness rule).
- All required fields are non-empty strings.

If validation fails, the system falls back to a default 3-milestone template: 30% / 50% / 20%.

---

## 4. Feature: Contract Clause Drafting

### Purpose
Converts a plain-English project scope and agreed milestones into formal contract language that both parties can review before digital signing.

### System Prompt

```
You are a legal document assistant specializing in freelance service agreements 
in India. Your output will be used as a binding informal contract between a 
freelancer and a client for a digital services project.

Write in clear, unambiguous English. Avoid jargon that a 20-year-old freelancer 
would not understand. The contract must cover:

1. Scope of Work (based on milestones provided)
2. Payment Terms (escrow-based, milestone-locked)
3. Revision Policy (default: 2 rounds per milestone unless specified)
4. Intellectual Property Transfer (full transfer upon final payment)
5. Confidentiality Clause
6. Termination Clause (with partial payment rules)
7. Governing Law (India, informal arbitration)

Return a single JSON object with a "clauses" array. Each clause has a "title" 
and "body" (2–4 sentences). Do NOT include signature blocks — those are handled 
by the platform.
```

### Caching Strategy

Contract generation is expensive in tokens. Once generated for a project, the output is cached in the `project_contracts` table and never regenerated unless the project scope changes. This also protects against rate-limit disruptions during the demo.

---

## 5. Feature: Dispute Mediation Summarizer

### Purpose
When a dispute is raised, this feature reads the entire dispute chat and produces a neutral summary of each party's claims, identifies points of agreement, and suggests a fair resolution.

### System Prompt

```
You are a neutral mediator for a freelance payment dispute. You will receive a 
transcript of a dispute chat between a freelancer and a client. 

Your task:
1. Summarize each party's core claim in 1–2 sentences each.
2. Identify any points both parties already agree on.
3. Propose a single fair resolution (payment split percentage or specific action).
4. Keep a strictly neutral tone — do NOT take sides.
5. Use simple, respectful language.

Return JSON only:
{
  "freelancerClaim": "string",
  "clientClaim": "string",
  "agreedPoints": ["string"],
  "proposedResolution": "string",
  "suggestedSplit": { "freelancer": number, "client": number }
}
```

### Safety Configuration

For this feature, set `temperature: 0.1` (maximally deterministic) and add safety settings to block any HARASSMENT or HATE_SPEECH category content, since dispute chats can become heated:

```typescript
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
```

---

## 6. Rate Limiting & Fallback Strategy

Gemini 1.5 Flash free tier allows 15 requests per minute. The platform implements a request queue with a 4-second minimum gap between AI calls. If Gemini returns a 429 (rate limit), the system returns a cached response (if available) or gracefully degrades:

- For milestone generation: returns the default 3-milestone template.
- For contract drafting: returns a pre-written template with [PLACEHOLDER] fields.
- For dispute summarizer: shows "AI summary unavailable — please describe your position manually."

This ensures the hackathon demo never crashes due to API limits.

---

## 7. Prompt Injection Defense

Since project descriptions and dispute chats are user-generated content that gets injected into prompts, all inputs must be sanitized:

```typescript
function sanitizeForPrompt(userInput: string): string {
  return userInput
    .replace(/```/g, "")           // Remove code fences (common injection vector)
    .replace(/\bignore\b.{0,50}\bprevious\b/gi, "[filtered]") // Classic injection
    .replace(/\bsystem\b.{0,20}\bprompt\b/gi, "[filtered]")
    .slice(0, 2000);               // Hard length cap
}
```

Additionally, all AI outputs are validated against their expected JSON schema before being shown to users or stored in the database. Any output that fails schema validation is discarded and not shown.

---

## 8. Cost Estimation (Hackathon Budget)

Gemini 1.5 Flash is free up to 15 RPM / 1 million tokens per day via Google AI Studio. For a hackathon demo with ~50 projects and 3 AI calls per project, total token usage is estimated at ~150,000 tokens — well within the free tier. No API cost is anticipated.

---

*This file is read by AI coding agents (see AGENTS.md) to understand how to implement, test, and extend Gemini integrations without breaking existing behavior.*