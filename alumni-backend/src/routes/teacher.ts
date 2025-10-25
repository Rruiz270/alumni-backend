import { Router } from 'express'
import { authenticateToken, AuthRequest, requireTeacher } from '../middleware/auth'
import prisma from '../utils/prisma'

const router = Router()

// Get all students
router.get('/students', authenticateToken, requireTeacher, async (req: AuthRequest, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        createdAt: true,
        isActive: true
      }
    })
    
    res.json(students)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' })
  }
})

// Get student progress
router.get('/students/:id/progress', authenticateToken, requireTeacher, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    
    const progress = await prisma.userProgress.findMany({
      where: { userId: id },
      include: {
        topic: true
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student progress' })
  }
})

export default router