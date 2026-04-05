import type { Request, Response, NextFunction } from 'express'

// Wraps async controllers so you never need try/catch in every controller
// Any thrown error goes straight to the global error handler
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

const asyncHandler = (fn: AsyncFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler