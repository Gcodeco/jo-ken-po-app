/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import express, { response, request, NextFunction } from 'express'
import { AppDataSource } from './data-source'
import routes from './routes'
import swaggerUi from 'swagger-ui-express'
import swaggerDocs from './swagger.json'
import cors from 'cors'

// Inicialize o AppDataSource
AppDataSource.initialize().then(() => {
  const app = express()

  // Configurar Cors
  app.use(cors())
  // Configurar middlewares
  app.use(express.json())
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

  // api swagger

  app.get('/terms', (request, response) => {
    return response.json({
      message: 'Termos de Serviço'
    })
  })

  // Configurar CORS
  app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,OPTIONS,POST,PATCH,DELETE'
    )
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    next()
  })

  // Configurar rotas
  app.use(routes)

  // Iniciar o servidor
  const port = process.env.port || 3000
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
    console.log(`Documentação disponível em http://localhost:${port}/api-docs`)
  })
}).catch((error) => {
  console.error('Erro ao iniciar o servidor:', error)
})
