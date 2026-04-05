import './config/env.js'

const PORT = process.env.PORT || 3000

import express from 'express'
import authRouter from './routes/auth.routes.js'
import connectDB from './config/db.js'
import transactionRouter from './routes/transaction.routes.js'
import dashboardRouter from './routes/dashboard.router.js'

import swaggerUi from 'swagger-ui-express'
import {setupSwagger} from './config/swagger.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

connectDB()
const swaggerSpec = setupSwagger(app) as any

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/dashboard', dashboardRouter)

app.use(errorHandler)
export default app