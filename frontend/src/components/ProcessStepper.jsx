import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEP_DURATION = 4

export default function ProcessStepper({ steps }) {
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length)
    }, STEP_DURATION * 1000)
    return () => clearInterval(timer)
  }, [steps.length, cycle])

  const handleSelect = (index) => {
    setActive(index)
    setCycle((c) => c + 1)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {steps.map((step, index) => (
          <button
            key={step.title}
            onClick={() => handleSelect(index)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              index === active ? 'bg-[#05B0BA] text-white' : 'bg-white/5 text-[#8B93A7] hover:bg-white/10'
            }`}
          >
            0{index + 1} {step.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative mt-8 overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0E14] p-8"
        >
          <div className="text-sm font-semibold text-[#05B0BA]">0{active + 1}</div>
          <h3 className="mt-3 text-2xl font-semibold text-white">{steps[active].title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8B93A7]">{steps[active].desc}</p>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
            <motion.div
              key={`${active}-${cycle}`}
              className="h-full bg-gradient-to-r from-[#05B0BA] to-[#22D3D9]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: STEP_DURATION, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
