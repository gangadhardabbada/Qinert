import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../../../utils/animations';

const FACTS = [
  { label: 'Protocol', value: 'BB84' },
  { label: 'Invented', value: '1984' },
  { label: 'Inventors', value: 'Bennett & Brassard' },
  { label: 'Published at', value: 'IBM Research, New York' },
  { label: 'Participants', value: 'Alice & Bob' },
  { label: 'Encoding Bases', value: 'Rectilinear (+) and Diagonal (×)' },
  { label: 'Quantum States Used', value: '4 photon polarizations' },
  { label: 'Security Principle', value: 'Measurement Disturbance' },
  { label: 'Theoretical Guarantee', value: 'No-Cloning Theorem' },
  { label: 'Key Type', value: 'Symmetric Shared Secret' },
  { label: 'QBER Threshold', value: '< 11% (theoretical)' },
  { label: 'Classical Channel Required', value: 'Yes (for basis comparison)' },
];

export default function ProtocolFacts() {
  return (
    <motion.dl
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-label="BB84 protocol facts"
    >
      {FACTS.map((fact, idx) => (
        <motion.div
          key={idx}
          variants={fadeInUp}
          className="quantum-card rounded-sm p-5 border border-border-subtle hover:border-primary-700/30 transition-colors"
        >
          <dt className="text-[10px] font-mono text-text-muted/55 uppercase tracking-[0.18em] mb-2">
            {fact.label}
          </dt>
          <dd className="text-text-main font-medium text-[15px] leading-snug">{fact.value}</dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}
