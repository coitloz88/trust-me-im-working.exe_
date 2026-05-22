import { useEffect } from 'react'
import { useShellStore } from '../store/shellStore'

export function useBossKey() {
  const toggleDecoy = useShellStore((s) => s.toggleDecoy)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat) return
      e.preventDefault()
      toggleDecoy()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleDecoy])
}
