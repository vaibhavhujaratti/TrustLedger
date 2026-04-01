import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AppError } from "../../lib/AppError";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing_key");

export async function generateDisputeSummary(chatLog: string): Promise<any> {

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, // Highly deterministic
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
    return {
      freelancerClaim: "AI summary pending detail analysis.",
      clientClaim: "AI summary pending detail analysis.",
      agreedPoints: [],
      proposedResolution: "Manual mediation required.",
      suggestedSplit: { freelancer: 50, client: 50 }
    };
  }
}
