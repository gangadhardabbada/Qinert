/**
 * PageWrapper — consistent page container with ambient background effects.
 * Wrap every page's root element with this.
 */
export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen bg-hex-pattern selection:bg-primary-500/20 ${className}`}>
      {/* Ambient radial glows — fixed so they don't scroll */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,rgba(15,98,254,0.05)_0%,transparent_65%)] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(138,63,252,0.03)_0%,transparent_65%)] rounded-full" />
      </div>

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
