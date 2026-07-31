import { FiSearch, FiTarget, FiZap, FiMonitor, FiPenTool } from 'react-icons/fi'

const planets = [
  { icon: FiSearch, label: 'SEO', radius: 88, size: 44, duration: 18, angle: 0, color: '#A050F8' },
  { icon: FiTarget, label: 'PPC', radius: 128, size: 46, duration: 24, angle: 72, reverse: true, color: '#FF7439' },
  { icon: FiZap, label: 'Social', radius: 168, size: 44, duration: 30, angle: 144, color: '#FF5C35' },
  { icon: FiMonitor, label: 'Web', radius: 205, size: 48, duration: 36, angle: 216, reverse: true, color: '#A050F8' },
  { icon: FiPenTool, label: 'Brand', radius: 238, size: 42, duration: 42, angle: 288, color: '#FF7439' },
]

export default function SolarSystem() {
  return (
    <div className="relative mx-auto flex h-[440px] w-[440px] max-w-full items-center justify-center sm:h-[520px] sm:w-[520px]">
      {/* Ambient depth */}
      <div
        className="absolute h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A050F8 0%, transparent 70%)' }}
      />
      <div
        className="absolute h-64 w-64 translate-x-10 translate-y-6 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #FF7439 0%, transparent 70%)' }}
      />
      <div className="orbit-dot-grid absolute inset-0 rounded-full" />

      {/* Sun */}
      <div className="relative z-10">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#A050F8] to-[#FF7439] shadow-2xl sm:h-28 sm:w-28"
          style={{ animation: 'sun-pulse 3.2s ease-in-out infinite' }}
        >
          <span className="text-base font-bold tracking-tight text-white sm:text-lg">BD</span>
        </div>
      </div>

      {planets.map((planet) => {
        const Icon = planet.icon
        const size = planet.radius * 2
        const spinDirection = planet.reverse ? 'reverse' : 'normal'
        const counterDirection = planet.reverse ? 'normal' : 'reverse'
        // Negative delay pre-advances the rotation so items start spread
        // evenly around the ring instead of all stacking at the top.
        const delay = -((planet.angle / 360) * planet.duration)
        return (
          <div key={planet.label} className="orbit-ring" style={{ '--orbit-size': `${size}px` }}>
            <div
              className="orbit-spin"
              style={{ animationDuration: `${planet.duration}s`, animationDirection: spinDirection, animationDelay: `${delay}s` }}
            >
              <div className="orbit-anchor">
                <div
                  className="orbit-counter"
                  style={{ animationDuration: `${planet.duration}s`, animationDirection: counterDirection, animationDelay: `${delay}s` }}
                >
                  <div
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-[#111115]/90 px-3 py-2.5 backdrop-blur-md transition-transform duration-300 hover:scale-105"
                    style={{ width: planet.size + 26, boxShadow: `0 12px 28px -12px ${planet.color}66, 0 0 0 1px rgba(255,255,255,0.04)` }}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${planet.color}22` }}
                    >
                      <Icon size={14} style={{ color: planet.color }} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide text-white">{planet.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
