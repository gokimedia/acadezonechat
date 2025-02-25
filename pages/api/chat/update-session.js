// pages/api/chat/update-session.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { userId, department, sessionData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'Kullanıcı ID gereklidir' });
    }
    
    // Departmanı kontrol et
    let departmentId = null;
    if (department) {
      const departmentRecord = await prisma.department.findFirst({
        where: { name: department }
      });
      
      if (departmentRecord) {
        departmentId = departmentRecord.id;
      }
    }
    
    // Mevcut oturumu kontrol et
    const existingSession = await prisma.userSession.findFirst({
      where: { userId }
    });
    
    if (existingSession) {
      // Mevcut oturumu güncelle
      await prisma.userSession.update({
        where: { id: existingSession.id },
        data: {
          departmentId,
          sessionData
        }
      });
    } else {
      // Yeni oturum oluştur
      await prisma.userSession.create({
        data: {
          userId,
          departmentId,
          sessionData
        }
      });
    }
    
    return res.status(200).json({ message: 'Oturum başarıyla güncellendi' });
  } catch (error) {
    console.error('Oturum güncelleme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}