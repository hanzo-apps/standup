import type { BaseRecord } from '@hanzo/base/react'

/**
 * One row of the `updates` collection provisioned from schema.sql. Base manages
 * id/created/updated/owner/org; the app owns these five fields.
 */
export interface Update extends BaseRecord {
  user: string
  day: string
  yesterday: string
  today: string
  blockers: string
}

/** Monospace stack for the utilitarian accents (day keys, labels, counts). */
export const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/** Local calendar day as `YYYY-MM-DD` — the standup `day` key. */
export function today(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * A blockers field reads as "clear" when empty or an explicit none-marker;
 * anything else flags the update as blocked (the amber status dot).
 */
export function isBlocked(blockers: string): boolean {
  const b = blockers.trim().toLowerCase()
  return b !== '' && b !== 'none' && b !== '-' && b !== 'n/a' && b !== 'no' && b !== 'nope'
}

/** Human day label, e.g. `Mon Jul 21`. Falls back to the raw key. */
export function dayLabel(day: string): string {
  const t = Date.parse(`${day}T00:00:00`)
  if (Number.isNaN(t)) return day
  return new Date(t).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Short clock label for a Base `created` timestamp, e.g. `09:41`. */
export function timeLabel(created?: string): string {
  if (!created) return ''
  const t = Date.parse(created)
  if (Number.isNaN(t)) return ''
  return new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/** First name / handle from a display name or email, for tight column headers. */
export function shortName(user: string): string {
  const name = (user || 'someone').trim()
  const at = name.indexOf('@')
  return at > 0 ? name.slice(0, at) : name
}
