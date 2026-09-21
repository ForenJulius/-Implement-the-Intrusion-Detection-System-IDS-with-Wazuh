// Lưu user vào file JSON đơn giản (đủ dùng cho đồ án, không cần database thật)
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

function readUsers() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function writeUsers(users) {
  ensureDataFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function norm(v) {
  return String(v || '').trim().toLowerCase();
}

function findByUsername(username) {
  return readUsers().find((u) => norm(u.username) === norm(username));
}

function findByEmail(email) {
  return readUsers().find((u) => norm(u.email) === norm(email));
}

function findByPhone(phone) {
  return readUsers().find((u) => u.phone === String(phone || '').trim());
}

// identifier: có thể là username, email, hoặc số điện thoại. `type` cho biết
// người dùng đã chọn loại nào ở màn hình login, để tra đúng field (tránh
// trường hợp gõ số điện thoại nhưng lại được đem so khớp với cột username...).
function findByIdentifier(identifier, type) {
  if (type === 'email') return findByEmail(identifier);
  if (type === 'phone') return findByPhone(identifier);
  return findByUsername(identifier);
}

function createUser({ username, email, phone, password, role }) {
  const users = readUsers();
  if (users.find((u) => norm(u.username) === norm(username))) {
    throw new Error('Tên đăng nhập đã tồn tại');
  }
  if (email && users.find((u) => norm(u.email) === norm(email))) {
    throw new Error('Email này đã được đăng ký');
  }
  if (phone && users.find((u) => u.phone === String(phone).trim())) {
    throw new Error('Số điện thoại này đã được đăng ký');
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    username: String(username).trim(),
    email: email ? String(email).trim() : null,
    phone: phone ? String(phone).trim() : null,
    passwordHash,
    role: role || 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.passwordHash);
}

// Tự động tạo tài khoản admin đầu tiên nếu chưa có, dựa theo .env
function ensureAdminSeed(adminUsername, adminPassword) {
  if (!adminUsername || !adminPassword) return;
  const existing = findByUsername(adminUsername);
  if (!existing) {
    createUser({ username: adminUsername, password: adminPassword, role: 'admin' });
    console.log(`Đã tạo tài khoản admin mặc định: ${adminUsername}`);
  }
}

function listUsersSafe() {
  return readUsers().map(({ username, email, phone, role, createdAt }) => ({
    username,
    email,
    phone,
    role,
    createdAt,
  }));
}

function updateRole(username, role) {
  const users = readUsers();
  const u = users.find((x) => norm(x.username) === norm(username));
  if (!u) throw new Error('Không tìm thấy user');
  u.role = role;
  writeUsers(users);
  return u;
}

function updatePassword(username, newPassword) {
  const users = readUsers();
  const u = users.find((x) => norm(x.username) === norm(username));
  if (!u) throw new Error('Không tìm thấy user');
  u.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeUsers(users);
  return u;
}

function updateUsername(oldUsername, newUsername) {
  const users = readUsers();
  const u = users.find((x) => norm(x.username) === norm(oldUsername));
  if (!u) throw new Error('Không tìm thấy user');
  if (
    norm(newUsername) !== norm(oldUsername) &&
    users.find((x) => norm(x.username) === norm(newUsername))
  ) {
    throw new Error('Tên đăng nhập này đã có người khác sử dụng');
  }
  u.username = String(newUsername).trim();
  writeUsers(users);
  return u;
}

function updateEmail(username, newEmail) {
  const users = readUsers();
  const u = users.find((x) => norm(x.username) === norm(username));
  if (!u) throw new Error('Không tìm thấy user');
  if (
    norm(newEmail) !== norm(u.email) &&
    users.find((x) => norm(x.email) === norm(newEmail))
  ) {
    throw new Error('Email này đã có người khác sử dụng');
  }
  u.email = String(newEmail).trim();
  writeUsers(users);
  return u;
}

function updatePhone(username, newPhone) {
  const users = readUsers();
  const u = users.find((x) => norm(x.username) === norm(username));
  if (!u) throw new Error('Không tìm thấy user');
  const normalizedNew = String(newPhone).trim();
  if (normalizedNew !== String(u.phone || '').trim() && users.find((x) => String(x.phone || '').trim() === normalizedNew)) {
    throw new Error('Số điện thoại này đã có người khác sử dụng');
  }
  u.phone = normalizedNew;
  writeUsers(users);
  return u;
}

function deleteUser(username) {
  const users = readUsers();
  const next = users.filter((x) => norm(x.username) !== norm(username));
  writeUsers(next);
}

module.exports = {
  readUsers,
  writeUsers,
  findByUsername,
  findByEmail,
  findByPhone,
  findByIdentifier,
  createUser,
  verifyPassword,
  updatePassword,
  updateUsername,
  updateEmail,
  updatePhone,
  ensureAdminSeed,
  listUsersSafe,
  updateRole,
  deleteUser,
};
