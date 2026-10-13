import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { getDueWords, getNewWords } from '../lib/selectors'
import { RATINGS, MASTERED_STAGE } from '../lib/srs'
import { relativeDue } from '../lib/format'
import { TAGS } from '../data/words'
import { IconRotate, IconTrophy, IconCards } from '../components/Icons'

const KEY_HINT = { again: '1', hard: '2', good: '3' }
const RATING_ORDER = ['again', 'hard', 'good']

function buildQueue(progress, settings) {
  const now = Date.now()
  const due = getDueWords(progress, now).slice(0, 40)
  const fresh = getNewWords(progress).slice(0, settings.dailyNew)
  return [...due, ...fresh]
}

export default function Study() {
  const { state, rateWord } = useApp()
  const { progress, settings } = state

  const [queue, setQueue] = useState(() => buildQueue(progress, settings))
  const [initialCount, setInitialCount] = useState(queue.length)
  const [flipped, setFlipped] = useState(false)
  const [doneIds, setDoneIds] = useState(() => new Set())
  const [rated, setRated] = useState(0)
  const [againCount, setAgainCount] = useState(0)

  const current = queue[0]
  const pct = initialCount ? Math.round((doneIds.size / initialCount) * 100) : 100

  const handleRate = useCallback(
    (rating) => {
      if (!current) return
      rateWord(current.id, rating)
      setRated((r) => r + 1)
      setFlipped(false)
      if (rating === 'again') {
        setAgainCount((c) => c + 1)
        setQueue((q) => [...q.slice(1), q[0]]) // re-queue for another pass
      } else {
        setDoneIds((prev) => new Set(prev).add(current.id))
        setQueue((q) => q.slice(1))
      }
    },
    [current, rateWord],
  )

  const restart = () => {
    const q = buildQueue(progress, settings)
    setQueue(q)
    setInitialCount(q.length)
    setFlipped(false)
    setDoneIds(new Set())
    setRated(0)
    setAgainCount(0)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (!current) return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && (e.key === '1' || e.key === '2' || e.key === '3')) {
        e.preventDefault()
        handleRate(RATING_ORDER[Number(e.key) - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, flipped, handleRate])

  const p = current ? progress[current.id] : null

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">闪卡学习</h1>
          <div className="page-sub">按艾宾浩斯间隔复习 · 翻卡后自评掌握程度</div>
        </div>
      </div>

      <div className="study-wrap">
        {initialCount === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-badge">
                <IconCards size={26} />
              </div>
              <h3>暂时没有要学习的单词</h3>
              <p>今日新词额度已用完，也没有到期待复习的单词。可以去做个测试，或者明天再来。</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link className="btn primary" to="/quiz">
                  去做测试
                </Link>
                <Link className="btn ghost" to="/stats">
                  查看统计
                </Link>
              </div>
            </div>
          </div>
        ) : !current ? (
          <div className="card">
            <div className="session-done">
              <div className="done-ring">
                <IconTrophy size={44} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>本组学习完成</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                本次共复习 {rated} 次，其中「不认识」{againCount} 次，掌握 {doneIds.size} 个单词。
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={restart}>
                  再来一组
                </button>
                <Link className="btn ghost" to="/quiz">
                  去测试
                </Link>
                <Link className="btn ghost" to="/">
                  回到今日
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="study-top">
              <span className="count">剩余 {queue.length} 张</span>
              <span className="count">
                已掌握 {doneIds.size} / {initialCount}
              </span>
            </div>
            <div className="progress" style={{ marginBottom: 18 }}>
              <div className="progress-bar" style={{ width: `${pct}%` }} />
            </div>

            <div
              className={'flashcard' + (flipped ? ' flipped' : '')}
              onClick={() => setFlipped((f) => !f)}
            >
              <div className="fc-inner">
                <div className="fc-face">
                  <div className="fc-hint">单词</div>
                  <div className="fc-tag">
                    <span className="badge tag">{TAGS[current.tag]}</span>
                  </div>
                  <div className="fc-word">{current.word}</div>
                  <div className="fc-phonetic">{current.phonetic}</div>
                  <div className="fc-pos">{current.pos}</div>
                  <div className="fc-tap">
                    <IconRotate size={13} /> 点击卡片查看释义
                  </div>
                </div>

                <div className="fc-face back">
                  <div className="fc-hint">释义</div>
                  <div className="fc-tag">
                    <span className="badge tag">{TAGS[current.tag]}</span>
                  </div>
                  <div style={{ paddingTop: 22 }}>
                    <div className="fc-cn">{current.cn}</div>
                    <div className="fc-ex">
                      <div className="en">{current.ex}</div>
                      <div className="zh">{current.exCn}</div>
                    </div>
                    <div className="fc-meta">
                      <span>
                        记忆阶段 <b>{p ? `${p.stage} / ${MASTERED_STAGE}` : '1 / 6'}</b>
                      </span>
                      <span>
                        下次复习{' '}
                        <b>{p && p.stage >= 1 ? relativeDue(p.due) : '本组稍后'}</b>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {flipped ? (
              <div className="rate-row">
                {RATING_ORDER.map((r) => (
                  <button key={r} className="rate-btn" data-r={r} onClick={() => handleRate(r)}>
                    <span>{RATINGS[r].label}</span>
                    <small>
                      {RATINGS[r].hint} · <span className="kbd">{KEY_HINT[r]}</span>
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <button className="btn primary lg block" onClick={() => setFlipped(true)}>
                <IconRotate size={18} /> 显示释义
              </button>
            )}
            <p className="faint" style={{ textAlign: 'center', fontSize: 12, marginTop: 14 }}>
              快捷键：空格翻卡 · 1 不认识 · 2 有点模糊 · 3 认识
            </p>
          </>
        )}
      </div>
    </div>
  )
}
