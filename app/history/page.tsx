'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllScanHistory, clearScanHistory } from '@/lib/history'
import NetworkBadge from '@/components/NetworkBadge'
import { NETWORKS } from '@/types/stellar'
import type { ContractScanRecord } from '@/types/stellar'

type NetworkFilter = 'all' | 'mainnet' | 'testnet' | 'futurenet'

export default function HistoryPage() {
  const router = useRouter()
  const [records, setRecords] = useState<ContractScanRecord[]>([])
  const [filter, setFilter] = useState<NetworkFilter>('all')
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setRecords(getAllScanHistory().sort(
      (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    ))
  }, [])

  function handleRescan(contractId: string) {
    router.push(`/?source=${encodeURIComponent(contractId)}`)
  }

  function handleClear() {
    clearScanHistory()
    setRecords([])
    setConfirmClear(false)
  }

  const filtered = filter === 'all' ? records : records.filter(r => r.network === filter)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-white">Soroban Guard</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/" className="transition hover:text-white">Scanner</Link>
            <Link href="/history" className="text-white">History</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Scan History</h1>

          <div className="flex items-center gap-3">
            {/* Network filter */}
            <div className="flex rounded-lg bg-[#12151f] p-1 ring-1 ring-[#2a2d3a]">
              {(['all', 'mainnet', 'testnet', 'futurenet'] as NetworkFilter[]).map(n => (
                <button
                  key={n}
                  onClick={() => setFilter(n)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    filter === n
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {n === 'all' ? 'All' : n}
                </button>
              ))}
            </div>

            {records.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                Clear history
              </button>
            )}
          </div>
        </div>

        {/* Confirm clear dialog */}
        {confirmClear && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>This will permanently delete all scan history. Are you sure?</span>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-[#2a2d3a] px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState hasRecords={records.length > 0} />
        ) : (
          <div className="space-y-2">
            {filtered.map((record, idx) => (
              <RecordRow key={idx} record={record} onRescan={handleRescan} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function RecordRow({
  record,
  onRescan,
}: {
  record: ContractScanRecord
  onRescan: (contractId: string) => void
}) {
  const network = NETWORKS[record.network] ?? NETWORKS.testnet
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2a2d3a] bg-[#12151f] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm text-slate-300">
          {record.contractId.length > 20
            ? `${record.contractId.slice(0, 12)}…${record.contractId.slice(-8)}`
            : record.contractId}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {new Date(record.scannedAt).toLocaleString()}
        </p>
      </div>

      <NetworkBadge network={network} />

      <div className="flex gap-1.5">
        {record.highCount > 0 && (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
            {record.highCount}H
          </span>
        )}
        {record.mediumCount > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
            {record.mediumCount}M
          </span>
        )}
        {record.lowCount > 0 && (
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
            {record.lowCount}L
          </span>
        )}
        {record.findingCount === 0 && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
            Clean
          </span>
        )}
      </div>

      <button
        onClick={() => onRescan(record.contractId)}
        className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/20"
      >
        Re-scan
      </button>
    </div>
  )
}

function EmptyState({ hasRecords }: { hasRecords: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2a2d3a] py-20 text-center">
      <svg className="mb-4 h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
      <p className="text-base font-medium text-slate-400">
        {hasRecords ? 'No scans match this filter' : 'No scans yet — go scan a contract!'}
      </p>
      {!hasRecords && (
        <Link
          href="/"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Scan a contract
        </Link>
      )}
    </div>
  )
}
