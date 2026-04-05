import './config/env.js'

const PORT = process.env.PORT || 3000

import express from 'express'
import authRouter from './routes/auth.routes.js'
import connectDB from './config/db.js'
import transactionRouter from './routes/transaction.routes.js'

const app = express()

connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRouter)
app.use('/transactions', transactionRouter)

export default app