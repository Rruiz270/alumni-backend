import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
  return secret
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: '7d' })
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, getJWTSecret())
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid token provided')
  }
  return authHeader.substring(7)
}