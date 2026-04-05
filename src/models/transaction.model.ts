import mongoose, { Document, Schema, Types } from 'mongoose'
import type { CallbackWithoutResultAndOptionalError} from 'mongoose'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionCategory
} from '../types/index.js'

export interface ITransaction extends Document {
  _id: Types.ObjectId
  amount: number
  type: 'income' | 'expense'
  category: TransactionCategory
  date: Date
  comment?: string
  createdBy: Types.ObjectId
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type is required']
    },
    category: {
      type: String,
      enum: {
        values: ALL_CATEGORIES,
        message: '{VALUE} is not a valid category'
      },
      required: [true, 'Category is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

//indexing
TransactionSchema.index({ type: 1 })
TransactionSchema.index({ category: 1 })
TransactionSchema.index({ date: -1 })
TransactionSchema.index({ isDeleted: 1 })
TransactionSchema.index({ type: 1, category: 1 })

// ts-ignore
export default mongoose.model<ITransaction>('Transaction', TransactionSchema)