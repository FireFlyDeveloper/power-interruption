'use client';

import { useDevices } from '@/context/DeviceContext';
import { useMemo } from 'react';

export default function StatCards() {
  const { devices, dashboardStats, statsLoading } = useDevices();

  const stats = useMemo(() => {
    if (statsLoading || !dashboardStats) {
      return [
        { label: 'Active', icon: 'fa-bolt', value: '...', subtext: 'loading', badge: null, badgeColor: '', unit: undefined },
        { label: 'Critical', icon: 'fa-exclamation-triangle', value: '...', subtext: 'loading', badge: null, badgeColor: '', unit: undefined },
        { label: 'Resolved today', icon: 'fa-check-circle', value: '...', subtext: 'loading', badge: null, badgeColor: '', unit: undefined },
        { label: 'Avg duration', icon: 'fa-hourglass-half', value: '...', subtext: 'loading', unit: undefined, badge: null, badgeColor: '' },
      ];
    }

    const activeCount = dashboardStats.activeCount;
    const criticalCount = dashboardStats.criticalCount;
    const avgDuration = dashboardStats.avgDuration;
    const resolvedWithDurationCount = dashboardStats.resolvedWithDurationCount;

    return [
      {
        label: 'Active',
        icon: 'fa-bolt',
        value: String(activeCount),
        subtext: `${criticalCount} critical`,
        badge: null as string | null,
        badgeColor: '',
        unit: undefined as string | undefined,
      },
      {
        label: 'Critical',
        icon: 'fa-exclamation-triangle',
        value: String(criticalCount),
        subtext: `${activeCount} total active`,
        badge: null as string | null,
        badgeColor: '',
        unit: undefined as string | undefined,
      },
      {
        label: 'Resolved today',
        icon: 'fa-check-circle',
        value: String(dashboardStats.resolvedToday),
        subtext: `${devices.length} devices monitored`,
        badge: null as string | null,
        badgeColor: '',
        unit: undefined as string | undefined,
      },
      {
        label: 'Avg duration',
        icon: 'fa-hourglass-half',
        value: String(avgDuration),
        subtext: avgDuration > 0 ? `across ${resolvedWithDurationCount} events` : 'no data yet',
        unit: avgDuration > 0 ? 'min' : undefined,
        badge: null as string | null,
        badgeColor: '',
      },
    ];
  }, [devices, dashboardStats, statsLoading]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-5">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[#101C2A] border border-[#2E405B] shadow-[0_8px_16px_-8px_rgba(0,0,0,0.6)] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-400 text-sm uppercase tracking-wide">
            <span>
              <i className={`fas ${stat.icon} mr-1 text-gray-500`}></i>
              {stat.label}
            </span>
            {stat.badge && (
              <span className={`${stat.badgeColor} px-2 py-1 rounded-full text-xs font-medium`}>
                {stat.badge}
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-[2rem] font-bold text-white mt-2 leading-tight">
            {stat.value}
            {stat.unit && <span className="text-lg font-medium text-gray-400 ml-1">{stat.unit}</span>}
          </div>
          <div className="text-sm text-gray-400 mt-2">{stat.subtext}</div>
        </div>
      ))}
    </div>
  );
}
