import Anthropic from '@anthropic-ai/sdk'
import type { MigraineAttack } from '@/types'
import type { CyclePhaseName } from '@/lib/cyclePhase'

// Lazy client — only instantiate when needed, handle missing key gracefully
function getClient(): Anthropic | null {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true })
}

// ─── Attack story generation ─────────────────────────────────────────────────

export interface AttackStoryInput {
  attack: MigraineAttack
  cyclePhase: CyclePhaseName
  sleepHours?: number
  sleepQuality?: number
  debriefAnswers: {
    location?: string
    activity?: string
    stressors?: string
    whatHelped?: string
    wasDifferent?: string
    rememberForNextTime?: string
  }
}

export async function generateAttackStory(input: AttackStoryInput): Promise<string> {
  const client = getClient()
  if (!client) {
    return buildFallbackStory(input)
  }

  const { attack, cyclePhase, sleepHours, sleepQuality, debriefAnswers } = input
  const durationH = attack.endedAt
    ? Math.round((new Date(attack.endedAt).getTime() - new Date(attack.startedAt).getTime()) / 3_600_000)
    : null

  const prompt = `You are writing a concise, plain-language migraine attack narrative for a patient's health record. Write in second person ("You", "Your"). Be factual, calm, and specific. 200–350 words maximum. No headers, just paragraphs.

Attack data:
- Started: ${new Date(attack.startedAt).toLocaleString()}
- Duration: ${durationH !== null ? `${durationH} hours` : 'still ongoing'}
- Peak pain: ${attack.painLevel}/10
- Symptoms: ${attack.symptoms.join(', ') || 'none logged'}
- Sleep night before: ${sleepHours != null ? `${sleepHours.toFixed(1)}h, quality ${sleepQuality}/5` : 'not logged'}
- Cycle phase: ${cyclePhase}
- Location when it started: ${debriefAnswers.location ?? 'not provided'}
- What you were doing: ${debriefAnswers.activity ?? 'not provided'}
- Unusual stressors: ${debriefAnswers.stressors ?? 'none noted'}
- What helped most: ${debriefAnswers.whatHelped ?? 'not recorded'}
- Was it different from usual?: ${debriefAnswers.wasDifferent ?? 'not answered'}
- Notes to remember: ${debriefAnswers.rememberForNextTime ?? 'none'}
- Free notes: ${attack.notes ?? 'none'}

Write the narrative now:`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    return block.type === 'text' ? block.text.trim() : buildFallbackStory(input)
  } catch {
    return buildFallbackStory(input)
  }
}

function buildFallbackStory(input: AttackStoryInput): string {
  const { attack, cyclePhase, sleepHours, debriefAnswers } = input
  const durationH = attack.endedAt
    ? Math.round((new Date(attack.endedAt).getTime() - new Date(attack.startedAt).getTime()) / 3_600_000)
    : null

  const parts: string[] = []
  const started = new Date(attack.startedAt)
  parts.push(
    `This attack began ${started.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${started.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.`,
  )
  if (debriefAnswers.location) parts.push(`You were ${debriefAnswers.location} when it started.`)
  if (sleepHours != null) {
    parts.push(`You had slept ${sleepHours.toFixed(1)} hours the night before.`)
  }
  parts.push(`You were in the ${cyclePhase} phase of your cycle.`)
  if (attack.symptoms.length > 0) {
    parts.push(`Symptoms included: ${attack.symptoms.slice(0, 6).join(', ')}.`)
  }
  parts.push(`Peak pain reached ${attack.painLevel}/10.`)
  if (durationH !== null) parts.push(`Total duration was approximately ${durationH} hours.`)
  if (debriefAnswers.whatHelped) parts.push(`${debriefAnswers.whatHelped} helped most.`)
  if (debriefAnswers.wasDifferent) parts.push(`Regarding whether this felt different: ${debriefAnswers.wasDifferent}.`)
  return parts.join(' ')
}

// ─── Cere weekly insights ─────────────────────────────────────────────────────

export interface WeeklyInsightInput {
  attacks: MigraineAttack[]
  checkInCount: number
  avgSleepHours?: number
  avgThresholdScore?: number
  cyclePhase: CyclePhaseName
  topTriggers: string[]
  hydrationAvgGlasses?: number
}

export async function generateWeeklyInsights(input: WeeklyInsightInput): Promise<string> {
  const client = getClient()
  if (!client) {
    return buildFallbackInsights(input)
  }

  const { attacks, checkInCount, avgSleepHours, avgThresholdScore, cyclePhase, topTriggers, hydrationAvgGlasses } = input

  const prompt = `You are Cere, a warm and encouraging migraine prevention assistant. Write a brief, plain-language weekly insight summary for your user (2–3 short paragraphs, 150–250 words). Be specific about patterns, warm in tone, and practical with suggestions. No lists, just conversational paragraphs.

Data for the past week:
- Migraine attacks: ${attacks.length}
- Daily check-ins completed: ${checkInCount}/7
- Average sleep: ${avgSleepHours != null ? `${avgSleepHours.toFixed(1)}h/night` : 'not tracked'}
- Average threshold score: ${avgThresholdScore != null ? `${Math.round(avgThresholdScore)}%` : 'not tracked'}
- Current cycle phase: ${cyclePhase}
- Potential triggers logged: ${topTriggers.join(', ') || 'none identified yet'}
- Average daily hydration: ${hydrationAvgGlasses != null ? `${hydrationAvgGlasses.toFixed(0)} glasses` : 'not tracked'}

Write Cere's weekly insights now:`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    return block.type === 'text' ? block.text.trim() : buildFallbackInsights(input)
  } catch {
    return buildFallbackInsights(input)
  }
}

function buildFallbackInsights(input: WeeklyInsightInput): string {
  const { attacks, checkInCount, avgSleepHours, cyclePhase } = input
  const lines: string[] = []
  lines.push(
    attacks.length === 0
      ? `Great week — no migraine attacks logged! Keep up your tracking habits.`
      : `This week you logged ${attacks.length} migraine attack${attacks.length !== 1 ? 's' : ''}.`,
  )
  if (avgSleepHours != null && avgSleepHours < 7) {
    lines.push(`Your average sleep was ${avgSleepHours.toFixed(1)} hours — below the 7-hour threshold that helps protect your migraine threshold. Prioritizing sleep this week could make a real difference.`)
  }
  lines.push(`You're in the ${cyclePhase} phase of your cycle. ${
    cyclePhase === 'luteal' || cyclePhase === 'menstrual'
      ? 'This phase can raise your threshold — be extra gentle with yourself.'
      : 'This phase tends to be gentler on your threshold.'
  }`)
  if (checkInCount < 4) {
    lines.push(`You checked in ${checkInCount} time${checkInCount !== 1 ? 's' : ''} this week. Daily check-ins help Cere give you better predictions — even a 2-minute check-in makes a difference.`)
  }
  return lines.join('\n\n')
}
