import { Script } from '../models/Script.js'

// Providers whose "code" is raw markup/script rather than a bare tracking ID.
const RAW_SNIPPET_PROVIDERS = new Set(['custom_html', 'custom_css', 'custom_js'])

function renderScript(script) {
  if (script.provider === 'custom_css') return { provider: script.provider, code: `<style>${script.code}</style>` }
  if (script.provider === 'custom_js') return { provider: script.provider, code: `<script>${script.code}</script>` }
  if (script.provider === 'custom_html') return { provider: script.provider, code: script.code }

  // Known third-party providers (gtm/ga4/meta_pixel/etc.): return the stored
  // snippet verbatim. Wrapping these in the provider's real boilerplate
  // <script> tags (GTM container snippet, gtag.js loader, fbq init, etc.) is
  // a reasonable v2 enhancement but out of scope here — admins are trusted to
  // paste either the full snippet or just the tracking ID.
  return { provider: script.provider, code: script.code }
}

export async function getActiveScriptsForPlacement(placement, pagePath) {
  const now = new Date()
  const scripts = await Script.find({ placement, isActive: true })

  const matching = scripts.filter((script) => {
    if (script.scheduleStart && script.scheduleStart > now) return false
    if (script.scheduleEnd && script.scheduleEnd < now) return false
    if (script.targetPages.length && !script.targetPages.includes(pagePath)) return false
    return true
  })

  return matching.map(renderScript)
}
