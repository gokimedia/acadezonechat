// pages/api/save-user.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { name, surname, email, phone } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !surname || !email || !phone) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }
    
    // Kullanıcıyı veritabanına kaydet
    const result = await query(
      `INSERT INTO users (name, surname, email, phone) VALUES (?, ?, ?, ?)`,
      [name, surname, email, phone]
    );
    
    return res.status(200).json({ 
      message: 'Kullanıcı başarıyla kaydedildi',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Kullanıcı kaydetme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}