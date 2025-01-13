// src/utils/validators.js

/**
 * 이메일 유효성 검사
 * @param {string} email - 검사할 이메일 주소
 * @returns {boolean} 유효성 검사 결과
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 유효성 검사
 * - 8자 이상
 * - 영문, 숫자, 특수문자 조합
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 유효성 검사 결과
 */
export const validatePassword = (password) => {
  // 최소 8자, 영문, 숫자, 특수문자 포함
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * 닉네임 유효성 검사
 * - 2자 이상 10자 이하
 * - 한글, 영문, 숫자만 허용
 * @param {string} nickname - 검사할 닉네임
 * @returns {boolean} 유효성 검사 결과
 */
export const validateNickName = (nickname) => {
  // 2-10자, 한글/영문/숫자만
  const nicknameRegex = /^[가-힣A-Za-z0-9]{2,10}$/
  return nicknameRegex.test(nickname)
}
