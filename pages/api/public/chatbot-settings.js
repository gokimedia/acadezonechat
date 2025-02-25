// pages/api/public/chatbot-settings.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
    console.error('Get public chatbot settings error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}