import React from 'react';
import { Key } from '@phosphor-icons/react';

export default function SharedKeyPlaceholder({ activeStep }) {
  const isKeyDerived = activeStep >= 6; // Key Derivation

  return (
    <div className="quantum-card rounded-xl p-6 border border-border-subtle bg-surface/30 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
          <Key size={16} weight="fill" />
        </div>
        <h3 className="font-semibold text-text-main text-sm uppercase tracking-wider">Shared Secret Key</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        {isKeyDerived ? (
          <div className="text-center">
            <p className="text-xs text-text-muted mb-2 font-mono">Sifted & Amplified Key</p>
            <div className="bg-background-main border border-primary-500/30 p-3 rounded-lg text-primary-400 font-mono tracking-widest break-all text-sm shadow-[0_0_15px_rgba(15,98,254,0.1)]">
              10101100 01101011
            </div>
          </div>
        ) : (
          <div className="text-center opacity-50">
            <div className="w-full h-12 bg-background-main border border-border-subtle border-dashed rounded-lg flex items-center justify-center">
              <span className="text-xs text-text-muted font-mono">Awaiting Key Derivation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
