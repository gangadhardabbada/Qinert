import { motion } from 'framer-motion';
import { fadeInUp } from '../../utils/animations';

/**
 * Empty state panel — used for placeholder/locked sections.
 * @param {React.ComponentType} icon - Phosphor icon component
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} action - Optional CTA element
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex flex-col items-center justify-center text-center py-20 px-8"
    >
      {Icon && (
        <div
          className="w-16 h-16 rounded-sm bg-surface border border-border-subtle flex items-center justify-center mb-6"
          aria-hidden="true"
        >
          <Icon size={28} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-xl font-medium text-text-main mb-2">{title}</h3>
      <p className="text-text-muted max-w-sm leading-relaxed text-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
