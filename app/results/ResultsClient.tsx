'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Finding, Severity } from '@/types/findings'
import { decodeFindings } from '@/lib/share'
import FindingsTable from '@/components/FindingsTable'
import EmptyState from '@/components/EmptyState'
import SeverityBadge from '@/components/SeverityBadge'
import ThemeToggle from '@/components/ThemeToggle'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const encoded = searchParams.get('r')
    if (encoded) {
      const decoded = decodeFindings(encoded)
      if (decoded.length > 0) {
        setFindings(decoded)
        return
      }
    }

    const raw = sessionStorage.getItem('sg_findings')
    if (!raw) {
      router.replace('/')
      return
    }
    try {
      setFindings(JSON.parse(raw) as Finding[])
    } catch {
      router.replace('/')
    }
  }, [router, searchParams])

  useEffect(() => {
    if (findings != null) {
      document.title = `${findings.length} findings — Soroban Guard`
    }
    return () => {
      document.title = 'Soroban Guard — Smart Contract Security Scanner'
    }
  }, [findings])

  function handleScanAnother() {
    sessionStorage.removeItem('sg_findings')
    router.push('/')
  }

  function handleCopyJson() {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (findings === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <svg className="spinner h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      </div>
    )
  }

  const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  for (const f of findings) counts[f.severity]++

  const q = searchQuery.toLowerCase()
  const filteredFindings = q
    ? findings.filter(
        f =>
          f.check_name.toLowerCase().includes(q) ||
          f.function_name.toLowerCase().includes(q) ||
          f.file_path.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q),
      )
    : findings

  const canCopy = typeof navigator !== 'undefined' && navigator.clipboard

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={handleScanAnother}
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Soroban Guard
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleScanAnother}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Scan another contract
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {/* Summary bar */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Scan Results</h1>
            <div className="relative">
              <button
                onClick={handleCopyJson}
                disabled={!canCopy}
                title={canCopy ? 'Copy findings as JSON' : 'Clipboard API unavailable'}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-[#1a1d27] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              {copied && (
                <div className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-green-600 px-3 py-1 text-xs text-white">
                  Copied!
                </div>
              )}
            </div>
          </div>
          <p className="mb-6 text-sm text-slate-500">
            {findings.length === 0
              ? 'No issues detected.'
              : `${findings.length} finding${findings.length !== 1 ? 's' : ''} detected across your contract.`}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="Total Findings"
              value={findings.length}
              color="text-white"
              bg="bg-[#1a1d27]"
            />
            <SummaryCard
              label="High"
              value={counts.High}
              color="text-red-400"
              bg="bg-red-500/5"
              border="border-red-500/20"
            />
            <SummaryCard
              label="Medium"
              value={counts.Medium}
              color="text-amber-400"
              bg="bg-amber-500/5"
              border="border-amber-500/20"
            />
            <SummaryCard
              label="Low"
              value={counts.Low}
              color="text-sky-400"
              bg="bg-sky-500/5"
              border="border-sky-500/20"
            />
          </div>
        </div>

        {/* Findings or empty state */}
        {findings.length === 0 ? (
          <EmptyState onScanAnother={handleScanAnother} />
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400">
                Findings — click a row to expand details
              </h2>
              <div className="flex gap-2">
                {(['High', 'Medium', 'Low'] as Severity[]).map(s =>
                  counts[s] > 0 ? (
                    <SeverityBadge key={s} severity={s} size="sm" />
                  ) : null,
                )}
              </div>
            </div>
            {/* Search input */}
            <div className="relative mb-4">
              <label htmlFor="findings-search" className="sr-only">Search findings</label>
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                id="findings-search"
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by check, function, file, or description…"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2 pl-9 pr-9 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Sort: High → Medium → Low */}
            {filteredFindings.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No findings match your search.</p>
            ) : (
              <FindingsTable
                findings={[...filteredFindings].sort((a, b) => {
                  const order: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
                  return order[a.severity] - order[b.severity]
                })}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-slate-600">
        Soroban Guard · Veritas Vaults Network
      </footer>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color,
  bg,
  border = 'border-[var(--border)]',
}: {
  label: string
  value: number
  color: string
  bg: string
  border?: string
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} px-5 py-4`}>
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
