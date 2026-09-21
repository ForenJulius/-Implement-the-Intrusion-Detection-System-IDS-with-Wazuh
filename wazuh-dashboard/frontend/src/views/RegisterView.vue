<template>
  <div class="soc-auth-viewport" @mousemove="handleMouseMove">
    <canvas ref="cyberCanvas" class="cyber-canvas"></canvas>
    <div class="vignette-overlay"></div>
    <div class="crt-scanlines"></div>

    <!-- KHUNG BAO TOÀN CẢNH FULL MÀN HÌNH ĐĂNG KÝ -->
    <div class="auth-panoramic-container">
      <!-- CHỈ CÒN DUY NHẤT CON ROBOT SPIDER-BOT (BÊN TRÁI ĐỒNG BỘ) -->
      <div class="standalone-spider-stage" @click="toggleRobotGlow">
        <div :class="['spider-robot-wrapper', { 'is-active-glowing': isRobotGlowing }]">
          <div class="holo-ring outer-ring"></div>
          <div class="holo-ring spider-web-ring"></div>
          <div class="holo-ring inner-ring"></div>
          <div class="holo-scanner-sweep"></div>

          <div
            class="robot-avatar-wrapper"
            :style="{
              transform: `perspective(700px) rotateY(${robotLookAngle.x}deg) rotateX(${robotLookAngle.y}deg)`
            }"
          >
            <svg viewBox="0 0 240 250" class="blue-team-robot-svg">
              <defs>
                <linearGradient id="regSpiderArmor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#091428" />
                  <stop offset="50%" stop-color="#142848" />
                  <stop offset="100%" stop-color="#040914" />
                </linearGradient>
                <filter id="regSpiderGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <!-- 4 Chân nhện cơ khí -->
              <path d="M70 110 Q20 50 15 15 Q25 45 60 95" fill="none" stroke="#0284c7" stroke-width="3.2" class="spider-arm-line" />
              <circle cx="15" cy="15" r="4.5" fill="#22d3ee" filter="url(#regSpiderGlow)" class="antenna-blink" />

              <path d="M170 110 Q220 50 225 15 Q215 45 180 95" fill="none" stroke="#0284c7" stroke-width="3.2" class="spider-arm-line" />
              <circle cx="225" cy="15" r="4.5" fill="#22d3ee" filter="url(#regSpiderGlow)" class="antenna-blink-alt" />

              <path d="M65 140 Q10 160 5 210 Q25 170 60 150" fill="none" stroke="#0369a1" stroke-width="2.8" class="spider-arm-line" />
              <circle cx="5" cy="210" r="4" fill="#38bdf8" filter="url(#regSpiderGlow)" />

              <path d="M175 140 Q230 160 235 210 Q215 170 180 150" fill="none" stroke="#0369a1" stroke-width="2.8" class="spider-arm-line" />
              <circle cx="235" cy="210" r="4" fill="#38bdf8" filter="url(#regSpiderGlow)" />

              <!-- Mặt nạ Spider-Man -->
              <path
                d="M75,55 Q120,20 165,55 Q175,95 145,122 Q120,135 95,122 Q65,95 75,55 Z"
                fill="url(#regSpiderArmor)"
                stroke="#22d3ee"
                stroke-width="2.6"
                class="spider-helmet"
              />

              <line x1="120" y1="35" x2="120" y2="128" stroke="rgba(34, 211, 238, 0.45)" stroke-width="1.2" />
              <line x1="75" y1="75" x2="165" y2="75" stroke="rgba(34, 211, 238, 0.35)" stroke-width="1.2" />
              <path d="M90 60 Q120 75 150 60" fill="none" stroke="rgba(34, 211, 238, 0.4)" stroke-width="1.2" />
              <path d="M85 85 Q120 105 155 85" fill="none" stroke="rgba(34, 211, 238, 0.4)" stroke-width="1.2" />

              <!-- Mắt Spider-Man -->
              <polygon points="82,65 112,80 102,96 76,82" fill="#020817" stroke="#0ea5e9" stroke-width="2.2" />
              <polygon points="85,68 108,80 100,92 80,81" fill="#22d3ee" filter="url(#regSpiderGlow)" class="spider-eye-left" />

              <polygon points="158,65 128,80 138,96 164,82" fill="#020817" stroke="#0ea5e9" stroke-width="2.2" />
              <polygon points="155,68 132,80 140,92 160,81" fill="#22d3ee" filter="url(#regSpiderGlow)" class="spider-eye-right" />

              <line x1="76" y1="78" x2="164" y2="78" stroke="#f0fdf4" stroke-width="1.2" stroke-dasharray="8 4" class="laser-visor-line" />

              <!-- Khớp Cổ & Giáp Ngực -->
              <polygon points="106,128 134,128 140,140 100,140" fill="#030b1e" stroke="#1e293b" stroke-width="1.5" />

              <path
                d="M60,140 L180,140 L162,205 L78,205 Z"
                fill="url(#regSpiderArmor)"
                stroke="#22d3ee"
                stroke-width="2.4"
                class="spider-chest"
              />

              <polygon points="44,144 64,138 64,180 40,170" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8" />
              <polygon points="196,144 176,138 176,180 200,170" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8" />

              <!-- Logo Nhện -->
              <g class="spider-emblem-core">
                <polygon points="120,152 126,162 124,175 120,180 116,175 114,162" fill="#22d3ee" filter="url(#regSpiderGlow)" class="spider-heart-pulse" />
                
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

          <div class="hover-pod-base">
            <div class="pod-glow-ellipse"></div>
          </div>
        </div>
      </div>

      <!-- FORM ĐĂNG KÝ HUD RỘNG FULL KHUNG (BÊN PHẢI ĐƯỢC GIỮ NGUYÊN 100%) -->
      <div class="hud-frame register-wide">
        <span class="bracket tl"></span>
        <span class="bracket tr"></span>
        <span class="bracket bl"></span>
        <span class="bracket br"></span>

        <div class="hud-telemetry">
          <div class="telemetry-left">
            <span class="radar-beacon"></span>
            <span class="telemetry-tag">PROTOCOL // ZERO_TRUST_ENROLL</span>
          </div>
          <span class="defcon-pill">PROVISIONING</span>
        </div>

        <div class="brand-block">
          <div class="shield-generator">
            <span class="shield-icon">⚡</span>
            <div class="shield-rings"></div>
          </div>
          <div class="brand-text">
            <h1 class="decrypted-title">{{ animatedTitle }}</h1>
            <p class="brand-sub">&gt; KHỞI TẠO TÀI KHOẢN VÀ CẤP KHÓA XÁC THỰC</p>
          </div>
        </div>

        <form @submit.prevent="handleRegister" novalidate class="soc-form">
          <div class="grid-2col">
            <!-- Tên người dùng -->
            <div class="field-item">
              <div class="field-header">
                <span class="field-prompt">&gt;</span>
                <label>TÊN ĐĂNG NHẬP</label>
              </div>
              <div class="input-housing">
                <input
                  v-model.trim="username"
                  type="text"
                  required
                  autocomplete="username"
                  placeholder="vd: analyst01"
                  @blur="touched.username = true"
                  class="hud-input"
                />
                <div class="input-scan-beam"></div>
              </div>
              <p v-if="touched.username && username && !usernameValid" class="soc-field-error">
                3-20 ký tự (chữ, số, _)
              </p>
            </div>

            <!-- Số điện thoại -->
            <div class="field-item">
              <div class="field-header">
                <span class="field-prompt">&gt;</span>
                <label>SỐ ĐIỆN THOẠI</label>
              </div>
              <div class="input-housing">
                <input
                  v-model.trim="phone"
                  type="tel"
                  required
                  autocomplete="tel"
                  placeholder="vd: 0912345678"
                  @blur="touched.phone = true"
                  class="hud-input"
                />
                <div class="input-scan-beam"></div>
              </div>
              <p v-if="touched.phone && phone && !phoneValid" class="soc-field-error">
                Số di động VN không hợp lệ
              </p>
            </div>
          </div>

          <!-- Email -->
          <div class="field-item">
            <div class="field-header">
              <span class="field-prompt">&gt;</span>
              <label>ĐỊA CHỈ EMAIL</label>
            </div>
            <div class="input-housing">
              <input
                v-model.trim="email"
                type="email"
                required
                autocomplete="email"
                placeholder="vd: analyst01@soc.local"
                @blur="touched.email = true"
                class="hud-input"
              />
              <div class="input-scan-beam"></div>
            </div>
            <p v-if="touched.email && email && !emailValid" class="soc-field-error">
              Email không đúng định dạng (vd: ten@domain.com)
            </p>
          </div>

          <!-- Mật khẩu & Thước đo Entropy -->
          <div class="field-item">
            <div class="field-header">
              <span class="field-prompt">&gt;</span>
              <label>MẬT KHẨU BẢO MẬT</label>
              <span class="entropy-tag" v-if="password" :style="{ color: strength.color }">
                [ENTROPY: {{ strength.label }}]
              </span>
            </div>
            <div class="input-housing">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="Tối thiểu 8 ký tự, có hoa/thường/số/kí tự đặc biệt"
                @blur="touched.password = true"
                class="hud-input"
              />
              <button
                type="button"
                class="hud-eye-btn"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <div class="input-scan-beam"></div>
            </div>

            <div class="entropy-meter-wrap" v-if="password">
              <div class="meter-bar">
                <div
                  class="meter-fill"
                  :style="{ width: strength.percent + '%', background: strength.color, boxShadow: `0 0 8px ${strength.color}` }"
                ></div>
              </div>
              <div class="rule-badges">
                <span :class="['rule-pill', { ok: strength.rules.length8 }]">&gt;= 8 chars</span>
                <span :class="['rule-pill', { ok: strength.rules.upper }]">UPPERCASE</span>
                <span :class="['rule-pill', { ok: strength.rules.digit }]">DIGITS</span>
                <span :class="['rule-pill', { ok: strength.rules.special }]">SPECIAL</span>
              </div>
            </div>
          </div>

          <!-- Nhập lại mật khẩu -->
          <div class="field-item">
            <div class="field-header">
              <span class="field-prompt">&gt;</span>
              <label>XÁC NHẬN MẬT KHẨU</label>
            </div>
            <div class="input-housing">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                @blur="touched.confirmPassword = true"
                class="hud-input"
              />
              <button
                type="button"
                class="hud-eye-btn"
                @click="showConfirmPassword = !showConfirmPassword"
                tabindex="-1"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <div class="input-scan-beam"></div>
            </div>
            <p v-if="touched.confirmPassword && confirmPassword && confirmPassword !== password" class="soc-field-error">
              Mật khẩu nhập lại không khớp
            </p>
          </div>

          <!-- Anti-Bot Captcha Screen -->
          <div class="field-item">
            <div class="field-header">
              <span class="field-prompt">&gt;</span>
              <label>GIẢI MÃ ANTI-BOT TOKEN</label>
            </div>
            <div class="captcha-cyber-housing">
              <canvas ref="captchaCanvas" width="140" height="42" @click="drawCaptcha" class="captcha-screen" title="Bấm để đổi token khác"></canvas>
              <button type="button" class="token-refresh-btn" @click="drawCaptcha" title="Reset Token">
                ⟳
              </button>
              <input
                v-model.trim="captchaInput"
                type="text"
                required
                placeholder="TOKEN"
                autocomplete="off"
                @blur="touched.captcha = true"
                class="hud-input captcha-input"
              />
            </div>
            <p v-if="touched.captcha && captchaInput && !captchaValid" class="soc-field-error">
              Mã xác nhận chưa chính xác
            </p>
          </div>

          <div v-if="error" class="soc-alert error">
            <span class="alert-icon">⛔</span>
            <span>{{ error }}</span>
          </div>

          <button type="submit" :disabled="loading || !canSubmit" class="soc-submit-trigger">
            <span class="trigger-label">
              {{ loading ? 'ĐANG ĐĂNG KÝ HỆ THỐNG...' : 'HOÀN TẤT ĐĂNG KÝ // ENROLL IDENTITY' }}
            </span>
            <span class="trigger-bracket">&gt;&gt;</span>
          </button>
        </form>

        <div class="hud-sublink">
          <span class="sublink-dim">ĐÃ ĐƯỢC PHÊ DUYỆT ĐẶC QUYỀN?</span>
          <a href="#" @click.prevent="$emit('switch', 'login')">
            [ VÀO TRANG ĐĂNG NHẬP ]
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { register } from '../auth'
import { isValidUsername, isValidEmail, isValidPhone, passwordStrength, isPasswordEligible } from '../validators'

