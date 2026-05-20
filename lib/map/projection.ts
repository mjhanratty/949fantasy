/** Continental US bounds for SVG viewBox 0 0 2000 1200 (matches US_MAP_PATHS). */
const MAP_VIEW = { width: 2000, height: 1200 }
const PAD = { left: 90, right: 90, top: 70, bottom: 90 }

const LAT_MIN = 25.2
const LAT_MAX = 49.2
const LNG_MIN = -124.5
const LNG_MAX = -76.2

export function latLngToMapXY(lat: number, lng: number): { x: number; y: number } {
  const innerW = MAP_VIEW.width - PAD.left - PAD.right
  const innerH = MAP_VIEW.height - PAD.top - PAD.bottom
  const x = PAD.left + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * innerW
  const y = PAD.top + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * innerH
  return {
    x: Math.round(Math.max(PAD.left, Math.min(MAP_VIEW.width - PAD.right, x))),
    y: Math.round(Math.max(PAD.top, Math.min(MAP_VIEW.height - PAD.bottom, y))),
  }
}
