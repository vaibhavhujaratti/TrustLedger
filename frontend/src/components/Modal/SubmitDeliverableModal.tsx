import React, { useState } from "react";
import { Button, Input, Card } from "../ui/core";

interface SubmitDeliverableModalProps {
  milestoneTitle: string;
  milestoneAmount: string;
  onSubmit: (url: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export const SubmitDeliverableModal: React.FC<SubmitDeliverableModalProps> = ({
  milestoneTitle,
  milestoneAmount,
  onSubmit,
  onClose,
  isLoading
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a deliverable URL");
      return;
    }
    
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g., https://drive.google.com/...)");
      return;
    }
    
    onSubmit(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in">
        <h2 className="text-xl font-bold mb-2">Submit Deliverable</h2>
        <p className="text-sm text-gray-500 mb-4">
          Submit work for: <span className="font-semibold">{milestoneTitle}</span> ({milestoneAmount})
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Deliverable URL"
            type="url"
            placeholder="https://drive.google.com/... or https://github.com/..."
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            error={error ?? undefined}
            helperText="Share a link to your completed work (Google Drive, GitHub, Figma, etc.)"
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !url.trim()}>
              {isLoading ? "Submitting..." : "Submit Deliverable"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
