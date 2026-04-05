import Transaction  from '../models/transaction.model.js'
import  type {ITransaction} from '../models/transaction.model.js'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionCategory
} from '../types/index.js'
import { deleteCacheByPattern } from '../config/cache.js'

import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters, PaginatedTransactions } from '../types/transaction.types.js'
import { isFutureDate } from '../utils/dateChecker.js'
import {validateCategoryForType} from '../utils/categoryType.js'

const createTransaction = async (input: CreateTransactionInput): Promise<ITransaction> => {
if (isFutureDate(input.date)) {
    const error = new Error('Transaction date cannot be in the future') as Error & { statusCode: number }
    error.statusCode = 400
    throw error
  }
  const validation = validateCategoryForType(input.type, input.category)
if (!validation.valid) {
      const error = new Error(validation.message) as Error & { statusCode: number }
      error.statusCode = 400
      throw error
    }
    const transaction = await Transaction.create({
      ...input,
      date: new Date(input.date)
    })
    deleteCacheByPattern('dashboard:') 
    return transaction
}

const updateTransaction = async (Id: string, input: UpdateTransactionInput) : Promise<ITransaction | null> => {
  
if (isFutureDate(input.date as string)) {
    const error = new Error('Transaction date cannot be in the future') as Error & { statusCode: number }
    error.statusCode = 400
    throw error
  }
  const transaction = await Transaction.findById(Id)

    if (!transaction) return null

    const finalType = input.type ?? transaction.type
    const finalCategory = input.category ?? transaction.category

    const validation = validateCategoryForType(finalType, finalCategory)
    if (!validation.valid) {
      const error = new Error(validation.message) as Error & { statusCode: number }
      error.statusCode = 400
      throw error
    }
    if (input.amount !== undefined) transaction.amount = input.amount
    if (input.type !== undefined) transaction.type = input.type
    if (input.category !== undefined) transaction.category = input.category as TransactionCategory
    if (input.date !== undefined) transaction.date = new Date(input.date)
    if (input.comment !== undefined) transaction.comment = input.comment

    await transaction.save()
    deleteCacheByPattern('dashboard:') 

    return transaction
}

const getTransactions = async ( filters: TransactionFilters) => {

const {
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      order = 'desc',
      page = '1',
      limit = '10'
    } = filters

    // Build MongoDB filter object
    const query: Record<string, unknown> = {}

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type
    }

    if (category) {
      query.category = category
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate)
      query.date = dateFilter
    }

    if (search) {
      query.comment = { $regex: search, $options: 'i' }
    }

    // Sort
    const allowedSortFields = ['date', 'amount', 'createdAt']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date'
    const sortOrder = order === 'asc' ? 1 : -1
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder }

    // Pagination — cap limit at 50
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = limit ? Math.min(50, Math.max(1, parseInt(limit))): 10
    const skip = (pageNum - 1) * limitNum

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('createdBy', 'name email role')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / limitNum)

    return {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }
}

const getTransactionById = async (id: string):Promise<ITransaction | null> => {

    return Transaction.findById(id).populate('createdBy', 'name email role')

}
export const TransactionService = {
    create: createTransaction,
    getAll: getTransactions,
    getById: getTransactionById,
    update: updateTransaction
}