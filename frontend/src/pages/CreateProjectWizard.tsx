import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui/core";
import { useCreateProject } from "../api/useProjects";

export default function CreateProjectWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "" });
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleCreate = async () => {
    // In full implementation: trigger AI generator during transition steps.
    createProject.mutate({
      title: form.title,
      description: form.description,
      totalBudget: Number(form.budget),
      deadline: form.deadline || new Date(Date.now() + 10*86400000).toISOString()
    }, {
      onSuccess: (data) => navigate(`/projects/${data.id}`)
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
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>Generate with AI →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Proposed AI Milestones</h2>
            <p className="text-gray-600 mb-4">Gemini extracted these milestones based on your description.</p>
            <Card className="p-4 bg-gray-50 space-y-2">
              <div className="flex justify-between font-bold"><span>Design System & Mockup</span><span>30%</span></div>
              <div className="flex justify-between font-bold"><span>Frontend Development</span><span>50%</span></div>
              <div className="flex justify-between font-bold"><span>Final Integration & Polish</span><span>20%</span></div>
            </Card>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={handleNext}>This Looks Good →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Review Contract</h2>
            <Card className="p-6 bg-[#fdfbf7] border-[#e2dcd2] shadow-inner font-serif h-48 overflow-y-auto">
              <h3 className="font-bold text-lg mb-2">Scope of Work</h3>
              <p>The Developer agrees to implement the milestones bounded by the escrow limits...</p>
            </Card>
            <div className="flex items-center space-x-2 py-4">
              <input type="checkbox" id="agree" />
              <label htmlFor="agree">I have read and agree to these generated terms</label>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={handleNext}>Sign Contract →</Button>
            </div>
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
            <div className="flex justify-center pt-8">
              <Button variant="success" className="px-10 py-4 text-xl shadow-lg" disabled={createProject.isPending} onClick={handleCreate}>
                {createProject.isPending ? "Locking..." : `Deposit ₹${form.budget}`}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
