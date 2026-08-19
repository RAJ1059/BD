import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import { servicesApi } from '../api/services'
import { getIcon } from '../lib/iconRegistry'

export default function ServiceDetail() {
  const { slug } = useParams()
  const [services, setServices] = useState(null)

  useEffect(() => {
    servicesApi
      .list()
      .then((res) => setServices(res.data))
      .catch(() => setServices([]))
  }, [])

  if (services === null) return <div className="min-h-[60vh] bg-[#0B0E14]" />

  const service = services.find((s) => s.slug === slug)
  if (!service) return <Navigate to="/services" replace />

  const Icon = getIcon(service.icon)
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3)

  return (
    <div className="bg-[#0B0E14]">
      <section className="bg-gradient-to-br from-[#0B0E14] to-[#141928] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B93A7] hover:text-white">
            <FiArrowLeft /> All services
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
              <Icon size={24} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#22D3D9]">Service</p>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">{service.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{service.description}</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#05B0BA] px-6 py-3 font-semibold text-white transition hover:scale-[1.02]">
            Book a consult <FiArrowRight />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[32px] border border-white/10 bg-[#141928] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-white">What's included</h2>
            <ul className="mt-6 space-y-4">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-7 text-[#8B93A7]">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-[#05B0BA]" /> {feature}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] p-8 text-white shadow-sm">
            <h2 className="text-2xl font-semibold">Why it matters</h2>
            <ul className="mt-6 space-y-4">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm leading-7 text-slate-100">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-white" /> {benefit}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Ready to start?</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Let's talk about {service.title.toLowerCase()} for your business.</h2>
            </div>
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-100">Get a free strategy session with our team and a tailored plan within days, not weeks.</p>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#0B0E14]">
                Schedule a call <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white">Related services</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {related.map((item) => {
            const RelIcon = getIcon(item.icon)
            return (
              <Link key={item.slug} to={`/services/${item.slug}`} className="rounded-[24px] border border-white/10 bg-[#141928] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
                  <RelIcon size={18} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#8B93A7]">{item.summary}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
