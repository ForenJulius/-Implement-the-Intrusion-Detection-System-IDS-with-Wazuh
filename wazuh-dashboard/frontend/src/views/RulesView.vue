<template>
  <div class="card soc-card">
    <div class="toolbar">
      <div class="toolbar-title">
        <span class="hud-tag">DETECTION POLICIES</span>
        <h2>Luật phát hiện mối đe dọa ({{ total }})</h2>
      </div>

      <div class="filters">
        <div class="search-wrap">
          <span class="search-icon">⚡</span>
          <input
            v-model="search"
            type="text"
            placeholder="Tìm theo nội dung luật..."
            @keyup.enter="fetchRules"
          />
        </div>
        <button class="cyber-btn" @click="fetchRules">TRUY VẤN</button>
      </div>
    </div>

    <div v-if="loading" class="soc-skeleton">
      <div class="skeleton-line" v-for="i in 5" :key="i"></div>
    </div>

    <div v-else-if="error" class="soc-error">
      <span class="warn-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="rules.length === 0" class="empty-state">
      <span class="empty-icon">📂</span>
      <p>Không tìm thấy luật nào phù hợp với từ khóa.</p>
    </div>

    <div v-else class="table-responsive">
      <table class="soc-table">
        <thead>
          <tr>
            <th>ID Luật</th>
            <th>Mô tả mối đe dọa (Đã dịch hóa)</th>
            <th>Mức độ</th>
            <th>Nhóm phân loại</th>
            <th>Tập tin định nghĩa</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rules" :key="r.id" class="rule-row">
            <td class="rule-id"><code>#{{ r.id }}</code></td>
            <td class="rule-desc" :title="r.description">
              <span class="desc-text">{{ translateDescription(r.description) }}</span>
            </td>
            <td>
              <span :class="['severity-pill', severityClass(r.level)]">
                L{{ r.level }}
              </span>
            </td>
            <td class="groups-cell">
              <span class="group-tag" v-for="grp in r.groups" :key="grp">{{ grp }}</span>
            </td>
            <td class="file-cell">
              <span class="file-name">{{ r.filename }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../api'

const rules = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(null)
const search = ref('')

function severityClass(level) {
  if (level >= 12) return 'high'
  if (level >= 7) return 'medium'
  return 'low'
}

const DESCRIPTION_DICTIONARY = [
  ['multiple authentication failures', 'nhiều lần xác thực thất bại'],
  ['multiple failed logins', 'nhiều lần đăng nhập thất bại'],
  ['authentication failure', 'xác thực thất bại'],
  ['authentication failed', 'xác thực thất bại'],
  ['login session opened', 'phiên đăng nhập đã mở'],
  ['login session closed', 'phiên đăng nhập đã đóng'],
  ['attempt to login using a non-existent user', 'cố gắng đăng nhập bằng người dùng không tồn tại'],
  ['non-existent user', 'người dùng không tồn tại'],
  ['invalid user', 'người dùng không hợp lệ'],
  ['integrity checksum changed', 'checksum toàn vẹn đã thay đổi'],
  ['successful sudo to root', 'sudo lên root thành công'],
  ['first time user executed sudo', 'lần đầu người dùng thực hiện sudo'],
  ['executed sudo', 'đã thực hiện sudo'],
  ['windows logon success', 'đăng nhập Windows thành công'],
  ['windows logon failure', 'đăng nhập Windows thất bại'],
  ['listened ports status', 'trạng thái cổng đang lắng nghe'],
  ['host-based anomaly detection', 'phát hiện bất thường trên máy chủ'],
  ['new package installed', 'gói phần mềm mới được cài đặt'],
  ['malware detected', 'phát hiện mã độc'],
  ['brute force', 'tấn công dò mật khẩu (brute force)'],
  ['connection attempt', 'cố gắng kết nối'],
  ['connection refused', 'kết nối bị từ chối'],
  ['unauthorized access', 'truy cập trái phép'],
  ['access denied', 'truy cập bị từ chối'],
  ['port scan', 'quét cổng'],
  ['web attack', 'tấn công web'],
  ['sql injection', 'chèn mã SQL (SQL injection)'],
  ['attempted admin', 'cố gắng truy cập quản trị'],
  ['attempt to login', 'cố gắng đăng nhập'],
  ['root login', 'đăng nhập root'],
  ['user login failed', 'người dùng đăng nhập thất bại'],
  ['account locked', 'tài khoản bị khóa'],
  ['service started', 'dịch vụ đã khởi động'],
  ['service stopped', 'dịch vụ đã dừng'],
  ['process started', 'tiến trình đã khởi động'],
  ['high amount of', 'số lượng lớn'],
  ['failed login', 'đăng nhập thất bại'],
  ['successful login', 'đăng nhập thành công'],
  ['file added', 'tệp đã được thêm'],
  ['file deleted', 'tệp đã bị xóa'],
  ['file changed', 'tệp đã bị thay đổi'],
  ['file modified', 'tệp đã bị chỉnh sửa'],
  ['suspicious', 'đáng ngờ'],
  ['critical', 'nghiêm trọng'],
  ['warning', 'cảnh báo'],
  ['error', 'lỗi'],
  ['multiple', 'nhiều lần'],
  ['successful', 'thành công'],
  ['success', 'thành công'],
  ['failed', 'thất bại'],
  ['authentication', 'xác thực'],
  ['login', 'đăng nhập'],
  ['logout', 'đăng xuất'],
  ['session', 'phiên'],
  ['opened', 'đã mở'],
  ['closed', 'đã đóng'],
  ['password', 'mật khẩu'],
  ['users', 'người dùng'],
  ['user', 'người dùng'],
  ['files', 'các tệp'],
  ['file', 'tệp'],
  ['added', 'đã thêm'],
  ['deleted', 'đã xóa'],
  ['removed', 'đã gỡ bỏ'],
  ['changed', 'đã thay đổi'],
  ['modified', 'đã chỉnh sửa'],
  ['created', 'đã tạo'],
  ['updated', 'đã cập nhật'],
  ['connections', 'các kết nối'],
  ['connection', 'kết nối'],
  ['attempts', 'các lần thử'],
  ['attempt', 'cố gắng'],
  ['detected', 'đã phát hiện'],
  ['blocked', 'đã chặn'],
  ['denied', 'bị từ chối'],
  ['allowed', 'được cho phép'],
  ['executed', 'đã thực thi'],
  ['execution', 'thực thi'],
  ['started', 'đã khởi động'],
  ['stopped', 'đã dừng'],
  ['restarted', 'đã khởi động lại'],
  ['installed', 'đã cài đặt'],
  ['uninstalled', 'đã gỡ cài đặt'],
  ['package', 'gói phần mềm'],
  ['service', 'dịch vụ'],
  ['process', 'tiến trình'],
  ['status', 'trạng thái'],
  ['ports', 'các cổng'],
  ['port', 'cổng'],
  ['network', 'mạng'],
  ['firewall', 'tường lửa'],
  ['rules', 'các luật'],
  ['rule', 'luật'],
  ['alert', 'cảnh báo'],
  ['system', 'hệ thống'],
  ['host', 'máy chủ'],
  ['server', 'máy chủ'],
  ['agent', 'thiết bị'],
  ['account', 'tài khoản'],
]

function escapeRegExp(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function translateDescription(text) {
  if (!text) return text
  let result = text
  for (const [en, vi] of DESCRIPTION_DICTIONARY) {
    const re = new RegExp(`\\b${escapeRegExp(en)}\\b`, 'gi')
    result = result.replace(re, vi)
  }
  return result
}

async function fetchRules() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (search.value) params.set('search', search.value)
    const res = await apiFetch(`/api/rules?${params}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (res.status === 403) {
        error.value = 'Tài khoản đang đăng nhập không có quyền admin nên không xem được Luật.'
      } else {
        error.value = `[HTTP ${res.status}] ${data.error || 'Không lấy được danh sách luật'}${data.detail ? ' — ' + data.detail : ''}`
      }
      return
    }
    rules.value = data.rules || []
    total.value = data.total || 0
    error.value = null
  } catch (err) {
    error.value = 'Không kết nối được tới backend (http://localhost:4000). Kiểm tra backend đã chạy chưa.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchRules)
</script>

<style scoped>
.soc-card {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.95) 0%, rgba(9, 16, 26, 0.98) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
}

.hud-tag {
  font-size: 9.5px;
  font-family: var(--font-ui);
  color: var(--accent-cyan);
  letter-spacing: 1.5px;
  display: block;
}

h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
}

.filters { display: flex; gap: 10px; }

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 12px;
  opacity: 0.6;
  pointer-events: none;
}

.search-wrap input {
  background: rgba(10, 20, 32, 0.8);
  border: 1px solid rgba(148, 190, 255, 0.25);
  color: #f8fafc;
  padding: 8px 12px 8px 30px;
  border-radius: 6px;
  font-size: 12.5px;
  font-family: var(--font-ui);
  min-width: 250px;
  transition: all 0.2s ease;
}

.search-wrap input:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.25);
}

.cyber-btn {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%);
  color: #ffffff;
  border: 1px solid rgba(34, 211, 238, 0.4);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-ui);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cyber-btn:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.35);
}

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
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-family: var(--font-ui);
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.table-responsive { overflow-x: auto; }
.soc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  font-family: var(--font-ui);
}

th {
  text-align: left;
  color: #94a3b8;
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.8px;
}

td {
  padding: 11px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
}

.rule-row:hover td {
  background: rgba(59, 130, 246, 0.06);
}

.rule-id code {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.rule-desc {
  max-width: 480px;
  color: #f1f5f9;
  line-height: 1.4;
}

.severity-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}

.severity-pill.low {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.severity-pill.medium {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.severity-pill.high {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.groups-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.group-tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
}

.file-cell {
  color: #64748b;
  font-size: 11.5px;
}
</style>