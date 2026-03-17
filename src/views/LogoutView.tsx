import { Navigate } from 'react-router-dom'
import { clearSession } from '../services/authSession'

export function LogoutView() {
  clearSession()
  return <Navigate to="/login" replace />
}
