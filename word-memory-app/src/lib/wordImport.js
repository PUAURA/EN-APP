// Parses pasted/uploaded custom vocabulary into word objects.
// Supported input (auto-detected):
//   1) JSON array: [{"word":"meticulous","phonetic":"/məˈtɪkjələs/","cn":"一丝不苟的"}]
//   2) One word per line, fields separated by comma / tab / 全角逗号:
//        meticulous, /məˈtɪkjələs/, 一丝不苟的      (word, phonetic, 释义)
//        meticulous, 一丝不苟的                      (word, 释义)
//        meticulous  一丝不苟的                      (word + 释义)
// Lines starting with # or // are treated as comments.

const WORD_RE = /^[a-zA-Z][a-zA-Z0-9\-'./ ]*$/

function splitFields(line) {
  const normalized = line.replace(/[，、]/g, ',')
  if (normalized.includes('\t') || normalized.includes(',')) {
    return normalized
      .split(/[,\t]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  // No separator: split "word 释义" at the first non-ASCII character.
  const m = line.match(/^([a-zA-Z][a-zA-Z0-9\-'./ ]*?)\s+(.+)$/)
  if (m) return [m[1].trim(), m[2].trim()]
  return [line.trim()]
}

function fromObject(o) {
  const word = String(o.word || o.en || o.term || '').trim()
  const cn = String(o.cn || o.meaning || o.zh || o.translation || o['释义'] || '').trim()
  const phonetic = String(o.phonetic || o.phonetics || o.pron || o['音标'] || '').trim()
  const pos = String(o.pos || o['词性'] || '').trim()
  const ex = String(o.ex || o.example || o['例句'] || '').trim()
  const exCn = String(o.exCn || o.exampleCn || o['例句翻译'] || '').trim()
  if (!word || !cn) return null
  return { word, cn, phonetic, pos, ex, exCn }
}

function fromLine(line) {
  const parts = splitFields(line)
  if (parts.length === 0) return null
  const word = parts[0]
  if (!WORD_RE.test(word)) return null

  let phonetic = ''
  let rest = parts.slice(1)
  if (rest.length && /^\/.*\/$/.test(rest[0])) {
    phonetic = rest[0]
    rest = rest.slice(1)
  }
  const cn = rest.join('，').trim()
  if (!cn) return null
  return { word, cn, phonetic, pos: '', ex: '', exCn: '' }
}

// Returns { words, errors }.
export function parseWordList(text) {
  const raw = String(text || '').trim()
  if (!raw) return { words: [], errors: ['内容为空'] }

  // Try JSON first.
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const data = JSON.parse(raw)
      const arr = Array.isArray(data) ? data : data.words || []
      const words = []
      let skipped = 0
      for (const item of arr) {
        const w = item && typeof item === 'object' ? fromObject(item) : null
        if (w) words.push(w)
        else skipped++
      }
      const errors = skipped ? [`${skipped} 条记录缺少「单词」或「释义」，已跳过`] : []
      return { words, errors }
    } catch {
      // fall through to line parsing
    }
  }

  const words = []
  const errors = []
  const lines = raw.split(/\r?\n/)
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return
    const w = fromLine(trimmed)
    if (w) words.push(w)
    else errors.push(`第 ${i + 1} 行无法识别：「${trimmed.slice(0, 40)}」`)
  })
  return { words, errors }
}

export const IMPORT_PLACEHOLDER = `每行一个单词，用逗号或 Tab 分隔字段：

meticulous, /məˈtɪkjələs/, 一丝不苟的
resilient, 有韧性的
candid, 坦率直白的

也支持 JSON 数组：
[{"word":"meticulous","phonetic":"/məˈtɪkjələs/","cn":"一丝不苟的"}]`

let seq = 0

// Attaches a stable id + the 'custom' tag so imported words flow through the
// same selectors, SRS engine and UI as the built-in vocabulary.
export function makeCustomWord(w) {
  seq += 1
  return {
    id: `cw-${Date.now().toString(36)}-${seq}-${Math.random().toString(36).slice(2, 6)}`,
    word: w.word,
    phonetic: w.phonetic || '',
    pos: w.pos || '',
    cn: w.cn,
    ex: w.ex || '',
    exCn: w.exCn || '',
    tag: 'custom',
  }
}
