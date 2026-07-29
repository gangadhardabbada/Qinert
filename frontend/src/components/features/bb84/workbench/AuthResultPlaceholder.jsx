import React from 'react';
import { ShieldCheck, ShieldWarning } from '@phosphor-icons/react';

export default function AuthResultPlaceholder({ activeStep }) {
  const isDecisionMade = activeStep >= 8; // Authentication Decision

  return (
    <div className={`quantum-card rounded-xl p-6 border transition-colors flex flex-col h-full justify-center items-center text-center
      ${isDecisionMade ? 'border-primary-500/50 bg-primary-500/10 shadow-[0_0_30px_rgba(15,98,254,0.15)]' : 'border-border-subtle bg-surface/30'}
    `}>
      {isDecisionMade ? (
        <>
          <div className="w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mb-3">
            <ShieldCheck size={28} weight="fill" />
          </div>
          <h3 className="font-semibold text-text-main text-lg mb-1">Authentication Success</h3>
          <p className="text-xs text-text-muted">Quantum link secure. Session token issued.</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-background-main border border-border-subtle border-dashed flex items-center justify-center mb-3 opacity-50">
            <ShieldWarning size={28} className="text-text-muted" />
          </div>
          <h3 className="font-medium text-text-muted text-lg mb-1 opacity-50">Pending Decision</h3>
          <p className="text-xs text-text-muted opacity-50">Awaiting protocol completion.</p>
        </>
      )}
    </div>
  );
}
