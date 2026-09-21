<template>
  <aside class="soc-sidebar">
    <!-- Hiệu ứng quét tia Laser dọc bên phải viền Sidebar -->
    <div class="sidebar-laser-edge"></div>

    <!-- Đầu bảng điều khiển: Brand Badge -->
    <div class="sidebar-brand">
      <div class="brand-shield-box">
        <span class="shield-core">🛡️</span>
        <span class="shield-radar-wave"></span>
      </div>
      <div class="brand-info">
        <span class="brand-name">HỆ THỐNG<span class="glow-cyan"> GIÁM SÁT</span></span>
        <span class="brand-sub">CYBER_DEFENSE_SYS</span>
      </div>
    </div>

    <!-- Tình trạng động cơ SOC Core -->
    <div class="engine-indicator-box">
      <div class="engine-top">
        <span class="engine-dot"></span>
        <span class="engine-txt">NODE_HEALTH // OPTIMAL</span>
      </div>
      <div class="engine-bar">
        <div class="engine-fill"></div>
      </div>
    </div>

    <!-- Danh sách Menu Điều Hướng -->
    <nav class="nav-menu">
      <div class="menu-section-label">&gt;&gt; MODULES GIAO TIẾP</div>

      <button
        v-for="(item, idx) in accessibleMenu"
        :key="item.id"
        :class="['soc-nav-btn', { active: isRouteActive(item.path) }]"
        @click="navigateTo(item.path)"
      >
        <!-- 4 góc ngắm HUD mini trên từng nút -->
        <span class="btn-corner-tl"></span>
        <span class="btn-corner-br"></span>

        <!-- Tia quét laser khi Hover -->
        <span class="hover-laser"></span>

        <!-- Icon & Nhãn -->
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.label }}</span>

        <!-- Phím tắt kbd [0], [1], [2]... -->
        <span class="nav-kbd">[{{ idx }}]</span>

        <!-- Chỉ báo Active Neon Tracker -->
        <span v-if="isRouteActive(item.path)" class="active-indicator">
          <span class="indicator-glow"></span>
        </span>
      </button>
    </nav>

    <!-- Chân Sidebar: Thông số luồng Telemetry thời gian thực -->
    <div class="sidebar-footer">
      <div class="footer-hud-card">
        <div class="hud-stat-row">
          <span class="stat-lbl">IDS THREAT LEVEL:</span>
          <span class="stat-val low">SECURE</span>
        </div>
        <div class="hud-stat-row">
          <span class="stat-lbl">ACTIVE PROTOCOL:</span>
          <span class="stat-val">WAZUH_v4</span>
        </div>
        <div class="hex-stream">
          0x4A 0x7F 0x9B 0x1C // OK
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  active: { type: String, default: 'dashboard' },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])
const router = useRouter()
const route = useRoute()

// Định nghĩa các đường dẫn (path) riêng biệt cho user và admin - Thêm Trang Chủ ở đầu
const allMenuItems = computed(() => [
  { id: 'home', label: 'Trang Chủ', icon: '🌐', path: '/', adminOnly: false },
  { id: 'dashboard', label: 'Bảng Điều Khiển', icon: '📊', path: props.isAdmin ? '/admin/overview' : '/dashboard', adminOnly: false },
  { id: 'alerts', label: props.isAdmin ? 'Nhật Ký Cảnh Báo' : 'Cảnh Báo', icon: '🚨', path: '/alerts', adminOnly: false },
  { id: 'agents', label: 'Thiết Bị Giám Sát', icon: '💻', path: '/admin/agents', adminOnly: true },
  { id: 'rules', label: 'Tập Luật Phát Hiện', icon: '📜', path: '/admin/rules', adminOnly: true },
  { id: 'users', label: 'Quản Trị Nhân Sự', icon: '👥', path: '/admin/users', adminOnly: true },
  { id: 'profile', label: 'Tài Khoản Của Tôi', icon: '🪪', path: '/profile', adminOnly: false },
])

const accessibleMenu = computed(() => {
  return allMenuItems.value.filter((item) => !item.adminOnly || props.isAdmin)
})

// Hàm kiểm tra xem đường dẫn hiện tại có khớp với item menu không để bật hiệu ứng active
function isRouteActive(path) {
  return route.path === path
}

// Chuyển hướng URL mượt mà bằng Vue Router và đồng thời emit ra bên ngoài nếu App.vue cần bắt sự kiện
function navigateTo(path) {
  router.push(path)
  const matchedItem = accessibleMenu.value.find(i => i.path === path)
  if (matchedItem) {
    emit('change', matchedItem.id)
  }
}

