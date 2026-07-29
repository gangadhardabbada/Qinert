import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiHigh } from '@phosphor-icons/react';

export default function QuantumChannelIllustration({ activeStep, simData }) {
  const isTransmitting = activeStep >= 4; // Quantum Transmission
  
  // Pick quantum states from the real simulation if available
  const displayCount = 5;
  const states = simData ? simData.quantum_states.slice(0, displayCount) : ['|↑⟩', '|↘⟩', '|↑⟩', '|↑⟩', '|↗⟩'];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 relative">
      <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
        {/* Grid lines */}
        <div className="h-px w-full bg-border-subtle/50 my-2" />
        <div className="h-px w-full bg-border-subtle/50 my-2" />
        <div className="h-px w-full bg-border-subtle/50 my-2" />
      </div>

      <div className="bg-surface border border-border-subtle rounded-full p-3 mb-6 relative z-10 shadow-[0_0_15px_rgba(15,98,254,0.1)]">
        <WifiHigh size={24} className={isTransmitting ? 'text-accent-400 animate-pulse' : 'text-text-muted/50'} />
      </div>

      <div className="text-center relative z-10">
        <h4 className="text-sm font-semibold text-text-main">Quantum Channel</h4>
        <p className="text-xs font-mono text-text-muted mt-1">Fiber Optic Link</p>
      </div>

      {isTransmitting && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 overflow-hidden pointer-events-none z-20">
          <AnimatePresence>
            {states.map((state, i) => (
              <motion.div
                key={`photon-${i}`}
                className="w-10 h-6 flex items-center justify-center rounded-full bg-accent-500/20 text-accent-400 font-mono font-bold text-xs blur-[0.5px] shadow-[0_0_10px_var(--color-accent-400)]"
                initial={{ x: -150, opacity: 0 }}
                animate={{ x: 350, opacity: [0, 1, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  delay: i * 0.4,
                  ease: "linear"
                }}
              >
                {state}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
