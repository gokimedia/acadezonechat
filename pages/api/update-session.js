// pages/api/update-session.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { userId, department, sessionData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'Kullanıcı ID gereklidir' });
    }
    
    // Önce bölüm ID'sini al veya oluştur
    let departmentId = null;
    if (department) {
      // Bölümü veritabanında ara
      const departments = await query(
        `SELECT id FROM departments WHERE name = ?`,
        [department]
      );
      
      if (departments.length > 0) {
        departmentId = departments[0].id;
      } else {
        // Bölüm yoksa oluştur
        const slug = department
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        const result = await query(
          `INSERT INTO departments (name, slug) VALUES (?, ?)`,
          [department, slug]
        );
        
        departmentId = result.insertId;
      }
    }
    
    // Mevcut oturumu kontrol et
    const sessions = await query(
      `SELECT id FROM user_sessions WHERE user_id = ?`,
      [userId]
    );
    
    if (sessions.length > 0) {
      // Mevcut oturumu güncelle
      await query(
        `UPDATE user_sessions SET department_id = ?, session_data = ? WHERE user_id = ?`,
        [departmentId, JSON.stringify(sessionData), userId]
      );
    } else {
      // Yeni oturum oluştur
      await query(
        `INSERT INTO user_sessions (user_id, department_id, session_data) VALUES (?, ?, ?)`,
        [userId, departmentId, JSON.stringify(sessionData)]
      );
    }
    
    return res.status(200).json({ message: 'Oturum başarıyla güncellendi' });
  } catch (error) {
    console.error('Oturum güncelleme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}