import { Router } from 'express'
import { authenticateToken, AuthRequest, requireStudent } from '../middleware/auth'
import prisma from '../utils/prisma'

const router = Router()

// Get student dashboard data
router.get('/dashboard', authenticateToken, requireStudent, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    
    // Get student progress
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        topic: true
      }
    })
    
    // Get recommended topics based on level
    const userLevel = req.user!.level || 'A1'
    const recommendedTopics = await prisma.topic.findMany({
      where: { level: userLevel as any },
      take: 5,
      orderBy: { order: 'asc' }
    })
    
    res.json({
      progress,
      recommendedTopics,
      userLevel
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})

// Update progress
router.post('/progress', authenticateToken, requireStudent, async (req: AuthRequest, res) => {
  try {
    const { topicId, completed, score } = req.body
    const userId = req.user!.id
    
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: {
        completed,
        score,
        updatedAt: new Date()
      },
      create: {
        userId,
        topicId,
        completed,
        score
      }
    })
    
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

export default router