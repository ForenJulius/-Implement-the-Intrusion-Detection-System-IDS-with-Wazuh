<template>
  <div class="soc-auth-viewport" @mousemove="handleMouseMove">
    <!-- Nền lưới phòng thủ mạng nhện tương tác chuột -->
    <canvas ref="cyberCanvas" class="cyber-canvas"></canvas>
    <div class="vignette-overlay"></div>
    <div class="crt-scanlines"></div>

    <!-- KHUNG BAO TOÀN CẢNH FULL MÀN HÌNH -->
    <div class="auth-panoramic-container">
      <!-- CHỈ CÒN DUY NHẤT CON ROBOT SPIDER-BOT (KHÔNG CÒN KHUNG VUÔNG NGOÀI) -->
      <div class="standalone-spider-stage" @click="toggleRobotGlow">
        <div :class="['spider-robot-wrapper', { 'is-active-glowing': isRobotGlowing }]">
          <!-- Vòng tròn Radar Mạng Nhện Công Nghệ Cao -->
          <div class="holo-ring outer-ring"></div>
          <div class="holo-ring spider-web-ring"></div>
          <div class="holo-ring inner-ring"></div>
          <div class="holo-scanner-sweep"></div>

          <!-- SVG Robot Spider-Man Mecha Khổng Lồ Tương Tác Chuột & Click -->
          <div
            class="robot-avatar-wrapper"
            :style="{
              transform: `perspective(700px) rotateY(${robotLookAngle.x}deg) rotateX(${robotLookAngle.y}deg)`
            }"
          >
            <svg viewBox="0 0 240 250" class="blue-team-robot-svg">
              <defs>
                <linearGradient id="spiderArmor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#091428" />
                  <stop offset="50%" stop-color="#142848" />
                  <stop offset="100%" stop-color="#040914" />
                </linearGradient>
                <filter id="spiderGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <!-- 4 Chân nhện cơ khí sau lưng (Iron Spider Legs) -->
              <path d="M70 110 Q20 50 15 15 Q25 45 60 95" fill="none" stroke="#0284c7" stroke-width="3.2" class="spider-arm-line" />
              <circle cx="15" cy="15" r="4.5" fill="#22d3ee" filter="url(#spiderGlow)" class="antenna-blink" />

              <path d="M170 110 Q220 50 225 15 Q215 45 180 95" fill="none" stroke="#0284c7" stroke-width="3.2" class="spider-arm-line" />
              <circle cx="225" cy="15" r="4.5" fill="#22d3ee" filter="url(#spiderGlow)" class="antenna-blink-alt" />

              <path d="M65 140 Q10 160 5 210 Q25 170 60 150" fill="none" stroke="#0369a1" stroke-width="2.8" class="spider-arm-line" />
              <circle cx="5" cy="210" r="4" fill="#38bdf8" filter="url(#spiderGlow)" />

              <path d="M175 140 Q230 160 235 210 Q215 170 180 150" fill="none" stroke="#0369a1" stroke-width="2.8" class="spider-arm-line" />
              <circle cx="235" cy="210" r="4" fill="#38bdf8" filter="url(#spiderGlow)" />

              <!-- Đầu mặt nạ Spider-Man Mecha -->
              <path
                d="M75,55 Q120,20 165,55 Q175,95 145,122 Q120,135 95,122 Q65,95 75,55 Z"
                fill="url(#spiderArmor)"
                stroke="#22d3ee"
                stroke-width="2.6"
                class="spider-helmet"
              />

              <!-- Vân mạng nhện trên mặt nạ -->
              <line x1="120" y1="35" x2="120" y2="128" stroke="rgba(34, 211, 238, 0.45)" stroke-width="1.2" />
              <line x1="75" y1="75" x2="165" y2="75" stroke="rgba(34, 211, 238, 0.35)" stroke-width="1.2" />
              <path d="M90 60 Q120 75 150 60" fill="none" stroke="rgba(34, 211, 238, 0.4)" stroke-width="1.2" />
              <path d="M85 85 Q120 105 155 85" fill="none" stroke="rgba(34, 211, 238, 0.4)" stroke-width="1.2" />

              <!-- Mắt Spider-Man huyền thoại -->
              <polygon points="82,65 112,80 102,96 76,82" fill="#020817" stroke="#0ea5e9" stroke-width="2.2" />
              <polygon points="85,68 108,80 100,92 80,81" fill="#22d3ee" filter="url(#spiderGlow)" class="spider-eye-left" />

              <polygon points="158,65 128,80 138,96 164,82" fill="#020817" stroke="#0ea5e9" stroke-width="2.2" />
              <polygon points="155,68 132,80 140,92 160,81" fill="#22d3ee" filter="url(#spiderGlow)" class="spider-eye-right" />

              <line x1="76" y1="78" x2="164" y2="78" stroke="#f0fdf4" stroke-width="1.2" stroke-dasharray="8 4" class="laser-visor-line" />

              <!-- Khớp cổ & Giáp Thân -->
              <polygon points="106,128 134,128 140,140 100,140" fill="#030b1e" stroke="#1e293b" stroke-width="1.5" />

              <path
                d="M60,140 L180,140 L162,205 L78,205 Z"
                fill="url(#spiderArmor)"
                stroke="#22d3ee"
                stroke-width="2.4"
                class="spider-chest"
              />

              <polygon points="44,144 64,138 64,180 40,170" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8" />
              <polygon points="196,144 176,138 176,180 200,170" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8" />

              <!-- Biểu tượng Spider Logo trên ngực -->
              <g class="spider-emblem-core">
                <polygon points="120,152 126,162 124,175 120,180 116,175 114,162" fill="#22d3ee" filter="url(#spiderGlow)" class="spider-heart-pulse" />
                
                <path d="M117 160 L102 150 L94 156" fill="none" stroke="#38bdf8" stroke-width="2" />
                <path d="M123 160 L138 150 L146 156" fill="none" stroke="#38bdf8" stroke-width="2" />
                <path d="M117 166 L98 162 L88 170" fill="none" stroke="#38bdf8" stroke-width="2" />
                <path d="M123 166 L142 162 L152 170" fill="none" stroke="#38bdf8" stroke-width="2" />

                <path d="M116 174 L100 176 L92 190" fill="none" stroke="#0ea5e9" stroke-width="2" />
                <path d="M124 174 L140 176 L148 190" fill="none" stroke="#0ea5e9" stroke-width="2" />
                <path d="M118 178 L106 186 L102 198" fill="none" stroke="#0ea5e9" stroke-width="2" />
                <path d="M122 178 L134 186 L138 198" fill="none" stroke="#0ea5e9" stroke-width="2" />
              </g>
            </svg>
          </div>

          <!-- Bục Năng Lượng Từ Trường Lơ Lửng Dưới Chân -->
          <div class="hover-pod-base">
            <div class="pod-glow-ellipse"></div>
          </div>
        </div>
      </div>

      <!-- FORM ĐĂNG NHẬP HUD GỐC ĐƯỢC GIỮ NGUYÊN 100% -->
      <div class="hud-frame">
        <!-- 4 góc ngắm quang học -->
        <span class="bracket tl"></span>
        <span class="bracket tr"></span>
        <span class="bracket bl"></span>
        <span class="bracket br"></span>

        <!-- Status Header -->
        <div class="hud-telemetry">
          <div class="telemetry-left">
            <span class="radar-beacon"></span>
            <span class="telemetry-tag">STATION // 0xBLUE-DEFENSE</span>
          </div>
          <span class="defcon-pill">DEFCON 2</span>
        </div>

        <!-- Brand Identity với hiệu ứng giải mã -->
        <div class="brand-block">
          <div class="shield-generator">
            <span class="shield-icon">🛡️</span>
            <div class="shield-rings"></div>
          </div>
          <div class="brand-text">
            <h1 class="decrypted-title">{{ animatedTitle }}</h1>
            <p class="brand-sub">&gt; CONSOLE_AUTH_LEVEL_01 // ACCESS POINT</p>
          </div>
        </div>

        <div v-if="message" class="soc-alert success">
          <span class="alert-icon">✓</span>
          <span>{{ message }}</span>
        </div>

        <!-- Bộ chuyển Tab định danh -->
        <div class="auth-mode-selector">
          <button
            type="button"
            v-for="opt in typeOptions"
            :key="opt.value"
            :class="['mode-tab', { active: type === opt.value }]"
            @click="switchType(opt.value)"
          >
            <span class="tab-glitch"></span>
            {{ opt.label }}
          </button>
        </div>

        <form @submit.prevent="handleLogin" novalidate class="soc-form">
          <!-- Trường Định Danh -->
          <div class="field-item">
            <div class="field-header">
              <span class="field-prompt">&gt;</span>
              <label>{{ currentLabel }}</label>
              <span class="field-status">{{ identifierValid ? '[VALID]' : '[REQUIRED]' }}</span>
            </div>
            <div class="input-housing">
              <span class="housing-icon">👤</span>
              <input
                v-model.trim="identifier"
                :type="currentInputType"
                required
                :autocomplete="currentAutocomplete"
                :placeholder="currentPlaceholder"
                @blur="touched = true"
                class="hud-input"
              />
              <div class="input-scan-beam"></div>
            </div>
            <p v-if="touched && identifier && !identifierValid" class="soc-field-error">
              ⚠ {{ currentFormatHint }}
            </p>
          </div>

          <!-- Trường Mật Khẩu -->
          <div class="field-item">
            <div class="field-header">
              <span class="field-prompt">&gt;</span>
              <label>MẬT KHẨU BẢO VỆ</label>
              <a href="#" class="forgot-link" @click.prevent="$emit('switch', 'forgot')">Quên mật khẩu?</a>
            </div>
            <div class="input-housing">
              <span class="housing-icon">🔑</span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="hud-input"
              />
              <button
                type="button"
                class="hud-eye-btn"
                @click="togglePasswordVisibility"
                tabindex="-1"
                :title="showPassword ? 'Ẩn khóa' : 'Hiện khóa'"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.3 20.3 0 0 1-4.22 5.06M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
              <div class="input-scan-beam"></div>
            </div>
          </div>

          <div v-if="error" class="soc-alert error">
            <span class="alert-icon">⛔</span>
            <span>{{ error }}</span>
          </div>

          <!-- Nút Đăng Nhập Kích Hoạt -->
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="soc-submit-trigger"
            @mouseenter="playBeep(800, 0.05)"
          >
            <span class="trigger-lines"></span>
            <span class="trigger-label">
              {{ loading ? 'ĐANG GIẢI MÃ PHIÊN BẢN...' : 'XÁC THỰC DANH TÍNH // LOGIN' }}
            </span>
            <span class="trigger-bracket">&gt;&gt;</span>
          </button>
        </form>

        <!-- Chuyển Đăng Ký -->
        <div class="hud-sublink">
          <span class="sublink-dim">CHƯA ĐƯỢC CẤP CHỨNG THƯ?</span>
          <a href="#" @click.prevent="$emit('switch', 'register')">
            [ KHỞI TẠO TÀI KHOẢN MỚI ]
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { login } from '../auth'
import { isValidUsername, isValidEmail, isValidPhone } from '../validators'

