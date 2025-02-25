// components/admin/forms/RecommendationForm.js
import { useState, useEffect } from 'react';

const RecommendationForm = ({ recommendation, optionId, isEditing, courses, onSubmit, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    courseId: '',
    priority: 1
  });
  const [errors, setErrors] = useState({});
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && recommendation) {
      setFormData({
        courseId: recommendation.courseId || '',
        priority: recommendation.priority || 1
      });
    } else {
      setFormData({
        courseId: '',
        priority: 1
      });
    }
  }, [isEditing, recommendation]);

  // Filter courses when search term changes
  useEffect(() => {
    if (!courses) return;
    
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(term) || 
      (course.description && course.description.toLowerCase().includes(term))
    );
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) || 1 : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.courseId) {
      newErrors.courseId = 'Kurs seçimi gereklidir';
    }
    
    if (formData.priority < 1) {
      newErrors.priority = 'Öncelik değeri en az 1 olmalıdır';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">
            Kurs Ara
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Kurs adı veya açıklaması ile ara"
            disabled={saving}
          />
        </div>
        
        <div>
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
            Kurs*
          </label>
          <select
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.courseId ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            disabled={saving}
          >
            <option value="">Kurs seçin</option>
            {filteredCourses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Öncelik
          </label>
          <input
            type="number"
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            min="1"
            className={`mt-1 block w-full rounded-md border ${errors.priority ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            disabled={saving}
          />
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Önerilerin gösterim sıralamasını belirler. Düşük değerli öneriler önce gösterilir.
          </p>
        </div>
        
        {/* Display selected course details if available */}
        {formData.courseId && (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Seçilen Kurs Bilgileri:</h4>
            {(() => {
              const selectedCourse = courses?.find(c => c.id === formData.courseId);
              if (!selectedCourse) return <p className="text-sm text-gray-500">Kurs bilgileri yüklenemedi.</p>;
              
              return (
                <div className="text-sm">
                  <p className="font-medium">{selectedCourse.title}</p>
                  {selectedCourse.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">{selectedCourse.description}</p>
                  )}
                  {selectedCourse.departmentId && (
                    <p className="text-gray-500 mt-1">
                      Bölüm: {selectedCourse.departmentName || selectedCourse.departmentId}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={saving}
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kaydediliyor...
            </span>
          ) : (
            isEditing ? 'Güncelle' : 'Oluştur'
          )}
        </button>
      </div>
    </form>
  );
};

export default RecommendationForm;