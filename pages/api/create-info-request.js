// pages/api/create-info-request.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Yalnızca POST metodu kabul edilir' });
  }

  try {
    const { userId, requestType } = req.body;
    
    if (!userId || !requestType) {
      return res.status(400).json({ message: 'Kullanıcı ID ve talep türü gereklidir' });
    }
    
    // İlk olarak, bilgi talebi için bir tablo oluşturduğunuzdan emin olun
    await query(`
      CREATE TABLE IF NOT EXISTS information_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        request_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Bilgi talebini kaydet
    await query(
      `INSERT INTO information_requests (user_id, request_type) VALUES (?, ?)`,
      [userId, requestType]
    );
    
    return res.status(200).json({ message: 'Bilgi talebi başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Bilgi talebi oluşturma hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}