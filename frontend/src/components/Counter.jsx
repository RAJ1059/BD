import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function Counter({ value, duration = 1.6, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(0)
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  const prefix = String(value).match(/^[^0-9]*/)?.[0] ?? ''
  const trailingSuffix = String(value).match(/[^0-9.]*$/)?.[0] ?? ''

  useEffect(() => {
    if (!inView) return
    let start = null
    const step = (timestamp) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / (duration * 1000), 1)
      setDisplay(numeric * progress)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, numeric, duration])

  const formatted = numeric % 1 === 0 ? Math.round(display).toLocaleString() : display.toFixed(1)

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix || trailingSuffix}
    </span>
  )
}
