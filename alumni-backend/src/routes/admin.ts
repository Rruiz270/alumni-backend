import { Router } from 'express'
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth'
import prisma from '../utils/prisma'

const router = Router()

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Update user role
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        isActive: true
      }
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// Toggle user active status
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        isActive: true
      }
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

export default router