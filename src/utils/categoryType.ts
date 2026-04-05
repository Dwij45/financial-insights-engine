import Transaction  from '../models/transaction.model.js'
import  type {ITransaction} from '../models/transaction.model.js'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionCategory
} from '../types/index.js'

export const validateCategoryForType = (
  type: 'income' | 'expense',
  category: string
): { valid: boolean; message?: string } => {
  if (type === 'income' && !INCOME_CATEGORIES.includes(category as never)) {
    return {
      valid: false,
      message: `Invalid category for income. Valid options: ${INCOME_CATEGORIES.join(', ')}`
    }
  }

  if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category as never)) {
    return {
      valid: false,
      message: `Invalid category for expense. Valid options: ${EXPENSE_CATEGORIES.join(', ')}`
    }
  }

  return { valid: true }
}
