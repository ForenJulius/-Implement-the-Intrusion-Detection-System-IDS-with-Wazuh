<template>
  <div class="profile-wrap">
    <!-- ================= THÔNG TIN TÀI KHOẢN ================= -->
    <div class="card soc-card">
      <div class="card-header">
        <div class="title-wrap">
          <span class="hud-tag">ACCOUNT IDENTITY</span>
          <h2>Thông tin tài khoản</h2>
        </div>
      </div>

      <div v-if="loading" class="soc-skeleton">
        <div class="skeleton-line" v-for="i in 3" :key="i"></div>
      </div>

      <div v-else class="info-list">
        <!-- Tên đăng nhập -->
        <div class="info-row">
          <div class="info-label">TÊN ĐĂNG NHẬP</div>
          <div v-if="editingField !== 'username'" class="info-value-row">
            <span class="info-value">{{ profile.username }}</span>
            <button class="btn-edit" @click="startEdit('username')">Sửa</button>
          </div>
          <div v-else class="edit-box">
            <input
              v-model.trim="editValue"
              type="text"
              class="soc-input"
              placeholder="Tên đăng nhập mới"
              @blur="editTouched = true"
            />
            <p v-if="editTouched && editValue && !isValidUsername(editValue)" class="field-error">
              3-20 ký tự, chỉ gồm chữ, số, dấu gạch dưới
            </p>
            <label class="confirm-label">Nhập mật khẩu hiện tại để xác nhận</label>
            <div class="pwd-wrap">
              <input
                v-model="editPassword"
                :type="showEditPassword ? 'text' : 'password'"
                class="soc-input"
                placeholder="Mật khẩu hiện tại"
              />
              <button type="button" class="eye-btn" @click="showEditPassword = !showEditPassword" tabindex="-1">
                <EyeIcon :open="showEditPassword" />
              </button>
            </div>
            <label class="confirm-label">Xác nhận bạn không phải robot</label>
            <div class="captcha-row">
              <canvas ref="editCaptchaCanvas" width="120" height="38" @click="drawEditCaptcha" class="captcha-screen" title="Bấm để đổi mã khác"></canvas>
              <button type="button" class="token-refresh-btn" @click="drawEditCaptcha">⟳</button>
              <input v-model.trim="editCaptchaInput" type="text" class="soc-input captcha-input" placeholder="Nhập mã" autocomplete="off" />
            </div>
            <div class="edit-actions">
              <button class="btn-cancel" @click="cancelEdit">Hủy</button>
              <button class="btn-confirm" :disabled="savingField" @click="confirmEdit('username')">
                {{ savingField ? 'Đang lưu...' : 'Xác nhận' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Email -->
        <div class="info-row">
          <div class="info-label">EMAIL</div>
          <div v-if="editingField !== 'email'" class="info-value-row">
            <span class="info-value">{{ profile.email || '-' }}</span>
            <button class="btn-edit" @click="startEdit('email')">Sửa</button>
          </div>
          <div v-else class="edit-box">
            <input
              v-model.trim="editValue"
              type="email"
              class="soc-input"
              placeholder="Email mới"
              @blur="editTouched = true"
            />
            <p v-if="editTouched && editValue && !isValidEmail(editValue)" class="field-error">
              Email không đúng định dạng (vd: ten@domain.com)
            </p>
            <label class="confirm-label">Nhập mật khẩu hiện tại để xác nhận</label>
            <div class="pwd-wrap">
              <input
                v-model="editPassword"
                :type="showEditPassword ? 'text' : 'password'"
                class="soc-input"
                placeholder="Mật khẩu hiện tại"
              />
              <button type="button" class="eye-btn" @click="showEditPassword = !showEditPassword" tabindex="-1">
                <EyeIcon :open="showEditPassword" />
              </button>
            </div>
            <label class="confirm-label">Xác nhận bạn không phải robot</label>
            <div class="captcha-row">
              <canvas ref="editCaptchaCanvas" width="120" height="38" @click="drawEditCaptcha" class="captcha-screen" title="Bấm để đổi mã khác"></canvas>
              <button type="button" class="token-refresh-btn" @click="drawEditCaptcha">⟳</button>
              <input v-model.trim="editCaptchaInput" type="text" class="soc-input captcha-input" placeholder="Nhập mã" autocomplete="off" />
            </div>
            <div class="edit-actions">
              <button class="btn-cancel" @click="cancelEdit">Hủy</button>
              <button class="btn-confirm" :disabled="savingField" @click="confirmEdit('email')">
                {{ savingField ? 'Đang lưu...' : 'Xác nhận' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Số điện thoại -->
        <div class="info-row">
          <div class="info-label">SỐ ĐIỆN THOẠI</div>
          <div v-if="editingField !== 'phone'" class="info-value-row">
            <span class="info-value">{{ profile.phone || '-' }}</span>
            <button class="btn-edit" @click="startEdit('phone')">Sửa</button>
          </div>
          <div v-else class="edit-box">
            <input
              v-model.trim="editValue"
              type="tel"
              class="soc-input"
              placeholder="Số điện thoại mới"
              @blur="editTouched = true"
            />
            <p v-if="editTouched && editValue && !isValidPhone(editValue)" class="field-error">
              Số di động VN không hợp lệ (vd: 0912345678)
            </p>
            <label class="confirm-label">Nhập mật khẩu hiện tại để xác nhận</label>
            <div class="pwd-wrap">
              <input
                v-model="editPassword"
                :type="showEditPassword ? 'text' : 'password'"
                class="soc-input"
                placeholder="Mật khẩu hiện tại"
              />
              <button type="button" class="eye-btn" @click="showEditPassword = !showEditPassword" tabindex="-1">
                <EyeIcon :open="showEditPassword" />
              </button>
            </div>
            <label class="confirm-label">Xác nhận bạn không phải robot</label>
            <div class="captcha-row">
              <canvas ref="editCaptchaCanvas" width="120" height="38" @click="drawEditCaptcha" class="captcha-screen" title="Bấm để đổi mã khác"></canvas>
              <button type="button" class="token-refresh-btn" @click="drawEditCaptcha">⟳</button>
              <input v-model.trim="editCaptchaInput" type="text" class="soc-input captcha-input" placeholder="Nhập mã" autocomplete="off" />
            </div>
            <div class="edit-actions">
              <button class="btn-cancel" @click="cancelEdit">Hủy</button>
              <button class="btn-confirm" :disabled="savingField" @click="confirmEdit('phone')">
                {{ savingField ? 'Đang lưu...' : 'Xác nhận' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p v-if="infoMessage" class="soc-alert success">✓ {{ infoMessage }}</p>
      <p v-if="infoError" class="soc-alert error">⛔ {{ infoError }}</p>
    </div>

    <!-- ================= ĐỔI MẬT KHẨU ================= -->
    <div class="card soc-card">
      <div class="card-header">
        <div class="title-wrap">
          <span class="hud-tag">SECURITY CREDENTIALS</span>
          <h2>Đổi mật khẩu</h2>
        </div>
      </div>

      <div class="pwd-form">
        <div class="field-item">
          <label>MẬT KHẨU HIỆN TẠI</label>
          <div class="pwd-wrap">
            <input
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="soc-input"
              placeholder="Nhập mật khẩu hiện tại"
              autocomplete="current-password"
            />
            <button type="button" class="eye-btn" @click="showCurrentPassword = !showCurrentPassword" tabindex="-1">
              <EyeIcon :open="showCurrentPassword" />
            </button>
          </div>
        </div>

        <div class="field-item">
          <label>
            MẬT KHẨU MỚI
            <span class="entropy-tag" v-if="newPassword" :style="{ color: strength.color }">
              [{{ strength.label }}]
            </span>
          </label>
          <div class="pwd-wrap">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="soc-input"
              placeholder="Tối thiểu 8 ký tự"
              autocomplete="new-password"
              @focus="newPasswordTouched = true"
            />
            <button type="button" class="eye-btn" @click="showNewPassword = !showNewPassword" tabindex="-1">
              <EyeIcon :open="showNewPassword" />
            </button>
          </div>

          <div class="entropy-meter-wrap" v-if="newPassword">
            <div class="meter-bar">
              <div
                class="meter-fill"
                :style="{ width: strength.percent + '%', background: strength.color, boxShadow: `0 0 8px ${strength.color}` }"
              ></div>
            </div>
            <div class="rule-badges">
              <span :class="['rule-pill', { ok: strength.rules.length8 }]">&gt;= 8 ký tự</span>
              <span :class="['rule-pill', { ok: strength.rules.upper }]">Chữ hoa</span>
              <span :class="['rule-pill', { ok: strength.rules.digit }]">Chữ số</span>
              <span :class="['rule-pill', { ok: strength.rules.special }]">Ký tự đặc biệt</span>
            </div>
          </div>
          <p v-else class="hint-text">Gợi ý: tối thiểu 8 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt (vd: !@#$%)</p>
        </div>

        <div class="field-item">
          <label>XÁC NHẬN MẬT KHẨU MỚI</label>
          <div class="pwd-wrap">
            <input
              v-model="confirmNewPassword"
              :type="showConfirmNewPassword ? 'text' : 'password'"
              class="soc-input"
              placeholder="••••••••"
              autocomplete="new-password"
              @blur="confirmTouched = true"
            />
            <button type="button" class="eye-btn" @click="showConfirmNewPassword = !showConfirmNewPassword" tabindex="-1">
              <EyeIcon :open="showConfirmNewPassword" />
            </button>
          </div>
          <p v-if="confirmTouched && confirmNewPassword && confirmNewPassword !== newPassword" class="field-error">
            Mật khẩu nhập lại không khớp
          </p>
        </div>

        <div class="field-item">
          <label>XÁC NHẬN BẠN KHÔNG PHẢI ROBOT</label>
          <div class="captcha-row">
            <canvas ref="pwdCaptchaCanvas" width="120" height="38" @click="drawPwdCaptcha" class="captcha-screen" title="Bấm để đổi mã khác"></canvas>
            <button type="button" class="token-refresh-btn" @click="drawPwdCaptcha">⟳</button>
            <input v-model.trim="pwdCaptchaInput" type="text" class="soc-input captcha-input" placeholder="Nhập mã" autocomplete="off" />
          </div>
        </div>

        <p v-if="pwdMessage" class="soc-alert success">✓ {{ pwdMessage }}</p>
        <p v-if="pwdError" class="soc-alert error">⛔ {{ pwdError }}</p>

        <button class="btn-submit-pwd" :disabled="savingPassword || !canSubmitPassword" @click="submitChangePassword">
          {{ savingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { apiFetch } from '../api'
import { updateSession } from '../auth'
import { isValidUsername, isValidEmail, isValidPhone, passwordStrength, isPasswordEligible } from '../validators'

// Icon con mắt dùng chung cho mọi ô mật khẩu trong trang này
const EyeIcon = (props) =>
  props.open
    ? h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.3 20.3 0 0 1-4.22 5.06M14.12 14.12a3 3 0 1 1-4.24-4.24' }),
        h('line', { x1: 1, y1: 1, x2: 23, y2: 23 }),
      ])
    : h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z' }),
        h('circle', { cx: 12, cy: 12, r: 3 }),
      ])

const profile = ref({ username: '', email: '', phone: '', role: 'user' })
const loading = ref(true)

// ---------- Captcha dùng chung (canvas vẽ trực tiếp, giống Register/Quên mật khẩu) ----------
function randomCaptchaText(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function paintCaptcha(canvas, text) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#030813'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 + Math.random() * 0.25})`
    ctx.beginPath()
    ctx.moveTo(0, Math.random() * h)
    ctx.lineTo(w, Math.random() * h)
    ctx.stroke()
  }
  const gap = w / (text.length + 1)
  for (let i = 0; i < text.length; i++) {
    ctx.save()
    ctx.translate(gap * (i + 1), h / 2)
    ctx.rotate((Math.random() * 26 - 13) * (Math.PI / 180))
    ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#22d3ee'
    ctx.font = 'bold 18px Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }
}

// Captcha cho khu vực sửa thông tin (username/email/phone dùng chung 1 canvas
// vì chỉ mở sửa 1 trường tại 1 thời điểm)
const editCaptchaCanvas = ref(null)
const editCaptchaText = ref('')
const editCaptchaInput = ref('')
function drawEditCaptcha() {
  editCaptchaText.value = randomCaptchaText()
  editCaptchaInput.value = ''
  paintCaptcha(editCaptchaCanvas.value, editCaptchaText.value)
}
const editCaptchaValid = computed(
  () => editCaptchaInput.value.trim().toUpperCase() === editCaptchaText.value.toUpperCase()
)

// Captcha riêng cho form đổi mật khẩu
const pwdCaptchaCanvas = ref(null)
const pwdCaptchaText = ref('')
const pwdCaptchaInput = ref('')
function drawPwdCaptcha() {
  pwdCaptchaText.value = randomCaptchaText()
  pwdCaptchaInput.value = ''
  paintCaptcha(pwdCaptchaCanvas.value, pwdCaptchaText.value)
}
const pwdCaptchaValid = computed(
  () => pwdCaptchaInput.value.trim().toUpperCase() === pwdCaptchaText.value.toUpperCase()
)

async function fetchProfile() {
  loading.value = true
  try {
    const res = await apiFetch('/api/profile')
    const data = await res.json()
    if (res.ok) profile.value = data
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchProfile()
  drawPwdCaptcha()
})

// ---------- Sửa từng trường (username/email/phone) ----------
const editingField = ref(null)
const editValue = ref('')
const editPassword = ref('')
const editTouched = ref(false)
const showEditPassword = ref(false)
const savingField = ref(false)
const infoMessage = ref('')
const infoError = ref('')

function startEdit(field) {
  editingField.value = field
  editValue.value = profile.value[field] || ''
  editPassword.value = ''
  editTouched.value = false
  infoMessage.value = ''
  infoError.value = ''
  editCaptchaInput.value = ''
  nextTick(() => drawEditCaptcha())
}
function cancelEdit() {
  editingField.value = null
}

async function confirmEdit(field) {
  infoError.value = ''
  editTouched.value = true

  const validators = { username: isValidUsername, email: isValidEmail, phone: isValidPhone }
  if (!validators[field](editValue.value)) {
    infoError.value = 'Giá trị mới không đúng định dạng'
    return
  }
  if (!editPassword.value) {
    infoError.value = 'Vui lòng nhập mật khẩu hiện tại để xác nhận'
    return
  }
  if (!editCaptchaValid.value) {
    infoError.value = 'Mã xác nhận (captcha) không đúng'
    drawEditCaptcha()
    return
  }

  savingField.value = true
  try {
    const res = await apiFetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value: editValue.value, currentPassword: editPassword.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại')

    updateSession(data.token, data.user)
    profile.value = { ...profile.value, [field]: data.user[field] }
    editingField.value = null
    infoMessage.value = 'Cập nhật thông tin thành công'
    setTimeout(() => (infoMessage.value = ''), 4000)
  } catch (err) {
    infoError.value = err.message
  } finally {
    savingField.value = false
  }
}

// ---------- Đổi mật khẩu ----------
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmNewPassword = ref(false)
const newPasswordTouched = ref(false)
const confirmTouched = ref(false)
const savingPassword = ref(false)
const pwdMessage = ref('')
const pwdError = ref('')

const strength = computed(() => passwordStrength(newPassword.value))
const passwordOk = computed(() => isPasswordEligible(newPassword.value))
const confirmOk = computed(() => confirmNewPassword.value && confirmNewPassword.value === newPassword.value)
const canSubmitPassword = computed(
  () => currentPassword.value.length > 0 && passwordOk.value && confirmOk.value && pwdCaptchaInput.value.length > 0
)

async function submitChangePassword() {
  pwdError.value = ''
  pwdMessage.value = ''
  newPasswordTouched.value = true
  confirmTouched.value = true

  if (!currentPassword.value) { pwdError.value = 'Vui lòng nhập mật khẩu hiện tại'; return }
  if (!passwordOk.value) { pwdError.value = 'Mật khẩu mới chưa đủ mạnh (tối thiểu 8 ký tự, có hoa/thường/số/ký tự đặc biệt)'; return }
  if (!confirmOk.value) { pwdError.value = 'Mật khẩu nhập lại không khớp'; return }
  if (!pwdCaptchaValid.value) { pwdError.value = 'Mã xác nhận (captcha) không đúng'; drawPwdCaptcha(); return }

  savingPassword.value = true
  try {
    const res = await apiFetch('/api/profile/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPassword.value, newPassword: newPassword.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại')

    pwdMessage.value = 'Đổi mật khẩu thành công'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    newPasswordTouched.value = false
    confirmTouched.value = false
    drawPwdCaptcha()
  } catch (err) {
    pwdError.value = err.message
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.profile-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 620px;
}

.soc-card {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.95) 0%, rgba(9, 16, 26, 0.98) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
}
.hud-tag {
  font-size: 9.5px;
  font-family: var(--font-ui);
  color: #22d3ee;
  letter-spacing: 1.5px;
  display: block;
}
h2 { margin: 4px 0 0; font-size: 15px; font-weight: 700; color: #f1f5f9; }

.soc-skeleton { display: flex; flex-direction: column; gap: 10px; padding: 14px 0; }
.skeleton-line {
  height: 38px;
  background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(59, 130, 246, 0.08) 50%, rgba(255,255,255,0.02) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.info-list { display: flex; flex-direction: column; gap: 14px; }
.info-row {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.info-row:last-child { border-bottom: none; padding-bottom: 0; }
.info-label {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 0.8px;
  font-family: var(--font-ui);
  margin-bottom: 6px;
}
.info-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.info-value {
  font-size: 14px;
  color: #f1f5f9;
  font-family: var(--font-ui);
  font-weight: 600;
}
.btn-edit {
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: #22d3ee;
  font-size: 11px;
  font-family: var(--font-ui);
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-edit:hover { background: rgba(34, 211, 238, 0.2); box-shadow: 0 0 10px rgba(34, 211, 238, 0.25); }

.edit-box { display: flex; flex-direction: column; gap: 8px; }
.confirm-label {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
  font-family: var(--font-ui);
}
.soc-input {
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #38bdf8;
  padding: 9px 10px;
  font-size: 13px;
  border-radius: 6px;
  font-family: var(--font-ui);
  width: 100%;
}
.soc-input:focus { outline: none; border-color: #22d3ee; box-shadow: 0 0 10px rgba(34, 211, 238, 0.25); }

.pwd-wrap { position: relative; display: flex; }
.pwd-wrap .soc-input { flex: 1; padding-right: 36px; }
.eye-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
}
.eye-btn:hover { color: #22d3ee; }

.edit-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: var(--font-ui);
}
.btn-cancel:hover { border-color: #f87171; color: #f87171; }
.btn-confirm {
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.85), rgba(6, 182, 212, 0.85));
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: white;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-ui);
}
.btn-confirm:hover:not(:disabled) { box-shadow: 0 0 14px rgba(34, 211, 238, 0.4); }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

.field-error { color: #f87171; font-size: 10.5px; margin: 0; font-family: var(--font-ui); }
.hint-text { color: #64748b; font-size: 10.5px; margin: 4px 0 0; font-family: var(--font-ui); }

.soc-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: var(--font-ui);
  margin-top: 12px;
}
.soc-alert.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
}
.soc-alert.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.pwd-form { display: flex; flex-direction: column; gap: 16px; }
.field-item { display: flex; flex-direction: column; gap: 6px; }
.field-item label {
  font-size: 10.5px;
  color: #94a3b8;
  letter-spacing: 0.6px;
  font-family: var(--font-ui);
  font-weight: 700;
}
.entropy-tag { font-size: 9.5px; font-weight: bold; margin-left: 6px; }

.entropy-meter-wrap { margin-top: 4px; }
.meter-bar { height: 4px; background: #07101f; border-radius: 2px; overflow: hidden; margin-bottom: 6px; }
.meter-fill { height: 100%; transition: width 0.25s, background 0.25s; }
.rule-badges { display: flex; flex-wrap: wrap; gap: 4px; }
.rule-pill {
  font-size: 9.5px;
  color: #475569;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--font-ui);
}
.rule-pill.ok {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.4);
  background: rgba(34, 211, 238, 0.08);
}

.btn-submit-pwd {
  margin-top: 4px;
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.85) 0%, rgba(6, 182, 212, 0.85) 100%);
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: all 0.25s ease;
}
.btn-submit-pwd:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
}
.btn-submit-pwd:disabled { opacity: 0.4; cursor: not-allowed; }

.captcha-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.captcha-screen {
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}
.token-refresh-btn {
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #38bdf8;
  width: 32px;
  height: 38px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.token-refresh-btn:hover { border-color: #22d3ee; color: #22d3ee; }
.captcha-input {
  text-transform: uppercase;
  flex: 1;
}
</style>