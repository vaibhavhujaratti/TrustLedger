import React from "react";
import { Button, Alert } from "../ui/core";

interface Step4DepositProps {
  amount: string;
  onDeposit: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  onError: (msg: string | null) => void;
}

export const Step4Deposit: React.FC<Step4DepositProps> = ({
  amount, onDeposit, isLoading, isSuccess, error, onError
}) => (
  <div className="space-y-6 text-center">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        {isSuccess ? "Escrow Funded!" : "Deposit Escrow"}
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        {isSuccess ? "Your funds are now secured in escrow" : `Secure ₹${amount} into the platform vault`}
      </p>
    </div>
    
    <div className={`py-6 transition-all duration-300 ${isSuccess ? "scale-110" : ""}`}>
      {isSuccess ? (
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </div>
    
    <div className={`p-5 rounded-xl border max-w-sm mx-auto transition-all duration-300 ${isSuccess ? "bg-emerald-50 border-emerald-200" : "bg-brand-50 border-brand-100"}`}>
      <p className="text-sm text-secondary-700 leading-relaxed">
        {isSuccess 
          ? "Congratulations! Your project is now active. The freelancer can begin work on milestones."
          : "Funds are held securely. You have absolute control to release them as each milestone is approved."}
      </p>
    </div>
    
    <div className="flex flex-col items-center gap-4 pt-2">
      {error && (
        <Alert variant="danger" title="Deposit Failed">
          {error}
        </Alert>
      )}
      {!isSuccess && (
        <Button
          variant="success"
          size="lg"
          className="px-8 py-3 shadow-lg"
          disabled={isLoading}
          onClick={() => { onError(null); onDeposit(); }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Depositing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Confirm Deposit ₹{amount}
            </>
          )}
        </Button>
      )}
      <p className="text-xs text-secondary-400 flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
        This is a simulated escrow — no real money is transferred.
      </p>
    </div>
  </div>
);
