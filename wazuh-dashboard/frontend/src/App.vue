<template>
  <div v-if="!authed" class="auth-wrapper">
    <LoginView v-if="authView === 'login'" :message="authMessage" @switch="handleAuthSwitch" />
    <ForgotPasswordView v-else-if="authView === 'forgot'" @switch="handleAuthSwitch" />
    <RegisterView v-else @switch="handleAuthSwitch" />
  </div>

  <div v-else class="shell soc-command-shell">
    <!-- MODAL BẮT BUỘC ĐỔI MẬT KHẨU MỚI NẾU TÀI KHOẢN ĐANG DÙNG PASS TẠM -->
    <div v-if="user?.mustChangePassword" class="force-pwd-backdrop">
      <div class="hud-frame force-pwd-modal">
        <span class="bracket tl"></span>
        <span class="bracket tr"></span>
        <span class="bracket bl"></span>
        <span class="bracket br"></span>

        <div class="hud-telemetry">
          <div class="telemetry-left">
            <span class="radar-beacon-red"></span>
            <span class="telemetry-tag-red">SECURITY PROTOCOL // REQUIRE_CREDENTIAL_CHANGE</span>
          </div>
          <span class="defcon-pill-red">DEFCON 2</span>
        </div>

        <div class="modal-inner">
          <div class="modal-head-title">
            <span class="head-icon">🔐</span>
            <div>
              <h3>THIẾT LẬP MẬT KHẨU MỚI</h3>
              <p class="head-sub">&gt; Bạn vừa đăng nhập bằng mật khẩu tạm do Quản trị viên cấp.</p>
            </div>
          </div>

          <form @submit.prevent="submitNewPassword" class="soc-pwd-form">
            <div class="field-item">
              <label>MẬT KHẨU MỚI CHÍNH THỨC</label>
              <div class="pwd-input-wrap">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  placeholder="Tối thiểu 8 ký tự, gồm Hoa, Thường, Số, Đặc biệt"
                  class="hud-input"
                />
                <button
                  type="button"
                  class="pwd-toggle-btn"
                  @click="showNewPassword = !showNewPassword"
                  :aria-label="showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                  tabindex="-1"
                >
                  <svg v-if="!showNewPassword" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.3 20.3 0 0 1-4.22 5.06M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="field-item">
              <label>XÁC NHẬN MẬT KHẨU MỚI</label>
              <div class="pwd-input-wrap">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  placeholder="••••••••"
                  class="hud-input"
                />
                <button
                  type="button"
                  class="pwd-toggle-btn"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                  tabindex="-1"
                >
                  <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.3 20.3 0 0 1-4.22 5.06M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="pwdError" class="soc-alert-error">
              <span>⛔</span>
              <span>{{ pwdError }}</span>
            </div>

            <button type="submit" :disabled="submitting" class="btn-confirm-pwd">
              <span>{{ submitting ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN THAY ĐỔI & TIẾP TỤC VÀO HỆ THỐNG' }}</span>
              <span>&gt;&gt;</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <Sidebar
      :active="activeView"
      :is-admin="admin"
      @change="activeView = $event"
    />

    <div class="main soc-viewport">
      <div class="bg-cyber-grid"></div>
      <div class="screen-scanline"></div>

      <!-- Topbar Header -->
      <header class="topbar soc-topbar">
        <div class="topbar-laser-scan"></div>

        <div class="brand-zone">
          <div class="brand-node-icon">
            <span class="hud-corner-sm tl"></span>
            <span class="hud-corner-sm br"></span>
            <span class="node-txt">SOC</span>
            <span class="node-pulse"></span>
          </div>
          <div class="brand-titles">
            <div class="title-flex">
              <h1>{{ pageTitle }}</h1>
              <span class="node-tag-code">[LIVE_INGESTION // ATTACK_FEED]</span>
            </div>
            <p class="subtitle">BLUE TEAM REAL-TIME TELEMETRY · TỰ DO TEST TẤN CÔNG THỰC TẾ</p>
          </div>
        </div>

        <div class="topbar-actions">
          <!-- NÚT QUÉT LỖ HỔNG / THREAT SCANNER -->
          <button
            class="soc-scan-trigger"
            :class="{ scanning: isScanning }"
            :disabled="isScanning"
            @click="triggerThreatScan"
          >
            <span class="scan-radar-icon">📡</span>
            <span>{{ isScanning ? 'ĐANG QUÉT MỐI ĐE DỌA...' : 'QUÉT LỖ HỔNG / THREAT SCAN' }}</span>
          </button>

          <!-- Ping & DEFCON -->
          <div class="telemetry-capsule">
            <div class="ping-block">
              <span class="ping-signal"></span>
              <span class="ping-metric">{{ latency }}ms</span>
            </div>
            <span class="telemetry-bar">|</span>
            <span class="defcon-lvl">DEFCON 4</span>
          </div>

          <!-- User Info & Logout -->
          <div class="user-identity-box">
            <div class="user-hex-avatar">{{ initials }}</div>
            <div class="user-desc">
              <div class="username-display"><span class="cursor-sym">&gt;</span> {{ user?.username }}</div>
              <div :class="['role-badge-tag', admin ? 'role-admin' : 'role-user']">
                {{ admin ? 'SYS_ADMIN' : 'SOC_ANALYST' }}
              </div>
            </div>
            <button class="soc-logout-btn" @click="handleLogout">
              <span>THOÁT</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Khung hiển thị tiến trình quét (Scanner Radar Overlay) -->
      <div v-if="isScanning" class="scan-progress-banner">
        <div class="scanner-anim-line"></div>
        <div class="banner-content">
          <span class="banner-icon">⚡</span>
          <span>HỆ THỐNG ĐANG QUÉT TOÀN BỘ CỔNG MẠNG, AUDIT RULES & INTEGRITY CHECKS...</span>
          <span class="scan-counter">{{ scanProgress }}%</span>
        </div>
      </div>

      <main class="soc-content-area">
        <!-- Bọc hiệu ứng chuyển cảnh mềm mại dạng HUD Hologram cho mọi trang -->
        <router-view v-slot="{ Component }">
          <transition name="soc-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <SocChatbox :current-user="user" :is-admin="admin" />

      <!-- Modal kết quả quét (thay cho alert() thô của trình duyệt) -->
      <div v-if="showScanResult" class="scan-modal-overlay" @click.self="closeScanResult">
        <div class="scan-modal">
          <div class="scan-modal-header">
            <span class="scan-modal-title">
              <span v-if="scanError">⛔ QUÉT THẤT BẠI</span>
              <span v-else-if="scanFindings.length === 0">✅ QUÉT HOÀN TẤT — AN TOÀN</span>
              <span v-else>🚨 QUÉT HOÀN TẤT — PHÁT HIỆN {{ scanFindings.length }} MỐI ĐE DỌA</span>
            </span>
            <button class="scan-modal-close" @click="closeScanResult">✕</button>
          </div>

          <div class="scan-modal-body">
            <p v-if="scanError" class="scan-error-text">{{ scanError }}</p>

            <p v-else-if="scanFindings.length === 0" class="scan-safe-text">
              Đã kiểm tra toàn bộ file integrity, cổng mạng và log trong 15 phút gần nhất.
              Không phát hiện dấu hiệu tấn công hay bất thường nào.
            </p>

            <div v-else class="scan-findings-list">
              <div v-for="f in scanFindings" :key="f.id" class="scan-finding-item">
                <span :class="['scan-level-badge', f.level >= 12 ? 'high' : f.level >= 10 ? 'medium' : 'low']">
                  LVL {{ f.level }}
                </span>
                <div class="scan-finding-body">
                  <div class="scan-finding-desc">{{ f.ruleDescription }}</div>
                  <div class="scan-finding-meta">
                    {{ new Date(f.timestamp).toLocaleString('vi-VN') }} · Thiết bị: {{ f.agentName }}
                    <span v-if="f.srcIp"> · Nguồn tấn công: {{ f.srcIp }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="scan-modal-ok" @click="closeScanResult">Đã hiểu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import SocChatbox from './components/SocChatbox.vue'
import DashboardView from './views/DashboardView.vue'
import AlertsView from './views/AlertsView.vue'
import AgentsView from './views/AgentsView.vue'
import RulesView from './views/RulesView.vue'
import UsersView from './views/UsersView.vue'
import ProfileView from './views/ProfileView.vue'
import LoginView from './views/LoginView.vue'
import ForgotPasswordView from './views/ForgotPasswordView.vue'
import RegisterView from './views/RegisterView.vue'
import { isAuthenticated, isAdmin, currentUser, logout, setMustChangePassword } from './auth'
import { apiFetch } from './api'

const activeView = ref('home')
const authView = ref('login')
const authMessage = ref('')
const latency = ref(16)
let latencyInterval = null

// Form đổi mật khẩu bắt buộc
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const pwdError = ref('')
const submitting = ref(false)

// Scanner state
const isScanning = ref(false)
const scanProgress = ref(0)
const showScanResult = ref(false)
const scanFindings = ref([])
const scanError = ref('')

function handleAuthSwitch(view, message) {
  authView.value = view
  authMessage.value = message || ''
}

const authed = isAuthenticated
const admin = isAdmin
const user = currentUser

const titles = {
  home: 'Giới Thiệu Tổng Thể Hệ Thống Phòng Thủ SOC',
  dashboard: 'Bảng Điều Khiển An Ninh Tập Trung',
  alerts: 'Nhật Ký Sự Kiện Tấn Công Thời Gian Thực',
  agents: 'Hạ Tầng Endpoint & Máy Chủ',
  rules: 'Bộ Luật Phát Hiện Wazuh Ruleset',
  users: 'Quản Trị Đặc Quyền Người Dùng',
  profile: 'Tài Khoản Của Tôi',
}

const pageTitle = computed(() => titles[activeView.value] || 'Hệ Thống Giám Sát An Ninh')
const initials = computed(() => (user.value?.username || '?').slice(0, 2).toUpperCase())

async function submitNewPassword() {
  pwdError.value = ''
  if (!newPassword.value) {
    pwdError.value = 'Vui lòng nhập mật khẩu mới'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    pwdError.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  submitting.value = true
  try {
    const res = await apiFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPassword.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại')

    // Tắt modal và mở khóa dashboard cho người dùng
    setMustChangePassword(false)
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    pwdError.value = err.message
  } finally {
    submitting.value = false
  }
}

async function triggerThreatScan() {
  isScanning.value = true
  scanProgress.value = 0
  scanError.value = ''

  const scanPromise = apiFetch('/api/scan/trigger', { method: 'POST' })
    .then((res) => res.json())
    .catch((err) => ({ error: 'Không kết nối được tới backend', detail: err.message, findings: [] }))

  const interval = setInterval(() => {
    scanProgress.value += 5
    if (scanProgress.value >= 100) {
      clearInterval(interval)
      scanPromise.then((data) => {
        setTimeout(() => {
          isScanning.value = false
          if (data.error) {
            scanError.value = data.error
            scanFindings.value = []
          } else {
            scanFindings.value = data.findings || []
            scanError.value = ''
          }
          showScanResult.value = true
        }, 400)
      })
    }
  }, 100)
}

function closeScanResult() {
  showScanResult.value = false
}

function handleLogout() {
  logout()
  activeView.value = 'dashboard'
  authView.value = 'login'
}

onMounted(() => {
  latencyInterval = setInterval(() => {
    latency.value = Math.floor(13 + Math.random() * 9)
  }, 2500)
})

onUnmounted(() => {
  if (latencyInterval) clearInterval(latencyInterval)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg: #030712;
  --bg-panel: #07101e;
  --bg-panel-alt: #050b14;
  --border: #15253b;
  --border-soft: #0e1c2e;
  --text: #f1f5f9;
  --text-muted: #8092ab;
  --accent: #1d4ed8;
  --accent-cyan: #22d3ee;
  --high: #ef4444;
  --medium: #f59e0b;
  --low: #22d3ee;
  --font-ui: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
  overflow-x: hidden;
}

.soc-command-shell { display: flex; min-height: 100vh; }
.auth-wrapper { min-height: 100vh; background: var(--bg); }

/* VÙNG MODAL KHÓA MÀN HÌNH BẮT BUỘC ĐỔI MẬT KHẨU */
.force-pwd-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 17, 0.94);
  backdrop-filter: blur(16px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
}

.force-pwd-modal {
  position: relative;
  width: 480px;
  background: rgba(6, 14, 26, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 60px rgba(239, 68, 68, 0.25), 0 0 20px rgba(0, 0, 0, 0.9);
  padding: 28px 24px;
}

.bracket {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: #ef4444;
  border-style: solid;
}
.tl { top: -2px; left: -2px; border-width: 2px 0 0 2px; }
.tr { top: -2px; right: -2px; border-width: 2px 2px 0 0; }
.bl { bottom: -2px; left: -2px; border-width: 0 0 2px 2px; }
.br { bottom: -2px; right: -2px; border-width: 0 2px 2px 0; }

.hud-telemetry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(239, 68, 68, 0.35);
}

.telemetry-left { display: flex; align-items: center; gap: 8px; }
.radar-beacon-red {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: radarBlink 1.4s infinite;
}
.telemetry-tag-red { font-size: 10px; color: #f87171; letter-spacing: 1px; font-weight: 700; }
.defcon-pill-red {
  font-size: 9px;
  font-weight: 800;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 2px 6px;
  border-radius: 2px;
}

.modal-head-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.head-icon { font-size: 26px; }
.modal-head-title h3 {
  margin: 0;
  font-size: 15px;
  color: #f87171;
  font-weight: 800;
  letter-spacing: 1px;
}
.head-sub { margin: 2px 0 0; font-size: 10.5px; color: #94a3b8; }

.soc-pwd-form { display: flex; flex-direction: column; gap: 12px; }
.field-item { display: flex; flex-direction: column; gap: 4px; }
.field-item label { font-size: 10.5px; font-weight: 700; color: #cbd5e1; }
.hud-input {
  background: #030813 !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  color: #38bdf8 !important;
  padding: 9px 10px;
  font-size: 12px;
  border-radius: 3px;
  font-family: inherit;
}
.hud-input:focus { outline: none; border-color: #22d3ee !important; }

.pwd-input-wrap { position: relative; display: flex; }
.pwd-input-wrap .hud-input { flex: 1; padding-right: 38px; }
.pwd-toggle-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #7d8ba1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  transition: color 0.15s ease;
}
.pwd-toggle-btn:hover { color: #22d3ee; }

.soc-alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 11px;
  padding: 8px 10px;
  border-radius: 3px;
}

.btn-confirm-pwd {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%);
  border: 1px solid rgba(248, 113, 113, 0.6);
  color: #ffffff;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  transition: all 0.2s;
}
.btn-confirm-pwd:hover:not(:disabled) {
  filter: brightness(1.2);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}
.btn-confirm-pwd:disabled { opacity: 0.5; cursor: not-allowed; }

/* VIEWPORT CHÍNH */
.soc-viewport {
  position: relative;
  flex: 1;
  margin-left: 240px;
  padding: 20px 24px;
  width: calc(100vw - 240px);
  min-width: 0;
  box-sizing: border-box;
}

.bg-cyber-grid {
  position: fixed; inset: 0; z-index: -2;
  background:
    radial-gradient(circle at 80% 0%, rgba(29, 78, 216, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 10% 100%, rgba(34, 211, 238, 0.1) 0%, transparent 60%),
    var(--bg);
}
.screen-scanline {
  position: fixed; inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.25) 51%);
  background-size: 100% 4px;
  z-index: -1; pointer-events: none; opacity: 0.6;
}

/* Topbar Header */
.soc-topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; padding: 14px 20px;
  background: rgba(7, 16, 30, 0.85); backdrop-filter: blur(16px);
  border: 1px solid rgba(34, 211, 238, 0.25); border-radius: 6px;
  position: relative; box-shadow: 0 10px 35px rgba(0, 0, 0, 0.6);
}

.brand-zone { display: flex; align-items: center; gap: 14px; }
.brand-node-icon {
  position: relative; width: 42px; height: 42px;
  background: #040914; border: 1px solid rgba(34, 211, 238, 0.45);
  display: flex; align-items: center; justify-content: center;
}
.node-txt { font-weight: 900; font-size: 13px; color: #22d3ee; }
.title-flex { display: flex; align-items: baseline; gap: 10px; }
.title-flex h1 { margin: 0; font-size: 17px; font-weight: 800; color: #f8fafc; }
.node-tag-code { font-size: 10px; color: #38bdf8; }
.subtitle { margin: 3px 0 0; color: #64748b; font-size: 10.5px; }

.topbar-actions { display: flex; align-items: center; gap: 12px; }

/* Threat Scanner Button */
.soc-scan-trigger {
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid #22d3ee;
  color: #22d3ee;
  padding: 8px 14px;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.25);
  transition: all 0.2s ease;
}

.soc-scan-trigger:hover:not(:disabled) {
  background: #22d3ee;
  color: #040914;
}

.soc-scan-trigger.scanning {
  border-color: #f59e0b;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
}

.scan-progress-banner {
  position: relative;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 10px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.scanner-anim-line {
  position: absolute; top: 0; left: -100%; width: 50%; height: 2px;
  background: #fbbf24;
  box-shadow: 0 0 8px #fbbf24;
  animation: scanRun 1.5s infinite linear;
}

@keyframes scanRun { to { left: 150%; } }

.banner-content {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11.5px; color: #fde68a; font-weight: 700;
}

/* Telemetry & User */
.telemetry-capsule {
  display: flex; align-items: center; gap: 8px;
  background: rgba(5, 12, 22, 0.85); border: 1px solid rgba(148, 190, 255, 0.15);
  padding: 6px 12px; border-radius: 4px; font-size: 11px;
}
.ping-signal { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e; }
.ping-metric { color: #86efac; font-weight: 700; }
.defcon-lvl { color: #38bdf8; font-weight: 700; }

.user-identity-box {
  display: flex; align-items: center; gap: 10px; padding: 4px 6px;
  border: 1px solid rgba(34, 211, 238, 0.25); border-radius: 6px; background: rgba(5, 12, 22, 0.9);
}
.user-hex-avatar {
  width: 30px; height: 30px; background: linear-gradient(135deg, #1d4ed8, #06b6d4);
  border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;
}
.username-display { font-size: 11.5px; font-weight: 700; }
.role-badge-tag { font-size: 8.5px; padding: 1px 4px; border-radius: 2px; }
.role-admin { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
.role-user { background: rgba(34, 211, 238, 0.12); color: #38bdf8; }

.soc-logout-btn {
  background: transparent; border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5; padding: 5px 8px; border-radius: 4px; font-size: 10.5px;
  font-family: inherit; font-weight: 700; cursor: pointer;
}
.soc-logout-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ffffff; }

.scan-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 17, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.scan-modal {
  width: 520px;
  max-width: 92vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: rgba(9, 16, 26, 0.98);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 10px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(34, 211, 238, 0.12);
  font-family: var(--font-ui);
}
.scan-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}
.scan-modal-title { font-size: 13px; font-weight: 800; letter-spacing: 0.5px; color: #f1f5f9; }
.scan-modal-close {
  background: transparent; border: none; color: #64748b;
  cursor: pointer; font-size: 15px;
}
.scan-modal-close:hover { color: #f87171; }

.scan-modal-body { padding: 18px; overflow-y: auto; }
.scan-safe-text { color: #4ade80; font-size: 13px; line-height: 1.6; margin: 0; }
.scan-error-text { color: #fca5a5; font-size: 13px; line-height: 1.6; margin: 0; }

.scan-findings-list { display: flex; flex-direction: column; gap: 10px; }
.scan-finding-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
}
.scan-level-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 4px;
  height: fit-content;
  border: 1px solid;
}
.scan-level-badge.high { color: #f87171; border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.1); }
.scan-level-badge.medium { color: #fbbf24; border-color: rgba(245,158,11,0.5); background: rgba(245,158,11,0.1); }
.scan-level-badge.low { color: #38bdf8; border-color: rgba(56,189,248,0.5); background: rgba(56,189,248,0.1); }
.scan-finding-desc { font-size: 12.5px; color: #f1f5f9; font-weight: 600; }
.scan-finding-meta { font-size: 10.5px; color: #64748b; margin-top: 4px; }

.scan-modal-ok {
  margin: 0 18px 18px;
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.85), rgba(6, 182, 212, 0.85));
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.8px;
  cursor: pointer;
  font-family: inherit;
}
.scan-modal-ok:hover { filter: brightness(1.15); box-shadow: 0 0 16px rgba(34, 211, 238, 0.4); }

/* ================= HIỆU ỨNG CHUYỂN TRANG HOLOGRAM FADE ================= */
.soc-page-enter-active,
.soc-page-leave-active {
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.soc-page-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.995);
  filter: brightness(1.2);
}

.soc-page-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.995);
  filter: brightness(0.8);
}
</style>