import type { ITransaction } from '../models/transaction.model.js'
import type { TransactionCategory } from './index.js'
export interface CreateTransactionInput {
  amount: number
  type: 'income' | 'expense'
  category: TransactionCategory
  date: string
  comment?: string
  createdBy: string
}

export interface UpdateTransactionInput {
  amount?: number
  type?: 'income' | 'expense'
  category?: TransactionCategory
  date?: string
  comment?: string
}

export interface TransactionFilters {
  type?: string
  category?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  order?: string
  page?: string
  limit?: string
}

export interface PaginatedTransactions {
  transactions: ITransaction[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
