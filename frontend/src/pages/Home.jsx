import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle, FiZap, FiShield, FiSearch, FiTarget, FiMonitor, FiMail as FiMailIcon } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import { useEffect, useState } from 'react'
import Counter from '../components/Counter'
import SolarSystem from '../components/hero/SolarSystem'
import LogoMarquee from '../components/LogoMarquee'
import ProcessStepper from '../components/ProcessStepper'
import TiltCard from '../components/TiltCard'
import { api } from '../lib/api'

const homeServices = [
  { title: 'SEO Strategy', desc: 'Technical, on-page, and enterprise SEO that compounds visibility.', icon: FiSearch, slug: 'seo' },
  { title: 'Google Ads (PPC)', desc: 'High-intent campaigns engineered for qualified pipeline.', icon: FiTarget, slug: 'google-ads-ppc' },
  { title: 'Social Media', desc: 'Content-led growth for social channels that convert attention.', icon: FiZap, slug: 'social-media-marketing' },
  { title: 'Web & App Development', desc: 'React and WordPress experiences built to scale.', icon: FiMonitor, slug: 'react-wordpress-development' },
]

const stats = [
  { value: '150+', label: 'projects delivered' },
  { value: '40+', label: 'active clients' },
  { value: '92%', label: 'client retention' },
  { value: '6', label: 'industries served' },
]

const credentials = ['Google Partner', 'Meta Business Partner', 'HubSpot Solutions Partner', 'Microsoft Advertising']

const industries = ['Healthcare', 'Fintech', 'Retail', 'Manufacturing', 'Technology', 'Education']

const processSteps = [
  { title: 'Discover', desc: 'We audit your brand, market, and funnel to uncover the highest-leverage growth opportunities.' },
  { title: 'Design', desc: 'Strategy, creative, and experience design come together into a unified growth plan.' },
  { title: 'Launch', desc: 'Campaigns, websites, and content go live with precision and quality assurance.' },
  { title: 'Optimize', desc: 'Continuous testing and reporting keep performance compounding month over month.' },
]

const portfolioItems = [
  { title: 'Northstar Health', tag: 'SEO + Web', img: 'https://picsum.photos/seed/northstar/640/480' },
  { title: 'Aurelia Capital', tag: 'PPC + Analytics', img: 'https://picsum.photos/seed/aurelia/640/480' },
  { title: 'Lumen Retail', tag: 'Ecommerce Growth', img: 'https://picsum.photos/seed/lumen/640/480' },
]

const testimonials = [
  { quote: 'A thoughtful partner that brought strategy, design, and performance together as one team.', name: 'Mina Chen', role: 'CMO, Northstar Health' },
  { quote: 'Their ability to turn insights into growth was exceptional from day one.', name: 'Darren Brooks', role: 'VP Marketing, Aurelia Capital' },
  { quote: 'The website launch elevated both our brand and our conversion rate immediately.', name: 'Sofia Alvarez', role: 'Founder, Lumen Retail' },
  { quote: 'Reporting is transparent and the team acts like a true extension of ours.', name: 'Grace Whitfield', role: 'Head of Growth, Crest Labs' },
]


const faqs = [
  { q: 'What types of businesses do you work with?', a: 'We collaborate with ambitious companies across healthcare, fintech, retail, SaaS, and professional services.' },
  { q: 'Can you support both strategy and execution?', a: 'Yes. We lead both the planning and hands-on delivery of campaigns, websites, and creative systems.' },
  { q: 'Do you offer ongoing retainer support?', a: 'Absolutely. Many clients choose a retainer model for continuous optimization and growth support.' },
]

