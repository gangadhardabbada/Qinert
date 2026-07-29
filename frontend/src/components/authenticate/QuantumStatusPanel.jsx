import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Shield, LockKey, FlowArrow, Pulse, WarningCircle } from '@phosphor-icons/react';

export default function QuantumStatusPanel({ status, currentStep, stepsLength, authDetails }) {
  
  const getSecurityLevel = () => {
    if (status === 'waiting') return { label: 'Unknown', color: 'text-text-muted' };
    if (status === 'authenticating') return { label: 'Evaluating...', color: 'text-secondary-400' };
    if (status === 'authenticated') return { label: 'Maximum', color: 'text-primary-400' };
    return { label: 'Compromised', color: 'text-red-400' };
  };

  const getQber = () => {
    if (status === 'waiting' || currentStep < 9) return '--';
    if (authDetails?.qber !== undefined && authDetails?.qber !== null) {
      const qberPerc = (authDetails.qber * 100).toFixed(2);
      if (status === 'eavesdropping') return `${qberPerc}% (Eavesdropping Detected)`;
      return `${qberPerc}% (Safe)`;
    }
    if (status === 'authenticated') return '0.00% (Safe)';
    if (status === 'eavesdropping') return 'High (Eavesdropping)';
    return '--';
  };

  const getKeyEstablishment = () => {
    if (status === 'waiting') return 'Pending';
    if (status === 'authenticating' && currentStep < 3) return 'In Progress...';
    if (status === 'authenticating' && currentStep >= 3) return 'Completed';
    if (status === 'authenticated') return 'Completed';
    return 'Failed';
  };

  const getProofStatus = () => {
    if (status === 'waiting' || currentStep < 7) return 'Pending';
    if (status === 'authenticating' && currentStep === 7) return 'Verifying...';
    if (status === 'authenticated') return 'Verified';
    return 'Rejected';
  };

  const getSessionStatus = () => {
    if (status === 'authenticated') return 'Active';
    if (status === 'failed' || status === 'protocol_error' || status === 'eavesdropping') return 'Failed';
    return 'Pending';
  };

  const security = getSecurityLevel();

  return (
    <Card className="quantum-card border-border-subtle bg-surface/30 rounded-xl overflow-hidden mt-2">
      <CardBody className="p-6">
        <h4 className="text-sm font-semibold tracking-tight text-text-main flex items-center gap-2 mb-6">
          <Pulse size={18} className="text-secondary-400" />
          Quantum Status Panel
        </h4>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
            <span className="text-xs font-mono text-text-muted flex items-center gap-2">
              <FlowArrow size={14} /> Protocol / Engine
            </span>
            <span className="text-sm font-medium text-text-main capitalize">
              QPS/1.0 {authDetails?.engine === 'qiskit' ? '(Qiskit Aer)' : authDetails?.engine === 'classical' ? '(Classical)' : ''}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
            <span className="text-xs font-mono text-text-muted flex items-center gap-2">
              <Pulse size={14} /> Key Establishment
            </span>
            <span className="text-sm font-medium text-text-main">{getKeyEstablishment()}</span>
          </div>

          <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
            <span className="text-xs font-mono text-text-muted flex items-center gap-2">
              <WarningCircle size={14} /> QBER
            </span>
            <span className="text-sm font-mono text-text-main">{getQber()}</span>
          </div>

          <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
            <span className="text-xs font-mono text-text-muted flex items-center gap-2">
              <Shield size={14} /> Proof
            </span>
            <span className="text-sm font-mono text-text-main">{getProofStatus()}</span>
          </div>

          <div className="flex justify-between items-center pb-1">
            <span className="text-xs font-mono text-text-muted flex items-center gap-2">
              <LockKey size={14} /> Session
            </span>
            <span className={`text-sm font-medium ${getSessionStatus() === 'Active' ? 'text-primary-400' : getSessionStatus() === 'Failed' ? 'text-red-400' : 'text-text-main'}`}>
              {getSessionStatus()}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
