import { Router } from 'express'
import { hashPassword, comparePassword, generateToken } from '../utils/auth'
import prisma from '../utils/prisma'

const router = Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'STUDENT' } = req.body
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const hashedPassword = await hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true
      }
    })
    
    const token = generateToken({ userId: user.id })
    
    res.status(201).json({ user, token })
  } catch (error) {
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user || !await comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = generateToken({ userId: user.id })
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level
      },
      token
    })
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' })
  }
})

export default router