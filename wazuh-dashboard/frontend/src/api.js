import { getToken, logout } from './auth'

// Để chuỗi rỗng để đi qua Vite proxy, giúp người dùng truy cập từ xa (Cloudflare Tunnel/LAN) không bị lỗi Failed to fetch
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