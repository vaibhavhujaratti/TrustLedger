import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../../lib/AppError";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing_key");

export async function generateContractClauses(
  projectTitle: string,
  projectDescription: string,
  milestonesText: string
): Promise<{ clauses: { title: string; body: string }[] }> {

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const prompt = `
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

Project Title: ${projectTitle}
Description: ${projectDescription}
Milestones Context:
${milestonesText}

Return a single JSON object with a "clauses" array. Each clause has a "title" 
and "body" (2–4 sentences). Do NOT include signature blocks.
`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    
    if (!parsed.clauses || !Array.isArray(parsed.clauses)) {
      throw new Error("Invalid schema");
    }
    
    return parsed;
  } catch (err) {
    // Fallback template on rate limits
    return {
      clauses: [
        { title: "Scope of Work", body: "The Freelancer agrees to deliver the milestones specified in this project. The Client agrees to review deliverables within reasonable time." },
        { title: "Payment Terms", body: "Payments are secured via escrow and released upon milestone approval. All escrow payments are final." },
        { title: "Intellectual Property", body: "Full IP clears upon final milestone payment release." }
      ]
    };
  }
}
