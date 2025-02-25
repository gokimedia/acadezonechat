// components/admin/CampaignForm.js
import { useState, useEffect } from 'react';

const CampaignForm = ({ campaign, courses, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountRate: 0,
    expiryDate: '',
    courseId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Kampanya verileri geldiğinde form durumunu güncelle
  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        discountRate: campaign.discountRate || 0,
        expiryDate: campaign.expiryDate ? new Date(campaign.expiryDate).toISOString().split('T')[0] : '',
        courseId: campaign.courseId || ''
      });
    }
  }, [campaign]);

  // Form değişikliklerini izle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountRate' ? parseInt(value) || 0 : value
    }));
  };

  // Form gönderimini işle
  const handleSubmit = (e) => {
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
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
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
        >
          İptal
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {campaign ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
};

export default CampaignForm;