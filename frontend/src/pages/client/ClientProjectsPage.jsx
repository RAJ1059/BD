import { useEffect, useState } from 'react'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import Badge from '../../components/admin/Badge'
import { clientPortalApi } from '../../api/clientPortal'
import { ApiError } from '../../lib/api'

const STATUS_TONES = { not_started: 'neutral', in_progress: 'blue', on_hold: 'orange', completed: 'green', cancelled: 'red' }

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await clientPortalApi.projects()
        if (!cancelled) setProjects(res.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load projects')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader title="My Projects" description="All projects associated with your account." />
      {error && <Banner>{error}</Banner>}

      {loading ? (
        <p className="text-[#9898A6]">Loading projects...</p>
      ) : projects.length === 0 ? (
        !error && (
          <div className="rounded-2xl border border-white/10 bg-[#111115] p-8 text-center">
            <p className="text-sm text-[#6B6B78]">No projects yet. Your account manager will add one once work kicks off.</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project._id} className="rounded-2xl border border-white/10 bg-[#111115] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{project.name}</p>
                  <p className="mt-1 text-xs text-[#6B6B78]">
                    {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline set'}
                  </p>
                </div>
                <Badge tone={STATUS_TONES[project.status]}>{project.status.replace('_', ' ')}</Badge>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-[#9898A6]">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#A050F8] to-[#FF7439]"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {project.assignedTeam?.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-[#6B6B78]">Team:</span>
                  <div className="flex flex-wrap gap-1">
                    {project.assignedTeam.map((member) => (
                      <span key={member._id} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#E4E4E7]">
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
