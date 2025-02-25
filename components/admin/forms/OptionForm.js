// components/admin/forms/OptionForm.js
import { useState, useEffect } from 'react';

const OptionForm = ({ option, questionId, isEditing, questions, onSubmit, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    text: '',
    nextQuestionId: ''
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && option) {
      setFormData({
        text: option.text || '',
        nextQuestionId: option.nextQuestionId || ''
      });
    } else {
      setFormData({
        text: '',
        nextQuestionId: ''
      });
    }
  }, [isEditing, option]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      newErrors.text = 'Seçenek metni gereklidir';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    onSubmit(formData);
  };

  // Filter out current question from next question options to prevent loops
  const availableQuestions = questions.filter(q => 
    q.id !== questionId && 
    // When editing, also filter out questions that would create circular references
    (!isEditing || q.id !== option?.questionId)
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Seçenek Metni*
          </label>
          <textarea
            id="text"
            name="text"
            rows="2"
            value={formData.text}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.text ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            placeholder="Kullanıcıya gösterilecek seçenek metni"
            disabled={saving}
          ></textarea>
          {errors.text && (
            <p className="mt-1 text-sm text-red-600">{errors.text}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="nextQuestionId" className="block text-sm font-medium text-gray-700">
            Sonraki Soru
          </label>
          <select
            id="nextQuestionId"
            name="nextQuestionId"
            value={formData.nextQuestionId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={saving}
          >
            <option value="">Sonraki soru yok (akış sonu)</option>
            {availableQuestions.map(question => (
              <option key={question.id} value={question.id}>
                [{question.orderNum}] {question.text.substring(0, 50)}{question.text.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Bu seçenek seçildiğinde hangi soruya geçileceğini belirler. Boş bırakılırsa akış burada sonlanır.
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

export default OptionForm;