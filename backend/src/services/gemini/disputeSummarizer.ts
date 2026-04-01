import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export interface DisputeSummary {
  freelancerClaim: string;
  clientClaim: string;
  agreedPoints: string[];
  proposedResolution: string;
  suggestedSplit: {
    freelancer: number;
    client: number;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing_key");

/**
 * Generates a neutral AI-mediated summary of a dispute chat between freelancer and client.
 * Uses Gemini 1.5 Flash with strict safety settings for harassment/hate speech.
 * Falls back to default resolution on error.
 * @param chatLog - The complete transcript of dispute messages
 * @returns Promise<DisputeSummary> with claims, agreements, and suggested resolution
 */
export async function generateDisputeSummary(chatLog: string): Promise<DisputeSummary> {

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    const prompt = `
You are a neutral mediator for a freelance payment dispute. You will receive a 
transcript of a dispute chat between a freelancer and a client. 

Your task:
1. Summarize each party's core claim in 1–2 sentences each.
2. Identify any points both parties already agree on.
3. Propose a single fair resolution (payment split percentage or specific action).
4. Keep a strictly neutral tone — do NOT take sides.
5. Use simple, respectful language.

Chat Log:
${chatLog}

Return JSON only:
{
  "freelancerClaim": "string",
  "clientClaim": "string",
  "agreedPoints": ["string"],
  "proposedResolution": "string",
  "suggestedSplit": { "freelancer": number, "client": number }
}
`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("Gemini dispute summarization failed:", err);
    return {
      freelancerClaim: "AI summary pending detail analysis.",
      clientClaim: "AI summary pending detail analysis.",
      agreedPoints: [],
      proposedResolution: "Manual mediation required.",
      suggestedSplit: { freelancer: 50, client: 50 }
    };
  }
}
