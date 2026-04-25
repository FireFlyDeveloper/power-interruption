import { apiClient } from '../lib/apiClient';

export interface ReportSummary {
  totalEvents: number;
  activeCount: number;
  resolvedCount: number;
  criticalCount: number;
  avgDurationSeconds: number;
  totalAffectedCustomers: number;
}

export interface DailyBreakdown {
  date: string;
  count: number;
  critical: number;
}

export interface DeviceReport {
  deviceId: string;
  deviceName: string;
  lat?: number;
  lng?: number;
  eventCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalAffected: number;
  avgDurationSeconds: number;
  lastOutage: string;
}

export interface PeriodComparison {
  currentPeriod: { start: string; end: string };
  previousPeriod: { start: string; end: string };
  eventChange: number | null;
  criticalChange: number | null;
  previousTotal: number;
}

export interface HighFrequencyDevice {
  deviceId: string;
  deviceName: string;
  eventCount: number;
  avgDurationSeconds: number;
  lastOutage: string;
  avgIntervalDays: number | null;
}

export interface ReportData {
  generatedAt: string;
  period: { start: string; end: string; days: number };
  summary: ReportSummary;
  dailyBreakdown: DailyBreakdown[];
  topDevices: DeviceReport[];
  severityDistribution: { severity: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  periodComparison: PeriodComparison;
  deviceTimeline: DeviceReport[];
  highFrequencyDevices: HighFrequencyDevice[];
}

export interface ReportPresets {
  presetRanges: { key: string; label: string; days: number }[];
  range: { earliestDate: string | null; latestDate: string | null; totalEvents: number };
}

export const reportService = {
  async generate(startDate: string, endDate: string): Promise<ReportData> {
    return apiClient(`/api/reports/generate?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  },

  async getPresets(): Promise<ReportPresets> {
    return apiClient('/api/reports/presets');
  },
};
