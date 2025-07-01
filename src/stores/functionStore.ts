import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

interface DashboardData {
  month: string;
  summary: {
    totalNGOsReporting: number;
    totalPeopleHelped: number;
    totalEventsConducted: number;
    totalFundsUtilized: number;
  };
  metadata: {
    reportCount: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

interface ReportData {
  ngo_id: string;
  month: string;
  people_helped: number;
  events_conducted: number;
  funds_utilized: number;
}

interface JobStatus {
  job_id: string;
  progress: number;
  status: string;
  csv_file: string;
  message?: string;
}

const useFunctionStore = defineStore('functionStore', {
  state: () => ({
    dashboardData: null as DashboardData | null,
    loading: false,
    jobStatus: null as JobStatus | null,
    pollingInterval: null as NodeJS.Timeout | null,
  }),

  actions: {
    async getDashboardReport(month: string) {
      this.loading = true;
      try {
        const res = await api.get('/dashboard', {
          params: { month },
        });

        if (res.data.success) {
          this.dashboardData = res.data.data;
          return { success: true, data: res.data.data };
        } else {
          return { success: false, message: res.data.message };
        }
      } catch (error: any) {
        console.error('Error fetching dashboard report:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to fetch dashboard report',
        };
      } finally {
        this.loading = false;
      }
    },

    async submitReport(reportData: ReportData) {
      this.loading = true;
      try {
        const res = await api.post('/reports', reportData);

        if (res.data.success) {
          return { success: true, data: res.data.data, message: res.data.message };
        } else {
          return { success: false, message: res.data.message };
        }
      } catch (error: any) {
        console.error('Error submitting report:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to submit report',
        };
      } finally {
        this.loading = false;
      }
    },

    async uploadCSVReport(file: File) {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('csvFile', file);

        const res = await api.post('/reports/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res.data.success) {
          const jobId = res.data.job_id;
          this.startPollingJobStatus(jobId);
          return { success: true, job_id: jobId, message: res.data.message };
        } else {
          return { success: false, message: res.data.message };
        }
      } catch (error: any) {
        console.error('Error uploading CSV:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to upload CSV file',
        };
      } finally {
        this.loading = false;
      }
    },

    async getJobStatus(jobId: string) {
      try {
        const res = await api.get(`/job-status/${jobId}`);

        if (res.data.success) {
          this.jobStatus = res.data.data;
          return { success: true, data: res.data.data };
        } else {
          return { success: false, message: res.data.message };
        }
      } catch (error: any) {
        console.error('Error fetching job status:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to fetch job status',
        };
      }
    },

    startPollingJobStatus(jobId: string) {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }

      this.pollingInterval = setInterval(async () => {
        const result = await this.getJobStatus(jobId);

        if (result.success && result.data) {
          const status = result.data.status;

          if (status === 'completed' || status === 'failed') {
            this.stopPollingJobStatus();
          }
        }
      }, 1000);
    },

    stopPollingJobStatus() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    clearJobStatus() {
      this.jobStatus = null;
      this.stopPollingJobStatus();
    },

    async getMyReports() {
      this.loading = true;
      try {
        const res = await api.get('/reports/my-reports');

        if (res.data.success) {
          return { success: true, data: res.data.data };
        } else {
          return { success: false, message: res.data.message };
        }
      } catch (error: any) {
        console.error('Error fetching my reports:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to fetch reports',
        };
      } finally {
        this.loading = false;
      }
    },
  },
});

export { type DashboardData, type ReportData, type JobStatus, useFunctionStore };
