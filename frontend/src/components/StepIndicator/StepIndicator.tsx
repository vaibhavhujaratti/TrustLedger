import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between px-4 lg:px-10 text-sm font-medium">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isPending = stepNum > currentStep;
        
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2 transition-all duration-300 ${
                  isComplete 
                    ? "bg-brand-500 text-white" 
                    : isCurrent 
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30" 
                      : "bg-secondary-100 text-secondary-400"
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span className={`${isCurrent ? "text-brand-600" : isPending ? "text-secondary-400" : "text-brand-500"}`}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${isComplete ? "bg-brand-500" : "bg-secondary-100"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