const emit = defineEmits(['switch'])

const username = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaInput = ref('')
const error = ref('')
const loading = ref(false)

const isRobotGlowing = ref(false)

const touched = ref({
  username: false,
  email: false,
  phone: false,
  password: false,
  confirmPassword: false,
  captcha: false,
})

const usernameValid = computed(() => isValidUsername(username.value))
const emailValid = computed(() => isValidEmail(email.value))
const phoneValid = computed(() => isValidPhone(phone.value))
const strength = computed(() => passwordStrength(password.value))
const passwordOk = computed(() => isPasswordEligible(password.value))
const confirmOk = computed(() => confirmPassword.value && confirmPassword.value === password.value)

const captchaCanvas = ref(null)
const captchaText = ref('')
const cyberCanvas = ref(null)
let animId = null
const mousePos = { x: -1000, y: -1000 }
const robotLookAngle = ref({ x: 0, y: 0 })

function toggleRobotGlow() {
  isRobotGlowing.value = !isRobotGlowing.value
}

function getDetectedComputerName() {
  const seed = `${navigator.userAgent}-${navigator.hardwareConcurrency || 4}-${screen.width}x${screen.height}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(36).toUpperCase()
  return `DESKTOP-${(hex + '3IB1LUP').slice(0, 7)}`
}

const originalTitle = 'ENROLL // IDENTITY'
const animatedTitle = ref(originalTitle)

function triggerDecryptText() {
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

function randomCaptchaText(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function drawCaptcha() {
  captchaText.value = randomCaptchaText()
  captchaInput.value = ''
  const canvas = captchaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#030813'
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 + Math.random() * 0.25})`
    ctx.beginPath()
    ctx.moveTo(0, Math.random() * h)
    ctx.lineTo(w, Math.random() * h)
    ctx.stroke()
  }

  const text = captchaText.value
  const gap = w / (text.length + 1)
  for (let i = 0; i < text.length; i++) {
    ctx.save()
    ctx.translate(gap * (i + 1), h / 2)
    ctx.rotate((Math.random() * 26 - 13) * (Math.PI / 180))
    ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#22d3ee'
    ctx.font = 'bold 20px Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }
}

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
  drawCaptcha()
  initCanvas()
  triggerDecryptText()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})

