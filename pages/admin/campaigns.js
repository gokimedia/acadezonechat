// pages/admin/campaigns.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';

export default function Campaigns({ admin }) {
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountRate: 0,
    expiryDate: '',
    courseId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Kampanyaları ve kursları getir
    const fetchData = async () => {
      try {
        // Kampanyaları getir
        const campaignsResponse = await fetch('/api/admin/campaigns');
        
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData);
        }
        
        // Kursları getir (kampanya oluşturmak için gerekli)
        const coursesResponse = await fetch('/api/admin/courses');
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Form değişikliklerini izle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountRate' ? parseInt(value) || 0 : value
    }));
  };

  // Form gönderimini işle
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Başlık gereklidir';
    if (!formData.description.trim()) errors.description = 'Açıklama gereklidir';
    if (formData.discountRate <= 0 || formData.discountRate > 100) errors.discountRate = 'İndirim oranı 1-100 arasında olmalıdır';
    if (!formData.expiryDate) errors.expiryDate = 'Son geçerlilik tarihi gereklidir';
    if (!formData.courseId) errors.courseId = 'Kurs seçimi gereklidir';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    try {
      const url = currentCampaign 
        ? `/api/admin/campaigns?id=${currentCampaign.id}` 
        : '/api/admin/campaigns';
      
      const method = currentCampaign ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Kampanya kaydedilirken bir hata oluştu');
      }
      
      // Kampanyaları yeniden yükle
      const campaignsResponse = await fetch('/api/admin/campaigns');
      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData);
      
      // Modalı kapat ve formu sıfırla
      setShowModal(false);
      setCurrentCampaign(null);
      setFormData({
        title: '',
        description: '',
        discountRate: 0,
        expiryDate: '',
        courseId: ''
      });
    } catch (error) {
      console.error('Save campaign error:', error);
      alert('Kampanya kaydedilirken bir hata oluştu');
    }
  };

  // Kampanya düzenlemeyi başlat
  const handleEdit = (campaign) => {
    setCurrentCampaign(campaign);
    
    // Form verilerini doldur
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      discountRate: campaign.discountRate || 0,
      expiryDate: campaign.expiryDate ? new Date(campaign.expiryDate).toISOString().split('T')[0] : '',
      courseId: campaign.courseId
    });
    
    setShowModal(true);
  };

  // Kampanya silme
  const handleDelete = async (id) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/campaigns?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Kampanya silinirken bir hata oluştu');
      }
      
      // Kampanyaları yeniden yükle
      const campaignsResponse = await fetch('/api/admin/campaigns');
      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Delete campaign error:', error);
      alert('Kampanya silinirken bir hata oluştu');
    }
  };

  // Yeni kampanya oluşturmayı başlat
  const handleNewCampaign = () => {
    setCurrentCampaign(null);
    setFormData({
      title: '',
      description: '',
      discountRate: 0,
      expiryDate: '',
      courseId: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  return (
    <AdminLayout admin={admin} title="Kampanya Yönetimi">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-medium">Tüm Kampanyalar</h2>
        <button
          onClick={handleNewCampaign}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yeni Kampanya
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Henüz kampanya bulunmuyor.</p>
              <button
                onClick={handleNewCampaign}
                className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200"
              >
                İlk kampanyanı oluştur
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kampanya Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İndirim Oranı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Geçerlilik
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
                  const isExpired = new Date(campaign.expiryDate) < new Date();
                  
                  return (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">%{campaign.discountRate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(campaign.expiryDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {courses.find(c => c.id === campaign.courseId)?.title || 'Bilinmeyen Kurs'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isExpired ? 'Süresi Dolmuş' : 'Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Kampanya Ekle/Düzenle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">
                {currentCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kampanya Adı
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formErrors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Açıklama
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500' : ''
                    }`}
                  ></textarea>
                  {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    İndirim Oranı (%)
                  </label>
                  <input
                    type="number"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formErrors.discountRate ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.discountRate && <p className="mt-1 text-sm text-red-500">{formErrors.discountRate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Son Geçerlilik Tarihi
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formErrors.expiryDate ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.expiryDate && <p className="mt-1 text-sm text-red-500">{formErrors.expiryDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    İlgili Kurs
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formErrors.courseId ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Kurs Seçin</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {formErrors.courseId && <p className="mt-1 text-sm text-red-500">{formErrors.courseId}</p>}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 text-right">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentCampaign ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}