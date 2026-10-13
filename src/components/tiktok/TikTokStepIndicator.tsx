import React from 'react';
import { Upload, Clock, Sliders, Sparkles, Download, Check } from 'lucide-react';

interface TikTokStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export const TikTokStepIndicator: React.FC<TikTokStepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Upload Video', icon: Upload },
    { number: 2, label: 'Choose Duration', icon: Clock },
    { number: 3, label: 'Adjust Layout', icon: Sliders },
    { number: 4, label: 'Generate Short', icon: Sparkles },
    { number: 5, label: 'Download', icon: Download },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-3">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 -z-0" />

        {/* Active connector fill with neon pink-purple-cyan gradient */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-500 -z-0"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                    : isActive
                    ? 'bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 text-white shadow-lg shadow-pink-500/30 ring-4 ring-pink-500/20 scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`mt-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap tracking-tight transition-colors hidden xs:block ${
                  isActive
                    ? 'text-pink-400 font-bold'
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
