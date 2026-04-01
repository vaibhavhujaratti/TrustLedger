import { generateMilestones } from "./src/services/gemini/milestoneGenerator";
import * as dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("Generating milestones for a sample project...");
  const milestones = await generateMilestones(
    "E-commerce React Dashboard",
    "I need a dashboard showing sales metrics, a product list table with editing, and user order history. Needs to look modern like Stripe.",
    25000
  );
  
  console.log("\nGenerated Milestones:");
  console.log(JSON.stringify(milestones, null, 2));
}

runTest().catch(console.error);
