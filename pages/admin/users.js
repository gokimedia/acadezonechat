// pages/admin/users.js
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Dialog from '../../components/ui/Dialog';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import UserDetailsModal from '../../components/admin/UserDetailsModal';

const ITEMS_PER_PAGE = 10;

function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', dateRange: 'all' });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  });

  // Fetch users data
  const fetchUsers = async (page = 1, filters = {}, sort = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: ITEMS_PER_PAGE,
        search: filters.search || '',
        dateRange: filters.dateRange || 'all',
        sortBy: sort.key || 'createdAt',
        sortDirection: sort.direction || 'desc',
      });

      const response = await fetch(`/api/admin/users?\${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Kullanıcı verileri alınamadı');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalItems: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Kullanıcı verileri yüklenirken bir hata oluştu');
      toast.error('Kullanıcı verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage, filters, sortConfig);
  }, [pagination.currentPage, filters.dateRange, sortConfig]);

  // Handle search with delay
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        fetchUsers(1, filters, sortConfig);
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [filters.search]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSortChange = (key) => {
    setSortConfig(prev => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/\${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }

      toast.success('Kullanıcı başarıyla silindi');
      // Refetch the current page to update the list
      fetchUsers(pagination.currentPage, filters, sortConfig);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Kullanıcı silinirken bir hata oluştu');
    }
  };

  return {
    users,
    loading,
    error,
    filters,
    sortConfig,
    pagination,
    handlePageChange,
    handleSortChange,
    handleFilterChange,
    deleteUser,
    refreshData: () => fetchUsers(pagination.currentPage, filters, sortConfig),
  };
}

export default function Users({ admin }) {
  const {
    users,
    loading,
    error,
    filters,
    sortConfig,
    pagination,
    handlePageChange,
    handleSortChange,
    handleFilterChange,
    deleteUser,
    refreshData,
  } = useUserManagement();

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleShowUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    await deleteUser(userToDelete.id);
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const dateRangeOptions = [
    { value: 'all', label: 'Tüm Zamanlar' },
    { value: 'today', label: 'Bugün' },
    { value: 'week', label: 'Bu Hafta' },
    { value: 'month', label: 'Bu Ay' },
    { value: 'year', label: 'Bu Yıl' },
  ];

  // Generate page buttons for pagination
  const pageButtons = [];
  const maxDisplayedPages = 5;
  
  if (pagination.totalPages <= maxDisplayedPages) {
    for (let i = 1; i <= pagination.totalPages; i++) {
      pageButtons.push(i);
    }
  } else {
    // Always include first page
    pageButtons.push(1);
    
    // Middle pages
    const startPage = Math.max(2, pagination.currentPage - 1);
    const endPage = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);
    
    if (startPage > 2) {
      pageButtons.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(i);
    }
    
    if (endPage < pagination.totalPages - 1) {
      pageButtons.push('...');
    }
    
    // Always include last page if there is more than 1 page
    if (pagination.totalPages > 1) {
      pageButtons.push(pagination.totalPages);
    }
  }

  return (
    <AdminLayout 
      admin={admin} 
      title="Kullanıcı Yönetimi"
      description="Kullanıcıları yönet, ara ve düzenle"
    >
      {/* Header Section with Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">Kullanıcılar</h2>
            <p className="text-gray-500 text-sm">
              Toplam {pagination.totalItems} kayıtlı kullanıcı
            </p>
          </div>
          
          <div className="mt-3 sm:mt-0">
            <button
              onClick={refreshData}
              className="inline-flex items-center bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Yenile
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ad, soyad veya e-posta ile ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
            </div>
          </div>
          <div>
            <select
              className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={refreshData}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                >
                  <span className="sr-only">Yenile</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="Kullanıcı bulunamadı"
          description={filters.search ? "Arama kriterlerinize uygun kullanıcı bulunamadı." : "Henüz kayıtlı kullanıcı bulunmuyor."}
          action={
            filters.search && (
              <button
                onClick={() => handleFilterChange({ search: '' })}
                className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
              >
                Aramayı Temizle
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('name')}
                    >
                      Ad Soyad{getSortIndicator('name')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('email')}
                    >
                      İletişim{getSortIndicator('email')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('createdAt')}
                    >
                      Kayıt Tarihi{getSortIndicator('createdAt')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Aktivite
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="font-medium text-gray-600">
                                {user.name.charAt(0)}
                                {user.surname.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name} {user.surname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.createdAt), 'HH:mm', { locale: tr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                            </svg>
                            <span className="text-xs text-gray-600">
                              {user._count?.chats || 0} konuşma
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-600">
                              {user._count?.infoRequests || 0} bilgi talebi
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleShowUserDetails(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Detaylar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium \${
                    pagination.currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Önceki</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {pageButtons.map((page, idx) => (
                  page === '...' ? (
                    <span
                      key={`ellipsis-\${idx}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium \${
                        pagination.currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium \${
                    pagination.currentPage === pagination.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Sonraki</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      <Dialog
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        title="Kullanıcı Detayları"
        size="lg"
      >
        {selectedUser && (
          <UserDetailsModal user={selectedUser} onClose={() => setShowUserDetails(false)} />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Kullanıcıyı Sil"
        confirmText="Evet, Sil"
        cancelText="İptal"
        danger={true}
      >
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{userToDelete?.name} {userToDelete?.surname}</span> isimli kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kullanıcıya ait tüm veriler silinecektir.
        </p>
      </ConfirmDialog>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}