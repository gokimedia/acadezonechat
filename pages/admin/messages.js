// pages/admin/messages.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';

export default function Messages({ admin }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState('all'); // all, info, application
  
  useEffect(() => {
    // Mesajları getir
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/messages');
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Messages fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [messageType]);

  // Mesaj filtreleme
  const filteredMessages = messages.filter(message => {
    if (messageType === 'all') return true;
    return message.type === messageType;
  });

  // Mesaj durumunu güncelleme
  const handleStatusChange = async (id, newStatus, type) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          type
        }),
      });
      
      if (response.ok) {
        // Mesajları yenile
        const updatedMessages = messages.map(message => {
          if (message.id === id && message.type === type) {
            return { ...message, status: newStatus };
          }
          return message;
        });
        
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  return (
    <AdminLayout admin={admin} title="Mesaj Yönetimi">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filtre butonları */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setMessageType('all')}
              className={`px-4 py-2 rounded ${
                messageType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Tüm Mesajlar
            </button>
            <button
              onClick={() => setMessageType('info')}
              className={`px-4 py-2 rounded ${
                messageType === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Bilgi Talepleri
            </button>
            <button
              onClick={() => setMessageType('application')}
              className={`px-4 py-2 rounded ${
                messageType === 'application' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Başvuru Talepleri
            </button>
          </div>

          {/* Mesaj tablosu */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {messageType === 'all' && 'Tüm Mesajlar'}
                {messageType === 'info' && 'Bilgi Talepleri'}
                {messageType === 'application' && 'Başvuru Talepleri'}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Henüz mesaj bulunmuyor.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı Bilgileri
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Talep Türü
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <tr key={`${message.type}-${message.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {message.user.name} {message.user.surname}
                              </div>
                              <div className="text-sm text-gray-500">{message.user.email}</div>
                              <div className="text-sm text-gray-500">{message.user.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{message.requestType}</div>
                          <div className="text-sm text-gray-500">
                            {message.type === 'info' && 'Bilgi Talebi'}
                            {message.type === 'application' && 'Başvuru Talebi'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.status === 'new' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : message.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : message.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {message.status === 'new' && 'Yeni'}
                            {message.status === 'processing' && 'İşleniyor'}
                            {message.status === 'completed' && 'Tamamlandı'}
                            {message.status === 'cancelled' && 'İptal Edildi'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {message.status === 'new' && (
                              <button
                                onClick={() => handleStatusChange(message.id, 'processing', message.type)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                İşleme Al
                              </button>
                            )}
                            {message.status === 'processing' && (
                              <button
                                onClick={() => handleStatusChange(message.id, 'completed', message.type)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Tamamla
                              </button>
                            )}
                            {message.status !== 'cancelled' && message.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(message.id, 'cancelled', message.type)}
                                className="text-red-600 hover:text-red-900"
                              >
                                İptal Et
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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