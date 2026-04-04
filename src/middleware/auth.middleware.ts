import type { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import type { AuthRequest, TokenPayload } from '../types/index.js'

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.'
      })
    }

    
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing after Bearer.'
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as unknown as TokenPayload

    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact an administrator.'
      })
    }

    
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      isActive: user.isActive
    }

    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session.'
    })
  }
}