import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Directory from './pages/Directory'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Admin from './pages/Admin'
import Connections from './pages/Connections'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PublicProfile from './pages/PublicProfile'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <div className="container page">
        <Routes>
          <Route path="/" element={<Navigate to="/posts" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}> 
            <Route path="/profile" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route path="/directory" element={<Directory />} />
          <Route path="/users/:id" element={<PublicProfile />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route element={<ProtectedRoute requireAdmin />}> 
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
