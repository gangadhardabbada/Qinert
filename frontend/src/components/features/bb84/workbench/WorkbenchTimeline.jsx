import React from 'react';

export default function WorkbenchTimeline({ steps, activeStep, setActiveStep }) {
  return (
    <div className="flex justify-between items-center relative py-6">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border-subtle rounded-full" />
      
      {/* Active track */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full transition-all duration-300"
        style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, idx) => {
        const isActive = idx === activeStep;
        const isCompleted = idx < activeStep;
        
        return (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveStep(idx)}>
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${isActive ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(15,98,254,0.5)] scale-125' : 
                  isCompleted ? 'bg-primary-500 text-white' : 'bg-surface border border-border-subtle text-text-muted hover:border-primary-400'}`}
            >
              {idx + 1}
            </div>
            
            <div className={`absolute top-full mt-2 w-max text-center transition-opacity duration-200 pointer-events-none
              ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <span className={`text-[10px] uppercase font-mono tracking-wider ${isActive ? 'text-primary-400 font-semibold' : 'text-text-muted'}`}>
                {step.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
