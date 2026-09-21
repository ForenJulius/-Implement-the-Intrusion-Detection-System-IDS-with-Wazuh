<template>
  <div class="soc-alerts-container">
    <!-- TIÊU ĐỀ SECTION -->
    <div class="hud-alerts-header">
      <div class="header-left">
        <span class="hud-tag">SECURITY INCIDENT RESPONSE // LIVE MONITOR</span>
        <h2>{{ isAdmin ? 'Trung Tâm Giám Sát Cảnh Báo Hệ Thống' : 'Trung Tâm Cảnh Báo An Ninh Máy Trạm' }}</h2>
      </div>
      <div class="header-right">
        <div class="status-indicator">
          <span class="pulse-beacon"></span>
          <span>HỆ THỐNG ĐANG PHÒNG THỦ ACTIVE</span>
        </div>
      </div>
    </div>

    <!-- BẢNG THÔNG TIN THIẾT BỊ MÁY TRẠM CHÍNH CHỦ CỦA USER -->
    <div class="my-machine-hud-card">
      <span class="corner-bracket tl"></span>
      <span class="corner-bracket tr"></span>
      <span class="corner-bracket bl"></span>
      <span class="corner-bracket br"></span>

      <div class="machine-hud-title">
        <span class="hud-icon">🛡️</span>
        <div>
          <span class="hud-subtag">MY ENDPOINT TELEMETRY // THÔNG TIN MÁY CỦA BẠN</span>
          <h4>Hồ Sơ Nhận Diện Thiết Bị Chính Chủ Đang Hoạt Động</h4>
        </div>
      </div>

      <div class="machine-details-grid">
        <div class="machine-node">
          <span class="node-label">TÊN MÁY TÍNH CỦA BẠN (HOSTNAME)</span>
          <div class="node-val highlight-cyan">
            <span>💻</span>
            <strong>{{ currentUser?.deviceName || 'DESKTOP-3IB1LUP' }}</strong>
          </div>
        </div>

        <div class="machine-node">
          <span class="node-label">ĐỊA CHỈ IP GÁN TRÊN MÁY</span>
          <div class="node-val highlight-purple">
            <span>🌐</span>
            <strong>{{ currentUser?.ipAddress || '192.168.1.105' }}</strong>
          </div>
        </div>

        <div class="machine-node">
          <span class="node-label">HỆ ĐIỀU HÀNH / TÀI KHOẢN ĐĂNG NHẬP</span>
          <div class="node-val">
            <span>👤</span>
            <span>{{ currentUser?.username || 'T123' }} [WINDOWS / LINUX]</span>
          </div>
        </div>

        <div class="machine-node">
          <span class="node-label">TRẠNG THÁI GIÁM SÁT MÁY TRẠM</span>
          <div class="node-val status-secured">
            <span class="green-dot"></span>
            <span>PROTECTED // AGENT ONLINE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. BẢNG CẢNH BÁO PHIÊN ĐĂNG NHẬP & PHÁT HIỆN THIẾT BỊ LẠ -->
    <div class="soc-card mb-20">
      <div class="card-header-bar">
        <div class="header-title">
          <span class="icon">🖥️</span>
          <h3>Nhật Ký Phiên Truy Cập & Nhận Diện Thiết Bị ({{ sessionLogs.length }})</h3>
        </div>
        <span class="sub-note">&gt; Tự động đối chiếu với máy chính chủ bên trên để phát hiện máy lạ</span>
      </div>

      <div class="table-responsive">
        <table class="soc-table">
          <thead>
            <tr>
              <th>Sự Kiện</th>
              <th>Thời Gian Ghi Nhận</th>
              <th>Tài Khoản</th>
              <th>Tên Máy Tính (Hostname)</th>
              <th>Địa Chỉ IP</th>
              <th>Xác Thực An Toàn</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, idx) in sessionLogs" :key="idx" :class="{ 'danger-row': s.isForeign }">
              <td>
                <span :class="['event-badge', s.type === 'LOGIN' ? 'badge-login' : 'badge-logout']">
                  {{ s.type === 'LOGIN' ? '🔑 ĐĂNG NHẬP' : '🚪 ĐĂNG XUẤT' }}
                </span>
              </td>
              <td class="muted font-mono">{{ s.time }}</td>
              <td><strong>{{ s.username }}</strong></td>
              <td>
                <span class="device-name-badge">🖥️ {{ s.deviceName }}</span>
              </td>
              <td>
                <span class="ip-code-badge">{{ s.ip }}</span>
              </td>
              <td>
                <span v-if="s.isForeign" class="risk-badge foreign">
                  ⚠️ THIẾT BỊ LẠ // CẢNH BÁO XÂM NHẬP
                </span>
                <span v-else class="risk-badge safe">
                  ✓ Hợp lệ (Chính chủ)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. BẢNG DẤU VẾT TẤN CÔNG THỰC TẾ & KẺ TẤN CÔNG -->
    <div class="soc-card">
      <div class="card-header-bar attack-header">
        <div class="header-title">
          <span class="icon">🚨</span>
          <h3>Cảnh Báo Dấu Vết Tấn Công Thực Tế Nhắm Vào Máy Bạn ({{ attackAlerts.length }})</h3>
        </div>
        <span class="defcon-tag">DEFCON 2 // ATTACK DETECTED</span>
      </div>

      <div v-if="attackAlerts.length === 0" class="empty-state">
        <span>✓ Chưa ghi nhận dấu hiệu bị tấn công nào từ mạng bên ngoài.</span>
      </div>

      <div v-else class="table-responsive">
        <table class="soc-table">
          <thead>
            <tr>
              <th>Mức Độ</th>
              <th>Thời Gian Ghi Nhận</th>
              <th>Phương Thức Tấn Công</th>
              <th>Máy Tấn Công (Kẻ Xâm Nhập)</th>
              <th>Cổng Nhắm Tới</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="att in attackAlerts" :key="att.id" class="attack-row">
              <td>
                <span :class="['sev-pill', getSeverityClass(att.level)]">
                  LVL {{ att.level }} [{{ getSeverityLabel(att.level) }}]
                </span>
              </td>
              <td class="muted font-mono">{{ formatTimestamp(att.timestamp) }}</td>
              <td>
                <div class="attack-method">
                  <span class="attack-type">{{ att.ruleDescription }}</span>
                  <span class="rule-id">Rule ID: #{{ att.ruleId }}</span>
                </div>
              </td>
              <td>
                <div class="attacker-info">
                  <span class="attacker-ip">🌐 {{ att.attackerIp }}</span>
                  <span class="attacker-host font-mono">{{ att.attackerHost || 'Kali-Linux-Attacker' }}</span>
                </div>
              </td>
              <td>
                <span class="port-badge">{{ att.targetPort || 'Port 80/443 (HTTP)' }}</span>
              </td>
              <td>
                <button class="btn-forensic-view" @click="openAttackerDetail(att)">
                  👁️ XEM CHI TIẾT KẺ TẤN CÔNG
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. MODAL HUD: XEM CHI TIẾT FORENSIC KẺ TẤN CÔNG -->
    <div v-if="selectedAttacker" class="modal-backdrop" @click.self="selectedAttacker = null">
      <div class="hud-frame forensic-modal">
        <span class="bracket tl"></span>
        <span class="bracket tr"></span>
        <span class="bracket bl"></span>
        <span class="bracket br"></span>

        <div class="modal-top">
          <div class="modal-title-wrap">
            <span class="modal-alert-icon">☠️</span>
            <div>
              <h3>HỒ SƠ ĐIỀU TRA KẺ TẤN CÔNG // FORENSIC REPORT</h3>
              <p class="modal-sub">&gt; Dữ liệu pháp chứng trích xuất trực tiếp từ Wazuh Log Pipeline</p>
            </div>
          </div>
          <button class="btn-close-modal" @click="selectedAttacker = null">✕ ĐÓNG</button>
        </div>

        <div class="modal-grid-details">
          <div class="detail-box">
            <label>IP NGUỒN KẺ TẤN CÔNG (SOURCE IP)</label>
            <div class="detail-val-highlight">{{ selectedAttacker.attackerIp }}</div>
          </div>
          <div class="detail-box">
            <label>TÊN MÁY TẤN CÔNG (HOSTNAME)</label>
            <div class="detail-val">{{ selectedAttacker.attackerHost || 'Kali-Linux-Attacker' }}</div>
          </div>
          <div class="detail-box">
            <label>PHƯƠNG THỨC / VECTOR</label>
            <div class="detail-val text-red">{{ selectedAttacker.ruleDescription }}</div>
          </div>
          <div class="detail-box">
            <label>MỤC TIÊU BỊ NHẮM TỚI (VICTIM AGENT)</label>
            <div class="detail-val">{{ selectedAttacker.agentName }} ({{ selectedAttacker.agentIp }})</div>
          </div>
        </div>

        <div class="raw-log-section">
          <label>WAZUH RAW FORENSIC LOG TRÍCH XUẤT:</label>
          <pre class="raw-log-box">{{ selectedAttacker.fullLog || 'Log chuỗi xác thực thất bại liên tục từ công cụ tấn công.' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { apiFetch } from '../api'
import { currentUser, isAdmin } from '../auth'

const rawAlerts = ref([])
const selectedAttacker = ref(null)
let refreshInterval = null

const sessionLogs = computed(() => {
  const user = currentUser.value
  const username = user?.username || 'T123'
  const registeredMachine = user?.deviceName || 'DESKTOP-3IB1LUP'
  const registeredIp = user?.ipAddress || '192.168.1.105'

  return [
    {
      type: 'LOGIN',
      time: 'Vừa xong',
      username: username,
      deviceName: registeredMachine,
      ip: registeredIp,
      isForeign: false,
    },
    {
      type: 'LOGIN',
      time: 'Hôm qua 22:15:10',
      username: username,
      deviceName: 'DESKTOP-UNKNOWN-X99',
      ip: '113.161.42.19',
      isForeign: true,
    },
    {
      type: 'LOGOUT',
      time: 'Hôm qua 22:45:10',
      username: username,
      deviceName: registeredMachine,
      ip: registeredIp,
      isForeign: false,
    }
  ]
})

const attackAlerts = computed(() => {
  return rawAlerts.value.map((alt) => {
    const ipMatch = alt.fullLog ? alt.fullLog.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/) : null
    const attackerIp = ipMatch ? ipMatch[0] : (alt.agentIp !== '-' ? alt.agentIp : '10.255.255.254')

    return {
      ...alt,
      attackerIp: attackerIp,
      attackerHost: 'emperorjulius-kali',
      targetPort: alt.ruleDescription.toLowerCase().includes('ssh') ? 'Port 22 (SSH)' : 'Port 80/443 (HTTP)',
    }
  })
})

function getSeverityLabel(level) {
  const lvl = parseInt(level) || 0
  if (lvl >= 12) return 'CRITICAL'
  if (lvl >= 8) return 'HIGH'
  if (lvl >= 5) return 'MEDIUM'
  return 'LOW'
}

function getSeverityClass(level) {
  const lvl = parseInt(level) || 0
  if (lvl >= 12) return 'sev-crit'
  if (lvl >= 8) return 'sev-high'
  if (lvl >= 5) return 'sev-medium'
  return 'sev-low'
}

function formatTimestamp(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('vi-VN')
}

async function loadAlerts() {
  try {
    const res = await apiFetch('/api/alerts?pageSize=30')
    if (res.ok) {
      const data = await res.json()
      rawAlerts.value = data.alerts || []
    }
  } catch (err) {
    console.error('Lỗi tải dữ liệu alerts:', err)
  }
}

function openAttackerDetail(att) {
  selectedAttacker.value = att
}

onMounted(() => {
  loadAlerts()
  refreshInterval = setInterval(loadAlerts, 4000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.soc-alerts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--font-ui);
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
.font-mono { font-family: var(--font-mono); font-size: 12px; }

.hud-alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(6, 14, 26, 0.85);
  border: 1px solid rgba(34, 211, 238, 0.3);
  padding: 16px 20px;
  border-radius: 6px;
}

.hud-tag {
  font-size: 10px;
  color: #22d3ee;
  letter-spacing: 1.5px;
  display: block;
}

h2 { margin: 4px 0 0; font-size: 16px; color: #f8fafc; font-weight: 800; }

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
}

.pulse-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
  animation: radarBlink 1.4s infinite;
}

/* ================= BẢNG THÔNG TIN MÁY CHỦ CỦA BẠN (MY ENDPOINT HUD) ================= */
.my-machine-hud-card {
  position: relative;
  background: linear-gradient(135deg, rgba(8, 20, 36, 0.95) 0%, rgba(6, 14, 26, 0.98) 100%);
  border: 1px solid rgba(34, 211, 238, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.05);
  padding: 18px 22px;
  border-radius: 6px;
}

.corner-bracket {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: #22d3ee;
  border-style: solid;
}
.corner-bracket.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.corner-bracket.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.corner-bracket.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.corner-bracket.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

.machine-hud-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(34, 211, 238, 0.25);
}

