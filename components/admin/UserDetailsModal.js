// components/admin/UserDetailsModal.js
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Spinner from '../ui/Spinner';

export default function UserDetailsModal({ user, onClose }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Fetch detailed user data
        const response = await fetch(`/api/admin/users/\${user.id}`);
        
        if (!response.ok) {
          throw new Error('Kullanıcı detayları alınamadı');
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const userInfo = userData || user;

  // Tabs data
  const tabs = [
    { id: 'info', label: 'Bilgiler' },
    { id: 'sessions', label: 'Oturumlar' },
    { id: 'chats', label: 'Konuşmalar' },
    { id: 'requests', label: 'Talepler' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* User Header */}
      <div className="flex items-center mb-6 p-2 bg-gray-50 rounded-lg">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold">
          {userInfo.name.charAt(0)}
          {userInfo.surname.charAt(0)}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">
            {userInfo.name} {userInfo.surname}
          </h3>
          <p className="text-gray-500">
            {format(new Date(userInfo.createdAt), "'Kayıt tarihi:' d MMMM yyyy", { locale: tr })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`\${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Kişisel Bilgiler</h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userInfo.name} {userInfo.surname}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:\${userInfo.email}`} className="text-blue-600 hover:text-blue-800">
                      {userInfo.email}
                    </a>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:\${userInfo.phone}`} className="text-blue-600 hover:text-blue-800">
                      {userInfo.phone}
                    </a>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Kullanıcı ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userInfo.id}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Aktivite Özeti</h4>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Konuşmalar</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {userInfo._count?.chats || 0}
                  </dd>
                </div>
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Oturumlar</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {userInfo._count?.sessions || 0}
                  </dd>
                </div>
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Bilgi Talepleri</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {userInfo._count?.infoRequests || 0}
                  </dd>
                </div>
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Başvuru Talepleri</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {userInfo._count?.appRequests || 0}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Kullanıcı Oturumları</h4>
            {userInfo.sessions && userInfo.sessions.length > 0 ? (
              <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                  {userInfo.sessions.map((session) => (
                    <li key={session.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {session.department ? session.department.name : 'Genel Oturum'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(session.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </p>
                        </div>
                        <div>
                          {session.sessionData && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Veri mevcut
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Henüz kaydedilmiş oturum bulunmuyor.</p>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Chatbot Konuşmaları</h4>
            {userInfo.chats && userInfo.chats.length > 0 ? (
              <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                  {userInfo.chats.map((chat) => (
                    <li key={chat.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {chat.department ? chat.department.name : 'Genel Konuşma'}
                          </p>
                          <div className="flex text-xs text-gray-500 space-x-2">
                            <span>{format(new Date(chat.startTime), 'dd MMM yyyy HH:mm', { locale: tr })}</span>
                            <span>•</span>
                            <span>{chat.messageCount} mesaj</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {chat.completed ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Tamamlandı
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Yarım Kaldı
                            </span>
                          )}
                          {chat.resultedInContact && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              İletişim Talebi
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Henüz kaydedilmiş konuşma bulunmuyor.</p>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">Bilgi Talepleri</h4>
              {userInfo.infoRequests && userInfo.infoRequests.length > 0 ? (
                <div className="bg-white shadow overflow-hidden rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {userInfo.infoRequests.map((request) => (
                      <li key={request.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {request.requestType || 'Genel Bilgi Talebi'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(request.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                              request.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status === 'new' ? 'Yeni' : 
                               request.status === 'processing' ? 'İşleniyor' : 
                               request.status === 'completed' ? 'Tamamlandı' : 
                               request.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Henüz bilgi talebi bulunmuyor.</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">Başvuru Talepleri</h4>
              {userInfo.appRequests && userInfo.appRequests.length > 0 ? (
                <div className="bg-white shadow overflow-hidden rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {userInfo.appRequests.map((request) => (
                      <li key={request.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {request.requestType || 'Genel Başvuru'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(request.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                              request.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status === 'new' ? 'Yeni' : 
                               request.status === 'processing' ? 'İşleniyor' : 
                               request.status === 'completed' ? 'Tamamlandı' : 
                               request.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Henüz başvuru talebi bulunmuyor.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Kapat
        </button>
        <a
          href={`mailto:\${userInfo.email}`}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          E-posta Gönder
        </a>
      </div>
    </div>
  );
}