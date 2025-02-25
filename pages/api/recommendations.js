// pages/api/recommendations.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { department, interest, level, time } = req.body;
    
    if (!department) {
      return res.status(400).json({ message: 'Bölüm bilgisi gereklidir' });
    }
    
    // Bölümün ID'sini al
    const departments = await query(
      `SELECT id FROM departments WHERE name = ?`,
      [department]
    );
    
    if (departments.length === 0) {
      return res.status(404).json({ message: 'Bölüm bulunamadı' });
    }
    
    const departmentId = departments[0].id;
    
    // İlgili kursları getir
    // Not: Bu kısım gerçek bir sistemde daha karmaşık bir öneri algoritması kullanabilir
    let coursesQuery = `
      SELECT id, title, description, url, image_url
      FROM courses
      WHERE department_id = ?
    `;
    
    let params = [departmentId];
    
    // Filtreler ekleme
    if (interest && interest !== 'Hepsi') {
      coursesQuery += ` AND description LIKE ?`;
      params.push(`%${interest}%`);
    }
    
    if (level && level !== 'Hepsi') {
      coursesQuery += ` AND description LIKE ?`;
      params.push(`%${level}%`);
    }
    
    // Kursları getir
    const courses = await query(coursesQuery, params);
    
    // Aktif kampanyaları getir
    const campaigns = await query(`
      SELECT c.id, c.title, c.description, c.discount_rate
      FROM campaigns c
      JOIN courses co ON c.course_id = co.id
      WHERE co.department_id = ? AND c.expiry_date >= CURDATE()
    `, [departmentId]);
    
    return res.status(200).json({
      courses,
      campaigns
    });
  } catch (error) {
    console.error('Öneri getirme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}