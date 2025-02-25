(function() {
    // Chatbot container oluştur
    const createChatbotContainer = () => {
      const container = document.createElement('div');
      container.id = 'acadezone-chatbot-container';
      document.body.appendChild(container);
      return container;
    };
  
    // Chatbot iframe oluştur
    const createChatbotIframe = (container) => {
      // Bu URL'yi Vercel'de deploy ettiğiniz URL ile değiştirin
      const chatbotUrl = 'https://your-chatbot-url.vercel.app/chatbot-embed';
      
      const iframe = document.createElement('iframe');
      iframe.src = chatbotUrl;
      iframe.id = 'acadezone-chatbot-iframe';
      iframe.style.border = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.position = 'fixed';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.zIndex = '9999';
      iframe.style.opacity = '0';
      iframe.style.transition = 'all 0.3s ease';
      container.appendChild(iframe);
      
      return iframe;
    };
  
    // Toggle butonu oluştur
    const createToggleButton = (container, iframe) => {
      const button = document.createElement('button');
      button.id = 'acadezone-chatbot-toggle';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>';
      button.style.position = 'fixed';
      button.style.bottom = '20px';
      button.style.right = '20px';
      button.style.width = '60px';
      button.style.height = '60px';
      button.style.borderRadius = '50%';
      button.style.backgroundColor = '#3498db';
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
        button.style.backgroundColor = '#2980b9';
        button.style.transform = 'scale(1.05)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#3498db';
        button.style.transform = 'scale(1)';
      });
      
      let isOpen = false;
      
      button.addEventListener('click', () => {
        isOpen = !isOpen;
        
        if (isOpen) {
          iframe.style.width = '350px';
          iframe.style.height = '500px';
          iframe.style.opacity = '1';
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        } else {
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.opacity = '0';
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>';
        }
      });
      
      container.appendChild(button);
      return button;
    };
  
    // Chatbot yükleme
    const loadChatbot = () => {
      const container = createChatbotContainer();
      const iframe = createChatbotIframe(container);
      const toggleButton = createToggleButton(container, iframe);
    };(function() {
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
        const currentScript = scripts[scripts.length - 1];
        const src = currentScript.src;
        
        // URL'den embed.js kısmını çıkar
        return src.replace('/embed.js', '');
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
        container.appendChild(iframe);
        
        return iframe;
      };
    
      // Toggle butonu oluştur
      const createToggleButton = (container, iframe, settings) => {
        const button = document.createElement('button');
        button.id = 'acadezone-chatbot-toggle';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = config.position === 'left' ? 'auto' : '20px';
        button.style.left = config.position === 'left' ? '20px' : 'auto';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = settings.primaryColor || '#3498db';
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
          button.style.backgroundColor = settings.secondaryColor || '#2980b9';
          button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.backgroundColor = settings.primaryColor || '#3498db';
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
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>';
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
  
    // Sayfa tamamen yüklendikten sonra chatbot'u yükle
    if (document.readyState === 'complete') {
      loadChatbot();
    } else {
      window.addEventListener('load', loadChatbot);
    }
  })();