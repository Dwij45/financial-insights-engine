import dotenv from 'dotenv'
import path from 'path'

import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export const getRequiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}
