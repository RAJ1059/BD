import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi'

export default function DataTable({
  columns,
  rows,
  rowKey = (row) => row._id,
  loading,
  error,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  page,
  totalPages,
  onPageChange,
  emptyLabel = 'No records found.',
  actions,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111115]">
      {(onSearchChange || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          {onSearchChange ? (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-sm">
              <FiSearch className="text-[#6B6B78]" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-48 bg-transparent text-white outline-none placeholder:text-[#6B6B78]"
              />
            </div>
          ) : (
            <div />
          )}
          {actions}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[#6B6B78]">
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-[#6B6B78]">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-[#6B6B78]">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3 text-[#E4E4E7]">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-sm text-[#9898A6]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-white/10 p-1.5 transition hover:bg-white/5 disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-white/10 p-1.5 transition hover:bg-white/5 disabled:opacity-40"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
