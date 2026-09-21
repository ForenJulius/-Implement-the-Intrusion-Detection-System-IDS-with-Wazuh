<template>
  <div class="soc-chat-wrapper">
    <!-- Nút bật/tắt Chatbox -->
    <button class="chat-toggle-btn" @click="isOpen = !isOpen">
      <span class="chat-beacon" v-if="unreadCount > 0"></span>
      <span class="chat-icon">🛡️</span>
      <span class="chat-btn-label">{{ isOpen ? 'ĐÓNG TERMINAL' : 'SOC SUPPORT & CHAT' }}</span>
      <span v-if="unreadCount > 0" class="unread-pill">{{ unreadCount }}</span>
    </button>

    <!-- Cửa sổ Chat HUD -->
    <div v-if="isOpen" :class="['chat-window hud-frame', { 'admin-expanded': isAdmin }]">
      <!-- CỘT DANH BẠ DÀNH RIÊNG CHO ADMIN -->
      <aside v-if="isAdmin" class="user-directory-pane">
        <div class="dir-header">
          <span class="dir-title">&gt; DANH BẠ HỖ TRỢ</span>
          <button class="btn-refresh-users" @click="fetchUserList" title="Tải lại danh sách">⟳</button>
        </div>

        <div class="user-list-scroll">
          <div
            v-for="u in usersList"
            :key="u.username"
            :class="['user-contact-item', { active: targetRecipient === u.username }]"
            @click="selectRecipient(u.username, u.username)"
          >
            <span :class="['status-pip', u.role === 'admin' ? 'admin' : 'user']"></span>
            <div class="contact-info">
              <span class="contact-name">{{ u.username }}</span>
              <span class="contact-meta">{{ u.email || u.phone || 'No contact' }}</span>
            </div>
            <span v-if="u.role === 'admin'" class="badge-role">ADMIN</span>
          </div>
        </div>
      </aside>

      <!-- KHUNG HỘI THOẠI CHÍNH -->
      <div class="chat-main-pane">
        <!-- Header & Bộ chuyển kênh cho User (AI Bot vs Admin) -->
        <div class="chat-header">
          <div class="header-left">
            <span class="online-indicator"></span>
            <div class="header-titles">
              <span class="header-title">BLUE_TEAM_COMMS</span>
              <span class="active-target-label">
                ĐANG KẾT NỐI: <strong class="target-name">[{{ activeChannelLabel }}]</strong>
              </span>
            </div>
          </div>

          <!-- Bộ chuyển Tab AI / ADMIN dành riêng cho User -->
          <div v-if="!isAdmin" class="user-channel-switch">
            <button
              :class="['channel-tab', { active: userChannel === 'AI' }]"
              @click="switchUserChannel('AI')"
            >
              🤖 Trợ Lý AI
            </button>
            <button
              :class="['channel-tab', { active: userChannel === 'ADMIN' }]"
              @click="switchUserChannel('ADMIN')"
            >
              🛡️ Chat Admin
            </button>
          </div>

          <span v-else class="role-badge">QUẢN TRỊ VIÊN</span>
        </div>

        <!-- Quick Action Bar: Admin gửi link chặn cho User -->
        <div class="quick-remediation-bar" v-if="isAdmin && targetRecipient">
          <span class="bar-title">&gt; GỬI LINK XỬ LÝ NHANH CHO [{{ targetRecipient }}]:</span>
          <div class="remediation-btns">
            <button @click="sendRemediationLink('Chặn IP Kẻ Tấn Công Qua Firewall', 'BLOCK_IP')">
              + Gửi Link Chặn IP
            </button>
            <button @click="sendRemediationLink('Hủy Phiên & Đổi Mật Khẩu Khẩn Cấp', 'KILL_SESSION')">
              + Gửi Link Reset Session
            </button>
          </div>
        </div>

        <!-- Danh sách tin nhắn hiển thị -->
        <div class="chat-messages" ref="msgContainer">
          <div
            v-for="msg in currentFilteredMessages"
            :key="msg.id"
            :class="['message-row', msg.sender === currentUser?.username ? 'self' : 'other', msg.isSystem ? 'system' : '', msg.sender === 'SOC_AI_BOT' ? 'ai-msg' : '']"
          >
            <div class="msg-meta">
              <span class="sender-name">{{ msg.sender }}</span>
              <span class="msg-time">{{ msg.time }}</span>
            </div>

            <!-- Thẻ chứa Link Ngăn Chặn 1-Click -->
            <div v-if="msg.actionLink" class="msg-action-card">
              <div class="action-card-header">
                <span class="alert-sym">⚠️</span>
                <span class="action-title">{{ msg.actionLink.title }}</span>
              </div>
              <p class="action-desc">
                Liên kết bảo vệ do <strong>{{ msg.sender }}</strong> cung cấp. Bấm bên dưới để hệ thống thực thi chính sách cô lập ngay:
              </p>
              <button
                class="action-trigger-btn"
                :disabled="msg.actionLink.executed"
                @click="executeRemediation(msg)"
              >
                {{ msg.actionLink.executed ? '✓ ĐÃ THỰC THI NGĂN CHẶN' : '⚡ BẤM ĐỂ TỰ ĐỘNG CHẶN NGAY' }}
              </button>
            </div>

            <!-- Tin nhắn văn bản thông thường (hỗ trợ phân tích AI) -->
            <div v-else class="msg-bubble" style="white-space: pre-wrap;">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <!-- Ô nhập liệu gửi tin -->
        <form class="chat-input-bar" @submit.prevent="sendMessage">
          <input
            v-model="inputMsg"
            type="text"
            :placeholder="inputPlaceholder"
            class="chat-input"
          />
          <button type="submit" class="send-btn" :disabled="!inputMsg.trim()">
            GỬI &gt;
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { apiFetch } from '../api'