const captchaValid = computed(
  () => captchaInput.value.trim().toUpperCase() === captchaText.value.toUpperCase()
)

const canSubmit = computed(
  () =>
    usernameValid.value &&
    emailValid.value &&
    phoneValid.value &&
    passwordOk.value &&
    confirmOk.value &&
    captchaValid.value
)

async function handleRegister() {
  error.value = ''
  Object.keys(touched.value).forEach((k) => (touched.value[k] = true))

  if (!usernameValid.value) { error.value = 'Tên đăng nhập không hợp lệ'; return }
  if (!emailValid.value) { error.value = 'Email không hợp lệ'; return }
  if (!phoneValid.value) { error.value = 'Số điện thoại không hợp lệ'; return }
  if (!passwordOk.value) { error.value = 'Mật khẩu chưa đáp ứng tiêu chuẩn an toàn'; return }
  if (!confirmOk.value) { error.value = 'Mật khẩu nhập lại không khớp'; return }
  if (!captchaValid.value) { error.value = 'Token xác nhận chưa đúng'; drawCaptcha(); return }

  loading.value = true
  try {
    const autoMachine = getDetectedComputerName()

    // Gửi tên máy lên server, server Express sẽ tự động trích xuất IP mạng thật của client
    await register(username.value, email.value, phone.value, password.value, autoMachine)
    emit('switch', 'login', `Đăng ký thành công tài khoản "${username.value}". Vui lòng đăng nhập.`)
  } catch (err) {
    error.value = err.message
    drawCaptcha()
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
  max-width: 1400px;
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

/* Hiệu ứng Phát Sáng Cực Đại (Super Glow) khi Click */
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

/* ================= HUD FRAME REGISTER (GIỮ NGUYÊN 100%) ================= */
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

.register-wide { flex: 1.2; }

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
  margin-bottom: 18px;
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
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.4);
  padding: 3px 8px;
  border-radius: 2px;
}

