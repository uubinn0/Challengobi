<template>
  <div class="wrap components-page">
    <div class="wrapB">
      <h1>Style Component</h1>

      <!-- Form Components Section -->
      <section class="component-section">
        <h2>Form</h2>
        <div class="wrap">
          <InputComponent
            v-model="formData.email"
            :error-text="errors.email"
            placeholder="이메일을 입력해주세요."
            label="이메일"
            @update:modelValue="handleInput('email', $event)"
          />

          <InputComponent
            v-model="formData.password"
            :error-text="errors.password"
            placeholder="비밀번호를 입력해주세요."
            label="비밀번호"
            type="password"
          />

          <TextareaComponent
            v-model="formData.contents"
            placeholder="의견을 적어주세요."
            label="게시하기"
            :maxlength="300"
          />

          <SelectComponent v-model="formData.selectedOption" :options="selectOptions" />

          <CheckboxComponent v-model="formData.agree" label="약관에 동의합니다." />
        </div>
      </section>

      <!-- Switch Section -->
      <section class="component-section">
        <h2>Switch</h2>
        <div class="wrap">
          <SwitchComponent v-model="formData.switchState" />
        </div>
      </section>

      <!-- Button Section -->
      <section class="component-section">
        <h2>Button</h2>
        <div class="wrap">
          <LargeButton text="내 큐레이션에 추가" :is-background="true" @click="handleCurationAdd" />
          <LargeButton text="내 큐레이션에 추가" :is-background="false" />
          <SmallButton text="승인" :is-background="true" />
          <SmallButton text="거절" :is-background="false" />
          <HalfButton :buttons="actionButtons" />
        </div>
      </section>

      <!-- Header Section -->
      <section class="component-section">
        <h2>Header</h2>
        <div class="wrap">
          <HeaderComponent v-for="(header, index) in headerConfigs" :key="index" v-bind="header" />
        </div>
      </section>

      <!-- Tab Section -->
      <section class="component-section">
        <h2>Tab</h2>
        <div class="wrap">
          <TabComponent
            v-for="tab in tabConfigs"
            :key="tab.id"
            v-bind="tab"
            @click="handleTabClick(tab.id)"
          />
        </div>
      </section>

      <!-- Keyword Section -->
      <section class="component-section">
        <h2>Keyword</h2>
        <div class="wrap">
          <KeywordDelComponent keyword-title="서비스" @delete="handleKeywordDelete" />
          <KeywordAddComponent @add="handleKeywordAdd" />
        </div>
      </section>

      <!-- Curation Section -->
      <section class="component-section">
        <h2>Curation</h2>
        <div class="wrap">
          <CurationComponent curation-title="내 큐레이션" />
        </div>
      </section>

      <!-- Toast Section -->
      <section class="component-section">
        <h2>Toast</h2>
        <div class="wrap">
          <ToastComponent v-for="toast in toastConfigs" :key="toast.id" v-bind="toast" />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import InputComponent from '@/components/common/Input.vue'
import TextareaComponent from '@/components/common/Textarea.vue'
import LargeButton from '@/components/common/ButtonLarge.vue'
import SmallButton from '@/components/common/ButtonSmall.vue'
import HalfButton from '@/components/common/ButtonHalf.vue'
import SelectComponent from '@/components/common/Select.vue'
import CheckboxComponent from '@/components/common/Checkbox.vue'
import SwitchComponent from '@/components/common/Switch.vue'
import HeaderComponent from '@/components/common/Header.vue'
import TabComponent from '@/components/common/Tab.vue'
import KeywordDelComponent from '@/components/common/KeywordDel.vue'
import KeywordAddComponent from '@/components/common/KeywordAdd.vue'
import CurationComponent from '@/components/common/Curation.vue'
import ToastComponent from '@/components/common/Toast.vue'

export default defineComponent({
  name: 'StyleComponents',

  components: {
    InputComponent,
    TextareaComponent,
    LargeButton,
    SmallButton,
    HalfButton,
    SelectComponent,
    CheckboxComponent,
    SwitchComponent,
    HeaderComponent,
    TabComponent,
    KeywordDelComponent,
    KeywordAddComponent,
    CurationComponent,
    ToastComponent,
  },

  setup() {
    const formData = reactive({
      email: '',
      password: '',
      contents: '',
      selectedOption: '',
      agree: false,
      switchState: false,
    })

    const errors = reactive({
      email: '',
      password: '',
    })

    const selectOptions = [
      { value: 'option1', title: '옵션1' },
      { value: 'option2', title: '옵션2' },
    ]

    const actionButtons = [
      {
        title: '확인',
        highlight: true,
        onClick: () => handleAction('confirm'),
      },
      {
        title: '취소',
        onClick: () => handleAction('cancel'),
      },
    ]

    const headerConfigs = [
      { headerTitle: '헤더 타이틀', isSearch: true },
      { headerTitle: '헤더 타이틀', isBack: true },
      { headerTitle: '헤더 타이틀', isBack: true, rightText: '저장', isDisabled: true },
      { headerTitle: '헤더 타이틀', isBack: true, rightText: '저장' },
      { headerTitle: '헤더 타이틀', isBack: true, isSearch: true },
    ]

    const tabConfigs = [
      { id: 1, tabTitle: '탭' },
      { id: 2, tabTitle: '탭', isActive: true },
      { id: 3, tabTitle: '탭', isActive: true, count: 23 },
    ]

    const toastConfigs = [
      { id: 1, toastTitle: '스크랩되었습니다.' },
      { id: 2, toastTitle: '500 Error', isError: true },
      { id: 3, toastTitle: '스킵되었습니다.', isCancel: true },
    ]

    // Event Handlers
    const handleInput = (field, value) => {
      formData[field] = value
    }

    const handleAction = (type) => {
      console.log(`${type} action clicked`)
    }

    const handleTabClick = (tabId) => {
      console.log(`Tab ${tabId} clicked`)
    }

    const handleKeywordDelete = () => {
      console.log('Keyword deleted')
    }

    const handleKeywordAdd = () => {
      console.log('Keyword added')
    }

    const handleCurationAdd = () => {
      console.log('Curation added')
    }

    return {
      formData,
      errors,
      selectOptions,
      actionButtons,
      headerConfigs,
      tabConfigs,
      toastConfigs,
      handleInput,
      handleAction,
      handleTabClick,
      handleKeywordDelete,
      handleKeywordAdd,
      handleCurationAdd,
    }
  },
})
</script>

<style lang="scss" scoped>
.component-section {
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 1rem;
  }

  .wrap {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
