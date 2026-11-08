import { useEffect, useState } from 'react'

// Tracks online/offline and the browser's "install app" prompt.
export function usePwa() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    const bip = (e) => { e.preventDefault(); setPrompt(e) }
    const installed = () => setPrompt(null)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    window.addEventListener('beforeinstallprompt', bip)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      window.removeEventListener('beforeinstallprompt', bip)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return { online, canInstall: !!prompt, install }
}
