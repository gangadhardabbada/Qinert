import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowsClockwise } from '@phosphor-icons/react';

export default function ProgressTimeline({ steps, currentStep }) {
  return (
    <div className="flex flex-col relative w-full pb-8">
      {/* Vertical Track */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-border-subtle" />
      
      {/* Active Track */}
      <motion.div 
        className="absolute left-4 top-4 w-px bg-linear-to-b from-primary-400 to-secondary-500"
        initial={{ height: 0 }}
        animate={{ height: currentStep >= 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%' }}
        transition={{ duration: 0.3 }}
      />

      {steps.map((step, idx) => {
        const isCompleted = currentStep > idx;
        const isActive = currentStep === idx;
        const isUpcoming = currentStep < idx;

        return (
          <div key={idx} className="flex flex-row gap-6 items-start relative z-10 mb-6 last:mb-0">
            {/* Step Indicator */}
            <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-background-main">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary-400 bg-surface rounded-full shadow-[0_0_10px_rgba(15,98,254,0.3)]"
                >
                  <CheckCircle size={20} weight="fill" />
                </motion.div>
              ) : isActive ? (
                <div className="text-secondary-400 bg-surface rounded-full shadow-[0_0_15px_rgba(138,63,252,0.4)] animate-pulse">
                  <ArrowsClockwise size={20} className="animate-spin" />
                </div>
              ) : (
                <div className="text-border-subtle bg-surface rounded-full">
                  <Circle size={16} weight="bold" />
                </div>
              )}
            </div>

            {/* Step Content */}
            <motion.div 
              className={`flex-1 pt-1 ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}
              animate={{
                opacity: isUpcoming ? 0.4 : 1,
                x: isActive ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <h5 className={`text-sm font-semibold tracking-tight ${isActive ? 'text-secondary-400' : 'text-text-main'}`}>
                {step.title}
              </h5>
              <p className="text-xs text-text-muted mt-1">{step.desc}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
