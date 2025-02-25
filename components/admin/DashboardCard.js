// components/admin/DashboardCard.js
import Skeleton from '../ui/Skeleton';

export default function DashboardCard({ title, value, icon, trend, color, subtitle, loading }) {
  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (!trend || trend === 0) return null;
    
    return trend > 0 ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-shadow hover:shadow-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 \${getColorClass()}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {loading ? <Skeleton width={50} /> : value}
              </div>
              
              {!loading && trend !== undefined && (
                <div className={`ml-2 flex items-center text-sm \${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="ml-1">{trend > 0 ? '+' : ''}{trend}%</span>
                </div>
              )}
            </dd>
            {!loading && subtitle && (
              <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}