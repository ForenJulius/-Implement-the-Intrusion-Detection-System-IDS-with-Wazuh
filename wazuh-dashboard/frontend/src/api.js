import { getToken, logout } from './auth'
const BACKEND_URL = ''

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers })
  if (res.status === 401) {
    logout()
  }
  return res
}
