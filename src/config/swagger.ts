
import swaggerUi from 'swagger-ui-express'
import type { Express } from 'express'

const BaseURL = 'https://financial-insights-engine-1.onrender.com'
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Finance Dashboard API',
    version: '1.0.0',
    description: 'Role based finance management system'
  },
  servers: [
    {
      url: 'https://financial-insights-engine-1.onrender.com',
      description: 'Production (Render)'
    },
    {
      url: 'http://localhost:3000',
      description: 'Local Development'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'admin'
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered' },
          400: { description: 'Missing fields' },
          409: { description: 'Email already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { email: 'john@example.com', password: 'password123' }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns JWT' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Get all transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'type',      schema: { type: 'string', enum: ['income','expense'] } },
          { in: 'query', name: 'category',  schema: { type: 'string' } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate',   schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'sortBy',    schema: { type: 'string', enum: ['date','amount','createdAt'] } },
          { in: 'query', name: 'order',     schema: { type: 'string', enum: ['asc','desc'] } },
          { in: 'query', name: 'page',      schema: { type: 'integer' } },
          { in: 'query', name: 'limit',     schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'List of transactions with pagination' },
          401: { description: 'Unauthorized' }
        }
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create transaction (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                amount: 5000,
                type: 'income',
                category: 'salary',
                date: '2025-03-01',
                comment: 'March salary'
              }
            }
          }
        },
        responses: {
          201: { description: 'Transaction created' },
          400: { description: 'Validation error' },
          403: { description: 'Access denied' }
        }
      }
    },
    '/api/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get single transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Transaction found' }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Transactions'],
        summary: 'Update transaction (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              example: { amount: 6000, comment: 'Updated salary' }
            }
          }
        },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Access denied' } }
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Soft delete transaction (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Soft deleted' }, 403: { description: 'Access denied' } }
      }
    },
    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Total income, expenses, net balance',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Summary data' } }
      }
    },
    '/api/dashboard/categories': {
      get: {
        tags: ['Dashboard'],
        summary: 'Category wise totals (analyst, admin)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Category breakdown' } }
      }
    },
    '/api/dashboard/recent': {
      get: {
        tags: ['Dashboard'],
        summary: 'Recent activity',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Recent transactions' } }
      }
    },
    '/api/dashboard/monthly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Monthly trends',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'months', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Monthly trend data' } }
      }
    },
    '/api/dashboard/weekly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Weekly trends',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'weeks', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Weekly trend data' } }
      }
    }
  }
}

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  console.log(`Swagger docs at ${BaseURL}/api/docs`)
}