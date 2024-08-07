/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express'
import { UsuarioController } from './controllers/UsuarioController'
import { DesafioController } from './controllers/DesafioController'
import { ApostaController } from './controllers/ApostaController'

const jwt = require('jsonwebtoken')
const routes = Router()
const desafioController = new DesafioController()
const usuarioController = new UsuarioController()
const apostaController = new ApostaController()

routes.post('/usuario', (req, res) => usuarioController.create(req, res))
routes.post('/usuario/autenticar', (req, res) => usuarioController.autenticar(req, res))

routes.get('/usuario/:id/balance', (req, res) => usuarioController.getBalance(req, res))
routes.post('/desafio/create', (req, res) => desafioController.create(req, res))
routes.post('/aceitarDesafio', (req, res) => desafioController.aceitarDesafio(req, res))
routes.get('/buscarDesafios', (req, res) => desafioController.buscarDesafios(req, res))
routes.get('/usuario/MaioresApostadores', (req, res) => desafioController.maioresApostadores(req, res))
routes.get('/maioresApostas', (req, res) => desafioController.maioresApostas(req, res))
routes.get('/maioresGanhadores', (req, res) => desafioController.maioresGanhadores(req, res))
routes.get('/apostas/:id', (req, res) => desafioController.consultarApostasPorUsuario(req, res))
routes.post('/apostas', (req, res) => apostaController.criarAposta(req, res))
routes.put('/apostas/resultado', (req, res) => apostaController.atualizarResultado(req, res))

function checkToken (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(404).json({ msg: 'Acesso negado' })
  }
  try {
    const secret = process.env.secret || 'teste123' // Defina um segredo padrão para desenvolvimento
    jwt.verify(token, secret)
    next()
  } catch {
    return res.status(404).json({ msg: 'Token Inválido' })
  }
}

// Aplicar middleware de verificação de token em todas as rotas
routes.use(checkToken)

// Middleware para verificar token JWT

export default routes
