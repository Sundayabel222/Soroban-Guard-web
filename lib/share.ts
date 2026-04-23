import type { Finding } from '@/types/findings'

export function encodeFindings(findings: Finding[]): string {
  const json = JSON.stringify(findings)
  return encodeURIComponent(btoa(json))
}

export function decodeFindings(param: string): Finding[] {
  try {
    const json = atob(decodeURIComponent(param))
    return JSON.parse(json) as Finding[]
  } catch {
    return []
  }
}
