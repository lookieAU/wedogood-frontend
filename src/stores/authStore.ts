import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

interface User {
  _id: string;
  name: string;
  role: number;
}

const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    async login(username: string) {
      try {
        const res = await api.post('/user/login', {
          name: username,
        });
        localStorage.setItem('wedogood_token_1', res.data.data);
        return true;
      } catch (e) {
        return false;
      }
    },

    async get() {
      try {
        const res = await api.get('/user/get');
        this.user = res.data.data;
        return true;
      } catch (e) {
        return false;
      }
    },

    async logout() {
      localStorage.removeItem('wedogood_token_1');
    },
  },
});

export { type User, useAuthStore };
