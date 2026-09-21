require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const jwt = require('jsonwebtoken');
const usersDb = require('./users');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const INDEXER_HOST = process.env.INDEXER_HOST || 'localhost';
const INDEXER_PORT = process.env.INDEXER_PORT || 9200;
const INDEXER_USER = process.env.INDEXER_USER || 'admin';
const INDEXER_PASS = process.env.INDEXER_PASS || 'admin';

const MANAGER_HOST = process.env.MANAGER_HOST || 'localhost';
const MANAGER_PORT = process.env.MANAGER_PORT || 55000;
const MANAGER_USER = process.env.MANAGER_USER || 'wazuh-wui';
const MANAGER_PASS = process.env.MANAGER_PASS || 'MyS3cr37P450r.*-';

const JWT_SECRET = process.env.JWT_SECRET || 'acf19d25d2df3391084fedada3a84891a792ee772904a8a1c2593979b1b9dee0  ';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

usersDb.ensureAdminSeed(ADMIN_USERNAME, ADMIN_PASSWORD);

const userDevicesMap = {};
const forcePasswordChangeMap = {};

const RE_USERNAME = /^[a-zA-Z0-9_]{3,20}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_PHONE_VN = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/; // số di động VN
const RE_STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validatePassword(password) {
  if (!RE_STRONG_PASSWORD.test(String(password || ''))) {
    return 'Mật khẩu cần tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
  }
  return null;
}

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*';
  
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  let pwd = pick(upper) + pick(lower) + pick(digits) + pick(special);
  const all = upper + lower + digits + special;
  for (let i = 0; i < 6; i++) pwd += pick(all);
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function signToken(user) {
  return jwt.sign({ sub: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { username: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Chỉ tài khoản admin mới có quyền truy cập mục này' });
  }
  next();
}

app.post('/api/auth/register', (req, res) => {
  const { username, email, phone, password, deviceName, ipAddress } = req.body || {};

  if (!username || !email || !phone || !password) {
    return res.status(400).json({ error: 'Vui lòng điền đủ tên đăng nhập, email, số điện thoại và mật khẩu' });
  }
  if (!RE_USERNAME.test(String(username))) {
    return res.status(400).json({ error: 'Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới, 3-20 ký tự' });
  }
  if (!RE_EMAIL.test(String(email))) {
    return res.status(400).json({ error: 'Email không đúng định dạng' });
  }
  if (!RE_PHONE_VN.test(String(phone))) {
    return res.status(400).json({ error: 'Số điện thoại không đúng định dạng (vd: 0912345678)' });
  }
  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  try {
    const user = usersDb.createUser({ username, email, phone, password, role: 'user' });
    
    userDevicesMap[user.username] = {
      deviceName: deviceName || `DESKTOP-${(user.username + '3IB1LUP').slice(0, 7).toUpperCase()}`,
      ipAddress: ipAddress || '192.168.1.105'
    };

    const token = signToken(user);
    res.json({ token, user: { username: user.username, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, type, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Thiếu thông tin đăng nhập hoặc mật khẩu' });
  }

  if (type === 'email' && !RE_EMAIL.test(String(identifier))) {
    return res.status(400).json({ error: 'Vui lòng nhập đúng định dạng email' });
  }
  if (type === 'phone' && !RE_PHONE_VN.test(String(identifier))) {
    return res.status(400).json({ error: 'Vui lòng nhập đúng định dạng số điện thoại (vd: 0912345678)' });
  }
  if ((!type || type === 'username') && !RE_USERNAME.test(String(identifier))) {
    return res.status(400).json({ error: 'Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới, 3-20 ký tự' });
  }

  const user = usersDb.findByIdentifier(identifier, type);
  if (!user || !usersDb.verifyPassword(user, password || '')) {
    return res.status(401).json({ error: 'Sai thông tin đăng nhập hoặc mật khẩu' });
  }
  const token = signToken(user);
  const mustChangePassword = !!forcePasswordChangeMap[user.username];

  res.json({
    token,
    user: {
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      mustChangePassword 
    }
  });
});

app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { newPassword } = req.body || {};
  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ error: passwordError });

  try {
    const username = req.user.username;
    if (typeof usersDb.updatePassword === 'function') {
      usersDb.updatePassword(username, newPassword);
    } else if (typeof usersDb.changePassword === 'function') {
      usersDb.changePassword(username, newPassword);
    } else {
      const user = usersDb.findByIdentifier(username, 'username');
      if (user) user.password = newPassword;
    }

    delete forcePasswordChangeMap[username];

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật mật khẩu: ' + err.message });
  }
});

// Quên mật khẩu: không cần đăng nhập, nhưng phải xác minh ĐÚNG cả 3 thông tin
// (username + email + số điện thoại) khớp với tài khoản đã đăng ký thì mới
// cho đặt mật khẩu mới — tránh việc chỉ cần biết username là đổi được mật khẩu
// người khác.
app.post('/api/auth/forgot-password', (req, res) => {
  const { username, email, phone, newPassword } = req.body || {};

  if (!username || !email || !phone || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng điền đủ tên đăng nhập, email, số điện thoại và mật khẩu mới' });
  }
  if (!RE_USERNAME.test(String(username))) {
    return res.status(400).json({ error: 'Tên đăng nhập không đúng định dạng' });
  }
  if (!RE_EMAIL.test(String(email))) {
    return res.status(400).json({ error: 'Email không đúng định dạng' });
  }
  if (!RE_PHONE_VN.test(String(phone))) {
    return res.status(400).json({ error: 'Số điện thoại không đúng định dạng' });
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const user = usersDb.findByIdentifier(username, 'username');

  // Không tiết lộ cụ thể sai ở đâu (username/email/phone) — tránh lộ thông
  // tin cho kẻ dò tìm tài khoản hợp lệ.
  const norm = (v) => String(v || '').trim().toLowerCase();
  const matched =
    user &&
    norm(user.email) === norm(email) &&
    String(user.phone || '').trim() === String(phone).trim();

  if (!matched) {
    return res.status(400).json({ error: 'Thông tin xác minh không khớp với tài khoản nào trong hệ thống' });
  }

  try {
    usersDb.updatePassword(user.username, newPassword);
    delete forcePasswordChangeMap[user.username]; // nếu trước đó đang bị ép đổi pass tạm thì gỡ luôn, vì user vừa tự đặt pass mới
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công, vui lòng đăng nhập bằng mật khẩu mới' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể đặt lại mật khẩu: ' + err.message });
  }
});

