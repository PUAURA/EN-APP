// Spaced-repetition (Leitner / SM-2-lite) engine.
// A word's memory stage 1..6 maps to a review interval; stage 6 = mastered.

export const STAGE_INTERVALS_DAYS = [0, 1, 2, 4, 7, 15, 30] // index === stage
export const MASTERED_STAGE = 6
export const DAY_MS = 24 * 60 * 60 * 1000

const AGAIN_DELAY_MS = 10 * 60 * 1000 // re-queue ~10 min later
const HARD_FRACTION = 0.5

export const RATINGS = {
  again: { label: '不认识', hint: '重新学习' },
  hard: { label: '有点模糊', hint: '稍后巩固' },
  good: { label: '认识', hint: '进入下一阶段' },
}

export function createProgress(wordId, now = Date.now()) {
  return {
    wordId,
    stage: 0,
    due: now,
    lastReviewed: null,
    reps: 0,
    lapses: 0,
    correct: 0,
    wrong: 0,
    lastRating: null,
    inMistakes: false,
    firstLearnedAt: now,
  }
}

// Self-graded review (flashcards).
export function rateWord(wordId, prev, rating, now = Date.now()) {
  const base = prev || createProgress(wordId, now)
  const next = { ...base, wordId }
  next.reps = base.reps + 1
  next.lastReviewed = now
  next.lastRating = rating
  if (!base.firstLearnedAt) next.firstLearnedAt = now

  if (rating === 'good') {
    next.stage = Math.min(base.stage + 1, MASTERED_STAGE)
    next.correct = base.correct + 1
    next.due = now + STAGE_INTERVALS_DAYS[next.stage] * DAY_MS
    if (next.stage >= 4) next.inMistakes = false // recovered
  } else if (rating === 'hard') {
    next.stage = Math.max(base.stage, 1)
    const baseDays = STAGE_INTERVALS_DAYS[next.stage] || 1
    next.due = now + Math.max(0.5, baseDays * HARD_FRACTION) * DAY_MS
  } else {
    // 'again'
    next.stage = Math.max(1, base.stage - 2)
    next.lapses = base.lapses + 1
    next.wrong = base.wrong + 1
    next.inMistakes = true
    next.due = now + AGAIN_DELAY_MS
  }
  return next
}

// Result from quiz / spelling test. Wrong answers go to the mistake book.
export function recordQuiz(wordId, prev, correct, now = Date.now()) {
  const base = prev || createProgress(wordId, now)
  const next = { ...base, wordId }
  next.reps = base.reps + 1
  next.lastReviewed = now
  next.lastRating = correct ? 'good' : 'again'
  if (!base.firstLearnedAt) next.firstLearnedAt = now

  if (correct) {
    next.correct = base.correct + 1
    next.stage = Math.min(base.stage + 1, MASTERED_STAGE)
    next.due = now + STAGE_INTERVALS_DAYS[next.stage] * DAY_MS
    if (next.stage >= 4) next.inMistakes = false
  } else {
    next.wrong = base.wrong + 1
    next.lapses = base.lapses + 1
    next.stage = Math.max(1, base.stage - 1)
    next.inMistakes = true
    next.due = now + AGAIN_DELAY_MS
  }
  return next
}

export function getStatus(p) {
  if (!p || !p.reps) return 'new'
  if (p.stage >= MASTERED_STAGE) return 'mastered'
  return 'learning'
}

export function isDue(p, now = Date.now()) {
  return !!p && p.stage >= 1 && p.due <= now
}

export const STATUS_LABEL = { new: '新词', learning: '学习中', mastered: '已掌握' }
