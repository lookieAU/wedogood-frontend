<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-bg-decoration"></div>

      <q-card class="login-card" elevated>
        <q-card-section class="login-header">
          <div class="login-icon-wrapper">
            <q-icon name="login" size="3rem" color="primary" />
          </div>
          <div class="text-h4 text-weight-light text-center q-mt-md">Welcome Back</div>
          <div class="text-subtitle1 text-grey-6 text-center q-mt-xs">Sign in to your account</div>
        </q-card-section>

        <q-card-section class="login-form-section">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <q-input
              v-model="username"
              outlined
              label="Username"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter your username']"
              :loading="loading"
              :disable="loading"
              class="login-input"
              :hint="'Please use either ngo (or) admin as the username to login'"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <div class="q-mt-lg">
              <q-btn
                label="Sign In"
                type="submit"
                color="primary"
                class="full-width login-btn"
                size="lg"
                :loading="loading"
                :disable="loading || !username"
                no-caps
              />
            </div>

            <q-slide-transition>
              <div v-if="error" class="error-message q-mt-md">
                <q-icon name="error" class="q-mr-sm" />
                {{ error }}
              </div>
            </q-slide-transition>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (!username.value) return;

  loading.value = true;
  error.value = '';

  try {
    const success = await authStore.login(username.value);

    if (success) {
      const userFetched = await authStore.get();

      if (userFetched && authStore.user) {
        if (authStore.user.role === 1) {
          router.push('/admin');
        } else {
          router.push('/ngo');
        }
      } else {
        error.value = 'Failed to fetch user details';
      }
    } else {
      error.value = 'Invalid username. Please try again.';
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-bg-decoration {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
}

.login-card {
  border-radius: 20px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 40px 30px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.login-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.login-icon-wrapper .q-icon {
  color: white !important;
}

.login-form-section {
  padding: 30px;
}

.login-input {
  margin-bottom: 20px;
}

.login-input .q-field__control {
  border-radius: 12px;
  height: 56px;
}

.login-input .q-field__native {
  padding-left: 16px;
}

.login-btn {
  border-radius: 12px;
  height: 56px;
  font-weight: 600;
  text-transform: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #f44336;
  display: flex;
  align-items: center;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 600px) {
  .login-container {
    padding: 15px;
  }

  .login-card {
    border-radius: 15px;
  }

  .login-header {
    padding: 30px 20px 15px;
  }

  .login-form-section {
    padding: 20px;
  }

  .login-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .login-icon-wrapper .q-icon {
    font-size: 2rem;
  }
}

@media (max-width: 400px) {
  .login-container {
    padding: 10px;
  }

  .login-header {
    padding: 25px 15px 10px;
  }

  .login-form-section {
    padding: 15px;
  }
}
</style>
