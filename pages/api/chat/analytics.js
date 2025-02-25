// pages/api/chat/analytics.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { sessionId, pageUrl, referrer } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID gereklidir' });
    }
    
    // Analitik kaydını oluştur
    const analytics = await prisma.chatAnalytic.create({
      data: {
        sessionId,
        startTime: new Date(),
        messageCount: 0,
        completed: false,
        resultedInContact: false,
        pageUrl,
        referrer
      }
    });
    
    return res.status(200).json({ 
      message: 'Chat analitik kaydı başarıyla oluşturuldu',
      analyticsId: analytics.id
    });
  } catch (error) {
    console.error('Chat analitik oluşturma hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}