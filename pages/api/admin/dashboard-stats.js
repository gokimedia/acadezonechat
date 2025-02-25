// pages/api/admin/dashboard-stats.js
import { withAdminAuth } from '../../../lib/admin/auth';
import prisma from '../../../lib/prisma';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Toplam kullanıcı sayısı
    const totalUsers = await prisma.user.count();

    // Toplam konuşma sayısı
    const totalConversations = await prisma.chatAnalytic.count();

    // Tamamlama oranı
    const completedConversations = await prisma.chatAnalytic.count({
      where: { completed: true }
    });
    const completionRate = totalConversations > 0 
      ? Math.round((completedConversations / totalConversations) * 100 * 10) / 10 
      : 0;

    // İletişim talebi oranı
    const contactRequests = await prisma.chatAnalytic.count({
      where: { resultedInContact: true }
    });
    const contactRate = totalConversations > 0 
      ? Math.round((contactRequests / totalConversations) * 100 * 10) / 10 
      : 0;

    // Popüler bölümler
    const departments = await prisma.department.findMany();
    
    const popularDepartmentData = await Promise.all(
      departments.map(async (dept) => {
        const views = await prisma.chatAnalytic.count({
          where: { departmentId: dept.id }
        });
        const completed = await prisma.chatAnalytic.count({
          where: { 
            departmentId: dept.id,
            completed: true
          }
        });
        
        return {
          name: dept.name,
          views,
          completionRate: views > 0 ? Math.round((completed / views) * 100 * 10) / 10 : 0
        };
      })
    );
    
    // Views sayısına göre sırala
    const popularDepartments = popularDepartmentData
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Son konuşmalar
    const recentChats = await prisma.chatAnalytic.findMany({
      where: {},
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            email: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 10
    });
      
    const recentChatsData = recentChats.map(chat => {
      return {
        user: chat.user ? `${chat.user.name} ${chat.user.surname}` : 'Anonim',
        email: chat.user ? chat.user.email : '-',
        department: chat.department ? chat.department.name : '-',
        date: chat.startTime,
        completed: chat.completed
      };
    });

    return res.status(200).json({
      totalUsers,
      totalConversations,
      completionRate,
      contactRate,
      popularDepartments,
      recentChats: recentChatsData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default withAdminAuth(handler);