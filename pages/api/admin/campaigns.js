// pages/api/admin/campaigns.js
import { withAdminAuth } from '../../../lib/admin/auth';
import prisma from '../../../lib/prisma';

async function handler(req, res) {
  // GET: Kampanyaları getir
  if (req.method === 'GET') {
    try {
      // Belirli bir kampanyayı getir
      if (req.query.id) {
        const campaign = await prisma.campaign.findUnique({
          where: { id: req.query.id },
          include: {
            course: {
              select: {
                title: true,
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        });

        if (!campaign) {
          return res.status(404).json({ message: 'Kampanya bulunamadı' });
        }

        return res.status(200).json(campaign);
      }

      // Tüm kampanyaları getir
      const campaigns = await prisma.campaign.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          course: {
            select: {
              title: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      return res.status(200).json(campaigns);
    } catch (error) {
      console.error('Get campaigns error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // POST: Yeni kampanya oluştur
  if (req.method === 'POST') {
    try {
      const { title, description, discountRate, expiryDate, courseId } = req.body;

      // Zorunlu alanları kontrol et
      if (!title || !courseId) {
        return res.status(400).json({ message: 'Başlık ve kurs zorunludur' });
      }

      // Kursun var olduğunu kontrol et
      const courseExists = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!courseExists) {
        return res.status(400).json({ message: 'Geçersiz kurs ID' });
      }

      // Kampanyayı oluştur
      const campaign = await prisma.campaign.create({
        data: {
          title,
          description,
          discountRate: discountRate ? parseInt(discountRate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          courseId
        }
      });

      return res.status(201).json({ 
        message: 'Kampanya başarıyla oluşturuldu',
        campaign
      });
    } catch (error) {
      console.error('Create campaign error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // PUT: Kampanya güncelle
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Kampanya ID gereklidir' });
      }

      const { title, description, discountRate, expiryDate, courseId } = req.body;

      // Zorunlu alanları kontrol et
      if (!title || !courseId) {
        return res.status(400).json({ message: 'Başlık ve kurs zorunludur' });
      }

      // Kampanyanın var olduğunu kontrol et
      const existingCampaign = await prisma.campaign.findUnique({
        where: { id }
      });

      if (!existingCampaign) {
        return res.status(404).json({ message: 'Kampanya bulunamadı' });
      }

      // Kursun var olduğunu kontrol et
      const courseExists = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!courseExists) {
        return res.status(400).json({ message: 'Geçersiz kurs ID' });
      }

      // Kampanyayı güncelle
      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          title,
          description,
          discountRate: discountRate ? parseInt(discountRate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          courseId
        }
      });

      return res.status(200).json({ 
        message: 'Kampanya başarıyla güncellendi',
        campaign: updatedCampaign
      });
    } catch (error) {
      console.error('Update campaign error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // DELETE: Kampanya sil
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Kampanya ID gereklidir' });
      }

      // Kampanyanın var olduğunu kontrol et
      const existingCampaign = await prisma.campaign.findUnique({
        where: { id }
      });

      if (!existingCampaign) {
        return res.status(404).json({ message: 'Kampanya bulunamadı' });
      }

      // Kampanyayı sil
      await prisma.campaign.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Kampanya başarıyla silindi' });
    } catch (error) {
      console.error('Delete campaign error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAdminAuth(handler);