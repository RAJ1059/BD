import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { services } from '../data/services'
import PageHero from '../components/PageHero'
import LaptopCodeGraphic from '../components/graphics/LaptopCodeGraphic'

const trustPoints = ['15 specialized service lines', '40+ certified strategists', '98% client satisfaction']

export default function Services() {
  return (
    <div className="bg-[#09090B]">
      <PageHero
        eyebrow="Services"
        title="Comprehensive growth services for modern brands."
        description="We provide end-to-end digital marketing and product design support with premium execution at every stage."
        graphic={<LaptopCodeGraphic />}
      >
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
          {trustPoints.map((point) => (
            <div key={point} className="flex items-center gap-2"><FiCheckCircle className="text-[#FF7439]" /> {point}</div>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  to={`/services/${service.slug}`}
                  className="group block h-full rounded-[28px] border border-white/10 bg-[#111115] p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#A050F8]/50 hover:shadow-xl hover:shadow-[#A050F8]/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A050F8] to-[#FF7439] text-white transition group-hover:scale-105">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#9898A6]">{service.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#A050F8]">
                    Learn more <FiArrowRight className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#A050F8] to-[#FF7439] p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Not sure where to start?</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Let's map the right services for your goals.</h2>
            </div>
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-100">Book a free strategy session and we'll recommend a tailored service mix within days.</p>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#09090B]">
                Talk to a strategist <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
