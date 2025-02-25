// pages/api/chat/create-application-request.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { userId, requestType } = req.body;
    
    if (!userId || !requestType) {
      return res.status(400).json({ message: 'Kullanıcı ID ve talep türü gereklidir' });
    }
    
    // Başvuru talebini kaydet
    const request = await prisma.applicationRequest.create({
      data: {
        userId,
        requestType,
        status: 'new'
      }
    });
    
    return res.status(200).json({ 
      message: 'Başvuru talebi başarıyla oluşturuldu',
      requestId: request.id
    });
  } catch (error) {
    console.error('Başvuru talebi oluşturma hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}