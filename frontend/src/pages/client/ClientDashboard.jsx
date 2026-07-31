import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import StatCard from '../../components/admin/StatCard'
import Badge from '../../components/admin/Badge'
import { clientPortalApi } from '../../api/clientPortal'
import { ApiError } from '../../lib/api'

const STATUS_TONES = { not_started: 'neutral', in_progress: 'blue', on_hold: 'orange', completed: 'green', cancelled: 'red' }

export default function ClientDashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await clientPortalApi.summary()
        if (!cancelled) setSummary(res.data)
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

  if (loading) return <p className="text-[#9898A6]">Loading dashboard...</p>

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your projects and account." />
        <Banner>{error}</Banner>
      </div>
    )
  }

  const { client, projects, recentProjects } = summary

  return (
    <div>
      <PageHeader title={`Welcome, ${client.contactPerson}`} description={`${client.companyName} · Account overview`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Projects" value={projects.total} />
        <StatCard label="In Progress" value={projects.running} />
        <StatCard label="Completed" value={projects.completed} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#111115] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Projects</h3>
          <Link to="/client/projects" className="text-xs font-medium text-[#A050F8] hover:underline">
            View all
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-[#6B6B78]">No projects yet. Your account manager will add one once work kicks off.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentProjects.map((project) => (
              <li key={project._id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{project.name}</p>
                  <p className="text-xs text-[#6B6B78]">
                    {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline set'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-[#A050F8]" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                  <Badge tone={STATUS_TONES[project.status]}>{project.status.replace('_', ' ')}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {client.accountManager && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111115] p-5">
          <h3 className="mb-2 text-sm font-semibold text-white">Your Account Manager</h3>
          <p className="text-sm text-[#E4E4E7]">{client.accountManager.name}</p>
          <p className="text-xs text-[#6B6B78]">{client.accountManager.email}</p>
        </div>
      )}
    </div>
  )
}
