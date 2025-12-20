import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ label = 'Back', fallback = '/posts', className = '' }) {
  const navigate = useNavigate()
  const onBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate(fallback)
  }
  return (
    <button className={`btn ${className}`} onClick={onBack}>{label}</button>
  )
}
