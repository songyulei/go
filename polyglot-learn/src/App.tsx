import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Auth from '@/pages/Auth'
import Community from '@/pages/Community'
import Dashboard from '@/pages/Dashboard'
import Home from '@/pages/Home'
import Learn from '@/pages/Learn'
import Path from '@/pages/Path'
import Practice from '@/pages/Practice'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/path" element={<Path />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
