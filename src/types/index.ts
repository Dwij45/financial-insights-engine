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

// src/types/index.ts — add this

export const INCOME_CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'business',
  'rental',
  'bonus',
  'other_income'
] as const

export const EXPENSE_CATEGORIES = [
  'rent',
  'utilities',
  'groceries',
  'transport',
  'healthcare',
  'entertainment',
  'education',
  'subscription',
  'office_supplies',
  'marketing',
  'taxes',
  'other_expense'
] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
export type TransactionCategory = IncomeCategory | ExpenseCategory