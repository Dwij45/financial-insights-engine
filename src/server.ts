import './config/env.js'

const PORT = process.env.PORT || 3000

import express from 'express'
import authRouter from './routes/auth.routes.js'
import connectDB from './config/db.js'
import app from './app.js' 

const start = async () => {
  await connectDB()
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
}

start()