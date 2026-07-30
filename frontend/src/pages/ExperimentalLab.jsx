import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../config';
import { Button, Input } from '@heroui/react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Lightning, Info, Warning, ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { QinertClient } from '@qinert/client';

export default function ExperimentalLab() {
  const [bits, setBits] = useState(16);
  const [shots, setShots] = useState(128);
  const [experimentId, setExperimentId] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const qinert = React.useMemo(() => new QinertClient({ baseURL: getApiBaseUrl(), timeout: 30000 }), []);

  const startExperiment = async () => {
    setLoading(true);
    setError(null);
    setComparison(null);
    try {
      const res = await qinert.runExperiment({
        engines: ['classical', 'qiskit_aer', 'ibm_quantum'],
        number_of_bits: parseInt(bits),
        shots: parseInt(shots)
      });
      setExperimentId(res.experiment_id);
    } catch (err) {
      const backendError = err.response?.data?.detail || err.message;
      setError(`Unable to create experiment. Backend returned: ${backendError}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!experimentId) return;

    let interval;
    const fetchStatus = async () => {
      try {
        const data = await qinert.getExperimentComparison(experimentId);
        setComparison(data);
        
        // Check if finished
        const engines = Object.values(data.engines || {});
        const isFinished = engines.length > 0 && engines.every(e => e.status === 'COMPLETED' || e.status === 'FAILED');
        
        if (isFinished) {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch experiment status:", err);
        setError("Unable to fetch experiment status. Check if backend is running.");
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [experimentId, qinert]);

  const renderCard = (engineName, title, icon, colorClass, data) => {
    return (
      <div className="flex flex-col quantum-card bg-surface/40 border border-border-subtle rounded-sm p-5 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-[0.05] blur-2xl rounded-full translate-x-1/2 -translate-y-1/2`}></div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-sm bg-surface-raised border border-border-subtle ${colorClass}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-main">{title}</h3>
            <p className="text-xs font-mono text-text-muted">
              {data?.backend || 'Local Executor'}
            </p>
          </div>
        </div>

        {!data ? (
          <div className="grow flex items-center justify-center text-text-muted text-sm min-h-40">
            Waiting for execution...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle/50">
              <span className="text-sm text-text-muted">Status</span>
              <span className={`text-xs font-mono font-bold ${
                data.status === 'COMPLETED' ? 'text-green-400' :
                data.status === 'FAILED' ? 'text-red-400' :
                'text-primary-400 animate-pulse'
              }`}>
                {data.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle/50">
              <span className="text-sm text-text-muted">Sifted Key Length</span>
              <span className="text-sm text-text-main font-mono">{data.sifted_key_length ?? '--'}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle/50">
              <span className="text-sm text-text-muted">QBER</span>
              <span className="text-sm text-text-main font-mono">
                {data.qber !== null && data.qber !== undefined ? `${(data.qber * 100).toFixed(1)}%` : '--'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Execution Time</span>
              <span className="text-sm text-text-main font-mono">
                {data.execution_time_ms ? `${data.execution_time_ms}ms` : '--'}
              </span>
            </div>

            {data.backend === 'fake_manila' && !data.error_message && (
              <div className="mt-4 p-3 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono">
                IBM Quantum Runtime unavailable. Running simulator instead.
              </div>
            )}
            
            {data.error_message && (
              <div className="mt-4 p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {data.error_message}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main mb-4">
          Quantum Experimental Lab
        </h1>
        <p className="text-text-muted text-lg">
          Validate BB84 semantics side-by-side across Classical, Qiskit Simulator, and real IBM Quantum Hardware execution.
        </p>
      </div>

      {/* Educational Banner */}
      <div className="mb-10 p-5 rounded-sm bg-surface-raised border border-border-subtle shadow-lg flex gap-4">
        <Info size={24} className="text-primary-400 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-main">Experimental Context & Noise Interpretation</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            IBM Quantum execution demonstrates BB84-related circuits on a real quantum processor. It does <strong className="text-text-main font-medium">not</strong> establish a physical QKD channel between Alice and Bob. High QBER on real hardware represents natural gate and measurement noise, distinguishing it from intentional protocol disturbance or simulated perfection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="quantum-card p-5 bg-surface/40 border border-border-subtle rounded-sm">
            <h3 className="text-sm font-semibold text-text-main mb-4 uppercase tracking-wider">Experiment Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Number of Bits</label>
                <Input 
                  type="number"
                  min={8}
                  max={256}
                  value={bits}
                  onChange={(e) => setBits(e.target.value)}
                  classNames={{
                    input: "font-mono text-sm",
                    inputWrapper: "bg-surface border-border-subtle"
                  }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Hardware Shots</label>
                <Input 
                  type="number"
                  min={1}
                  max={1024}
                  value={shots}
                  onChange={(e) => setShots(e.target.value)}
                  classNames={{
                    input: "font-mono text-sm",
                    inputWrapper: "bg-surface border-border-subtle"
                  }}
                />
              </div>

              <Button 
                className="w-full bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-sm mt-4"
                onClick={startExperiment}
                isLoading={loading}
                endContent={!loading && <ArrowRight size={16} />}
              >
                {loading ? 'Executing...' : 'Run Experiment'}
              </Button>

              {error && (
                <div className="text-red-400 text-xs mt-2 font-mono">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results View */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderCard(
              'classical', 
              'Classical Reference', 
              <Terminal size={20} weight="duotone" />, 
              'text-blue-400', 
              comparison?.engines?.classical
            )}
            
            {renderCard(
              'qiskit_aer', 
              'Qiskit Aer Simulator', 
              <Cpu size={20} weight="duotone" />, 
              'text-purple-400', 
              comparison?.engines?.qiskit_aer
            )}
            
            {renderCard(
              'ibm_quantum', 
              'IBM Quantum Hardware', 
              <Lightning size={20} weight="duotone" />, 
              'text-yellow-400', 
              comparison?.engines?.ibm_quantum
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
