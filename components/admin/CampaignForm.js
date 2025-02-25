// components/admin/CampaignForm.js
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const FormField = ({ label, error, children, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const CampaignForm = ({ campaign, courses = [], onSubmit, onCancel, isSubmitting = false }) => {
  // Get tomorrow's date for minimum date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

  // Set default expiry date to 30 days from now
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
  
  const defaultFormData = {
    title: '',
    description: '',
    discountRate: 10, // Reasonable default
    expiryDate: format(defaultExpiryDate, 'yyyy-MM-dd'),
    courseId: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [touched, setTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Initialize form with campaign data when available
  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        discountRate: campaign.discountRate || 0,
        expiryDate: campaign.expiryDate ? format(new Date(campaign.expiryDate), 'yyyy-MM-dd') : '',
        courseId: campaign.courseId || '',
        isActive: campaign.isActive !== undefined ? campaign.isActive : true,
      });
    } else {
      setFormData(defaultFormData);
    }
    // Reset form state when campaign changes
    setTouched({});
    setFormErrors({});
  }, [campaign]);

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return !value.trim() ? 'Kampanya başlığı gereklidir' : '';
      case 'description':
        return !value.trim() ? 'Kampanya açıklaması gereklidir' : 
               value.trim().length < 10 ? 'Açıklama en az 10 karakter olmalıdır' : '';
      case 'discountRate':
        const rate = parseInt(value);
        return isNaN(rate) ? 'Geçerli bir sayı giriniz' :
               rate <= 0 ? 'İndirim oranı 0\'dan büyük olmalıdır' :
               rate > 100 ? 'İndirim oranı 100\'den büyük olamaz' : '';
      case 'expiryDate':
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        
        return !value ? 'Son geçerlilik tarihi gereklidir' :
               selectedDate < currentDate ? 'Son geçerlilik tarihi bugün veya gelecekte olmalıdır' : '';
      case 'courseId':
        return !value ? 'Lütfen bir kurs seçiniz' : '';
      default:
        return '';
    }
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'isActive') { // Skip validation for boolean fields
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    return errors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on change if already touched
    if (touched[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: validateField(name, newValue)
      }));
    }
  };

  // Handle blur events for field validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    setFormErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'isActive') { // Skip marking boolean fields
        allTouched[key] = true;
      }
    });
    setTouched(allTouched);
    
    // Validate the entire form
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Format data before submission
    const submissionData = {
      ...formData,
      discountRate: parseInt(formData.discountRate)
    };
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <FormField 
            label="Kampanya Adı" 
            error={touched.title && formErrors.title} 
            required
          >
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ör: Yaz İndirimi"
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                \${touched.title && formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={touched.title && !!formErrors.title}
              aria-describedby={touched.title && formErrors.title ? "title-error" : undefined}
              disabled={isSubmitting}
            />
            {touched.title && formErrors.title && <span id="title-error" className="sr-only">{formErrors.title}</span>}
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField 
            label="Kampanya Açıklaması" 
            error={touched.description && formErrors.description}
            required
          >
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              placeholder="Kampanya detaylarını buraya giriniz..."
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                \${touched.description && formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={touched.description && !!formErrors.description}
              aria-describedby={touched.description && formErrors.description ? "description-error" : undefined}
              disabled={isSubmitting}
            />
            {touched.description && formErrors.description && <span id="description-error" className="sr-only">{formErrors.description}</span>}
          </FormField>
        </div>

        <FormField 
          label="İndirim Oranı (%)" 
          error={touched.discountRate && formErrors.discountRate}
          required
        >
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="number"
              name="discountRate"
              id="discountRate"
              value={formData.discountRate}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              max="100"
              step="1"
              placeholder="10"
              className={`block w-full rounded-md pr-12 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                \${touched.discountRate && formErrors.discountRate ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={touched.discountRate && !!formErrors.discountRate}
              aria-describedby={touched.discountRate && formErrors.discountRate ? "discountRate-error" : undefined}
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
          {touched.discountRate && formErrors.discountRate && <span id="discountRate-error" className="sr-only">{formErrors.discountRate}</span>}
        </FormField>

        <FormField 
          label="Son Geçerlilik Tarihi" 
          error={touched.expiryDate && formErrors.expiryDate}
          required
        >
          <input
            type="date"
            name="expiryDate"
            id="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            onBlur={handleBlur}
            min={tomorrowStr}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
              \${touched.expiryDate && formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={touched.expiryDate && !!formErrors.expiryDate}
            aria-describedby={touched.expiryDate && formErrors.expiryDate ? "expiryDate-error" : undefined}
            disabled={isSubmitting}
          />
          {touched.expiryDate && formErrors.expiryDate && <span id="expiryDate-error" className="sr-only">{formErrors.expiryDate}</span>}
        </FormField>

        <div className="md:col-span-2">
          <FormField 
            label="İlgili Kurs" 
            error={touched.courseId && formErrors.courseId}
            required
          >
            <select
              name="courseId"
              id="courseId"
              value={formData.courseId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                \${touched.courseId && formErrors.courseId ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={touched.courseId && !!formErrors.courseId}
              aria-describedby={touched.courseId && formErrors.courseId ? "courseId-error" : undefined}
              disabled={isSubmitting}
            >
              <option value="">-- Kurs Seçiniz --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {touched.courseId && formErrors.courseId && <span id="courseId-error" className="sr-only">{formErrors.courseId}</span>}
          </FormField>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Kampanya Aktif
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            İşaretlendiğinde kampanya yayınlanacak, kaldırıldığında kampanya pasif olacaktır.
          </p>
        </div>
      </div>
      
      <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors
            \${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İşleniyor...
            </span>
          ) : campaign ? 'Kampanyayı Güncelle' : 'Kampanya Oluştur'}
        </button>
      </div>
    </form>
  );
};

export default CampaignForm;