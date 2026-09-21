<template>
  <div class="home-container">
    <!-- 1. HERO BANNER -->
    <section class="hero-section">
      <div class="hero-badge">
        <span class="pulse-beacon"></span>
        <span>ENTERPRISE SOC // CYBER DEFENSE MONITORING SYSTEM</span>
      </div>
      <h1 class="hero-title">
        HỆ THỐNG GIÁM SÁT AN NINH MẠNG TẬP TRUNG
        <span class="glitch-text">& PHÒNG THỦ MÁY TRẠM</span>
      </h1>
      <p class="hero-desc">
        Giải pháp tích hợp Wazuh SIEM/XDR, thiết lập cơ chế kiểm soát truy cập dựa trên vai trò (RBAC) 
        giúp phát hiện xâm nhập thời gian thực, điều tra dấu vết số (Digital Forensics) và tự động hóa cảnh báo bảo vệ người dùng cuối.
      </p>

      <div class="hero-actions">
        <router-link to="/alerts" class="btn-primary">
          🚨 TRUNG TÂM CẢNH BÁO
        </router-link>
        <a href="#demo-video" class="btn-secondary">
          ▶️ XEM VIDEO DEMO
        </a>
      </div>

      <!-- METRICS BANNER -->
      <div class="metrics-strip">
        <div class="metric-item">
          <div class="metric-val">15</div>
          <div class="metric-lbl">MỨC ĐỘ RULE (LEVEL 1-15)</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">&lt; 1s</div>
          <div class="metric-lbl">ĐỘ TRỄ ĐẨY LOG REAL-TIME</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">RBAC</div>
          <div class="metric-lbl">CÔ LẬP DỮ LIỆU USER / ADMIN</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">100%</div>
          <div class="metric-lbl">ĐIỀU TRA IP & VECTOR THỰC TẾ</div>
        </div>
      </div>
    </section>

    <!-- 2. TÍNH NĂNG NỔI BẬT (ƯU ĐIỂM HỆ THỐNG) -->
    <section class="features-section">
      <div class="section-heading">
        <span class="hud-tag">CAPABILITIES // CORE MODULES</span>
        <h3>TÍNH NĂNG NỔI BẬT & ƯU THẾ VƯỢT TRỘI</h3>
      </div>

      <div class="feature-cards-grid">
        <div class="feature-card">
          <div class="feat-icon">🛡️</div>
          <h4>Phân Quyền Dữ Liệu Chặt Chẽ (RBAC)</h4>
          <p>
            User thường chỉ thấy các cảnh báo tấn công nhắm trực diện vào tài khoản của mình. 
            Quản trị viên (SOC Admin) nắm toàn quyền giám sát mọi thiết bị, phát hiện tức thì user đang bị xâm nhập.
          </p>
        </div>

        <div class="feature-card">
          <div class="feat-icon">⚡</div>
          <h4>Phát Hiện Tấn Công Thời Gian Thực</h4>
          <p>
            Thu thập và phân tích sự kiện log từ Wazuh Indexer (Port 9200) và API Manager (Port 55000), 
            nhận diện chính xác Brute-force SSH, dò quét cổng, và các hành vi bất thường.
          </p>
        </div>

        <div class="feature-card">
          <div class="feat-icon">🔬</div>
          <h4>Forensic & Điều Tra Pháp Chứng Số</h4>
          <p>
            Trích xuất chi tiết Source IP, Hostname tấn công, mục tiêu nhắm tới và giải mã Wazuh Raw Log Pipeline 
            giúp đánh giá mức độ nghiêm trọng và đưa ra phương án phản ứng kịp thời.
          </p>
        </div>

        <div class="feature-card">
          <div class="feat-icon">💻</div>
          <h4>Nhận Diện Máy Lạ & Kiểm Soát Phiên</h4>
          <p>
            Đối chiếu Hostname và IP máy thực tế của người dùng, tự động gắn cờ cảnh báo xâm nhập 
            nếu tài khoản được đăng nhập từ một thiết bị chưa xác thực.
          </p>
        </div>
      </div>
    </section>

    <!-- 3. KIẾN TRÚC HỆ THỐNG & DEMO VIDEO -->
    <section class="media-section" id="demo-video">
      <div class="section-heading">
        <span class="hud-tag">DEMO & ARCHITECTURE // PROOF OF CONCEPT</span>
        <h3>VIDEO TRÌNH DIỄN & QUY TRÌNH HOẠT ĐỘNG</h3>
      </div>

      <div class="media-grid">
        <!-- VIDEO DEMO EMBED / PLAYER -->
        <div class="video-box">
          <div class="video-header">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
            <span class="video-title">SOC_ATTACK_SIMULATION_DEMO.MP4</span>
          </div>
          <!-- Có thể thay bằng thẻ <video> file mp4 thực tế trong public/ hoặc nhúng Youtube iframe -->
          <div class="video-wrapper">
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Demo Video"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- SƠ ĐỒ LUỒNG DỮ LIỆU -->
        <div class="workflow-box">
          <h4 class="wf-title">LUỒNG HOẠT ĐỘNG PIPELINE:</h4>
          
          <div class="wf-step">
            <div class="wf-badge">01</div>
            <div>
              <strong>Kẻ Tấn Công Thử Nghiệm</strong>
              <p>Mô phỏng tấn công Brute-force / SSH Scan từ máy Kali Linux nhắm vào tài khoản đích.</p>
            </div>
          </div>

          <div class="wf-step">
            <div class="wf-badge">02</div>
            <div>
              <strong>Wazuh Agent & Manager Bắt Log</strong>
              <p>Rule Engine phân tích mức độ nguy hiểm (Level 1 - 15) và lưu trữ trực tiếp vào Wazuh Indexer.</p>
            </div>
          </div>

          <div class="wf-step">
            <div class="wf-badge">03</div>
            <div>
              <strong>Node.js Backend Proxy Lọc RBAC</strong>
              <p>So khớp token JWT của user với trường <code>data.dstuser</code>, ngăn lộ thông tin giữa các tài khoản.</p>
            </div>
          </div>

          <div class="wf-step">
            <div class="wf-badge">04</div>
            <div>
              <strong>SOC Dashboard Hiển Thị Trực Quan</strong>
              <p>Cập nhật nhãn mức độ LOW, MEDIUM, HIGH, CRITICAL kèm giao diện HUD cảnh báo đỏ.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { currentUser } from '../auth'
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  font-family: var(--font-ui);
  color: #f8fafc;
  padding-bottom: 40px;
}

