// pages/chatbot-embed.js
import React, { useEffect } from 'react';
import Head from 'next/head';
import ChatBot from '../components/ChatBot';

const ChatBotEmbed = () => {
  // Iframe içeriğinin içindeyken mesajlarla iletişim kur
  useEffect(() => {
    // Ana sayfadan gelen mesajları dinle
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  const handleMessage = (event) => {
    // Ana sayfadan mesajları işle
    // Örneğin: URL veya bölüm bilgisi
    console.log('Received message:', event.data);
  };
  
  return (
    <>
      <Head>
        <title>AcadeZone Chatbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100%;
            width: 100%;
            overflow: hidden;
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
        <ChatBot isEmbedded={true} />
      </div>
    </>
  );
};

export default ChatBotEmbed;