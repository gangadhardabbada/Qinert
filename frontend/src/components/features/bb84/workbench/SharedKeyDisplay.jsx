import React from 'react';
import { Key } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function SharedKeyDisplay({ activeStep, simData }) {
  const isKeyDerived = activeStep >= 6; // Key Derivation step

  return (
    <div className="quantum-card rounded-xl p-6 border border-border-subtle bg-surface/30 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
          <Key size={16} weight="fill" />
        </div>
        <h3 className="font-semibold text-text-main text-sm uppercase tracking-wider">Shared Secret Key</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        {isKeyDerived && simData && simData.final_hex_key ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-xs text-text-muted mb-2 font-mono">Sifted & Amplified Key</p>
            <div className="bg-background-main border border-primary-500/30 p-3 rounded-lg text-primary-400 font-mono tracking-widest break-all text-sm shadow-[0_0_15px_rgba(15,98,254,0.1)]">
              {simData.final_hex_key}
            </div>
          </motion.div>
        ) : (
          <div className="text-center opacity-50 w-full">
            <div className="w-full h-12 bg-background-main border border-border-subtle border-dashed rounded-lg flex items-center justify-center">
              <span className="text-xs text-text-muted font-mono">
                {activeStep >= 6 && simData && !simData.final_hex_key 
                  ? 'Key discarded (Insecure)' 
                  : 'Awaiting Key Derivation'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
