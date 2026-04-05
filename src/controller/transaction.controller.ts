import type { AuthRequest } from "../types/index.js";
import type { Request, Response } from "express";

import  {TransactionService}  from "../services/transaction.services.js";

export const createTransaction = async (req: Request, res: Response) => {
    const { amount, type, category, date, comment } = req.body

    if (!amount || !type || !category || !date) {
        return res.status(400).json({
            success: false,
            message: 'Amount, type, category and date are required.'
        })
    }
    const transaction = await TransactionService.create({
      amount,
      type,
      category,
      date,
      comment,
    //   @ts-ignore
      createdBy: req.user!.userId
    })
    res.status(201).json({
        success: true,
        data: {transaction}
    })
}

export const updateTransaction = async (req: AuthRequest, res: Response) => {
    const transaction = await TransactionService.update(
      req.params.id as string,
      req.body
    )

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: { transaction }
    })
  }
export const getTransactions = async (req: AuthRequest, res: Response) => {
    const result = await TransactionService.getAll(req.query as Record<string, string>)

    return res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully.',
      data: result
    })
  }
  
export const getTransactionById = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
    const transaction = await TransactionService.getById(id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully.',
      data: { transaction }
    })
  }
