// pages/admin/dashboard.js
import { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import DashboardCard from '../../components/admin/DashboardCard';
import Skeleton from '../../components/ui/Skeleton';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(...registerables);

// Custom hook for fetching dashboard data
function useDashboardData() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    completionRate: 0,
    contactRate: 0,
    todayUsers: 0,
    weeklyTrend: [],
    popularDepartments: [],
    recentChats: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard-stats', {
          headers: {
            'Cache-Control': 'no-store'
          }
        });
        
        if (!response.ok) {
          throw new Error('Veri yüklenirken bir sorun oluştu');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        setError('Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        toast.error('Dashboard verileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Auto refresh every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return { stats, loading, error };
}

export default function Dashboard({ admin }) {
  const router = useRouter();
  const { stats, loading, error } = useDashboardData();

  // Calculate trends
  const trends = useMemo(() => {
    if (!stats.weeklyTrend || stats.weeklyTrend.length === 0) return { users: 0, conversations: 0 };
    
    const lastWeek = stats.weeklyTrend[stats.weeklyTrend.length - 1];
    const previousWeek = stats.weeklyTrend[stats.weeklyTrend.length - 2] || lastWeek;
    
    const userTrend = lastWeek?.users > 0 && previousWeek?.users > 0
      ? ((lastWeek.users - previousWeek.users) / previousWeek.users) * 100
      : 0;
      
    const convTrend = lastWeek?.conversations > 0 && previousWeek?.conversations > 0
      ? ((lastWeek.conversations - previousWeek.conversations) / previousWeek.conversations) * 100
      : 0;
      
    return {
      users: Math.round(userTrend * 10) / 10,
      conversations: Math.round(convTrend * 10) / 10
    };
  }, [stats.weeklyTrend]);

  // Chart data
  const chartData = useMemo(() => {
    // User growth chart
    const userGrowthData = {
      labels: stats.userGrowth?.map(item => format(new Date(item.date), 'dd MMM', { locale: tr })) || [],
      datasets: [
        {
          label: 'Yeni Kullanıcılar',
          data: stats.userGrowth?.map(item => item.count) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Department popularity chart
    const departmentData = {
      labels: stats.popularDepartments?.slice(0, 5).map(dept => dept.name) || [],
      datasets: [
        {
          label: 'Görüntülenme Sayısı',
          data: stats.popularDepartments?.slice(0, 5).map(dept => dept.views) || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderWidth: 1
        }
      ]
    };

    // Completion rate doughnut chart
    const completionData = {
      labels: ['Tamamlanan', 'Yarım Kalan'],
      datasets: [
        {
          data: [stats.completionRate, 100 - stats.completionRate],
          backgroundColor: [
            'rgba(72, 187, 120, 0.7)',
            'rgba(237, 137, 54, 0.7)'
          ],
          borderWidth: 1
        }
      ]
    };

    return { userGrowthData, departmentData, completionData };
  }, [stats]);

  // Handle chat row click
  const handleChatClick = (chatId) => {
    router.push(`/admin/conversations/\${chatId}`);
  };

  return (
    <AdminLayout 
      admin={admin} 
      title="Dashboard" 
      description="Kullanıcı aktiviteleri ve konuşma istatistikleri"
    >
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className="ml-2 font-medium text-red-700 underline"
                >
                  Yenile
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Toplam Kullanıcı"
          value={loading ? null : stats.totalUsers}
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          trend={trends.users}
          color="blue"
          subtitle={loading ? "" : `Bugün: +\${stats.todayUsers || 0}`}
          loading={loading}
        />

        <DashboardCard 
          title="Toplam Konuşma"
          value={loading ? null : stats.totalConversations}
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
          trend={trends.conversations}
          color="green"
          loading={loading}
        />

        <DashboardCard 
          title="Tamamlama Oranı"
          value={loading ? null : `%\${stats.completionRate}`}
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
          loading={loading}
        />

        <DashboardCard 
          title="İletişim Talebi"
          value={loading ? null : `%\${stats.contactRate || 0}`}
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Büyümesi</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton height={250} width="100%" />
            </div>
          ) : (
            <div className="h-64">
              <Line 
                data={chartData.userGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Completion Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tamamlama Oranı</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton circle height={200} width={200} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={chartData.completionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Department Popularity */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Popüler Bölümler
          </h3>
          {!loading && stats.popularDepartments?.length > 5 && (
            <button 
              onClick={() => router.push('/admin/departments')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tümünü Gör
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="p-6">
            <Skeleton count={5} height={40} className="mb-2" />
          </div>
        ) : stats.popularDepartments?.length > 0 ? (
          <div className="p-6">
            <div className="h-64">
              <Bar 
                data={chartData.departmentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    },
                    x: {
                      ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bölüm
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görüntülenme
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamamlama Oranı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.popularDepartments.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dept.views}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `\${dept.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-900">%{dept.completionRate}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Henüz veri bulunmamaktadır.
          </div>
        )}
      </div>

      {/* Recent Conversations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Son Konuşmalar
          </h3>
          {!loading && stats.recentChats?.length > 0 && (
            <button 
              onClick={() => router.push('/admin/conversations')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tümünü Gör
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-6">
            <Skeleton count={5} height={60} className="mb-2" />
          </div>
        ) : stats.recentChats?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bölüm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentChats.map((chat, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {chat.user?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{chat.user || 'Anonim'}</div>
                          <div className="text-sm text-gray-500">{chat.email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{chat.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(chat.date), { addSuffix: true, locale: tr })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(chat.date), 'dd MMM yyyy, HH:mm', { locale: tr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                        chat.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {chat.completed ? 'Tamamlandı' : 'Yarım Kaldı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatClick(chat.id);
                        }}
                      >
                        Görüntüle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            Henüz konuşma kaydı bulunmamaktadır.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}