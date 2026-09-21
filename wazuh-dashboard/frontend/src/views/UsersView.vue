<template>
  <div class="card soc-card">
    <div class="card-header">
      <div class="title-wrap">
        <span class="hud-tag">ACCESS CONTROL MATRIX</span>
        <h2>Quản lý người dùng & Đặc quyền ({{ users.length }})</h2>
      </div>
      <div class="shield-badge">
        <span class="shield-icon">🛡️</span>
        <span>RBAC ENFORCED</span>
      </div>
    </div>

    <!-- HUD Banner hiển thị mật khẩu tạm được cấp -->
    <div v-if="tempPassModal.show" class="temp-pass-banner">
      <div class="banner-left">
        <span class="key-icon">🔑</span>
        <div>
          <div class="banner-title">MẬT KHẨU TẠM THỜI CHO: <strong>{{ tempPassModal.targetUser }}</strong></div>
          <div class="banner-sub">&gt; Sao chép mật khẩu bên dưới và gửi cho người dùng để đăng nhập.</div>
        </div>
      </div>
      <div class="banner-right">
        <code class="temp-pass-code">{{ tempPassModal.password }}</code>
        <button class="btn-copy" @click="copyTempPassword">
          {{ copied ? '✓ ĐÃ SAO CHÉP' : 'COPY PASS' }}
        </button>
        <button class="btn-close-banner" @click="tempPassModal.show = false">✕</button>
      </div>
    </div>

    <div v-if="loading" class="soc-skeleton">
      <div class="skeleton-line" v-for="i in 3" :key="i"></div>
    </div>

    <div v-else-if="error" class="soc-error">
      <span class="warn-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <div v-else class="table-responsive">
      <table class="soc-table">
        <thead>
          <tr>
            <th>User Principal</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Tên máy tính (Computer Name)</th>
            <th>Địa chỉ IP</th>
            <th>Cấp độ đặc quyền</th>
            <th>Thời điểm khởi tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in decoratedUsers" :key="u.username" class="user-row">
            <td class="username-cell">
              <span class="avatar-sym">{{ u.username.charAt(0).toUpperCase() }}</span>
              <span class="username-text">{{ u.username }}</span>
            </td>
            <td class="muted">{{ u.email || '-' }}</td>
            <td class="muted">{{ u.phone || '-' }}</td>

            <!-- Tên máy tính -->
            <td>
              <span class="device-badge">🖥️ {{ u.deviceName }}</span>
            </td>

            <!-- Địa chỉ IP -->
            <td>
              <span class="ip-badge">🌐 {{ u.ipAddress }}</span>
            </td>

            <!-- Phân quyền -->
            <td>
              <span :class="['role-chip', u.role]">
                <span class="role-icon">{{ u.role === 'admin' ? '⚡' : '👤' }}</span>
                {{ u.role === 'admin' ? 'Administrator' : 'Analyst / User' }}
              </span>
            </td>
            <td class="muted time-cell">{{ formatTime(u.createdAt) }}</td>

            <!-- Hành động: Cấp pass tạm, đổi quyền, thu hồi -->
            <td class="actions-cell">
              <template v-if="u.username !== currentUser?.username">
                <button class="btn-reset-pass" @click="resetPassword(u)" title="Cấp mật khẩu ngẫu nhiên tạm thời">
                  🔑 Cấp pass tạm
                </button>
                <button class="btn-role-switch" @click="toggleRole(u)">
                  Gán {{ u.role === 'admin' ? 'User' : 'Admin' }}
                </button>
                <button class="btn-danger-del" @click="removeUser(u)">
                  Thu hồi
                </button>
              </template>
              <span v-else class="self-badge">(Phiên hiện tại)</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../api'
import { currentUser } from '../auth'

const users = ref([])
const loading = ref(true)
const error = ref(null)
const copied = ref(false)

const tempPassModal = ref({
  show: false,
  targetUser: '',
  password: ''
})

