import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { TAGS } from '../data/words'
import { IconList, IconText, IconPencil, IconCheck, IconX, IconTrophy, IconArrowRight } from '../components/Icons'

const MODES = [
  {
    key: 'en2cn',
    icon: IconList,
    title: '看英文选中文',
    desc: '看到英文单词，选出正确的中文释义',
  },
  {
    key: 'cn2en',
    icon: IconText,
    title: '看中文选英文',
    desc: '看到中文释义，选出对应的英文单词',
  },
  {
    key: 'spell',
    icon: IconPencil,
    title: '看中文拼写',
    desc: '根据中文释义，拼写出英文字母',
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(mode, words, progress, count = 10) {
  const learned = words.filter((w) => progress[w.id] && progress[w.id].reps > 0)
  const pool = learned.length >= 6 ? learned : words
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((w) => {
      if (mode === 'spell') return { word: w, type: 'spell' }
      const field = mode === 'en2cn' ? 'cn' : 'word'
      const others = shuffle(
        words.filter((x) => x.id !== w.id && x[field] !== w[field]),
      ).slice(0, 3)
      const options = shuffle([w, ...others]).map((o) => ({
        text: o[field],
        correct: o.id === w.id,
      }))
      return { word: w, type: 'choice', options }
    })
}

export default function Quiz() {
  const { state, quizResult, saveQuizSession, words } = useApp()
  const { progress } = state

  const [phase, setPhase] = useState('setup')
  const [mode, setMode] = useState('en2cn')
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [results, setResults] = useState([])

  const current = questions[index]

  const start = (m) => {
    setMode(m)
    setQuestions(buildQuestions(m, words, progress))
    setIndex(0)
    setSelected(null)
    setInput('')
    setChecked(false)
    setWasCorrect(false)
    setResults([])
    setPhase('running')
  }

  const answer = (correct) => {
    if (checked) return
    setChecked(true)
    setWasCorrect(correct)
    quizResult(current.word.id, correct)
    setResults((r) => [...r, { word: current.word, correct }])
  }

  const chooseOption = (opt, i) => {
    if (checked) return
    setSelected(i)
    answer(opt.correct)
  }

  const submitSpell = () => {
    if (checked || !input.trim()) return
    answer(input.trim().toLowerCase() === current.word.word.toLowerCase())
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      const correct = results.filter((r) => r.correct).length
      saveQuizSession({ date: Date.now(), mode, total: questions.length, correct })
      setPhase('result')
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
      setInput('')
      setChecked(false)
      setWasCorrect(false)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter' || phase !== 'running') return
      if (checked) next()
      else if (current && current.type === 'spell') submitSpell()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ---------- setup ----------
  if (phase === 'setup') {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">单词测试</h1>
            <div className="page-sub">从你学过的单词中随机抽 {10} 题 · 答错自动加入错词本</div>
          </div>
        </div>
        <div className="mode-grid">
          {MODES.map((m) => (
            <button key={m.key} className="mode-card" onClick={() => start(m.key)}>
              <div className="mi">
                <m.icon size={22} />
              </div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </button>
          ))}
        </div>
        <p className="faint" style={{ fontSize: 13, marginTop: 18 }}>
          已学单词不足时，将自动从全部词库（四级 / 六级 / 考研）中抽题。
        </p>
      </div>
    )
  }

  // ---------- result ----------
  if (phase === 'result') {
    const correct = results.filter((r) => r.correct).length
    const total = questions.length
    const pct = total ? Math.round((correct / total) * 100) : 0
    const wrong = results.filter((r) => !r.correct)
    const comment = pct >= 90 ? '太棒了，几乎全对！' : pct >= 70 ? '不错，再巩固一下错词。' : pct >= 50 ? '及格啦，多复习错词本。' : '别灰心，错词已加入复习。'

    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">测试结果</h1>
            <div className="page-sub">{MODES.find((m) => m.key === mode).title}</div>
          </div>
        </div>
        <div className="card">
          <div className="quiz-result">
            <div className="score-ring" style={{ '--p': pct }}>
              <div className="inner">
                <div>
                  <div className="n tnum">
                    {correct}
                    <span style={{ fontSize: 16, color: 'var(--faint)' }}>/{total}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 3 }}>正确率 {pct}%</div>
                </div>
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{comment}</h2>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={() => start(mode)}>
                再测一组
              </button>
              <Link className="btn ghost" to="/study">
                去复习
              </Link>
              <Link className="btn ghost" to="/">
                回到今日
              </Link>
            </div>
          </div>
        </div>

        <div className="card card-pad mt-18">
          <div className="section-title">错题回顾</div>
          {wrong.length === 0 ? (
            <div className="empty" style={{ padding: '20px' }}>
              <div className="empty-badge">
                <IconTrophy size={26} />
              </div>
              <h3>全部答对，太厉害了！</h3>
            </div>
          ) : (
            <div className="wrong-list">
              {wrong.map((r, i) => (
                <div key={i} className="mini-word">
                  <div style={{ minWidth: 0 }}>
                    <div className="w">{r.word.word}</div>
                    <div className="c">
                      {r.word.phonetic} · {r.word.cn}
                    </div>
                  </div>
                  <span className="badge mistake">错词</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- running ----------
  const isChoice = current.type === 'choice'
  const showCnBig = mode === 'cn2en' || mode === 'spell'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">单词测试</h1>
          <div className="page-sub">
            第 {index + 1} / {questions.length} 题 · 已答对 {results.filter((r) => r.correct).length} 题
          </div>
        </div>
        <button className="btn ghost" onClick={() => setPhase('setup')}>
          <IconX size={16} /> 退出
        </button>
      </div>

      <div className="study-wrap">
        <div className="quiz-top">
          <div className="qdots">
            {questions.map((q, i) => (
              <span
                key={i}
                className={
                  'qdot' +
                  (i < results.length ? (results[i].correct ? ' ok' : ' no') : i === index ? ' cur' : '')
                }
              />
            ))}
          </div>
          <span className="badge tag">{TAGS[current.word.tag]}</span>
        </div>

        <div className="quiz-card">
          <div className="quiz-prompt">
            {isChoice
              ? mode === 'en2cn'
                ? '选择正确的中文释义'
                : '选择对应的英文单词'
              : '根据中文释义，拼写英文单词'}
          </div>

          <div className={'quiz-word' + (showCnBig ? ' cn' : '')}>
            {isChoice && mode === 'en2cn' ? current.word.word : current.word.cn}
          </div>

          {isChoice && mode === 'en2cn' && (
            <div className="fc-phonetic" style={{ textAlign: 'center', marginTop: -20, marginBottom: 24 }}>
              {current.word.phonetic}
            </div>
          )}

          {!isChoice && (
            <div className="hint-row">
              {current.word.word.split('').map((ch, i) => (
                <span key={i} className={'hint-letter' + (i === 0 ? '' : ' blank')}>
                  {i === 0 ? ch.toUpperCase() : ''}
                </span>
              ))}
            </div>
          )}

          {isChoice ? (
            <div className="options">
              {current.options.map((opt, i) => {
                let cls = 'option'
                if (checked) {
                  if (opt.correct) cls += ' correct'
                  else if (i === selected) cls += ' wrong'
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    disabled={checked}
                    onClick={() => chooseOption(opt, i)}
                  >
                    <span className="key">{String.fromCharCode(65 + i)}</span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                    {checked && (opt.correct ? <IconCheck size={18} /> : i === selected ? <IconX size={18} /> : null)}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="spell-wrap">
              <input
                className="input"
                style={{ fontSize: 20, textAlign: 'center', fontFamily: 'var(--mono)' }}
                placeholder="输入英文单词后回车"
                value={input}
                disabled={checked}
                autoFocus
                onChange={(e) => setInput(e.target.value)}
              />
              {!checked && (
                <button
                  className="btn primary block"
                  style={{ marginTop: 12 }}
                  disabled={!input.trim()}
                  onClick={submitSpell}
                >
                  提交答案
                </button>
              )}
              {checked && (
                <div
                  className="fc-ex"
                  style={{
                    marginTop: 12,
                    background: wasCorrect ? 'var(--primary-050)' : 'var(--danger-100)',
                  }}
                >
                  <div className="en">
                    {wasCorrect ? '回答正确' : '正确答案'}：{current.word.word}{' '}
                    <span className="mono faint">{current.word.phonetic}</span>
                  </div>
                  <div className="zh">{current.word.cn}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {checked && (
          <button className="btn primary lg block" style={{ marginTop: 16 }} onClick={next}>
            {index + 1 >= questions.length ? '查看结果' : '下一题'} <IconArrowRight size={18} />
          </button>
        )}
        <p className="faint" style={{ textAlign: 'center', fontSize: 12, marginTop: 12 }}>
          回车键可提交答案 / 进入下一题
        </p>
      </div>
    </div>
  )
}
