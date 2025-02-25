// pages/api/chat/recommendations.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { department, interest, level, time } = req.body;
    
    if (!department) {
      return res.status(400).json({ message: 'Bölüm bilgisi gereklidir' });
    }
    
    // Bölümü bul
    const departmentRecord = await prisma.department.findFirst({
      where: { name: department }
    });
    
    if (!departmentRecord) {
      return res.status(404).json({ message: 'Bölüm bulunamadı' });
    }
    
    // İlgili kursları getir
    const departmentId = departmentRecord.id;
    let courseFilters = { departmentId };
    
    // Filtreler ekleme
    if (interest && interest !== 'Hepsi') {
      courseFilters.description = { contains: interest, mode: 'insensitive' };
    }
    
    if (level && level !== 'Hepsi') {
      if (courseFilters.description) {
        courseFilters.AND = [
          { description: courseFilters.description },
          { description: { contains: level, mode: 'insensitive' } }
        ];
        delete courseFilters.description;
      } else {
        courseFilters.description = { contains: level, mode: 'insensitive' };
      }
    }
    
    if (time && time !== 'Esnek') {
      if (courseFilters.AND) {
        courseFilters.AND.push({ description: { contains: time, mode: 'insensitive' } });
      } else if (courseFilters.description) {
        courseFilters.AND = [
          { description: courseFilters.description },
          { description: { contains: time, mode: 'insensitive' } }
        ];
        delete courseFilters.description;
      } else {
        courseFilters.description = { contains: time, mode: 'insensitive' };
      }
    }
    
    // Kursları getir
    const courses = await prisma.course.findMany({
      where: courseFilters,
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        imageUrl: true
      }
    });
    
    // Aktif kampanyaları getir
    const today = new Date();
    const campaigns = await prisma.campaign.findMany({
      where: {
        course: {
          departmentId
        },
        expiryDate: {
          gte: today
        }
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    });
    
    return res.status(200).json({
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        url: course.url || '',
        imageUrl: course.imageUrl || ''
      })),
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description || '',
        discountRate: campaign.discountRate || 0,
        courseName: campaign.course?.title || ''
      }))
    });
  } catch (error) {
    console.error('Öneri getirme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}