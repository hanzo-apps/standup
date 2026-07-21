import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { Button, ScrollView, Text, XStack, YStack } from '@hanzo/gui'
import { dayLabel, today } from '../lib/standup'
import { Mono, Segment } from './kit'
import { Feed } from './feed'
import { Post } from './post'
import { History } from './history'

type Tab = 'today' | 'post' | 'history'

/** Signed-in shell: brand bar, segmented nav, and the three standup views. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'
  const [tab, setTab] = useState<Tab>('today')

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <XStack alignItems="center" gap="$2.5">
          <Wordmark />
          <Mono fontSize={12} opacity={0.4} letterSpacing={0.5}>
            {dayLabel(today())}
          </Mono>
        </XStack>
        <XStack alignItems="center" gap="$3">
          <Mono fontSize={12} opacity={0.5}>
            {who}
          </Mono>
          <Button size="$2" chromeless onPress={() => logout()}>
            Sign out
          </Button>
        </XStack>
      </XStack>

      <XStack
        gap="$1"
        paddingHorizontal="$4"
        paddingVertical="$2"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Segment label="Today" active={tab === 'today'} onPress={() => setTab('today')} />
        <Segment label="Post" active={tab === 'post'} onPress={() => setTab('post')} />
        <Segment label="History" active={tab === 'history'} onPress={() => setTab('history')} />
      </XStack>

      <ScrollView flex={1}>
        <YStack padding="$4" gap="$4" maxWidth={760} width="100%" alignSelf="center">
          {tab === 'today' ? <Feed /> : null}
          {tab === 'post' ? <Post onPosted={() => setTab('today')} /> : null}
          {tab === 'history' ? <History /> : null}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

/** `standup` wordmark with a live status dot. */
function Wordmark() {
  return (
    <XStack alignItems="center" gap="$2">
      <YStack width={9} height={9} borderRadius={100} backgroundColor="$green10" />
      <Text fontSize={16} fontWeight="800" letterSpacing={-0.4}>
        standup
      </Text>
    </XStack>
  )
}
