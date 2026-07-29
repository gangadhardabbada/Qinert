import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import {
  ArrowRight, CaretRight, BookOpen, Code,
  Lock
} from '@phosphor-icons/react';
import { useScrollSpy } from '../hooks/useScrollSpy';
import FAQAccordion from '../components/shared/FAQAccordion';
import Callout from '../components/shared/Callout';
import Badge from '../components/shared/Badge';

/* ─────────────────────────────────── sidebar nav structure ── */

const SIDEBAR_NAV = [
  { id: 'introduction',   label: 'Introduction',            level: 0 },
  { id: 'authentication', label: 'Authentication',          level: 0 },
  { id: 'quantum-basics', label: 'Quantum Basics',          level: 0 },
  { id: 'bits',           label: 'Bits',                    level: 1 },
  { id: 'qubits',         label: 'Qubits',                  level: 1 },
  { id: 'measurement',    label: 'Measurement',             level: 1 },
  { id: 'superposition',  label: 'Superposition',           level: 1 },
  { id: 'bb84',           label: 'BB84 Protocol',           level: 0 },
  { id: 'qkd',            label: 'Quantum Key Distribution',level: 0 },
  { id: 'qber',           label: 'QBER',                    level: 0 },
  { id: 'qiskit',         label: 'Qiskit',                  level: 0 },
  { id: 'architecture',   label: 'Architecture',            level: 0 },
  { id: 'roadmap',        label: 'Roadmap',                 level: 0 },
  { id: 'api',            label: 'API Reference',           level: 0 },
  { id: 'faq',            label: 'FAQ',                     level: 0 },
];

const SECTION_IDS = SIDEBAR_NAV.map((n) => n.id);

/* ─────────────────────────────────── helper sub-components ── */

function DocSection({ id, children, className = '' }) {
  return (
    <section id={id} className={`py-12 scroll-mt-24 ${className}`} aria-labelledby={`${id}-heading`}>
      {children}
    </section>
  );
}

function DocH1({ id, children }) {
  return (
    <h1 id={`${id}-heading`} className="text-3xl font-semibold text-text-main mb-4 tracking-tight">
      {children}
    </h1>
  );
}

function DocH2({ id, children }) {
  return (
    <h2 id={`${id}-heading`} className="text-2xl font-semibold text-text-main mt-10 mb-4 tracking-tight">
      {children}
    </h2>
  );
}

function DocH3({ children }) {
  return (
    <h3 className="text-lg font-semibold text-text-main mt-8 mb-3">{children}</h3>
  );
}

function DocP({ children, className = '' }) {
  return (
    <p className={`text-text-muted leading-[1.8] mb-4 ${className}`}>{children}</p>
  );
}

function DocCode({ children }) {
  return (
    <code className="font-mono text-primary-300 bg-primary-500/8 border border-primary-500/15 px-1.5 py-0.5 rounded-sm text-[0.85em]">
      {children}
    </code>
  );
}

