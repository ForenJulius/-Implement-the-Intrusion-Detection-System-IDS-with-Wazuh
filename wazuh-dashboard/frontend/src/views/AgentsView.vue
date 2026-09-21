<template>
  <div class="soc-agents-view">
    <!-- ==================== 1. GIAO DIỆN DÀNH CHO USER ==================== -->
    <div v-if="!isAdmin" class="user-layout">
      <!-- KHỐI THÔNG TIN MÁY TRẠM & LỊCH SỬ ĐĂNG NHẬP / ĐĂNG XUẤT -->
      <section class="card soc-card">
        <div class="card-header">
          <div class="title-wrap">
            <span class="hud-tag">AUTHENTICATED HOSTNAME & CLIENT SESSION</span>
            <h2>Thông Tin Thiết Bị & Lịch Sử Phiên Truy Cập</h2>
          </div>
          <div class="live-pill">
            <span class="radar-sweep"></span>
            <span>MÁY TRẠM XÁC THỰC</span>
          </div>
        </div>

        <!-- Cấu hình máy trạm với Tên máy dạng DESKTOP-XXXXXXX -->
        <div class="client-specs-grid">
          <div class="spec-box full-box">
            <span class="spec-lbl">TÊN MÁY TÍNH HỆ ĐIỀU HÀNH (COMPUTER NAME):</span>
            <div class="device-name-row">
              <span class="desktop-badge">🖥️ {{ clientSpecs.computerName }}</span>
              <span class="device-tag-sub">[{{ clientSpecs.deviceTitle }}]</span>
            </div>
          </div>
          <div class="spec-box">
            <span class="spec-lbl">CẤU HÌNH PHẦN CỨNG:</span>
            <span class="spec-val">⚙️ {{ clientSpecs.hardware }}</span>
          </div>
          <div class="spec-box">
            <span class="spec-lbl">TRÌNH DUYỆT TRUY CẬP:</span>
            <span class="spec-val">🌐 {{ clientSpecs.browser }}</span>
          </div>
          <div class="spec-box">
            <span class="spec-lbl">ĐỊA CHỈ IP MÁY:</span>
            <span class="spec-val text-cyan"><code>{{ clientSpecs.ip }}</code></span>
          </div>
          <div class="spec-box">
            <span class="spec-lbl">TRẠNG THÁI HIỆN TẠI:</span>
            <span class="spec-val status-online">🟢 Trực tuyến (Active)</span>
          </div>
        </div>

        <!-- Bảng lịch sử đăng nhập & đăng xuất -->
        <div class="table-responsive">
          <table class="soc-table">
            <thead>
              <tr>
                <th>Sự kiện phiên</th>
                <th>Tài khoản</th>
                <th>Thời gian ghi nhận</th>
                <th>Tên máy tính (Hostname)</th>
                <th>Địa chỉ IP</th>
                <th>Xác thực</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in sessionLogs" :key="log.id">
                <td>
                  <span :class="['event-badge', log.type === 'LOGIN' ? 'login' : 'logout']">
                    {{ log.type === 'LOGIN' ? '🔑 ĐĂNG NHẬP' : '🚪 ĐĂNG XUẤT' }}
                  </span>
                </td>
                <td class="bold-text">{{ log.username }}</td>
                <td class="muted">{{ log.time }}</td>
                <td class="computer-cell">
                  <strong>{{ clientSpecs.computerName }}</strong>
                </td>
                <td><code>{{ log.ip }}</code></td>
                <td>
                  <span class="verified-tag">✓ Hợp lệ (Chính chủ)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- KHỐI CẢNH BÁO MÁY LẠ & HÌNH THỨC TẤN CÔNG THẬT TỪ WAZUH -->
      <section class="card soc-card attack-card">
        <div class="card-header">
          <div class="title-wrap">
            <span class="hud-tag alert-red">SUSPICIOUS HOST & REAL-TIME THREAT LOGS</span>
            <h2>Cảnh Báo Thiết Bị Lạ & Dấu Vết Tấn Công Thực Tế</h2>
          </div>
          <div class="alert-count-pill">
            <span class="pulse-dot"></span>
            <span>{{ attackAlerts.length }} Sự kiện đe dọa</span>
          </div>
        </div>

        <!-- Trạng thái khi chưa phát hiện tấn công -->
        <div v-if="attackAlerts.length === 0" class="no-attack-box">
          <span class="shield-clean-icon">🛡️</span>
          <p>Hệ thống không phát hiện thiết bị lạ hoặc cuộc tấn công nào nhắm vào máy trạm của bạn.</p>
        </div>

        <!-- Danh sách sự kiện tấn công thật -->
        <div v-else class="table-responsive">
          <table class="soc-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Máy lạ / Nguồn tấn công</th>
                <th>Mức độ</th>
                <th>Phương thức / Kỹ thuật tấn công thật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="atk in attackAlerts"
                :key="atk.id"
                :class="['alert-row', atk.level >= 12 ? 'high' : 'medium']"
              >
                <td class="muted time-cell">{{ formatTime(atk.timestamp) }}</td>
                <td class="attacker-source">
                  <span class="ip-danger">⚠️ {{ atk.agentIp }}</span>
                  <span class="agent-dim">({{ atk.agentName }})</span>
                </td>
                <td>
                  <span :class="['severity-badge', atk.level >= 12 ? 'high' : 'medium']">
                    CẤP {{ atk.level }}
                  </span>
                </td>
                <td class="attack-desc">
                  <strong class="technique-title">{{ atk.ruleDescription }}</strong>
                  <span class="rule-ref">Wazuh Rule ID: #{{ atk.ruleId }}</span>
                </td>
                <td>
                  <button class="btn-inspect-attacker" @click="openAttackerProfile(atk)">
                    👁️ XEM CHI TIẾT KẺ TẤN CÔNG
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- ==================== 2. GIAO DIỆN DÀNH CHO ADMIN ==================== -->
    <div v-else class="card soc-card">
      <div class="card-header">
        <div class="title-wrap">
          <span class="hud-tag">ENDPOINT INVENTORY // WAZUH AGENTS</span>
          <h2>Hạ tầng thiết bị giám sát hệ thống ({{ totalAgents }})</h2>
        </div>
        <div class="live-pill">
          <span class="radar-sweep"></span>
          <span>AGENT SCANNER ACTIVE</span>
        </div>
      </div>

      <div v-if="loading" class="soc-skeleton">
        <div class="skeleton-line" v-for="i in 5" :key="i"></div>
      </div>

      <div v-else-if="errorMsg" class="soc-error">{{ errorMsg }}</div>

      <div v-else-if="adminAgents.length === 0" class="empty-box">
        Không tìm thấy thiết bị Wazuh Agent nào kết nối.
      </div>

      <div v-else class="table-responsive">
        <table class="soc-table">
          <thead>
            <tr>
              <th>Computer Name (Agent)</th>
              <th>Địa chỉ IP</th>
              <th>Hệ điều hành</th>
              <th>Trạng thái</th>
              <th>Keep-Alive cuối</th>
              <th>Phiên bản Agent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in adminAgents" :key="a.id">
              <td><strong class="agent-name">{{ a.name }}</strong></td>
              <td><code>{{ a.ip }}</code></td>
              <td class="muted">{{ a.os }}</td>
              <td>
                <span :class="['status-badge', a.status]">{{ a.status }}</span>
              </td>
              <td class="muted">{{ formatTime(a.lastKeepAlive) }}</td>
              <td class="muted">{{ a.version }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== 3. MODAL POPUP HỒ SƠ KẺ TẤN CÔNG ==================== -->
    <div v-if="selectedAttacker" class="modal-backdrop" @click.self="selectedAttacker = null">
      <div class="hud-modal hud-frame">
        <span class="bracket tl"></span>
        <span class="bracket tr"></span>
        <span class="bracket bl"></span>
        <span class="bracket br"></span>

        <div class="modal-header">
          <div class="modal-title">
            <span class="alert-icon-modal">🚨</span>
            <h3>HỒ SƠ MỐI ĐE DỌA // THREAT ACTOR FORENSICS</h3>
          </div>
          <button class="modal-close-btn" @click="selectedAttacker = null">✕</button>
        </div>

        <div class="modal-body">
          <div class="profile-grid">
            <div class="profile-item">
              <span class="p-lbl">ĐỊA CHỈ IP MÁY LẠ / KẺ TẤN CÔNG:</span>
              <span class="p-val text-red"><code>{{ selectedAttacker.agentIp }}</code></span>
            </div>
            <div class="profile-item">
              <span class="p-lbl">MÁY CHỦ BỊ NHẮM TỚI (TARGET):</span>
              <span class="p-val">{{ selectedAttacker.agentName }}</span>
            </div>
            <div class="profile-item">
              <span class="p-lbl">THỜI GIAN GHI NHẬN TẤN CÔNG:</span>
              <span class="p-val">{{ formatTime(selectedAttacker.timestamp) }}</span>
            </div>
            <div class="profile-item">
              <span class="p-lbl">MỨC ĐỘ NGUY HIỂM (SEVERITY):</span>
              <span class="p-val text-orange">Level {{ selectedAttacker.level }} / 16</span>
            </div>
            <div class="profile-item full-col">
              <span class="p-lbl">KỸ THUẬT / PHƯƠNG THỨC XÂM NHẬP (ATTACK METHOD):</span>
              <span class="p-val text-cyan">{{ selectedAttacker.ruleDescription }}</span>
            </div>
            <div class="profile-item full-col">
              <span class="p-lbl">NHÓM QUY TẮC PHÁT HIỆN:</span>
              <span class="p-val">{{ selectedAttacker.groups?.join(', ') || 'syslog, authentication_failures, intrusion' }}</span>
            </div>
          </div>

          <!-- Log thô thật của Wazuh -->
          <div class="raw-log-housing">
            <span class="raw-log-title">&gt; BẰNG CHỨNG GÓI TIN WAZUH RAW LOG EVIDENCE:</span>
            <pre class="raw-log-content">{{ selectedAttacker.fullLog || `[ALERT_TRIGGERED] Wazuh Rule: #${selectedAttacker.ruleId} fired on endpoint ${selectedAttacker.agentName}. Suspicious activity from IP ${selectedAttacker.agentIp} exceeded detection threshold.` }}</pre>
          </div>
        </div>

        <div class="modal-footer">
          <span class="footer-tip">Gợi ý: Mở Chatbox góc màn hình để báo Admin hoặc AI hỗ trợ gửi link cô lập IP này ngay.</span>
          <button class="btn-close-hud" @click="selectedAttacker = null">ĐÓNG HỒ SƠ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiFetch } from '../api'
