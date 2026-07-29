import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@phosphor-icons/react';

export default function BobPanel({ activeStep, simData }) {
  const isMeasuring = activeStep >= 5; // Bob's Measurement
  
  const displayCount = 8;
  const bases = simData ? simData.bob_bases.slice(0, displayCount) : ['+', '+', '×', '+', '×', '+', '+', '×'];
  const measured = simData ? simData.bob_measured_bits.slice(0, displayCount) : [1, 1, 0, 1, 0, 1, 1, 0];

  return (
    <div className="quantum-card rounded-xl p-6 border border-border-subtle bg-surface/30 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary-500/10 border border-secondary-500/30 flex items-center justify-center text-secondary-400">
          <User size={20} weight="fill" />
        </div>
        <div>
          <h3 className="font-semibold text-text-main">Bob</h3>
          <p className="text-xs text-text-muted font-mono">Receiver Node</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Basis Selection */}
        <div className={`p-4 rounded-lg border transition-colors ${isMeasuring ? 'border-secondary-500/40 bg-secondary-500/5' : 'border-border-subtle/50 bg-background-main/30 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Basis</span>
          </div>
          <div className="flex gap-1.5 font-mono text-sm">
            <AnimatePresence>
              {bases.map((b, i) => (
                <motion.span 
                  key={`bob-basis-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isMeasuring ? 1 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 text-center py-1 rounded bg-surface ${isMeasuring ? 'text-secondary-400' : 'text-text-muted/30'}`}
                >
                  {isMeasuring ? (b === 'x' ? '×' : b) : '-'}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Measurement Results */}
        <div className={`p-4 rounded-lg border transition-colors ${isMeasuring ? 'border-primary-500/40 bg-primary-500/5' : 'border-border-subtle/50 bg-background-main/30 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Measured Bits</span>
          </div>
          <div className="flex gap-1.5 font-mono text-sm">
            <AnimatePresence>
              {measured.map((b, i) => (
                <motion.span 
                  key={`bob-bit-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isMeasuring ? 1 : 0.3, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 text-center py-1 rounded bg-surface ${isMeasuring ? 'text-primary-400' : 'text-text-muted/30'}`}
                >
                  {isMeasuring ? b : '-'}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