defineEmits(['switch'])
defineProps({
  message: { type: String, default: '' },
})

const typeOptions = [
  { value: 'username', label: 'TÊN TÀI KHOẢN' },
  { value: 'email', label: 'EMAIL' },
  { value: 'phone', label: 'SỐ ĐIỆN THOẠI' },
]

const type = ref('username')
const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const touched = ref(false)

// Trạng thái BẬT / TẮT phát sáng của Spider-Bot khi bấm chuột
const isRobotGlowing = ref(false)

const cyberCanvas = ref(null)
let animId = null
const mousePos = { x: -1000, y: -1000 }

// Tọa độ góc nhìn tương tác chuột của Spider Mecha
const robotLookAngle = ref({ x: 0, y: 0 })

// Bộ tổng hợp âm thanh click phím (Web Audio Synth)
let audioCtx = null
function playBeep(freq = 600, duration = 0.04) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  } catch (e) {
    // Không chặn nếu trình duyệt cấm phát âm thanh tự động
  }
}

// Hàm chuyển đổi trạng thái phát sáng Spider-Bot
function toggleRobotGlow() {
  isRobotGlowing.value = !isRobotGlowing.value
  if (isRobotGlowing.value) {
    playBeep(1400, 0.08)
  } else {
    playBeep(450, 0.06)
  }
}

