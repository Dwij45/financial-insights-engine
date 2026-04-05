import type { Request } from 'express'
import { Types } from 'mongoose'

export type Role = 'viewer' | 'analyst' | 'admin'

//the inputs
export interface RegisterDto {
    name : string
    email : string
    password : string
    role : Role
}
export interface LoginDto {
  email: string
  password: string
}
export interface CreateTransactionDto {
    
}

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: Role
    isActive: boolean
  }
}

export interface TokenPayload {
  id: string // id 
  role: Role
}