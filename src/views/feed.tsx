import { useQuery } from '@hanzo/base/react'
import { XStack, YStack, Paragraph, Spinner } from '@hanzo/gui'
import { dayLabel, isBlocked, today, type Update } from '../lib/standup'
import { Kicker, Mono, UpdateCard } from './kit'

/**
 * Today's standup feed — the team rollup. Reads the `updates` collection
 * filtered to the current `day` (org-scoped by Base), newest first, and shows
 * a posted/blocked tally over one card per teammate.
 */
export function Feed() {
  const day = today()
  const { data, isLoading, error } = useQuery<Update>('updates', {
    filter: `day = "${day}"`,
    sort: '-created',
    realtime: false,
  })

  const blocked = data.filter((u) => isBlocked(u.blockers)).length

  return (
    <YStack gap="$4">
      <XStack alignItems="flex-end" justifyContent="space-between" gap="$3" flexWrap="wrap">
        <YStack gap="$1">
          <Kicker>Today · {dayLabel(day)}</Kicker>
          <Mono fontSize={22} letterSpacing={-0.5}>
            Standup rollup
          </Mono>
        </YStack>
        <XStack gap="$4" alignItems="center">
          <Tally n={data.length} label="posted" />
          <Tally n={blocked} label="blocked" tone={blocked > 0 ? '$yellow10' : undefined} />
        </XStack>
      </XStack>

      {isLoading ? (
        <XStack gap="$2" alignItems="center" opacity={0.6} paddingVertical="$4">
          <Spinner /> <Paragraph>Loading today…</Paragraph>
        </XStack>
      ) : error ? (
        <Paragraph color="$red10">
          Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re
          signed in.
        </Paragraph>
      ) : data.length === 0 ? (
        <YStack
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$4"
          padding="$5"
          alignItems="center"
          gap="$1"
        >
          <Paragraph opacity={0.6}>No updates yet today.</Paragraph>
          <Paragraph opacity={0.4} fontSize={13}>
            Head to “Post” and be the first to check in.
          </Paragraph>
        </YStack>
      ) : (
        <YStack gap="$3">
          {data.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </YStack>
      )}
    </YStack>
  )
}

/** A single mono metric — big number over its label. */
function Tally({ n, label, tone }: { n: number; label: string; tone?: '$yellow10' }) {
  return (
    <YStack alignItems="flex-end">
      <Mono fontSize={22} color={tone} opacity={n === 0 && !tone ? 0.5 : 1}>
        {n}
      </Mono>
      <Kicker>{label}</Kicker>
    </YStack>
  )
}
