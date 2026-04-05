import  {Router} from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleAccess } from '../middleware/roleAcces.middleware.js'
import { createTransaction, getTransactions, updateTransaction } from '../controller/transaction.controller.js'

const transrouter = Router()

transrouter.post('/', authMiddleware, roleAccess(['admin']),createTransaction)
transrouter.get('/', authMiddleware, roleAccess(['admin','viewer','analyst']),getTransactions)
transrouter.put('/:id', authMiddleware, roleAccess(['admin']),updateTransaction)

export default transrouter