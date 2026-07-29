import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from '@phosphor-icons/react';

/**
 * @param {{ question: string, answer: string }[]} items
 */
export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div
      className="border border-border-subtle rounded-sm overflow-hidden divide-y divide-border-subtle"
      role="list"
    >
      {items.map((item, idx) => (
        <div key={idx} role="listitem">
          <button
            id={`faq-btn-${idx}`}
            aria-expanded={openIndex === idx}
            aria-controls={`faq-panel-${idx}`}
            onClick={() => toggle(idx)}
            className="w-full flex items-start justify-between px-6 py-5 text-left hover:bg-surface/40 transition-colors gap-4 group"
          >
            <span className="font-medium text-text-main text-sm leading-relaxed">
              {item.question}
            </span>
            <span className="shrink-0 mt-0.5 text-primary-400 group-hover:text-primary-300 transition-colors">
              {openIndex === idx ? <Minus size={16} /> : <Plus size={16} />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === idx && (
              <motion.div
                id={`faq-panel-${idx}`}
                role="region"
                aria-labelledby={`faq-btn-${idx}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-text-muted leading-relaxed text-sm">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
