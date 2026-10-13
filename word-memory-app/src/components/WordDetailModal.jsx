import { getStatus, STATUS_LABEL, MASTERED_STAGE } from '../lib/srs'
import { relativeDue } from '../lib/format'
import { TAGS } from '../data/words'
import { IconX } from './Icons'

const STATUS_CLASS = {
  new: 'badge new',
  learning: 'badge learning',
  mastered: 'badge mastered',
}

export default function WordDetailModal({ word, progress, onClose }) {
  if (!word) return null
  const status = getStatus(progress)
  const p = progress || {}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="detail-word">{word.word}</div>
            <div className="mono muted" style={{ fontSize: 14 }}>
              {word.phonetic} · {word.pos}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <IconX size={18} />
          </button>
        </div>

        <div className="detail-row">
          <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>
          <span className="badge tag">{TAGS[word.tag]}</span>
          {p.inMistakes && <span className="badge mistake">错词本</span>}
        </div>

        <div style={{ fontSize: 19, fontWeight: 800 }}>{word.cn}</div>

        <div className="fc-ex" style={{ marginTop: 14 }}>
          <div className="en">{word.ex}</div>
          <div className="zh">{word.exCn}</div>
        </div>

        <div className="detail-grid">
          <div className="detail-cell">
            <div className="k">记忆阶段</div>
            <div className="v">{p.stage ? `${p.stage} / ${MASTERED_STAGE}` : '未学习'}</div>
          </div>
          <div className="detail-cell">
            <div className="k">下次复习</div>
            <div className="v" style={{ fontSize: 15 }}>
              {p.stage >= 1 ? relativeDue(p.due) : '—'}
            </div>
          </div>
          <div className="detail-cell">
            <div className="k">复习次数</div>
            <div className="v">{p.reps || 0}</div>
          </div>
          <div className="detail-cell">
            <div className="k">正确 / 错误</div>
            <div className="v">
              {p.correct || 0} / {p.wrong || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
