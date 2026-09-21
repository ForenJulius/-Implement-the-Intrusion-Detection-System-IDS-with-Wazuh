<template>
  <div class="soc-dashboard">
    <!-- Thanh trạng thái SOC Engine -->
    <div class="soc-statusbar">
      <div class="status-indicator">
        <span class="pulse-beacon"></span>
        <span class="status-txt">SOC ENGINE: <strong class="online-txt">LIVE MONITORING</strong></span>
      </div>
      <div class="refresh-pill">
        <span class="icon-sync" :class="{ spinning: loading }">⚡</span>
        <span>Auto-sync: {{ refreshInterval / 1000 }}s</span>
      </div>
    </div>

    <div v-if="errorMsg" class="dashboard-error">
      <span class="error-badge">CRITICAL ERROR</span>
      <span>{{ errorMsg }}</span>
    </div>

    <section class="kpis">
      <div class="kpi kpi-total">
        <div class="kpi-top">
          <span class="kpi-label">Tổng Sự Kiện (Page)</span>
          <span class="kpi-icon">📊</span>
        </div>
        <span class="kpi-value">{{ alerts.length }}</span>
        <div class="kpi-decor-line"></div>
      </div>

      <div class="kpi kpi-high">
        <div class="kpi-top">
          <span class="kpi-label">Nguy Hiểm Cao (≥12)</span>
          <span class="kpi-icon pulse-alarm">🚨</span>
        </div>
        <span class="kpi-value">{{ countBySeverity('high') }}</span>
        <div class="kpi-decor-line"></div>
      </div>

      <div class="kpi kpi-medium">
        <div class="kpi-top">
          <span class="kpi-label">Mức Trung Bình (7-11)</span>
          <span class="kpi-icon">⚠️</span>
        </div>
        <span class="kpi-value">{{ countBySeverity('medium') }}</span>
        <div class="kpi-decor-line"></div>
      </div>

      <div class="kpi kpi-low">
        <div class="kpi-top">
          <span class="kpi-label">Mức Thấp (&lt;7)</span>
          <span class="kpi-icon">🛡️</span>
        </div>
        <span class="kpi-value">{{ countBySeverity('low') }}</span>
        <div class="kpi-decor-line"></div>
      </div>
    </section>

    <section class="charts-row">
      <div class="chart-wrapper hud-panel">
        <SeverityChart :stats="severityStats" />
      </div>
      <div class="chart-wrapper hud-panel">
        <SeverityPieChart :stats="severityStats" />
      </div>
    </section>

    <div class="table-wrapper hud-panel">
      <AlertTable :alerts="alerts" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiFetch } from '../api'
import AlertTable from '../components/AlertTable.vue'
import SeverityChart from '../components/SeverityChart.vue'
import SeverityPieChart from '../components/SeverityPieChart.vue'

const refreshInterval = 5000

const alerts = ref([])
const severityStats = ref([])
const loading = ref(true)
const errorMsg = ref('')
let timer = null

function severityClass(level) {
  if (level >= 12) return 'high'
  if (level >= 7) return 'medium'
  return 'low'
}
function countBySeverity(bucket) {
  return alerts.value.filter((a) => severityClass(a.level) === bucket).length
}

async function fetchAlerts() {
  try {
    const res = await apiFetch(`/api/alerts?pageSize=50`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = `${data.error || 'Không lấy được alert'}${data.detail ? ' — ' + data.detail : ''}`
      alerts.value = []
      return
    }
    alerts.value = Array.isArray(data.alerts) ? data.alerts : []
    errorMsg.value = ''
  } catch (err) {
    errorMsg.value = 'Không kết nối được tới backend (http://localhost:4000)'
    alerts.value = []
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await apiFetch(`/api/stats/severity`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = `${data.error || 'Không lấy được thống kê'}${data.detail ? ' — ' + data.detail : ''}`
      severityStats.value = []
      return
    }
    severityStats.value = Array.isArray(data) ? data : []
  } catch (err) {
    errorMsg.value = 'Không kết nối được tới backend (http://localhost:4000)'
    severityStats.value = []
  }
}

function refreshAll() {
  fetchAlerts()
  fetchStats()
}

onMounted(() => {
  refreshAll()
  timer = setInterval(refreshAll, refreshInterval)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.soc-dashboard {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.soc-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: rgba(13, 24, 38, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-family: var(--font-ui);
  font-size: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pulse-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 10px #22d3ee;
  animation: beaconPulse 1.8s infinite;
}

@keyframes beaconPulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(34, 211, 238, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
}

.online-txt {
  color: #22d3ee;
  letter-spacing: 0.6px;
}

.refresh-pill {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-sync.spinning {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dashboard-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 13px;
  font-family: var(--font-ui);
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-badge {
  background: rgba(239, 68, 68, 0.25);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}

.kpi {
  background: linear-gradient(135deg, rgba(13, 24, 38, 0.85) 0%, rgba(9, 16, 26, 0.95) 100%);
  border: 1px solid rgba(148, 190, 255, 0.15);
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.25s ease;
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  font-size: 11px;
  color: #8da2be;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-family: var(--font-ui);
}

.kpi-icon {
  font-size: 16px;
  opacity: 0.8;
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  font-family: var(--font-ui);
  margin-top: 6px;
  letter-spacing: -0.5px;
}

.kpi-decor-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent);
}

.kpi-total .kpi-value { color: #93c5fd; text-shadow: 0 0 14px rgba(59, 130, 246, 0.3); }
.kpi-total .kpi-decor-line { background: #3b82f6; }

.kpi-high {
  border-color: rgba(239, 68, 68, 0.3);
}
.kpi-high .kpi-value { color: #f87171; text-shadow: 0 0 16px rgba(239, 68, 68, 0.4); }
.kpi-high .kpi-decor-line { background: #ef4444; }
.pulse-alarm { animation: pulseWarning 1s infinite alternate; }

@keyframes pulseWarning {
  from { transform: scale(1); filter: drop-shadow(0 0 2px #ef4444); }
  to { transform: scale(1.15); filter: drop-shadow(0 0 10px #ef4444); }
}

.kpi-medium .kpi-value { color: #fbbf24; text-shadow: 0 0 14px rgba(245, 158, 11, 0.3); }
.kpi-medium .kpi-decor-line { background: #f59e0b; }

.kpi-low .kpi-value { color: #22d3ee; text-shadow: 0 0 14px rgba(34, 211, 238, 0.3); }
.kpi-low .kpi-decor-line { background: #06b6d4; }

.kpi:hover {
  transform: translateY(-4px);
  border-color: rgba(34, 211, 238, 0.4);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.15);
}

.charts-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
  margin-bottom: 22px;
}

.hud-panel {
  position: relative;
  background: rgba(13, 24, 38, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
}

.hud-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 20px;
  width: 40px;
  height: 2px;
  background: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan);
}

@media (max-width: 900px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
</style>