// Hiệu ứng chữ giải mã Hacker
const originalTitle = 'BLUEWATCH // SOC'
const animatedTitle = ref(originalTitle)

function triggerDecryptText() {
  playBeep(900, 0.06)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let iteration = 0
  const interval = setInterval(() => {
    animatedTitle.value = originalTitle
      .split('')
      .map((letter, index) => {
        if (index < iteration) return originalTitle[index]
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join('')

    if (iteration >= originalTitle.length) clearInterval(interval)
    iteration += 1 / 2
  }, 25)
}

function handleMouseMove(e) {
  mousePos.x = e.clientX
  mousePos.y = e.clientY

  const centerX = window.innerWidth / 3
  const centerY = window.innerHeight / 2
  const deltaX = (e.clientX - centerX) / (window.innerWidth / 2)
  const deltaY = (e.clientY - centerY) / (window.innerHeight / 2)

  robotLookAngle.value = {
    x: Math.max(-18, Math.min(18, deltaX * 18)),
    y: Math.max(-14, Math.min(14, -deltaY * 14))
  }
}

function togglePasswordVisibility() {
  playBeep(700, 0.03)
  showPassword.value = !showPassword.value
}

function switchType(v) {
  playBeep(1100, 0.04)
  type.value = v
  identifier.value = ''
  touched.value = false
  error.value = ''
  triggerDecryptText()
}

const currentLabel = computed(() => typeOptions.find((o) => o.value === type.value).label)
const currentInputType = computed(() => (type.value === 'email' ? 'email' : type.value === 'phone' ? 'tel' : 'text'))
const currentAutocomplete = computed(() => (type.value === 'email' ? 'email' : type.value === 'phone' ? 'tel' : 'username'))
const currentPlaceholder = computed(() =>
  type.value === 'email' ? 'analyst01@soc.vn' : type.value === 'phone' ? '0912345678' : 'analyst01'
)
const currentFormatHint = computed(() =>
  type.value === 'email'
    ? 'Email không hợp lệ (vd: ten@domain.com)'
    : type.value === 'phone'
    ? 'Số điện thoại di động VN không hợp lệ'
    : '3-20 ký tự, chỉ gồm chữ, số, dấu gạch dưới'
)

const identifierValid = computed(() => {
  if (type.value === 'email') return isValidEmail(identifier.value)
  if (type.value === 'phone') return isValidPhone(identifier.value)
  return isValidUsername(identifier.value)
})

const canSubmit = computed(() => identifierValid.value && password.value.length > 0)

// Canvas Mạng Nhện Phòng Thủ (Interactive Cyber Constellation)
function initCanvas() {
  const canvas = cyberCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const nodes = []
  const nodeCount = Math.floor((width * height) / 12000)

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 1.5 + 1,
    })
  }

  function loop() {
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      n.x += n.vx
      n.y += n.vy
      if (n.x < 0 || n.x > width) n.vx *= -1
      if (n.y < 0 || n.y > height) n.vy *= -1

      ctx.beginPath()
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.4)'
      ctx.fill()

      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j]
        const dist = Math.hypot(n.x - n2.x, n.y - n2.y)
        if (dist < 110) {
          ctx.strokeStyle = `rgba(14, 165, 233, ${0.18 * (1 - dist / 110)})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(n2.x, n2.y)
          ctx.stroke()
        }
      }

      const mouseDist = Math.hypot(n.x - mousePos.x, n.y - mousePos.y)
      if (mouseDist < 140) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 * (1 - mouseDist / 140)})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(n.x, n.y)
        ctx.lineTo(mousePos.x, mousePos.y)
        ctx.stroke()
      }
    }

    animId = requestAnimationFrame(loop)
  }

  loop()

  window.addEventListener('resize', () => {
    if (cyberCanvas.value) {
      width = cyberCanvas.value.width = window.innerWidth
      height = cyberCanvas.value.height = window.innerHeight
    }
  })
}

onMounted(() => {
  initCanvas()
  triggerDecryptText()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})

async function handleLogin() {
  playBeep(1200, 0.1)
  error.value = ''
  touched.value = true
  if (!identifierValid.value) {
    error.value = `Vui lòng nhập đúng định dạng ${currentLabel.value.toLowerCase()}`
    return
  }
  loading.value = true
  try {
    await login(identifier.value, type.value, password.value)
  } catch (err) {
    playBeep(250, 0.2)
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.soc-auth-viewport {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020611;
  font-family: var(--font-ui);
  overflow-x: hidden;
  user-select: none;
  padding: 40px 30px;
  box-sizing: border-box;
}

.cyber-canvas { position: absolute; inset: 0; pointer-events: none; }
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(2, 6, 17, 0.85) 100%);
  pointer-events: none;
}
.crt-scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.25) 51%);
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0.7;
}

/* ================= CONTAINER FULL KHUNG ================= */
.auth-panoramic-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  width: 95vw;
  max-width: 1380px;
  z-index: 10;
}

/* ================= SÂN KHẤU ROBOT ĐỘC LẬP (KHÔNG KHUNG HÌNH CHỮ NHẬT) ================= */
.standalone-spider-stage {
  flex: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.spider-robot-wrapper {
  position: relative;
  width: 440px;
  height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
}

/* Hiệu ứng Radar Mạng Nhện */
.holo-ring {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.outer-ring {
  width: 420px;
  height: 420px;
  border: 1px dashed rgba(34, 211, 238, 0.25);
  animation: spinRing 26s linear infinite;
}
.spider-web-ring {
  width: 350px;
  height: 350px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  background: radial-gradient(circle, transparent 65%, rgba(34, 211, 238, 0.08) 100%);
  animation: spinRingRev 20s linear infinite;
}
.inner-ring {
  width: 270px;
  height: 270px;
  border: 1px dashed rgba(14, 165, 233, 0.35);
  animation: spinRing 14s linear infinite;
}
.holo-scanner-sweep {
  position: absolute;
  width: 410px;
  height: 410px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(34, 211, 238, 0.22) 0deg, transparent 65deg, transparent 360deg);
  animation: spinRing 5s linear infinite;
  pointer-events: none;
}

@keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinRingRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

/* Avatar Robot Lơ Lửng */
.robot-avatar-wrapper {
  position: relative;
  width: 360px;
  height: 370px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: floatHover 4s ease-in-out infinite;
  transition: transform 0.15s ease-out;
  z-index: 2;
}

@keyframes floatHover {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

.blue-team-robot-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 24px rgba(34, 211, 238, 0.55));
  transition: filter 0.4s ease;
}

.antenna-blink { animation: radarBlink 1s infinite alternate; }
.antenna-blink-alt { animation: radarBlink 1.4s infinite alternate; }

.spider-eye-left, .spider-eye-right {
  animation: eyeBlinkSpider 3.5s infinite;
  transition: all 0.3s;
}
@keyframes eyeBlinkSpider {
  0%, 90%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 10px #22d3ee); }
  93% { transform: scaleY(0.1); opacity: 0.4; }
}

.laser-visor-line { animation: laserScan 2s ease-in-out infinite alternate; }
@keyframes laserScan {
  0% { stroke-dashoffset: 0; opacity: 0.3; }
  100% { stroke-dashoffset: 24; opacity: 1; }
}

.spider-heart-pulse {
  animation: spiderHeartBeat 1.8s infinite alternate;
}
@keyframes spiderHeartBeat {
  from { transform: scale(0.95); fill: #0284c7; }
  to { transform: scale(1.08); fill: #22d3ee; filter: drop-shadow(0 0 16px #22d3ee); }
}

.hover-pod-base {
  position: absolute;
  bottom: 0px;
  width: 280px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pod-glow-ellipse {
  width: 250px;
  height: 18px;
  background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.7) 0%, rgba(2, 132, 199, 0.3) 60%, transparent 80%);
  border-radius: 50%;
  box-shadow: 0 0 32px rgba(34, 211, 238, 0.55);
  animation: podPulse 2s infinite alternate;
}
@keyframes podPulse {
  from { transform: scale(0.9); opacity: 0.6; }
  to { transform: scale(1.1); opacity: 1; }
}

/* ================= TRẠNG THÁI PHÁT SÁNG CỰC ĐẠI KHI CLICK (SUPER GLOW) ================= */
.spider-robot-wrapper.is-active-glowing .blue-team-robot-svg {
  filter: drop-shadow(0 0 45px rgba(34, 211, 238, 0.95)) drop-shadow(0 0 20px #38bdf8);
}
.spider-robot-wrapper.is-active-glowing .spider-eye-left,
.spider-robot-wrapper.is-active-glowing .spider-eye-right {
  fill: #ffffff !important;
  filter: drop-shadow(0 0 20px #22d3ee) drop-shadow(0 0 10px #ffffff) !important;
}
.spider-robot-wrapper.is-active-glowing .spider-heart-pulse {
  fill: #ffffff !important;
  filter: drop-shadow(0 0 24px #22d3ee) drop-shadow(0 0 14px #ffffff) !important;
}
.spider-robot-wrapper.is-active-glowing .spider-helmet,
.spider-robot-wrapper.is-active-glowing .spider-chest {
  stroke: #ffffff !important;
}
.spider-robot-wrapper.is-active-glowing .holo-scanner-sweep {
  background: conic-gradient(from 0deg, rgba(34, 211, 238, 0.45) 0deg, transparent 75deg, transparent 360deg);
}

/* ================= HUD FRAME LOGIN (GIỮ NGUYÊN 100%) ================= */
.hud-frame {
  flex: 1;
  position: relative;
  background: rgba(6, 14, 26, 0.9);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(34, 211, 238, 0.35);
  padding: 34px 36px;
  border-radius: 2px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(14, 165, 233, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bracket {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: #22d3ee;
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
  margin-bottom: 22px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(59, 130, 246, 0.3);
}

.telemetry-left { display: flex; align-items: center; gap: 8px; }
.radar-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 10px #22d3ee;
  animation: radarBlink 1.4s infinite;
}
.telemetry-tag { font-size: 10.5px; color: #38bdf8; letter-spacing: 1.2px; }
.defcon-pill {
  font-size: 9.5px;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 3px 8px;
  border-radius: 2px;
}

.brand-block { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
.shield-generator {
  position: relative;
  width: 52px;
  height: 52px;
  background: #040914;
  border: 1px solid rgba(34, 211, 238, 0.45);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shield-icon { font-size: 26px; filter: drop-shadow(0 0 12px #22d3ee); }
.shield-rings {
  position: absolute;
  inset: -4px;
  border: 1px dashed #22d3ee;
  border-radius: 6px;
  animation: rotateRing 14s linear infinite;
}
@keyframes rotateRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.brand-text { display: flex; flex-direction: column; }
.decrypted-title {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: 2.2px;
  color: #f8fafc;
  text-shadow: 0 0 16px rgba(34, 211, 238, 0.6);
}
.brand-sub { margin: 3px 0 0; font-size: 10px; color: #64748b; letter-spacing: 1px; }

.auth-mode-selector {
  display: flex;
  gap: 8px;
  background: #030813;
  border: 1px solid rgba(148, 190, 255, 0.15);
  padding: 4px;
  border-radius: 3px;
  margin-bottom: 22px;
}
.mode-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: #64748b;
  padding: 10px 4px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.6px;
  border-radius: 2px;
}
.mode-tab:hover { color: #cbd5e1; }
.mode-tab.active {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.4);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
}

.soc-form { display: flex; flex-direction: column; gap: 18px; }
.field-item { display: flex; flex-direction: column; gap: 6px; }
.field-header { display: flex; align-items: center; font-size: 11px; gap: 6px; color: #94a3b8; }
.field-prompt { color: #22d3ee; font-weight: bold; }
.field-header label { flex: 1; font-weight: 700; letter-spacing: 0.5px; }
.field-status { font-size: 10px; color: #475569; }
.forgot-link {
  font-size: 10px;
  color: #38bdf8;
  text-decoration: none;
  font-weight: 700;
}
.forgot-link:hover { color: #22d3ee; text-shadow: 0 0 8px rgba(34, 211, 238, 0.6); }

.input-housing {
  position: relative;
  display: flex;
  align-items: center;
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 3px;
  transition: border-color 0.25s, box-shadow 0.25s;
  overflow: hidden;
}
.housing-icon { padding-left: 14px; font-size: 14px; opacity: 0.7; }
.hud-input {
  flex: 1;
  background: transparent !important;
  border: none !important;
  color: #38bdf8 !important;
  padding: 13px 14px;
  font-size: 13.5px;
  font-family: inherit;
}
.hud-input:focus { outline: none; }
.input-housing:focus-within {
  border-color: #22d3ee;
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.3), inset 0 0 8px rgba(34, 211, 238, 0.1);
}
.input-scan-beam {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background: #22d3ee;
  transition: width 0.3s ease;
}
.input-housing:focus-within .input-scan-beam { width: 100%; }

.hud-eye-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding-right: 14px;
  display: flex;
}
.hud-eye-btn:hover { color: #22d3ee; }
.soc-field-error { color: #f87171; font-size: 10.5px; margin: 2px 0 0; }

.soc-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 3px;
  font-size: 11.5px;
}
.soc-alert.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}
.soc-alert.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
  margin-bottom: 16px;
}

.soc-submit-trigger {
  position: relative;
  margin-top: 10px;
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.85) 0%, rgba(6, 182, 212, 0.85) 100%);
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: #ffffff;
  padding: 14px 20px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.25s ease;
}
.soc-submit-trigger:hover:not(:disabled) {
  filter: brightness(1.2);
  box-shadow: 0 0 25px rgba(34, 211, 238, 0.5);
  transform: translateY(-1px);
}
.soc-submit-trigger:disabled { opacity: 0.4; cursor: not-allowed; }
.trigger-bracket { color: #22d3ee; font-weight: 900; }

.hud-sublink {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11.5px;
}
.sublink-dim { color: #64748b; font-size: 10.5px; }
.hud-sublink a { color: #22d3ee; text-decoration: none; font-weight: 700; }
.hud-sublink a:hover { text-shadow: 0 0 10px rgba(34, 211, 238, 0.8); }

@media (max-width: 960px) {
  .auth-panoramic-container { flex-direction: column; width: 100%; gap: 24px; }
  .standalone-spider-stage { width: 100%; }
}
</style>