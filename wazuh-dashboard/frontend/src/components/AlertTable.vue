<template>
  <div class="card">
    <div class="card-glow"></div>
    <h2><span class="h2-bar"></span>Alert gần đây ({{ alerts.length }})</h2>

    <div v-if="loading" class="empty">Đang tải dữ liệu...</div>
    <div v-else-if="alerts.length === 0" class="empty">
      Chưa có alert nào. Hãy chạy thử một kịch bản tấn công để kiểm tra.
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Thời gian</th>
          <th>Agent</th>
          <th>Mức độ</th>
          <th>Mô tả rule</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alert in alerts" :key="alert.id" :class="severityClass(alert.level)">
          <td class="time">{{ formatTime(alert.timestamp) }}</td>
          <td>{{ alert.agentName }} <span class="ip">({{ alert.agentIp }})</span></td>
          <td>
            <span :class="['badge', severityClass(alert.level)]">{{ alert.level }}</span>
          </td>
          <td>{{ alert.ruleDescription }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  alerts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function formatTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleString('vi-VN')
}

function severityClass(level) {
  if (level >= 12) return 'high'
  if (level >= 7) return 'medium'
  return 'low'
}
</script>

<style scoped>
.card {
  position: relative;
  background: linear-gradient(180deg, #0d1826 0%, #0a1420 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  overflow: hidden;
}
/* Viền phát sáng mờ chạy quanh card, kiểu radar HUD */
.card-glow {
  position: absolute;
  inset: -1px;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(120deg, transparent, rgba(34, 211, 238, 0.35), transparent);
  background-size: 200% 200%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: sweep 6s linear infinite;
  pointer-events: none;
}
@keyframes sweep {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 200%; }
}

h2 {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: var(--font-ui);
  display: flex;
  align-items: center;
}
.h2-bar {
  width: 3px;
  height: 14px;
  background: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan);
  margin-right: 8px;
  display: inline-block;
}

.empty {
  color: var(--text-muted);
  font-size: 14px;
  padding: 24px 0;
  text-align: center;
  font-family: var(--font-ui);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th {
  text-align: left;
  color: var(--text-muted);
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-soft);
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.8px;
}
td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text);
}
tr {
  transition: background 0.15s ease, box-shadow 0.15s ease;
  border-left: 2px solid transparent;
}
tr:hover {
  background: rgba(59, 130, 246, 0.06);
}
tr.high:hover { border-left-color: var(--high); }
tr.medium:hover { border-left-color: var(--medium); }
tr.low:hover { border-left-color: var(--low); }

.time { color: var(--text-muted); white-space: nowrap; font-family: var(--font-mono); font-size: 12px; }
.ip { color: var(--text-muted); font-size: 12px; opacity: 0.7; font-family: var(--font-mono); }
.badge {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 700;
  font-family: var(--font-ui);
  border: 1px solid transparent;
}
.badge.low { background: rgba(34, 211, 238, 0.1); color: var(--low); border-color: rgba(34, 211, 238, 0.3); }
.badge.medium { background: rgba(245, 158, 11, 0.1); color: var(--medium); border-color: rgba(245, 158, 11, 0.3); }
.badge.high {
  background: rgba(239, 68, 68, 0.12);
  color: var(--high);
  border-color: rgba(239, 68, 68, 0.4);
  animation: pulse-high 1.6s ease-in-out infinite;
}
@keyframes pulse-high {
  0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
}
</style>
