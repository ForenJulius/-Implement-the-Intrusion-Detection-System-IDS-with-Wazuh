<template>
  <div class="soc-auth-viewport" @mousemove="handleMouseMove">
    <canvas ref="cyberCanvas" class="cyber-canvas"></canvas>
    <div class="vignette-overlay"></div>
    <div class="crt-scanlines"></div>

    <div class="hud-frame register-wide">
      <span class="bracket tl"></span>
      <span class="bracket tr"></span>
      <span class="bracket bl"></span>
      <span class="bracket br"></span>

      <div class="hud-telemetry">
        <div class="telemetry-left">
          <span class="radar-beacon"></span>
          <span class="telemetry-tag">PROTOCOL // CREDENTIAL_RECOVERY</span>
        </div>
        <span class="defcon-pill">RECOVERY</span>
      </div>

      <div class="brand-block">
        <div class="shield-generator">
          <span class="shield-icon">🔓</span>
          <div class="shield-rings"></div>
        </div>
        <div class="brand-text">
          <h1 class="decrypted-title">{{ animatedTitle }}</h1>
          <p class="brand-sub">&gt; XÁC MINH DANH TÍNH ĐỂ ĐẶT LẠI MẬT KHẨU</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" novalidate class="soc-form">
        <!-- Tên đăng nhập -->
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

        <!-- Mật khẩu mới & Thước đo Entropy -->
        <div class="field-item">
          <div class="field-header">
            <span class="field-prompt">&gt;</span>
            <label>MẬT KHẨU MỚI</label>
            <span class="entropy-tag" v-if="newPassword" :style="{ color: strength.color }">
              [ENTROPY: {{ strength.label }}]
            </span>
          </div>
          <div class="input-housing">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Tối thiểu 8 ký tự, có hoa/thường/số/kí tự đặc biệt"
              @blur="touched.newPassword = true"
              class="hud-input"
            />
            <button type="button" class="hud-eye-btn" @click="showNewPassword = !showNewPassword" tabindex="-1">
              <svg v-if="!showNewPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
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

          <div class="entropy-meter-wrap" v-if="newPassword">
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

        <!-- Xác nhận mật khẩu mới -->
        <div class="field-item">
          <div class="field-header">
            <span class="field-prompt">&gt;</span>
            <label>XÁC NHẬN MẬT KHẨU MỚI</label>
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
            <button type="button" class="hud-eye-btn" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
              <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
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
          <p v-if="touched.confirmPassword && confirmPassword && confirmPassword !== newPassword" class="soc-field-error">
            Mật khẩu nhập lại không khớp
          </p>
        </div>

        <!-- Captcha -->
        <div class="field-item">
          <div class="field-header">
            <span class="field-prompt">&gt;</span>
            <label>GIẢI MÃ ANTI-BOT TOKEN</label>
          </div>
          <div class="captcha-cyber-housing">
            <canvas ref="captchaCanvas" width="140" height="42" @click="drawCaptcha" class="captcha-screen" title="Bấm để đổi token khác"></canvas>
            <button type="button" class="token-refresh-btn" @click="drawCaptcha" title="Reset Token">⟳</button>
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
            {{ loading ? 'ĐANG XÁC MINH...' : 'ĐẶT LẠI MẬT KHẨU' }}
          </span>
          <span class="trigger-bracket">&gt;&gt;</span>
        </button>
      </form>

      <div class="hud-sublink">
        <span class="sublink-dim">NHỚ LẠI MẬT KHẨU RỒI?</span>
        <a href="#" @click.prevent="$emit('switch', 'login')">
          [ QUAY LẠI ĐĂNG NHẬP ]
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isValidUsername, isValidEmail, isValidPhone, passwordStrength, isPasswordEligible } from '../validators'

const emit = defineEmits(['switch'])

const username = ref('')
const email = ref('')
const phone = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaInput = ref('')
const error = ref('')
const loading = ref(false)

const touched = ref({
  username: false,
  email: false,
  phone: false,
  newPassword: false,
  confirmPassword: false,
  captcha: false,
})

const usernameValid = computed(() => isValidUsername(username.value))
const emailValid = computed(() => isValidEmail(email.value))
const phoneValid = computed(() => isValidPhone(phone.value))
const strength = computed(() => passwordStrength(newPassword.value))
const passwordOk = computed(() => isPasswordEligible(newPassword.value))
const confirmOk = computed(() => confirmPassword.value && confirmPassword.value === newPassword.value)

const captchaCanvas = ref(null)
const captchaText = ref('')
const cyberCanvas = ref(null)
let animId = null
const mousePos = { x: -1000, y: -1000 }

const originalTitle = 'CREDENTIAL // RECOVERY'
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
  const nodeCount = Math.floor((width * height) / 13000)
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