function CodeBlock({ lang = 'python', children }) {
  return (
    <div className="my-6 rounded-sm overflow-hidden border border-border-subtle">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface/60 border-b border-border-subtle">
        <span className="text-xs font-mono text-text-muted/50">{lang}</span>
        <span className="text-[10px] font-mono text-text-muted/30">Milestone 2</span>
      </div>
      <pre className="p-5 overflow-x-auto bg-background-main/60 font-mono text-sm text-primary-200 leading-loose">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Divider() {
  return <div className="my-12 h-px bg-border-subtle" aria-hidden="true" />;
}

const DOC_FAQ = [
  {
    question: 'Is Qinert production-ready?',
    answer:
      'Qinert is currently in Milestone 1 (frontend) development. Milestone 2 will add the BB84 JavaScript simulation engine and FastAPI backend. Milestone 3 will integrate real IBM Quantum hardware. The platform is not yet production-ready.',
  },
  {
    question: 'What quantum hardware does Qinert use?',
    answer:
      'Qinert is designed to connect to IBM Quantum Runtime via Qiskit. In Milestone 2, a JavaScript simulation runs in-browser. In Milestone 3, actual IBM superconducting quantum processors will be used for key generation.',
  },
  {
    question: 'Can I use Qinert with my existing app?',
    answer:
      'The API (Milestone 2+) will expose REST endpoints for integrating quantum authentication into existing applications. The frontend will provide an SDK wrapper once the backend is complete.',
  },
  {
    question: 'What is the QBER threshold in Qinert?',
    answer:
      'Qinert applies the standard theoretical BB84 threshold of ~11%. Sessions with QBER at or above this value are aborted. The exact threshold may be adjusted in later milestones based on hardware noise characteristics.',
  },
  {
    question: 'Is the source code available?',
    answer:
      'Yes. Qinert is an open-source research project. The frontend code is available on GitHub. Backend and quantum engine code will be published as each milestone is completed.',
  },
  {
    question: 'What is privacy amplification?',
    answer:
      'Privacy amplification is a classical post-processing step applied to the sifted BB84 key. A universal hash function compresses the key to remove any partial information a potential eavesdropper may have obtained during transmission. It ensures the final key is information-theoretically secret.',
  },
];

/* ─────────────────────────────────────── main component ── */

export default function Documentation() {
  const activeId = useScrollSpy(SECTION_IDS, 100);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: 'smooth' });
    setMobileNavOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-hex-pattern selection:bg-primary-500/20">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(15,98,254,0.04)_0%,transparent_65%)] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24">
        {/* ── Page header ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-xs font-mono text-text-muted/50 uppercase tracking-[0.2em] mb-3 block">
            Qinert / Documentation
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-text-main mb-4">
            Documentation
          </h1>
          <p className="text-text-muted text-lg max-w-xl leading-relaxed">
            Learn how Qinert implements quantum-secure authentication using the BB84 Quantum Key
            Distribution protocol.
          </p>
        </motion.div>

        {/* ── Mobile sidebar toggle ─────────────── */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main border border-border-subtle rounded-sm px-4 py-2 bg-surface/40 transition-colors"
            aria-expanded={mobileNavOpen}
            aria-controls="doc-sidebar"
          >
            <BookOpen size={15} aria-hidden="true" />
            {mobileNavOpen ? 'Hide Contents' : 'Show Contents'}
          </button>
          {mobileNavOpen && (
            <nav id="doc-sidebar-mobile" className="mt-3 border border-border-subtle rounded-sm bg-surface/50 p-4">
              {SIDEBAR_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full text-left py-1.5 text-sm transition-colors ${
                    item.level === 1 ? 'pl-4' : 'pl-0'
                  } ${activeId === item.id ? 'text-primary-400' : 'text-text-muted hover:text-text-main'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="flex gap-12 xl:gap-16">
          {/* ── Sticky sidebar ───────────────────── */}
          <aside
            id="doc-sidebar"
            className="hidden lg:block w-52 xl:w-60 shrink-0"
            aria-label="Documentation navigation"
          >
            <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin">
              <p className="text-[10px] font-mono text-text-muted/40 uppercase tracking-[0.18em] mb-4">
                Contents
              </p>
              <nav>
                {SIDEBAR_NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    aria-current={activeId === item.id ? 'location' : undefined}
                    className={`block w-full text-left py-1.5 px-2 rounded-sm text-sm transition-all mb-0.5 ${
                      item.level === 1 ? 'pl-5 text-[13px]' : ''
                    } ${
                      activeId === item.id
                        ? 'text-primary-400 bg-primary-500/8 border-l-2 border-primary-500 font-medium'
                        : 'text-text-muted hover:text-text-main hover:bg-surface/40 border-l-2 border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-border-subtle">
                <p className="text-[10px] font-mono text-text-muted/40 uppercase tracking-[0.18em] mb-3">Quick links</p>
                <div className="flex flex-col gap-2">
                  <Link to="/bb84-explorer" className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <CaretRight size={11} aria-hidden="true" /> BB84 Explorer
                  </Link>
                  <Link to="/authenticate" className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <CaretRight size={11} aria-hidden="true" /> Authenticate
                  </Link>
                  <a href="https://github.com" className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <CaretRight size={11} aria-hidden="true" /> GitHub
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────── */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {/* ────────────── INTRODUCTION */}
            <DocSection id="introduction">
              <DocH1 id="introduction">Introduction</DocH1>
              <DocP>
                Qinert is an experimental quantum authentication platform that demonstrates secure
                identity verification using the <strong className="text-text-main">BB84 Quantum Key Distribution</strong> protocol.
                It is designed as a research and educational tool showing how quantum mechanics can
                replace classical cryptographic assumptions with physical security guarantees.
              </DocP>
              <DocP>
                Unlike traditional authentication systems that rely on the computational hardness
                of problems like integer factorization, Qinert's security is grounded in the{' '}
                <em>laws of physics</em> — specifically the Heisenberg uncertainty principle and
                the quantum no-cloning theorem.
              </DocP>
              <Callout type="info" title="Research Platform">
                Qinert is an academic demonstration platform. It is not yet production-ready.
                Real quantum hardware integration arrives in Milestone 3.
              </Callout>
              <DocP>
                The current Milestone 1 release provides a complete frontend for the system. The
                BB84 Explorer page visually explains the protocol. Milestone 2 adds the JavaScript
                simulation engine and FastAPI backend. Milestone 3 connects to IBM Quantum Runtime.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── AUTHENTICATION */}
            <DocSection id="authentication">
              <DocH2 id="authentication">Authentication</DocH2>
              <DocP>
                Traditional authentication — passwords, OTPs, biometrics — relies on secrets
                stored or transmitted over classical channels. These are vulnerable to credential
                theft, man-in-the-middle attacks, and will be broken by sufficiently powerful
                quantum computers running Grover's or Shor's algorithms.
              </DocP>
              <DocH3>How Qinert Authentication Differs</DocH3>
              <DocP>
                Qinert generates a fresh authentication key for every session using the BB84
                protocol. The key is never transmitted — it is <em>established</em> independently
                by both parties through quantum state measurements. An eavesdropper cannot intercept
                the key without disturbing the quantum states and triggering a detectable QBER
                increase.
              </DocP>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {[
                  { label: 'Classical Auth', items: ['Password transmitted over TLS', 'Vulnerable to credential theft', 'No eavesdropping detection', 'Key stored on server'], bad: true },
                  { label: 'Qinert Auth', items: ['Key established via quantum channel', 'Eavesdropping is physically detectable', 'Key never transmitted — only derived', 'Fresh key per session'], bad: false },
                ].map(({ label, items, bad }) => (
                  <div key={label} className={`p-4 border rounded-sm ${bad ? 'border-red-900/40 bg-red-500/3' : 'border-primary-700/40 bg-primary-500/3'}`}>
                    <p className={`text-xs font-mono font-medium mb-3 ${bad ? 'text-red-400' : 'text-primary-400'}`}>{label}</p>
                    <ul className="space-y-1.5">
                      {items.map((i) => (
                        <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                          <span className={`mt-1 ${bad ? 'text-red-500' : 'text-primary-500'}`} aria-hidden="true">
                            {bad ? '×' : '✓'}
                          </span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DocSection>

            <Divider />

            {/* ────────────── QUANTUM BASICS */}
            <DocSection id="quantum-basics">
              <DocH2 id="quantum-basics">Quantum Basics</DocH2>
              <DocP>
                To understand BB84, you need to understand a few core concepts from quantum
                mechanics. These are not just academic abstractions — they are the physical
                properties that make quantum cryptography possible.
              </DocP>
            </DocSection>

            <DocSection id="bits">
              <DocH3>Bits</DocH3>
              <DocP>
                A classical <em>bit</em> is the fundamental unit of classical information. It has
                exactly two states: <DocCode>0</DocCode> or <DocCode>1</DocCode>. At any given moment
                a bit is definitively one or the other — there is no ambiguity.
              </DocP>
              <DocP>
                Classical bits are physical — a capacitor charged or uncharged, a magnetic domain
                oriented north or south. Reading the bit does not change it. You can copy a bit
                perfectly. These properties make classical computing predictable but also exploitable.
              </DocP>
            </DocSection>

            <DocSection id="qubits">
              <DocH3>Qubits</DocH3>
              <DocP>
                A <em>qubit</em> is the quantum analogue of a bit. It can exist in states{' '}
                <DocCode>|0⟩</DocCode> and <DocCode>|1⟩</DocCode>, but crucially it can also
                exist in a <em>superposition</em> — a weighted combination of both states
                simultaneously.
              </DocP>
              <DocP>
                In BB84, qubits are implemented as photon polarization states. The four states
                used are horizontal, vertical, 45°, and 135° polarizations, corresponding to
                bits encoded in two different bases.
              </DocP>
              <Callout type="quantum" title="No-Cloning Theorem">
                It is physically impossible to create a perfect copy of an arbitrary unknown
                quantum state. This prevents eavesdroppers from copying qubits during transmission
                — any attempt to measure and re-transmit will introduce detectable errors.
              </Callout>
            </DocSection>

            <DocSection id="measurement">
              <DocH3>Measurement</DocH3>
              <DocP>
                When a qubit in superposition is measured, it <em>collapses</em> to one of its
                basis states. The measurement outcome is probabilistic and determined by the
                amplitudes of the superposition. Crucially, measurement permanently destroys the
                superposition — you cannot "un-measure" a qubit.
              </DocP>
              <DocP>
                In BB84, if Bob measures a qubit in the same basis Alice used to encode it, he
                gets the correct bit with certainty. If he uses the wrong basis, he gets a random
                result. This basis mismatch is the mechanism for the sifting step.
              </DocP>
            </DocSection>

            <DocSection id="superposition">
              <DocH3>Superposition</DocH3>
              <DocP>
                Superposition is the quantum mechanical principle that a qubit can exist as a
                combination of <DocCode>|0⟩</DocCode> and <DocCode>|1⟩</DocCode> until
                measured. Mathematically, a qubit state is written as:
              </DocP>
              <div className="my-4 p-4 bg-background-main/60 border border-border-subtle rounded-sm font-mono text-center text-primary-300">
                |ψ⟩ = α|0⟩ + β|1⟩ &nbsp;&nbsp; where |α|² + |β|² = 1
              </div>
              <DocP>
                The coefficients α and β determine the probability of measuring <DocCode>0</DocCode>{' '}
                (probability |α|²) or <DocCode>1</DocCode> (probability |β|²). The Hadamard gate
                creates an equal superposition where each outcome has 50% probability.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── BB84 */}
            <DocSection id="bb84">
              <DocH2 id="bb84">BB84 Protocol</DocH2>
              <DocP>
                BB84, named after its authors Charles H. Bennett and Gilles Brassard and the year
                of publication (1984), was the first quantum key distribution protocol. It was
                published while the authors were at IBM Research.
              </DocP>
              <DocH3>The Protocol at a Glance</DocH3>
              <DocP>
                BB84 proceeds in two phases: a <em>quantum phase</em> over the quantum channel,
                and a <em>classical phase</em> over a public authenticated classical channel.
              </DocP>
              <ol className="list-none space-y-3 my-6">
                {[
                  'Alice generates random bits and random basis choices.',
                  'Alice encodes each bit as a photon in the chosen basis and transmits.',
                  'Bob measures each photon in a randomly chosen basis.',
                  'Alice and Bob compare basis choices publicly (not bit values).',
                  'They discard mismatched-basis bits — the remainder is the sifted key.',
                  'A sample is compared to compute QBER.',
                  'If QBER < 11%, privacy amplification is applied and the key is accepted.',
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-text-muted">
                    <span className="font-mono text-primary-500 w-5 shrink-0">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <Callout type="info" title="Interactive Timeline">
                The{' '}
                <Link to="/bb84-explorer" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">
                  BB84 Explorer
                </Link>{' '}
                page provides a step-by-step interactive walkthrough of all nine protocol phases.
              </Callout>
            </DocSection>

            <Divider />

            {/* ────────────── QKD */}
            <DocSection id="qkd">
              <DocH2 id="qkd">Quantum Key Distribution</DocH2>
              <DocP>
                Quantum Key Distribution (QKD) is a method of securely distributing cryptographic
                keys using the principles of quantum mechanics. The key insight is that the
                security of QKD does not rest on computational assumptions (like RSA or ECC) —
                it rests on physical laws that cannot be circumvented by any computer, classical
                or quantum.
              </DocP>
              <DocH3>Security Guarantees</DocH3>
              <DocP>
                QKD provides <em>information-theoretic</em> security, meaning even an adversary
                with unlimited computational power cannot break it without being detected. This is
                in contrast to classical cryptographic schemes that are secure only against
                computationally bounded adversaries.
              </DocP>
              <DocH3>Requirements</DocH3>
              <DocP>
                BB84 QKD requires: (1) a quantum channel — typically optical fiber or free-space
                optics — for photon transmission, and (2) an authenticated classical channel for
                basis comparison. The classical channel can be public but must be authenticated
                to prevent man-in-the-middle attacks.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── QBER */}
            <DocSection id="qber">
              <DocH2 id="qber">QBER — Quantum Bit Error Rate</DocH2>
              <DocP>
                The Quantum Bit Error Rate (QBER) is the fraction of bits in the sifted key
                that differ between Alice's and Bob's copies. It is the primary security metric
                in BB84.
              </DocP>
              <div className="my-4 p-4 bg-background-main/60 border border-border-subtle rounded-sm font-mono text-center text-primary-300">
                QBER = (number of error bits) / (total sample bits)
              </div>
              <DocH3>Interpreting QBER</DocH3>
              <div className="space-y-3 my-4">
                {[
                  { range: 'QBER < 11%', meaning: 'Channel considered secure. Apply privacy amplification and proceed.', color: 'text-green-400 bg-green-500/5 border-green-500/20' },
                  { range: 'QBER ≈ 11%', meaning: 'Borderline — channel noise may be naturally high. Investigate further.', color: 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20' },
                  { range: 'QBER ≥ 11%', meaning: 'Abort session. Eavesdropper likely present. Key is not secret.', color: 'text-red-400 bg-red-500/5 border-red-500/20' },
                ].map(({ range, meaning, color }) => (
                  <div key={range} className={`flex gap-4 p-4 border rounded-sm ${color}`}>
                    <code className="font-mono text-sm font-bold shrink-0 w-28">{range}</code>
                    <p className="text-sm text-text-muted">{meaning}</p>
                  </div>
                ))}
              </div>
              <DocP>
                In a noise-free channel with no eavesdropper, the theoretical QBER is 0%. In
                practice, optical channels introduce some noise, so a small QBER is expected.
                An eavesdropper using intercept-resend attacks contributes an additional ~25%
                QBER when measuring every photon — well above the 11% threshold.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── QISKIT */}
            <DocSection id="qiskit">
              <DocH2 id="qiskit">Qiskit</DocH2>
              <DocP>
                Qiskit is IBM's open-source quantum computing SDK. It allows developers to write
                quantum circuits in Python, simulate them locally, and execute them on real IBM
                quantum hardware via IBM Quantum Runtime.
              </DocP>
              <DocP>
                Qinert will use Qiskit for two purposes: generating quantum random bits for Alice's
                bit and basis sequences, and eventually executing the full BB84 circuit on IBM
                superconducting quantum processors.
              </DocP>
              <CodeBlock lang="python">
{`from qiskit import QuantumCircuit
from qiskit_ibm_runtime import QiskitRuntimeService

# Generate quantum random bits for BB84 key material
qc = QuantumCircuit(256, 256)
qc.h(range(256))  # Hadamard: equal superposition
qc.measure_all()

# Execute on IBM Quantum (Milestone 3)
service = QiskitRuntimeService()
backend = service.least_busy()
# job = backend.run(qc)  # Uncomment in Milestone 3`}
              </CodeBlock>
              <Callout type="warning" title="Milestone 3 Feature">
                Real Qiskit integration is planned for Milestone 3. Milestone 2 uses a JavaScript
                simulation engine for in-browser demonstration.
              </Callout>
            </DocSection>

            <Divider />

            {/* ────────────── ARCHITECTURE */}
            <DocSection id="architecture">
              <DocH2 id="architecture">Architecture</DocH2>
              <DocP>
                Qinert follows a layered architecture. The frontend communicates with a FastAPI
                backend, which orchestrates the quantum engine. The quantum engine interfaces
                with Qiskit for circuit execution and IBM Quantum Runtime for hardware access.
                Session data and user records are stored in Supabase.
              </DocP>
              <div className="my-8 flex flex-col items-center gap-0">
                {[
                  { name: 'React Frontend', sub: 'HeroUI · Framer Motion · React Router', color: '#61DAFB' },
                  { name: 'FastAPI Backend', sub: 'Python · REST API · WebSocket', color: '#009688' },
                  { name: 'Quantum Engine', sub: 'BB84 Logic · Key Management · QBER', color: '#8A3FFC' },
                  { name: 'Qiskit SDK', sub: 'Quantum Circuits · Transpilation', color: '#0F62FE' },
                  { name: 'IBM Quantum Runtime', sub: 'Real Hardware · Cloud Execution', color: '#33B1FF' },
                  { name: 'Supabase', sub: 'PostgreSQL · Auth · Real-time', color: '#3ECF8E' },
                ].map((layer, idx) => (
                  <div key={idx} className="flex flex-col items-center w-full max-w-sm">
                    <div className="w-full border border-border-subtle rounded-sm px-6 py-4 bg-surface/30 text-center hover:border-primary-700/40 transition-colors">
                      <p className="font-medium text-text-main text-sm">{layer.name}</p>
                      <p className="text-xs text-text-muted mt-1 font-mono">{layer.sub}</p>
                    </div>
                    {idx < 5 && (
                      <div className="flex flex-col items-center my-0.5" aria-hidden="true">
                        <div className="w-px h-5 bg-border-subtle" />
                        <div className="w-1.5 h-1.5 rotate-45 border-r border-b border-border-subtle" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DocSection>

            <Divider />

            {/* ────────────── ROADMAP */}
            <DocSection id="roadmap">
              <DocH2 id="roadmap">Roadmap</DocH2>
              <div className="space-y-4">
                {[
                  {
                    milestone: 'M1', title: 'Frontend Foundation',
                    status: 'In Progress', statusColor: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
                    items: ['Complete React frontend', 'BB84 Explorer', 'Documentation portal', 'About page'],
                  },
                  {
                    milestone: 'M2', title: 'Simulation Engine + Backend',
                    status: 'Planned', statusColor: 'text-text-muted/70 bg-surface border-border-subtle',
                    items: ['JavaScript BB84 simulation', 'FastAPI REST API', 'Supabase integration', 'Live QBER display'],
                  },
                  {
                    milestone: 'M3', title: 'Quantum Hardware',
                    status: 'Planned', statusColor: 'text-text-muted/70 bg-surface border-border-subtle',
                    items: ['Qiskit circuit integration', 'IBM Quantum Runtime', 'Real hardware key generation', 'End-to-end demo'],
                  },
                  {
                    milestone: 'M4', title: 'Production Readiness',
                    status: 'Future', statusColor: 'text-text-muted/50 bg-surface border-border-subtle',
                    items: ['SDK for external apps', 'Performance optimization', 'Security audit', 'Open source release'],
                  },
                ].map(({ milestone, title, status, statusColor, items }) => (
                  <div key={milestone} className="border border-border-subtle rounded-sm p-6 bg-surface/10">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-surface border border-border-subtle px-2 py-0.5 rounded-sm text-text-muted">
                          {milestone}
                        </span>
                        <h3 className="font-medium text-text-main">{title}</h3>
                      </div>
                      <span className={`text-xs font-mono border px-2.5 py-0.5 rounded-sm ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {items.map((item) => (
                        <li key={item} className="text-sm text-text-muted flex items-center gap-2">
                          <span className="text-primary-700" aria-hidden="true">→</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </DocSection>

            <Divider />

            {/* ────────────── API */}
            <DocSection id="api">
              <div className="flex items-center gap-3 mb-4">
                <DocH2 id="api">API Reference</DocH2>
                <Badge variant="coming">
                  <Lock size={9} aria-hidden="true" />
                  Milestone 2
                </Badge>
              </div>
              <DocP>
                The REST API will be available in Milestone 2. Endpoints will cover session
                initialization, QBER retrieval, key confirmation, and authentication token issuance.
              </DocP>
              <div className="space-y-3 my-6">
                {[
                  { method: 'POST', path: '/api/v1/session/init', desc: 'Initialize a new BB84 authentication session' },
                  { method: 'GET',  path: '/api/v1/session/{id}/qber', desc: 'Retrieve the calculated QBER for a session' },
                  { method: 'POST', path: '/api/v1/session/{id}/confirm', desc: 'Confirm key and request authentication token' },
                  { method: 'POST', path: '/api/v1/session/{id}/abort', desc: 'Abort session due to high QBER or timeout' },
                  { method: 'GET',  path: '/api/v1/health', desc: 'Backend health check and quantum engine status' },
                ].map(({ method, path, desc }) => (
                  <div key={path} className="flex items-start gap-4 p-4 border border-border-subtle rounded-sm bg-background-main/30">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                      method === 'GET' ? 'text-green-400 bg-green-500/10' : 'text-primary-400 bg-primary-500/10'
                    }`}>
                      {method}
                    </span>
                    <div>
                      <code className="font-mono text-sm text-text-main">{path}</code>
                      <p className="text-xs text-text-muted mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Callout type="warning" title="API Not Yet Available">
                These endpoints are planned for Milestone 2. The FastAPI backend does not yet exist.
              </Callout>
            </DocSection>

            <Divider />

            {/* ────────────── FAQ */}
            <DocSection id="faq">
              <DocH2 id="faq">FAQ</DocH2>
              <FAQAccordion items={DOC_FAQ} />
            </DocSection>

            {/* Bottom CTA */}
            <div className="mt-16 pt-12 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="font-medium text-text-main mb-1">Explore the protocol interactively</p>
                <p className="text-sm text-text-muted">Walk through each BB84 step on the explorer page.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  as={Link}
                  to="/bb84-explorer"
                  variant="bordered"
                  size="sm"
                  className="border-border-subtle text-text-muted hover:text-text-main rounded-sm font-medium"
                >
                  BB84 Explorer
                </Button>
                <Button
                  as={Link}
                  to="/authenticate"
                  size="sm"
                  className="bg-primary-500 hover:bg-primary-400 text-white rounded-sm font-medium"
                  endContent={<ArrowRight size={13} aria-hidden="true" />}
                >
                  Start Authentication
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
