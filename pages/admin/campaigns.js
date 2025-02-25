// pages/admin/campaigns.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { format, isAfter, parseISO, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import AdminLayout from '../../components/admin/Layout';
import CampaignForm from '../../components/admin/CampaignForm';
import { requireAdminAuth } from '../../lib/admin/auth';
import Dialog from '../../components/ui/Dialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Custom hook for campaign management
function useCampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'expiryDate', direction: 'asc' });
  const [filters, setFilters] = useState({ status: 'all' });

  // Fetch campaigns and courses
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns and courses in parallel
      const [campaignsResponse, coursesResponse] = await Promise.all([
        fetch('/api/admin/campaigns'),
        fetch('/api/admin/courses')
      ]);
      
      if (!campaignsResponse.ok) throw new Error('Kampanya verileri alınamadı');
      if (!coursesResponse.ok) throw new Error('Kurs verileri alınamadı');
      
      const campaignsData = await campaignsResponse.json();
      const coursesData = await coursesResponse.json();
      
      setCampaigns(campaignsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Data fetch error:', error);
      toast.error('Veriler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new campaign
  const createCampaign = async (campaignData) => {
    try {
      // Optimistic update
      const tempId = `temp-\${Date.now()}`;
      const tempCampaign = { 
        id: tempId, 
        ...campaignData,
        createdAt: new Date().toISOString()
      };
      
      setCampaigns(prev => [...prev, tempCampaign]);
      
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      
      if (!response.ok) {
        throw new Error('Kampanya oluşturulamadı');
      }
      
      const newCampaign = await response.json();
      
      // Replace temp campaign with actual one
      setCampaigns(prev => prev.map(c => c.id === tempId ? newCampaign : c));
      toast.success('Kampanya başarıyla oluşturuldu');
      return newCampaign;
    } catch (error) {
      // Revert optimistic update
      setCampaigns(prev => prev.filter(c => !c.id.toString().startsWith('temp-')));
      console.error('Create campaign error:', error);
      toast.error('Kampanya oluşturulamadı: ' + error.message);
      throw error;
    }
  };

  // Update an existing campaign
  const updateCampaign = async (id, campaignData) => {
    try {
      // Optimistic update
      const originalCampaigns = [...campaigns];
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...campaignData } : c));
      
      const response = await fetch(`/api/admin/campaigns?id=\${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      
      if (!response.ok) {
        throw new Error('Kampanya güncellenemedi');
      }
      
      const updatedCampaign = await response.json();
      toast.success('Kampanya başarıyla güncellendi');
      return updatedCampaign;
    } catch (error) {
      // Revert optimistic update
      setCampaigns(originalCampaigns);
      console.error('Update campaign error:', error);
      toast.error('Kampanya güncellenemedi: ' + error.message);
      throw error;
    }
  };

  // Delete a campaign
  const deleteCampaign = async (id) => {
    try {
      // Optimistic update
      const originalCampaigns = [...campaigns];
      setCampaigns(prev => prev.filter(c => c.id !== id));
      
      const response = await fetch(`/api/admin/campaigns?id=\${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Kampanya silinemedi');
      }
      
      toast.success('Kampanya başarıyla silindi');
    } catch (error) {
      // Revert optimistic update
      setCampaigns(originalCampaigns);
      console.error('Delete campaign error:', error);
      toast.error('Kampanya silinemedi: ' + error.message);
      throw error;
    }
  };

  // Duplicate a campaign
  const duplicateCampaign = async (campaign) => {
    try {
      const newCampaignData = {
        ...campaign,
        title: `\${campaign.title} (Kopya)`,
        expiryDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // Set expiry date to 30 days from now
      };
      delete newCampaignData.id;
      
      await createCampaign(newCampaignData);
      toast.success('Kampanya başarıyla kopyalandı');
    } catch (error) {
      console.error('Duplicate campaign error:', error);
      toast.error('Kampanya kopyalanamadı');
    }
  };

  // Sort campaigns
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    
    // Apply filters
    if (filters.status === 'active') {
      filtered = filtered.filter(campaign => 
        isAfter(parseISO(campaign.expiryDate), new Date())
      );
    } else if (filters.status === 'expired') {
      filtered = filtered.filter(campaign => 
        !isAfter(parseISO(campaign.expiryDate), new Date())
      );
    }
    
    // Apply search if needed
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm) ||
        (campaign.description && campaign.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'expiryDate') {
          const dateA = new Date(a.expiryDate);
          const dateB = new Date(b.expiryDate);
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [campaigns, sortConfig, filters]);

  return {
    campaigns: filteredAndSortedCampaigns,
    courses,
    loading,
    fetchData,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    requestSort,
    sortConfig,
    filters,
    setFilters,
  };
}

