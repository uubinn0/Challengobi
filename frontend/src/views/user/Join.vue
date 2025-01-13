<template>
  <div class="user join wrapC">
    <h1>가입하기</h1>
    <form @submit.prevent="handleSubmit" class="form-wrap">
      <!-- 닉네임 입력 -->
      <div class="input-with-label">
        <input
          v-model="formData.nickName"
          :class="{ error: errors.nickName }"
          id="nickname"
          type="text"
          placeholder="닉네임을 입력하세요."
          @blur="validateField('nickName')"
        />
        <label for="nickname">닉네임</label>
        <span v-if="errors.nickName" class="error-message">{{ errors.nickName }}</span>
      </div>

      <!-- 이메일 입력 -->
      <div class="input-with-label">
        <input
          v-model="formData.email"
          :class="{ error: errors.email }"
          id="email"
          type="email"
          placeholder="이메일을 입력하세요."
          @blur="validateField('email')"
        />
        <label for="email">이메일</label>
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <!-- 비밀번호 입력 -->
      <div class="input-with-label">
        <input
          v-model="formData.password"
          :class="{ error: errors.password }"
          id="password"
          :type="passwordFields.type"
          placeholder="비밀번호를 입력하세요."
          @blur="validateField('password')"
        />
        <label for="password">비밀번호</label>
        <button type="button" class="toggle-password" @click="togglePasswordVisibility('password')">
          {{ passwordFields.type === 'password' ? '보기' : '숨기기' }}
        </button>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <!-- 비밀번호 확인 입력 -->
      <div class="input-with-label">
        <input
          v-model="formData.passwordConfirm"
          :class="{ error: errors.passwordConfirm }"
          id="password-confirm"
          :type="passwordFields.confirmType"
          placeholder="비밀번호를 다시한번 입력하세요."
          @blur="validateField('passwordConfirm')"
        />
        <label for="password-confirm">비밀번호 확인</label>
        <button type="button" class="toggle-password" @click="togglePasswordVisibility('confirm')">
          {{ passwordFields.confirmType === 'password' ? '보기' : '숨기기' }}
        </button>
        <span v-if="errors.passwordConfirm" class="error-message">{{
          errors.passwordConfirm
        }}</span>
      </div>

      <!-- 약관 동의 -->
      <div class="terms-section">
        <label class="terms-label">
          <input
            v-model="formData.isTerm"
            type="checkbox"
            id="term"
            @change="validateField('term')"
          />
          <span>약관을 동의합니다.</span>
        </label>
        <button type="button" class="terms-button" @click="showTerms">약관보기</button>
        <span v-if="errors.term" class="error-message">{{ errors.term }}</span>
      </div>

      <button type="submit" class="btn-bottom" :disabled="isLoading">
        {{ isLoading ? '처리중...' : '가입하기' }}
      </button>
    </form>

    <!-- 약관 팝업 -->
    <TermsModal v-if="showTermsModal" @close="showTermsModal = false" />
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import TermsModal from './TermsModal.vue'
import { validateEmail, validatePassword, validateNickName } from '@/utils/validators'

export default {
  name: 'UserJoin',

  components: {
    TermsModal,
  },

  setup() {
    const formData = reactive({
      email: '',
      password: '',
      passwordConfirm: '',
      nickName: '',
      isTerm: false,
    })

    const errors = reactive({
      email: '',
      password: '',
      passwordConfirm: '',
      nickName: '',
      term: '',
    })

    const passwordFields = reactive({
      type: 'password',
      confirmType: 'password',
    })

    const isLoading = ref(false)
    const showTermsModal = ref(false)

    const validateField = (field) => {
      errors[field] = ''

      switch (field) {
        case 'email':
          if (!validateEmail(formData.email)) {
            errors.email = '올바른 이메일 형식이 아닙니다.'
          }
          break
        case 'password':
          if (!validatePassword(formData.password)) {
            errors.password = '비밀번호는 8자 이상이어야 합니다.'
          }
          break
        case 'passwordConfirm':
          if (formData.password !== formData.passwordConfirm) {
            errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
          }
          break
        case 'nickName':
          if (!validateNickName(formData.nickName)) {
            errors.nickName = '닉네임은 2자 이상이어야 합니다.'
          }
          break
        case 'term':
          if (!formData.isTerm) {
            errors.term = '약관에 동의해주세요.'
          }
          break
      }
    }

    const togglePasswordVisibility = (field) => {
      if (field === 'password') {
        passwordFields.type = passwordFields.type === 'password' ? 'text' : 'password'
      } else {
        passwordFields.confirmType = passwordFields.confirmType === 'password' ? 'text' : 'password'
      }
    }

    const handleSubmit = async () => {
      // 모든 필드 유효성 검사
      ;['email', 'password', 'passwordConfirm', 'nickName', 'term'].forEach(validateField)

      // 에러가 있는지 확인
      const hasErrors = Object.values(errors).some((error) => error !== '')
      if (hasErrors) return

      isLoading.value = true
      try {
        // API 호출 로직
        // await userService.register(formData)
        // 성공 시 처리 (예: 로그인 페이지로 리다이렉트)
      } catch (error) {
        console.error('회원가입 실패:', error)
      } finally {
        isLoading.value = false
      }
    }

    const showTerms = () => {
      showTermsModal.value = true
    }

    return {
      formData,
      errors,
      passwordFields,
      isLoading,
      showTermsModal,
      validateField,
      togglePasswordVisibility,
      handleSubmit,
      showTerms,
    }
  },
}
</script>

<style lang="scss" scoped>
.error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.terms-section {
  margin: 1rem 0;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.terms-button {
  margin-left: 1rem;
  text-decoration: underline;
  cursor: pointer;
}
</style>
