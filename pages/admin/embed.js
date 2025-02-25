// pages/admin/embed.js
import { useState } from 'react';
import AdminLayout from '../../components/admin/Layout';
import EmbedCodeGenerator from '../../components/admin/EmbedCodeGenerator';
import { requireAdminAuth } from '../../lib/admin/auth';

export default function EmbedCode({ admin }) {
  const [siteUrl, setSiteUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  return (
    <AdminLayout admin={admin} title="Embed Kodu">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Site URL Ayarı</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Aşağıdaki URL, oluşturulan embed kodunda kullanılacaktır. Lütfen chatbot'un yayınlandığı doğru URL'yi girin.
              </p>
            </div>
            <div className="mt-5 sm:flex sm:items-center">
              <div className="max-w-xs w-full">
                <label htmlFor="siteUrl" className="sr-only">Site URL</label>
                <input
                  type="url"
                  name="siteUrl"
                  id="siteUrl"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://example.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
              <span className="mt-3 sm:mt-0 sm:ml-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    // URL formunu kaydet
                    localStorage.setItem('chatbotSiteUrl', siteUrl);
                    alert('URL güncellendi!');
                  }}
                >
                  Kaydet
                </button>
              </span>
            </div>
          </div>
        </div>
        
        {/* Embed Kodu Oluşturucu */}
        <EmbedCodeGenerator siteUrl={siteUrl} />
        
        {/* Kurulum Rehberi */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">WordPress Kurulum Rehberi</h3>
            <div className="mt-2 text-sm text-gray-500">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Yukarıdaki embed kodunu kopyalayın.
                </li>
                <li>
                  WordPress admin panelinize giriş yapın.
                </li>
                <li>
                  <strong>Seçenek 1:</strong> Eğer bir "Header Scripts" eklentiniz varsa (örneğin, Insert Headers and Footers), eklentiyi açın ve embed kodunu eklentinin header bölümüne yapıştırın.
                </li>
                <li>
                  <strong>Seçenek 2:</strong> Temanızın header.php dosyasını düzenleyin ve embed kodunu <code>&lt;head&gt;</code> etiketinin içine, kapanış etiketinden (<code>&lt;/head&gt;</code>) önce yapıştırın.
                </li>
                <li>
                  Değişiklikleri kaydedin ve sitenizi yenileyin. Chatbot sağ alt köşede görünmelidir.
                </li>
              </ol>
            </div>
            <div className="mt-5 border-t border-gray-200 pt-5">
              <h4 className="text-md font-medium text-gray-900">Özelleştirme Seçenekleri</h4>
              <div className="mt-2 text-sm text-gray-500">
                <p className="mb-2">
                  Embed kodunu oluştururken aşağıdaki özelleştirme seçeneklerini kullanabilirsiniz:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Bölüm:</strong> Chatbot'un açılışta hangi bölüm için bilgi toplayacağını belirler.</li>
                  <li><strong>Pozisyon:</strong> Chatbot butonunun sağda mı yoksa solda mı görüneceğini belirler.</li>
                  <li><strong>Otomatik Açılma:</strong> Sayfa yüklendikten sonra chatbot'un otomatik açılıp açılmayacağını belirler.</li>
                  <li><strong>Mobilde Gizleme:</strong> Mobil cihazlarda chatbot'un gösterilip gösterilmeyeceğini belirler.</li>
                  <li><strong>Gecikme Süresi:</strong> Otomatik açılma aktifse, sayfa yüklendikten kaç milisaniye sonra chatbot'un açılacağını belirler.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  return requireAdminAuth(context);
}