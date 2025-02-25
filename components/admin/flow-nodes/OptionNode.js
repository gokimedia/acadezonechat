// components/admin/flow-nodes/OptionNode.js
import { useState } from 'react';
import { Handle, Position } from 'reactflow';

const OptionNode = ({ data, isConnectable }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleEdit = () => {
    if (typeof data.onEdit === 'function') {
      data.onEdit();
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu seçeneği silmek istediğinizden emin misiniz? Bu işlem bağlı tüm önerileri de silecektir.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/options?id=${data.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Seçenek silinirken bir hata oluştu');
      }
      
      // Refresh page to update flow
      window.location.reload();
    } catch (error) {
      console.error('Option delete error:', error);
      alert('Seçenek silinirken bir hata oluştu');
    }
  };

  const handleAddRecommendation = () => {
    // Use the global addRecommendation function from window
    if (typeof window.addRecommendation === 'function') {
      window.addRecommendation(data.id);
    }
    setShowMenu(false);
  };

  const handleDeleteRecommendation = async (recommendationId) => {
    if (!window.confirm('Bu öneriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/recommendations?id=${recommendationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Öneri silinirken bir hata oluştu');
      }
      
      // Refresh page to update flow
      window.location.reload();
    } catch (error) {
      console.error('Recommendation delete error:', error);
      alert('Öneri silinirken bir hata oluştu');
    }
  };

  const recommendations = data.recommendations || [];

  return (
    <div className="relative p-3 rounded-md border border-green-500 bg-green-100 shadow-md min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      
      <div className="flex justify-between items-start">
        <div className="flex items-center mb-2">
          <span className="text-sm font-semibold text-green-800">Seçenek</span>
        </div>
        
        <div className="relative">
          <button
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <ul className="py-1">
                <li>
                  <button
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                    onClick={handleEdit}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </button>
                </li>
                <li>
                  <button
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                    onClick={handleAddRecommendation}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Öneri Ekle
                  </button>
                </li>
                <li>
                  <button
                    className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                    onClick={handleDelete}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Sil
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-gray-800 bg-white p-2 rounded border border-green-200 break-words">
        {data.label}
      </div>
      
      {recommendations.length > 0 && (
        <div className="mt-2">
          <button
            className="text-xs text-purple-700 flex items-center"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showRecommendations ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
            </svg>
            {recommendations.length} Öneri {showRecommendations ? 'Gizle' : 'Göster'}
          </button>
          
          {showRecommendations && (
            <div className="mt-2 bg-purple-50 p-2 rounded border border-purple-200">
              <p className="text-xs font-semibold text-purple-800 mb-1">Öneriler:</p>
              <ul className="space-y-1">
                {recommendations.map((recommendation, index) => (
                  <li key={recommendation.id || index} className="text-xs flex justify-between items-center">
                    <span className="text-gray-800 truncate max-w-[120px]">
                      {recommendation.courseName || 'Belirsiz Kurs'}
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteRecommendation(recommendation.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Display next question info if available */}
      {data.nextQuestionId && (
        <div className="mt-2 text-xs text-blue-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span>Sonraki Soru ID: {data.nextQuestionId}</span>
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default OptionNode;