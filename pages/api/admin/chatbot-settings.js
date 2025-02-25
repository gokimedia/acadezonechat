// pages/api/admin/chatbot-settings.js
import { withAdminAuth } from '../../../lib/admin/auth';
import prisma from '../../../lib/prisma';

async function handler(req, res) {
  // GET: Chatbot ayarlarını getir
  if (req.method === 'GET') {
    try {
      // Chatbot ayarlarını getir
      const settings = await prisma.chatbotSetting.findFirst();

      // Eğer ayarlar yoksa varsayılan ayarları döndür
      if (!settings) {
        return res.status(200).json({
          name: 'AcadeZone Eğitim Asistanı',
          primaryColor: '#3498db',
          secondaryColor: '#2980b9',
          welcomeMessage: 'Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim.',
          logoUrl: '',
          active: true
        });
      }

      return res.status(200).json({
        name: settings.name,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        welcomeMessage: settings.welcomeMessage,
        logoUrl: settings.logoUrl,
        active: settings.active
      });
    } catch (error) {
      console.error('Get chatbot settings error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // POST: Chatbot ayarlarını güncelle
  if (req.method === 'POST') {
    try {
      const { name, primaryColor, secondaryColor, welcomeMessage, logoUrl, active } = req.body;

      // Zorunlu alanları kontrol et
      if (!name || !primaryColor || !secondaryColor || !welcomeMessage) {
        return res.status(400).json({ message: 'İsim, ana renk, ikincil renk ve karşılama mesajı zorunludur' });
      }

      // Mevcut ayarları bul veya yeni oluştur
      const settings = await prisma.chatbotSetting.upsert({
        where: { id: (await prisma.chatbotSetting.findFirst())?.id || 'default' },
        update: {
          name,
          primaryColor,
          secondaryColor,
          welcomeMessage,
          logoUrl,
          active
        },
        create: {
          name,
          primaryColor,
          secondaryColor,
          welcomeMessage,
          logoUrl,
          active
        }
      });

      return res.status(200).json({ 
        message: 'Ayarlar başarıyla güncellendi',
        settings
      });
    } catch (error) {
      console.error('Update chatbot settings error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAdminAuth(handler);