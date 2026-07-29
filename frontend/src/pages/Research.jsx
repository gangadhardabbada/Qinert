import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Flask, BookOpen, ArrowRight } from '@phosphor-icons/react';
import PageWrapper from '../components/shared/PageWrapper';
import SectionHeader from '../components/shared/SectionHeader';
import EmptyState from '../components/shared/EmptyState';
import { fadeInUp } from '../utils/animations';

export default function Research() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <SectionHeader 
          label="Qinert / Research"
          title="Research"
          subtitle="Academic references, research papers, and scientific resources underpinning the Qinert quantum authentication platform."
        />

        {/* Placeholder sections */}
        <div className="space-y-6">
          {[
            {
              title: 'Research Papers',
              description: 'Foundational and contemporary papers on quantum key distribution, BB84, and post-quantum cryptography.',
            },
            {
              title: 'Academic References',
              description: 'Peer-reviewed journals, conference proceedings, and preprints referenced in the Qinert implementation.',
            },
            {
              title: 'NIST Standards',
              description: 'NIST post-quantum cryptography standardization resources and related publications.',
            },
            {
              title: 'IBM Quantum Research',
              description: 'Whitepapers and research from IBM on quantum computing, Qiskit, and quantum cryptography.',
            },
          ].map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="quantum-card rounded-sm border border-border-subtle p-8 relative overflow-hidden"
            >
              {/* Coming soon badge */}
              <div className="absolute top-4 right-4">
                <span className="text-xs font-mono bg-surface border border-border-subtle text-text-muted/60 px-2.5 py-1 rounded-sm">
                  Coming soon
                </span>
              </div>

              <div className="w-10 h-10 rounded-sm bg-surface border border-border-subtle flex items-center justify-center mb-5">
                <BookOpen size={18} className="text-primary-400" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-medium text-text-main mb-2">{section.title}</h2>
              <p className="text-text-muted text-sm leading-relaxed max-w-xl">{section.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-12 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <p className="text-text-main font-medium mb-1">Want to contribute?</p>
            <p className="text-sm text-text-muted">Qinert is open source. Research contributions are welcome.</p>
          </div>
          <div className="flex gap-3">
            <Button
              as={Link}
              to="/documentation"
              variant="bordered"
              size="sm"
              className="border-border-subtle text-text-muted hover:text-text-main rounded-sm font-medium"
              startContent={<BookOpen size={14} aria-hidden="true" />}
            >
              Documentation
            </Button>
            <Button
              as="a"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              className="bg-primary-500 hover:bg-primary-400 text-white rounded-sm font-medium"
              endContent={<ArrowRight size={14} aria-hidden="true" />}
            >
              GitHub
            </Button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
