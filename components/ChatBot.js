// components/ChatBot.js
import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaUser, FaTimes, FaChevronRight } from 'react-icons/fa';
import styles from '../styles/ChatBot.module.css';

const ChatBot = ({ isEmbedded = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    department: '',
    answers: {}
  });
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Session ID oluştur
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [sessionId]);

  // Chatbot'un ilk mesajını göster
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Chatbot ayarlarını getir
      fetchChatbotSettings();
    }
  }, [isOpen, messages.length]);

  // Her yeni mesajda en alta otomatik kaydır
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Chatbot ayarlarını getir
  const fetchChatbotSettings = async () => {
    try {
      const response = await fetch('/api/public/chatbot-settings');
      
      if (response.ok) {
        const settings = await response.json();
        
        // Karşılama mesajını göster
        addBotMessage(settings.welcomeMessage);
        
        // Analitik başlat
        startChatAnalytics();
      } else {
        // Varsayılan karşılama mesajını göster
        addBotMessage('Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim. Başlamak için adınızı öğrenebilir miyim?');
      }
    } catch (error) {
      console.error('Chatbot settings error:', error);
      
      // Varsayılan karşılama mesajını göster
      addBotMessage('Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim. Başlamak için adınızı öğrenebilir miyim?');
    }
  };

  // Bot mesajı ekle
  const addBotMessage = (text, options = null) => {
    setMessages(prev => [...prev, { sender: 'bot', text, options }]);
  };

  // Kullanıcı mesajı ekle
  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
  };

  // Mesaj gönderme
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    processUserInput(inputValue);
    setInputValue('');
  };

  // Enter tuşuna basıldığında mesaj gönderme
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Analitik başlat
  const startChatAnalytics = async () => {
    try {
      await fetch('/api/chat/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          pageUrl: window.location.href,
          referrer: document.referrer
        }),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  // Kullanıcının girişini işleme
  const processUserInput = async (input) => {
    switch (currentStep) {
      case 'welcome':
        setUserData(prev => ({ ...prev, name: input }));
        setCurrentStep('surname');
        setTimeout(() => {
          addBotMessage('Teşekkürler! Soyadınızı da öğrenebilir miyim?');
        }, 500);
        break;
      
      case 'surname':
        setUserData(prev => ({ ...prev, surname: input }));
        setCurrentStep('email');
        setTimeout(() => {
          addBotMessage('Teşekkürler! E-posta adresinizi alabilir miyim?');
        }, 500);
        break;
      
      case 'email':
        // Basit e-posta doğrulama
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(input)) {
          addBotMessage('Geçerli bir e-posta adresi giriniz.');
          return;
        }
        
        setUserData(prev => ({ ...prev, email: input }));
        setCurrentStep('phone');
        setTimeout(() => {
          addBotMessage('Teşekkürler! Telefon numaranızı da alabilir miyim?');
        }, 500);
        break;
      
      case 'phone':
        // Basit telefon doğrulama
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(input.replace(/\D/g, ''))) {
          addBotMessage('Geçerli bir telefon numarası giriniz (10-11 rakam).');
          return;
        }
        
        setUserData(prev => ({ ...prev, phone: input }));
        setCurrentStep('department');
        setTimeout(() => {
          addBotMessage('Teşekkürler! Hangi bölümle ilgileniyorsunuz?', [
            'Beslenme ve Diyetetik',
            'Biyomedikal Mühendisliği',
            'Bilgisayar Mühendisliği',
            'Psikoloji',
            'Diğer'
          ]);
        }, 500);
        break;
      
      case 'department':
        setUserData(prev => ({ ...prev, department: input }));
        
        // Kullanıcı verilerini veritabanına kaydet
        try {
          const response = await fetch('/api/chat/save-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...userData,
              department: input,
              sessionId
            }),
          });
          
          if (!response.ok) {
            throw new Error('Kullanıcı kaydedilirken bir hata oluştu');
          }
          
          const data = await response.json();
          
          // Kullanıcı ID'sini sakla
          setUserData(prev => ({ ...prev, id: data.userId }));
          
          // Chat analitiği güncelle
          await fetch('/api/chat/analytics/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              userId: data.userId,
              department: input
            }),
          });
        } catch (error) {
          console.error('Kullanıcı kaydetme hatası:', error);
        }
        
        setCurrentStep('interest');
        setTimeout(() => {
          addBotMessage(`${input} bölümünde hangi alanlara ilgi duyuyorsunuz?`, [
            'Akademik Kariyer',
            'Sertifika Programları',
            'Uzaktan Eğitim',
            'Yüz Yüze Eğitim',
            'Hepsi'
          ]);
        }, 500);
        break;
      
      case 'interest':
        setUserData(prev => ({ 
          ...prev, 
          answers: { ...prev.answers, interest: input } 
        }));
        setCurrentStep('level');
        setTimeout(() => {
          addBotMessage('Hangi seviyede eğitim arıyorsunuz?', [
            'Başlangıç',
            'Orta',
            'İleri',
            'Hepsi'
          ]);
        }, 500);
        break;
      
      case 'level':
        setUserData(prev => ({ 
          ...prev, 
          answers: { ...prev.answers, level: input } 
        }));
        setCurrentStep('time');
        setTimeout(() => {
          addBotMessage('Eğitim için ne kadar zaman ayırabilirsiniz?', [
            'Haftada 2-4 saat',
            'Haftada 5-10 saat',
            'Haftada 10+ saat',
            'Esnek'
          ]);
        }, 500);
        break;
      
      case 'time':
        setUserData(prev => ({ 
          ...prev, 
          answers: { ...prev.answers, time: input } 
        }));
        
        // Kullanıcı oturumunu güncelle
        try {
          await fetch('/api/chat/update-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userData.id,
              department: userData.department,
              sessionData: {
                ...userData.answers,
                time: input
              }
            }),
          });
        } catch (error) {
          console.error('Oturum güncelleme hatası:', error);
        }
        
        setCurrentStep('recommendations');
        
        // Eğitim önerilerini getir
        try {
          setTimeout(async () => {
            addBotMessage('Teşekkürler! Verdiğiniz bilgilere göre size uygun eğitim programlarını buluyorum...');
            
            const response = await fetch('/api/chat/recommendations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                department: userData.department,
                interest: userData.answers.interest,
                level: userData.answers.level,
                time: input
              }),
            });
            
            if (!response.ok) {
              throw new Error('Önerileri alırken bir hata oluştu');
            }
            
            const { courses, campaigns } = await response.json();
            
            if (courses.length === 0) {
              addBotMessage('Aradığınız kriterlere uygun eğitim programı bulamadım. Kriterlerinizi değiştirmek ister misiniz?', ['Evet', 'Hayır']);
              setCurrentStep('no_results');
              return;
            }
            
            // Kursları listele
            setTimeout(() => {
              addBotMessage(`Size uygun ${courses.length} eğitim programı buldum:`);
              
              courses.forEach((course, index) => {
                setTimeout(() => {
                  addBotMessage(
                    `${index + 1}. ${course.title}\n${course.description}\n${course.url}`,
                    index === courses.length - 1 ? ['Detaylı bilgi almak istiyorum', 'Başvuru yapmak istiyorum'] : null
                  );
                }, index * 800);
              });
              
              // Aktif kampanyaları göster
              if (campaigns.length > 0) {
                setTimeout(() => {
                  addBotMessage('Ayrıca şu anda aktif olan kampanyalarımız:');
                  
                  campaigns.forEach((campaign, index) => {
                    setTimeout(() => {
                      addBotMessage(`${campaign.title}: ${campaign.description} (İndirim: %${campaign.discountRate})`);
                    }, index * 800);
                  });
                }, courses.length * 800 + 500);
              }
              
              // Chat analitiği güncelle (tamamlandı)
              fetch('/api/chat/analytics/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId,
                  completed: true
                }),
              }).catch(error => {
                console.error('Analytics update error:', error);
              });
            }, 1000);
          }, 500);
        } catch (error) {
          console.error('Öneri alma hatası:', error);
          addBotMessage('Önerileri alırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
        }
        break;
      
      case 'no_results':
        if (input === 'Evet') {
          // Kriterleri sıfırla ve yeniden başla
          setUserData(prev => ({ ...prev, answers: {} }));
          setCurrentStep('interest');
          setTimeout(() => {
            addBotMessage(`${userData.department} bölümünde hangi alanlara ilgi duyuyorsunuz?`, [
              'Akademik Kariyer',
              'Sertifika Programları',
              'Uzaktan Eğitim',
              'Yüz Yüze Eğitim',
              'Hepsi'
            ]);
          }, 500);
        } else {
          addBotMessage('Anladım. Başka bir konuda yardımcı olabilir miyim?', [
            'Evet, farklı bir bölüm hakkında soru sormak istiyorum',
            'Hayır, teşekkürler'
          ]);
          setCurrentStep('end');
        }
        break;
      
      case 'recommendations':
        if (input === 'Detaylı bilgi almak istiyorum') {
          addBotMessage('Detaylı bilgi için öğrenci işleri birimimiz sizinle iletişime geçecektir. Teşekkür ederiz!');
          
          // Bilgi talebi oluştur
          try {
            await fetch('/api/chat/create-info-request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userData.id,
                requestType: 'detaylı bilgi'
              }),
            });
            
            // Chat analitiği güncelle (iletişim talebinde bulunuldu)
            fetch('/api/chat/analytics/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                resultedInContact: true
              }),
            }).catch(error => {
              console.error('Analytics update error:', error);
            });
          } catch (error) {
            console.error('Bilgi talebi oluşturma hatası:', error);
          }
          
          setCurrentStep('end');
        } else if (input === 'Başvuru yapmak istiyorum') {
          addBotMessage('Başvuru formuna yönlendiriliyorsunuz...');
          
          // Başvuru talebi oluştur
          try {
            await fetch('/api/chat/create-application-request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userData.id,
                requestType: 'başvuru'
              }),
            });
            
            // Chat analitiği güncelle (iletişim talebinde bulunuldu)
            fetch('/api/chat/analytics/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                resultedInContact: true
              }),
            }).catch(error => {
              console.error('Analytics update error:', error);
            });
          } catch (error) {
            console.error('Başvuru talebi oluşturma hatası:', error);
          }
          
          // Başvuru sayfasına yönlendir
          setTimeout(() => {
            window.location.href = `https://acadezone.com/basvuru?department=${encodeURIComponent(userData.department)}&ref=chatbot&user=${userData.id}`;
          }, 1500);
        }
        break;
      
      case 'end':
        if (input === 'Evet, farklı bir bölüm hakkında soru sormak istiyorum') {
          setCurrentStep('department');
          setTimeout(() => {
            addBotMessage('Hangi bölümle ilgileniyorsunuz?', [
              'Beslenme ve Diyetetik',
              'Biyomedikal Mühendisliği',
              'Bilgisayar Mühendisliği',
              'Psikoloji',
              'Diğer'
            ]);
          }, 500);
        } else {
          addBotMessage('Teşekkür ederiz! İhtiyacınız olduğunda tekrar yardımcı olmaktan memnuniyet duyarız. İyi günler dileriz!');
          
          // Chat analitiği güncelle (sohbet sonu)
          fetch('/api/chat/analytics/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              endTime: new Date()
            }),
          }).catch(error => {
            console.error('Analytics update error:', error);
          });
        }
        break;
      
      default:
        addBotMessage('Anlamadım. Lütfen tekrar deneyin.');
    }
  };

  // Seçenek butonlarına tıklama
  const handleOptionClick = (option) => {
    addUserMessage(option);
    processUserInput(option);
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chatbot açma/kapama butonu */}
      {!isEmbedded && (
        <button 
          className={styles.chatToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaRobot />}
        </button>
      )}
      
      {/* Chat penceresi */}
      {(isOpen || isEmbedded) && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <FaRobot />
            <h3>AcadeZone Eğitim Asistanı</h3>
            {!isEmbedded && (
              <button 
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map((message, index) => (
              <div key={index} className={`${styles.message} ${message.sender === 'bot' ? styles.botMessage : styles.userMessage}`}>
                <div className={styles.messageAvatar}>
                  {message.sender === 'bot' ? <FaRobot /> : <FaUser />}
                </div>
                <div className={styles.messageContent}>
                  <p>{message.text}</p>
                  
                  {/* Seçenek butonları */}
                  {message.options && (
                    <div className={styles.options}>
                      {message.options.map((option, idx) => (
                        <button
                          key={idx}
                          className={styles.optionButton}
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className={styles.chatInput}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın..."
              disabled={
                currentStep === 'recommendations' || 
                messages.some(m => m.options && m.options.length > 0)
              }
            />
            <button 
              onClick={handleSendMessage}
              disabled={
                !inputValue.trim() || 
                currentStep === 'recommendations' || 
                messages.some(m => m.options && m.options.length > 0)
              }
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;