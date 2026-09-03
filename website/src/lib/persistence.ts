import type { WebsiteDocument } from './website-document'

const STORAGE_KEY = 'agent-ux-website-document:v1'

export function loadDocument(fallback: WebsiteDocument): WebsiteDocument {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as WebsiteDocument : fallback
  } catch { return fallback }
}

export function saveDocument(document: WebsiteDocument) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
}

export function downloadDocument(value: WebsiteDocument) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = 'agent-ux-immersive-scene.json'
  link.click()
  URL.revokeObjectURL(url)
}
