import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

// Builds a CSV file from plain objects and streams it back as a download.
// `columns` is [{ key, header }]; `rows` is an array of plain objects.
export function exportToCsv(res, filename, columns, rows) {
  const table = [
    columns.map((c) => c.header),
    ...rows.map((row) => columns.map((c) => row[c.key] ?? '')),
  ]
  const csv = stringify(table)

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(csv)
}

// Parses an uploaded CSV buffer into an array of header-keyed row objects.
export function parseCsvBuffer(buffer) {
  return parse(buffer, { columns: true, skip_empty_lines: true, trim: true })
}
