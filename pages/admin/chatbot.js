// pages/admin/chatbot.js
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Layout';
import { requireAdminAuth } from '../../lib/admin/auth';

export default function ChatbotSettings({ admin }) {
  const [settings, setSettings] = useState({
    name: 'AcadeZone Eğitim Asistanı',
    primaryColor: '#3498db',
    secondaryColor: '#2980b9',
    welcomeMessage: 'Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim.',
    logoUrl: '',
    active: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Chatbot ayarlarını getir
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/chatbot-settings');
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Chatbot settings error:', error);
        setMessage({ type: 'error', text: 'Ayarlar yüklenirken bir hata oluştu' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/chatbot-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi' });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout admin={admin} title="Chatbot Ayarları">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {message.text && (
              <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Chatbot Adı
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={settings.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                      Ana Renk
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: settings.primaryColor }}
                        ></span>
                      </span>
                      <input
                        type="text"
                        name="primaryColor"
                        id="primaryColor"
                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={settings.primaryColor}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                      İkincil Renk
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: settings.secondaryColor }}
                        ></span>
                      </span>
                      <input
                        type="text"
                        name="secondaryColor"
                        id="secondaryColor"
                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={settings.secondaryColor}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                    Karşılama Mesajı
                  </label>
                  <textarea
                    id="welcomeMessage"
                    name="welcomeMessage"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={settings.welcomeMessage}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                    Logo URL (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    name="logoUrl"
                    id="logoUrl"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={settings.logoUrl}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={settings.active}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="active" className="font-medium text-gray-700">
                      Aktif
                    </label>
                    <p className="text-gray-500">Chatbot'u aktif etmek veya devre dışı bırakmak için kullanın.</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </>
                    ) : 'Kaydet'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}