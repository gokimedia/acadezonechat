// components/admin/EmbedCodeGenerator.js
import { useState, useRef } from 'react';

const EmbedCodeGenerator = ({ siteUrl }) => {
  const [department, setDepartment] = useState('');
  const [autoOpen, setAutoOpen] = useState(false);
  const [hideOnMobile, setHideOnMobile] = useState(false);
  const [position, setPosition] = useState('right');
  const [delay, setDelay] = useState(2000);
  
  const codeRef = useRef(null);
  
  // Embed kodunu oluştur
  const generateEmbedCode = () => {
    // Konfigürasyon nesnesi
    const configObj = {
      ...(department && { department }),
      ...(autoOpen && { autoOpen: true }),
      ...(hideOnMobile && { hideOnMobile: true }),
      ...(position !== 'right' && { position }),
      ...(delay !== 2000 && { delay: parseInt(delay) })
    };
    
    // Konfigürasyon değerleri varsa onları ekle
    const configCode = Object.keys(configObj).length > 0
      ? `<script>
  window.acadezoneConfig = ${JSON.stringify(configObj, null, 2)};
</script>`
      : '';
    
    const scriptCode = `<script src="${siteUrl}/embed.js" async></script>`;
    
    return `<!-- AcadeZone Chatbot Embed Kodu -->
${configCode}
${scriptCode}
<!-- AcadeZone Chatbot Embed Kodu Sonu -->`;
  };
  
  // Kodu panoya kopyala
  const copyToClipboard = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand('copy');
      alert('Kod panoya kopyalandı!');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Chatbot Embed Kodu Oluşturucu</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bölüm seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bölüm (Opsiyonel)
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Seçilmedi</option>
              <option value="Beslenme ve Diyetetik">Beslenme ve Diyetetik</option>
              <option value="Biyomedikal Mühendisliği">Biyomedikal Mühendisliği</option>
              <option value="Bilgisayar Mühendisliği">Bilgisayar Mühendisliği</option>
              <option value="Psikoloji">Psikoloji</option>
              <option value="Fizyoterapi">Fizyoterapi</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Ziyaretçi için varsayılan bölümü seçin
            </p>
          </div>
          
          {/* Pozisyon seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pozisyon
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="position"
                  value="right"
                  checked={position === 'right'}
                  onChange={() => setPosition('right')}
                />
                <span className="ml-2">Sağ</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="position"
                  value="left"
                  checked={position === 'left'}
                  onChange={() => setPosition('left')}
                />
                <span className="ml-2">Sol</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Otomatik açılma */}
          <div className="flex items-center">
            <input
              id="autoOpen"
              name="autoOpen"
              type="checkbox"
              checked={autoOpen}
              onChange={() => setAutoOpen(!autoOpen)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoOpen" className="ml-2 block text-sm text-gray-700">
              Otomatik Açılsın
            </label>
          </div>
          
          {/* Mobilde gizle */}
          <div className="flex items-center">
            <input
              id="hideOnMobile"
              name="hideOnMobile"
              type="checkbox"
              checked={hideOnMobile}
              onChange={() => setHideOnMobile(!hideOnMobile)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hideOnMobile" className="ml-2 block text-sm text-gray-700">
              Mobilde Gizle
            </label>
          </div>
          
          {/* Gecikme süresi */}
          <div>
            <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-1">
              Gecikme Süresi (ms)
            </label>
            <input
              type="number"
              name="delay"
              id="delay"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              disabled={!autoOpen}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${!autoOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
        
        {/* Embed kodu */}
        <div>
          <label htmlFor="embedCode" className="block text-sm font-medium text-gray-700 mb-1">
            Embed Kodu
          </label>
          <div className="mt-1 relative">
            <textarea
              ref={codeRef}
              id="embedCode"
              name="embedCode"
              rows={8}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono"
              readOnly
              value={generateEmbedCode()}
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-2 top-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kopyala
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Bu kodu, chatbot'u göstermek istediğiniz WordPress sitenizin header.php dosyasına veya header scripts eklentisine ekleyin.
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Dikkat</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Bu embed kodunu kullanmadan önce, chatbot ayarlarınızın doğru olduğundan ve chatbot'un aktif olduğundan emin olun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;