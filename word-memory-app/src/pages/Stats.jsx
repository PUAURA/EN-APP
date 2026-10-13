import { useApp } from '../store/AppStore'
import {
  computeCounts,
  getStreak,
  todayCount,
  getActivitySeries,
  getForecast,
  getMistakeWords,
} from '../lib/selectors'
import { weekdayLabel } from '../lib/format'
import {
  IconTrophy,
  IconLayers,
  IconChart,
  IconClock,
  IconFlame,
  IconAlert,
  IconBook,
} from '../components/Icons'

const MODE_LABEL = { en2cn: '英译中', cn2en: '中译英', spell: '拼写' }

const clamp = (n, min, max) => Math.max(min, Math.min(max, n || 0))

export default function Stats() {
  const { state, setSetting, resetAll } = useApp()
  const { progress, activity, settings, quizHistory } = state

  const counts = computeCounts(progress)
  const streak = getStreak(activity)
  const today = todayCount(activity)
  const mistakeCount = getMistakeWords(progress).length
  const total = counts.total || 1

  const week = getActivitySeries(activity, 7)
  const maxWeek = Math.max(1, ...week.map((d) => d.count))

  const heat = getActivitySeries(activity, 84)
  const maxHeat = Math.max(1, ...heat.map((d) => d.count))

  const forecast = getForecast(progress, 7)
  const maxForecast = Math.max(1, ...forecast.map((f) => f.count))

  const stack = [
    { cls: 's-mastered', label: '已掌握', n: counts.mastered },
    { cls: 's-learning', label: '学习中', n: counts.learning },
    { cls: 's-new', label: '未学习', n: counts.newCount },
  ]

  const heatLevel = (count) => {
    if (!count) return ''
    const r = count / maxHeat
    if (r <= 0.25) return 'l1'
    if (r <= 0.5) return 'l2'
    if (r <= 0.75) return 'l3'
    return 'l4'
  }

  const onReset = () => {
    if (window.confirm('确定要清空全部学习进度吗？此操作不可撤销。')) resetAll()
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">学习统计</h1>
          <div className="page-sub">掌握进度、学习活跃度与复习安排</div>
        </div>
        <div className="streak-pill">
          <IconFlame className="flame" size={18} />
          连续打卡 <b className="tnum">{streak}</b> 天
        </div>
      </div>

      <div className="stat-cards">
        <StatCard icon={<IconBook size={18} />} label="词库总量" value={counts.total} />
        <StatCard icon={<IconTrophy size={18} />} label="已掌握" value={counts.mastered} />
        <StatCard icon={<IconLayers size={18} />} label="学习中" value={counts.learning} />
        <StatCard icon={<IconChart size={18} />} label="未学习" value={counts.newCount} />
        <StatCard icon={<IconClock size={18} />} label="今日已学" value={today} />
        <StatCard icon={<IconAlert size={18} />} label="错词本" value={mistakeCount} />
      </div>

      <div className="grid-2">
        <div className="card chart-card">
          <div className="section-title">近 7 日学习量</div>
          <div className="bars">
            {week.map((d, i) => (
              <div key={d.key} className="bar-col">
                <span className="bar-count">{d.count || ''}</span>
                <div className="bar-track">
                  <div
                    className={'bar-fill' + (d.count ? '' : ' zero')}
                    style={{ height: `${d.count ? (d.count / maxWeek) * 100 : 4}%` }}
                  />
                </div>
                <span className="bar-lab">{i === 6 ? '今天' : '周' + weekdayLabel(d.key)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card chart-card">
          <div className="section-title">词库掌握分布</div>
          <div className="stack">
            {stack.map((s) => (
              <span key={s.cls} className={s.cls} style={{ width: `${(s.n / total) * 100}%` }} />
            ))}
          </div>
          <div className="legend" style={{ flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {stack.map((s) => (
              <div key={s.cls} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <i className={s.cls}></i>
                  {s.label}
                </span>
                <span className="tnum">
                  <b>{s.n}</b>{' '}
                  <span className="faint">{Math.round((s.n / total) * 100)}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card chart-card">
          <div className="section-title">
            <IconClock size={17} /> 未来 7 天复习预测
          </div>
          {forecast.map((f, i) => (
            <div key={f.key} className="forecast-row">
              <span className="lab">{i === 0 ? '今天' : i === 1 ? '明天' : '周' + weekdayLabel(f.key)}</span>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${f.count ? Math.max(8, (f.count / maxForecast) * 100) : 0}%` }}
                >
                  {f.count ? f.count : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card chart-card">
          <div className="section-title">学习活跃度（近 12 周）</div>
          <div className="heatmap">
            {heat.map((d) => (
              <div
                key={d.key}
                className={'hm-cell ' + heatLevel(d.count)}
                title={`${d.key} · 学习 ${d.count} 词`}
              />
            ))}
          </div>
          <div className="legend" style={{ justifyContent: 'flex-end', marginTop: 12, fontSize: 12 }}>
            <span className="faint">少</span>
            <span>
              <i className="hm-cell" style={{ display: 'inline-block', width: 10, height: 10 }} />
              <i className="hm-cell l2" style={{ display: 'inline-block', width: 10, height: 10, marginLeft: 5 }} />
              <i className="hm-cell l4" style={{ display: 'inline-block', width: 10, height: 10, marginLeft: 5 }} />
            </span>
            <span className="faint">多</span>
          </div>
        </div>
      </div>

      {quizHistory.length > 0 && (
        <div className="card card-pad mt-18">
          <div className="section-title">最近测试记录</div>
          {quizHistory.slice(0, 5).map((h, i) => (
            <div key={i} className="mini-word">
              <div>
                <div className="w">{MODE_LABEL[h.mode] || '测试'}</div>
                <div className="c">
                  {new Date(h.date).getMonth() + 1}月{new Date(h.date).getDate()}日
                </div>
              </div>
              <span className="badge learning">
                {h.correct} / {h.total} · {h.total ? Math.round((h.correct / h.total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card card-pad mt-18">
        <div className="section-title">学习设置</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              每日新词数
            </div>
            <input
              className="input"
              type="number"
              min="0"
              max="50"
              value={settings.dailyNew}
              onChange={(e) => setSetting('dailyNew', clamp(Number(e.target.value), 0, 50))}
            />
          </div>
          <div>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              每日目标（词）
            </div>
            <input
              className="input"
              type="number"
              min="5"
              max="200"
              value={settings.dailyGoal}
              onChange={(e) => setSetting('dailyGoal', clamp(Number(e.target.value), 5, 200))}
            />
          </div>
        </div>
        <button className="btn danger" style={{ marginTop: 16 }} onClick={onReset}>
          清空全部学习进度
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat">
      <div className="top">
        <span className="ico">{icon}</span>
        {label}
      </div>
      <div className="val tnum">{value}</div>
    </div>
  )
}
