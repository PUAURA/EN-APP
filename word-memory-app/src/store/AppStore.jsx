import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { WORDS } from '../data/words'
import { rateWord as srsRate, recordQuiz as srsQuiz } from '../lib/srs'
import { todayKey } from '../lib/format'

const STORAGE_KEY = 'wordtrail.v1'

const DEFAULT_STATE = {
  progress: {},
  settings: { dailyNew: 10, dailyGoal: 20 },
  activity: {}, // dateKey -> [unique word ids studied that day]
  quizHistory: [], // [{ date, mode, total, correct }]
  customWords: [], // imported vocabulary, tag: 'custom'
}

function freshDefault() {
  return {
    progress: {},
    settings: { ...DEFAULT_STATE.settings },
    activity: {},
    quizHistory: [],
    customWords: [],
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshDefault()
    const parsed = JSON.parse(raw)
    return {
      progress: parsed.progress || {},
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      activity: parsed.activity || {},
      quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
      customWords: Array.isArray(parsed.customWords) ? parsed.customWords : [],
    }
  } catch {
    return freshDefault()
  }
}

function markActivity(activity, key, wordId) {
  const day = activity[key] || []
  if (day.includes(wordId)) return activity
  return { ...activity, [key]: [...day, wordId] }
}

function reducer(state, action) {
  switch (action.type) {
    case 'rate': {
      const now = Date.now()
      const key = todayKey()
      const next = srsRate(action.wordId, state.progress[action.wordId], action.rating, now)
      return {
        ...state,
        progress: { ...state.progress, [action.wordId]: next },
        activity: markActivity(state.activity, key, action.wordId),
      }
    }
    case 'quizResult': {
      const now = Date.now()
      const key = todayKey()
      const next = srsQuiz(action.wordId, state.progress[action.wordId], action.correct, now)
      return {
        ...state,
        progress: { ...state.progress, [action.wordId]: next },
        activity: markActivity(state.activity, key, action.wordId),
      }
    }
    case 'quizSession':
      return {
        ...state,
        quizHistory: [action.session, ...state.quizHistory].slice(0, 50),
      }
    case 'setSetting':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    case 'addCustomWords':
      return { ...state, customWords: [...state.customWords, ...action.words] }
    case 'removeCustomWord': {
      const progress = { ...state.progress }
      delete progress[action.id]
      return {
        ...state,
        progress,
        customWords: state.customWords.filter((w) => w.id !== action.id),
      }
    }
    case 'clearCustomWords': {
      const progress = { ...state.progress }
      for (const w of state.customWords) delete progress[w.id]
      return { ...state, progress, customWords: [] }
    }
    case 'reset':
      // Reset progress/settings but keep the user's imported vocabulary.
      return { ...freshDefault(), customWords: state.customWords }
    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full / unavailable — prototype continues in memory */
    }
  }, [state])

  const value = useMemo(
    () => ({
      state,
      words: [...WORDS, ...state.customWords],
      rateWord: (wordId, rating) => dispatch({ type: 'rate', wordId, rating }),
      quizResult: (wordId, correct) => dispatch({ type: 'quizResult', wordId, correct }),
      saveQuizSession: (session) => dispatch({ type: 'quizSession', session }),
      setSetting: (key, value) => dispatch({ type: 'setSetting', key, value }),
      addCustomWords: (words) => dispatch({ type: 'addCustomWords', words }),
      removeCustomWord: (id) => dispatch({ type: 'removeCustomWord', id }),
      clearCustomWords: () => dispatch({ type: 'clearCustomWords' }),
      resetAll: () => dispatch({ type: 'reset' }),
    }),
    [state],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

// The active vocabulary: built-in words followed by imported ones.
export function useWords() {
  return useApp().words
}
