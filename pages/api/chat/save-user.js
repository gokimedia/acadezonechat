// pages/api/chat/save-user.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { name, surname, email, phone, department, sessionId } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !surname || !email || !phone) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }
    
    // Kullanıcıyı veritabanına kaydet
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        phone
      }
    });
    
    // Departmanı kontrol et ve kaydet
    if (department) {
      // Bölümü veritabanında ara
      let departmentRecord = await prisma.department.findFirst({
        where: { name: department }
      });
      
      if (!departmentRecord) {
        // Bölüm yoksa oluştur
        const slug = department
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        departmentRecord = await prisma.department.create({
          data: {
            name: department,
            slug
          }
        });
      }
      
      // Chat analitiğini güncelle
      if (sessionId) {
        await prisma.chatAnalytic.update({
          where: { sessionId },
          data: {
            userId: user.id,
            departmentId: departmentRecord.id
          }
        });
      }
    }
    
    return res.status(200).json({ 
      message: 'Kullanıcı başarıyla kaydedildi',
      userId: user.id
    });
  } catch (error) {
    console.error('Kullanıcı kaydetme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}