const props = defineProps({
  currentUser: { type: Object, default: () => ({}) },
  isAdmin: { type: Boolean, default: false },
})

const isOpen = ref(false)
const inputMsg = ref('')
const msgContainer = ref(null)
const unreadCount = ref(0)

// Trạng thái kênh:
// User: 'AI' (chat riêng với AI) hoặc 'ADMIN' (chat riêng với Admin)
const userChannel = ref('AI')

// Admin: targetRecipient là username của User được chọn trong danh bạ
const targetRecipient = ref('')
const usersList = ref([])
const messages = ref([])

const STORAGE_KEY = 'bw_soc_chat_history_v2'
let broadcastChannel = null

const activeChannelLabel = computed(() => {
  if (props.isAdmin) {
    return targetRecipient.value ? `User: ${targetRecipient.value}` : 'Chưa chọn User'
  }
  return userChannel.value === 'AI' ? 'Trợ Lý SOC AI (Riêng tư)' : 'Phòng Trực Quản Trị Viên (Admin)'
})

const inputPlaceholder = computed(() => {
  if (props.isAdmin) {
    return targetRecipient.value ? `Gửi chỉ dẫn cho ${targetRecipient.value}...` : 'Chọn User bên trái để chat...'
  }
  return userChannel.value === 'AI'
    ? 'Hỏi AI: "Tôi bị tấn công brute force/port scan...", "IP lạ là gì?"...'
    : 'Nhắn trực tiếp với Admin...'
})

// Bộ lọc tin nhắn phân tách độc lập giữa AI, User và Admin
const currentFilteredMessages = computed(() => {
  const myName = props.currentUser?.username

  if (!props.isAdmin) {
    if (userChannel.value === 'AI') {
      // Chỉ lấy các tin nhắn giữa User này và con AI BOT
      return messages.value.filter(
        (m) =>
          (m.sender === myName && m.recipient === 'SOC_AI_BOT') ||
          (m.sender === 'SOC_AI_BOT' && m.recipient === myName)
      )
    } else {
      // Chỉ lấy các tin nhắn giữa User này và ADMIN
      return messages.value.filter(
        (m) =>
          (m.sender === myName && m.recipient === 'ADMIN') ||
          (m.recipient === myName && (m.sender === 'admin' || m.sender === 'Admin' || m.role === 'admin'))
      )
    }
  }

  // Phía ADMIN: lọc theo User đang chọn bên cột danh bạ
  if (!targetRecipient.value) return []
  const selectedUser = targetRecipient.value

  return messages.value.filter((m) => {
    const userToAdmin = m.sender === selectedUser && m.recipient === 'ADMIN'
    const adminToUser = m.sender === myName && m.recipient === selectedUser
    return userToAdmin || adminToUser
  })
})

