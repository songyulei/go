import { useEffect, useState } from 'react'

import { getPlatformSnapshot } from '@/services/platformService'
import { usePlatformStore } from '@/store/usePlatformStore'
import type { PlatformSnapshot } from '@/types/platform'

export function usePlatformSnapshot() {
  const selectedLanguage = usePlatformStore((state) => state.selectedLanguage)
  const [snapshot, setSnapshot] = useState<PlatformSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    getPlatformSnapshot(selectedLanguage).then((data) => {
      if (mounted) {
        setSnapshot(data)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [selectedLanguage])

  return { snapshot, loading, selectedLanguage }
}