async function handleSubmit() {
  error.value = ''
  Object.keys(touched.value).forEach((k) => (touched.value[k] = true))

  if (!usernameValid.value) { error.value = 'Tên đăng nhập không hợp lệ'; return }
  if (!emailValid.value) { error.value = 'Email không hợp lệ'; return }
  if (!phoneValid.value) { error.value = 'Số điện thoại không hợp lệ'; return }
  if (!passwordOk.value) { error.value = 'Mật khẩu mới chưa đáp ứng tiêu chuẩn an toàn'; return }
  if (!confirmOk.value) { error.value = 'Mật khẩu nhập lại không khớp'; return }
  if (!captchaValid.value) { error.value = 'Token xác nhận chưa đúng'; drawCaptcha(); return }

  loading.value = true
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        phone: phone.value,
        newPassword: newPassword.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Đặt lại mật khẩu thất bại')

    emit('switch', 'login', `Đặt lại mật khẩu thành công cho tài khoản "${username.value}". Vui lòng đăng nhập bằng mật khẩu mới.`)
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020611;
  font-family: var(--font-ui);
  overflow: hidden;
  padding: 30px 10px;
  user-select: none;
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

.hud-frame {
  position: relative;
  width: 460px;
  background: rgba(6, 14, 26, 0.88);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(34, 211, 238, 0.25);
  padding: 30px 28px;
  border-radius: 2px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(14, 165, 233, 0.15);
  z-index: 10;
}
.register-wide { width: 480px; }

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
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(59, 130, 246, 0.3);
}
.telemetry-left { display: flex; align-items: center; gap: 8px; }
.radar-beacon {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  animation: radarBlink 1.4s infinite;
}
@keyframes radarBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}
.telemetry-tag { font-size: 10px; color: #38bdf8; letter-spacing: 1.2px; }
.defcon-pill {
  font-size: 9px;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 2px 6px;
  border-radius: 2px;
}

.brand-block { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.shield-generator {
  position: relative;
  width: 44px;
  height: 44px;
  background: #040914;
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shield-icon { font-size: 20px; filter: drop-shadow(0 0 10px #22d3ee); }
.shield-rings {
  position: absolute;
  inset: -4px;
  border: 1px dashed #22d3ee;
  border-radius: 6px;
  animation: rotateRing 14s linear infinite;
}
@keyframes rotateRing {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.decrypted-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #f8fafc;
  text-shadow: 0 0 16px rgba(34, 211, 238, 0.6);
}
.brand-sub { margin: 2px 0 0; font-size: 9.5px; color: #64748b; letter-spacing: 1px; }

.soc-form { display: flex; flex-direction: column; gap: 12px; }
.field-item { display: flex; flex-direction: column; gap: 4px; }
.field-header { display: flex; align-items: center; font-size: 10px; gap: 6px; color: #94a3b8; }
.field-prompt { color: #22d3ee; font-weight: bold; }
.field-header label { flex: 1; font-weight: 700; letter-spacing: 0.5px; }
.entropy-tag { font-size: 9.5px; font-weight: bold; }

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
  padding: 9px 10px;
  font-size: 12.5px;
  font-family: inherit;
}
.hud-input:focus { outline: none; }
.input-housing:focus-within {
  border-color: #22d3ee;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
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
  padding-right: 10px;
  display: flex;
}
.hud-eye-btn:hover { color: #22d3ee; }

.entropy-meter-wrap { margin-top: 4px; }
.meter-bar { height: 4px; background: #07101f; border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
.meter-fill { height: 100%; transition: width 0.25s, background 0.25s; }

.rule-badges { display: flex; flex-wrap: wrap; gap: 4px; }
.rule-pill {
  font-size: 9px;
  color: #475569;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
  border-radius: 2px;
}
.rule-pill.ok {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.4);
  background: rgba(34, 211, 238, 0.08);
}

.captcha-cyber-housing { display: flex; gap: 8px; align-items: center; }
.captcha-screen {
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 3px;
  cursor: pointer;
}
.token-refresh-btn {
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #38bdf8;
  width: 36px;
  height: 42px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
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

.soc-field-error { color: #f87171; font-size: 10px; margin: 2px 0 0; }
.soc-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 3px;
  font-size: 11px;
}
.soc-alert.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.soc-submit-trigger {
  position: relative;
  margin-top: 6px;
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.85) 0%, rgba(6, 182, 212, 0.85) 100%);
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: #ffffff;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 12px;
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
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 10.5px;
}
.sublink-dim { color: #64748b; font-size: 10px; }
.hud-sublink a { color: #22d3ee; text-decoration: none; font-weight: 700; }
.hud-sublink a:hover { text-shadow: 0 0 10px rgba(34, 211, 238, 0.8); }
</style>
