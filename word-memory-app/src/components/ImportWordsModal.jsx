import { useMemo, useState } from 'react'
import { parseWordList, makeCustomWord, IMPORT_PLACEHOLDER } from '../lib/wordImport'
import { IconX, IconCheck } from './Icons'

// Modal for pasting/uploading custom vocabulary. Parses live, de-duplicates
// against the whole active list, and imports through `onImport`.
export default function ImportWordsModal({ existing, customCount, onImport, onClear, onClose }) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')

  const { toAdd, duplicates, errors } = useMemo(() => {
    const parsed = parseWordList(text)
    const seen = new Set(existing.map((w) => w.word.trim().toLowerCase()))
    const add = []
    const dup = []
    for (const w of parsed.words) {
      const key = w.word.toLowerCase()
      if (seen.has(key)) {
        dup.push(w.word)
        continue
      }
      seen.add(key)
      add.push(w)
    }
    return { toAdd: add, duplicates: dup, errors: parsed.errors }
  }, [text, existing])

  const readFile = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result || ''))
    reader.readAsText(file)
  }

  const submit = () => {
    if (toAdd.length === 0) return
    onImport(toAdd.map(makeCustomWord))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>导入自定义词库</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              粘贴或上传文本，导入的单词会加入学习与测试
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <IconX size={18} />
          </button>
        </div>

        <textarea
          className="input textarea"
          placeholder={IMPORT_PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />

        <div className="import-actions">
          <label className="btn ghost sm">
            选择文件（.txt / .csv / .json）
            <input
              type="file"
              accept=".txt,.csv,.json,text/plain,application/json"
              onChange={readFile}
              hidden
            />
          </label>
          <button
            className="btn ghost sm"
            onClick={() => setText(IMPORT_PLACEHOLDER.split('\n').slice(2, 5).join('\n'))}
          >
            填充示例
          </button>
          {fileName && <span className="faint" style={{ fontSize: 12 }}>{fileName}</span>}
        </div>

        {text.trim() && (
          <div className="import-status">
            <div className="import-line">
              <IconCheck size={15} />
              可导入 <b>{toAdd.length}</b> 个单词
              {duplicates.length > 0 && (
                <span className="faint"> · 跳过重复 {duplicates.length} 个</span>
              )}
            </div>
            {errors.map((e, i) => (
              <div key={i} className="import-warn">
                {e}
              </div>
            ))}
            {toAdd.length > 0 && (
              <div className="import-preview">
                {toAdd.slice(0, 4).map((w, i) => (
                  <span key={i} className="badge tag">
                    {w.word}
                  </span>
                ))}
                {toAdd.length > 4 && <span className="faint">等 {toAdd.length} 个</span>}
              </div>
            )}
          </div>
        )}

        <div className="import-foot">
          {customCount > 0 && (
            <button className="link-danger" onClick={onClear}>
              清空自定义词库（{customCount}）
            </button>
          )}
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            <button className="btn ghost" onClick={onClose}>
              取消
            </button>
            <button className="btn primary" disabled={toAdd.length === 0} onClick={submit}>
              导入 {toAdd.length > 0 ? `${toAdd.length} 个` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
