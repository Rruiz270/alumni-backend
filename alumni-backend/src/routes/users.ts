import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import prisma from '../utils/prisma'

const router = Router()

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, level } = req.body
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, level },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true
      }
    })
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router