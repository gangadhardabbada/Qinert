import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkle } from '@phosphor-icons/react';

export default function AlicePanel({ activeStep, simData }) {
  const isGeneratingBits = activeStep >= 1;
  const isSelectingBasis = activeStep >= 2;
  const isEncoding = activeStep >= 3;

  // Render mock data if no simulation data exists yet, or slice a subset for visualization
  const displayCount = 8;
  const bits = simData ? simData.alice_bits.slice(0, displayCount) : [1, 0, 1, 1, 0, 0, 1, 0];
  const bases = simData ? simData.alice_bases.slice(0, displayCount) : ['+', '×', '+', '+', '×', '×', '+', '×'];
  const states = simData ? simData.quantum_states.slice(0, displayCount) : ['|↑⟩', '|↘⟩', '|↑⟩', '|↑⟩', '|↗⟩', '|↗⟩', '|↑⟩', '|↘⟩'];

  return (
    <div className="quantum-card rounded-xl p-6 border border-border-subtle bg-surface/30 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
          <User size={20} weight="fill" />
        </div>
        <div>
          <h3 className="font-semibold text-text-main">Alice</h3>
          <p className="text-xs text-text-muted font-mono">Sender Node</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Random Bits */}
        <div className={`p-4 rounded-lg border transition-colors ${isGeneratingBits ? 'border-primary-500/40 bg-primary-500/5' : 'border-border-subtle/50 bg-background-main/30 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Raw Bits</span>
            {isGeneratingBits && !simData && <Sparkle size={14} className="text-primary-400 animate-pulse" />}
          </div>
          <div className="flex gap-1.5 font-mono text-sm">
            <AnimatePresence>
              {bits.map((b, i) => (
                <motion.span 
                  key={`bit-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isGeneratingBits ? 1 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 text-center py-1 rounded bg-surface ${isGeneratingBits ? 'text-primary-400' : 'text-text-muted/30'}`}
                >
                  {isGeneratingBits ? b : '-'}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Basis Selection */}
        <div className={`p-4 rounded-lg border transition-colors ${isSelectingBasis ? 'border-secondary-500/40 bg-secondary-500/5' : 'border-border-subtle/50 bg-background-main/30 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Basis</span>
          </div>
          <div className="flex gap-1.5 font-mono text-sm">
            <AnimatePresence>
              {bases.map((b, i) => (
                <motion.span 
                  key={`basis-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isSelectingBasis ? 1 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 text-center py-1 rounded bg-surface ${isSelectingBasis ? 'text-secondary-400' : 'text-text-muted/30'}`}
                >
                  {isSelectingBasis ? (b === 'x' ? '×' : b) : '-'}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Encoding */}
        <div className={`p-4 rounded-lg border transition-colors ${isEncoding ? 'border-accent-500/40 bg-accent-500/5' : 'border-border-subtle/50 bg-background-main/30 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Polarization</span>
          </div>
          <div className="flex gap-1.5 font-mono text-sm">
            <AnimatePresence>
              {states.map((s, i) => (
                <motion.span 
                  key={`state-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isEncoding ? 1 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 text-center py-1 rounded bg-surface ${isEncoding ? 'text-accent-400 font-bold' : 'text-text-muted/30'}`}
                >
                  {isEncoding ? s : '-'}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