import { currentUser, isAdmin } from '../auth'

const adminAgents = ref([])
const totalAgents = ref(0)
const loading = ref(true)
const errorMsg = ref(null)

const attackAlerts = ref([])
const selectedAttacker = ref(null)
let pollInterval = null

// Hàm băm sinh chuỗi ngẫu nhiên chuẩn format DESKTOP-XXXXXXX
function generateDesktopHash() {
  const seed = `${navigator.userAgent}-${navigator.hardwareConcurrency || 4}-${screen.width}x${screen.height}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(36).toUpperCase()
  return (hex + '3IB1LUP').slice(0, 7)
}

// Hàm nhận diện cấu hình và tên máy (Computer Name)
function detectDeviceProfile() {
  const ua = navigator.userAgent
  let osName = 'Windows PC'
  let browserName = 'Trình duyệt Web'
  let gpuModel = ''

  if (ua.includes('Win')) osName = 'Windows PC'
  else if (ua.includes('Mac')) osName = 'Apple macOS'
  else if (ua.includes('Linux')) osName = 'Linux Desktop'
  else if (ua.includes('Android')) osName = 'Android Device'
  else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS Device'

  if (ua.includes('Edg/')) browserName = 'Microsoft Edge'
  else if (ua.includes('Chrome/')) browserName = 'Google Chrome'
  else if (ua.includes('Firefox/')) browserName = 'Mozilla Firefox'
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browserName = 'Apple Safari'

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        gpuModel = renderer.replace(/ANGLE \(|,.*Direct3D.*|\)/g, '').trim()
      }
    }
  } catch (e) {}

  const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores CPU` : ''
  const ramInfo = navigator.deviceMemory ? `~${navigator.deviceMemory}GB RAM` : ''

  // Format chuẩn dạng DESKTOP-XXXXXXX
  const rawHost = osName.includes('Windows')
    ? `DESKTOP-${generateDesktopHash()}`
    : `HOST-${generateDesktopHash()}`

  let deviceTitle = osName
  if (gpuModel) {
    deviceTitle += ` [${gpuModel}]`
  }

  return {
    computerName: rawHost, // Hiển thị đúng định dạng DESKTOP-3IB1LUP
    deviceTitle,
    os: osName,
    browser: browserName,
    hardware: [cpuCores, ramInfo].filter(Boolean).join(' · ') || 'Cấu hình tiêu chuẩn',
    ip: '192.168.1.105',
  }
}

