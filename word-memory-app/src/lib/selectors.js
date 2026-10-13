// Pure selectors over the persisted progress map. No React here.
import { WORDS } from '../data/words'
import { getStatus, isDue, MASTERED_STAGE } from './srs'
import { dateKey, shiftDayKey, todayKey } from './format'

export function computeCounts(progress, now = Date.now()) {
  let mastered = 0
  let learning = 0
  let fresh = 0
  let due = 0
  for (const w of WORDS) {
    const p = progress[w.id]
    const s = getStatus(p)
    if (s === 'mastered') mastered++
    else if (s === 'learning') learning++
    else fresh++
    if (isDue(p, now)) due++
  }
  return { total: WORDS.length, mastered, learning, newCount: fresh, due }
}

export function getDueWords(progress, now = Date.now()) {
  return WORDS.filter((w) => isDue(progress[w.id], now)).sort(
    (a, b) => progress[a.id].due - progress[b.id].due,
  )
}

export function getNewWords(progress) {
  return WORDS.filter((w) => !progress[w.id] || !progress[w.id].reps)
}

export function getLearnedWords(progress) {
  return WORDS.filter((w) => progress[w.id] && progress[w.id].reps > 0)
}

export function getMistakeWords(progress) {
  return WORDS.filter((w) => progress[w.id] && progress[w.id].inMistakes)
}

// activity[date] holds the unique ids of words studied that day.

function hasActivity(activity, key) {
  return Array.isArray(activity[key]) && activity[key].length > 0
}

// Current consecutive-day streak, counting from today (or yesterday if today
// is still empty).
export function getStreak(activity) {
  let streak = 0
  let key = todayKey()
  if (!hasActivity(activity, key)) key = shiftDayKey(key, -1)
  while (hasActivity(activity, key)) {
    streak++
    key = shiftDayKey(key, -1)
  }
  return streak
}

// Activity series for the last `days` days (oldest first).
export function getActivitySeries(activity, days) {
  const out = []
  let key = todayKey()
  for (let i = days - 1; i >= 0; i--) {
    const k = shiftDayKey(key, -i)
    out.push({ key: k, count: (activity[k] || []).length })
  }
  return out
}

export function todayCount(activity) {
  return (activity[todayKey()] || []).length
}

// How many words fall due on each of the next `days` days.
export function getForecast(progress, days, now = Date.now()) {
  const buckets = []
  for (let i = 0; i < days; i++) {
    buckets.push({ key: dateKey(now + i * 86400000), count: 0 })
  }
  for (const w of WORDS) {
    const p = progress[w.id]
    if (!p || p.stage < 1) continue
    const diffDays = Math.floor((p.due - now) / 86400000)
    const idx = diffDays < 0 ? 0 : diffDays
    if (idx < days) buckets[idx].count++
  }
  return buckets
}

export { MASTERED_STAGE }
