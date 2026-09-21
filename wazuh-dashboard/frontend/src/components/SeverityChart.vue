<template>
  <div class="card">
    <h2><span class="h2-bar"></span>Phân bố theo mức độ</h2>

    <div v-if="stats.length === 0" class="empty">Chưa có dữ liệu thống kê.</div>

    <div v-else class="bars">
      <div v-for="s in stats" :key="s.level" class="bar-row">
        <span class="label">LV {{ s.level }}</span>
        <div class="bar-track">
          <div
            class="bar-fill"
            :class="severityClass(s.level)"
            :style="{ width: barWidth(s.count) + '%' }"
          ><span class="bar-shine"></span></div>
        </div>
        <span class="count">{{ s.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Array, default: () => [] },
})

const maxCount = computed(() =>
  props.stats.length ? Math.max(...props.stats.map((s) => s.count)) : 1
)

function barWidth(count) {
  return Math.max((count / maxCount.value) * 100, 4)
}

function severityClass(level) {
  if (level >= 12) return 'high'
  if (level >= 7) return 'medium'
  return 'low'
}
</script>

<style scoped>
.card {
  background: linear-gradient(180deg, #0d1826 0%, #0a1420 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  background-image:
    linear-gradient(180deg, #0d1826 0%, #0a1420 100%),
    linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px);
  background-size: auto, 100% 20px;
}
h2 {
  margin: 0 0 18px;
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
  padding: 12px 0;
  font-family: var(--font-ui);
}
.bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.label {
  width: 46px;
  color: var(--text-muted);
  flex-shrink: 0;
  font-family: var(--font-ui);
  font-size: 11px;
}
.bar-track {
  flex: 1;
  height: 14px;
  background: var(--bg-panel-alt);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
  position: relative;
}
.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(.2,.8,.2,1);
  position: relative;
  overflow: hidden;
}
.bar-shine {
  position: absolute;
  top: 0; left: -40%;
  width: 40%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  animation: shine 2.4s ease-in-out infinite;
}
@keyframes shine {
  0% { left: -40%; }
  100% { left: 120%; }
}
.bar-fill.low { background: var(--low); box-shadow: 0 0 10px var(--low); }
.bar-fill.medium { background: var(--medium); box-shadow: 0 0 10px var(--medium); }
.bar-fill.high { background: var(--high); box-shadow: 0 0 10px var(--high); }
.count {
  width: 32px;
  text-align: right;
  color: var(--text);
  font-weight: 700;
  font-family: var(--font-ui);
}
</style>
