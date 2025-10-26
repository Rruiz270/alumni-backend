import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import prisma from '../utils/prisma'

const router = Router()

// Get all topics (public for testing - no auth required)
router.get('/', async (req, res) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        exercises: true
      }
    })
    
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
})

// Get topics by level (public for testing)
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params
    
    const topics = await prisma.topic.findMany({
      where: { level: level as any },
      orderBy: { orderIndex: 'asc' },
      include: {
        exercises: true
      }
    })
    
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
})

// Get single topic
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        exercises: true
      }
    })
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }
    
    return res.json(topic)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch topic' })
  }
})

export default router