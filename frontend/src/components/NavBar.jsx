import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const { user, token, logout } = useAuth()
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN'
  const navigate = useNavigate()
  const onLogout = () => { logout(); navigate('/login') }
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-brand"><Link to="/">AITSP BLOGS</Link></div>
        <div className="newspaper-rule" />
        <div className="nav-links">
          {!isAdmin && <Link to="/posts">Posts</Link>}
          {!isAdmin && <Link to="/directory">Members</Link>}
          {!isAdmin && token && <Link to="/notifications">Notifications</Link>}
          {isAdmin && <Link to="/admin">Manage</Link>}
        </div>
        <div className="newspaper-rule" />
        {token ? (
          <div className="nav-actions">
            {!isAdmin && <Link to="/create-post">Write</Link>}
            {!isAdmin && <Link to="/profile">Profile</Link>}
            {!isAdmin && <Link to="/connections">Connections</Link>}
            <ThemeToggle />
            <button className="btn" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <div className="nav-actions">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  )
}
