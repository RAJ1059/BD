export default function StatCard({ label, value, hint, connected = true }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111115] p-5">
      <p className="text-sm text-[#9898A6]">{label}</p>
      {connected ? (
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      ) : (
        <p className="mt-2 text-sm text-[#6B6B78]">Not connected</p>
      )}
      {hint && <p className="mt-1 text-xs text-[#6B6B78]">{hint}</p>}
    </div>
  )
}