// Phím tắt bàn phím [0], [1], [2]... hỗ trợ phím số
function handleKeydown(e) {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return
  const num = parseInt(e.key)
  if (num >= 0 && num < accessibleMenu.value.length) {
    const targetItem = accessibleMenu.value[num]
    navigateTo(targetItem.path)
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.soc-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 240px;
  background: linear-gradient(180deg, #060e1a 0%, #040812 100%);
  border-right: 1px solid rgba(34, 211, 238, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 100;
  font-family: var(--font-ui);
  box-shadow: 10px 0 35px rgba(0, 0, 0, 0.7);
  user-select: none;
}

.sidebar-laser-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -1px;
  width: 2px;
  background: linear-gradient(180deg, transparent 0%, #3b82f6 30%, #22d3ee 50%, #3b82f6 70%, transparent 100%);
  box-shadow: 0 0 10px #22d3ee;
  animation: laserSlide 6s linear infinite;
}

@keyframes laserSlide {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 18px 18px;
  border-bottom: 1px solid rgba(148, 190, 255, 0.1);
}

.brand-shield-box {
  position: relative;
  width: 42px;
  height: 42px;
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.15);
  animation: radarGlow 3s infinite ease-in-out;
}

@keyframes radarGlow {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(34, 211, 238, 0.3)); }
  50% { filter: drop-shadow(0 0 9px rgba(34, 211, 238, 0.7)); }
}

.shield-core {
  font-size: 20px;
  filter: drop-shadow(0 0 6px #22d3ee);
}

.shield-radar-wave {
  position: absolute;
  inset: -3px;
  border-radius: 8px;
  border: 1px solid #22d3ee;
  opacity: 0;
  animation: radarWave 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes radarWave {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #f8fafc;
}

.glow-cyan {
  color: #22d3ee;
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.8);
}

.brand-sub {
  font-size: 9px;
  color: #64748b;
  letter-spacing: 1px;
}

.engine-indicator-box {
  margin: 14px 16px;
  padding: 8px 12px;
  background: rgba(10, 20, 36, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
}

.engine-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9.5px;
  color: #38bdf8;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.engine-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulseDot 1.4s infinite alternate;
}

@keyframes pulseDot {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.engine-bar {
  height: 3px;
  background: #0f1d30;
  border-radius: 2px;
  overflow: hidden;
}

.engine-fill {
  height: 100%;
  width: 88%;
  background: linear-gradient(90deg, #3b82f6, #22d3ee);
  box-shadow: 0 0 6px #22d3ee;
}

.nav-menu {
  flex: 1;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-section-label {
  font-size: 9.5px;
  color: #475569;
  letter-spacing: 1.2px;
  margin: 6px 0 8px 4px;
}

.soc-nav-btn {
  position: relative;
  background: rgba(11, 22, 38, 0.4);
  border: 1px solid rgba(148, 190, 255, 0.1);
  color: #94a3b8;
  padding: 11px 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.btn-corner-tl, .btn-corner-br {
  position: absolute;
  width: 4px;
  height: 4px;
  border-color: #22d3ee;
  border-style: solid;
  opacity: 0;
  transition: opacity 0.2s;
}
.btn-corner-tl { top: 0; left: 0; border-width: 1.5px 0 0 1.5px; }
.btn-corner-br { bottom: 0; right: 0; border-width: 0 1.5px 1.5px 0; }

.hover-laser {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -100%;
  width: 60%;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.15), transparent);
  transition: all 0.5s ease;
}

.soc-nav-btn:hover .hover-laser {
  left: 140%;
}

.nav-icon {
  font-size: 15px;
  transition: transform 0.2s ease;
}

.nav-text {
  flex: 1;
  text-align: left;
  letter-spacing: 0.4px;
}

.nav-kbd {
  font-size: 9.5px;
  color: #475569;
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.soc-nav-btn:hover {
  background: rgba(34, 211, 238, 0.08);
  border-color: rgba(34, 211, 238, 0.35);
  color: #f8fafc;
  transform: translateX(4px);
}

.soc-nav-btn:hover .nav-icon {
  transform: scale(1.2);
}

.soc-nav-btn:hover .btn-corner-tl,
.soc-nav-btn:hover .btn-corner-br {
  opacity: 1;
}

.soc-nav-btn.active {
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-color: rgba(34, 211, 238, 0.55);
  color: #22d3ee;
  box-shadow: inset 0 0 12px rgba(34, 211, 238, 0.15), 0 0 16px rgba(34, 211, 238, 0.15);
  transform: translateX(4px);
}

.soc-nav-btn.active .btn-corner-tl,
.soc-nav-btn.active .btn-corner-br {
  opacity: 1;
}

.soc-nav-btn.active .nav-kbd {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.3);
  background: rgba(34, 211, 238, 0.1);
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 3px;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  border-radius: 0 3px 3px 0;
}

.sidebar-footer {
  padding: 14px;
}

.footer-hud-card {
  background: rgba(6, 14, 24, 0.85);
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 10px;
}

.hud-stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stat-lbl { color: #64748b; }
.stat-val { font-weight: 700; color: #cbd5e1; }
.stat-val.low { color: #22c55e; text-shadow: 0 0 6px #22c55e; }

.hex-stream {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #38bdf8;
  font-size: 9px;
  opacity: 0.75;
}
</style>