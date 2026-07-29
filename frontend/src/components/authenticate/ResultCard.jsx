import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, WarningCircle, XCircle, Clock, ArrowsClockwise } from '@phosphor-icons/react';

export default function ResultCard({ status }) {
  
  const getResultConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          icon: <Clock size={32} className="text-text-muted" />,
          title: "Waiting for Authentication",
          desc: "Click Start to initiate the BB84 protocol sequence.",
          border: "border-border-subtle",
          bg: "bg-surface/30"
        };
      case 'authenticating':
        return {
          icon: <ArrowsClockwise size={32} className="text-secondary-400 animate-spin" />,
          title: "Authenticating...",
          desc: "Establishing secure quantum keys and measuring QBER.",
          border: "border-secondary-500/50 shadow-[0_0_20px_rgba(138,63,252,0.15)]",
          bg: "bg-secondary-900/10"
        };
      case 'authenticated':
        return {
          icon: <ShieldCheck size={32} className="text-primary-400" />,
          title: "Authentication Successful",
          desc: "Quantum state verified. Zero eavesdropping detected. Secure connection established.",
          border: "border-primary-500/50 shadow-[0_0_20px_rgba(15,98,254,0.15)]",
          bg: "bg-primary-900/10"
        };
      case 'failed':
      case 'protocol_error':
        return {
          icon: <XCircle size={32} className="text-red-400" />,
          title: "Authentication Failed",
          desc: "Unable to establish secure keys or protocol error occurred.",
          border: "border-red-500/50 shadow-[0_0_20px_rgba(248,113,113,0.15)]",
          bg: "bg-red-900/10"
        };
      case 'eavesdropping':
        return {
          icon: <WarningCircle size={32} className="text-yellow-400" />,
          title: "Eavesdropping Detected",
          desc: "High Quantum Bit Error Rate (QBER). Protocol aborted to maintain security.",
          border: "border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.15)]",
          bg: "bg-yellow-900/10"
        };
      default:
        return {
          icon: <Clock size={32} />,
          title: "Unknown State",
          desc: "",
          border: "border-border-subtle",
          bg: "bg-surface/30"
        };
    }
  };

  const config = getResultConfig();

  return (
    <Card className={`quantum-card rounded-xl transition-all duration-500 ${config.border} ${config.bg}`}>
      <CardBody className="p-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-6"
          >
            <div className="shrink-0 p-4 rounded-full bg-background-main border border-border-subtle">
              {config.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-text-main">{config.title}</h3>
              <p className="text-text-muted mt-1 text-sm leading-relaxed">{config.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}
