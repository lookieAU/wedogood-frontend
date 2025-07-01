<template>
  <q-page class="ngo-page">
    <div class="ngo-container">
      <div class="ngo-header">
        <div class="header-content">
          <div class="header-info">
            <div class="ngo-avatar">
              <q-icon name="volunteer_activism" size="2rem" color="white" />
            </div>
            <div class="header-text">
              <h3 class="ngo-title">NGO Dashboard</h3>
              <p class="ngo-subtitle">Welcome back, {{ authStore.user?.name }}</p>
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
            <q-icon name="logout" class="q-ml-xs" color="white" />
          </q-btn>
        </div>
      </div>

      <q-card class="submit-card q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Submit Monthly Report</div>
          <q-form @submit="submitReport" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model="reportForm.ngo_id"
                  label="NGO ID"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'NGO ID is required']"
                />
              </div>
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model="reportForm.month"
                  type="date"
                  label="Report Month"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Month is required']"
                />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col-md-4 col-sm-12">
                <q-input
                  v-model.number="reportForm.people_helped"
                  type="number"
                  label="People Helped"
                  outlined
                  dense
                  min="0"
                  :rules="[(val) => val >= 0 || 'Must be a positive number']"
                />
              </div>
              <div class="col-md-4 col-sm-12">
                <q-input
                  v-model.number="reportForm.events_conducted"
                  type="number"
                  label="Events Conducted"
                  outlined
                  dense
                  min="0"
                  :rules="[(val) => val >= 0 || 'Must be a positive number']"
                />
              </div>
              <div class="col-md-4 col-sm-12">
                <q-input
                  v-model.number="reportForm.funds_utilized"
                  type="number"
                  label="Funds Utilized (₹)"
                  outlined
                  dense
                  min="0"
                  step="0.01"
                  :rules="[(val) => val >= 0 || 'Must be a positive number']"
                />
              </div>
            </div>

            <div class="row">
              <q-btn
                type="submit"
                label="Submit Report"
                color="primary"
                :loading="functionStore.loading"
              />
              <q-btn label="Clear" color="grey" flat @click="clearForm" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">Bulk Upload Reports (CSV)</div>
          <div class="q-mb-md">
            <q-file
              v-model="csvFile"
              label="Select CSV File"
              outlined
              accept=".csv"
              max-file-size="10485760"
              @rejected="onRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>

          <div class="row q-gutter-sm">
            <q-btn
              label="Upload CSV"
              color="secondary"
              @click="uploadCSV"
              :loading="functionStore.loading"
              :disable="!csvFile"
            />
            <q-btn label="Download Sample CSV" color="info" outline @click="downloadSampleCSV" />
          </div>

          <div v-if="functionStore.jobStatus" class="q-mt-md">
            <q-card class="bg-grey-1">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Upload Progress</div>
                <q-linear-progress
                  :value="functionStore.jobStatus.progress / 100"
                  color="primary"
                  size="20px"
                  class="q-mb-sm"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge
                      color="white"
                      text-color="primary"
                      :label="`${functionStore.jobStatus.progress}%`"
                    />
                  </div>
                </q-linear-progress>

                <div class="row items-center justify-between">
                  <div>
                    <q-chip
                      :color="getStatusColor(functionStore.jobStatus.status)"
                      text-color="white"
                      :label="functionStore.jobStatus.status.toUpperCase()"
                    />
                  </div>
                  <div v-if="functionStore.jobStatus.message" class="text-caption">
                    {{ functionStore.jobStatus.message }}
                  </div>
                </div>

                <div
                  class="q-mt-sm"
                  v-if="
                    functionStore.jobStatus.status === 'completed' ||
                    functionStore.jobStatus.status === 'failed'
                  "
                >
                  <q-btn
                    label="Clear Status"
                    size="sm"
                    flat
                    color="grey"
                    @click="functionStore.clearJobStatus()"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">My Reports</div>
            <q-btn
              label="Refresh"
              color="primary"
              outline
              size="sm"
              @click="fetchMyReports"
              :loading="functionStore.loading"
            />
          </div>

          <div v-if="myReports.length === 0 && !functionStore.loading" class="text-center q-pa-lg">
            <q-icon name="description" size="4rem" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">No reports found</div>
            <div class="text-body2 text-grey-5">Submit your first report using the form above</div>
          </div>

          <div v-else class="row q-gutter-md">
            <div v-for="report in myReports" :key="report._id" class="col-md-4 col-sm-6 col-xs-12">
              <q-card class="report-card">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">
                    {{ formatReportMonth(report.month) }}
                  </div>
                  <div class="text-caption text-grey-6 q-mb-md">NGO ID: {{ report.ngo_id }}</div>

                  <div class="q-gutter-xs">
                    <div class="row items-center">
                      <q-icon name="people" color="blue" size="sm" class="q-mr-xs" />
                      <span class="text-body2"
                        >{{ report.people_helped.toLocaleString() }} people helped</span
                      >
                    </div>
                    <div class="row items-center">
                      <q-icon name="event" color="green" size="sm" class="q-mr-xs" />
                      <span class="text-body2"
                        >{{ report.events_conducted.toLocaleString() }} events</span
                      >
                    </div>
                    <div class="row items-center">
                      <q-icon
                        name="account_balance_wallet"
                        color="orange"
                        size="sm"
                        class="q-mr-xs"
                      />
                      <span class="text-body2"
                        >₹{{ report.funds_utilized.toLocaleString() }} utilized</span
                      >
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

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
import { useFunctionStore, type ReportData } from 'src/stores/functionStore';
import { useRouter } from 'vue-router';
import { onMounted, ref, onUnmounted } from 'vue';
import { Notify } from 'quasar';

