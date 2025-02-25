// lib/admin/auth.js
import { verify } from 'jsonwebtoken';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

export async function getAdminFromRequest(req) {
  try {
    // Cookie'den token'ı al
    const token = req.cookies.auth_token;

    if (!token) {
      console.log('Token bulunamadı');
      return null;
    }

    // JWT Secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET ortam değişkeni tanımlanmamış!');
      return null;
    }

    // Token'ı doğrula
    const decoded = verify(token, jwtSecret);

    // Veritabanından admin bilgilerini kontrol et
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });

    if (!admin) {
      console.log('Admin bulunamadı, ID:', decoded.id);
      return null;
    }

    return admin;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// API rotaları için admin kimlik doğrulama middleware
export function withAdminAuth(handler) {
  return async (req, res) => {
    try {
      const admin = await getAdminFromRequest(req);

      if (!admin) {
        return res.status(401).json({ message: 'Yetkisiz erişim' });
      }

      // Admin bilgilerini request nesnesine ekle
      req.admin = admin;

      // Handler'ı çağır
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
  };
}

// Sayfa yönlendirmesi için admin kimlik doğrulama hook'u
export async function requireAdminAuth(context) {
  const { req, res } = context;
  
  const admin = await getAdminFromRequest(req);

  if (!admin) {
    // Admin girişi yapılmamışsa login sayfasına yönlendir
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  // Admin bilgilerini sayfaya props olarak geçir
  return {
    props: { 
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : null,
        createdAt: admin.createdAt.toISOString()
      }
    },
  };
}

// Admin kullanıcısı oluşturma (Seed işlemi)
export async function createInitialAdmin() {
  try {
    // Admin var mı kontrol et
    const adminCount = await prisma.admin.count();
    
    // Eğer hiç admin yoksa, varsayılan admin oluştur
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('355235gG!', salt);
      
      await prisma.admin.create({
        data: {
          username: 'admin',
          email: 'yonetim@acadezone.com',
          password: hashedPassword,
          role: 'admin'
        }
      });
      
      console.log('Varsayılan admin hesabı oluşturuldu.');
      console.log('E-posta: yonetim@acadezone.com');
      console.log('Şifre: 355235gG!');
    }
  } catch (error) {
    console.error('Create initial admin error:', error);
  }
}