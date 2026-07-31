import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiArrowRight } from 'react-icons/fi'
import PageHero from '../components/PageHero'
import FAQChatGraphic from '../components/graphics/FAQChatGraphic'

const faqGroups = [
  {
    category: 'Working together',
    items: [
      { question: 'What types of businesses do you work with?', answer: 'We collaborate with ambitious companies across healthcare, fintech, retail, SaaS, and professional services.' },
      { question: 'Can you support both strategy and execution?', answer: 'Yes. We can lead both the planning and hands-on delivery of campaigns, websites, and creative systems.' },
      { question: 'Do you offer ongoing retainer support?', answer: 'Absolutely. Many clients choose a retainer model for continuous optimization and growth support.' },
      { question: 'How do we get started?', answer: 'Book a free discovery call. We\'ll learn about your goals, audit your current setup, and propose a tailored plan within a few days.' },
    ],
  },
  {
    category: 'Pricing & engagement',
    items: [
      { question: 'How is pricing structured?', answer: 'Most engagements are structured as monthly retainers scoped to your goals, with project-based pricing available for one-off work like website builds.' },
      { question: 'What is the minimum contract length?', answer: 'Retainers typically start with a 3-month minimum so we have enough runway to show measurable results, though project work can be shorter.' },
      { question: 'Do you offer custom packages for startups?', answer: 'Yes — we build flexible scopes for early-stage teams that need focused wins before scaling investment.' },
    ],
  },
  {
    category: 'Process & reporting',
    items: [
      { question: 'How often will we receive reporting?', answer: 'You\'ll get a live dashboard plus a monthly strategic review covering performance, insights, and next steps.' },
      { question: 'Who will we be working with day to day?', answer: 'A dedicated strategist leads every engagement, backed by senior specialists across SEO, paid media, design, and development.' },
      { question: 'What tools and platforms do you use?', answer: 'We work within your existing stack where possible and recommend best-in-class tools (CRM, analytics, automation) when gaps exist.' },
    ],
  },
]

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#09090B] transition hover:border-white/20">
      <button className="flex w-full items-center justify-between gap-4 p-5 text-left" onClick={onToggle}>
        <span className="font-semibold text-white">{item.question}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#A050F8] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          <FiPlus size={16} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-7 text-[#9898A6]">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState('Working together-0')

  return (
    <div className="bg-[#09090B]">
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions about working with us."
        description="Everything you need to know before booking a strategy call — organized by topic."
        graphic={<FAQChatGraphic />}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {faqGroups.map((group) => (
            <div key={group.category}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FF7439]">{group.category}</h2>
              <div className="mt-5 space-y-4">
                {group.items.map((item, index) => {
                  const key = `${group.category}-${index}`
                  return (
                    <FaqItem
                      key={key}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-[32px] border border-white/10 bg-[#111115] p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-white">Still have questions?</h2>
          <p className="max-w-md text-sm leading-7 text-[#9898A6]">Our team is happy to walk through your specific situation on a free strategy call.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A050F8] to-[#FF7439] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
            Contact us <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  )
}
