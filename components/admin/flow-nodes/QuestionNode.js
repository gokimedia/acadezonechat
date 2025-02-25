// components/admin/flow-nodes/QuestionNode.js
import { useState } from 'react';
import { Handle, Position } from 'reactflow';

const QuestionNode = ({ data, isConnectable }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    if (typeof data.onEdit === 'function') {
      data.onEdit();
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu soruyu silmek istediğinizden emin misiniz? Bu işlem bağlı tüm seçenekleri ve önerileri de silecektir.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions?id=${data.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Soru silinirken bir hata oluştu');
      }
      
      // Refresh page to update flow
      window.location.reload();
    } catch (error) {
      console.error('Question delete error:', error);
      alert('Soru silinirken bir hata oluştu');
    }
  };

  const handleAddOption = () => {
    // Use the global addOption function from window
    if (typeof window.addOption === 'function') {
      window.addOption(data.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative p-3 rounded-md border border-blue-500 bg-blue-100 shadow-md min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      
      <div className="flex justify-between items-start">
        <div className="flex items-center mb-2">
          <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
            {data.orderNum || '?'}
          </div>
          <span className="text-sm font-semibold text-blue-800">Soru</span>
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
                    onClick={handleAddOption}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Seçenek Ekle
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
      
      <div className="text-gray-800 bg-white p-2 rounded border border-blue-200 break-words">
        {data.label}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default QuestionNode;