/* 1. HERO */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, rgba(6, 18, 36, 0.95) 0%, rgba(3, 8, 19, 0.98) 100%);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 8px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(34, 211, 238, 0.05);
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 10px;
  color: #22d3ee;
  letter-spacing: 1.5px;
  margin-bottom: 18px;
}

.pulse-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  animation: radarBlink 1.4s infinite;
}

.hero-title {
  font-size: 26px;
  font-weight: 900;
  margin: 0 0 16px;
  line-height: 1.4;
  letter-spacing: 1px;
}

.glitch-text {
  display: block;
  color: #38bdf8;
  text-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
}

.hero-desc {
  max-width: 800px;
  margin: 0 auto 26px;
  font-size: 13.5px;
  line-height: 1.7;
  color: #94a3b8;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 35px;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
  padding: 10px 22px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 12px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid #38bdf8;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
}

.btn-primary:hover {
  background: #0369a1;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
}

.btn-secondary {
  background: rgba(15, 23, 42, 0.8);
  color: #cbd5e1;
  padding: 10px 22px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 12px;
  text-decoration: none;
  border: 1px solid rgba(148, 163, 184, 0.3);
  transition: all 0.2s;
}

.btn-secondary:hover {
  color: #fff;
  border-color: #cbd5e1;
}

.metrics-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  border-top: 1px dashed rgba(59, 130, 246, 0.25);
  padding-top: 24px;
}

.metric-val {
  font-size: 24px;
  font-weight: 900;
  color: #22d3ee;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
}

.metric-lbl {
  font-size: 9.5px;
  color: #64748b;
  font-weight: 700;
  margin-top: 4px;
}

/* 2. FEATURES */
.section-heading {
  margin-bottom: 20px;
}

.hud-tag {
  font-size: 10px;
  color: #38bdf8;
  letter-spacing: 1.5px;
  display: block;
}

.section-heading h3 {
  font-size: 16px;
  font-weight: 800;
  color: #f1f5f9;
  margin: 4px 0 0;
}

.feature-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.feature-card {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.9) 0%, rgba(9, 16, 26, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  padding: 22px;
  transition: transform 0.2s, border-color 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(34, 211, 238, 0.6);
}

.feat-icon {
  font-size: 26px;
  margin-bottom: 12px;
}

.feature-card h4 {
  font-size: 13.5px;
  font-weight: 800;
  color: #38bdf8;
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 11.5px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0;
}

/* 3. MEDIA & PIPELINE */
.media-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .media-grid {
    grid-template-columns: 1fr;
  }
}

.video-box {
  background: #030813;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.video-header {
  background: rgba(15, 23, 42, 0.9);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.terminal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.red { background: #ef4444; }
.yellow { background: #f59e0b; }
.green { background: #22c55e; }

.video-title {
  font-size: 10px;
  color: #94a3b8;
  margin-left: 6px;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.video-wrapper iframe,
.video-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.workflow-box {
  background: linear-gradient(180deg, rgba(13, 24, 38, 0.9) 0%, rgba(9, 16, 26, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wf-title {
  font-size: 12px;
  color: #38bdf8;
  margin: 0 0 6px;
  letter-spacing: 1px;
}

.wf-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.wf-badge {
  background: rgba(34, 211, 238, 0.15);
  border: 1px solid rgba(34, 211, 238, 0.4);
  color: #22d3ee;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.wf-step strong {
  font-size: 12px;
  color: #f1f5f9;
  display: block;
  margin-bottom: 2px;
}

.wf-step p {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.wf-step code {
  color: #38bdf8;
}

@keyframes radarBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}
</style>