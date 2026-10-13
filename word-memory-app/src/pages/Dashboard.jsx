import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import {
  computeCounts,
  getDueWords,
  getNewWords,
  getMistakeWords,
  getStreak,
  todayCount,
} from '../lib/selectors'
import { greeting, todayLabel } from '../lib/format'
import { TAGS } from '../data/words'
import WordDetailModal from '../components/WordDetailModal'
import {
  IconFlame,
  IconClock,
  IconLayers,
  IconTrophy,
  IconAlert,
  IconCards,
  IconTarget,
} from '../components/Icons'

export default function Dashboard() {
  const { state, words } = useApp()
  const { progress, activity, settings } = state
  const [selected, setSelected] = useState(null)

  const now = Date.now()
  const counts = computeCounts(words, progress, now)
  const due = getDueWords(words, progress, now)
  const fresh = getNewWords(words, progress)
  const mistakes = getMistakeWords(words, progress)
  const streak = getStreak(activity)
  const doneToday = todayCount(activity)

  const goal = settings.dailyGoal || 20
  const pct = Math.min(100, Math.round((doneToday / goal) * 100))
  const newToLearn = Math.min(settings.dailyNew, fresh.length)
  const plan = due.length + newToLearn

  const total = counts.total || 1
  const stack = [
    { cls: 's-mastered', label: '已掌握', n: counts.mastered },
    { cls: 's-learning', label: '学习中', n: counts.learning },
    { cls: 's-new', label: '未学习', n: counts.newCount },
  ]

  return (
    <div className="page">
      <div className="dash-top">
        <div>
          <h1 className="page-title">{greeting()}，继续加油</h1>
          <div className="page-sub">
            {todayLabel()} · 今日计划 {plan} 词
          </div>
        </div>
        <div className="streak-pill">
          <IconFlame className="flame" size={18} />
          连续打卡 <b className="tnum">{streak}</b> 天
        </div>
      </div>

      <section className="hero" style={{ '--p': pct }}>
        <div className="hero-ring">
          <div className="inner">
            <div>
              <div className="big tnum">{doneToday}</div>
              <div className="small">/ {goal} 词</div>
            </div>
          </div>
        </div>
        <div className="hero-body">
          <h2>{plan > 0 ? `今天还有 ${plan} 个单词等你攻克` : '今日任务已全部完成'}</h2>
          <p>
            {due.length > 0 ? `有 ${due.length} 个旧词到期待复习` : '暂无到期待复习的单词'}
            {newToLearn > 0 ? `，可学习 ${newToLearn} 个新词。` : '。'}
          </p>
          <div className="hero-actions">
            <Link className="btn primary lg" to="/study">
              <IconCards size={18} />
              {due.length > 0 ? '开始复习' : '开始学习新词'}
            </Link>
            <Link className="btn ghost lg" to="/quiz">
              <IconTarget size={18} />
              开始测试
            </Link>
            {mistakes.length > 0 && (
              <Link className="btn ghost lg" to="/study?mode=mistake">
                <IconAlert size={18} />
                错词专项
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="stat-grid">
        <MiniStat icon={<IconClock size={18} />} label="今日待复习" value={due.length} unit="词" />
        <MiniStat icon={<IconLayers size={18} />} label="新词可学" value={newToLearn} unit="词" />
        <MiniStat icon={<IconTrophy size={18} />} label="已掌握" value={counts.mastered} unit="词" />
        <MiniStat
          icon={<IconAlert size={18} />}
          label="错词本"
          value={mistakes.length}
          unit="词"
          to={mistakes.length > 0 ? '/study?mode=mistake' : undefined}
        />
      </div>

      <div className="dash-cols">
        <div className="card card-pad">
          <div className="section-title">
            <IconClock size={17} /> 待复习清单
          </div>
          {due.length === 0 ? (
            <div className="empty" style={{ padding: '26px 12px' }}>
              <div className="empty-badge">
                <IconTrophy size={26} />
              </div>
              <h3>清爽！暂无待复习单词</h3>
              <p>按艾宾浩斯间隔，到期的单词会出现在这里。</p>
            </div>
          ) : (
            <>
              {due.slice(0, 6).map((w) => (
                <div
                  key={w.id}
                  className="mini-word"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(w)}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="w">{w.word}</div>
                    <div className="c">{w.cn}</div>
                  </div>
                  <span className="badge tag">{TAGS[w.tag]}</span>
                </div>
              ))}
              {due.length > 6 && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Link className="link-more" to="/study">
                    查看全部 {due.length} 个待复习单词
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card card-pad">
          <div className="section-title">
            <IconLayers size={17} /> 词库掌握进度
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 30, fontWeight: 800 }} className="tnum">
              {counts.total}
            </span>
            <span className="muted" style={{ fontSize: 13 }}>
              个单词 · 已掌握 {Math.round((counts.mastered / total) * 100)}%
            </span>
          </div>
          <div className="stack">
            {stack.map((s) => (
              <span key={s.cls} className={s.cls} style={{ width: `${(s.n / total) * 100}%` }} />
            ))}
          </div>
          <div className="legend" style={{ flexDirection: 'column', gap: 10 }}>
            {stack.map((s) => (
              <div key={s.cls} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <i className={s.cls}></i>
                  {s.label}
                </span>
                <b className="tnum">{s.n}</b>
              </div>
            ))}
          </div>
          <Link className="btn soft block" to="/wordbook" style={{ marginTop: 16 }}>
            浏览完整单词本
          </Link>
        </div>
      </div>

      {selected && (
        <WordDetailModal
          word={selected}
          progress={progress[selected.id]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function MiniStat({ icon, label, value, unit, to }) {
  const body = (
    <>
      <div className="top">
        <span className="ico">{icon}</span>
        {label}
      </div>
      <div className="val tnum">
        {value}
        <small>{unit}</small>
      </div>
    </>
  )
  if (to) {
    return (
      <Link className="stat stat-link" to={to}>
        {body}
      </Link>
    )
  }
  return <div className="stat">{body}</div>
}
