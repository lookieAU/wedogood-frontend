<template>
  <q-page class="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <div class="header-content">
          <div class="header-info">
            <div class="admin-avatar">
              <q-icon name="admin_panel_settings" size="2rem" color="white" />
            </div>
            <div class="header-text">
              <h3 class="admin-title">Admin Dashboard</h3>
              <p class="admin-subtitle">Welcome back, {{ authStore.user?.name }}</p>
            </div>
          </div>
          <q-btn
            label="Logout"
            color="negative"
            rounded
            no-caps
            @click="handleLogout"
            class="logout-btn"
          >
            <q-icon name="logout" class="q-ml-xs" />
          </q-btn>
        </div>
      </div>

      <q-card class="report-card q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Generate Monthly Report</div>
          <div class="row q-gutter-md items-end">
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-input
                v-model="selectedMonth"
                type="date"
                label="Select Month (YYYY-MM)"
                outlined
                dense
                mask="####-##"
                placeholder="YYYY-MM"
              />
            </div>
            <div class="col-auto">
              <q-btn
                label="Get Report"
                color="primary"
                @click="fetchReport"
                :loading="functionStore.loading"
                :disable="!selectedMonth"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="functionStore.dashboardData" class="row q-gutter-md">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                Report for {{ formatMonth(functionStore.dashboardData.month) }}
              </div>

              <div class="row q-gutter-md">
                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-card class="bg-blue-1">
                    <q-card-section class="text-center">
                      <div class="text-h4 text-blue">
                        {{ functionStore.dashboardData.summary.totalNGOsReporting }}
                      </div>
                      <div class="text-subtitle2">NGOs Reporting</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-card class="bg-green-1">
                    <q-card-section class="text-center">
                      <div class="text-h4 text-green">
                        {{ functionStore.dashboardData.summary.totalPeopleHelped.toLocaleString() }}
                      </div>
                      <div class="text-subtitle2">People Helped</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-card class="bg-orange-1">
                    <q-card-section class="text-center">
                      <div class="text-h4 text-orange">
                        {{
                          functionStore.dashboardData.summary.totalEventsConducted.toLocaleString()
                        }}
                      </div>
                      <div class="text-subtitle2">Events Conducted</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-card class="bg-purple-1">
                    <q-card-section class="text-center">
                      <div class="text-h4 text-purple">
                        ₹{{
                          functionStore.dashboardData.summary.totalFundsUtilized.toLocaleString()
                        }}
                      </div>
                      <div class="text-subtitle2">Funds Utilized</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div class="q-mt-md">
                <q-separator />
                <div class="q-mt-md text-caption text-grey-6">
                  <div>Total Reports: {{ functionStore.dashboardData.metadata.reportCount }}</div>
                  <div>
                    Date Range:
                    {{ formatDate(functionStore.dashboardData.metadata.dateRange.start) }} -
                    {{ formatDate(functionStore.dashboardData.metadata.dateRange.end) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-dialog v-model="showMessage">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ messageTitle }}</div>
          </q-card-section>
          <q-card-section>
            {{ messageText }}
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore';
import { useFunctionStore } from 'src/stores/functionStore';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { Notify } from 'quasar';

const authStore = useAuthStore();
const functionStore = useFunctionStore();
const router = useRouter();

const selectedMonth = ref('');
const showMessage = ref(false);
const messageTitle = ref('');
const messageText = ref('');

onMounted(async () => {
  if (!authStore.user) {
    const success = await authStore.get();
    if (!success) {
      router.push('/login');
      return;
    }
  }

  if (authStore.user?.role !== 1) {
    router.push('/ngo');
  }
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const fetchReport = async () => {
  if (!selectedMonth.value) {
    showMessageDialog('Error', 'Please select a month');
    return;
  }

  const monthFormatted = selectedMonth.value.substring(0, 7);
  const result = await functionStore.getDashboardReport(monthFormatted);

  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Report fetched successfully',
      position: 'top-right',
    });
  } else {
    showMessageDialog('Error', result.message || 'Failed to fetch report');
  }
};

const showMessageDialog = (title: string, text: string) => {
  messageTitle.value = title;
  messageText.value = text;
  showMessage.value = true;
};

const formatMonth = (monthStr: string) => {
  const date = new Date(monthStr + '-01');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
.admin-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.header-text {
  flex: 1;
}

.admin-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
  color: white;
}

.admin-subtitle {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.logout-btn {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-2px);
}

.report-card {
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: white;
}

.report-card .q-card-section {
  padding: 25px;
}

.report-card .text-h6 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 20px;
}

.report-card .q-input {
  margin-bottom: 0;
}

.report-card .q-btn {
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  text-transform: none;
}

/* Stats Cards Styling */
.row .q-card {
  border-radius: 15px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.row .q-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.bg-blue-1 {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
}

.bg-green-1 {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%) !important;
}

.bg-orange-1 {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%) !important;
}

.bg-purple-1 {
  background: linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%) !important;
}

.text-h4 {
  font-weight: 700;
  margin-bottom: 8px;
}

.text-subtitle2 {
  font-weight: 500;
  opacity: 0.8;
}

/* Report Results Card */
.col-12 .q-card {
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.col-12 .q-card .text-h6 {
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

/* Dialog Styling */
.q-dialog .q-card {
  border-radius: 15px;
  min-width: 300px;
}

.q-dialog .text-h6 {
  color: #2c3e50;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-container {
    padding: 15px;
  }

  .admin-header {
    padding: 20px;
    border-radius: 15px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-info {
    flex-direction: column;
    text-align: center;
  }

  .admin-avatar {
    width: 60px;
    height: 60px;
  }

  .admin-title {
    font-size: 1.5rem;
  }

  .admin-subtitle {
    font-size: 1rem;
  }

  .report-card .q-card-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .admin-container {
    padding: 10px;
  }

  .admin-header {
    padding: 15px;
  }

  .admin-title {
    font-size: 1.3rem;
  }

  .report-card .q-card-section {
    padding: 15px;
  }

  .row .q-card .q-card-section {
    padding: 15px;
  }

  .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
