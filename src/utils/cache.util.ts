import type{ Request, Response } from 'express'

import { getCache, setCache } from '../config/cache.js'

export const cacheUtils = (CACHE_KEY: string, res: Response) => {
    
        const cached = getCache(CACHE_KEY)
        if (cached) {
            return res.status(200).json({
                success: true,
                message: 'Dashboard summary fetched. (cached)',
                data: cached
            })
        }
    
}
export const setCacheUtils = (CACHE_KEY: string, data: any, res: Response) => {
    setCache(CACHE_KEY, data)
    return res.status(200).json({
        success: true,
        message: 'Dashboard summary fetched.',
        data: data
    })

}