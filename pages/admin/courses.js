// pages/admin/courses.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';

export default function Courses({ admin }) {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    url: '',
    imageUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    // Kursları ve bölümleri getir
    const fetchData = async () => {
      try {
        // Bölümleri getir
        const deptResponse = await fetch('/api/admin/departments');
        
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData);
        }
        
        // Kursları getir
        const courseResponse = await fetch('/api/admin/courses');
        
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          setCourses(courseData);
        }
      } catch (error) {
        console.error('Veri getirme hatası:', error);
        setMessage({ type: 'error', text: 'Veriler yüklenirken bir hata oluştu' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    
    if (!formData.title || !formData.departmentId) {
      setMessage({ type: 'error', text: 'Kurs başlığı ve bölüm alanları zorunludur' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      const url = isEditing 
        ? `/api/admin/courses?id=${editId}` 
        : '/api/admin/courses';
      
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
        throw new Error(data.message || 'Kurs kaydedilirken bir hata oluştu');
      }
      
      // Kursları yeniden getir
      const refreshResponse = await fetch('/api/admin/courses');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setCourses(refreshData);
      }
      
      // Formu sıfırla
      setFormData({
        title: '',
        description: '',
        departmentId: '',
        url: '',
        imageUrl: ''
      });
      setIsEditing(false);
      setEditId(null);
      
      setMessage({ 
        type: 'success', 
        text: `Kurs başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}` 
      });
    } catch (error) {
      console.error('Kurs kaydetme hatası:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      description: course.description || '',
      departmentId: course.departmentId,
      url: course.url || '',
      imageUrl: course.imageUrl || ''
    });
    setIsEditing(true);
    setEditId(course.id);
    
    // Form alanına kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kursu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/courses?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kurs silinirken bir hata oluştu');
      }
      
      // Kursları güncelle
      setCourses(courses.filter(course => course.id !== id));
      
      setMessage({ type: 'success', text: 'Kurs başarıyla silindi' });
    } catch (error) {
      console.error('Kurs silme hatası:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      departmentId: '',
      url: '',
      imageUrl: ''
    });
    setIsEditing(false);
    setEditId(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <AdminLayout admin={admin} title="Eğitim Programları">
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
          
          {/* Kurs ekleme/düzenleme formu */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Kursu Düzenle' : 'Yeni Kurs Ekle'}
              </h3>
              
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Kurs Başlığı*
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                      Bölüm*
                    </label>
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Bölüm Seçin</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      id="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                      Resim URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
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
          
          {/* Kurs listesi */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mevcut Eğitim Programları
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bölüm
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Henüz kurs bulunmuyor
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => {
                      const department = departments.find(d => d.id === course.departmentId);
                      
                      return (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {course.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {department ? department.name : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                            {course.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleEdit(course)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      );
                    })
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