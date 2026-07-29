import React from 'react';
import { motion } from 'framer-motion';

export default function QuantumChannel({ isActive, currentStep }) {
  // We'll visualize the channel as a vertical tube where photons travel from top to bottom
  const isTransmitting = isActive && currentStep >= 3 && currentStep <= 5;

  return (
    <div className="w-full h-full min-h-100 flex items-center justify-center relative">
      
      {/* Alice (Top) */}
      <div className="absolute top-0 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/50 flex items-center justify-center bg-surface/50 shadow-[0_0_15px_rgba(15,98,254,0.2)]">
          <span className="text-xs font-mono text-primary-400">ALICE</span>
        </div>
      </div>

      {/* The Channel */}
      <div className="absolute top-16 bottom-16 w-32 border-x border-border-subtle/30 bg-[linear-gradient(to_bottom,rgba(15,98,254,0.05),rgba(138,63,252,0.05))] overflow-hidden flex justify-center">
        
        {/* Grid lines in channel */}
        <div className="w-full h-full absolute inset-0 opacity-10 bg-hex-pattern" />

        {/* Photons moving down */}
        {isTransmitting && [...Array(8)].map((_, i) => (
          <motion.div
            key={`photon-${i}`}
            className="absolute w-2 h-2 rounded-full bg-secondary-400 shadow-[0_0_10px_#8A3FFC]"
            style={{ left: `${15 + Math.random() * 70}%` }}
            initial={{ top: "-10%", opacity: 0 }}
            animate={{ top: "110%", opacity: [0, 1, 1, 0] }}
            transition={{ 
              duration: 1.5 + Math.random() * 0.5, 
              repeat: Infinity, 
              delay: Math.random() * 1.5,
              ease: "linear"
            }}
          />
        ))}

        {/* Wave effect */}
        {isTransmitting && (
          <motion.div
            className="w-full h-32 bg-[radial-gradient(ellipse_at_center,rgba(15,98,254,0.4)_0%,transparent_70%)] opacity-50 blur-md absolute"
            animate={{ top: ["-20%", "120%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Bob (Bottom) */}
      <div className="absolute bottom-0 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-2 border-secondary-500/50 flex items-center justify-center bg-surface/50 shadow-[0_0_15px_rgba(138,63,252,0.2)]">
          <span className="text-xs font-mono text-secondary-400">BOB</span>
        </div>
      </div>
      
    </div>
  );
}
