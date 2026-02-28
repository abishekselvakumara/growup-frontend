// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

import MainLayout from './layouts/MainLayout'
import PublicProfilePage from './pages/PublicProfilePage'

// Pages
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import Notes from './pages/Notes'
import Analytics from './pages/Analytics'
import Finance from './pages/Finance'
import Events from './pages/Events'
import Settings from './pages/Settings'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'

// Legal Pages
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

// Import Goku background
import gokuBg from './assets/goku.png'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Global Goku Background - Single source of truth */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Dark overlay - responsive */}
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 mix-blend-multiply"></div>
          
          {/* Goku image - centered on all devices */}
          <img 
            src={gokuBg} 
            alt=""
            className="w-full h-full object-cover object-center 
              opacity-[0.06] sm:opacity-[0.06] md:opacity-[0.06] lg:opacity-[0.06]
              dark:opacity-[0.04] dark:sm:opacity-[0.04] dark:md:opacity-[0.04] dark:lg:opacity-[0.04]
              scale-105"
            style={{
              filter: 'grayscale(0.2) contrast(1.1)',
            }}
          />
          
          {/* Subtle emerald gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"></div>
          
          {/* Vignette effect for focus */}
          <div className="absolute inset-0 bg-radial-gradient-mobile sm:bg-radial-gradient-tablet md:bg-radial-gradient-desktop"></div>
        </div>

        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Legal Routes */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Public Profile Route - MUST be before protected routes */}
          <Route path="/p/:shareCode" element={<PublicProfilePage />} />

          {/* Protected Main App Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="diary" element={<Diary />} />
            <Route path="notes" element={<Notes />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="finance" element={<Finance />} />
            <Route path="events" element={<Events />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all - redirect to dashboard if logged in, else login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App