app.post('/api/scan/trigger', authMiddleware, async (req, res) => {
  try {
    const scanMust = [
      { range: { 'rule.level': { gte: 1 } } }, // Hiển thị từ level 3 trở lên để không bị trống modal
      //  { range: { timestamp: { gte: 'now-24h' } } },
    ];

    // Phân quyền cho modal Quét lỗ hổng: User thường chỉ thấy cảnh báo tấn công vào chính mình
    if (req.user.role !== 'admin') {
      scanMust.push({
        bool: {
          should: [
            { term: { 'data.dstuser.keyword': req.user.username } },
            { match: { 'data.dstuser': req.user.username } }
          ],
          minimum_should_match: 1
        }
      });
    }

    const response = await axios.post(
      `https://${INDEXER_HOST}:${INDEXER_PORT}/wazuh-alerts-*/_search`,
      {
        size: 20,
        sort: [{ timestamp: { order: 'desc' } }],
        query: {
           bool: {
             must: scanMust,
  },
},
      },
      {
        httpsAgent,
        auth: { username: INDEXER_USER, password: INDEXER_PASS },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const findings = response.data.hits.hits.map((hit) => {
      const src = hit._source;
      return {
        id: hit._id,
        timestamp: src.timestamp,
        agentName: src.agent?.name || 'unknown',
        agentIp: src.agent?.ip || '-',
        ruleId: src.rule?.id,
        ruleDescription: src.rule?.description || 'Không có mô tả',
        level: src.rule?.level || 0,
        srcIp: src.data?.srcip || null,
        targetUser: src.data?.dstuser || 'Hệ thống / Chung', // Admin thấy rõ user nào bị tấn công
      };
    });
    res.json({ scannedAt: new Date().toISOString(), findings, total: findings.length });
  } catch (err) {
    console.error('Error during scan:', err.message);
    res.status(500).json({ error: 'Không thể hoàn tất quét', detail: err.message, findings: [], total: 0 });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ---------- Người dùng tự xem/sửa thông tin cá nhân của chính mình ----------
// Đổi username/email/phone bắt buộc phải nhập đúng mật khẩu hiện tại để xác nhận.
app.get('/api/profile', authMiddleware, (req, res) => {
  const user = usersDb.findByUsername(req.user.username);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  res.json({
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
});

app.patch('/api/profile', authMiddleware, (req, res) => {
  const { field, value, currentPassword } = req.body || {};
  if (!['username', 'email', 'phone'].includes(field)) {
    return res.status(400).json({ error: 'Trường cần đổi không hợp lệ' });
  }
  if (!value || !currentPassword) {
    return res.status(400).json({ error: 'Vui lòng nhập giá trị mới và mật khẩu hiện tại để xác nhận' });
  }

  const user = usersDb.findByUsername(req.user.username);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  if (!usersDb.verifyPassword(user, currentPassword)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
  }

  try {
    if (field === 'username') {
      if (!RE_USERNAME.test(String(value))) {
        return res.status(400).json({ error: 'Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới, 3-20 ký tự' });
      }
      usersDb.updateUsername(user.username, value);
    } else if (field === 'email') {
      if (!RE_EMAIL.test(String(value))) {
        return res.status(400).json({ error: 'Email không đúng định dạng' });
      }
      usersDb.updateEmail(user.username, value);
    } else if (field === 'phone') {
      if (!RE_PHONE_VN.test(String(value))) {
        return res.status(400).json({ error: 'Số điện thoại không đúng định dạng (vd: 0912345678)' });
      }
      usersDb.updatePhone(user.username, value);
    }

    // Nếu đổi username, token JWT cũ (chứa username cũ) sẽ không còn đúng nữa
    // -> cấp lại token mới ngay để frontend không bị văng ra đăng nhập lại.
    const updatedUser = usersDb.findByUsername(field === 'username' ? value : user.username);
    const token = signToken(updatedUser);
    res.json({
      success: true,
      token,
      user: { username: updatedUser.username, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/profile/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới' });
  }

  const user = usersDb.findByUsername(req.user.username);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  if (!usersDb.verifyPassword(user, currentPassword)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ error: passwordError });
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
  }

  usersDb.updatePassword(user.username, newPassword);
  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

// ---------- Quản lý user (chỉ admin) ----------
app.get('/api/users', authMiddleware, requireAdmin, (req, res) => {
  const baseUsers = usersDb.listUsersSafe();
  const mergedUsers = baseUsers.map(u => ({
    ...u,
    deviceName: userDevicesMap[u.username]?.deviceName || null,
    ipAddress: userDevicesMap[u.username]?.ipAddress || null
  }));
  res.json({ users: mergedUsers });
});

// Reset mật khẩu tạm thời cho người dùng (Chỉ Admin)
app.post('/api/users/:username/reset-password', authMiddleware, requireAdmin, (req, res) => {
  const { username } = req.params;
  const user = usersDb.findByIdentifier(username, 'username');
  if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

  const tempPassword = generateTempPassword();

  try {
    if (typeof usersDb.updatePassword === 'function') {
      usersDb.updatePassword(username, tempPassword);
    } else if (typeof usersDb.changePassword === 'function') {
      usersDb.changePassword(username, tempPassword);
    } else if (user) {
      user.password = tempPassword;
    }

    // Bật cờ ép buộc đổi mật khẩu khi user đăng nhập bằng pass tạm này
    forcePasswordChangeMap[username] = true;

    res.json({
      success: true,
      username,
      tempPassword,
      message: `Đã cấp mật khẩu tạm cho ${username}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Không thể cấp lại mật khẩu: ' + err.message });
  }
});

app.patch('/api/users/:username/role', authMiddleware, requireAdmin, (req, res) => {
  const { role } = req.body || {};
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Role không hợp lệ' });
  try {
    usersDb.updateRole(req.params.username, role);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/users/:username', authMiddleware, requireAdmin, (req, res) => {
  if (req.params.username === req.user.username) {
    return res.status(400).json({ error: 'Không thể tự xóa chính tài khoản đang đăng nhập' });
  }
  usersDb.deleteUser(req.params.username);
  delete userDevicesMap[req.params.username];
  delete forcePasswordChangeMap[req.params.username];
  res.json({ success: true });
});

// ================= Wazuh Manager API =================
let cachedToken = null;
let tokenExpiresAt = 0;

async function getManagerToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const res = await axios.post(
    `https://${MANAGER_HOST}:${MANAGER_PORT}/security/user/authenticate`,
    {},
    { httpsAgent, auth: { username: MANAGER_USER, password: MANAGER_PASS } }
  );
  cachedToken = res.data.data.token;
  tokenExpiresAt = now + 13 * 60 * 1000;
  return cachedToken;
}

async function managerGet(path, params = {}) {
  const token = await getManagerToken();
  const res = await axios.get(`https://${MANAGER_HOST}:${MANAGER_PORT}${path}`, {
    httpsAgent,
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data.data;
}

function logManagerError(label, err) {
  if (err.response) {
    console.error(
      `${label}: HTTP ${err.response.status} từ Wazuh ->`,
      JSON.stringify(err.response.data)
    );
  } else if (err.request) {
    console.error(`${label}: không kết nối được tới ${MANAGER_HOST}:${MANAGER_PORT} ->`, err.message);
  } else {
    console.error(`${label}:`, err.message);
  }
}

// ---------- Alerts (Indexer) ----------
app.get('/api/alerts', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const minLevel = req.query.minLevel ? parseInt(req.query.minLevel) : 1;
    const agentName = req.query.agent || null;

    const must = [
      { range: { 'rule.level': { gte: minLevel } } }
    ];
    if (agentName) must.push({ wildcard: { 'agent.name': { value: `*${agentName}*`, case_insensitive: true } } });

    // Phân quyền theo vai trò người dùng:
    // User thường chỉ xem các cảnh báo nhắm tới username của chính họ.
    // Admin xem được tất cả các cảnh báo của mọi user và admin/root.
    if (req.user.role !== 'admin') {
      must.push({
        bool: {
          should: [
            { term: { 'data.dstuser.keyword': req.user.username } },
            { match: { 'data.dstuser': req.user.username } }
          ],
          minimum_should_match: 1
        }
      });
    }

    const query = must.length ? { bool: { must } } : { match_all: {} };

    const response = await axios.post(
      `https://${INDEXER_HOST}:${INDEXER_PORT}/wazuh-alerts-*/_search`,
      {
        from: (page - 1) * pageSize,
        size: pageSize,
        sort: [{ timestamp: { order: 'desc' } }],
        query,
      },
      {
        httpsAgent,
        auth: { username: INDEXER_USER, password: INDEXER_PASS },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const alerts = response.data.hits.hits.map((hit) => {
      const src = hit._source;
      return {
        id: hit._id,
        timestamp: src.timestamp,
        agentName: src.agent?.name || 'unknown',
        agentIp: src.agent?.ip || '-',
        ruleId: src.rule?.id,
        ruleDescription: src.rule?.description || 'No description',
        level: src.rule?.level || 0,
        groups: src.rule?.groups || [],
        fullLog: src.full_log || '',
        targetUser: src.data?.dstuser || 'Hệ thống / Chung', // Trả về tài khoản đích để Admin biết rõ ai bị tấn công
      };
    });

    res.json({ total: response.data.hits.total.value, page, pageSize, alerts });
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    res.status(500).json({ error: 'Không lấy được dữ liệu từ Wazuh Indexer', detail: err.message });
  }
});

app.get('/api/stats/severity', authMiddleware, async (req, res) => {
  try {
    const response = await axios.post(
      `https://${INDEXER_HOST}:${INDEXER_PORT}/wazuh-alerts-*/_search`,
      {
        size: 0,
        aggs: { by_level: { terms: { field: 'rule.level', size: 20, order: { _key: 'asc' } } } },
      },
      {
        httpsAgent,
        auth: { username: INDEXER_USER, password: INDEXER_PASS },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const buckets = response.data.aggregations.by_level.buckets.map((b) => ({
      level: b.key,
      count: b.doc_count,
    }));
    res.json(buckets);
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Không lấy được thống kê', detail: err.message });
  }
});

// ---------- Agents / Rules (Manager API) ----------
app.get('/api/agents', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const data = await managerGet('/agents', { limit: 100 });
    const agents = data.affected_items.map((a) => ({
      id: a.id,
      name: a.name,
      ip: a.ip,
      status: a.status,
      os: a.os ? `${a.os.name || ''} ${a.os.version || ''}`.trim() : 'unknown',
      lastKeepAlive: a.lastKeepAlive || null,
      version: a.version || '-',
    }));
    res.json({ total: data.total_affected_items, agents });
  } catch (err) {
    logManagerError('Error fetching agents', err);
    res.status(err.response?.status || 500).json({
      error: 'Không lấy được danh sách agent từ Manager API',
      detail: err.response?.data?.detail || err.response?.data?.message || err.message,
      upstreamStatus: err.response?.status || null,
    });
  }
});

app.get('/api/rules', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const search = req.query.search || null;
    const params = { limit: 200 };
    if (search) params.search = search;

    const data = await managerGet('/rules', params);
    const rules = data.affected_items.map((r) => ({
      id: r.id,
      description: r.description,
      level: r.level,
      groups: r.groups || [],
      filename: r.filename,
      status: r.status,
    }));
    res.json({ total: data.total_affected_items, rules });
  } catch (err) {
    logManagerError('Error fetching rules', err);
    res.status(err.response?.status || 500).json({
      error: 'Không lấy được danh sách rule từ Manager API',
      detail: err.response?.data?.detail || err.response?.data?.message || err.message,
      upstreamStatus: err.response?.status || null,
    });
  }
});

// ================= HỆ THỐNG LƯU TRỮ TIN NHẮN REAL-TIME CHO BLUE_TEAM_COMMS =================
const chatMessages = [];

app.post('/api/comms/messages', authMiddleware, (req, res) => {
  const { recipient, text, actionType, actionPayload } = req.body || {};
  if (!recipient || (!text && !actionType)) {
    return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
  }

  const newMsg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sender: req.user.username,
    recipient: recipient,
    text: text || '',
    actionType: actionType || null,
    actionPayload: actionPayload || null,
    timestamp: Date.now()
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 200) chatMessages.shift();

  res.json({ success: true, message: newMsg });
});

app.get('/api/comms/messages', authMiddleware, (req, res) => {
  const targetUser = req.query.user || req.user.username;
  const conversation = chatMessages.filter(m => 
    (m.sender === targetUser || m.recipient === targetUser) ||
    (m.sender === req.user.username && m.recipient === targetUser) ||
    (m.sender === targetUser && m.recipient === req.user.username)
  );

  res.json({ messages: conversation });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend proxy đang chạy tại http://0.0.0.0:${PORT}`);
});
