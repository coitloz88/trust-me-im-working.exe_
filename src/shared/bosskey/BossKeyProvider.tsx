import type { ReactNode } from 'react'
import { useBossKey } from '../hooks/useBossKey'

export function BossKeyProvider({ children }: { children: ReactNode }) {
  useBossKey()
  return <>{children}</>
}
