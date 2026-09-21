// Validate định dạng dùng chung cho Login / Register

export const RE_USERNAME = /^[a-zA-Z0-9_]{3,20}$/
export const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Số di động Việt Nam, chấp nhận 0xxxxxxxxx hoặc +84xxxxxxxxx
export const RE_PHONE_VN = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/

export function isValidUsername(v) {
  return RE_USERNAME.test(String(v || '').trim())
}
export function isValidEmail(v) {
  return RE_EMAIL.test(String(v || '').trim())
}
export function isValidPhone(v) {
  return RE_PHONE_VN.test(String(v || '').trim())
}

/**
 * Tính độ mạnh mật khẩu, trả về { score, label, color, percent }
 * score: 0 (rất yếu) -> 4 (rất mạnh)
 */
export function passwordStrength(password) {
  const pwd = String(password || '')
  const rules = {
    length8: pwd.length >= 8,
    length12: pwd.length >= 12,
    lower: /[a-z]/.test(pwd),
    upper: /[A-Z]/.test(pwd),
    digit: /\d/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  }

  if (!pwd) {
    return { score: 0, label: '', color: '#7d8ba1', percent: 0, rules }
  }

  let score = 0
  if (rules.length8) score++
  if (rules.lower && rules.upper) score++
  if (rules.digit) score++
  if (rules.special) score++
  if (rules.length12 && score >= 3) score++ // thưởng thêm cho mật khẩu dài + đủ loại ký tự

  const levels = [
    { label: 'Rất yếu', color: '#ef4444' },
    { label: 'Yếu', color: '#f59e0b' },
    { label: 'Trung bình', color: '#eab308' },
    { label: 'Mạnh', color: '#22d3ee' },
    { label: 'Rất mạnh', color: '#22c55e' },
  ]
  const clamped = Math.min(score, 4)
  return {
    score: clamped,
    label: levels[clamped].label,
    color: levels[clamped].color,
    percent: (clamped / 4) * 100,
    rules,
  }
}

// Mật khẩu được coi là "đủ điều kiện" để đăng ký: tối thiểu 8 ký tự,
// có chữ hoa, chữ thường, số, và ký tự đặc biệt (khớp với rule bên backend).
export function isPasswordEligible(password) {
  const { rules } = passwordStrength(password)
  return !!(rules.length8 && rules.lower && rules.upper && rules.digit && rules.special)
}
