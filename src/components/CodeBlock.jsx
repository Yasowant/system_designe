import { useState } from 'react'

// Code block with a copy-to-clipboard button.
export default function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // fallback for http:// or old browsers
      const t = document.createElement('textarea')
      t.value = code
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="code-wrap">
      {lang && <span className="code-lang mono tiny">{lang}</span>}
      <button className={`copy-btn mono tiny ${copied ? 'ok' : ''}`} onClick={copy} aria-label="Copy code">
        {copied ? '✓ copied' : 'copy'}
      </button>
      <pre className="code"><code>{code}</code></pre>
    </div>
  )
}
