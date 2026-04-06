import  {Router} from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { roleAccess } from '../middleware/roleAcces.middleware.js'
import { createTransaction, getTransactions, updateTransaction , getTransactionById, deleteTransaction} from '../controller/transaction.controller.js'

const transrouter = Router()

transrouter.post('/', authMiddleware, roleAccess(['admin']),createTransaction)
transrouter.get('/', authMiddleware, roleAccess(['admin','viewer','analyst']),getTransactions)
transrouter.put('/:id', authMiddleware, roleAccess(['admin']),updateTransaction)
transrouter.get('/:id', authMiddleware, roleAccess(['admin','viewer','analyst']),getTransactionById)
transrouter.delete('/:id', authMiddleware, roleAccess(['admin']),deleteTransaction)

export default transrouter