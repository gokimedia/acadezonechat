// components/admin/forms/QuestionForm.js
import { useState, useEffect } from 'react';

const QuestionForm = ({ question, isEditing, questions, onSubmit, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    text: '',
    orderNum: 1
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && question) {
      setFormData({
        text: question.text || '',
        orderNum: question.orderNum || 1
      });
    } else {
      // For new question, suggest the next order number
      const maxOrderNum = questions.length > 0
        ? Math.max(...questions.map(q => q.orderNum || 0))
        : 0;
      
      setFormData({
        text: '',
        orderNum: maxOrderNum + 1
      });
    }
  }, [isEditing, question, questions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderNum' ? parseInt(value) || 0 : value
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
    
    if (!formData.text.trim()) {
      newErrors.text = 'Soru metni gereklidir';
    }
    
    if (formData.orderNum <= 0) {
      newErrors.orderNum = 'Sıra numarası pozitif bir sayı olmalıdır';
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
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Soru Metni*
          </label>
          <textarea
            id="text"
            name="text"
            rows="3"
            value={formData.text}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.text ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            placeholder="Kullanıcıya sorulacak soruyu girin"
            disabled={saving}
          ></textarea>
          {errors.text && (
            <p className="mt-1 text-sm text-red-600">{errors.text}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="orderNum" className="block text-sm font-medium text-gray-700">
            Sıra Numarası*
          </label>
          <input
            type="number"
            id="orderNum"
            name="orderNum"
            value={formData.orderNum}
            onChange={handleChange}
            min="1"
            className={`mt-1 block w-full rounded-md border ${errors.orderNum ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            disabled={saving}
          />
          {errors.orderNum && (
            <p className="mt-1 text-sm text-red-600">{errors.orderNum}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Soru akışındaki sıralamayı belirler. Aynı sıra numarasına sahip birden fazla soru olabilir.
          </p>
        </div>
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

export default QuestionForm;