const decoratedUsers = computed(() => {
  const localRegistry = JSON.parse(localStorage.getItem('soc_user_devices') || '{}')

  return users.value.map((u) => {
    const reg = localRegistry[u.username] || {}

    const machine =
      u.deviceName ||
      reg.deviceName ||
      (u.role === 'admin'
        ? 'DESKTOP-SOC-MASTER'
        : `DESKTOP-${(u.username + '3IB1LUP').slice(0, 7).toUpperCase()}`)

    const ip = u.ipAddress || reg.ipAddress || (u.role === 'admin' ? '192.168.1.1' : '192.168.1.105')

    return {
      ...u,
      deviceName: machine,
      ipAddress: ip,
    }
  })
})

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('vi-VN')
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await apiFetch('/api/users')
    if (!res.ok) throw new Error('Không lấy được danh sách user')
    const data = await res.json()
    users.value = data.users || []
    error.value = null
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function resetPassword(u) {
  if (!confirm(`Bạn có chắc muốn cấp mật khẩu tạm cho tài khoản "${u.username}"?`)) return
  try {
    const res = await apiFetch(`/api/users/${u.username}/reset-password`, {
      method: 'POST'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Cấp mật khẩu thất bại')

    tempPassModal.value = {
      show: true,
      targetUser: u.username,
      password: data.tempPassword
    }
    copied.value = false
  } catch (err) {
    alert(err.message)
  }
}

function copyTempPassword() {
  if (!tempPassModal.value.password) return
  navigator.clipboard.writeText(tempPassModal.value.password)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

async function toggleRole(u) {
  const newRole = u.role === 'admin' ? 'user' : 'admin'
  if (!confirm(`Đổi quyền của "${u.username}" thành ${newRole}?`)) return
  await apiFetch(`/api/users/${u.username}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole }),
  })
  fetchUsers()
}

async function removeUser(u) {
  if (!confirm(`Xóa vĩnh viễn tài khoản "${u.username}"?`)) return
  await apiFetch(`/api/users/${u.username}`, { method: 'DELETE' })
  fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
.soc-card {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.95) 0%, rgba(9, 16, 26, 0.98) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
}

.hud-tag {
  font-size: 9.5px;
  font-family: var(--font-ui);
  color: #22d3ee;
  letter-spacing: 1.5px;
  display: block;
}

h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
}

.shield-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 11px;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

/* Banner Cấp Pass Tạm Thời */
.temp-pass-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.4);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.15);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 18px;
  font-family: var(--font-ui);
}

.banner-left { display: flex; align-items: center; gap: 12px; }
.key-icon { font-size: 20px; }
.banner-title { font-size: 12px; color: #e2e8f0; }
.banner-title strong { color: #22d3ee; }
.banner-sub { font-size: 10px; color: #94a3b8; }

.banner-right { display: flex; align-items: center; gap: 10px; }
.temp-pass-code {
  background: #020611;
  border: 1px dashed #22d3ee;
  color: #facc15;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 4px;
}

.btn-copy {
  background: rgba(34, 211, 238, 0.15);
  border: 1px solid #22d3ee;
  color: #22d3ee;
  font-family: inherit;
  font-weight: 700;
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-copy:hover { background: #22d3ee; color: #020611; }

.btn-close-banner {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
}
.btn-close-banner:hover { color: #f87171; }

.soc-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 0;
}

.skeleton-line {
  height: 38px;
  background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(59, 130, 246, 0.08) 50%, rgba(255,255,255,0.02) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.soc-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 12.5px;
  font-family: var(--font-ui);
  padding: 10px 14px;
  border-radius: 8px;
}

.table-responsive {
  overflow-x: auto;
  width: 100%;
}

.soc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  font-family: var(--font-ui);
  min-width: 950px;
}

th {
  text-align: left;
  color: #94a3b8;
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.8px;
  white-space: nowrap;
}

td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  white-space: nowrap;
}

.user-row:hover td {
  background: rgba(59, 130, 246, 0.06);
}

.username-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sym {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(34, 211, 238, 0.2));
  border: 1px solid rgba(34, 211, 238, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #22d3ee;
  flex-shrink: 0;
}

.username-text {
  font-weight: 600;
  color: #f8fafc;
}

.device-badge {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 700;
  font-size: 11.5px;
  display: inline-block;
  white-space: nowrap;
}

.ip-badge {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.25);
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 700;
  font-size: 11.5px;
  font-family: var(--font-mono);
  display: inline-block;
  white-space: nowrap;
}

.role-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
  white-space: nowrap;
}

.role-chip.admin {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
}

.role-chip.user {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
}

.btn-reset-pass {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.35);
  color: #facc15;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-reset-pass:hover {
  background: rgba(234, 179, 8, 0.25);
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.3);
}

.btn-role-switch {
  background: rgba(10, 20, 32, 0.8);
  border: 1px solid rgba(148, 190, 255, 0.3);
  color: #e2e8f0;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-role-switch:hover {
  border-color: #22d3ee;
  color: #22d3ee;
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.25);
}

.btn-danger-del {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-danger-del:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.self-badge {
  color: #64748b;
  font-style: italic;
  font-size: 11.5px;
  white-space: nowrap;
}

.muted { color: #64748b; }
.time-cell { white-space: nowrap; font-family: var(--font-mono); font-size: 12px; }
</style>