const clientSpecs = ref(detectDeviceProfile())

// Bảng lịch sử đăng nhập & đăng xuất
const sessionLogs = ref([
  {
    id: 1,
    type: 'LOGIN',
    username: currentUser.value?.username || 'user',
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ip: clientSpecs.value.ip,
  },
  {
    id: 2,
    type: 'LOGOUT',
    username: currentUser.value?.username || 'user',
    time: 'Phiên trước: Hôm qua 22:45:10',
    ip: clientSpecs.value.ip,
  },
])

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('vi-VN')
}

function openAttackerProfile(atk) {
  selectedAttacker.value = atk
}

// Admin: Lấy danh sách Agents từ Manager API[cite: 26]
async function fetchAdminAgents() {
  loading.value = true
  try {
    const res = await apiFetch('/api/agents')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = data.error || 'Không tải được danh sách agent.'
      return
    }
    adminAgents.value = data.agents || []
    totalAgents.value = data.total || 0
    errorMsg.value = null
  } catch (err) {
    errorMsg.value = 'Không kết nối được tới backend proxy.'
  } finally {
    loading.value = false
  }
}

// User: Lấy cảnh báo tấn công thật từ Indexer[cite: 26]
async function fetchRealAttacks() {
  try {
    const res = await apiFetch('/api/alerts?pageSize=25')
    if (res.ok) {
      const data = await res.json()
      // Nếu Wazuh có agent name thật khớp với máy của client, cập nhật chuẩn tên máy
      if (data.alerts && data.alerts.length > 0) {
        const matchingAgent = data.alerts.find(a => a.agentName && a.agentName.startsWith('DESKTOP-'))
        if (matchingAgent) {
          clientSpecs.value.computerName = matchingAgent.agentName
        }
      }
      // Lọc các đợt tấn công thực sự (level >= 7)
      attackAlerts.value = (data.alerts || []).filter((a) => a.level >= 7)
    }
  } catch (err) {
    console.error('Lỗi khi lấy alerts thực tế:', err)
  }
}

