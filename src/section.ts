export type Section = 'ac' | 'nonac'

export const SECTION_LABEL: Record<Section, string> = { ac: 'AC section', nonac: 'Non-AC section' }

/** Used when someone opens the plain URL without scanning a table QR. */
const DEFAULT_SECTION: Section = 'ac'
const KEY = 'sahyadri-section'

const isSection = (v: unknown): v is Section => v === 'ac' || v === 'nonac'

function detect(): Section {
  const fromUrl = new URLSearchParams(window.location.search).get('s')
  try {
    if (isSection(fromUrl)) {
      sessionStorage.setItem(KEY, fromUrl)
      return fromUrl
    }
    const saved = sessionStorage.getItem(KEY)
    if (isSection(saved)) return saved
  } catch {
    /* storage blocked (private mode) - fall through */
  }
  return isSection(fromUrl) ? fromUrl : DEFAULT_SECTION
}

/** Resolved once per page load: ?s=ac | ?s=nonac, remembered for the visit. */
export const SECTION: Section = detect()
