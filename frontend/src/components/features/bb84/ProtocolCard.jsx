import { motion } from 'framer-motion';
import Badge from '../../shared/Badge';

/**
 * @param {number} step - Step number
 * @param {string} title - Card title
 * @param {string} description - What this phase does
 * @param {string} purpose - Why it matters
 * @param {string} [implementationNote] - What Milestone 2 will add
 * @param {number} [delay] - Animation stagger delay
 */
export default function ProtocolCard({ step, title, description, purpose, implementationNote, delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className="quantum-card rounded-sm p-6 border border-border-subtle hover:border-primary-700/40 transition-colors flex flex-col gap-4 h-full"
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-text-muted/50 bg-surface border border-border-subtle px-2 py-0.5 rounded-sm shrink-0">
          {String(step).padStart(2, '0')}
        </span>
        <h3 className="font-medium text-text-main leading-snug">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-text-muted text-sm leading-relaxed flex-1">{description}</p>

      {/* Purpose */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-xs font-mono text-text-muted/50 uppercase tracking-wider mb-1.5">Purpose</p>
        <p className="text-sm text-text-muted/80">{purpose}</p>
      </div>

      {/* Milestone 2 note */}
      {implementationNote && (
        <div className="p-3 bg-secondary-500/5 border border-secondary-500/20 rounded-sm">
          <p className="text-xs font-mono text-secondary-400 leading-relaxed">
            <span className="text-secondary-300 font-medium">M2 →</span> {implementationNote}
          </p>
        </div>
      )}
    </motion.article>
  );
}
