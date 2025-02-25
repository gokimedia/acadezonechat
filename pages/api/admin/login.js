// pages/api/admin/login.js
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Username ve password kontrolü
    if (!username || !password) {
      return res.status(400).json({ message: 'Kullanıcı adı ve şifre gereklidir' });
    }

    console.log('Giriş denemesi:', { username });

    // Admin kullanıcısını ara (hem username hem de email için kontrol et)
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    console.log('Bulunan admin:', admin ? `ID: ${admin.id}` : 'Bulunamadı');

    if (!admin) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    console.log('Şifre doğrulaması:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Son giriş zamanını güncelle
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // JWT Gizli Anahtarı Kontrol Et
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET ortam değişkeni tanımlanmamış!');
      return res.status(500).json({ message: 'Sunucu yapılandırma hatası' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    // Cookie olarak token'ı ayarla
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60, // 8 saat
        path: '/',
      })
    );

    // Hassas bilgileri çıkararak admin bilgilerini döndür
    const { password: _, ...adminInfo } = admin;

    return res.status(200).json({
      message: 'Giriş başarılı',
      admin: adminInfo,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}