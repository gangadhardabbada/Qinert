import React, { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../../../../config';
import { Button, Spinner } from '@heroui/react';
import WorkbenchTimeline from './WorkbenchTimeline';
import WorkbenchStepNavigation from './WorkbenchStepNavigation';
import StepDetailPanel from './StepDetailPanel';
import AlicePanel from './AlicePanel';
import BobPanel from './BobPanel';
import QuantumChannelIllustration from './QuantumChannelIllustration';
import SharedKeyDisplay from './SharedKeyDisplay';
import QberDisplay from './QberDisplay';
import AuthResultPlaceholder from './AuthResultPlaceholder';
import CircuitSummary from './CircuitSummary';
import { Terminal, Play, Cpu } from '@phosphor-icons/react';
import { QinertClient } from '@qinert/client';

export default function BB84Workbench({ steps }) {
  const [activeStep, setActiveStep] = useState(0);
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [engineInfo, setEngineInfo] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const qinert = React.useMemo(() => new QinertClient({ baseURL: getApiBaseUrl() }), []);

  const fetchEngineInfo = useCallback(async () => {
    try {
      const data = await qinert.getEngineInfo();
      setEngineInfo(data);
    } catch (err) {
      console.error("Failed to fetch engine info:", err);
    }
  }, [qinert]);

  useEffect(() => {
    fetchEngineInfo();
  }, [fetchEngineInfo]);

  const changeEngine = async (engineName) => {
    try {
      await qinert.changeEngine(engineName);
      await fetchEngineInfo();
    } catch (err) {
      console.error("Failed to set engine:", err);
    }
  };

  const currentStepData = steps[activeStep];

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const startTime = performance.now();
      const res = await qinert.handshake({
        clientId: 'frontend_demo_client',
        requestedVersion: '1.0.0'
      });
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      setSimData(res.simulationDetails);
      
      if (res.simulationDetails?.job_id) {
        setJobStatus('QUEUED');
        pollJobStatus(res.simulationDetails.job_id);
      } else {
        setJobStatus(null);
      }
      
      setActiveStep(1); // Move past bit preparation
    } catch (err) {
      setError(err.message || 'Simulation failed to run');
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId) => {
    try {
      const job = await qinert.getIBMJob(jobId);
      setJobStatus(job.status);
      if (job.status === 'QUEUED' || job.status === 'RUNNING') {
        setTimeout(() => pollJobStatus(jobId), 5000);
      }
    } catch (err) {
      console.error("Job polling failed:", err);
      setJobStatus("FAILED");
    }
  };

  return (
    <div className="quantum-card rounded-sm border border-border-subtle bg-surface/40 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
      {/* Chrome Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-background-main/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex items-center gap-1.5 text-text-muted/60 text-xs font-mono font-medium">
            <Terminal size={14} aria-hidden="true" />
            bb84_simulation_workbench.js
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            {jobStatus && (
              <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-sm px-2 py-1 text-xs font-mono text-text-main">
                Job Status: <span className={jobStatus === 'COMPLETED' ? 'text-green-400' : 'text-primary-400 animate-pulse'}>{jobStatus}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-sm px-2 py-1">
            <Cpu size={14} className="text-primary-400" />
            <select 
              className="bg-transparent text-xs font-mono text-text-main outline-none cursor-pointer"
              value={engineInfo?.engine || 'classical'}
              onChange={(e) => changeEngine(e.target.value)}
            >
              <option value="classical">Classical Random</option>
              <option value="qiskit">Qiskit Aer Simulator</option>
              <option value="ibm_quantum">IBM Quantum Hardware</option>
            </select>
          </div>
          <Button  
          size="sm" 
          color="primary" 
          variant="flat" 
          onPress={runSimulation} 
          disabled={loading}
          startContent={loading ? <Spinner size="sm" /> : <Play weight="fill" />}
        >
          {loading ? 'Running...' : 'Run Simulation'}
        </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-8">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Timeline */}
        <WorkbenchTimeline steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />

        {/* Top Split: Detail Panel & Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <StepDetailPanel step={currentStepData} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1">
              <SharedKeyDisplay activeStep={activeStep} simData={simData} />
            </div>
            <div className="flex-[0.8]">
              <QberDisplay activeStep={activeStep} simData={simData} />
            </div>
          </div>
        </div>

        {/* Bottom Core Simulation Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-64">
            <AlicePanel activeStep={activeStep} simData={simData} />
          </div>
          <div className="lg:col-span-4 h-32 lg:h-full">
            <QuantumChannelIllustration activeStep={activeStep} simData={simData} />
          </div>
          <div className="lg:col-span-4 h-64">
            <BobPanel activeStep={activeStep} simData={simData} />
          </div>
        </div>
        
        {/* Auth Result (Appears at end) */}
        <div className="w-full">
          <CircuitSummary activeStep={activeStep} simData={simData} engineInfo={engineInfo} executionTime={executionTime} />
        </div>

        <div className="w-full h-32 mt-4">
          <AuthResultPlaceholder activeStep={activeStep} />
        </div>

        {/* Footer Navigation */}
        <WorkbenchStepNavigation 
          activeStep={activeStep} 
          setActiveStep={setActiveStep} 
          totalSteps={steps.length} 
        />
        
      </div>
    </div>
  );
}
