export default function StatCard({ label, value, hint, connected = true }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
      <p className="text-sm text-[#8B93A7]">{label}</p>
      {connected ? (
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      ) : (
        <p className="mt-2 text-sm text-[#5B6478]">Not connected</p>
      )}
      {hint && <p className="mt-1 text-xs text-[#5B6478]">{hint}</p>}
    </div>
  )
}
