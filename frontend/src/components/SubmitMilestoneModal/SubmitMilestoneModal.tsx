import React, { useState } from "react";
import { z } from "zod";
import { Button, Input, Card, Alert } from "../ui/core";

const submitSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  notes: z.string().optional(),
});

type SubmitForm = z.infer<typeof submitSchema>;

interface SubmitMilestoneModalProps {
  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount: string;
  verificationCriteria: string;
  onSubmit: (data: { url: string; notes?: string }) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const SubmitMilestoneModal: React.FC<SubmitMilestoneModalProps> = ({
  milestoneId,
  milestoneTitle,
  milestoneAmount,
  verificationCriteria,
  onSubmit,
  onClose,
  isLoading,
}) => {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = submitSchema.safeParse({ url, notes });
    if (!result.success) {
      setUrlError(result.error.errors[0].message);
      return;
    }
    
    try {
      await onSubmit({ url: result.data.url, notes: result.data.notes });
      onClose();
    } catch (err) {
      setUrlError("Failed to submit milestone. Please try again.");
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setUrlError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit Deliverable</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {milestoneTitle} <span className="text-brand-600 font-medium">{milestoneAmount}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium text-secondary-700 block mb-1.5">Verification criteria</label>
          <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-lg text-sm text-secondary-600">
            {verificationCriteria}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Deliverable link"
            type="url"
            placeholder="https://drive.google.com/... or https://github.com/..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            error={urlError ?? undefined}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary-700 block">Notes (optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white resize-none transition-colors"
              rows={3}
              placeholder="Add any notes for your client about this deliverable..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Alert variant="warning" title="">
            Once submitted, your client will be notified
          </Alert>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !url.trim()} variant="primary">
              {isLoading ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
