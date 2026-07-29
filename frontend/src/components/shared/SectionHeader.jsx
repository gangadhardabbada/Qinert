import { motion } from 'framer-motion';
import { fadeInUp, defaultViewport } from '../../utils/animations';

/**
 * @param {string} label - Small eyebrow label (mono text above title)
 * @param {string} title - Main heading
 * @param {string} subtitle - Supporting description text
 * @param {boolean} centered - Center-align everything
 * @param {string} className - Additional classes
 */
export default function SectionHeader({ label, title, subtitle, centered = false, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeInUp}
      className={`mb-16 ${centered ? 'text-center' : ''} ${className}`}
    >
      {label && (
        <span className="text-xs font-mono font-medium tracking-[0.2em] uppercase text-primary-400 mb-3 block">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-main leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-text-muted mt-4 text-lg leading-relaxed ${
            centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
