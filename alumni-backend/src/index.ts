import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import topicRoutes from './routes/topics'
import studentRoutes from './routes/student'
import teacherRoutes from './routes/teacher'
import adminRoutes from './routes/admin'

const app = express()
const PORT = parseInt(process.env.PORT || '8000')

// Initialize Prisma with error handling
let prisma: PrismaClient
try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('❌ Failed to initialize Prisma:', error)
}

// Middleware - Allow all Vercel domains and localhost
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://alumni-lms.vercel.app',
    /^https:\/\/.*\.vercel\.app$/,  // Allow any Vercel preview deployments
    /^https:\/\/alumni-lms-.*\.vercel\.app$/  // Allow any alumni-lms Vercel deployments
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Alumni by Better API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Simple test route without database
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route working',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/topics', topicRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} does not exist`
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Alumni by Better API running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
  await prisma.$disconnect()
})

export default app