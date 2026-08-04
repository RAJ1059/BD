import { useEffect, useState } from 'react'
import PageHeader from '../../components/admin/PageHeader'
import StatCard from '../../components/admin/StatCard'
import { dashboardApi } from '../../api/dashboard'
import { ApiError } from '../../lib/api'

function Bar({ label, count, max }) {
  const pct = max ? Math.round((count / max) * 100) : 0
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-xs text-[#8B93A7]">
        <span className="capitalize">{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#05B0BA] to-[#22D3D9]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState(null)
  const [team, setTeam] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [summaryRes, chartsRes, teamRes] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.charts(),
          dashboardApi.teamOverview(),
        ])
        if (cancelled) return
        setSummary(summaryRes.data)
        setCharts(chartsRes.data)
        setTeam(teamRes.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="text-[#8B93A7]">Loading dashboard...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const leadSourceMax = Math.max(1, ...(charts?.leadSource || []).map((r) => r.count))
  const projectStatusMax = Math.max(1, ...(charts?.projectStatus || []).map((r) => r.count))
  const teamMax = Math.max(1, ...(team?.byRole || []).map((r) => r.count))

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of clients, projects, leads and content." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Clients" value={summary.activeClients} />
        <StatCard label="Running Projects" value={summary.runningProjects} />
        <StatCard label="Completed Projects" value={summary.completedProjects} />
        <StatCard label="Published Blog Posts" value={summary.blogPosts} />
        <StatCard label="Total Leads" value={summary.leads.total} hint={`${summary.leads.newThisWeek} new this week`} />
        <StatCard label="Revenue" connected={false} hint={summary.revenue?.reason} />
        <StatCard label="Pending Payments" connected={false} hint={summary.pendingPayments?.reason} />
        <StatCard label="Active Campaigns" connected={false} hint={summary.activeCampaigns?.reason} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Leads by Source</h3>
          {(charts?.leadSource || []).length === 0 ? (
            <p className="text-sm text-[#5B6478]">No leads yet.</p>
          ) : (
            charts.leadSource.map((row) => <Bar key={row.source} label={row.source} count={row.count} max={leadSourceMax} />)
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Projects by Status</h3>
          {(charts?.projectStatus || []).length === 0 ? (
            <p className="text-sm text-[#5B6478]">No projects yet.</p>
          ) : (
            charts.projectStatus.map((row) => (
              <Bar key={row.status} label={row.status.replace('_', ' ')} count={row.count} max={projectStatusMax} />
            ))
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Team by Role</h3>
          {(team?.byRole || []).length === 0 ? (
            <p className="text-sm text-[#5B6478]">No team members yet.</p>
          ) : (
            team.byRole.map((row) => <Bar key={row.name} label={row.name} count={row.count} max={teamMax} />)
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#141928] p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Recent Activity</h3>
        {(summary.recentActivity || []).length === 0 ? (
          <p className="text-sm text-[#5B6478]">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {summary.recentActivity.map((log) => (
              <li key={log._id} className="flex items-center justify-between text-sm">
                <span className="text-[#E4E4E7]">{log.description}</span>
                <span className="text-xs text-[#5B6478]">{new Date(log.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
