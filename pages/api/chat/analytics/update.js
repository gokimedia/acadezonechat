// pages/api/chat/analytics/update.js
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { sessionId, userId, department, messageCount, completed, resultedInContact, endTime } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID gereklidir' });
    }
    
    // Analitik kaydını bul
    const analytics = await prisma.chatAnalytic.findUnique({
      where: { sessionId }
    });
    
    if (!analytics) {
      return res.status(404).json({ message: 'Analitik kaydı bulunamadı' });
    }
    
    // Güncellenecek verileri hazırla
    let updateData = {};
    
    if (userId) {
      updateData.userId = userId;
    }
    
    if (department) {
      // Önce department ID'sini bul
      const departmentRecord = await prisma.department.findFirst({
        where: { name: department }
      });
      
      if (departmentRecord) {
        updateData.departmentId = departmentRecord.id;
      }
    }
    
    if (messageCount !== undefined) {
      updateData.messageCount = messageCount;
    }
    
    if (completed !== undefined) {
      updateData.completed = completed;
    }
    
    if (resultedInContact !== undefined) {
      updateData.resultedInContact = resultedInContact;
    }
    
    if (endTime) {
      updateData.endTime = new Date(endTime);
    }
    
    // Analitik kaydını güncelle
    await prisma.chatAnalytic.update({
      where: { sessionId },
      data: updateData
    });
    
    return res.status(200).json({ message: 'Analitik kaydı başarıyla güncellendi' });
  } catch (error) {
    console.error('Analitik güncelleme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}