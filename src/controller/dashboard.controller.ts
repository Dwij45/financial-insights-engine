import type { Request, Response } from "express";
import type { AuthRequest } from '../types/index.js'
import { dashboardService} from "../services/dashboard.services.js";

const Summary = async (req: Request, res: Response) => {
    // @ts-ignore
    const data = await dashboardService.getSummary(req, res)

    return res.status(200).json({
      success: true,
      message: 'Summary fetched successfully.',
      data
    })
  }
const categorySummary = async (req: Request, res: Response) => {
  // @ts-ignore
  const data = await dashboardService.getcategorySummary(req, res)

    return res.status(200).json({
      success: true,
      message: 'Category breakdown fetched successfully.',
      data
    })
}
const recentActivity = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10

    const data = await dashboardService.getRecentActivity(limit, res)

    return res.status(200).json({
      success: true,
      message: 'Recent activity fetched successfully.',
      data
    })
}
const monthlySummary = async (req: Request, res: Response) => {
  const months = parseInt(req.query.months as string) 

  console.log('Received months parameter:', months)
    const data = await dashboardService.monthlySummary(months)
    return res.status(200).json({
      success: true,
      message: 'Monthly trends fetched successfully.',
      data
    })
}
const weeklyTrends = async (req: Request, res: Response) => {
  const weeks = parseInt(req.query.weeks as string) || 8

    const data = await dashboardService.getWeeklySummary(weeks)

    return res.status(200).json({
      success: true,
      message: 'Weekly trends fetched successfully.',
      data
    })
}
export const dashboardController = {
  Summary,
  categorySummary,
  recentActivity,
  monthlySummary,
  weeklyTrends
}