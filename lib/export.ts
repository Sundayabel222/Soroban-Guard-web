import type { Finding } from '@/types/findings'

function download(filename: string, data: Blob) {
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportJson(findings: Finding[]) {
  try {
    const content = findings.length === 0 ? '' : JSON.stringify(findings, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    download('soroban-guard-findings.json', blob)
  } catch (err) {
    console.error('exportJson failed', err)
  }
}

function escapeCsv(value: any) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function exportCsv(findings: Finding[]) {
  try {
    const headers = ['severity', 'check_name', 'function_name', 'file_path', 'line', 'description']
    if (findings.length === 0) {
      const blob = new Blob([headers.join(',')], { type: 'text/csv' })
      download('soroban-guard-findings.csv', blob)
      return
    }

    const rows = findings.map(f => [f.severity, f.check_name, f.function_name, f.file_path, f.line, f.description])
    const csv = [headers.join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    download('soroban-guard-findings.csv', blob)
  } catch (err) {
    console.error('exportCsv failed', err)
  }
}
