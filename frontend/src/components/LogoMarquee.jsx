export default function LogoMarquee({ items, duration = 22 }) {
  return (
    <div className="marquee-wrap">
      <div className="marquee-track gap-16 py-2" style={{ animationDuration: `${duration}s` }}>
        {[...items, ...items].map((item, index) => (
          <span key={index} className="shrink-0 text-lg font-semibold uppercase tracking-[0.3em] text-[#6B6B78]">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
