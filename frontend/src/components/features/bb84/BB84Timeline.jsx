import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight } from '@phosphor-icons/react';

const STEPS = [
  {
    number: 1,
    title: 'Alice Prepares Bits',
    tag: 'Preparation',
    description:
      'Alice generates a cryptographically random sequence of classical bits (0s and 1s) using a quantum random number generator. These bits form the raw material for the shared secret key. The sequence is much longer than the intended key to account for subsequent losses.',
    technical:
      'n random bits generated where n ≫ final key length\nAccounts for basis mismatch loss (~50%)\nAdditional margin for QBER sample + privacy amplification',
  },
  {
    number: 2,
    title: 'Choose Random Bases',
    tag: 'Preparation',
    description:
      'For each bit, Alice randomly selects one of two conjugate measurement bases: rectilinear (+) or diagonal (×). The selection is independent for each bit and uniformly random. This basis choice is kept secret until the public comparison phase.',
    technical:
      'Rectilinear (+): {|→⟩, |↑⟩}\nDiagonal (×): {|↗⟩, |↘⟩}\nBasis chosen independently per bit with P = 0.5',
  },
  {
    number: 3,
    title: 'Encode Qubits',
    tag: 'Encoding',
    description:
      'Alice encodes each classical bit as a photon polarization state according to her chosen basis. Each bit-basis combination maps to a unique quantum state. These photons will be sent through the quantum channel to Bob.',
    technical:
      'Bit 0, Basis +: |→⟩ (horizontal polarization)\nBit 1, Basis +: |↑⟩ (vertical polarization)\nBit 0, Basis ×: |↗⟩ (45° polarization)\nBit 1, Basis ×: |↘⟩ (135° polarization)',
  },
  {
    number: 4,
    title: 'Quantum Transmission',
    tag: 'Transmission',
    description:
      'Alice sends the encoded photons to Bob through the quantum channel — typically an optical fiber or free-space optical link. Any eavesdropping attempt at this stage will disturb the quantum states, causing errors that are detectable in the QBER phase.',
    technical:
      'Photons transmitted via optical fiber or free-space channel\nNo-cloning theorem: Eve cannot copy unknown quantum state\nAny interception collapses superposition → introduces detectable errors',
  },
  {
    number: 5,
    title: 'Bob Measures',
    tag: 'Measurement',
    description:
      'Bob independently and randomly selects a measurement basis for each incoming photon. When Bob happens to choose the same basis as Alice, his measurement yields the correct bit value. When bases differ, the result is random and will be discarded during sifting.',
    technical:
      'Same basis as Alice → 100% correct result\nDifferent basis → 50% random (discarded in sifting)\nBob records both his basis choices and measurement results',
  },
  {
    number: 6,
    title: 'Compare Bases',
    tag: 'Sifting',
    description:
      'Alice and Bob communicate over a classical (public) channel to compare which basis they each used for every bit position. They publicly announce their basis sequences but NOT the actual bit values. Bits where bases differ are discarded, leaving the sifted key.',
    technical:
      'Classical channel used for basis comparison only\n~50% of bits retained after sifting (where bases matched)\nBit values remain secret — only basis choices are revealed',
  },
  {
    number: 7,
    title: 'Generate Shared Key',
    tag: 'Key Generation',
    description:
      'The surviving bits — where Alice and Bob used the same basis — form the raw sifted key. If no eavesdropper was present, both parties now hold an identical key. Privacy amplification is then applied to condense the key and remove any marginal information leakage.',
    technical:
      'Sifted key length ≈ n/2 bits\nPrivacy amplification: universal hash function applied\nFinal key length depends on estimated information leakage from QBER',
  },
  {
    number: 8,
    title: 'Calculate QBER',
    tag: 'Verification',
    description:
      'Alice and Bob sacrifice a random sample of their sifted key bits over the classical channel to estimate the Quantum Bit Error Rate. This measures how many bits differ between their copies. A QBER above ~11% indicates potential eavesdropping and the protocol is aborted.',
    technical:
      'QBER = (number of error bits) / (total sample bits)\nThreshold: QBER < 11% → channel considered secure\nQBER ≥ 11% → abort session, possible interception detected\nSample bits are discarded after the check',
  },
  {
    number: 9,
    title: 'Authentication Result',
    tag: 'Conclusion',
    description:
      'If the QBER falls below the security threshold, Alice and Bob confirm they share a secure secret key. This key is used to derive an authentication token that proves identity. If the QBER is too high, the session is terminated and no authentication is granted.',
    technical:
      'QBER < 11%: Authentication token derived from final key via HKDF\nQBER ≥ 11%: Session aborted — eavesdropping detected\nToken used for symmetric HMAC-based identity verification\nEach session generates a fresh key — no replay attacks',
  },
];

export default function BB84Timeline() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <div>
      {/* ── Step indicator row ────────────────────────────────────── */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6" aria-label="Protocol steps">
        <div className="flex items-start min-w-max gap-0">
          {STEPS.map((s, idx) => (
            <div key={idx} className="flex items-start">
              <button
                aria-label={`Step ${s.number}: ${s.title}`}
                aria-pressed={idx === active}
                onClick={() => setActive(idx)}
                className="flex flex-col items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 transition-all duration-250 ${
                    idx === active
                      ? 'bg-primary-500 border-primary-500 text-white shadow-[0_0_18px_rgba(15,98,254,0.55)]'
                      : idx < active
                      ? 'border-primary-700 bg-primary-900/30 text-primary-400'
                      : 'border-border-subtle bg-surface text-text-muted group-hover:border-primary-700/60 group-hover:text-primary-300'
                  }`}
                >
                  {idx < active ? (
                    <CheckCircle size={15} weight="fill" aria-hidden="true" />
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium text-center w-18 leading-tight transition-colors ${
                    idx === active ? 'text-text-main' : 'text-text-muted'
                  }`}
                >
                  {s.title}
                </span>
              </button>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`h-px w-8 mt-4.5 shrink-0 transition-colors duration-300 ${
                    idx < active ? 'bg-primary-700' : 'bg-border-subtle'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail panel ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          role="region"
          aria-label={`Step ${step.number} details`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-6 border border-border-subtle rounded-sm bg-surface/20 p-8"
        >
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-xs font-mono font-medium bg-primary-500/10 border border-primary-500/20 text-primary-400 px-2.5 py-1 rounded-sm">
              {step.tag}
            </span>
            <span className="text-xs font-mono text-text-muted/50">
              Step {step.number} of {STEPS.length}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-text-main mb-3">{step.title}</h3>
          <p className="text-text-muted leading-relaxed text-[15px] mb-6">{step.description}</p>

          <div className="bg-background-main/60 border border-border-subtle rounded-sm p-4 font-mono text-xs text-primary-300 leading-loose whitespace-pre-line">
            {step.technical}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-4 px-1">
        <button
          onClick={() => setActive((p) => Math.max(0, p - 1))}
          disabled={active === 0}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Previous
        </button>

        <span className="text-xs font-mono text-text-muted/50">
          {active + 1} / {STEPS.length}
        </span>

        <button
          onClick={() => setActive((p) => Math.min(STEPS.length - 1, p + 1))}
          disabled={active === STEPS.length - 1}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