export default function Campaigns({ admin }) {
  const {
    campaigns,
    courses,
    loading,
    fetchData,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    requestSort,
    sortConfig,
    filters,
    setFilters
  } = useCampaignManagement();

  const [showModal, setShowModal] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, setFilters]);

  const handleOpenModal = (campaign = null) => {
    setCurrentCampaign(campaign);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCampaign(null);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (currentCampaign) {
        await updateCampaign(currentCampaign.id, formData);
      } else {
        await createCampaign(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    
    try {
      await deleteCampaign(campaignToDelete.id);
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDuplicate = (campaign) => {
    duplicateCampaign(campaign);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const handleFilterChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  return (
    <AdminLayout 
      admin={admin} 
      title="Kampanya Yönetimi"
      description="İndirim kampanyalarını oluştur ve yönet"
    >
      {/* Header Section with Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Kampanyalar</h2>
          <p className="text-gray-500 text-sm">İndirim kampanyalarını yönet ve takip et</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shrink-0"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yeni Kampanya
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 text-sm rounded-full \${
              filters.status === 'all' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          <button 
            onClick={() => handleFilterChange('active')}
            className={`px-3 py-1 text-sm rounded-full \${
              filters.status === 'active' 
                ? 'bg-green-100 text-green-800 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Aktif
          </button>
          <button 
            onClick={() => handleFilterChange('expired')}
            className={`px-3 py-1 text-sm rounded-full \${
              filters.status === 'expired' 
                ? 'bg-red-100 text-red-800 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Süresi Dolmuş
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Kampanya ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="Henüz kampanya bulunmuyor"
          description={
            filters.status !== 'all' || filters.search
              ? "Arama kriterlerinize uygun kampanya bulunamadı."
              : "Yeni bir kampanya oluşturarak indirimler sunmaya başlayın."
          }
          action={
            filters.status !== 'all' || filters.search ? (
              <button
                onClick={() => {
                  setFilters({ status: 'all' });
                  setSearchTerm('');
                }}
                className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                İlk Kampanyanı Oluştur
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('title')}
                  >
                    Kampanya Adı{getSortIndicator('title')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('discountRate')}
                  >
                    İndirim Oranı{getSortIndicator('discountRate')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('expiryDate')}
                  >
                    Son Geçerlilik{getSortIndicator('expiryDate')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlgili Kurs
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const isExpired = !isAfter(parseISO(campaign.expiryDate), new Date());
                  const relevantCourse = courses.find(c => c.id === campaign.courseId);
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{campaign.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color="blue" size="lg">%{campaign.discountRate}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(parseISO(campaign.expiryDate), 'dd MMMM yyyy', { locale: tr })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isExpired 
                            ? 'Süresi geçmiş' 
                            : `\${format(parseISO(campaign.expiryDate), "'Son' d 'gün'", { locale: tr })}`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {relevantCourse 
                            ? relevantCourse.title 
                            : <span className="text-orange-500">Kurs bulunamadı</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          color={isExpired ? "red" : "green"} 
                          size="md"
                        >
                          {isExpired ? 'Süresi Dolmuş' : 'Aktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => handleOpenModal(campaign)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1"
                          title="Düzenle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDuplicate(campaign)}
                          className="text-green-600 hover:text-green-900 inline-flex items-center p-1"
                          title="Kopyala"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(campaign)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center p-1"
                          title="Sil"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Form Modal */}
      <Dialog
        isOpen={showModal}
        onClose={handleCloseModal}
        title={currentCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}
        size="lg"
      >
        <CampaignForm
          campaign={currentCampaign}
          courses={courses}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Kampanya Silme"
        confirmText="Evet, Sil"
        cancelText="İptal"
        danger={true}
      >
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{campaignToDelete?.title}</span> kampanyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kampanyaya bağlı tüm veriler silinecektir.
        </p>
      </ConfirmDialog>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}