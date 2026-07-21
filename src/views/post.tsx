import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useMutation, useQuery } from '@hanzo/base/react'
import { Button, Paragraph, TextArea, XStack, YStack } from '@hanzo/gui'
import { dayLabel, today, type Update } from '../lib/standup'
import { Dot, Kicker, Mono } from './kit'

/**
 * Post (or edit) your update for today. Base stamps owner+org; we also store the
 * display `user` so the feed can render a name. If you already checked in today,
 * the form loads that entry and saves over it — one update per person per day.
 */
export function Post({ onPosted }: { onPosted: () => void }) {
  const { user } = useIam()
  const me = user?.displayName || user?.name || user?.email || 'you'
  const day = today()

  const { data, refetch } = useQuery<Update>('updates', {
    filter: `day = "${day}"`,
    realtime: false,
  })
  const mine = data.find((u) => u.user === me)

  const create = useMutation('updates', 'create')
  const update = useMutation('updates', 'update')
  const saving = create.isLoading || update.isLoading
  const err = create.error || update.error

  const [yesterday, setYesterday] = useState('')
  const [todayText, setTodayText] = useState('')
  const [blockers, setBlockers] = useState('')

  // Load an existing entry once it arrives (keyed on its id so typing isn't clobbered).
  useEffect(() => {
    if (!mine) return
    setYesterday(mine.yesterday)
    setTodayText(mine.today)
    setBlockers(mine.blockers)
  }, [mine?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (saving || !todayText.trim()) return
    const fields = {
      user: me,
      day,
      yesterday: yesterday.trim(),
      today: todayText.trim(),
      blockers: blockers.trim(),
    }
    if (mine) await update.mutate({ id: mine.id, ...fields })
    else await create.mutate(fields)
    await refetch()
    onPosted()
  }

  return (
    <YStack gap="$4" maxWidth={560}>
      <YStack gap="$1">
        <XStack alignItems="center" gap="$2">
          <Kicker>{mine ? 'Editing today' : 'New check-in'}</Kicker>
          {mine ? <Dot blocked={false} size={6} /> : null}
        </XStack>
        <Mono fontSize={22} letterSpacing={-0.5}>
          {dayLabel(day)}
        </Mono>
      </YStack>

      <Field label="Yesterday" placeholder="What you wrapped up" value={yesterday} onChangeText={setYesterday} />
      <Field label="Today" placeholder="What you’re focused on" value={todayText} onChangeText={setTodayText} />
      <Field
        label="Blockers"
        placeholder="Anything in your way (leave empty if clear)"
        value={blockers}
        onChangeText={setBlockers}
      />

      {err ? <Paragraph color="$red10">{err.message}</Paragraph> : null}

      <XStack gap="$3" alignItems="center">
        <Button theme="active" disabled={saving || !todayText.trim()} onPress={save}>
          {saving ? 'Saving…' : mine ? 'Update check-in' : 'Post check-in'}
        </Button>
        {!todayText.trim() ? (
          <Paragraph opacity={0.4} fontSize={13}>
            “Today” is required.
          </Paragraph>
        ) : null}
      </XStack>
    </YStack>
  )
}

/** A labelled multiline field. */
function Field({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string
  placeholder: string
  value: string
  onChangeText: (v: string) => void
}) {
  return (
    <YStack gap="$2">
      <Kicker>{label}</Kicker>
      <TextArea
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        minHeight={72}
        borderColor="$borderColor"
        backgroundColor="$color1"
      />
    </YStack>
  )
}
