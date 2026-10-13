import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Study from './pages/Study'
import Quiz from './pages/Quiz'
import Wordbook from './pages/Wordbook'
import Stats from './pages/Stats'

// HashRouter keeps every route reachable when dist/ is opened as plain files.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="study" element={<Study />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="wordbook" element={<Wordbook />} />
          <Route path="stats" element={<Stats />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
