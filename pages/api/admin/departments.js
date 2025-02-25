// pages/api/admin/departments.js
import { withAdminAuth } from '../../../lib/admin/auth';
import prisma from '../../../lib/prisma';

async function handler(req, res) {
  // GET: Bölümleri getir
  if (req.method === 'GET') {
    try {
      const departments = await prisma.department.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      return res.status(200).json(departments);
    } catch (error) {
      console.error('Get departments error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // POST: Yeni bölüm oluştur
  if (req.method === 'POST') {
    try {
      const { name } = req.body;

      // Zorunlu alanları kontrol et
      if (!name) {
        return res.status(400).json({ message: 'Bölüm adı zorunludur' });
      }

      // Slug oluştur
      const slug = name
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Aynı isme sahip bölüm var mı kontrol et
      const existingDepartment = await prisma.department.findFirst({
        where: { name }
      });

      if (existingDepartment) {
        return res.status(400).json({ message: 'Bu isimde bir bölüm zaten var' });
      }

      // Bölümü oluştur
      const department = await prisma.department.create({
        data: {
          name,
          slug
        }
      });

      return res.status(201).json({ 
        message: 'Bölüm başarıyla oluşturuldu',
        department
      });
    } catch (error) {
      console.error('Create department error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // PUT: Bölümü güncelle
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { name } = req.body;

      // Zorunlu alanları kontrol et
      if (!id) {
        return res.status(400).json({ message: 'Bölüm ID gereklidir' });
      }

      if (!name) {
        return res.status(400).json({ message: 'Bölüm adı zorunludur' });
      }

      // Bölümün varlığını kontrol et
      const existingDepartment = await prisma.department.findUnique({
        where: { id }
      });

      if (!existingDepartment) {
        return res.status(404).json({ message: 'Bölüm bulunamadı' });
      }

      // Aynı isme sahip farklı bir bölüm var mı kontrol et
      const duplicateDepartment = await prisma.department.findFirst({
        where: { 
          name,
          id: { not: id }
        }
      });

      if (duplicateDepartment) {
        return res.status(400).json({ message: 'Bu isimde başka bir bölüm zaten var' });
      }

      // Yeni slug oluştur
      const slug = name
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Bölümü güncelle
      const updatedDepartment = await prisma.department.update({
        where: { id },
        data: {
          name,
          slug
        }
      });

      return res.status(200).json({ 
        message: 'Bölüm başarıyla güncellendi',
        department: updatedDepartment
      });
    } catch (error) {
      console.error('Update department error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // DELETE: Bölümü sil
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      // Zorunlu alanları kontrol et
      if (!id) {
        return res.status(400).json({ message: 'Bölüm ID gereklidir' });
      }

      // Bölümün varlığını kontrol et
      const existingDepartment = await prisma.department.findUnique({
        where: { id }
      });

      if (!existingDepartment) {
        return res.status(404).json({ message: 'Bölüm bulunamadı' });
      }

      // Bağlı kursları kontrol et
      const relatedCourses = await prisma.course.count({
        where: { departmentId: id }
      });

      if (relatedCourses > 0) {
        return res.status(400).json({ 
          message: 'Bu bölüm kurslar tarafından kullanılıyor. Önce ilişkili kursları silmelisiniz.' 
        });
      }

      // Bölümü sil
      await prisma.department.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Bölüm başarıyla silindi' });
    } catch (error) {
      console.error('Delete department error:', error);
      
      // Yabancı anahtar kısıtlaması hatası
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          message: 'Bu bölüm başka kayıtlar tarafından kullanılıyor. Önce ilişkili kayıtları silmelisiniz.' 
        });
      }
      
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAdminAuth(handler);