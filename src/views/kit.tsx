import type { ReactNode } from 'react'
import {
  Circle,
  Paragraph,
  SizableText,
  Text,
  XStack,
  YStack,
  type GetProps,
} from '@hanzo/gui'
import { MONO, isBlocked, shortName, timeLabel, type Update } from '../lib/standup'

/** Monospace text — the utilitarian accent (day keys, labels, counts, times). */
export function Mono(props: GetProps<typeof Text>) {
  return <Text fontFamily={MONO} {...props} />
}

/** Small uppercase mono kicker/label. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <Mono fontSize={11} letterSpacing={2} textTransform="uppercase" opacity={0.5}>
      {children}
    </Mono>
  )
}

/** Status dot in a soft halo — green = clear, amber = blocked. */
export function Dot({ blocked, size = 8 }: { blocked: boolean; size?: number }) {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      width={size + 10}
      height={size + 10}
      borderRadius={100}
      backgroundColor={blocked ? '$yellow4' : '$green4'}
    >
      <Circle size={size} backgroundColor={blocked ? '$yellow10' : '$green10'} />
    </XStack>
  )
}

/** One labelled column of an update (Yesterday / Today / Blockers). */
export function Column({
  label,
  value,
  blocked,
}: {
  label: string
  value: string
  blocked?: boolean
}) {
  const empty = !value.trim()
  return (
    <YStack flex={1} minWidth={168} gap="$1.5">
      <Kicker>{label}</Kicker>
      <Paragraph
        fontSize={14}
        lineHeight={20}
        opacity={empty ? 0.3 : 0.92}
        color={blocked ? '$yellow10' : '$color'}
      >
        {empty ? '—' : value}
      </Paragraph>
    </YStack>
  )
}

/** A full standup entry — header (dot · who · time) over three tight columns. */
export function UpdateCard({ update }: { update: Update }) {
  const blocked = isBlocked(update.blockers)
  return (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$4"
      backgroundColor="$color1"
      padding="$3.5"
      gap="$3"
    >
      <XStack alignItems="center" gap="$2.5">
        <Dot blocked={blocked} />
        <Text fontSize={15} fontWeight="700">
          {shortName(update.user)}
        </Text>
        <XStack flex={1} />
        {blocked ? (
          <Mono fontSize={10} letterSpacing={1} textTransform="uppercase" color="$yellow10">
            blocked
          </Mono>
        ) : null}
        <Mono fontSize={11} opacity={0.4}>
          {timeLabel(update.created)}
        </Mono>
      </XStack>
      <XStack gap="$4" flexWrap="wrap">
        <Column label="Yesterday" value={update.yesterday} />
        <Column label="Today" value={update.today} />
        <Column label="Blockers" value={update.blockers} blocked={blocked} />
      </XStack>
    </YStack>
  )
}

/** Segmented-control tab used by the signed-in shell. */
export function Segment({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <XStack
      onPress={onPress}
      cursor="pointer"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$3"
      backgroundColor={active ? '$color3' : 'transparent'}
      hoverStyle={{ backgroundColor: active ? '$color3' : '$color2' }}
    >
      <SizableText
        fontFamily={MONO}
        fontSize={12}
        letterSpacing={1}
        textTransform="uppercase"
        opacity={active ? 1 : 0.5}
      >
        {label}
      </SizableText>
    </XStack>
  )
}
