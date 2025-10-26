import { Router } from 'express'
import { hashPassword, comparePassword, generateToken } from '../utils/auth'
import prisma from '../utils/prisma'

const router = Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'STUDENT', level, studentId } = req.body
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Check if studentId already exists (if provided)
    if (studentId) {
      const existingStudentId = await prisma.user.findUnique({
        where: { studentId }
      })
      
      if (existingStudentId) {
        return res.status(400).json({ error: 'Student ID already exists' })
      }
    }
    
    const hashedPassword = await hashPassword(password)
    
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role
    }
    
    // Only add level and studentId for STUDENT role
    if (role === 'STUDENT') {
      if (level) userData.level = level
      if (studentId) userData.studentId = studentId
    }
    
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        studentId: true,
        createdAt: true
      }
    })
    
    const token = generateToken({ userId: user.id })
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      user, 
      token 
    })
  } catch (error) {
    console.error('Registration error:', error)
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
    
    return res.json({
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