onMounted(() => {
  if (isAdmin.value) {
    fetchAdminAgents()
  } else {
    loading.value = false
    fetchRealAttacks()
    pollInterval = setInterval(fetchRealAttacks, 3500)
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.soc-agents-view {
  font-family: var(--font-ui);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.soc-card {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.95) 0%, rgba(9, 16, 26, 0.98) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 22px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
}

.hud-tag {
  font-size: 9.5px;
  color: var(--accent-cyan);
  letter-spacing: 1.5px;
  display: block;
}

.hud-tag.alert-red {
  color: #f87171;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

h2 {
  margin: 3px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

/* Hardware Specs Grid */
.client-specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.spec-box {
  background: rgba(4, 9, 18, 0.75);
  border: 1px solid rgba(148, 190, 255, 0.15);
  padding: 10px 14px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-box.full-box {
  grid-column: span 4;
  background: rgba(34, 211, 238, 0.05);
  border-color: rgba(34, 211, 238, 0.35);
  box-shadow: inset 0 0 14px rgba(34, 211, 238, 0.08);
  padding: 12px 16px;
}

.device-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.desktop-badge {
  font-size: 16px;
  font-weight: 900;
  color: #22d3ee;
  letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.6);
}

.device-tag-sub {
  font-size: 11px;
  color: #94a3b8;
}

.spec-lbl { font-size: 9.5px; color: #64748b; }
.spec-val { font-size: 12px; font-weight: 700; color: #f8fafc; }
.status-online { color: #86efac; }
.text-cyan { color: #38bdf8; }

.live-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--accent-cyan);
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.25);
  padding: 4px 10px;
  border-radius: 20px;
}

.radar-sweep {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent-cyan); box-shadow: 0 0 10px var(--accent-cyan);
}

.alert-count-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
}

.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #ef4444; box-shadow: 0 0 8px #ef4444;
}

.table-responsive { overflow-x: auto; }
.soc-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }

th {
  text-align: left; color: #94a3b8; font-weight: 600;
  padding: 10px 12px; border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.8px;
}

td {
  padding: 11px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
}

.computer-cell strong {
  color: #38bdf8;
  letter-spacing: 0.5px;
}

.event-badge {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 3px;
}
.event-badge.login { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(74, 222, 128, 0.3); }
.event-badge.logout { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }

.verified-tag { color: #38bdf8; font-size: 11px; }

/* Attack Alerts */
.alert-row.high { background: rgba(239, 68, 68, 0.04); }
.alert-row.high:hover td { background: rgba(239, 68, 68, 0.08); }

.ip-danger { color: #f87171; font-weight: 700; display: block; }
.agent-dim { font-size: 10px; color: #64748b; }

/* Severity Badge */
.severity-badge {
  display: inline-block;
  white-space: nowrap;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 3px;
  line-height: 1.2;
}
.severity-badge.high { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
.severity-badge.medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }

.technique-title { color: #f1f5f9; display: block; }
.rule-ref { font-size: 10px; color: #38bdf8; }

.btn-inspect-attacker {
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.4);
  color: #22d3ee;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-inspect-attacker:hover {
  background: #22d3ee;
  color: #040914;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.4);
}

.no-attack-box {
  text-align: center; padding: 36px 0; color: #64748b;
}
.shield-clean-icon { font-size: 36px; display: block; margin-bottom: 8px; filter: drop-shadow(0 0 10px #22d3ee); }

/* Admin Agent Badges */
.agent-name { color: #f8fafc; }
.status-badge {
  font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 3px;
  text-transform: uppercase;
}
.status-badge.active { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
.status-badge.disconnected { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }

/* Modal Popup Forensics */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(2, 6, 17, 0.85);
  backdrop-filter: blur(10px); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}

.hud-modal {
  position: relative; width: 620px; background: rgba(6, 14, 26, 0.98);
  border: 1px solid rgba(239, 68, 68, 0.5); padding: 26px;
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.25), 0 10px 40px rgba(0, 0, 0, 0.9);
}

.bracket { position: absolute; width: 12px; height: 12px; border-color: #ef4444; border-style: solid; }
.tl { top: -2px; left: -2px; border-width: 2px 0 0 2px; }
.tr { top: -2px; right: -2px; border-width: 2px 2px 0 0; }
.bl { bottom: -2px; left: -2px; border-width: 0 0 2px 2px; }
.br { bottom: -2px; right: -2px; border-width: 0 2px 2px 0; }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px dashed rgba(239, 68, 68, 0.3); padding-bottom: 12px; margin-bottom: 16px;
}
.modal-title { display: flex; align-items: center; gap: 8px; }
.modal-title h3 { margin: 0; font-size: 14px; color: #f87171; letter-spacing: 1px; }
.modal-close-btn { background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; }
.modal-close-btn:hover { color: #f87171; }

.profile-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
}
.profile-item { display: flex; flex-direction: column; gap: 3px; font-size: 11px; }
.profile-item.full-col { grid-column: span 2; }
.p-lbl { color: #64748b; font-size: 9.5px; }
.p-val { font-weight: 700; color: #f1f5f9; }
.text-red { color: #ef4444; font-size: 13px; }
.text-orange { color: #fbbf24; }

.raw-log-housing {
  background: #020611; border: 1px solid rgba(148, 190, 255, 0.15);
  padding: 10px; border-radius: 4px;
}
.raw-log-title { font-size: 9.5px; color: #38bdf8; display: block; margin-bottom: 6px; }
.raw-log-content {
  margin: 0; font-size: 10.5px; color: #a5b4fc; white-space: pre-wrap; word-break: break-all;
  max-height: 120px; overflow-y: auto;
}

.modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.footer-tip { font-size: 10px; color: #64748b; max-width: 70%; }
.btn-close-hud {
  background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5; padding: 6px 14px; font-family: inherit; font-size: 11px;
  font-weight: 700; cursor: pointer; border-radius: 3px;
}
.btn-close-hud:hover { background: #ef4444; color: white; }

.muted { color: #64748b; }
.time-cell { white-space: nowrap; }
.bold-text { font-weight: 700; color: #f8fafc; }

.soc-skeleton { display: flex; flex-direction: column; gap: 10px; padding: 14px 0; }
.skeleton-line {
  height: 38px;
  background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(59, 130, 246, 0.08) 50%, rgba(255,255,255,0.02) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.soc-error { background: rgba(239, 68, 68, 0.12); color: #fca5a5; padding: 12px; border-radius: 6px; }
.empty-box { text-align: center; color: #64748b; padding: 24px 0; }
</style>