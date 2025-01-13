<template>
  <div class="user" id="login">
    <div class="wrapC">
      <h1>
        로그인을 하고 나면
        <br />좋은 일만 있을 거예요.
      </h1>

      <form @submit.prevent="onLogin">
        <!-- 이메일 입력 -->
        <div class="input-with-label">
          <input
            v-model="formData.email"
            :class="{
              error: errors.email,
              complete: !errors.email && formData.email.length !== 0,
            }"
            id="email"
            type="email"
            placeholder="이메일을 입력하세요."
            @blur="validateField('email')"
          />
          <label for="email">이메일</label>
          <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
        </div>

        <!-- 비밀번호 입력 -->
        <div class="input-with-label">
          <input
            v-model="formData.password"
            :class="{
              error: errors.password,
              complete: !errors.password && formData.password.length !== 0,
            }"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            placeholder="비밀번호를 입력하세요."
            @blur="validateField('password')"
          />
          <label for="password">비밀번호</label>
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '숨기기' : '보기' }}
          </button>
          <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
        </div>

        <!-- 로그인 버튼 -->
        <button
          type="submit"
          class="btn btn--back btn--login"
          :disabled="!isValid || isLoading"
          :class="{ disabled: !isValid || isLoading }"
        >
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- SNS 로그인 섹션 -->
      <div class="sns-login">
        <div class="text">
          <p>SNS 간편 로그인</p>
          <div class="bar"></div>
        </div>

        <kakaoLogin :component="component" />
        <GoogleLogin :component="component" />
      </div>

      <!-- 추가 옵션 섹션 -->
      <div class="add-option">
        <div class="text">
          <p>혹시</p>
          <div class="bar"></div>
        </div>
        <div class="wrap">
          <p>비밀번호를 잊으셨나요?</p>
        </div>
        <div class="wrap">
          <p>아직 회원이 아니신가요?</p>
          <router-link to="/user/join" class="btn--text">가입하기</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { validateEmail, validatePassword } from '@/utils/validators'
import KakaoLogin from '@/components/user/snsLogin/Kakao.vue'
import GoogleLogin from '@/components/user/snsLogin/Google.vue'
import UserApi from '@/api/UserApi'

export default {
  name: 'UserLogin',

  components: {
    KakaoLogin,
    GoogleLogin,
  },

  setup() {
    const router = useRouter()
    const component = ref(null)
    const showPassword = ref(false)
    const isLoading = ref(false)

    const formData = reactive({
      email: '',
      password: '',
    })

    const errors = reactive({
      email: '',
      password: '',
    })

    // 유효성 검사 함수
    const validateField = (field) => {
      errors[field] = ''

      if (field === 'email' && !validateEmail(formData.email)) {
        errors.email = '이메일 형식이 아닙니다.'
      }

      if (field === 'password' && !validatePassword(formData.password)) {
        errors.password = '영문,숫자 포함 8자리 이상이어야 합니다.'
      }
    }

    // 폼 전체 유효성 상태 계산
    const isValid = computed(() => {
      return (
        validateEmail(formData.email) &&
        validatePassword(formData.password) &&
        !errors.email &&
        !errors.password
      )
    })

    // 로그인 처리
    const onLogin = async () => {
      if (!isValid.value || isLoading.value) return

      isLoading.value = true
      try {
        const response = await UserApi.requestLogin({
          email: formData.email,
          password: formData.password,
        })

        router.push('/main')
      } catch (error) {
        console.error('로그인 실패:', error)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      component.value = this
    })

    return {
      formData,
      errors,
      isValid,
      isLoading,
      showPassword,
      component,
      validateField,
      onLogin,
    }
  },
}
</script>

<style lang="scss" scoped>
@import '@/components/css/user.scss';

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.error-text {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.complete {
  border-color: green;
}
</style>