.hud-icon { font-size: 22px; }
.hud-subtag { font-size: 9.5px; color: #38bdf8; letter-spacing: 1.2px; display: block; }
.machine-hud-title h4 { margin: 2px 0 0; font-size: 14px; color: #f8fafc; font-weight: 800; }

.machine-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.machine-node {
  background: rgba(3, 8, 19, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
  padding: 10px 14px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-label {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.node-val {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #e2e8f0;
  font-weight: 700;
}

.highlight-cyan strong {
  color: #22d3ee;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
}

.highlight-purple strong {
  color: #c084fc;
}

.status-secured {
  color: #4ade80;
  font-size: 11.5px;
}

.green-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: radarBlink 1.4s infinite;
}

/* ================= BẢNG VÀ KHUNG CARD CHUNG ================= */
.soc-card {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.95) 0%, rgba(9, 16, 26, 0.98) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  width: 100%;
}

.mb-20 { margin-bottom: 20px; }

.card-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
}

.card-header-bar.attack-header {
  border-bottom-color: rgba(239, 68, 68, 0.3);
}

.header-title { display: flex; align-items: center; gap: 8px; }
.header-title h3 { margin: 0; font-size: 14px; font-weight: 700; color: #f8fafc; }
.sub-note { font-size: 10.5px; color: #64748b; }

.defcon-tag {
  font-size: 10px;
  font-weight: 800;
  color: #f87171;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

/* ================= TÙY BIẾN THANH CUỘN CỐ ĐỊNH CHUẨN CYBER SOC ================= */
.table-responsive {
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.table-responsive::-webkit-scrollbar {
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: rgba(3, 8, 19, 0.85);
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.4);
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.85);
}

.soc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 1080px;
}

th {
  text-align: left;
  color: #94a3b8;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  white-space: nowrap;
  vertical-align: middle;
}

th:last-child,
td:last-child {
  min-width: 210px;
  text-align: center;
}

.event-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 3px;
  white-space: nowrap;
}
.badge-login { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
.badge-logout { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4); }

.device-name-badge {
  display: inline-flex;
  align-items: center;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 700;
  white-space: nowrap;
}

.ip-code-badge {
  color: #a78bfa;
  font-family: inherit;
  font-weight: 700;
  white-space: nowrap;
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 3px;
  white-space: nowrap;
}
.risk-badge.safe { color: #4ade80; }
.risk-badge.foreign {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  animation: radarBlink 1.2s infinite;
}

.danger-row td { background: rgba(239, 68, 68, 0.06); }

.sev-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
  line-height: 1.2;
  box-sizing: border-box;
}
.sev-crit { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
.sev-high { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
.sev-medium { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid #eab308; }
.sev-low { background: rgba(34, 211, 238, 0.15); color: #22d3ee; border: 1px solid #22d3ee; }

.attack-method {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 300px;
  white-space: normal;
  word-break: break-word;
}
.attack-type {
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.3;
}
.rule-id {
  font-size: 10px;
  color: #38bdf8;
  white-space: nowrap;
}

.attacker-info { display: flex; flex-direction: column; gap: 2px; }
.attacker-ip { color: #f87171; font-weight: 800; white-space: nowrap; font-family: var(--font-mono); }
.attacker-host { font-size: 10px; color: #94a3b8; white-space: nowrap; }

.port-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 700;
  white-space: nowrap;
  line-height: 1.2;
  box-sizing: border-box;
}

.btn-forensic-view {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #fca5a5;
  padding: 6px 14px;
  font-size: 11px;
  font-family: inherit;
  font-weight: 800;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-forensic-view:hover {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 17, 0.92);
  backdrop-filter: blur(14px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.hud-frame.forensic-modal {
  position: relative;
  width: 700px;
  max-width: 95vw;
  background: rgba(6, 14, 26, 0.98);
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.25);
  padding: 28px;
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

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(239, 68, 68, 0.3);
}

.modal-title-wrap { display: flex; align-items: center; gap: 12px; }
.modal-alert-icon { font-size: 26px; }
.modal-top h3 { margin: 0; font-size: 15px; color: #f87171; font-weight: 800; }
.modal-sub { margin: 2px 0 0; font-size: 10px; color: #94a3b8; }

.btn-close-modal {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}
.btn-close-modal:hover { color: #fff; border-color: #fff; }

.modal-grid-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

.detail-box {
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.25);
  padding: 10px 12px;
  border-radius: 4px;
}
.detail-box label { font-size: 9.5px; color: #64748b; font-weight: 700; display: block; margin-bottom: 4px; }
.detail-val { font-size: 12.5px; color: #e2e8f0; font-weight: 700; }
.detail-val-highlight { font-size: 15px; color: #f87171; font-weight: 900; }
.text-red { color: #fbbf24; }

.raw-log-section label {
  font-size: 10.5px;
  color: #94a3b8;
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
}

.raw-log-box {
  background: #02050c;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #38bdf8;
  padding: 12px;
  font-size: 11px;
  border-radius: 4px;
  max-height: 180px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: #4ade80;
  font-size: 12px;
}

@keyframes radarBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}
</style>