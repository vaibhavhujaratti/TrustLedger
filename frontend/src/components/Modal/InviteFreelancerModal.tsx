import React, { useState } from "react";
import { Button, Input, Card, Alert } from "../ui/core";

interface InviteFreelancerModalProps {
  projectTitle: string;
  onInvite: (email: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const InviteFreelancerModal: React.FC<InviteFreelancerModalProps> = ({
  projectTitle,
  onInvite,
  onClose,
  isLoading
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      await onInvite(email.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to invite freelancer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in">
        <h2 className="text-xl font-bold mb-2">Invite Freelancer</h2>
        <p className="text-sm text-gray-500 mb-4">
          Invite a freelancer to work on: <span className="font-semibold">{projectTitle}</span>
        </p>
        
        {success ? (
          <Alert variant="success" title="Invitation Sent!">
            Freelancer invited — they'll appear once they accept.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Freelancer's email address"
              type="email"
              placeholder="freelancer@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              error={error ?? undefined}
              helperText="Enter the email of a registered freelancer"
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !email.trim()}>
                {isLoading ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
