import React from 'react';
import { ChartBar } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function QberDisplay({ activeStep, simData }) {
  const isQberCalculated = activeStep >= 7; // QBER Calculation step

  // Calculate percentage format
  const qberPercent = simData ? (simData.qber * 100).toFixed(2) : '0.00';
  const isSecure = simData ? simData.is_secure : true;

  return (
    <div className="quantum-card rounded-xl p-6 border border-border-subtle bg-surface/30 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-400">
          <ChartBar size={16} weight="fill" />
        </div>
        <h3 className="font-semibold text-text-main text-sm uppercase tracking-wider">QBER Estimate</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        {isQberCalculated && simData ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full"
          >
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Quantum Bit Error Rate</span>
              <span className={`text-xl font-semibold ${isSecure ? 'text-accent-400' : 'text-red-400'}`}>
                {qberPercent}%
              </span>
            </div>
            <div className="w-full bg-background-main h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${qberPercent}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${isSecure ? 'bg-accent-400' : 'bg-red-400'}`} 
              />
            </div>
            <div className="mt-2 text-xs text-text-muted text-right">
              {isSecure ? '< 11% (Secure)' : '≥ 11% (Compromised)'}
            </div>
          </motion.div>
        ) : (
          <div className="text-center opacity-50 w-full">
             <div className="w-full h-12 bg-background-main border border-border-subtle border-dashed rounded-lg flex items-center justify-center">
              <span className="text-xs text-text-muted font-mono">Awaiting QBER</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