.brand-block { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
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
.shield-icon { font-size: 24px; filter: drop-shadow(0 0 12px #22d3ee); }
.shield-rings {
  position: absolute;
  inset: -4px;
  border: 1px dashed #22d3ee;
  border-radius: 6px;
  animation: rotateRing 14s linear infinite;
}

.decrypted-title {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #f8fafc;
  text-shadow: 0 0 16px rgba(34, 211, 238, 0.6);
}
.brand-sub { margin: 3px 0 0; font-size: 10px; color: #64748b; letter-spacing: 1px; }

.soc-form { display: flex; flex-direction: column; gap: 14px; }
.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.field-item { display: flex; flex-direction: column; gap: 5px; }
.field-header { display: flex; align-items: center; font-size: 10.5px; gap: 6px; color: #94a3b8; }
.field-prompt { color: #22d3ee; font-weight: bold; }
.field-header label { flex: 1; font-weight: 700; letter-spacing: 0.5px; }
.entropy-tag { font-size: 10px; font-weight: bold; }

.input-housing {
  position: relative;
  display: flex;
  align-items: center;
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 3px;
  overflow: hidden;
  transition: all 0.25s ease;
}
.hud-input {
  width: 100%;
  background: transparent !important;
  border: none !important;
  color: #38bdf8 !important;
  padding: 11px 12px;
  font-size: 13px;
  font-family: inherit;
}
.hud-input:focus { outline: none; }
.input-housing:focus-within {
  border-color: #22d3ee;
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.3);
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
  padding-right: 12px;
  display: flex;
}
.hud-eye-btn:hover { color: #22d3ee; }

.entropy-meter-wrap { margin-top: 4px; }
.meter-bar { height: 4px; background: #07101f; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
.meter-fill { height: 100%; transition: width 0.25s, background 0.25s; }

.rule-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.rule-pill {
  font-size: 9.5px;
  color: #475569;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 2px;
}
.rule-pill.ok {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.4);
  background: rgba(34, 211, 238, 0.08);
}

.captcha-cyber-housing { display: flex; gap: 10px; align-items: center; }
.captcha-screen {
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 3px;
  cursor: pointer;
}
.token-refresh-btn {
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #38bdf8;
  width: 42px;
  height: 42px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.token-refresh-btn:hover { border-color: #22d3ee; color: #22d3ee; }
.captcha-input {
  text-transform: uppercase;
  background: #030813 !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  border-radius: 3px;
}
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