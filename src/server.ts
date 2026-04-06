import './config/env.js'
const BaseURL='https://financial-insights-engine-1.onrender.com/'
// const BaseURL='http://localhost:3000'
const PORT = process.env.PORT || 3000

import express from 'express'
import authRouter from './routes/auth.routes.js'
import connectDB from './config/db.js'
import app from './app.js' 

const start = async () => {
  await connectDB()
  app.listen(PORT, () => console.log(`Server on ${BaseURL} and swagger at ${BaseURL}/api/docs`))
}

start()