const authStore = useAuthStore();
const functionStore = useFunctionStore();
const router = useRouter();

const reportForm = ref<ReportData>({
  ngo_id: '',
  month: '',
  people_helped: 0,
  events_conducted: 0,
  funds_utilized: 0,
});

const csvFile = ref<File | null>(null);
const showMessage = ref(false);
const messageTitle = ref('');
const messageText = ref('');
const myReports = ref<any[]>([]);

onMounted(async () => {
  if (!authStore.user) {
    const success = await authStore.get();
    if (!success) {
      router.push({
        name: 'login',
      });
      return;
    }
  }

  if (authStore.user?.role === 1) {
    router.push({
      name: 'admin',
    });
    return;
  }

  await fetchMyReports();
});

onUnmounted(() => {
  functionStore.stopPollingJobStatus();
});

const handleLogout = async () => {
  await authStore.logout();
  router.push({
    name: 'login',
  });
};

const submitReport = async () => {
  const reportData = {
    ...reportForm.value,
    month: new Date(reportForm.value.month).toISOString(),
  };

  const result = await functionStore.submitReport(reportData);

  if (result.success) {
    Notify.create({
      type: 'positive',
      message: result.message || 'Report submitted successfully',
      position: 'top-right',
    });
    clearForm();
    await fetchMyReports();
  } else {
    showMessageDialog('Error', result.message || 'Failed to submit report');
  }
};

const clearForm = () => {
  reportForm.value = {
    ngo_id: '',
    month: '',
    people_helped: 0,
    events_conducted: 0,
    funds_utilized: 0,
  };
};

const uploadCSV = async () => {
  if (!csvFile.value) {
    showMessageDialog('Error', 'Please select a CSV file');
    return;
  }

  const result = await functionStore.uploadCSVReport(csvFile.value);

  if (result.success) {
    Notify.create({
      type: 'positive',
      message: result.message || 'CSV upload started successfully',
      position: 'top-right',
    });
    csvFile.value = null;
  } else {
    showMessageDialog('Error', result.message || 'Failed to upload CSV');
  }
};

const onRejected = (rejectedEntries: any[]) => {
  const reasons = rejectedEntries.map((entry) => entry.failedPropValidation).join(', ');
  showMessageDialog('File Rejected', `File was rejected: ${reasons}`);
};

const downloadSampleCSV = () => {
  const csvContent = `ngo_id,month,people_helped,events_conducted,funds_utilized
NGO001,2024-01-01,100,5,50000.00
NGO002,2024-01-01,150,8,75000.50`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_reports.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'failed':
      return 'red';
    case 'processing':
      return 'blue';
    default:
      return 'grey';
  }
};

