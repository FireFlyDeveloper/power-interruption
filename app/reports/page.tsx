'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportService, ReportData, ReportPresets } from '@/context/services/reportService';

type ReportStatus = 'idle' | 'loading' | 'success' | 'error';

// ─── Helper: format seconds to human-readable duration ───
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

// ─── Helper: trend indicator ───
function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-500 text-sm">—</span>;
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? 'text-red-400' : isDown ? 'text-green-400' : 'text-gray-400';
  const icon = isUp ? 'fa-arrow-up' : isDown ? 'fa-arrow-down' : 'fa-minus';
  return (
    <span className={`${color} text-sm font-medium`}>
      <i className={`fas ${icon} mr-1`}></i>
      {isUp || isDown ? `${Math.abs(value)}%` : 'No change'}
    </span>
  );
}

// ─── Bar chart bar (simple inline SVG bar) ───
function SimpleBar({ value, max, label, color }: { value: number; max: number; label?: string; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const barColor = color || '#3B82F6';
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-gray-400 text-xs w-20 truncate shrink-0">{label}</span>}
      <div className="flex-1 bg-[#1F314F] rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-white text-xs font-mono w-8 text-right">{value}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [error, setError] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [presets, setPresets] = useState<ReportPresets | null>(null);

  // Date range state
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [activePreset, setActivePreset] = useState('7d');

  // Load presets on mount
  useEffect(() => {
    reportService.getPresets()
      .then(setPresets)
      .catch(() => {}); // non-critical
  }, []);

  const applyPreset = (key: string, days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 86400000);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setActivePreset(key);
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      const data = await reportService.generate(startDate, endDate);
      setReport(data);
      setStatus('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate report');
      setStatus('error');
    }
  };

  const downloadCSV = () => {
    if (!report) return;
    const rows = [
      ['Device ID', 'Device Name', 'Events', 'Critical', 'High', 'Medium', 'Low', 'Affected Customers', 'Avg Duration', 'Last Outage'],
      ...report.deviceTimeline.map(d => [
        d.deviceId, d.deviceName, d.eventCount, d.criticalCount, d.highCount,
        d.mediumCount, d.lowCount, d.totalAffected, formatDuration(d.avgDurationSeconds), d.lastOutage?.split('T')[0] || '—',
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${startDate}-to-${endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maxDayCount = report?.dailyBreakdown.length
    ? Math.max(...report.dailyBreakdown.map(d => d.count), 1)
    : 1;
  const maxSeverity = report?.severityDistribution.length
    ? Math.max(...report.severityDistribution.map(s => s.count), 1)
    : 1;
  const maxDeviceCount = report?.topDevices.length
    ? Math.max(...report.topDevices.map(d => d.eventCount), 1)
    : 1;

  const severityColors: Record<string, string> = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#EAB308',
    Low: '#22C55E',
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar pathname="/reports" />
          <main className="flex-1 overflow-y-auto thin-scroll bg-[#0C1119] px-4 sm:px-6 pb-28 md:pb-6 relative">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Reports</h1>
                <p className="text-gray-400 mt-1">Power interruption analytics and reporting</p>
              </div>
              {report && (
                <div className="flex gap-2">
                  <button onClick={downloadJSON} className="px-4 py-2 bg-[#1F314F] text-gray-200 rounded-lg text-sm font-medium hover:bg-[#2A3E5A] transition-colors">
                    <i className="fas fa-download mr-2"></i>JSON
                  </button>
                  <button onClick={downloadCSV} className="px-4 py-2 bg-[#1F314F] text-gray-200 rounded-lg text-sm font-medium hover:bg-[#2A3E5A] transition-colors">
                    <i className="fas fa-file-csv mr-2"></i>CSV
                  </button>
                </div>
              )}
            </div>

            {/* Controls panel */}
            <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Generate Report</h2>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(presets?.presetRanges || []).map(p => (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key, p.days)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activePreset === p.key
                        ? 'bg-[#1E5F4A] text-white'
                        : 'bg-[#1F314F] text-gray-300 hover:bg-[#2A3E5A]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Date inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); setActivePreset(''); }}
                    max={endDate}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => { setEndDate(e.target.value); setActivePreset(''); }}
                    min={startDate}
                    max={today}
                    className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={generateReport}
                  disabled={status === 'loading'}
                  className="px-6 py-2 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#2A4A6F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Generating...</>
                  ) : (
                    <><i className="fas fa-chart-bar mr-2"></i>Generate Report</>
                  )}
                </button>
                {error && <span className="text-red-400 text-sm">{error}</span>}
              </div>
            </div>

            {/* Report results */}
            {status === 'loading' && (
              <div className="flex items-center justify-center py-20">
                <i className="fas fa-spinner fa-spin text-4xl text-[#B6D0F5]"></i>
                <span className="ml-3 text-gray-400">Generating report...</span>
              </div>
            )}

            {status === 'success' && report && (
              <div className="space-y-6">
                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Events</p>
                    <p className="text-2xl font-bold text-white">{report.summary.totalEvents}</p>
                  </div>
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Active</p>
                    <p className="text-2xl font-bold text-[#F97316]">{report.summary.activeCount}</p>
                  </div>
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-[#22C55E]">{report.summary.resolvedCount}</p>
                  </div>
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Critical</p>
                    <p className="text-2xl font-bold text-red-400">{report.summary.criticalCount}</p>
                  </div>
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Avg Duration</p>
                    <p className="text-2xl font-bold text-white">{formatDuration(report.summary.avgDurationSeconds)}</p>
                  </div>
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Affected Customers</p>
                    <p className="text-2xl font-bold text-white">{report.summary.totalAffectedCustomers.toLocaleString()}</p>
                  </div>
                </div>

                {/* ── Period-over-Period Comparison ── */}
                <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Period Comparison</h3>
                    <span className="text-xs text-gray-500">
                      vs {report.periodComparison.previousPeriod.start} — {report.periodComparison.previousPeriod.end}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Events Change</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-white">{report.summary.totalEvents}</span>
                        <span className="text-sm text-gray-500">(prev: {report.periodComparison.previousTotal})</span>
                        <TrendBadge value={report.periodComparison.eventChange} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Critical Events Change</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-white">{report.summary.criticalCount}</span>
                        <TrendBadge value={report.periodComparison.criticalChange} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Two-column: Daily Breakdown + Severity Distribution ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily breakdown */}
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Daily Breakdown</h3>
                    {report.dailyBreakdown.length === 0 ? (
                      <p className="text-gray-500 text-sm">No events in this period</p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto thin-scroll pr-1">
                        {report.dailyBreakdown.map(d => (
                          <SimpleBar
                            key={d.date}
                            label={d.date}
                            value={d.count}
                            max={maxDayCount}
                            color={d.critical > 0 ? '#EF4444' : '#3B82F6'}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Severity distribution */}
                  <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
                    {report.severityDistribution.length === 0 ? (
                      <p className="text-gray-500 text-sm">No events in this period</p>
                    ) : (
                      <div className="space-y-3">
                        {report.severityDistribution.map(s => (
                          <div key={s.severity}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{s.severity}</span>
                              <span className="text-white font-medium">{s.count}</span>
                            </div>
                            <div className="bg-[#1F314F] rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(s.count / maxSeverity) * 100}%`,
                                  backgroundColor: severityColors[s.severity] || '#6B7280',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Top Affected Devices ── */}
                <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Affected Devices</h3>
                  {report.topDevices.length === 0 ? (
                    <p className="text-gray-500 text-sm">No events in this period</p>
                  ) : (
                    <div className="space-y-2">
                      {report.topDevices.map(d => (
                        <SimpleBar
                          key={d.deviceId}
                          label={d.deviceName}
                          value={d.eventCount}
                          max={maxDeviceCount}
                          color="#8B5CF6"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Device Timeline Table ── */}
                <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Device Timeline</h3>
                  {report.deviceTimeline.length === 0 ? (
                    <p className="text-gray-500 text-sm">No events in this period</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#273953] text-gray-400 text-xs uppercase tracking-wider">
                            <th className="text-left py-3 pr-4">Device</th>
                            <th className="text-right px-2 py-3">Events</th>
                            <th className="text-right px-2 py-3">Critical</th>
                            <th className="text-right px-2 py-3">High</th>
                            <th className="text-right px-2 py-3">Medium</th>
                            <th className="text-right px-2 py-3">Low</th>
                            <th className="text-right px-2 py-3">Affected</th>
                            <th className="text-right px-2 py-3">Avg Duration</th>
                            <th className="text-right pl-2 py-3">Last Outage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.deviceTimeline.map(d => (
                            <tr key={d.deviceId} className="border-b border-[#1F314F] hover:bg-[#1F314F]/40 transition-colors">
                              <td className="py-3 pr-4 text-white font-medium">{d.deviceName}</td>
                              <td className="text-right px-2 py-3">{d.eventCount}</td>
                              <td className="text-right px-2 py-3 text-red-400">{d.criticalCount}</td>
                              <td className="text-right px-2 py-3 text-orange-400">{d.highCount}</td>
                              <td className="text-right px-2 py-3 text-yellow-400">{d.mediumCount}</td>
                              <td className="text-right px-2 py-3 text-green-400">{d.lowCount}</td>
                              <td className="text-right px-2 py-3">{d.totalAffected?.toLocaleString() || 0}</td>
                              <td className="text-right px-2 py-3">{formatDuration(d.avgDurationSeconds)}</td>
                              <td className="text-right pl-2 py-3 text-gray-400 text-xs">{d.lastOutage?.split('T')[0] || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── High Frequency / Maintenance Due Devices ── */}
                {report.highFrequencyDevices.length > 0 && (
                  <div className="bg-[#141C28] border border-[#F97316]/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <i className="fas fa-exclamation-triangle text-orange-400"></i>
                      <h3 className="text-lg font-semibold text-white">Devices Due for Maintenance</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Devices with 5+ events in this period — may need inspection or maintenance.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#273953] text-gray-400 text-xs uppercase tracking-wider">
                            <th className="text-left py-3 pr-4">Device</th>
                            <th className="text-right px-2 py-3">Events</th>
                            <th className="text-right px-2 py-3">Avg Duration</th>
                            <th className="text-right px-2 py-3">Avg Interval</th>
                            <th className="text-right pl-2 py-3">Last Outage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.highFrequencyDevices.map(d => (
                            <tr key={d.deviceId} className="border-b border-[#1F314F] hover:bg-[#1F314F]/40 transition-colors">
                              <td className="py-3 pr-4 text-white font-medium">{d.deviceName}</td>
                              <td className="text-right px-2 py-3">{d.eventCount}</td>
                              <td className="text-right px-2 py-3">{formatDuration(d.avgDurationSeconds)}</td>
                              <td className="text-right px-2 py-3">{d.avgIntervalDays ? `~${d.avgIntervalDays}d` : '—'}</td>
                              <td className="text-right pl-2 py-3 text-gray-400 text-xs">{d.lastOutage?.split('T')[0] || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Generated timestamp */}
                <p className="text-xs text-gray-600 text-center pb-4">
                  Generated {new Date(report.generatedAt).toLocaleString()} &middot;{' '}
                  {report.period.days} day{report.period.days !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Empty state */}
            {status === 'idle' && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <i className="fas fa-chart-bar text-6xl mb-4 opacity-30"></i>
                <p className="text-lg font-medium">No report generated yet</p>
                <p className="text-sm mt-1">Select a date range above and click Generate Report</p>
              </div>
            )}

            <div className="h-24 md:h-6"></div>
          </main>
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
