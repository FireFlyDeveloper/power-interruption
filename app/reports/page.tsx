'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useDevices } from '@/context/DeviceContext';

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  data?: {
    totalEvents: number;
    criticalCount: number;
    avgDuration: string;
    affectedCustomers: number;
  };
}

const reportData: Report[] = [
  { id: 'R-001', title: 'Daily Power Interruption Summary', date: '2024-03-12', type: 'Daily', data: { totalEvents: 5, criticalCount: 2, avgDuration: '25 min', affectedCustomers: 450 } },
  { id: 'R-002', title: 'Weekly Incident Analysis', date: '2024-03-10', type: 'Weekly', data: { totalEvents: 18, criticalCount: 5, avgDuration: '35 min', affectedCustomers: 1200 } },
  { id: 'R-003', title: 'Monthly Reliability Report', date: '2024-03-01', type: 'Monthly', data: { totalEvents: 42, criticalCount: 12, avgDuration: '45 min', affectedCustomers: 3500 } },
  { id: 'R-004', title: 'Grid Performance Metrics', date: '2024-02-28', type: 'Monthly', data: { totalEvents: 38, criticalCount: 10, avgDuration: '40 min', affectedCustomers: 2800 } },
  { id: 'R-005', title: 'Critical Event Analysis', date: '2024-02-25', type: 'Special', data: { totalEvents: 3, criticalCount: 3, avgDuration: '60 min', affectedCustomers: 800 } },
];

export default function ReportsPage() {
  const { powerEvents } = useDevices();
  const [selectedReportType, setSelectedReportType] = useState('Daily Summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const generateReport = () => {
    // Generate mock summary data based on selected type and date range
    const totalEvents = powerEvents.length;
    const criticalCount = powerEvents.filter(e => e.severity === 'Critical').length;
    const activeCount = powerEvents.filter(e => e.status !== 'Resolved').length;
    
    const mockReport: Report = {
      id: `R-${Date.now()}`,
      title: `${selectedReportType} Report`,
      date: new Date().toISOString().split('T')[0],
      type: selectedReportType,
      data: {
        totalEvents,
        criticalCount,
        avgDuration: `${Math.floor(Math.random() * 30 + 15)} min`,
        affectedCustomers: Math.floor(Math.random() * 2000 + 100),
      },
    };
    
    setGeneratedReport(mockReport);
    setShowReportModal(true);
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    const reportJson = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${generatedReport.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0C1119] text-gray-200 antialiased text-base">
        <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar pathname="/reports" />
        
        <main className="flex-1 overflow-y-auto thin-scroll bg-[#0C1119] px-4 sm:px-6 pb-28 md:pb-6 relative">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 mt-1">View and download power interruption reports</p>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportData.map((report) => (
          <div 
            key={report.id}
            className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 hover:border-[#3E5D88] transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E314A] flex items-center justify-center border border-[#46648B]">
                <i className="fas fa-file-alt text-[#B6D0F5] text-xl"></i>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#1F314F] text-gray-300 border border-[#3E5D88]">
                {report.type}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
            <p className="text-sm text-gray-400">{report.date}</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-4 py-2 bg-[#1F314F] text-gray-200 rounded-lg text-sm font-medium hover:bg-[#2A3E5A] transition-colors">
                <i className="fas fa-eye mr-2"></i>View
              </button>
              <button className="px-4 py-2 bg-[#1F314F] text-gray-200 rounded-lg text-sm font-medium hover:bg-[#2A3E5A] transition-colors">
                <i className="fas fa-download"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#141C28] border border-[#273953] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Report Type</label>
            <select 
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
            >
              <option>Daily Summary</option>
              <option>Weekly Analysis</option>
              <option>Monthly Report</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={generateReport}
            className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#2A4A6F] transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="h-24 md:h-6"></div>
    </main>
  </div>

  <MobileNav />

      {/* Generated Report Modal */}
      {showReportModal && generatedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141C28] border border-[#273953] rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{generatedReport.title}</h2>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#273953] pb-3">
                <span className="text-gray-400">Report Date</span>
                <span className="text-white">{generatedReport.date}</span>
              </div>
              <div className="flex justify-between border-b border-[#273953] pb-3">
                <span className="text-gray-400">Total Events</span>
                <span className="text-white">{generatedReport.data?.totalEvents}</span>
              </div>
              <div className="flex justify-between border-b border-[#273953] pb-3">
                <span className="text-gray-400">Critical Events</span>
                <span className="text-[#F9B5B5]">{generatedReport.data?.criticalCount}</span>
              </div>
              <div className="flex justify-between border-b border-[#273953] pb-3">
                <span className="text-gray-400">Average Duration</span>
                <span className="text-white">{generatedReport.data?.avgDuration}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-gray-400">Affected Customers</span>
                <span className="text-white">{generatedReport.data?.affectedCustomers?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-6 py-2 bg-[#3D4F5F] text-white rounded-lg font-medium hover:bg-[#4D5F6F] transition-colors"
              >
                Close
              </button>
              <button 
                onClick={downloadReport}
                className="flex-1 px-6 py-2 bg-[#1E5F4A] text-white rounded-lg font-medium hover:bg-[#2A7A5F] transition-colors"
              >
                <i className="fas fa-download mr-2"></i>
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
