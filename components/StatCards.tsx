const stats = [
  {
    label: 'Active',
    icon: 'fa-bolt',
    value: '8',
    subtext: '3 critical · 5 medium',
    badge: '+2',
    badgeColor: 'bg-[#2D405F]'
  },
  {
    label: 'Critical',
    icon: 'fa-exclamation-triangle',
    value: '3',
    subtext: '2 investigating',
    badge: null,
    badgeColor: ''
  },
  {
    label: 'Resolved today',
    icon: 'fa-check-circle',
    value: '12',
    subtext: '⌀ 24m response',
    badge: null,
    badgeColor: ''
  },
  {
    label: 'Avg duration',
    icon: 'fa-hourglass-half',
    value: '18',
    subtext: '⬇️ 3m from yesterday',
    unit: 'min',
    badge: null,
    badgeColor: ''
  }
];

export default function StatCards() {
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