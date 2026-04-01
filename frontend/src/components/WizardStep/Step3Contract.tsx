import React from "react";
import { Button, Card } from "../ui/core";

interface Step3ContractProps {
  clauses: { title: string; body: string }[];
  agreed: boolean;
  setAgreed: (value: boolean) => void;
  onBack: () => void;
  onSign: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const Step3Contract: React.FC<Step3ContractProps> = ({
  clauses, agreed, setAgreed, onBack, onSign, isLoading, error
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Review Contract</h2>
      <p className="text-sm text-gray-500 mt-1">Read and sign to proceed with your project</p>
    </div>
    <Card className="p-6 bg-secondary-50/50 border border-secondary-100 h-56 overflow-y-auto">
      {clauses.map((c, idx) => (
        <div key={idx} className="mb-4 last:mb-0">
          <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
          <p className="text-sm text-secondary-600 leading-relaxed">{c.body}</p>
        </div>
      ))}
    </Card>
    <div className="flex items-center gap-3 py-2">
      <input 
        type="checkbox" 
        id="agree" 
        checked={agreed} 
        onChange={(e) => setAgreed(e.target.checked)} 
        className="w-4 h-4 text-brand-500 rounded border-secondary-300 focus:ring-brand-500"
      />
      <label htmlFor="agree" className="text-sm text-secondary-700 cursor-pointer">
        I have read and agree to the generated terms
      </label>
    </div>
    {error && (
      <div className="p-3 text-sm text-danger-700 bg-danger-50 rounded-xl border border-danger-100">
        {error}
      </div>
    )}
    <div className="flex justify-between pt-4 border-t border-secondary-100">
      <Button variant="outline" onClick={onBack}>
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Button>
      <Button onClick={onSign} disabled={!agreed || isLoading} variant="primary">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing...
          </>
        ) : (
          <>
            Sign Contract
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </Button>
    </div>
  </div>
);
