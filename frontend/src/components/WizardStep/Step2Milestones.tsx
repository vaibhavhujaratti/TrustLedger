import React, { useState } from "react";
import { Button, Card, ProgressBar } from "../ui/core";

export interface EditableMilestone {
  title: string;
  description: string;
  budgetPercent: number;
  estimatedDays: number;
  verificationCriteria: string;
}

interface Step2MilestonesProps {
  milestones: EditableMilestone[];
  onMilestonesChange: (milestones: EditableMilestone[]) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
}

const SkeletonCard = () => (
  <Card className="p-4 animate-pulse">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-secondary-200" />
        <div className="h-4 w-32 bg-secondary-200 rounded" />
      </div>
      <div className="h-6 w-12 bg-secondary-200 rounded-full" />
    </div>
    <div className="ml-9 space-y-2">
      <div className="h-3 w-full bg-secondary-100 rounded" />
      <div className="h-3 w-3/4 bg-secondary-100 rounded" />
    </div>
    <div className="ml-9 mt-2 flex gap-4">
      <div className="h-3 w-20 bg-secondary-100 rounded" />
      <div className="h-3 w-40 bg-secondary-100 rounded" />
    </div>
  </Card>
);

interface MilestoneCardProps {
  milestone: EditableMilestone;
  index: number;
  onChange: (updated: EditableMilestone) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, index, onChange, onRemove, canRemove }) => {
  const [editingPercent, setEditingPercent] = useState(false);
  const [percentInput, setPercentInput] = useState(milestone.budgetPercent.toString());

  const handlePercentSave = () => {
    const value = parseInt(percentInput);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onChange({ ...milestone, budgetPercent: value });
    } else {
      setPercentInput(milestone.budgetPercent.toString());
    }
    setEditingPercent(false);
  };

  return (
    <Card className="p-4 border border-secondary-100 hover:border-secondary-200 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <input
            type="text"
            value={milestone.title}
            onChange={(e) => onChange({ ...milestone, title: e.target.value })}
            className="font-semibold bg-transparent border-b border-transparent hover:border-secondary-300 focus:border-brand-500 focus:outline-none transition-colors"
            placeholder="Milestone title"
          />
        </div>
        <div className="flex items-center gap-2">
          {editingPercent ? (
            <input
              type="number"
              value={percentInput}
              onChange={(e) => setPercentInput(e.target.value)}
              onBlur={handlePercentSave}
              onKeyDown={(e) => e.key === "Enter" && handlePercentSave()}
              className="w-16 px-2 py-1 border border-brand-500 rounded text-center font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              min={0}
              max={100}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingPercent(true)}
              className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-brand-100 transition-colors"
            >
              {milestone.budgetPercent}%
            </button>
          )}
          {canRemove && onRemove && (
            <button
              onClick={onRemove}
              className="text-secondary-400 hover:text-danger-500 transition-colors"
              title="Remove milestone"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <textarea
        value={milestone.description}
        onChange={(e) => onChange({ ...milestone, description: e.target.value })}
        className="text-sm text-secondary-600 ml-9 mb-2 w-full bg-transparent border border-transparent hover:border-secondary-200 focus:border-brand-500 focus:outline-none resize-none transition-colors"
        rows={2}
        placeholder="Description"
      />
      
      <div className="ml-9 text-xs text-secondary-500 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="number"
            value={milestone.estimatedDays}
            onChange={(e) => onChange({ ...milestone, estimatedDays: parseInt(e.target.value) || 0 })}
            className="w-12 px-1 bg-transparent border border-transparent hover:border-secondary-300 focus:border-brand-500 focus:outline-none rounded transition-colors"
            min={1}
          />
          <span>days</span>
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <input
            type="text"
            value={milestone.verificationCriteria}
            onChange={(e) => onChange({ ...milestone, verificationCriteria: e.target.value })}
            className="w-40 bg-transparent border border-transparent hover:border-secondary-300 focus:border-brand-500 focus:outline-none rounded transition-colors"
            placeholder="Verification criteria"
          />
        </span>
      </div>
    </Card>
  );
};

export const Step2Milestones: React.FC<Step2MilestonesProps> = ({
  milestones,
  onMilestonesChange,
  onBack,
  onNext,
  isLoading,
}) => {
  const totalBudget = milestones.reduce((sum, m) => sum + m.budgetPercent, 0);
  const isValid = totalBudget === 100 && milestones.length >= 1;

  const handleAddMilestone = () => {
    onMilestonesChange([
      ...milestones,
      {
        title: "New Milestone",
        description: "Description of this milestone",
        budgetPercent: 0,
        estimatedDays: 1,
        verificationCriteria: "Client approves deliverable",
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    onMilestonesChange(milestones.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, updated: EditableMilestone) => {
    const newMilestones = [...milestones];
    newMilestones[index] = updated;
    onMilestonesChange(newMilestones);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">AI-Generated Milestones</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? "Generating milestones..." : "Review and adjust milestones or click + to add more."}
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          milestones.map((m, idx) => (
            <MilestoneCard
              key={idx}
              milestone={m}
              index={idx}
              onChange={(updated) => handleChange(idx, updated)}
              onRemove={() => handleRemoveMilestone(idx)}
              canRemove={milestones.length > 1}
            />
          ))
        )}
      </div>

      {!isLoading && (
        <Button variant="ghost" onClick={handleAddMilestone} className="w-full border-2 border-dashed border-secondary-200 hover:border-brand-300 hover:bg-brand-50/50">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Milestone
        </Button>
      )}

      <div className={`p-4 rounded-xl ${totalBudget === 100 ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"}`}>
        <ProgressBar
          value={totalBudget}
          max={100}
          label="Budget allocation"
          variant={totalBudget === 100 ? "success" : "warning"}
        />
        {totalBudget !== 100 && (
          <p className="text-sm text-amber-700 mt-2 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Budget must equal 100% (currently {totalBudget}%)
          </p>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-secondary-100">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading || !isValid} variant="primary">
          {isLoading ? "Generating..." : "Continue"}
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