function switchUserChannel(channel) {
  userChannel.value = channel
  scrollToBottom()
}

function selectRecipient(username) {
  targetRecipient.value = username
  scrollToBottom()
}

async function fetchUserList() {
  if (!props.isAdmin) return
  try {
    const res = await apiFetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      usersList.value = (data.users || []).filter((u) => u.username !== props.currentUser?.username)
      if (usersList.value.length > 0 && !targetRecipient.value) {
        targetRecipient.value = usersList.value[0].username
      }
    }
  } catch (err) {
    console.error('Không lấy được danh sách user:', err)
  }
}

function loadStoredMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      messages.value = JSON.parse(raw)
    } else {
      // Tin nhắn mặc định chào mừng của AI dành cho User
      messages.value = [
        {
          id: 1,
          recipient: props.currentUser?.username || 'user',
          sender: 'SOC_AI_BOT',
          time: '08:00',
          text: `[HỆ THỐNG PHÒNG THỦ BLUE TEAM SẴN SÀNG]\nChào ${props.currentUser?.username || 'bạn'}, tôi là Trợ Lý AI Chuyên Trách An Ninh Mạng.\nNếu phát hiện máy bị lag, nghi ngờ bị dò quét IP, tấn công dò mật khẩu SSH hay mã độc, hãy nhập chi tiết dấu hiệu tại đây để tôi phân tích nguyên nhân và đưa ra giải pháp xử lý.`,
          isSystem: false,
        },
      ]
      saveMessages()
    }
  } catch (e) {
    messages.value = []
  }
}

function saveMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
  } catch (e) {}
}

function scrollToBottom() {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

function pushAndBroadcast(msg) {
  messages.value.push(msg)
  saveMessages()
  scrollToBottom()

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'NEW_MSG', message: msg })
  }
}

