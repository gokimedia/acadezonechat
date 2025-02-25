// pages/api/admin/courses.js
import { withAdminAuth } from '../../../lib/admin/auth';
import prisma from '../../../lib/prisma';

async function handler(req, res) {
  // GET: Kursları getir
  if (req.method === 'GET') {
    try {
      const courses = await prisma.course.findMany({
        orderBy: {
          title: 'asc'
        }
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error('Get courses error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // POST: Yeni kurs oluştur
  if (req.method === 'POST') {
    try {
      const { title, description, departmentId, url, imageUrl } = req.body;

      // Zorunlu alanları kontrol et
      if (!title || !departmentId) {
        return res.status(400).json({ message: 'Başlık ve bölüm zorunludur' });
      }

      // Bölümün varlığını kontrol et
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department) {
        return res.status(404).json({ message: 'Bölüm bulunamadı' });
      }

      // Kursu oluştur
      const course = await prisma.course.create({
        data: {
          title,
          description,
          departmentId,
          url,
          imageUrl
        }
      });

      return res.status(201).json({ 
        message: 'Kurs başarıyla oluşturuldu',
        course
      });
    } catch (error) {
      console.error('Create course error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // PUT: Kursu güncelle
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { title, description, departmentId, url, imageUrl } = req.body;

      // Zorunlu alanları kontrol et
      if (!id) {
        return res.status(400).json({ message: 'Kurs ID gereklidir' });
      }

      if (!title || !departmentId) {
        return res.status(400).json({ message: 'Başlık ve bölüm zorunludur' });
      }

      // Kursun varlığını kontrol et
      const existingCourse = await prisma.course.findUnique({
        where: { id }
      });

      if (!existingCourse) {
        return res.status(404).json({ message: 'Kurs bulunamadı' });
      }

      // Bölümün varlığını kontrol et
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department) {
        return res.status(404).json({ message: 'Bölüm bulunamadı' });
      }

      // Kursu güncelle
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: {
          title,
          description,
          departmentId,
          url,
          imageUrl
        }
      });

      return res.status(200).json({ 
        message: 'Kurs başarıyla güncellendi',
        course: updatedCourse
      });
    } catch (error) {
      console.error('Update course error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // DELETE: Kursu sil
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      // Zorunlu alanları kontrol et
      if (!id) {
        return res.status(400).json({ message: 'Kurs ID gereklidir' });
      }

      // Kursun varlığını kontrol et
      const existingCourse = await prisma.course.findUnique({
        where: { id }
      });

      if (!existingCourse) {
        return res.status(404).json({ message: 'Kurs bulunamadı' });
      }

      // Bağlı kampanyaları ve önerileri kontrol et
      const relatedCampaigns = await prisma.campaign.count({
        where: { courseId: id }
      });

      const relatedRecommendations = await prisma.recommendation.count({
        where: { courseId: id }
      });

      if (relatedCampaigns > 0 || relatedRecommendations > 0) {
        return res.status(400).json({ 
          message: 'Bu kurs kampanyalar veya öneriler tarafından kullanılıyor. Önce ilişkili kayıtları silmelisiniz.' 
        });
      }

      // Kursu sil
      await prisma.course.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Kurs başarıyla silindi' });
    } catch (error) {
      console.error('Delete course error:', error);
      
      // Yabancı anahtar kısıtlaması hatası
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          message: 'Bu kurs başka kayıtlar tarafından kullanılıyor. Önce ilişkili kayıtları silmelisiniz.' 
        });
      }
      
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAdminAuth(handler);