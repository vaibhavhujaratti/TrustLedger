import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui/core";
import {
  useCreateProject,
  useLinkFreelancer,
  usePersistMilestones,
  useSignContract,
  useUpsertContract,
} from "../api/useProjects";
import { useAiContract, useAiMilestones, type MilestoneSuggestion } from "../api/useAi";
import { useDepositEscrow } from "../api/useEscrow";

export default function CreateProjectWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "", freelancerEmail: "" });
  const [projectId, setProjectId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneSuggestion[]>([]);
  const [clauses, setClauses] = useState<{ title: string; body: string }[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const linkFreelancer = useLinkFreelancer();
  const aiMilestones = useAiMilestones();
  const aiContract = useAiContract();
  const persistMilestones = usePersistMilestones();
  const upsertContract = useUpsertContract();
  const signContract = useSignContract();
  const depositEscrow = useDepositEscrow(projectId ?? "");

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const ensureProject = async (): Promise<string> => {
    if (projectId) return projectId;
    return await new Promise((resolve, reject) => {
      createProject.mutate(
        {
          title: form.title,
          description: form.description,
          totalBudget: Number(form.budget),
          deadline: form.deadline || new Date(Date.now() + 10 * 86400000).toISOString(),
        },
        {
          onSuccess: (data) => {
            setProjectId(data.id);
            resolve(data.id);
          },
          onError: reject,
        }
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      {/* Stepper Logic */}
      <div className="flex items-center justify-between px-10 text-sm font-bold text-gray-400">
        <span className={step >= 1 ? "text-trust-blue" : ""}>1. Describe</span>
        <span className={step >= 2 ? "text-trust-blue" : ""}>2. AI Scope</span>
        <span className={step >= 3 ? "text-trust-blue" : ""}>3. Contract</span>
        <span className={step >= 4 ? "text-trust-green" : ""}>4. Deposit</span>
      </div>

      <Card className="p-8 shadow-md">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Describe your project</h2>
            <Input label="Project Title" placeholder="e.g. Website Redesign" value={form.title} onChange={(e: any) => setForm({...form, title: e.target.value})} />
            <div className="space-y-1">
              <label className="text-sm font-medium">Description (Be highly specific)</label>
              <textarea className="w-full border rounded-md p-2 h-32" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}></textarea>
            </div>
            <div className="flex gap-4">
              <div className="flex-1"><Input label="Total Budget (₹)" type="number" value={form.budget} onChange={(e: any) => setForm({...form, budget: e.target.value})} /></div>
              <div className="flex-1"><Input label="Deadline" type="date" value={form.deadline} onChange={(e: any) => setForm({...form, deadline: e.target.value})} /></div>
            </div>
            <Input
              label="Freelancer Email (to invite)"
              placeholder="freelancer@demo.com"
              value={form.freelancerEmail}
              onChange={(e: any) => setForm({ ...form, freelancerEmail: e.target.value })}
            />
            <div className="flex justify-end pt-4">
              {stepError && <p className="text-sm text-trust-red mr-auto">{stepError}</p>}
              <Button
                onClick={async () => {
                  setStepError(null);
                  try {
                    const pid = await ensureProject();
                    if (form.freelancerEmail.trim()) {
                      await linkFreelancer.mutateAsync({ projectId: pid, email: form.freelancerEmail.trim() });
                    }
                    aiMilestones.mutate(
                      { title: form.title, description: form.description, budget: Number(form.budget), deadline: form.deadline },
                      {
                        onSuccess: async (data) => {
                          setMilestones(data);
                          await persistMilestones.mutateAsync({ projectId: pid, milestones: data });
                          setStep(2);
                        },
                        onError: (e: any) => setStepError(e?.response?.data?.error || "Failed to generate milestones"),
                      }
                    );
                  } catch (e: any) {
                    setStepError(e?.response?.data?.error || "Failed to create project");
                  }
                }}
                disabled={createProject.isPending || aiMilestones.isPending || persistMilestones.isPending}
              >
                {aiMilestones.isPending ? "Generating..." : "Generate with AI →"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Proposed AI Milestones</h2>
            <p className="text-gray-600 mb-4">Gemini extracted these milestones based on your description.</p>
            <Card className="p-4 bg-gray-50 space-y-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex justify-between font-bold">
                  <span>{m.title}</span>
                  <span>{m.budgetPercent}%</span>
                </div>
              ))}
            </Card>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button
                onClick={async () => {
                  const pid = await ensureProject();
                  aiContract.mutate(
                    { title: form.title, description: form.description, milestones },
                    {
                      onSuccess: async (data) => {
                        setClauses(data.clauses);
                        await upsertContract.mutateAsync({ projectId: pid, clauses: data.clauses });
                        setStep(3);
                      },
                    }
                  );
                }}
                disabled={aiContract.isPending || upsertContract.isPending || milestones.length === 0}
              >
                {aiContract.isPending ? "Drafting..." : "This Looks Good →"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Review Contract</h2>
            <Card className="p-6 bg-[#fdfbf7] border-[#e2dcd2] shadow-inner font-serif h-48 overflow-y-auto">
              {clauses.map((c, idx) => (
                <div key={idx} className="mb-4">
                  <h3 className="font-bold text-lg mb-1">{c.title}</h3>
                  <p className="text-sm leading-6">{c.body}</p>
                </div>
              ))}
            </Card>
            <div className="flex items-center space-x-2 py-4">
              <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <label htmlFor="agree">I have read and agree to these generated terms</label>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => { setStepError(null); setStep(2); }}>← Back</Button>
              <Button
                onClick={async () => {
                  setStepError(null);
                  try {
                    const pid = await ensureProject();
                    await signContract.mutateAsync({ projectId: pid, ipHash: crypto.randomUUID().replace(/-/g, "") });
                    setStep(4);
                  } catch (e: any) {
                    setStepError(e?.response?.data?.error || "Failed to sign contract");
                  }
                }}
                disabled={!agreed || signContract.isPending || !projectId}
              >
                {signContract.isPending ? "Signing..." : "Sign Contract →"}
              </Button>
            </div>
            {stepError && <p className="text-sm text-trust-red">{stepError}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in text-center">
            <h2 className="text-3xl font-bold mb-2">Deposit Escrow</h2>
            <p className="text-lg text-gray-600">Secure ₹{form.budget} into the platform vault</p>
            <div className="text-7xl py-10">🏦</div>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Funds are held securely. You have absolute control to release them as each milestone is approved.
            </p>
            <div className="flex justify-center pt-8 flex-col items-center gap-3">
              {stepError && <p className="text-sm text-trust-red">{stepError}</p>}
              <Button
                variant="success"
                className="px-10 py-4 text-xl shadow-lg"
                disabled={createProject.isPending || !projectId || depositEscrow.isPending}
                onClick={() => {
                  setStepError(null);
                  depositEscrow.mutate(Number(form.budget), {
                    onSuccess: () => navigate(`/projects/${projectId}`),
                    onError: (e: any) => setStepError(e?.response?.data?.error || "Deposit failed. Please try again."),
                  });
                }}
              >
                {depositEscrow.isPending ? "Depositing..." : `Confirm Deposit ₹${form.budget}`}
              </Button>
              <p className="text-xs text-gray-400">This is a simulated escrow — no real money is transferred.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
