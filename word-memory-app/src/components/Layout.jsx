import { NavLink, Outlet } from 'react-router-dom'
import { IconHome, IconCards, IconTarget, IconBook, IconChart } from './Icons'

// Single source of truth for navigation. Rendered identically in both the
// desktop sidebar and the mobile tab bar; active state is marked only by
// react-router's NavLink isActive -> .active.
export const NAV_ITEMS = [
  { to: '/', label: '今日', icon: IconHome, end: true },
  { to: '/study', label: '学习', icon: IconCards, end: false },
  { to: '/quiz', label: '测试', icon: IconTarget, end: false },
  { to: '/wordbook', label: '单词本', icon: IconBook, end: false },
  { to: '/stats', label: '统计', icon: IconChart, end: false },
]

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">词</div>
          <div>
            <div className="brand-name">词迹 WordTrail</div>
            <div className="brand-sub">vocab memory</div>
          </div>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-spacer" />
        <div className="side-foot">
          <b>四级 · 六级 · 考研</b>
          <span>学习数据保存在本地浏览器</span>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      <nav className="tabbar">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => 'tab-item' + (isActive ? ' active' : '')}
          >
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
