// Small date / time formatting helpers (all local time, no deps).

const MS_DAY = 24 * 60 * 60 * 1000

export function dateKey(ts = Date.now()) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey() {
  return dateKey(Date.now())
}

export function shiftDayKey(key, delta) {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  return dateKey(dt.getTime())
}

export function weekdayLabel(key) {
  const [y, m, d] = key.split('-').map(Number)
  return ['日', '一', '二', '三', '四', '五', '六'][new Date(y, m - 1, d).getDay()]
}

export function relativeDue(due, now = Date.now()) {
  const diff = due - now
  if (diff <= 0) return '待复习'
  const days = diff / MS_DAY
  if (days < 1 / 24) return `${Math.max(1, Math.round(diff / 60000))} 分钟后`
  if (days < 1) return `${Math.round(days * 24)} 小时后`
  if (days < 2) return '明天'
  return `${Math.round(days)} 天后`
}

export function formatDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function todayLabel() {
  const d = new Date()
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 5) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 13) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}
