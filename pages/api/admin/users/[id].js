// pages/api/admin/users/[id].js
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    // Check admin authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // GET - Fetch specific user with details
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          sessions: {
            include: {
              department: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
          chats: {
            include: {
              department: true,
            },
            orderBy: {
              startTime: "desc",
            },
            take: 10,
          },
          infoRequests: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
          appRequests: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
          _count: {
            select: {
              chats: true,
              infoRequests: true,
              appRequests: true,
              sessions: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    }

    // DELETE - Remove a user
    if (req.method === "DELETE") {
      try {
        // Delete related records first (due to foreign key constraints)
        await prisma.$transaction([
        ])
          // Delete user sessions
          prisma.userSession.deleteMany({ 
            where: { userId: id } 
          }),
          
          // Delete chat analytics
          prisma.chatAnalytic.deleteMany({ 
            where: { userId: id } 
          }),
          
          // Delete information requests
          prisma.informationRequest.deleteMany({ 
            where: { userId: id } 
          }),
          
          // Delete application requests
          prisma.applicationRequest.deleteMany({ 
            where: { userId: id } 
          }),
          
          // Finally delete the user
          prisma.user.delete({ 
            where: { id } 
          });

        return res.status(200).json({ 
          message: "User and all related data successfully deleted" 
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ 
          error: "Failed to delete user", 
          details: error.message 
        });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
}