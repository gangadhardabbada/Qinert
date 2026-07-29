import React, { useState } from 'react';
import { Card, CardBody, Button, Input } from '@heroui/react';
import { Fingerprint } from '@phosphor-icons/react';

export default function AuthControlPanel({ onStart, onTerminate, status }) {
  const [username, setUsername] = useState('alice');
  const [clientId, setClientId] = useState('client_frontend_demo');
  const [engine, setEngine] = useState('classical');

  const isAuthenticating = status === 'authenticating';
  const isAuthenticated = status === 'authenticated';
  const hasFailed = status === 'failed' || status === 'eavesdropping' || status === 'protocol_error';

  const handleAction = () => {
    if (isAuthenticated) {
      onTerminate();
    } else {
      onStart({ username, clientId, engine });
    }
  };

  return (
    <Card className="quantum-card border-border-subtle bg-surface/50 rounded-xl overflow-hidden shadow-2xl">
      <CardBody className="p-8 flex flex-col gap-8">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-text-main flex items-center gap-2">
            <Fingerprint size={24} className="text-primary-400" />
            Authentication Control
          </h3>
          <p className="text-sm text-text-muted mt-2">Initialize a secure quantum channel to authenticate.</p>
        </div>

        <div className="flex flex-col gap-6">
          <Input 
            label="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isDisabled={isAuthenticating || isAuthenticated}
            variant="bordered"
            classNames={{
              label: "text-text-muted",
              input: "text-text-main font-medium"
            }}
          />
          
          <Input 
            label="Client ID" 
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            isDisabled={isAuthenticating || isAuthenticated}
            variant="bordered"
            classNames={{
              label: "text-text-muted",
              input: "text-text-main font-mono text-sm"
            }}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider px-1">Quantum Engine</span>
            <select 
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              disabled={isAuthenticating || isAuthenticated}
              className="bg-transparent border-2 border-border-subtle rounded-xl px-3 py-3 text-sm text-text-main font-medium focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
            >
              <option value="classical" className="bg-surface">Classical BB84</option>
              <option value="qiskit" className="bg-surface">Qiskit Aer</option>
              <option value="ibm_quantum" className="bg-surface">IBM Quantum Hardware</option>
            </select>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-4">
          <Button 
            size="lg" 
            isLoading={isAuthenticating}
            onPress={handleAction}
            className={`w-full transition-all text-white font-medium rounded-sm ${isAuthenticated ? 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(15,98,254,0.4)]'}`}
          >
            {isAuthenticated ? 'Terminate Session' : hasFailed ? 'Retry Authentication' : 'Start Authentication'}
          </Button>
          
          <div className="flex justify-between items-center text-xs text-text-muted font-mono mt-1 px-2">
            <span>Protocol: QPS/1.0</span>
            <span className="flex items-center gap-2">
              Status: 
              <span className={isAuthenticating ? "text-secondary-400 animate-pulse" : isAuthenticated ? "text-primary-400" : hasFailed ? "text-red-400" : ""}>
                {status.toUpperCase()}
              </span>
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
