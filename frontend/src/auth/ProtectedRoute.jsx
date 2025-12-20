import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN'
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