export default function Home() {
  const [blogPosts, setBlogPosts] = useState([])
  const [blogLoading, setBlogLoading] = useState(true)

  useEffect(() => {
    api
      .get('/public/blogs', { limit: 3 })
      .then((res) => setBlogPosts(res.data))
      .catch(() => setBlogPosts([]))
      .finally(() => setBlogLoading(false))
  }, [])

  return (
    <div className="overflow-hidden bg-[#0B0E14]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B0E14] via-[#141928] to-[#05B0BA] text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top left, #22D3D9 0%, transparent 35%)' }} />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="min-w-0">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22D3D9]" style={{ animation: 'sun-pulse 2.4s ease-in-out infinite' }} />
              <span className="whitespace-normal">Technology & growth partner for ambitious brands</span>
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Turn bold ambition into <span className="bg-gradient-to-r from-[#22D3D9] to-[#05B0BA] bg-clip-text text-transparent">measurable digital growth.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Business Direction combines strategy, creative, and performance marketing to build enterprise-grade experiences that convert.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#05B0BA] px-6 py-3 font-semibold text-white transition hover:scale-[1.02]">
                Schedule a Discovery Call <FiArrowRight />
              </Link>
              <Link to="/services" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Explore Services
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2"><FiCheckCircle /> Award-winning team</div>
              <div className="flex items-center gap-2"><FiCheckCircle /> Fast, transparent execution</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }} className="relative min-w-0">
            <SolarSystem />
          </motion.div>
        </div>
      </section>

      {/* Trusted Clients */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-[#5B6478]">Platforms we build and integrate with</p>
        <div className="relative mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-[#141928]/80 p-8 shadow-sm backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22D3D9]/60 to-transparent" />
          <LogoMarquee items={['HubSpot', 'Salesforce', 'Webflow', 'Shopify', 'Google Ads', 'Meta Ads', 'Slack']} />
        </div>
      </motion.section>

      {/* Credentials */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {credentials.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-medium text-[#8B93A7]">
              <FiCheckCircle className="text-[#05B0BA]" />
              {item}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Services */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        <div
          className="absolute -top-10 right-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #05B0BA 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-end justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Core Services</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Integrated digital growth solutions</h2>
          </div>
          <Link to="/services" className="hidden text-sm font-semibold text-[#05B0BA] sm:inline-flex">View all services →</Link>
        </motion.div>
        <div className="relative mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {homeServices.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                <TiltCard className="h-full rounded-[28px]">
                  <Link to={`/services/${service.slug}`} className="block h-full rounded-[28px] border border-white/10 bg-[#141928] p-7 shadow-sm transition hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white shadow-[0_0_24px_rgba(5,176,186,0.35)]">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#8B93A7]">{service.desc}</p>
                  </Link>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#141928] to-[#1B2133] p-8 lg:p-12">
          <div
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #22D3D9 0%, transparent 70%)' }}
          />
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">About Business Direction</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">A strategic agency for modern growth challenges.</h2>
              <p className="mt-5 text-base leading-8 text-[#8B93A7]">
                We blend consulting rigor with marketing creativity to help ambitious brands scale with clarity, confidence, and measurable momentum.
              </p>
              <div className="mt-6 space-y-4">
                {['Senior-led strategy and execution', 'Transparent reporting and KPI visibility', 'Cross-channel campaigns designed for conversion'].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-white"
                  >
                    <FiShield className="text-[#22D3D9]" /> {item}
                  </motion.div>
                ))}
              </div>
              <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#05B0BA] transition hover:gap-3">
                Learn more about us <FiArrowRight />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[30px] border border-white/10 bg-[#0B0E14] p-8 text-white"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:border-[#22D3D9]/40 hover:bg-white/[0.07]"
                  >
                    <p className="text-3xl font-semibold"><Counter value={stat.value} /></p>
                    <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Why Choose Us</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Built for performance, crafted for trust.</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: 'Enterprise-ready execution', desc: 'Cross-functional teams that move quickly without sacrificing quality.' },
              { title: 'Analytics-led approach', desc: 'Every campaign is measured, optimized, and tied to business outcomes.' },
              { title: 'Brand elevation', desc: 'Refined creative that improves perception and conversion alike.' },
              { title: 'Full-funnel strategy', desc: 'From awareness to loyalty, we design for measurable growth.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
              >
                <TiltCard className="h-full rounded-[24px]">
                  <div className="h-full rounded-[24px] border border-white/10 bg-[#141928] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#05B0BA]/30 hover:shadow-lg">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#8B93A7]">{item.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#141928] p-8 shadow-sm lg:p-12"
        >
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #05B0BA 0%, transparent 70%)' }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Our Process</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">A refined process that keeps momentum high.</h2>
            </div>
          </div>
          <div className="relative mt-10">
            <ProcessStepper steps={processSteps} />
          </div>
        </motion.div>
      </section>

      {/* Industries */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0B0E14] p-8 text-white lg:p-12">
          <div
            className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #22D3D9 0%, transparent 70%)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#22D3D9]">Industries</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Trusted by ambitious companies across sectors.</h2>
            </div>
          </motion.div>
          <div className="relative mt-10 flex flex-wrap gap-3">
            {industries.map((industry, index) => (
              <motion.span
                key={industry}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-[#22D3D9] hover:text-[#22D3D9]"
              >
                {industry}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }} className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Selected work</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Portfolio highlights.</h2>
          </div>
          <Link to="/portfolio" className="hidden text-sm font-semibold text-[#05B0BA] sm:inline-flex">Open portfolio →</Link>
        </motion.div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
            >
              <TiltCard className="h-full rounded-[28px]">
                <div className="group h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#141928] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.img} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                      <span className="m-4 inline-flex translate-y-2 items-center gap-2 text-sm font-semibold text-white transition duration-300 group-hover:translate-y-0">
                        View Project <FiArrowRight />
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#05B0BA]">{item.tag}</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#141928] p-8 shadow-sm lg:p-12"
        >
          <div
            className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #05B0BA 0%, transparent 70%)' }}
          />
          <div className="relative flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Client Voice</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">What leadership teams are saying.</h2>
            </div>
          </div>
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop
            slidesPerView={1}
            spaceBetween={24}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="relative mt-10"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.name}>
                <div className="h-full rounded-[24px] border border-white/10 bg-[#0B0E14] p-6 transition hover:-translate-y-1 hover:border-[#05B0BA]/30">
                  <p className="text-sm leading-7 text-[#8B93A7]">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-sm font-semibold text-white">
                      {item.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-[#5B6478]">{item.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </section>

      {/* Blog */}
      {(blogLoading || blogPosts.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }} className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Insights</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">From the blog.</h2>
            </div>
            <Link to="/blog" className="hidden text-sm font-semibold text-[#05B0BA] sm:inline-flex">Visit blog →</Link>
          </motion.div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {blogLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[168px] animate-pulse rounded-[28px] border border-white/10 bg-[#141928]" />
              ))}

            {!blogLoading &&
              blogPosts.map((post, index) => (
                <motion.div key={post._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.1 }}>
                  <TiltCard className="h-full rounded-[28px]">
                    <Link to={`/blog/${post.slug}`} className="block h-full rounded-[28px] border border-white/10 bg-[#141928] p-7 shadow-sm transition hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#05B0BA]">{post.category?.name || 'General'}</p>
                      <h3 className="mt-4 text-lg font-semibold text-white">{post.title}</h3>
                      <span className="mt-6 inline-flex text-sm font-semibold text-[#05B0BA]">Read more →</span>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">FAQ</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Common questions, answered.</h2>
            <Link to="/faq" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#05B0BA] transition hover:gap-3">View all FAQs <FiArrowRight /></Link>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-[20px] border border-white/10 bg-[#141928] p-6 shadow-sm transition hover:border-white/20"
              >
                <p className="font-semibold text-white">{item.q}</p>
                <p className="mt-2 text-sm leading-7 text-[#8B93A7]">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] p-8 text-white lg:p-12"
        >
          <div
            className="absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', animation: 'sun-pulse 4s ease-in-out infinite' }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Let's build momentum</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Ready for a growth partner with enterprise-level standards?</h2>
            </div>
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-100">From strategy workshops to launch execution, we help growth-minded companies move faster with clarity and confidence.</p>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#141928] px-5 py-3 font-semibold text-white transition hover:scale-[1.03]">
                Start your project <FiArrowRight />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[36px] border border-white/10 bg-[#141928] p-10 text-center shadow-sm"
        >
          <div
            className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #05B0BA 0%, transparent 70%)' }}
          />
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white shadow-[0_0_30px_rgba(5,176,186,0.4)]"
          >
            <FiMailIcon size={22} />
          </motion.div>
          <h2 className="relative text-2xl font-semibold text-white sm:text-3xl">Growth insights, straight to your inbox.</h2>
          <p className="relative max-w-xl text-sm leading-7 text-[#8B93A7]">Join hundreds of marketing leaders getting our monthly playbook on SEO, paid media, and conversion design.</p>
          <form className="relative flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="Your work email" className="w-full rounded-full border border-white/10 px-5 py-3 text-sm outline-none focus:border-[#05B0BA]" />
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B0E14] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.03] hover:bg-[#05B0BA]">
              Subscribe <FiArrowRight />
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  )
}
