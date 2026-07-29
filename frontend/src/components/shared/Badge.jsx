const variantStyles = {
  primary:   'bg-primary-500/10 text-primary-400 border-primary-500/20',
  secondary: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20',
  accent:    'bg-accent-500/10 text-accent-400 border-accent-500/20',
  muted:     'bg-surface text-text-muted border-border-subtle',
  success:   'bg-green-500/10 text-green-400 border-green-500/20',
  warning:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  coming:    'bg-secondary-500/10 text-secondary-300 border-secondary-500/30',
};

/**
 * @param {keyof variantStyles} variant
 * @param {string} className - Additional classes
 */
export default function Badge({ children, variant = 'muted', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-medium border rounded-sm whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
