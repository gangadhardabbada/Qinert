import React, { useState } from 'react';
import { getApiBaseUrl } from '../config';
import PageWrapper from '../components/shared/PageWrapper';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { ShieldWarning, Play, CheckCircle, XCircle } from '@phosphor-icons/react';
import { QinertClient } from '@qinert/client';

export default function SecurityDemo() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const qinert = React.useMemo(() => new QinertClient({ baseURL: getApiBaseUrl() }), []);

  const scenarios = [
    {
      id: 'normal',
      title: 'Normal Authentication',
      stage: 'End-to-End',
      expected: 'Authentication succeeds.',
      execute: async () => {
        await qinert.changeEngine('classical');
        await qinert.initiate(['bb84']);
        await qinert.handshake({ clientId: 'demo_client' });
        await qinert.authenticate();
      }
    },
    {
      id: 'qber',
      title: 'Elevated QBER',
      stage: 'Key Establishment (BB84)',
      expected: 'Key establishment is rejected.',
      execute: async () => {
        await qinert.changeEngine('classical');
        await qinert.initiate(['bb84']);
        await qinert.handshake({ clientId: 'demo_client', demoAction: 'eavesdrop' });
      }
    },
    {
      id: 'invalid_proof',
      title: 'Invalid Authentication Proof',
      stage: 'Proof Verification',
      expected: 'Authentication rejected.',
      execute: async () => {
        await qinert.changeEngine('classical');
        await qinert.initiate(['bb84']);
        await qinert.handshake({ clientId: 'demo_client' });
        await qinert.authenticate({ invalidProof: true });
      }
    },
    {
      id: 'replay',
      title: 'Replay Attempt',
      stage: 'Proof Verification',
      expected: 'Replay detected and rejected.',
      execute: async () => {
        await qinert.changeEngine('classical');
        await qinert.initiate(['bb84']);
        await qinert.handshake({ clientId: 'demo_client' });
        await qinert.authenticate(); // First succeeds
        await qinert.authenticate(); // Replay fails
      }
    },
    {
      id: 'expired',
      title: 'Expired Challenge',
      stage: 'Proof Verification',
      expected: 'Authentication rejected.',
      execute: async () => {
        await qinert.changeEngine('classical');
        await qinert.initiate(['bb84']);
        await qinert.handshake({ clientId: 'demo_client', demoAction: 'expired' });
        await qinert.authenticate();
      }
    }
  ];

  const handleRun = async (scenario) => {
    setActiveScenario(scenario.id);
    setStatus('running');
    setResult(null);
    setErrorDetails(null);
    qinert.terminateSession(); // Reset state

    try {
      await scenario.execute();
      setStatus('completed');
      setResult('Success');
    } catch (err) {
      console.error(err);
      setStatus('completed');
      setResult('Rejected');
      setErrorDetails({
        code: err?.code || 'UNKNOWN_ERROR',
        message: err?.message || 'An unknown error occurred.'
      });
    }
  };

  return (
    <PageWrapper>
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
            <div className="p-3 bg-red-900/20 text-red-400 rounded-lg">
              <ShieldWarning size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-main">Security Demonstration</h1>
              <p className="text-text-muted mt-2 max-w-2xl">
                This controlled environment simulates protocol attacks and disturbances to demonstrate Qinert's security mechanisms. These scenarios use development test hooks and do not weaken normal authentication flow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {scenarios.map(scenario => {
              const isActive = activeScenario === scenario.id;
              const isRunning = isActive && status === 'running';
              const isCompleted = isActive && status === 'completed';

              return (
                <Card key={scenario.id} className={`border border-border-subtle rounded-xl overflow-hidden transition-all ${isActive ? 'ring-2 ring-primary-500/50 bg-surface/50' : 'bg-surface/20'}`}>
                  <CardBody className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold tracking-tight text-text-main">{scenario.title}</h3>
                          <Chip size="sm" variant="flat" color="primary" className="bg-primary-500/10 text-primary-400 text-xs">
                            {scenario.stage}
                          </Chip>
                        </div>
                        <p className="text-text-muted text-sm mb-4">
                          <span className="font-semibold text-text-main">Expected:</span> {scenario.expected}
                        </p>
                      </div>
                      
                      <Button
                        color="primary"
                        onPress={() => handleRun(scenario)}
                        isLoading={isRunning}
                        startContent={!isRunning && <Play weight="fill" />}
                        className="bg-primary-600 hover:bg-primary-500 text-white rounded-md shrink-0 w-full md:w-auto"
                      >
                        Run Scenario
                      </Button>
                    </div>

                    {isCompleted && (
                      <div className="mt-6 p-4 rounded-lg bg-background-main border border-border-subtle">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-1">Actual Result</span>
                            <div className="flex items-center gap-2">
                              {result === 'Success' ? (
                                <CheckCircle size={20} className="text-primary-400" />
                              ) : (
                                <XCircle size={20} className="text-red-400" />
                              )}
                              <span className={`font-semibold ${result === 'Success' ? 'text-primary-400' : 'text-red-400'}`}>
                                {result}
                              </span>
                            </div>
                          </div>
                          
                          {errorDetails && (
                            <div>
                              <span className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-1">QPS Error Code</span>
                              <span className="font-mono text-sm text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                                {errorDetails.code}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {errorDetails && (
                          <div className="mt-4 pt-4 border-t border-border-subtle/50">
                            <span className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-1">Explanation</span>
                            <p className="text-sm text-text-main">{errorDetails.message}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
