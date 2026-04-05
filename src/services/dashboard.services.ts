import type { Request, response } from "express"
import Transaction  from '../models/transaction.model.js'

const getSummary = async (req: Request, res: Response) => {
     const result = await Transaction.aggregate([

      { $match: { isDeleted: false } },

      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])
    const income  = result.find(r => r._id === 'income')
    const expense = result.find(r => r._id === 'expense')

    const totalIncome   = income?.total   ?? 0
    const totalExpenses = expense?.total  ?? 0

    return {
      totalIncome,
      totalExpenses,
      netBalance:          totalIncome - totalExpenses,
      totalTransactions:  (income?.count ?? 0) + (expense?.count ?? 0)
    }
}
const getcategorySummary = async (req: Request, res: Response) => {
const result = await Transaction.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            type:     '$type',
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id:      0,
          type:     '$_id.type',
          category: '$_id.category',
          total:    1,
          count:    1
        }
      }
    ])
    return {
      income:  result.filter(r => r.type === 'income'),
      expense: result.filter(r => r.type === 'expense')
    }
}
const getRecentActivity = async (limitCount: number = 10) => {
  
    const transactions = await Transaction.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limitCount)

    return transactions
  }
const monthlySummary = async (months: number) => {
const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const result = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$date' },
            month: { $month: '$date' },
            type:  '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id:   0,
          year:  '$_id.year',
          month: '$_id.month',
          type:  '$_id.type',
          total: 1,
          count: 1
        }
      }
    ])

    // { year: 2025, month: 1, type: 'income',  total: 5000 },
    //   { year: 2025, month: 1, type: 'expense', total: 2000 }

    // Reshape into cleaner format grouped by month
    const trendsMap = new Map()

    result.forEach(item => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`

      if (!trendsMap.has(key)) {
        trendsMap.set(key, {
          year:    item.year,
          month:   item.month,
          income:  0,
          expense: 0
        })
      }

      const entry = trendsMap.get(key)!
      if (item.type === 'income')  entry.income  = item.total
      if (item.type === 'expense') entry.expense = item.total
    })

    return Array.from(trendsMap.values())
  //  { year: 2025, month: 1, income: 5000, expense: 2000 }
}

const getWeeklySummary = async (weeks: number = 8) => {
  const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)

    const result = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$date' },
            week: { $isoWeek:     '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      {
        $project: {
          _id:  0,
          year: '$_id.year',
          week: '$_id.week',
          type: '$_id.type',
          total: 1,
          count: 1
        }
      }
    ])

    // Same reshape pattern as monthly
    const weeksMap = new Map<string, Record<string, unknown>>()

    result.forEach(item => {
      const key = `${item.year}-W${String(item.week).padStart(2, '0')}`

      if (!weeksMap.has(key)) {
        weeksMap.set(key, {
          year:    item.year,
          week:    item.week,
          label:   key,
          income:  0,
          expense: 0
        })
      }

      const entry = weeksMap.get(key)!
      if (item.type === 'income')  entry.income  = item.total
      if (item.type === 'expense') entry.expense = item.total
    })

    return Array.from(weeksMap.values())
}

export const dashboardService ={
  getSummary,
  getcategorySummary,
  getRecentActivity,
  monthlySummary,
  getWeeklySummary
}