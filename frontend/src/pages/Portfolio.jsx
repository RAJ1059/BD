import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import PageHero from '../components/PageHero'
import PortfolioStackGraphic from '../components/graphics/PortfolioStackGraphic'
import { api } from '../lib/api'

const DEFAULT_HERO = {
  eyebrow: 'Portfolio',
  title: 'Selected work that blends strategy, design, and growth.',
  description: "A curated look at how we've helped ambitious brands turn strategy into measurable outcomes.",
}

const DEFAULT_INDUSTRIES = ['Healthcare', 'Fintech', 'Retail', 'Technology']

const DEFAULT_PROJECTS = [
  { title: 'Northstar Health', category: 'SEO + Web', industry: 'Healthcare', description: 'Repositioning a healthcare brand for higher trust and stronger lead capture.', img: 'https://picsum.photos/seed/northstar/800/600', result: '+142% qualified leads' },
  { title: 'Aurelia Capital', category: 'PPC + Analytics', industry: 'Fintech', description: 'Paid media expansion with a sharper funnel and stronger attribution reporting.', img: 'https://picsum.photos/seed/aurelia/800/600', result: '4.8x paid media efficiency' },
  { title: 'Lumen Retail', category: 'Ecommerce Growth', industry: 'Retail', description: 'Growth design and CRO improvements for a modern retail experience.', img: 'https://picsum.photos/seed/lumen/800/600', result: '+67% ecommerce conversion' },
  { title: 'Crest Labs', category: 'Brand + Development', industry: 'Technology', description: 'Brand transformation paired with a new conversion-optimized digital presence.', img: 'https://picsum.photos/seed/crest/800/600', result: '+58% brand recall' },
  { title: 'Havenwell', category: 'SEO + Content', industry: 'Healthcare', description: 'Content-led organic growth engine built around patient education.', img: 'https://picsum.photos/seed/havenwell/800/600', result: '3.1x organic traffic' },
  { title: 'Ridgeline Supply', category: 'Web + Automation', industry: 'Retail', description: 'A rebuilt storefront paired with lifecycle automation for repeat buyers.', img: 'https://picsum.photos/seed/ridgeline/800/600', result: '+41% repeat purchase rate' },
]

const DEFAULT_CTA = {
  eyebrow: 'Like what you see?',
  heading: "Let's build your next case study together.",
  description: "Tell us about your goals and we'll show you how we'd approach your project.",
  buttonText: 'Start a project',
  buttonLink: '/contact',
}

const DEFAULT_SECTIONS = { hero: DEFAULT_HERO, industries: DEFAULT_INDUSTRIES, projects: DEFAULT_PROJECTS, cta: DEFAULT_CTA }

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

export default function Portfolio() {
  const [filter, setFilter] = useState('All')
  const [content, setContent] = useState(DEFAULT_SECTIONS)

  useEffect(() => {
    api
      .get('/public/page-content/portfolio')
      .then((res) => {
        const fetched = res.data?.sections || {}
        setContent((prev) => {
          const next = { ...prev }
          for (const key of Object.keys(fetched)) {
            if (isFilled(fetched[key])) next[key] = fetched[key]
          }
          return next
        })
      })
      .catch(() => {})
  }, [])

  const { hero, industries, projects, cta } = content
  const filterOptions = ['All', ...industries]
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.industry === filter)

  return (
    <div className="bg-[#0B0E14]">
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} graphic={<PortfolioStackGraphic />} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((industry) => (
            <button
              key={industry}
              onClick={() => setFilter(industry)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === industry ? 'bg-[#05B0BA] text-white' : 'bg-white/5 text-[#8B93A7] hover:bg-white/10'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-10 grid gap-6 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <motion.article
                layout
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden rounded-[32px] border border-white/10 bg-[#141928] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={project.img} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                    <span className="m-5 inline-flex translate-y-2 items-center gap-2 text-sm font-semibold text-white transition duration-300 group-hover:translate-y-0">
                      View Project <FiArrowRight />
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#05B0BA]">{project.category}</p>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[#8B93A7]">{project.industry}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{project.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#8B93A7]">{project.description}</p>
                  <p className="mt-4 text-sm font-semibold text-[#22D3D9]">{project.result}</p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">{cta.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{cta.heading}</h2>
            </div>
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-100">{cta.description}</p>
              <Link to={cta.buttonLink} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#0B0E14]">
                {cta.buttonText} <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
