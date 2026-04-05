import { Router } from "express";

import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleAccess } from '../middleware/roleAcces.middleware.js'
import { dashboardController } from '../controller/dashboard.controller.js'

const dashboardRouter = Router()

dashboardRouter.get('/summary',authMiddleware, roleAccess(['viewer','admin','analyst']), dashboardController.Summary)
dashboardRouter.get('/categories',authMiddleware, roleAccess(['analyst', 'admin']),dashboardController.categorySummary)
dashboardRouter.get('/recent',authMiddleware, roleAccess(['analyst', 'admin']),dashboardController.recentActivity)
dashboardRouter.get('/monthly',authMiddleware, roleAccess(['analyst', 'admin']),dashboardController.monthlySummary)
dashboardRouter.get('/weekly',authMiddleware, roleAccess(['analyst', 'admin']),dashboardController.weeklyTrends)

export default dashboardRouter