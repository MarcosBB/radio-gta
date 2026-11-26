import { WHEEL } from '@/config'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const DIAL_VISIBLE = 6

export const mod = (a, n) => ((a % n) + n) % n

// Slot size comes from the arc between two slot centres, so icons never touch however many
// stations a game has. The selected slot grows and moves outward, so it needs extra room.
export function wheelGeometry({ width, height, count, variant }) {
  const { slotMax, slotMin, slotFill, selectedScale, selectedPush } = WHEEL
  const fit = (R, max) => clamp((slotFill * 2 * Math.PI * R) / count, slotMin, max)

  if (variant === 'dial') {
    // Centre on the left edge. The radius grows past half the height when a game has many
    // stations, so only the stretch of rim around the selector is on screen (about
    // DIAL_VISIBLE slots) and dragging brings the rest into view.
    let R = height / 2
    let slot = slotMin
    for (let k = 0; k < 4; k++) {
      slot = fit(R, 64)
      const reach = slot * selectedPush + (slot * selectedScale) / 2
      const half = height / 2 - reach - 4
      const wide = width - reach - 12
      const needed = (DIAL_VISIBLE * 180) / count
      const target = needed >= 90 ? half : half / Math.sin((needed * Math.PI) / 180)
      R = Math.max(Math.min(half, wide), Math.min(target, wide))
    }
    return { cx: 0, cy: height / 2, R, slot, push: slot * selectedPush, selector: 90 }
  }

  const S = Math.min(width, height)
  let R = S / 2 - 60
  let slot = slotMin
  for (let k = 0; k < 4; k++) {
    slot = fit(R, slotMax)
    R = S / 2 - (slot * selectedScale) / 2 - slot * selectedPush - 22
  }
  return { cx: width / 2, cy: height / 2, R, slot, push: slot * selectedPush, selector: 0 }
}

// Angle of a point around the centre, clockwise from 12 o'clock, in degrees.
export const angleOf = (x, y) => (Math.atan2(x, -y) * 180) / Math.PI

export const nearestIndex = (rotation, selector, step, count) => mod(Math.round((selector - rotation) / step), count)
