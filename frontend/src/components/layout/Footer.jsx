import { Link } from 'react-router-dom';
import { Hexagon, GithubLogo, TwitterLogo, LinkedinLogo } from '@phosphor-icons/react';

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'BB84 Explorer', to: '/bb84-explorer' },
      { label: 'Authenticate', to: '/authenticate' },
      { label: 'Documentation', to: '/documentation' },
    ],
  },
  {
    title: 'Documentation',
    links: [
      { label: 'Introduction', to: '/documentation#introduction' },
      { label: 'BB84 Protocol', to: '/documentation#bb84' },
      { label: 'Architecture', to: '/documentation#architecture' },
      { label: 'API Reference', to: '/documentation#api' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Research', to: '/research' },
      { label: 'GitHub', href: 'https://github.com', external: true },
      { label: 'Open Source', href: 'https://github.com', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

function FooterLink({ link }) {
  const cls = 'text-sm text-text-muted hover:text-text-main transition-colors';
  if (link.href) {
    return (
      <a href={link.href} target={link.external ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>
        {link.label}
      </a>
    );
  }
  return <Link to={link.to} className={cls}>{link.label}</Link>;
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background-secondary border-t border-border-subtle" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-80 transition-opacity">
              <Hexagon size={20} className="text-primary-500" weight="fill" aria-hidden="true" />
              <span className="font-bold text-[17px] tracking-tight text-text-main">Qinert</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6 max-w-65">
              Quantum-secure authentication using the BB84 Key Distribution protocol. Built for the post-quantum era.
            </p>
            <div className="flex gap-2">
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="p-2 rounded-sm text-text-muted hover:text-text-main hover:bg-surface transition-all"
              >
                <GithubLogo size={17} />
              </a>
              <a
                href="#"
                aria-label="Twitter / X"
                className="p-2 rounded-sm text-text-muted hover:text-text-main hover:bg-surface transition-all"
              >
                <TwitterLogo size={17} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="p-2 rounded-sm text-text-muted hover:text-text-main hover:bg-surface transition-all"
              >
                <LinkedinLogo size={17} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-text-main font-medium text-sm mb-5">{col.title}</h3>
              <ul className="flex flex-col gap-3" aria-label={`${col.title} links`}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted/50 order-last md:order-first">
            © {year} Qinert. All rights reserved.
          </p>
          <p className="text-xs text-text-muted/40 max-w-lg text-center leading-relaxed">
            <strong className="text-text-muted/60">Research Notice:</strong> Qinert is an experimental quantum authentication
            research platform. Not intended for production use without verified quantum hardware integration.
          </p>
          <div className="flex gap-6 text-xs text-text-muted/50">
            <Link to="/privacy" className="hover:text-text-main transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-text-main transition-colors">Terms</Link>
            <a href="https://github.com" className="hover:text-text-main transition-colors">Open Source</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
