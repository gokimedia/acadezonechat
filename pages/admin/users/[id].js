// pages/admin/users/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AdminLayout from '../../../components/admin/Layout';
import { requireAdminAuth } from '../../../lib/admin/auth';
import Spinner from '../../../components/ui/Spinner';
import Badge from '../../../components/ui/Badge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

export default function UserDetail({ admin }) {
  const router = useRouter();
  const { id } = router.query;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/\${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Kullanıcı bulunamadı');
          }
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
        
        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/\${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }
      
      toast.success('Kullanıcı başarıyla silindi');
      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Kullanıcı silinirken bir hata oluştu');
    }
    setShowDeleteDialog(false);
  };

  // Tabs data
  const tabs = [
    { id: 'info', label: 'Bilgiler' },
    { id: 'sessions', label: 'Oturumlar' },
    { id: 'chats', label: 'Konuşmalar' },
    { id: 'requests', label: 'Talepler' },
  ];

  if (loading) {
    return (
      <AdminLayout 
        admin={admin} 
        title="Kullanıcı Detayları"
      >
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout 
        admin={admin} 
        title="Kullanıcı Bulunamadı"
      >
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{error}</h3>
            <p className="mt-2 text-sm text-gray-500">Kullanıcı bulunamadı veya erişim sağlanamadı.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/users')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kullanıcı Listesine Dön
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout
      admin={admin}
      title={`\${user.name} \${user.surname} • Kullanıcı Detayları`}
      breadcrumbs={[
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/users', label: 'Kullanıcılar' },
        { href: `/admin/users/\${id}`, label: `\${user.name} \${user.surname}` },
      ]}
    >
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* User Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold">
              {user.name.charAt(0)}
              {user.surname.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.name} {user.surname}
              </h3>
              <p className="text-sm text-gray-500">
                {format(new Date(user.createdAt), "'Kayıt tarihi:' d MMMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <a
              href={`mailto:\${user.email}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-posta Gönder
            </a>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Kullanıcıyı Sil
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`\${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Kişisel Bilgiler</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.name} {user.surname}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:\${user.email}`} className="text-blue-600 hover:text-blue-800">
                        {user.email}
                      </a>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:\${user.phone}`} className="text-blue-600 hover:text-blue-800">
                        {user.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Kullanıcı ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
                  </div>
                </dl>
              </div>

              {/* Activity Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Aktivite Özeti</h4>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Konuşmalar</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {user._count?.chats || 0}
                    </dd>
                  </div>
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Oturumlar</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {user._count?.sessions || 0}
                    </dd>
                  </div>
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Bilgi Talepleri</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {user._count?.infoRequests || 0}
                    </dd>
                  </div>
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Başvuru Talepleri</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {user._count?.appRequests || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Oturumları</h4>
              {user.sessions && user.sessions.length > 0 ? (
                <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {user.sessions.map((session) => (
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
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Oturum bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">Bu kullanıcının henüz kaydedilmiş bir oturumu bulunmuyor.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chats' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Chatbot Konuşmaları</h4>
              {user.chats && user.chats.length > 0 ? (
                <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {user.chats.map((chat) => (
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
                              <Badge color="green" size="md">Tamamlandı</Badge>
                            ) : (
                              <Badge color="yellow" size="md">Yarım Kaldı</Badge>
                            )}
                            {chat.resultedInContact && (
                              <Badge color="blue" size="md">İletişim Talebi</Badge>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Konuşma bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">Bu kullanıcının henüz kaydedilmiş bir konuşması bulunmuyor.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Bilgi Talepleri</h4>
                {user.infoRequests && user.infoRequests.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {user.infoRequests.map((request) => (
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
                              <Badge 
                                color={
                                  request.status === 'completed' ? 'green' : 
                                  request.status === 'processing' ? 'blue' : 'yellow'
                                } 
                                size="md"
                              >
                                {request.status === 'new' ? 'Yeni' : 
                                 request.status === 'processing' ? 'İşleniyor' : 
                                 request.status === 'completed' ? 'Tamamlandı' : 
                                 request.status}
                              </Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Bilgi talebi bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">Bu kullanıcının henüz kaydedilmiş bir bilgi talebi bulunmuyor.</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Başvuru Talepleri</h4>
                {user.appRequests && user.appRequests.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {user.appRequests.map((request) => (
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
                              <Badge 
                                color={
                                  request.status === 'completed' ? 'green' : 
                                  request.status === 'processing' ? 'blue' : 'yellow'
                                } 
                                size="md"
                              >
                                {request.status === 'new' ? 'Yeni' : 
                                 request.status === 'processing' ? 'İşleniyor' : 
                                 request.status === 'completed' ? 'Tamamlandı' : 
                                 request.status}
                              </Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Başvuru talebi bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">Bu kullanıcının henüz kaydedilmiş bir başvuru talebi bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteUser}
        title="Kullanıcıyı Sil"
        confirmText="Evet, Sil"
        cancelText="İptal"
        danger={true}
      >
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong className="font-medium text-gray-900">{user.name} {user.surname}</strong> isimli kullanıcıyı silmek istediğinizden emin misiniz?
          </p>
          <p>Bu işlem geri alınamaz ve kullanıcıya ait tüm veriler silinecektir:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>{user._count?.sessions || 0} oturum</li>
            <li>{user._count?.chats || 0} konuşma</li>
            <li>{user._count?.infoRequests || 0} bilgi talebi</li>
            <li>{user._count?.appRequests || 0} başvuru</li>
          </ul>
        </div>
      </ConfirmDialog>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}