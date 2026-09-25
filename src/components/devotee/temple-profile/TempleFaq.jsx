import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const TempleFaq = ({ temple }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = Array.isArray(temple?.faqs) ? temple.faqs.filter((f) => f.question?.trim()) : [];

  if (faqs.length === 0) {
    return null; // Omit if no FAQs exist
  }

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="scroll-mt-28 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Pilgrim Inquiries</span>
        </div>
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-spiritual-text">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-spiritual-muted mt-1">
          Essential answers for devotees visiting {temple.name}.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="spiritual-card bg-white border border-amber-200/60 rounded-2xl overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-spiritual-text hover:text-amber-800 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-amber-700 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-amber-100 bg-[#FCFBF7]/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TempleFaq;