const fetchMyReports = async () => {
  const result = await functionStore.getMyReports();

  if (result.success) {
    myReports.value = result.data || [];
  } else {
    showMessageDialog('Error', result.message || 'Failed to fetch reports');
  }
};

const formatReportMonth = (monthStr: string) => {
  const date = new Date(monthStr);
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

const showMessageDialog = (title: string, text: string) => {
  messageTitle.value = title;
  messageText.value = text;
  showMessage.value = true;
};
</script>

<style scoped>
.ngo-page {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  min-height: 100vh;
}

.ngo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.ngo-header {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
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

.ngo-avatar {
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

.ngo-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
  color: white;
}

.ngo-subtitle {
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

/* Card Styling */
.submit-card,
.q-card {
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: white;
  transition: all 0.3s ease;
}

.submit-card:hover,
.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.q-card-section {
  padding: 25px;
}

.text-h6 {
  color: #2e7d32;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-h6::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 2px;
}

/* Form Styling */
.q-form .q-input {
  margin-bottom: 15px;
}

.q-form .q-btn {
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;
}

.q-form .q-btn[type='submit'] {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.q-form .q-btn[type='submit']:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* File Upload Styling */
.q-file {
  border-radius: 10px;
}

.q-file .q-field__control {
  border-radius: 10px;
}

/* Progress Card Styling */
.bg-grey-1 {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%) !important;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.q-linear-progress {
  border-radius: 10px;
  overflow: hidden;
}

.q-chip {
  font-weight: 600;
  border-radius: 20px;
}

/* Report Cards Styling */
.report-card {
  border-radius: 15px;
  transition: all 0.3s ease;
  border: 1px solid rgba(76, 175, 80, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  position: relative;
  overflow: hidden;
}

.report-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.3);
}

.report-card .text-subtitle1 {
  color: #2e7d32;
  font-weight: 600;
}

.report-card .text-caption {
  color: #757575;
  font-weight: 500;
}

.report-card .text-body2 {
  color: #424242;
  font-weight: 500;
}

.report-card .q-icon {
  margin-right: 8px;
}

/* Empty State Styling */
.text-center .q-icon {
  opacity: 0.3;
}

.text-h6.text-grey-6 {
  color: #757575 !important;
  font-weight: 500;
}

.text-body2.text-grey-5 {
  color: #9e9e9e !important;
}

/* Button Styling */
.q-btn {
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;
}

.q-btn[color='secondary'] {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.q-btn[color='secondary']:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.q-btn[color='info'] {
  border-color: #2196f3;
  color: #2196f3;
}

.q-btn[color='info']:hover {
  background: rgba(33, 150, 243, 0.1);
  transform: translateY(-2px);
}

/* Dialog Styling */
.q-dialog .q-card {
  border-radius: 15px;
  min-width: 300px;
}

.q-dialog .text-h6 {
  color: #2e7d32;
  font-weight: 600;
}

.q-dialog .text-h6::before {
  display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .ngo-container {
    padding: 15px;
  }

  .ngo-header {
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

  .ngo-avatar {
    width: 60px;
    height: 60px;
  }

  .ngo-title {
    font-size: 1.5rem;
  }

  .ngo-subtitle {
    font-size: 1rem;
  }

  .q-card-section {
    padding: 20px;
  }

  .row.q-gutter-md > div {
    margin-bottom: 15px;
  }
}

@media (max-width: 480px) {
  .ngo-container {
    padding: 10px;
  }

  .ngo-header {
    padding: 15px;
  }

  .ngo-title {
    font-size: 1.3rem;
  }

  .q-card-section {
    padding: 15px;
  }

  .q-form .q-btn {
    width: 100%;
    margin-bottom: 10px;
  }

  .row.q-gutter-sm {
    flex-direction: column;
  }

  .row.q-gutter-sm .q-btn {
    width: 100%;
    margin-bottom: 10px;
  }
}

/* Animation for cards */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.q-card {
  animation: slideInUp 0.6s ease-out;
}

.report-card:nth-child(1) {
  animation-delay: 0.1s;
}
.report-card:nth-child(2) {
  animation-delay: 0.2s;
}
.report-card:nth-child(3) {
  animation-delay: 0.3s;
}
.report-card:nth-child(4) {
  animation-delay: 0.4s;
}
</style>
