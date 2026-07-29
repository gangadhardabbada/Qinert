import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from '@phosphor-icons/react';

export default function StepDetailPanel({ step }) {
  if (!step) return null;

  return (
    <div className="quantum-card rounded-xl p-6 border border-border-subtle bg-surface/50 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Info size={20} className="text-secondary-400" />
        <h3 className="font-semibold text-text-main text-lg">{step.title}</h3>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col gap-4"
        >
          <div>
            <p className="text-sm text-text-muted leading-relaxed">
              {step.description}
            </p>
          </div>
          
          <div className="mt-auto pt-4 border-t border-border-subtle/50">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted/60 block mb-1">Implementation Note</span>
            <p className="text-xs text-text-main font-mono bg-background-main p-3 rounded-md border border-border-subtle/30">
              {step.implementationNote}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
