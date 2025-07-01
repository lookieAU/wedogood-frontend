<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-h6 q-mt-md">Loading...</div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (await authStore.get()) {
    if (authStore.user?.role === 1) {
      // Admin
      router.push({
        name: 'admin',
      });
    } else {
      // NGO
      router.push({
        name: 'ngo',
      });
    }
  } else {
    // Login
    router.push({
      name: 'login',
    });
  }
});
</script>
