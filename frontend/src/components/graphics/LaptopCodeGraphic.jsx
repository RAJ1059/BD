import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const codeLines = [
  { indent: 0, text: 'function launchCampaign() {', color: '#9898A6' },
  { indent: 1, text: "const audience = getAudience('high-intent')", color: '#A050F8' },
  { indent: 1, text: 'const creative = buildCreative(brand)', color: '#FF7439' },
  { indent: 1, text: 'return optimize(audience, creative)', color: '#FF5C35' },
  { indent: 0, text: '}', color: '#9898A6' },
]

export default function LaptopCodeGraphic() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    if (visibleLines >= codeLines.length) {
      const resetTimer = setTimeout(() => {
        setVisibleLines(0)
        setCharCount(0)
      }, 1400)
      return () => clearTimeout(resetTimer)
    }
    const line = codeLines[visibleLines]
    if (charCount < line.text.length) {
      const typeTimer = setTimeout(() => setCharCount((c) => c + 1), 28)
      return () => clearTimeout(typeTimer)
    }
    const nextLineTimer = setTimeout(() => {
      setVisibleLines((v) => v + 1)
      setCharCount(0)
    }, 220)
    return () => clearTimeout(nextLineTimer)
  }, [visibleLines, charCount])

  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[420px]">
      <div
        className="absolute h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A050F8 0%, transparent 70%)' }}
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="rounded-t-xl border border-white/10 bg-[#111115] p-4 shadow-2xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5C35]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF7439]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#A050F8]" />
            <span className="ml-2 text-[11px] text-[#6B6B78]">campaign.js</span>
          </div>
          <div className="h-52 rounded-lg bg-[#09090B] p-4 font-mono text-[13px] leading-6">
            {codeLines.map((line, i) => {
              if (i > visibleLines) return null
              const text = i === visibleLines ? line.text.slice(0, charCount) : line.text
              return (
                <div key={i} style={{ paddingLeft: line.indent * 16, color: line.color }}>
                  {text}
                  {i === visibleLines && <span className="ml-0.5 animate-pulse text-white">|</span>}
                </div>
              )
            })}
          </div>
        </div>
        <div className="h-3 w-full rounded-b-xl bg-gradient-to-b from-[#1c1c22] to-[#0d0d10]" />
        <div className="mx-auto h-1.5 w-24 rounded-b-md bg-[#0d0d10]" />
      </motion.div>
    </div>
  )
}
