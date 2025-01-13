// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isUser: false,
    // 기존 state
  }),
  getters: {
    // getters가 필요할 때 추가
  },
  actions: {
    // actions가 필요할 때 추가
    setUser(value) {
      this.isUser = value
    },
  },
})
