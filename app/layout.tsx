import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soroban Guard — Smart Contract Security Scanner',
  description:
    'Automated vulnerability detection for Soroban smart contracts. Scan your Rust/Soroban code for security issues before deployment.',
  keywords: ['soroban', 'smart contract', 'security', 'scanner', 'stellar', 'rust'],
  openGraph: {
    title: 'Soroban Guard',
    description: 'Automated vulnerability detection for Soroban smart contracts.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0f1117] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  )
}
