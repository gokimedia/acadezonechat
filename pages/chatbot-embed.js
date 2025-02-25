// pages/chatbot-embed.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ChatBot from '../components/ChatBot';

const ChatBotEmbed = () => {
  const router = useRouter();
  const { department } = router.query;
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chatbot ayarlarını getir
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/public/chatbot-settings');
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Chatbot settings error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Ana sayfadan gelen mesajları dinle
  useEffect(() => {
    const handleMessage = (event) => {
      // Gelen mesajları işle
      console.log('Received message:', event.data);
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Ana sayfaya mesaj gönder
  const sendMessageToParent = (message) => {
    if (window.parent) {
      window.parent.postMessage(message, '*');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (settings && !settings.active) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center p-4 rounded-lg">
          <p className="text-gray-500">Chatbot şu anda aktif değil.</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{settings?.name || 'AcadeZone Chatbot'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100%;
            width: 100%;
            overflow: hidden;
            background-color: transparent;
          }
          
          #chatbot-embed-container {
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </Head>
      
      <div id="chatbot-embed-container">
        <ChatBot 
          isEmbedded={true} 
          settings={settings}
          initialDepartment={department}
          onSessionStart={() => sendMessageToParent({ type: 'session_start' })}
          onSessionEnd={() => sendMessageToParent({ type: 'session_end' })}
          onFormSubmit={(data) => sendMessageToParent({ type: 'form_submit', data })}
        />
      </div>
    </>
  );
};

export default ChatBotEmbed;