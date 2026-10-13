import { useState } from 'react'
import { useApp } from '../store/AppStore'
import { WORDS } from '../data/words'
import { getStatus, STATUS_LABEL, MASTERED_STAGE } from '../lib/srs'
import { computeCounts, getMistakeWords } from '../lib/selectors'
import WordDetailModal from '../components/WordDetailModal'
import { IconSearch } from '../components/Icons'

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'new', label: '新词' },
  { key: 'learning', label: '学习中' },
  { key: 'mastered', label: '已掌握' },
  { key: 'mistake', label: '错词本' },
]

const STATUS_CLASS = {
  new: 'badge new',
  learning: 'badge learning',
  mastered: 'badge mastered',
}

export default function Wordbook() {
  const { state } = useApp()
  const { progress } = state
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const counts = computeCounts(progress)
  const mistakeCount = getMistakeWords(progress).length
  const filterCounts = {
    all: WORDS.length,
    new: counts.newCount,
    learning: counts.learning,
    mastered: counts.mastered,
    mistake: mistakeCount,
  }

  const term = q.trim().toLowerCase()
  const list = WORDS.filter((w) => {
    const p = progress[w.id]
    const status = getStatus(p)
    if (filter === 'new' && status !== 'new') return false
    if (filter === 'learning' && status !== 'learning') return false
    if (filter === 'mastered' && status !== 'mastered') return false
    if (filter === 'mistake' && !(p && p.inMistakes)) return false
    if (term && !w.word.toLowerCase().includes(term) && !w.cn.includes(q.trim())) return false
    return true
  })

  const activeLabel = FILTERS.find((f) => f.key === filter).label

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">单词本</h1>
          <div className="page-sub">
            共 {WORDS.length} 个单词 · 已掌握 {counts.mastered} · 错词 {mistakeCount}
          </div>
        </div>
      </div>

      <div className="wb-toolbar">
        <div className="search-box">
          <span className="sico">
            <IconSearch size={18} />
          </span>
          <input
            className="input"
            placeholder="搜索英文单词或中文释义…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="chip-row" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={'chip' + (filter === f.key ? ' active' : '')}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="chip-n">{filterCounts[f.key]}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-badge">
              <IconSearch size={24} />
            </div>
            <h3>没有找到匹配的单词</h3>
            <p>换个关键词，或切换其他筛选条件试试。</p>
          </div>
        </div>
      ) : (
        <div className="wb-list">
          <div className="wb-head">
            <span>单词</span>
            <span className="h-cn">释义</span>
            <span>复习阶段</span>
            <span className="h-st">状态</span>
          </div>
          {list.map((w) => {
            const p = progress[w.id]
            const status = getStatus(p)
            const stage = p ? p.stage : 0
            return (
              <div key={w.id} className="wb-row" onClick={() => setSelected(w)}>
                <div style={{ minWidth: 0 }}>
                  <div className="wb-w">{w.word}</div>
                  <div className="wb-ph">{w.phonetic}</div>
                </div>
                <div className="wb-cn">{w.cn}</div>
                <div className="stage-dots" title={`记忆阶段 ${stage} / ${MASTERED_STAGE}`}>
                  {Array.from({ length: MASTERED_STAGE }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        'dot' +
                        (i < stage ? ' on' : '') +
                        (i < stage && p && p.inMistakes ? ' acc' : '')
                      }
                    />
                  ))}
                </div>
                <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>
              </div>
            )
          })}
        </div>
      )}

      <p className="faint" style={{ fontSize: 12, marginTop: 12 }}>
        当前筛选：{activeLabel} · 点击任意单词查看详情
      </p>

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
