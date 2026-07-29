import { Info, Warning, CheckCircle, Lightning } from '@phosphor-icons/react';

const typeConfig = {
  info: {
    Icon: Info,
    className: 'bg-primary-500/5 border-primary-500/25 text-primary-300',
    iconClass: 'text-primary-400',
  },
  warning: {
    Icon: Warning,
    className: 'bg-yellow-500/5 border-yellow-500/25 text-yellow-300',
    iconClass: 'text-yellow-400',
  },
  success: {
    Icon: CheckCircle,
    className: 'bg-green-500/5 border-green-500/25 text-green-300',
    iconClass: 'text-green-400',
  },
  quantum: {
    Icon: Lightning,
    className: 'bg-secondary-500/5 border-secondary-500/25 text-secondary-300',
    iconClass: 'text-secondary-400',
  },
};

/**
 * @param {'info' | 'warning' | 'success' | 'quantum'} type
 * @param {string} title - Optional bold heading
 * @param children - Callout body content
 */
export default function Callout({ type = 'info', title, children }) {
  const { Icon, className, iconClass } = typeConfig[type] ?? typeConfig.info;

  return (
    <div className={`flex gap-4 p-4 border rounded-sm my-6 ${className}`} role="note">
      <Icon size={18} className={`shrink-0 mt-0.5 ${iconClass}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-medium text-sm mb-1 text-text-main">{title}</p>
        )}
        <div className="text-sm text-text-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
