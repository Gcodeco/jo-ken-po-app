import { Request, Response } from 'express'
import { DesafioController } from '../src/controllers/DesafioController'
import { UsuarioRepository } from '../src/repositories/UsuarioRepository'
import { DesafioRepository } from '../src/repositories/DesafioRepository'
import { Messages } from '../src/messagens'
import { Usuario } from '../src/entities/Usuario'
import { Desafio } from '../src/entities/Desafio'

jest.mock('../src/repositories/UsuarioRepository')
jest.mock('../src/repositories/DesafioRepository')

const mockedUsuarioRepository = jest.mocked(UsuarioRepository)
const mockedDesafioRepository = jest.mocked(DesafioRepository)

describe('DesafioController', () => {
  let desafioController: DesafioController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockUsuario: Usuario
  let mockDesafio: Desafio

  beforeEach(() => {
    desafioController = new DesafioController()

    mockUsuario = new Usuario(
      'Test User',
      new Date('1990-01-01'),
      12345678900,
      1234567,
      'testuser',
      'password',
      'test@example.com'
    )

    mockUsuario.moeda = 100

    mockDesafio = new Desafio()
    mockDesafio.id = 1
    mockDesafio.usuarioCriador = mockUsuario
    mockDesafio.escolhaDoUsuarioCriador = 'Pedra'
    mockDesafio.valorDaAposta = 100

    mockRequest = {
      body: {
        id: 1,
        escolhaDoUsuarioCriador: 'Pedra',
        valorDaAposta: 100
      }
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('create', () => {
    it('should create a new challenge', async () => {
      UsuarioRepository.findOneBy = jest.fn().mockResolvedValue(mockUsuario)
      DesafioRepository.save = jest.fn().mockResolvedValue(mockDesafio)

      await desafioController.create(mockRequest as Request, mockResponse as Response)

      expect(UsuarioRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(DesafioRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        usuarioCriador: mockUsuario,
        escolhaDoUsuarioCriador: 'Pedra',
        valorDaAposta: 100
      }))
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: Messages.CHALLENGE_CREATED })
    })

    it('should return 404 if user not found', async () => {
      UsuarioRepository.findOneBy = jest.fn().mockResolvedValue(null)

      await desafioController.create(mockRequest as Request, mockResponse as Response)

      expect(UsuarioRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: Messages.USER_NOT_FOUND })
    })
    it('should return 400 if bet amount is invalid', async () => {
      mockRequest.body.valorDaAposta = 5
      UsuarioRepository.findOneBy = jest.fn().mockResolvedValue(mockUsuario)

      await desafioController.create(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: Messages.BET_AMOUNT_INVALID })
    })

    it('should return 500 if there is a server error', async () => {
      UsuarioRepository.findOneBy = jest.fn().mockRejectedValue(new Error('Server error'))

      await desafioController.create(mockRequest as Request, mockResponse as Response)

      expect(UsuarioRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: Messages.INTERNAL_SERVER_ERROR })
    })
  })

  describe('DesafioController maioresApostadores', () => {
    let desafioController: DesafioController
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>

    beforeEach(() => {
      desafioController = new DesafioController()

      mockRequest = {}
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should return the 3 top bettors', async () => {
      // Mock do createQueryBuilder
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { usuarioid: 1, usuarioname: 'User One', totalaposta: 300 },
          { usuarioid: 2, usuarioname: 'User Two', totalaposta: 250 },
          { usuarioid: 3, usuarioname: 'User Three', totalaposta: 200 }
        ])
      }

      DesafioRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder)

      await desafioController.maioresApostadores(mockRequest as Request, mockResponse as Response)

      expect(DesafioRepository.createQueryBuilder).toHaveBeenCalledWith('desafios')
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('desafios.usuarioCriador', 'usuarioCriador')
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'usuarioCriador.id AS usuarioId',
        'usuarioCriador.name AS usuarioName',
        'SUM(desafios.valorDaAposta) AS totalAposta'
      ])
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('usuarioCriador.id')
      expect(mockQueryBuilder.addGroupBy).toHaveBeenCalledWith('usuarioCriador.name')
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('totalAposta', 'DESC')
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(3)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith([
        { id: 1, nome: 'User One', totalAposta: 300 },
        { id: 2, nome: 'User Two', totalAposta: 250 },
        { id: 3, nome: 'User Three', totalAposta: 200 }
      ])
    })

    it('should return 404 if no top bettors found', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([])
      }

      DesafioRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder)

      await desafioController.maioresApostadores(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: Messages.NO_BETS_FOUND })
    })

    it('should return 500 if there is a server error', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockRejectedValue(new Error('Server error'))
      }

      DesafioRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder)

      await desafioController.maioresApostadores(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: Messages.INTERNAL_SERVER_ERROR })
    })
  })

  describe('DesafioController - aceitarDesafio', () => {
    let desafioController: DesafioController
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>

    beforeEach(() => {
      desafioController = new DesafioController()
      mockRequest = {
        body: {
          idAceitou: 2, // Simulando IDs válidos
          idDesafio: 1,
          escolhaDoUsuarioAceitou: 'pedra',
          valorDaAposta: 60

        }
      }
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      }
    })

    it('deve retornar status 400 se idAceitou ou idDesafio não forem fornecidos', async () => {
      mockRequest.body.idAceitou = undefined
      mockRequest.body.idDesafio = undefined

      await desafioController.aceitarDesafio(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'idAceitou e idDesafio são necessários.'
      })
    })

    it('deve retornar status 404 se usuário não for encontrado', async () => {
      mockedUsuarioRepository.findOne.mockResolvedValueOnce(null)

      await desafioController.aceitarDesafio(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário não encontrado.'
      })
    })
    it('deve retornar status 404 se desafio não for encontrado', async () => {
      mockedUsuarioRepository.findOne.mockResolvedValueOnce(mockUsuario)
      mockedDesafioRepository.findOne.mockResolvedValueOnce(null)

      await desafioController.aceitarDesafio(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Desafio não encontrado.'
      })
    })

    it('deve retornar status 400 se o valor da aposta não estiver definido', async () => {
      const mockDesafio = {
        ...mockRequest.body,
        valorDaAposta: undefined
      }

      mockedUsuarioRepository.findOne.mockResolvedValueOnce({ id: 1 } as Usuario)
      mockedDesafioRepository.findOne.mockResolvedValueOnce(mockDesafio as Desafio)

      await desafioController.aceitarDesafio(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'O valor da aposta não está definido'
      })
    })

    it('deve retornar status 400 se o usuário não tiver moeda suficiente', async () => {
      const mockUsuario = {
        moeda: 5 // Simulando moeda insuficiente
      }
      const mockDesafio = {
        ...mockRequest.body,
        valorDaAposta: 10 // Simulando aposta maior que a moeda do usuário
      }
      mockedUsuarioRepository.findOne.mockResolvedValueOnce(mockUsuario as Usuario)
      mockedDesafioRepository.findOne.mockResolvedValueOnce(mockDesafio as Desafio)

      await desafioController.aceitarDesafio(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Você não tem moeda Suficiente para aceitar o desafio.'
      })
    })
  })
})
