import { Link } from 'react-router-dom'
import { FiChevronRight, FiLayout } from 'react-icons/fi'
import PageHeader from '../../components/admin/PageHeader'
import { PAGE_CONTENT_SCHEMAS } from '../../config/pageContentSchemas'

export default function PageContentPage() {
  const pageKeys = Object.keys(PAGE_CONTENT_SCHEMAS)

  return (
    <div>
      <PageHeader title="Page Content" description="Edit the structured content sections of the main public pages." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageKeys.map((key) => {
          const schema = PAGE_CONTENT_SCHEMAS[key]
          return (
            <Link
              key={key}
              to={`/admin/page-content/${key}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#141928] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#05B0BA]/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
                  <FiLayout size={18} />
                </div>
                <div>
                  <p className="font-semibold text-white">{schema.label}</p>
                  <p className="text-xs text-[#5B6478]">{schema.sections.length} sections</p>
                </div>
              </div>
              <FiChevronRight className="text-[#5B6478]" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
