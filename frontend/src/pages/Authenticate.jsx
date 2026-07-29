import React, { useState } from 'react';
import { getApiBaseUrl } from '../config';

import PageWrapper from '../components/shared/PageWrapper';
import AuthControlPanel from '../components/authenticate/AuthControlPanel';
import QuantumStatusPanel from '../components/authenticate/QuantumStatusPanel';
import ProgressTimeline from '../components/authenticate/ProgressTimeline';
import QuantumChannel from '../components/authenticate/QuantumChannel';
import ResultCard from '../components/authenticate/ResultCard';
import { QinertClient } from '@qinert/client';

export default function Authenticate() {
  const [authStatus, setAuthStatus] = useState('waiting'); // waiting, authenticating, authenticated, failed, eavesdropping
  const [currentStep, setCurrentStep] = useState(-1);
  const [authDetails, setAuthDetails] = useState({ qber: null, protocol: null, engine: null });

  const qinert = React.useMemo(() => new QinertClient({ baseURL: getApiBaseUrl() }), []);

  const steps = [
    { title: "Initializing QPS/1.0", desc: "Setting up protocol" },
    { title: "Identifying Client", desc: "Verifying credentials" },
    { title: "Establishing Quantum Key", desc: "Starting negotiation" },
    { title: "Executing BB84", desc: "QKD protocol" },
    { title: "Validating QBER", desc: "Checking error rate" },
    { title: "Generating Challenge", desc: "Server nonce" },
    { title: "Creating Authentication Proof", desc: "HMAC generation" },
    { title: "Verifying Proof", desc: "Server validation" },
    { title: "Establishing Session", desc: "Generating token" },
    { title: "Authenticated", desc: "Secure channel ready" }
  ];

  const handleStart = async ({ clientId, engine }) => {
    if (authStatus === 'authenticating') return;
    
    setAuthStatus('authenticating');
    setCurrentStep(0);
    setAuthDetails({ qber: null, protocol: null, engine: null });

    try {
      // Step 1: Initializing QPS/1.0
      setCurrentStep(0);
      await qinert.changeEngine(engine);
      const engineInfo = await qinert.getEngineInfo();
      setAuthDetails(prev => ({ ...prev, engine: engineInfo.engine, protocol: 'QPS/1.0' }));
      
      // Step 2: Identifying Client
      setCurrentStep(1);
      await qinert.initiate(['bb84']);
      
      // Step 3-6: Key Establishing, BB84, QBER, Challenge
      setCurrentStep(3); 
      const handshakeRes = await qinert.handshake({ clientId, requestedVersion: '1.0.0' });
      setCurrentStep(5); // Challenge generated
      
      setAuthDetails(prev => ({ 
        ...prev, 
        qber: handshakeRes.simulationDetails?.qber,
        protocol: 'QPS/1.0'
      }));

      // Step 7-9: Creating Proof, Verifying, Session
      setCurrentStep(7);
      await qinert.authenticate();
      
      // Step 10: Authenticated
      setAuthStatus('authenticated');
      setCurrentStep(9);
    } catch (err) {
      console.error(err);
      if (err?.code === 'QPS-2001' || err?.code === 'QPS-3000' || err?.message?.includes('QBER')) {
        setAuthStatus('eavesdropping');
      } else {
        setAuthStatus('failed');
      }
    }
  };

  const handleTerminate = () => {
    qinert.terminateSession();
    setAuthStatus('waiting');
    setCurrentStep(-1);
    setAuthDetails({ qber: null, protocol: null, engine: null });
  };

  return (
    <PageWrapper>
      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel - 35% on Desktop */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AuthControlPanel onStart={handleStart} onTerminate={handleTerminate} status={authStatus} />
          <QuantumStatusPanel status={authStatus} currentStep={currentStep} stepsLength={steps.length} authDetails={authDetails} />
        </div>

        {/* Right Panel - 65% on Desktop */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="quantum-card rounded-xl p-8 relative overflow-hidden flex-1 border border-border-subtle bg-surface/30">
            <h2 className="text-2xl font-semibold tracking-tight text-text-main mb-8">Quantum Protocol Visualization</h2>
            
            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
              <div className="flex-1">
                <ProgressTimeline steps={steps} currentStep={currentStep} />
              </div>
              <div className="flex-[0.8] hidden lg:flex items-center justify-center relative">
                <QuantumChannel isActive={authStatus === 'authenticating'} currentStep={currentStep} />
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(94,43,255,0.05)_0%,transparent_60%)] pointer-events-none" />
          </div>

          <ResultCard status={authStatus} />
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}
