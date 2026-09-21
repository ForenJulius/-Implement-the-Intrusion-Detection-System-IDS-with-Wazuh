<template>
  <div class="card">
    <h2><span class="h2-bar"></span>Tỉ lệ nhóm mức độ</h2>

    <div v-if="total === 0" class="empty">Chưa có dữ liệu.</div>

    <div v-else class="pie-wrap">
      <div class="pie-outer">
        <div class="pie-ring"></div>
        <div class="pie" :style="{ background: pieGradient }">
          <div class="pie-hole">
            <span class="pie-total">{{ total }}</span>
            <span class="pie-total-label">alerts</span>
          </div>
        </div>
      </div>

      <ul class="legend">
        <li v-for="g in groups" :key="g.key">
          <span class="swatch" :style="{ background: g.color, boxShadow: `0 0 6px ${g.color}` }"></span>
          {{ g.label }} — {{ g.count }} ({{ g.percent }}%)
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Array, default: () => [] },
})

const groups = computed(() => {
  const buckets = { low: 0, medium: 0, high: 0 }
  props.stats.forEach((s) => {
    if (s.level >= 12) buckets.high += s.count
    else if (s.level >= 7) buckets.medium += s.count
    else buckets.low += s.count
  })
  const total = buckets.low + buckets.medium + buckets.high || 1

  return [
    { key: 'low', label: 'Thấp', count: buckets.low, color: 'var(--low)', percent: Math.round((buckets.low / total) * 100) },
    { key: 'medium', label: 'Trung bình', count: buckets.medium, color: 'var(--medium)', percent: Math.round((buckets.medium / total) * 100) },
    { key: 'high', label: 'Cao', count: buckets.high, color: 'var(--high)', percent: Math.round((buckets.high / total) * 100) },
  ]
})

const total = computed(() => groups.value.reduce((sum, g) => sum + g.count, 0))

const pieGradient = computed(() => {
  if (total.value === 0) return 'var(--bg-panel-alt)'
  let acc = 0
  const stops = groups.value.map((g) => {
    const start = acc
    acc += g.percent
    return `${g.color} ${start}% ${acc}%`
  })
  return `conic-gradient(${stops.join(', ')})`
})
</script>

<style scoped>
.card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
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
  font-family: var(--font-ui);
}
.pie-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
}
.pie-outer {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}
.pie-ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 1px dashed rgba(59, 130, 246, 0.35);
  animation: spin 14s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.pie {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 28px rgba(59, 130, 246, 0.25);
  transition: background 0.6s ease;
}
.pie-hole {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--bg-panel);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.5);
}
.pie-total {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-ui);
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
}
.pie-total-label {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
  font-size: 13px;
  color: var(--text-muted);
}
.swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 8px;
}
</style>
