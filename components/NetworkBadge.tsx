import type { StellarNetwork } from '@/types/stellar'

interface Props {
  network: StellarNetwork
}

const styles: Record<string, string> = {
  mainnet: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  testnet: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  futurenet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

export default function NetworkBadge({ network }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[network.name] ?? styles.testnet}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {network.name}
    </span>
  )
}
