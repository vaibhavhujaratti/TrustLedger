import React from "react";
import { Button, Input } from "../ui/core";

export interface ProjectFormData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  freelancerEmail: string;
}

interface Step1ProjectDetailsProps {
  form: ProjectFormData;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const Step1ProjectDetails: React.FC<Step1ProjectDetailsProps> = ({
  form, setForm, onSubmit, isLoading, error
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Describe your project</h2>
      <p className="text-sm text-gray-500 mt-1">Provide details for AI to generate milestones</p>
    </div>
    <Input 
      label="Project Title" 
      placeholder="e.g. Website Redesign" 
      value={form.title} 
      onChange={(e: any) => setForm({...form, title: e.target.value})} 
    />
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">Description (Be specific)</label>
      <textarea 
        className="w-full border border-secondary-200 rounded-lg p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white transition-all placeholder:text-gray-400" 
        value={form.description} 
        onChange={(e) => setForm({...form, description: e.target.value})}
        placeholder="Describe your project requirements in detail..."
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input 
        label="Total Budget (₹)" 
        type="number" 
        value={form.budget} 
        onChange={(e: any) => setForm({...form, budget: e.target.value})}
        placeholder="50000"
      />
      <Input 
        label="Deadline" 
        type="date" 
        value={form.deadline} 
        onChange={(e: any) => setForm({...form, deadline: e.target.value})}
      />
    </div>
    <Input
      label="Freelancer Email (Optional)"
      placeholder="freelancer@example.com"
      value={form.freelancerEmail}
      onChange={(e: any) => setForm({ ...form, freelancerEmail: e.target.value })}
    />
    <div className="flex justify-end pt-4 border-t border-secondary-100">
      {error && <p className="text-sm text-danger-600 mr-auto">{error}</p>}
      <Button onClick={onSubmit} disabled={isLoading} variant="primary">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            Generate with AI
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </Button>
    </div>
  </div>
);
