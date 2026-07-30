import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import {
  ArrowRight, CaretRight, BookOpen, Lock
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
  { id: 'bits',           label: 'Classical Bits',          level: 1 },
  { id: 'qubits',         label: 'Quantum Bits (Qubits)',   level: 1 },
  { id: 'measurement',    label: 'State Measurement',       level: 1 },
  { id: 'superposition',  label: 'Superposition',           level: 1 },
  { id: 'bb84',           label: 'The BB84 Protocol',       level: 0 },
  { id: 'qkd',            label: 'Quantum Key Distribution',level: 0 },
  { id: 'qber',           label: 'Understanding QBER',      level: 0 },
  { id: 'qiskit',         label: 'IBM Qiskit Integration',  level: 0 },
  { id: 'architecture',   label: 'System Architecture',     level: 0 },
  { id: 'roadmap',        label: 'Project Roadmap',         level: 0 },
  { id: 'api',            label: 'API Reference',           level: 0 },
  { id: 'faq',            label: 'Frequently Asked Questions', level: 0 },
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
    question: 'Is the Qinert platform ready for production use?',
    answer:
      'Currently, Qinert serves as a research and educational platform in its first milestone (frontend development). Subsequent milestones will introduce a simulated BB84 backend, followed by integration with genuine IBM Quantum computers. It should not be used for production security yet.',
  },
  {
    question: 'Which quantum infrastructure powers Qinert?',
    answer:
      'We leverage the Qiskit framework to communicate with IBM Quantum Runtime. While early phases use local browser or server simulations, the final architecture relies on real superconducting qubits.',
  },
  {
    question: 'How easy is it to integrate Qinert into my own projects?',
    answer:
      'Once the Milestone 2 backend is complete, we will offer REST APIs and a frontend SDK, allowing you to easily add quantum-secured login flows to any existing web or mobile application.',
  },
  {
    question: 'What is the acceptable error rate (QBER) for a secure session?',
    answer:
      'Following quantum cryptographic standards, Qinert aborts any session where the Quantum Bit Error Rate (QBER) reaches or exceeds 11%. This strict threshold ensures no eavesdropper has intercepted the key.',
  },
  {
    question: 'Where can I view the source code?',
    answer:
      'Qinert is completely open-source. The repository for the frontend is available on GitHub, and we will open-source the backend engines as they are developed and finalized.',
  },
  {
    question: 'What role does privacy amplification play?',
    answer:
      'Privacy amplification acts as a final cryptographic filter. By hashing the sifted key, we compress the data and eliminate any residual knowledge an attacker might have gained from environmental noise or eavesdropping.',
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
            Qinert / Developer Docs
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-text-main mb-4">
            Platform Documentation
          </h1>
          <p className="text-text-muted text-lg max-w-xl leading-relaxed">
            Discover the mechanics behind Qinert’s quantum-safe authentication and explore the implementation of the BB84 Quantum Key Distribution standard.
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
            {mobileNavOpen ? 'Close Menu' : 'Open Menu'}
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
                Table of Contents
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
                <p className="text-[10px] font-mono text-text-muted/40 uppercase tracking-[0.18em] mb-3">Resources</p>
                <div className="flex flex-col gap-2">
                  <Link to="/bb84-explorer" className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <CaretRight size={11} aria-hidden="true" /> Try BB84 Explorer
                  </Link>
                  <Link to="/authenticate" className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <CaretRight size={11} aria-hidden="true" /> Launch App
                  </Link>
                  <a href="https://github.com" className="text-xs text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <CaretRight size={11} aria-hidden="true" /> Source Code
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
                Welcome to Qinert. This platform serves as a modern testbed for quantum cryptography,
                demonstrating how digital identities can be secured using the <strong className="text-text-main">BB84 Quantum Key Distribution</strong> protocol. 
                Our goal is to showcase the practical transition from math-based cryptography to physics-based security guarantees.
              </DocP>
              <DocP>
                Unlike modern encryption standard which are susceptible to factorization by Shor's algorithm, Qinert leverages the unalterable laws of quantum physics. We rely on the fundamental impossibility of copying quantum states to guarantee that keys are never intercepted.
              </DocP>
              <Callout type="info" title="Academic Prototype">
                Please note that Qinert is an experimental endeavor. Production-grade integration with live IBM quantum hardware is scheduled for Milestone 3.
              </Callout>
              <DocP>
                Currently, Milestone 1 focuses on the frontend user experience and interactive education. Moving forward, Milestone 2 will introduce the core API and a powerful JavaScript BB84 simulator, paving the way for full physical quantum deployment in Milestone 3.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── AUTHENTICATION */}
            <DocSection id="authentication">
              <DocH2 id="authentication">Authentication Paradigm</DocH2>
              <DocP>
                The security models of today (like passwords, biometrics, and OTPs) inherently require a secret to be passed through classical channels. This transit makes credentials prone to interception, theft, or eventual decryption by future quantum supercomputers.
              </DocP>
              <DocH3>The Qinert Advantage</DocH3>
              <DocP>
                In contrast, Qinert does not transmit your key at all. Instead, it utilizes BB84 to mutually generate a fresh, unique key on both the client and server simultaneously. Any third-party observation immediately disrupts the quantum states, rendering the key invalid and alerting the system to a breach.
              </DocP>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {[
                  { label: 'Legacy Authentication', items: ['Secrets sent over public internet', 'Susceptible to data breaches', 'Eavesdropping goes unnoticed', 'Keys reside in databases'], bad: true },
                  { label: 'Qinert Authentication', items: ['Keys generated mutually via qubits', 'Physical detection of eavesdroppers', 'Keys are derived, never sent', 'Ephemeral session keys'], bad: false },
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
              <DocH2 id="quantum-basics">Core Quantum Concepts</DocH2>
              <DocP>
                To grasp the mechanics of the BB84 protocol, a foundational understanding of quantum physics is necessary. These principles govern the behavior of subatomic particles and form the unbreakable backbone of quantum encryption.
              </DocP>
            </DocSection>

            <DocSection id="bits">
              <DocH3>Classical Bits</DocH3>
              <DocP>
                The standard bit is the building block of traditional computing, existing firmly as a <DocCode>0</DocCode> or a <DocCode>1</DocCode>. Its state is absolute.
              </DocP>
              <DocP>
                Because classical bits map to macroscopic properties—like electrical charges or magnetism—they can be read infinitely without altering their value. This allows data to be copied perfectly, which is excellent for software, but catastrophic for secure key exchange.
              </DocP>
            </DocSection>

            <DocSection id="qubits">
              <DocH3>Quantum Bits (Qubits)</DocH3>
              <DocP>
                A qubit serves as the quantum equivalent of a bit. While it can resolve to <DocCode>|0⟩</DocCode> or <DocCode>|1⟩</DocCode>, it possesses the unique ability to exist in a complex probability wave blending both states.
              </DocP>
              <DocP>
                Qinert represents qubits through the polarization of light. By polarizing photons either rectilinearly (horizontal/vertical) or diagonally (45°/135°), we encode information across two incompatible measurement bases.
              </DocP>
              <Callout type="quantum" title="The No-Cloning Theorem">
                Quantum mechanics forbids the creation of an identical copy of an unknown quantum state. This is the ultimate defense against network sniffers: attempting to copy a photon irrevocably changes its state, leaving a clear footprint of the intrusion.
              </Callout>
            </DocSection>

            <DocSection id="measurement">
              <DocH3>State Measurement</DocH3>
              <DocP>
                Observing a qubit forces its wave function to collapse into a definite state. This means that reading quantum data is a destructive process—the delicate superposition is lost forever upon measurement.
              </DocP>
              <DocP>
                During BB84, if the receiving party measures the photon using the correct basis, the original data is accurately retrieved. Choosing the incorrect basis yields a random, unreliable outcome. Comparing these choices later is how secure keys are formed.
              </DocP>
            </DocSection>

            <DocSection id="superposition">
              <DocH3>Superposition</DocH3>
              <DocP>
                Superposition describes a qubit's capacity to harbor multiple states simultaneously until the moment of measurement. It is represented by the formula:
              </DocP>
              <div className="my-4 p-4 bg-background-main/60 border border-border-subtle rounded-sm font-mono text-center text-primary-300">
                |ψ⟩ = α|0⟩ + β|1⟩ &nbsp;&nbsp; where |α|² + |β|² = 1
              </div>
              <DocP>
                Here, the squares of the complex amplitudes (α and β) dictate the probability of the qubit collapsing into either state. We frequently use Hadamard gates to create perfect 50/50 superpositions for unbiased randomness.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── BB84 */}
            <DocSection id="bb84">
              <DocH2 id="bb84">The BB84 Protocol</DocH2>
              <DocP>
                Conceived in 1984 by Charles H. Bennett and Gilles Brassard at IBM, the BB84 protocol pioneered the field of quantum cryptography, proposing a theoretical method to securely exchange keys over potentially compromised networks.
              </DocP>
              <DocH3>Step-by-Step Overview</DocH3>
              <DocP>
                The process requires both a quantum channel (for transmitting photons) and an authenticated public channel (for discussing measurement strategies).
              </DocP>
              <ol className="list-none space-y-3 my-6">
                {[
                  'Alice creates a random sequence of bits and selects a random basis for each.',
                  'Alice polarizes a photon according to the bit and basis, then sends it to Bob.',
                  'Bob blindly selects a random basis to measure the incoming photon.',
                  'Using a public channel, Alice and Bob announce the bases they used (keeping the bits secret).',
                  'They keep only the bits where their basis choices happened to match.',
                  'A subset of these bits is publicly compared to evaluate the error rate (QBER).',
                  'If the error rate is safe (<11%), they apply privacy amplification to finalize the secure key.',
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-text-muted">
                     <span className="font-mono text-primary-500 w-5 shrink-0">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <Callout type="info" title="Try the Visualizer">
                For a hands-on learning experience, visit the{' '}
                <Link to="/bb84-explorer" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">
                  BB84 Explorer
                </Link>{' '}
                to simulate the entire transmission lifecycle.
              </Callout>
            </DocSection>

            <Divider />

            {/* ────────────── QKD */}
            <DocSection id="qkd">
              <DocH2 id="qkd">Understanding Quantum Key Distribution</DocH2>
              <DocP>
                Quantum Key Distribution (QKD) is the broader discipline of utilizing quantum phenomena to establish shared cryptographic secrets. Its most significant trait is providing security grounded in physics rather than mathematical complexity.
              </DocP>
              <DocH3>Information-Theoretic Security</DocH3>
              <DocP>
                QKD delivers <em>information-theoretic security</em>. This implies that no amount of computational power—not even from an adversary operating a million-qubit quantum computer—can breach the encryption, because the security relies on the laws of nature itself.
              </DocP>
              <DocH3>Infrastructure Needs</DocH3>
              <DocP>
                Deploying QKD necessitates a physical medium capable of preserving quantum states (like specialized fiber optic lines) alongside a standard authenticated internet connection to coordinate the sifting and error-checking phases without risk of spoofing.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── QBER */}
            <DocSection id="qber">
              <DocH2 id="qber">Decoding QBER</DocH2>
              <DocP>
                The Quantum Bit Error Rate (QBER) measures the discrepancy between Alice's transmitted key and Bob's received key. It acts as the ultimate tripwire for detecting network intrusion.
              </DocP>
              <div className="my-4 p-4 bg-background-main/60 border border-border-subtle rounded-sm font-mono text-center text-primary-300">
                QBER = Errors / Total Checked Bits
              </div>
              <DocH3>Evaluating Threat Levels</DocH3>
              <div className="space-y-3 my-4">
                {[
                  { range: 'Below 11%', meaning: 'Transmission clear. Proceed with key distillation and privacy amplification.', color: 'text-green-400 bg-green-500/5 border-green-500/20' },
                  { range: 'Near 11%', meaning: 'Warning threshold. High environmental interference or sophisticated snooping.', color: 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20' },
                  { range: 'Above 11%', meaning: 'Compromise detected. Abort the handshake immediately and discard all data.', color: 'text-red-400 bg-red-500/5 border-red-500/20' },
                ].map(({ range, meaning, color }) => (
                  <div key={range} className={`flex gap-4 p-4 border rounded-sm ${color}`}>
                    <code className="font-mono text-sm font-bold shrink-0 w-28">{range}</code>
                    <p className="text-sm text-text-muted">{meaning}</p>
                  </div>
                ))}
              </div>
              <DocP>
                While a flawless vacuum theoretically yields a 0% QBER, real-world fiber optics introduce minor natural errors. However, because eavesdropping inherently requires unauthorized measurement (which collapses the state), an attacker performing an intercept-resend attack will dramatically spike the QBER by roughly 25%.
              </DocP>
            </DocSection>

            <Divider />

            {/* ────────────── QISKIT */}
            <DocSection id="qiskit">
              <DocH2 id="qiskit">IBM Qiskit Integration</DocH2>
              <DocP>
                We build upon Qiskit, IBM's premiere quantum software development kit. It empowers our backend to compose quantum circuits, simulate probabilistic outcomes, and dispatch jobs directly to cloud-connected quantum hardware.
              </DocP>
              <DocP>
                Qinert utilizes Qiskit primarily for true quantum random number generation (vital for unpredictable basis selection) and to execute the physical BB84 photon polarization sequences.
              </DocP>
              <CodeBlock lang="python">
{`from qiskit import QuantumCircuit
from qiskit_ibm_runtime import QiskitRuntimeService

# Initializing a circuit to generate pure quantum entropy
circuit = QuantumCircuit(256, 256)
circuit.h(range(256))  # Apply Hadamard gates for superposition
circuit.measure_all()

# Dispatch to IBM Quantum infrastructure
service = QiskitRuntimeService()
qpu = service.least_busy()
# result = qpu.run(circuit) # Target for M3 deployment`}
              </CodeBlock>
              <Callout type="warning" title="Hardware Availability">
                Live IBM QPU execution is slated for Milestone 3. The current iteration operates using advanced browser-side and server-side state simulators.
              </Callout>
            </DocSection>

            <Divider />

            {/* ────────────── ARCHITECTURE */}
            <DocSection id="architecture">
              <DocH2 id="architecture">System Architecture</DocH2>
              <DocP>
                Qinert is designed as a highly modular, distributed system. Our React frontend serves as the interactive client, talking to a high-speed FastAPI backend. This backend houses the Quantum Engine, which in turn manages Qiskit jobs and interacts with IBM's APIs, while Supabase handles classical data persistence.
              </DocP>
              <div className="my-8 flex flex-col items-center gap-0">
                {[
                  { name: 'Client Interface (React)', sub: 'HeroUI · Tailwind · Interactive Visualizations', color: '#61DAFB' },
                  { name: 'Gateway Backend (FastAPI)', sub: 'Python · Asynchronous I/O · WebSockets', color: '#009688' },
                  { name: 'QKD Logic Engine', sub: 'Protocol State Machine · Error Correction', color: '#8A3FFC' },
                  { name: 'Qiskit Integration Layer', sub: 'Circuit Orchestration · Cloud Transpilation', color: '#0F62FE' },
                  { name: 'IBM Quantum Hardware', sub: 'Superconducting Qubits · Real-time Execution', color: '#33B1FF' },
                  { name: 'Supabase Data Store', sub: 'Postgres DB · Analytics · User Records', color: '#3ECF8E' },
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
              <DocH2 id="roadmap">Project Roadmap</DocH2>
              <div className="space-y-4">
                {[
                  {
                    milestone: 'M1', title: 'Interactive Frontend',
                    status: 'In Progress', statusColor: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
                    items: ['Build React foundations', 'Interactive BB84 Explorer', 'Extensive technical docs', 'Landing pages'],
                  },
                  {
                    milestone: 'M2', title: 'Backend & Simulation',
                    status: 'Planned', statusColor: 'text-text-muted/70 bg-surface border-border-subtle',
                    items: ['FastAPI REST gateway', 'In-memory BB84 simulator', 'Database schema modeling', 'Real-time telemetry'],
                  },
                  {
                    milestone: 'M3', title: 'Hardware Integration',
                    status: 'Planned', statusColor: 'text-text-muted/70 bg-surface border-border-subtle',
                    items: ['IBM Quantum Runtime connection', 'Hardware key generation', 'Latency optimization', 'Live deployment'],
                  },
                  {
                    milestone: 'M4', title: 'Ecosystem Growth',
                    status: 'Future', statusColor: 'text-text-muted/50 bg-surface border-border-subtle',
                    items: ['Developer SDKs', 'Third-party integrations', 'External security auditing', 'Whitepaper release'],
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
                  Expected in M2
                </Badge>
              </div>
              <DocP>
                The Qinert REST API allows seamless management of the quantum handshake lifecycle. The endpoints below provide complete control over generating, verifying, and concluding BB84 authentication sessions.
              </DocP>
              <div className="space-y-3 my-6">
                {[
                  { method: 'POST', path: '/api/v1/auth/session/initiate', desc: 'Starts a new BB84 key generation sequence.' },
                  { method: 'GET',  path: '/api/v1/auth/session/{id}/metrics', desc: 'Polls the current QBER and entanglement status.' },
                  { method: 'POST', path: '/api/v1/auth/session/{id}/finalize', desc: 'Validates the key and issues the JWT token.' },
                  { method: 'POST', path: '/api/v1/auth/session/{id}/terminate', desc: 'Kills the session forcefully if security thresholds fail.' },
                  { method: 'GET',  path: '/api/v1/system/health', desc: 'Pings the backend and verifies IBM QPU connectivity.' },
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
              <Callout type="warning" title="API Status: Pending">
                These routes are actively in development for Milestone 2. Documentation schemas are subject to change.
              </Callout>
            </DocSection>

            <Divider />

            {/* ────────────── FAQ */}
            <DocSection id="faq">
              <DocH2 id="faq">Frequently Asked Questions</DocH2>
              <FAQAccordion items={DOC_FAQ} />
            </DocSection>

            {/* Bottom CTA */}
            <div className="mt-16 pt-12 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="font-medium text-text-main mb-1">Experience the Quantum Exchange</p>
                <p className="text-sm text-text-muted">Explore our interactive module to visualize every step of the BB84 protocol.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  as={Link}
                  to="/bb84-explorer"
                  variant="bordered"
                  size="sm"
                  className="border-border-subtle text-text-muted hover:text-text-main rounded-sm font-medium"
                >
                  Interactive Visualizer
                </Button>
                <Button
                  as={Link}
                  to="/authenticate"
                  size="sm"
                  className="bg-primary-500 hover:bg-primary-400 text-white rounded-sm font-medium"
                  endContent={<ArrowRight size={13} aria-hidden="true" />}
                >
                  Launch App
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
