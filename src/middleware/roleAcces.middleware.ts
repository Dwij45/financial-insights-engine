import type { Response, NextFunction } from 'express'
import type { AuthRequest, Role } from '../types/index.js'


export const roleAccess = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // auth middleware must run before roleAccess
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
      return
    }

    const { role } = req.user

    
    if (!allowedRoles.includes(role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of: [${allowedRoles.join(', ')}]. Your role: ${role}`
      })
      return
    }
    next()
  }
}