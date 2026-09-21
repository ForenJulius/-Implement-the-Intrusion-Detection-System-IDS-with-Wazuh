import { reactive, computed } from 'vue'

// Để chuỗi rỗng để đi qua Vite proxy chuyển tiếp về backend 4000, không bị lỗi Failed to fetch khi truy cập từ xa[cite: 11]
const BACKEND_URL = ''

const state = reactive({
  token: localStorage.getItem('bw_token') || null,
  user: JSON.parse(localStorage.getItem('bw_user') || 'null'),
})

function persist() {
  if (state.token) localStorage.setItem('bw_token', state.token)
  else localStorage.removeItem('bw_token')

  if (state.user) localStorage.setItem('bw_user', JSON.stringify(state.user))
  else localStorage.removeItem('bw_user')
}

export const isAuthenticated = computed(() => !!state.token)
export const currentUser = computed(() => state.user)
export const isAdmin = computed(() => state.user?.role === 'admin')

export async function login(identifier, type, password) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, type, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại')
  state.token = data.token
  state.user = data.user
  persist()
}

export async function register(username, email, phone, password, deviceName, ipAddress) {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, phone, password, deviceName, ipAddress }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại')
  return data
}

export function setMustChangePassword(val) {
  if (state.user) {
    state.user.mustChangePassword = val
    persist()
  }
}

// Dùng khi user tự đổi username/email/phone của chính mình — backend trả về
// token mới (vì token cũ ký với username cũ) và thông tin user mới nhất.
export function updateSession(token, user) {
  state.token = token
  state.user = user
  persist()
}

export function logout() {
  state.token = null
  state.user = null
  persist()
}

export function getToken() {
  return state.token
}