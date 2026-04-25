'use client';

import { useDevices } from '@/context/DeviceContext';
import { useMemo } from 'react';

export default function StatCards() {
  const { devices, powerEvents } = useDevices();

  const stats = useMemo(() => {
    const activeEvents = powerEvents.filter(e => e.status !== 'Resolved');
    const criticalCount = powerEvents.filter(e => e.severity === 'Critical' && e.status !== 'Resolved').length;
    const mediumCount = activeEvents.length - criticalCount;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedToday = powerEvents.filter(e => {
      if (e.status !== 'Resolved') return false;
      const resolvedDate = e.endTime ? new Date(e.endTime) : null;
      return resolvedDate && resolvedDate >= today;
    });

    // Average duration of resolved events that have a duration
    const resolvedWithDuration = powerEvents.filter(e => e.status === 'Resolved' && e.duration);
    let avgDuration = 0;
    if (resolvedWithDuration.length > 0) {
      const total = resolvedWithDuration.reduce((sum, e) => {
        // Try to parse duration like "2h 30m" or "150m" or ISO period
        const match = e.duration?.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/);
        if (match) {
          const hours = parseInt(match[1] || '0');
          const mins = parseInt(match[2] || '0');
          return sum + hours * 60 + mins;
        }
        return sum;
      }, 0);
      avgDuration = Math.round(total / resolvedWithDuration.length);
    }

    return [
      {
        label: 'Active',
        icon: 'fa-bolt',
        value: String(activeEvents.length),
        subtext: `${criticalCount} critical · ${mediumCount} medium`,
        badge: null as string | null,
        badgeColor: '',
        unit: undefined as string | undefined,
      },
      {
        label: 'Critical',
        icon: 'fa-exclamation-triangle',
        value: String(criticalCount),
        subtext: `${activeEvents.length} total active`,
        badge: null as string | null,
        badgeColor: '',
        unit: undefined as string | undefined,
      },
      {
        label: 'Resolved today',
        icon: 'fa-check-circle',
        value: String(resolvedToday.length),
        subtext: `${devices.length} devices monitored`,
        badge: null as string | null,
        badgeColor: '',
        unit: undefined as string | undefined,
      },
      {
        label: 'Avg duration',
        icon: 'fa-hourglass-half',
        value: String(avgDuration),
        subtext: avgDuration > 0 ? `across ${resolvedWithDuration.length} events` : 'no data yet',
        unit: avgDuration > 0 ? 'min' : undefined,
        badge: null as string | null,
        badgeColor: '',
      },
    ];
  }, [devices, powerEvents]);

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
