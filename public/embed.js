(function() {
  // Varsayılan konfigürasyon
  const defaultConfig = {
    department: "",
    autoOpen: false,
    hideOnMobile: false,
    position: "right",
    delay: 2000
  };

  // Kullanıcı konfigürasyonu ile varsayılan konfigürasyonu birleştir
  const config = Object.assign({}, defaultConfig, window.acadezoneConfig || {});
  
  // Mobil kontrolü
  const isMobile = window.innerWidth < 768;
  
  // Mobilde gizleme seçeneği
  if (config.hideOnMobile && isMobile) {
    return;
  }

  // Chatbot ayarlarını sunucudan getir
  const fetchChatbotSettings = async () => {
    try {
      const response = await fetch(`${getChatbotUrl()}/api/public/chatbot-settings`);
      
      if (response.ok) {
        const settings = await response.json();
        if (!settings.active) {
          // Chatbot aktif değilse yükleme
          return null;
        }
        return settings;
      }
      
      return null;
    } catch (error) {
      console.error('Chatbot settings error:', error);
      return null;
    }
  };

  // Chatbot URL'sini tespit et
  const getChatbotUrl = () => {
    // Bu script'in kaynak URL'sini al
    const scripts = document.getElementsByTagName('script');
    let currentScript = null;
    
    // Mevcut script'i bul
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('/embed.js')) {
        currentScript = scripts[i];
        break;
      }
    }
    
    if (!currentScript) {
      return '';
    }
    
    // URL'den embed.js kısmını çıkar
    return currentScript.src.replace('/embed.js', '');
  };

  // Chatbot container oluştur
  const createChatbotContainer = () => {
    const container = document.createElement('div');
    container.id = 'acadezone-chatbot-container';
    document.body.appendChild(container);
    return container;
  };

  // Chatbot iframe oluştur
  const createChatbotIframe = (container, settings) => {
    // Chatbot URL'sini al
    const chatbotUrl = `${getChatbotUrl()}/chatbot-embed`;
    
    // URL parametreleri oluştur
    const params = new URLSearchParams();
    if (config.department) {
      params.append('department', config.department);
    }
    
    // Tam URL oluştur
    const fullUrl = `${chatbotUrl}?${params.toString()}`;
    
    const iframe = document.createElement('iframe');
    iframe.src = fullUrl;
    iframe.id = 'acadezone-chatbot-iframe';
    iframe.style.border = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = config.position === 'left' ? 'auto' : '0';
    iframe.style.left = config.position === 'left' ? '0' : 'auto';
    iframe.style.zIndex = '9999';
    iframe.style.opacity = '0';
    iframe.style.transition = 'all 0.3s ease';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    container.appendChild(iframe);
    
    return iframe;
  };

  // Toggle butonu oluştur
  const createToggleButton = (container, iframe, settings) => {
    const button = document.createElement('button');
    button.id = 'acadezone-chatbot-toggle';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = config.position === 'left' ? 'auto' : '20px';
    button.style.left = config.position === 'left' ? '20px' : 'auto';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = settings?.primaryColor || '#3498db';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '10000';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'all 0.3s ease';
    
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = settings?.secondaryColor || '#2980b9';
      button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = settings?.primaryColor || '#3498db';
      button.style.transform = 'scale(1)';
    });
    
    let isOpen = false;
    
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      
      if (isOpen) {
        iframe.style.width = isMobile ? '100%' : '350px';
        iframe.style.height = isMobile ? '100%' : '500px';
        iframe.style.opacity = '1';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      } else {
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.opacity = '0';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      }
    });
    
    container.appendChild(button);
    
    // Otomatik açılma ayarı
    if (config.autoOpen) {
      setTimeout(() => {
        if (!isOpen) {
          button.click();
        }
      }, config.delay);
    }
    
    return button;
  };

  // Chatbot yükleme
  const loadChatbot = async () => {
    // Chatbot ayarlarını getir
    const settings = await fetchChatbotSettings();
    
    // Eğer chatbot aktif değilse yükleme
    if (!settings) {
      return;
    }
    
    const container = createChatbotContainer();
    const iframe = createChatbotIframe(container, settings);
    const toggleButton = createToggleButton(container, iframe, settings);
  };

  // Sayfa tamamen yüklendikten sonra chatbot'u yükle
  if (document.readyState === 'complete') {
    loadChatbot();
  } else {
    window.addEventListener('load', loadChatbot);
  }
})();