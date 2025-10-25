import { Request, Response, NextFunction } from 'express'
import { verifyToken, extractTokenFromHeader } from '../utils/auth'
import prisma from '../utils/prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    role: string
    level?: string
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    const decoded = verifyToken(token)
    
    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        isActive: true
      }
    })
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level || undefined
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}

export const requireAdmin = requireRole(['ADMIN'])
export const requireTeacher = requireRole(['TEACHER', 'ADMIN'])
export const requireStudent = requireRole(['STUDENT', 'ADMIN'])