// pages/admin/departments.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';

export default function Departments({ admin }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Bölümleri getir
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/admin/departments');
        
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error('Bölümleri getirme hatası:', error);
        setMessage({ type: 'error', text: 'Bölümler yüklenirken bir hata oluştu' });
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setMessage({ type: 'error', text: 'Bölüm adı zorunludur' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      const url = isEditing 
        ? `/api/admin/departments?id=${editId}` 
        : '/api/admin/departments';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Bölüm kaydedilirken bir hata oluştu');
      }
      
      // Bölümleri yeniden getir
      const refreshResponse = await fetch('/api/admin/departments');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setDepartments(refreshData);
      }
      
      // Formu sıfırla
      setFormData({
        name: ''
      });
      setIsEditing(false);
      setEditId(null);
      
      setMessage({ 
        type: 'success', 
        text: `Bölüm başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}` 
      });
    } catch (error) {
      console.error('Bölüm kaydetme hatası:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleEdit = (department) => {
    setFormData({
      name: department.name
    });
    setIsEditing(true);
    setEditId(department.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/departments?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Bölüm silinirken bir hata oluştu');
      }
      
      // Bölümleri güncelle
      setDepartments(departments.filter(dept => dept.id !== id));
      
      setMessage({ type: 'success', text: 'Bölüm başarıyla silindi' });
    } catch (error) {
      console.error('Bölüm silme hatası:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: ''
    });
    setIsEditing(false);
    setEditId(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <AdminLayout admin={admin} title="Bölümler">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bildirim mesajı */}
          {message.text && (
            <div className={`p-4 mb-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Bölüm ekleme/düzenleme formu */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'}
              </h3>
              
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Bölüm Adı*
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isEditing ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Bölüm listesi */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mevcut Bölümler
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bölüm Adı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturma Tarihi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Henüz bölüm bulunmuyor
                      </td>
                    </tr>
                  ) : (
                    departments.map((department) => (
                      <tr key={department.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {department.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {department.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(department.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(department.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}