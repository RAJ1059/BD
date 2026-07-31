import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiAward, FiCompass, FiTarget, FiUsers, FiArrowRight, FiLinkedin } from 'react-icons/fi'
import PageHero from '../components/PageHero'
import Counter from '../components/Counter'

const stats = [
  { value: '8+', label: 'years in business' },
  { value: '320+', label: 'brands served' },
  { value: '94%', label: 'client retention' },
  { value: '12', label: 'countries reached' },
]

const values = [
  { title: 'Clarity', desc: 'We simplify complex growth challenges into clear, focused action.' },
  { title: 'Momentum', desc: 'We move with urgency and maintain momentum from strategy to launch.' },
  { title: 'Precision', desc: 'Every decision is grounded in insight, performance data, and intent.' },
]

const team = [
  { name: 'Nadia Brooks', role: 'Founder & CEO', img: 'https://picsum.photos/seed/nadia/400/400' },
  { name: 'Caleb Torres', role: 'Strategy Director', img: 'https://picsum.photos/seed/caleb/400/400' },
  { name: 'Maya Patel', role: 'Creative Lead', img: 'https://picsum.photos/seed/maya/400/400' },
  { name: 'Owen Reyes', role: 'Head of Engineering', img: 'https://picsum.photos/seed/owen/400/400' },
]

export default function About() {
  return (
    <div className="bg-[#09090B]">
      <PageHero
        eyebrow="About Business Direction"
        title="An elite growth partner for companies ready to scale."
        description="We unite strategy, design, and digital execution to help ambitious brands win in crowded markets with confidence."
      >
        <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold text-white"><Counter value={stat.value} /></p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[32px] border border-white/10 bg-[#111115] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-3xl font-semibold text-white">Our mission</h2>
            <p className="mt-5 text-base leading-8 text-[#9898A6]">To help businesses grow through thoughtful digital strategy, modern websites, high-performing campaigns, and brand experiences that create lasting value.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#A050F8] to-[#FF7439] p-8 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-3xl font-semibold">Our vision</h2>
            <p className="mt-5 text-base leading-8 text-slate-100">To become the go-to growth partner for companies that want premium execution and measurable business impact.</p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-white/10 bg-[#111115] p-8 shadow-sm lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A050F8]">Our values</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-[24px] border border-white/5 bg-[#09090B] p-6 transition hover:border-[#A050F8]/40">
                <div className="text-sm font-semibold text-[#FF7439]">0{index + 1}</div>
                <h3 className="mt-3 text-xl font-semibold text-white">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#9898A6]">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A050F8]">Why us</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">We bring senior-level thinking to every engagement.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[{ icon: FiTarget, title: 'Focused strategy', desc: 'We define the highest-impact growth initiatives first.' }, { icon: FiUsers, title: 'Deep collaboration', desc: 'You get a partner that acts like an extension of your team.' }, { icon: FiCompass, title: 'Cohesive execution', desc: 'Brand, product, and performance are aligned from the start.' }, { icon: FiAward, title: 'Proven results', desc: 'We measure what matters and optimize with discipline.' }].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-[24px] border border-white/10 bg-[#111115] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A050F8] to-[#FF7439] text-white"><Icon size={20} /></div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#9898A6]">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-white/10 bg-[#111115] p-8 shadow-sm lg:p-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A050F8]">Leadership</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Experienced operators and creative leaders.</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group overflow-hidden rounded-[24px] border border-white/10 bg-[#09090B] transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-48 overflow-hidden">
                  <img src={member.img} alt={member.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"><FiLinkedin size={14} /></span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="mt-1 text-sm text-[#6B6B78]">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#A050F8] to-[#FF7439] p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Join our team</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">We're always looking for ambitious talent.</h2>
            </div>
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-100">Curious, craft-obsessed people do their best work here. Let's talk about your next chapter.</p>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#09090B]">
                Get in touch <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