// Hàm AI phân tích vấn đề bị tấn công và đưa ra giải pháp tương ứng
function generateAiAnalysis(question) {
  const q = question.toLowerCase()
  let analysis = ''
  let solution = ''
  let actionType = null
  let actionTitle = ''

  if (q.includes('brute force') || q.includes('dò mật khẩu') || q.includes('đăng nhập') || q.includes('ssh') || q.includes('login')) {
    analysis =
      `[PHÂN TÍCH HÌNH THỨC TẤN CÔNG]\n` +
      `• Kỹ thuật: Brute-force / Password Guessing (T-1110 theo MITRE ATT&CK).\n` +
      `• Cách thức: Kẻ tấn công dùng công cụ tự động (như Hydra/Medusa) bắn hàng ngàn mật khẩu vào cổng xác thực (SSH/Web Login) để dò mật khẩu tài khoản.\n` +
      `• Mối nguy: Nếu mật khẩu yếu, kẻ tấn công chiếm toàn quyền shell của máy.`
    solution =
      `[GIẢI PHÁP PHÒNG THỦ BLUE TEAM]\n` +
      `1. Đổi ngay sang mật khẩu mạnh (chữ hoa, số, ký tự đặc biệt) hoặc chuyển sang dùng SSH Key.\n` +
      `2. Kích hoạt Fail2ban / Wazuh Active-response chặn IP sau 5 lần thử sai.\n` +
      `3. Đổi cổng mặc định (vd SSH 22 -> 2222).`
    actionType = 'BLOCK_IP'
    actionTitle = 'Cách ly IP tấn công qua Tường lửa & Reset Session'
  } else if (q.includes('scan') || q.includes('quét cổng') || q.includes('nmap') || q.includes('port')) {
    analysis =
      `[PHÂN TÍCH HÌNH THỨC TẤN CÔNG]\n` +
      `• Kỹ thuật: Network Service Scanning / Port Scanning (T-1046).\n` +
      `• Cách thức: Kẻ tấn công gửi các gói tin SYN/TCP để thăm dò các cổng đang mở (Open Ports) nhằm tìm phiên bản phần mềm lỗi thời.\n` +
      `• Mối nguy: Là bước trinh sát (Reconnaissance) tiền đề trước khi tung mã độc khai thác.`
    solution =
      `[GIẢI PHÁP PHÒNG THỦ BLUE TEAM]\n` +
      `1. Đóng toàn bộ các cổng mạng chưa dùng bằng iptables / Windows Firewall.\n` +
      `2. Chặn toàn bộ IP đang quét cổng khỏi danh sách cho phép (Whitelist).\n` +
      `3. Ẩn biểu ngữ dịch vụ (Service Banners) để tránh lộ phiên bản OS.`
    actionType = 'BLOCK_IP'
    actionTitle = 'Drop toàn bộ gói tin từ IP quét cổng'
  } else if (q.includes('mã độc') || q.includes('virus') || q.includes('malware') || q.includes('shell') || q.includes('trojan')) {
    analysis =
      `[PHÂN TÍCH HÌNH THỨC TẤN CÔNG]\n` +
      `• Kỹ thuật: Command Execution & Reverse Shell (T-1059).\n` +
      `• Cách thức: Kẻ tấn công đã thực thi một tiến trình ngầm gửi kết nối về máy chủ C2 (Command & Control).\n` +
      `• Mối nguy: Dữ liệu cá nhân bị đánh cắp, máy biến thành zombie trong mạng botnet.`
    solution =
      `[GIẢI PHÁP PHÒNG THỦ BLUE TEAM]\n` +
      `1. Ngắt kết nối mạng của thiết bị ngay lập tức.\n` +
      `2. Diệt tiến trình lạ bằng Task Manager hoặc kill PID trên Linux.\n` +
      `3. Kiểm tra file toàn vẹn bằng Wazuh Syscheck (FIM).`
    actionType = 'KILL_SESSION'
    actionTitle = 'Kill toàn bộ tiến trình con & Ngắt kết nối C2'
  } else {
    analysis =
      `[PHÂN TÍCH BẤT THƯỜNG AN NINH]\n` +
      `• Hệ thống ghi nhận truy vấn dấu hiệu khả nghi từ bạn.\n` +
      `• Đánh giá: Có thể là hành vi thăm dò trái phép hoặc lỗi xác thực phân quyền.`
    solution =
      `[HƯỚNG DẪN XỬ LÝ]\n` +
      `1. Không bấm vào bất kỳ đường link lạ nào.\n` +
      `2. Nếu tình trạng nghiêm trọng, chuyển sang tab "🛡️ Chat Admin" để quản trị viên can thiệp trực tiếp.\n` +
      `3. Kích hoạt tường lửa máy trạm.`
    actionType = 'BLOCK_IP'
    actionTitle = 'Chặn kết nối khả nghi qua Firewall'
  }

  return {
    text: `${analysis}\n\n${solution}`,
    actionType,
    actionTitle,
  }
}

function sendMessage() {
  if (!inputMsg.value.trim()) return

  const userText = inputMsg.value
  const myUsername = props.currentUser?.username || 'User'

  if (props.isAdmin) {
    // Admin gửi tin nhắn riêng tới User đang chọn
    const newMsg = {
      id: Date.now(),
      recipient: targetRecipient.value,
      sender: myUsername,
      role: 'admin',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text: userText,
    }
    pushAndBroadcast(newMsg)
  } else {
    // User gửi tin nhắn
    if (userChannel.value === 'AI') {
      // 1. Gửi tin nhắn vào kênh AI
      const userMsg = {
        id: Date.now(),
        recipient: 'SOC_AI_BOT',
        sender: myUsername,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        text: userText,
      }
      pushAndBroadcast(userMsg)

      // 2. AI phản hồi phân tích tấn công + giải pháp + link chặn
      setTimeout(() => {
        const aiResult = generateAiAnalysis(userText)
        const botReply = {
          id: Date.now() + 1,
          recipient: myUsername,
          sender: 'SOC_AI_BOT',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: aiResult.text,
          actionLink: aiResult.actionType
            ? {
                type: aiResult.actionType,
                title: aiResult.actionTitle,
                executed: false,
              }
            : null,
        }
        pushAndBroadcast(botReply)
      }, 700)
    } else {
      // Gửi trực tiếp cho Admin
      const toAdminMsg = {
        id: Date.now(),
        recipient: 'ADMIN',
        sender: myUsername,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        text: userText,
      }
      pushAndBroadcast(toAdminMsg)
    }
  }

  inputMsg.value = ''
}

