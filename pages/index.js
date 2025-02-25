import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';

export default function Home() {
  const [showAdminLink, setShowAdminLink] = useState(false);
  
  // Admin linkini göstermek için logo'ya 5 kez tıklanması gerekiyor
  const [clickCount, setClickCount] = useState(0);
  
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminLink(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>AcadeZone Chatbot Demo</title>
        <meta name="description" content="AcadeZone Eğitim Chatbot Demo Sayfası" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 
            className="text-3xl font-bold text-gray-900 cursor-pointer"
            onClick={handleLogoClick}
          >
            AcadeZone Chatbot
          </h1>
          
          {showAdminLink && (
            <Link href="/admin">
              <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Admin Paneli
              </a>
            </Link>
          )}
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  AcadeZone Eğitim Asistanı Demo
                </h2>
                <p className="mt-2 text-gray-600">
                  Sağ alt köşedeki chatbot butonuna tıklayarak eğitim asistanımızla etkileşime geçebilirsiniz.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-blue-900">Beslenme ve Diyetetik</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Beslenme ve diyetetik alanında sertifika programları ve eğitimler.
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-green-900">Biyomedikal Mühendisliği</h3>
                  <p className="mt-2 text-sm text-green-700">
                    Biyomedikal mühendisliği alanında sertifika programları ve eğitimler.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-purple-900">Bilgisayar Mühendisliği</h3>
                  <p className="mt-2 text-sm text-purple-700">
                    Bilgisayar mühendisliği alanında sertifika programları ve eğitimler.
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-yellow-900">Psikoloji</h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Psikoloji alanında sertifika programları ve eğitimler.
                  </p>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-red-900">Fizyoterapi</h3>
                  <p className="mt-2 text-sm text-red-700">
                    Fizyoterapi alanında sertifika programları ve eğitimler.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-indigo-900">Diğer Bölümler</h3>
                  <p className="mt-2 text-sm text-indigo-700">
                    Farklı alanlar için sunulan eğitim ve sertifika programları.
                  </p>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-sm text-gray-500">
                  Not: Bu sayfa sadece chatbot'un demo amaçlı görüntülenmesi içindir. 
                  Gerçek ortamda bu chatbot WordPress sitenize embed edilerek kullanılacaktır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Chatbot bileşeni */}
      <ChatBot />
    </div>
  );
}