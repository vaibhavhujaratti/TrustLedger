import { Request, Response } from "express";
import { generateMilestones } from "../services/gemini/milestoneGenerator";
import { generateContractClauses } from "../services/gemini/contractGenerator";
import { generateDisputeSummary } from "../services/gemini/disputeSummarizer";

export const getMilestoneSuggestions = async (req: Request, res: Response) => {
  const { title, description, budget, deadline } = req.body;
  const milestones = await generateMilestones(title, description, budget);
  res.status(200).json({ success: true, data: milestones });
};

export const getContractDraft = async (req: Request, res: Response) => {
  const { title, description, milestones } = req.body;
  
  // Format milestones for context awareness natively
  const mapStr = milestones.map((m: any) => `- ${m.title} (${m.budgetPercent}%): ${m.description}`).join("\n");
  const contract = await generateContractClauses(title, description, mapStr);
  
  res.status(200).json({ success: true, data: contract });
};

export const getDisputeSummary = async (req: Request, res: Response) => {
  const { chatLog } = req.body;
  const summary = await generateDisputeSummary(chatLog);
  res.status(200).json({ success: true, data: summary });
};
