import { useIam } from '@hanzo/iam/react'
import { Button, H1, Paragraph, ScrollView, XStack, YStack } from '@hanzo/gui'
import { today, type Update } from '../lib/standup'
import { Kicker, Mono, UpdateCard } from './kit'

const DAY = today()

/** Illustrative rows for the pre-auth preview — clearly a sample, not live data. */
const SAMPLE: Update[] = [
  {
    id: 's1',
    user: 'maya',
    day: DAY,
    created: `${DAY}T09:07:00`,
    yesterday: 'Shipped the invoice export and backfilled Q2 rows.',
    today: 'Pairing with Ron on the webhook retry queue.',
    blockers: '',
  },
  {
    id: 's2',
    user: 'ron',
    day: DAY,
    created: `${DAY}T09:12:00`,
    yesterday: 'Traced the flaky auth redirect on staging.',
    today: 'Rolling the retry queue out behind a flag.',
    blockers: 'Waiting on prod DB creds from ops.',
  },
]

/**
 * Signed-out landing. One action: PKCE sign-in with Hanzo (hanzo.id) — no local
 * credential form, IAM owns every credential interaction. Below the pitch is a
 * static preview of the real rollup card the team sees once signed in.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack
        alignItems="center"
        gap="$8"
        paddingHorizontal="$5"
        paddingVertical="$10"
        minHeight="100vh"
      >
        <YStack alignItems="center" gap="$5" maxWidth={640} width="100%">
          <XStack alignItems="center" gap="$2">
            <YStack width={10} height={10} borderRadius={100} backgroundColor="$green10" />
            <Mono fontSize={15} letterSpacing={0.5}>
              standup
            </Mono>
          </XStack>

          <YStack alignItems="center" gap="$3">
            <Kicker>Async standup tracker</Kicker>
            <H1 fontSize={44} lineHeight={48} textAlign="center" letterSpacing={-1}>
              Everyone’s day, in one place.
            </H1>
            <Paragraph fontSize={16} lineHeight={24} textAlign="center" opacity={0.6} maxWidth={520}>
              Each teammate posts yesterday, today, and blockers every morning. The team reads one
              tight rollup — no meeting. Built on Hanzo: @hanzo/gui, IAM sign-in, and org-scoped
              Base storage.
            </Paragraph>
          </YStack>

          <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
            {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
          </Button>
        </YStack>

        <YStack gap="$3" maxWidth={640} width="100%">
          <XStack alignItems="center" gap="$3">
            <Kicker>Preview · today’s rollup</Kicker>
            <YStack flex={1} height={1} backgroundColor="$borderColor" />
            <Mono fontSize={11} opacity={0.4}>
              2 posted · 1 blocked
            </Mono>
          </XStack>
          {SAMPLE.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
