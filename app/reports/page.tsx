'use client';

import AppLayout from '@/components/AppLayout';

const reportData = [
  { id: 'R-001', title: 'Daily Power Interruption Summary', date: '2024-03-12', type: 'Daily' },
  { id: 'R-002', title: 'Weekly Incident Analysis', date: '2024-03-10', type: 'Weekly' },
  { id: 'R-003', title: 'Monthly Reliability Report', date: '2024-03-01', type: 'Monthly' },
  { id: 'R-004', title: 'Grid Performance Metrics', date: '2024-02-28', type: 'Monthly' },
  { id: 'R-005', title: 'Critical Event Analysis', date: '2024-02-25', type: 'Special' },
];

export default function ReportsPage() {
  return (
    <AppLayout>
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
            <select className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white">
              <option>Daily Summary</option>
              <option>Weekly Analysis</option>
              <option>Monthly Report</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Date Range</label>
            <input 
              type="date" 
              className="w-full bg-[#1F314F] border border-[#3E5D88] rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">&nbsp;</label>
            <button className="w-full px-4 py-2 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#2A4A6F] transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="h-24 md:h-6"></div>
    </AppLayout>
  );
}
