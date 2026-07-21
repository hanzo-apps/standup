import { useQuery } from '@hanzo/base/react'
import { Paragraph, Spinner, Text, XStack, YStack } from '@hanzo/gui'
import { dayLabel, isBlocked, shortName, timeLabel, type Update } from '../lib/standup'
import { Dot, Kicker, Mono } from './kit'

/**
 * History — every past check-in as a dense, single-line log grouped by day
 * (newest first). Deliberately terser than the feed: scan weeks at a glance.
 */
export function History() {
  const { data, isLoading, error } = useQuery<Update>('updates', {
    sort: '-created',
    perPage: 200,
    realtime: false,
  })

  const days = groupByDay(data)

  if (isLoading) {
    return (
      <XStack gap="$2" alignItems="center" opacity={0.6} paddingVertical="$4">
        <Spinner /> <Paragraph>Loading history…</Paragraph>
      </XStack>
    )
  }
  if (error) {
    return <Paragraph color="$red10">Couldn’t reach Base ({error.message}).</Paragraph>
  }
  if (days.length === 0) {
    return <Paragraph opacity={0.6}>No check-ins recorded yet.</Paragraph>
  }

  return (
    <YStack gap="$5">
      {days.map(({ day, items }) => {
        const blocked = items.filter((u) => isBlocked(u.blockers)).length
        return (
          <YStack key={day} gap="$1">
            <XStack alignItems="center" gap="$3" paddingBottom="$1.5">
              <Mono fontSize={13} letterSpacing={0.5}>
                {dayLabel(day)}
              </Mono>
              <YStack flex={1} height={1} backgroundColor="$borderColor" />
              <Kicker>{items.length} posted</Kicker>
              {blocked > 0 ? (
                <Mono fontSize={11} letterSpacing={1} textTransform="uppercase" color="$yellow10">
                  {blocked} blocked
                </Mono>
              ) : null}
            </XStack>
            {items.map((u) => (
              <XStack
                key={u.id}
                alignItems="center"
                gap="$2.5"
                paddingVertical="$1.5"
                borderBottomWidth={1}
                borderColor="$borderColor"
              >
                <Dot blocked={isBlocked(u.blockers)} size={6} />
                <Text fontSize={13} fontWeight="600" minWidth={92}>
                  {shortName(u.user)}
                </Text>
                <Paragraph flex={1} fontSize={13} opacity={0.7} numberOfLines={1}>
                  {u.today.trim() || '—'}
                </Paragraph>
                <Mono fontSize={11} opacity={0.35}>
                  {timeLabel(u.created)}
                </Mono>
              </XStack>
            ))}
          </YStack>
        )
      })}
    </YStack>
  )
}

/** Bucket rows into day groups, preserving the newest-first order they arrive in. */
function groupByDay(rows: Update[]): { day: string; items: Update[] }[] {
  const order: string[] = []
  const map = new Map<string, Update[]>()
  for (const r of rows) {
    let bucket = map.get(r.day)
    if (!bucket) {
      bucket = []
      map.set(r.day, bucket)
      order.push(r.day)
    }
    bucket.push(r)
  }
  return order.map((day) => ({ day, items: map.get(day) ?? [] }))
}