function sendRemediationLink(title, type) {
  const adminName = props.currentUser?.username || 'Admin'
  const newMsg = {
    id: Date.now(),
    recipient: targetRecipient.value,
    sender: adminName,
    role: 'admin',
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    text: `Admin đã gửi liên kết can thiệp an ninh trực tiếp cho bạn:`,
    actionLink: {
      type,
      title,
      executed: false,
    },
  }
  pushAndBroadcast(newMsg)
}

function executeRemediation(msg) {
  msg.actionLink.executed = true
  saveMessages()

  const systemFeedback = {
    id: Date.now() + 2,
    recipient: msg.recipient,
    sender: 'SYSTEM',
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    text: `✓ LỆNH THỰC THI THÀNH CÔNG: Đã kích hoạt [${msg.actionLink.title}]. Mối đe dọa đã được vô hiệu hóa an toàn.`,
    isSystem: true,
  }
  pushAndBroadcast(systemFeedback)
}

function handleStorageEvent(e) {
  if (e.key === STORAGE_KEY && e.newValue) {
    try {
      messages.value = JSON.parse(e.newValue)
      scrollToBottom()
      if (!isOpen.value) unreadCount.value++
    } catch (err) {}
  }
}

watch(isOpen, (val) => {
  if (val) {
    unreadCount.value = 0
    scrollToBottom()
  }
})

onMounted(() => {
  loadStoredMessages()
  if (props.isAdmin) fetchUserList()

  try {
    broadcastChannel = new BroadcastChannel('bw_soc_chat_channel_v2')
    broadcastChannel.onmessage = (e) => {
      if (e.data?.type === 'NEW_MSG') {
        loadStoredMessages()
        scrollToBottom()
        if (!isOpen.value) unreadCount.value++
      }
    }
  } catch (err) {}

  window.addEventListener('storage', handleStorageEvent)
})

onUnmounted(() => {
  if (broadcastChannel) broadcastChannel.close()
  window.removeEventListener('storage', handleStorageEvent)
})
</script>

<style scoped>
.soc-chat-wrapper {
  position: fixed;
  bottom: 24px;
  right: 28px;
  z-index: 1000;
  font-family: var(--font-ui);
}

