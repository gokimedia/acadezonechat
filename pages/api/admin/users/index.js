// pages/api/admin/users/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  // Check admin authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - Fetch users with pagination and filters
  if (req.method === "GET") {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        dateRange = "all",
        sortBy = "createdAt",
        sortDirection = "desc",
      } = req.query;

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Prepare where clause for filters
      const whereClause = {};
      
      // Search filter
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { surname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      // Date range filter
      if (dateRange !== "all") {
        const now = new Date();
        let date = new Date();
        
        switch (dateRange) {
          case "today":
            date.setHours(0, 0, 0, 0);
            break;
          case "week":
            date.setDate(date.getDate() - date.getDay());
            date.setHours(0, 0, 0, 0);
            break;
          case "month":
            date = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            date = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        whereClause.createdAt = { gte: date };
      }

      // Count total users
      const totalItems = await prisma.user.count({ where: whereClause });
      
      // Fetch users with sorting and pagination
      const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortDirection },
        skip,
        take: limitNumber,
        include: {
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

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / limitNumber);

      return res.status(200).json({
        users,
        pagination: {
          currentPage: pageNumber,
          totalItems,
          totalPages,
          itemsPerPage: limitNumber,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}