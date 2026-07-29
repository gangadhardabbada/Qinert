import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from '@heroui/react';
import { motion } from 'framer-motion';
import { Hexagon, GithubLogo, ArrowRight } from '@phosphor-icons/react';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'BB84 Explorer', path: '/bb84-explorer' },
  { name: 'Documentation', path: '/documentation' },
  { name: 'About', path: '/about' },
  { name: 'Security Demo', path: '/security-demo' },
  { name: 'Experimental Lab', path: '/experimental-lab' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <HeroNavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      position="sticky"
      className={`transition-all duration-300 ${
        scrolled
          ? 'bg-background-main/85 backdrop-blur-xl border-b border-white/6 shadow-[0_1px_0_rgba(255,255,255,0.03)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* ── Brand + Mobile Toggle ─────────────────────────────────────── */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="sm:hidden text-text-muted"
        />
        <NavbarBrand as={Link} to="/" className="gap-2.5 hover:opacity-80 transition-opacity">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-2.5"
          >
            <Hexagon className="text-primary-500" size={24} weight="fill" aria-hidden="true" />
            <span className="font-bold text-[17px] tracking-tight text-text-main">Qinert</span>
          </motion.div>
        </NavbarBrand>
      </NavbarContent>

      {/* ── Desktop Navigation ────────────────────────────────────────── */}
      <NavbarContent className="hidden sm:flex gap-0.5" justify="center">
        {NAV_LINKS.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <NavbarItem key={item.path}>
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
              >
                <Link
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-sm transition-colors ${
                    isActive ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-highlight"
                      className="absolute inset-0 bg-surface border border-border-subtle rounded-sm -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              </motion.div>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* ── Right Actions ─────────────────────────────────────────────── */}
      <NavbarContent justify="end" className="gap-1.5">
        {/* GitHub */}
        <NavbarItem className="hidden md:flex">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Qinert on GitHub"
            className="p-2 rounded-sm text-text-muted hover:text-text-main hover:bg-surface transition-all"
          >
            <GithubLogo size={19} />
          </a>
        </NavbarItem>

        {/* Authenticate — text link on sm, full button on md+ */}
        <NavbarItem className="hidden sm:flex md:hidden">
          <Link
            to="/authenticate"
            className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            Authenticate
          </Link>
        </NavbarItem>

        {/* Primary CTA */}
        <NavbarItem>
          <Button
            as={Link}
            to="/authenticate"
            size="sm"
            className="hidden md:flex bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-sm px-4 items-center gap-1.5 transition-all hover:shadow-[0_0_20px_rgba(15,98,254,0.35)]"
            endContent={<ArrowRight size={13} aria-hidden="true" />}
          >
            Start Authentication
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      <NavbarMenu className="bg-background-main/96 backdrop-blur-xl pt-6 pb-8 border-t border-white/6">
        <div className="flex flex-col gap-1 max-w-sm mx-auto w-full">
          {NAV_LINKS.map((item) => (
            <NavbarMenuItem key={item.path}>
              <Link
                to={item.path}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                className={`flex items-center px-4 py-3.5 text-base font-medium rounded-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                    : 'text-text-muted hover:text-text-main hover:bg-surface'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}

          <NavbarMenuItem>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-3.5 text-base font-medium text-text-muted hover:text-text-main hover:bg-surface rounded-sm transition-colors"
            >
              <GithubLogo size={18} aria-hidden="true" />
              GitHub
            </a>
          </NavbarMenuItem>

          <div className="mt-4 px-1">
            <Button
              as={Link}
              to="/authenticate"
              className="w-full bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-sm"
              endContent={<ArrowRight size={15} aria-hidden="true" />}
              onClick={() => setIsMenuOpen(false)}
            >
              Start Authentication
            </Button>
          </div>
        </div>
      </NavbarMenu>
    </HeroNavbar>
  );
}
