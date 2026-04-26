import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import SetupPage from './pages/SetupPage'
import ReposPage from './pages/ReposPage'
import BackupPage from './pages/BackupPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider, useAuth } from './hooks/useAuth'

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { authReady, authRequired, user } = useAuth()

  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Preparing secure session...</div>
      </div>
    )
  }

  if (authRequired && !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<RequireAuth><SetupPage /></RequireAuth>} />
          <Route path="/repos" element={<RequireAuth><ReposPage /></RequireAuth>} />
          <Route path="/backup" element={<RequireAuth><BackupPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