.chat-toggle-btn {
  position: relative;
  background: linear-gradient(135deg, #0f2b48 0%, #0369a1 100%);
  border: 1px solid #22d3ee;
  color: #f8fafc;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12px;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.35);
  transition: all 0.2s ease;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.chat-beacon {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 8px #ef4444;
}

.unread-pill {
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
}

.chat-window {
  position: absolute;
  bottom: 50px;
  right: 0;
  width: 460px;
  height: 560px;
  background: rgba(6, 14, 26, 0.96);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: 6px;
  display: flex;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(34, 211, 238, 0.2);
  overflow: hidden;
}

.chat-window.admin-expanded {
  width: 700px;
}

/* User Directory (Admin) */
.user-directory-pane {
  width: 230px;
  background: rgba(4, 9, 18, 0.95);
  border-right: 1px solid rgba(34, 211, 238, 0.2);
  display: flex;
  flex-direction: column;
}

.dir-header {
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dir-title {
  font-size: 10px;
  color: #38bdf8;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.btn-refresh-users {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
}
.btn-refresh-users:hover { color: #22d3ee; }

.user-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.user-contact-item:hover {
  background: rgba(34, 211, 238, 0.08);
  border-color: rgba(34, 211, 238, 0.3);
}

.user-contact-item.active {
  background: rgba(34, 211, 238, 0.15);
  border-color: #22d3ee;
  box-shadow: inset 0 0 8px rgba(34, 211, 238, 0.2);
}

.status-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-pip.user { background: #22d3ee; box-shadow: 0 0 6px #22d3ee; }
.status-pip.admin { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

.contact-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.contact-name {
  font-size: 11px;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-meta {
  font-size: 9px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-role {
  font-size: 8px;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 1px 4px;
  border-radius: 2px;
}

/* Chat Main Pane */
.chat-main-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 10px 14px;
  background: rgba(14, 27, 45, 0.9);
  border-bottom: 1px solid rgba(34, 211, 238, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left { display: flex; align-items: center; gap: 8px; }
.online-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
}

.header-titles { display: flex; flex-direction: column; }
.header-title { font-size: 11px; color: #38bdf8; font-weight: 700; }
.active-target-label { font-size: 9.5px; color: #94a3b8; }
.target-name { color: #22d3ee; }

/* Bộ chuyển kênh User */
.user-channel-switch {
  display: flex;
  gap: 4px;
  background: rgba(4, 9, 18, 0.8);
  padding: 2px;
  border-radius: 4px;
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.channel-tab {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 10.5px;
  font-family: inherit;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.channel-tab.active {
  background: rgba(34, 211, 238, 0.2);
  color: #22d3ee;
}

.role-badge {
  font-size: 9px;
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  padding: 2px 6px;
  border-radius: 2px;
}

.quick-remediation-bar {
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.bar-title {
  font-size: 9px;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}

.remediation-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.remediation-btns button {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 9.5px;
  font-family: inherit;
  padding: 3px 8px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.remediation-btns button:hover {
  background: rgba(239, 68, 68, 0.35);
  color: #ffffff;
}

.chat-messages {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-row { display: flex; flex-direction: column; max-width: 88%; }
.message-row.self { align-self: flex-end; }
.message-row.other { align-self: flex-start; }

.msg-meta {
  display: flex;
  gap: 8px;
  font-size: 9px;
  color: #64748b;
  margin-bottom: 3px;
}
.self .msg-meta { justify-content: flex-end; }

.msg-bubble {
  padding: 9px 12px;
  border-radius: 4px;
  font-size: 11.5px;
  line-height: 1.45;
}

.self .msg-bubble {
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(14, 165, 233, 0.4);
  color: #e0f2fe;
}

.other .msg-bubble {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 190, 255, 0.15);
  color: #cbd5e1;
}

.ai-msg .msg-bubble {
  background: rgba(6, 78, 59, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #a7f3d0;
}

.system .msg-bubble {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.msg-action-card {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 10px;
  border-radius: 4px;
}

.action-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f87171;
  font-weight: 700;
  font-size: 11px;
}

.action-desc { font-size: 10px; color: #cbd5e1; margin: 6px 0; }

.action-trigger-btn {
  width: 100%;
  background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
  color: #ffffff;
  border: none;
  padding: 8px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
  transition: all 0.2s ease;
}

.action-trigger-btn:hover:not(:disabled) { filter: brightness(1.2); }
.action-trigger-btn:disabled {
  background: #1e293b;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

.chat-input-bar {
  padding: 10px;
  background: rgba(10, 20, 35, 0.95);
  border-top: 1px solid rgba(34, 211, 238, 0.2);
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #38bdf8;
  padding: 8px 10px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
}

.chat-input:focus { outline: none; border-color: #22d3ee; }

.send-btn {
  background: rgba(34, 211, 238, 0.2);
  border: 1px solid rgba(34, 211, 238, 0.4);
  color: #22d3ee;
  padding: 0 14px;
  font-family: inherit;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
}

.send-btn:hover:not(:disabled) {
  background: #22d3ee;
  color: #040914;
}
</style>