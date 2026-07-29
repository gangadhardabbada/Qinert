import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Atom, LockKey, ChartLineUp } from '@phosphor-icons/react';

export default function CircuitSummary({ activeStep, simData, engineInfo, executionTime }) {
  if (!simData || activeStep < 8) return null; // Show only at the end

  const isSecure = simData.is_secure;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full mt-4 quantum-card rounded-sm border border-border-subtle p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <h3 className="text-lg font-medium text-text-main flex items-center gap-2">
          Quantum Circuit Summary
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Status:</span>
          {isSecure ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium bg-green-500/10 text-green-400 px-2.5 py-1 rounded-sm border border-green-500/20">
              <CheckCircle weight="fill" /> Simulation Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium bg-red-500/10 text-red-400 px-2.5 py-1 rounded-sm border border-red-500/20">
              <XCircle weight="fill" /> Simulation Failed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={Atom} label="Initial Qubits" value={simData.initial_qubit_count} />
        <MetricCard icon={ChartLineUp} label="Measurements" value={simData.measured_qubit_count} />
        <MetricCard icon={Clock} label="Execution Time" value={executionTime ? `${executionTime}ms` : '--'} />
        <MetricCard icon={LockKey} label="Sifted Bits" value={simData.sifted_key_length} />
        
        <div className="col-span-2 p-3 bg-surface border border-border-subtle rounded-sm flex flex-col gap-1">
          <span className="text-xs font-mono text-text-muted/60 uppercase">Shared Key</span>
          <span className="font-mono text-sm text-text-main truncate" title={simData.final_key}>
            {simData.final_key || "FAILED"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface/50 p-3 rounded-sm border border-border-subtle">
        <span className="text-sm text-text-muted font-mono">Engine: <span className="text-primary-400">{engineInfo?.backend || 'Unknown'}</span></span>
        <span className="text-sm text-text-muted font-mono">QBER: <span className={simData.qber > 0.11 ? 'text-red-400' : 'text-green-400'}>{(simData.qber * 100).toFixed(2)}%</span></span>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="p-3 bg-surface border border-border-subtle rounded-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon size={14} />
        <span className="text-xs font-mono uppercase">{label}</span>
      </div>
      <span className="font-mono text-lg text-text-main font-medium">{value}</span>
    </div>
  );
}
