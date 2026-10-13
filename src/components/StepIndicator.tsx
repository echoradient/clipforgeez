import React from 'react';
import { Upload, Clock, Download, Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Upload Video', icon: Upload },
    { number: 2, label: 'Choose Duration', icon: Clock },
    { number: 3, label: 'Download Clips', icon: Download },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting background bar */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 -z-0" />
        
        {/* Active connector fill */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500 -z-0"
          style={{
            width:
              currentStep === 1
                ? '0%'
                : currentStep === 2
                ? '50%'
                : 'calc(100% - 3rem)',
          }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                    : isActive
                    ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30 ring-4 ring-violet-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap tracking-wide transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : isCompleted
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                {step.number}. {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
