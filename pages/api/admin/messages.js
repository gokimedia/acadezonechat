// pages/api/admin/messages.js
import { withAdminAuth } from '../../../lib/admin/auth';
import prisma from '../../../lib/prisma';

async function handler(req, res) {
  // GET: Tüm mesajları getir
  if (req.method === 'GET') {
    try {
      // Bilgi taleplerini getir
      const infoRequests = await prisma.informationRequest.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Başvuru taleplerini getir
      const applicationRequests = await prisma.applicationRequest.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // İki talebi birleştir ve tip ekle
      const combinedMessages = [
        ...infoRequests.map(req => ({ ...req, type: 'info' })),
        ...applicationRequests.map(req => ({ ...req, type: 'application' }))
      ];

      // Tarihe göre sırala
      combinedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(combinedMessages);
    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT: Mesaj durumunu güncelle
  if (req.method === 'PUT') {
    try {
      const { id, status, type } = req.body;

      if (!id || !status || !type) {
        return res.status(400).json({ message: 'ID, durum ve tür alanları zorunludur' });
      }

      if (!['new', 'processing', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Geçersiz durum değeri' });
      }

      let result;
      
      if (type === 'info') {
        // Bilgi talebini güncelle
        result = await prisma.informationRequest.update({
          where: { id },
          data: { status }
        });
      } else if (type === 'application') {
        // Başvuru talebini güncelle
        result = await prisma.applicationRequest.update({
          where: { id },
          data: { status }
        });
      } else {
        return res.status(400).json({ message: 'Geçersiz mesaj türü' });
      }

      return res.status(200).json({ 
        message: 'Durum başarıyla güncellendi',
        result
      });
    } catch (error) {
      console.error('Update message status error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAdminAuth(handler);