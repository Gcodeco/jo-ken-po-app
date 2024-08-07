/* eslint-disable @typescript-eslint/no-explicit-any */
// __tests__/UsuarioController.test.ts

import { UsuarioController } from '../src/controllers/UsuarioController'
import { Usuario } from '../src/entities/Usuario'
import { Messages } from './../src/messagens'
import { Repository } from 'typeorm'

describe('UsuarioController', () => {
  let usuarioController: UsuarioController
  let mockUsuarioRepository: jest.Mocked<Repository<Usuario>>

  beforeEach(() => {
    mockUsuarioRepository = {
      save: jest.fn(),
      findOne: jest.fn()
      // Adicione outros métodos mockados se necessário
    } as any
    usuarioController = new UsuarioController()
    usuarioController.UsuarioRepository = mockUsuarioRepository
  })

  it('should create a new user', async () => {
    const req = {
      body: {
        name: 'John Doe',
        date_nasc: '1990-10-10',
        cpf: '123.456.789-00',
        rg: '12345678',
        username: 'johndoe',
        password: 'password123',
        email: 'johndoe@example.com'
      }
    } as any

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as any

    const userToSave = {
      name: req.body.name,
      date_nasc: new Date(req.body.date_nasc),
      cpf: parseFloat(req.body.cpf.replace(/\D/g, '')),
      rg: req.body.rg,
      username: req.body.username,
      password: expect.any(String),
      email: req.body.email,
      moeda: 1000

    } as Usuario

    mockUsuarioRepository.findOne.mockResolvedValue(null)
    mockUsuarioRepository.save.mockResolvedValue({
      ...userToSave,
      id: 1
    } as Usuario)

    console.log('Iniciando criação de usuário')
    await usuarioController.create(req, res)

    console.log('userToSave:', userToSave)
    console.log('save calls:', mockUsuarioRepository.save.mock.calls)
    console.log('res.json calls:', res.json.mock.calls)

    expect(mockUsuarioRepository.save).toHaveBeenCalledWith(expect.objectContaining(userToSave))
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      name: req.body.name,
      date_nasc: new Date(req.body.date_nasc),
      cpf: parseFloat(req.body.cpf.replace(/\D/g, '')),
      rg: req.body.rg,
      username: req.body.username,
      email: req.body.email,
      moeda: 1000,
      id: 1
    }))
  })

  it('should return an error if the user already exists', async () => {
    const req = {
      body: {
        name: 'John Doe',
        date_nasc: '1990-10-10',
        cpf: '123.456.789-00',
        rg: '12345678',
        username: 'johndoe',
        password: 'password123',
        email: 'johndoe@example.com'
      }
    } as any

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as any

    mockUsuarioRepository.findOne.mockResolvedValue({
      id: 1,
      ...req.body,
      moeda: 1000
    } as Usuario)

    await usuarioController.create(req, res)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ message: Messages.USER_ALREADY_EXISTS })
  })
  describe('verificarUsuarioExistente', () => {
    it('should return true if the user exists by email', async () => {
      // Simula que um usuário existe com o email fornecido
      mockUsuarioRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        date_nasc: new Date('1990-10-10'),
        cpf: 12345678900,
        rg: 12345678,
        username: 'johndoe',
        password: 'hashedPassword',
        email: 'johndoe@example.com',
        moeda: 1000
      } as Usuario)

      const result = await usuarioController.verificarUsuarioExistente('johndoe@example.com', 'johndoe')
      expect(result).toBe(true)
    })

    it('should return true if the user exists by username', async () => {
      // Simula que um usuário existe com o username fornecido
      mockUsuarioRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        date_nasc: new Date('1990-10-10'),
        cpf: 12345678900,
        rg: 12345678,
        username: 'johndoe',
        password: 'hashedPassword',
        email: 'johndoe@example.com',
        moeda: 1000
      } as Usuario)

      const result = await usuarioController.verificarUsuarioExistente('johndoe@example.com', 'johndoe')
      expect(result).toBe(true)
    })

    it('should return false if the user does not exist', async () => {
      // Simula que nenhum usuário existe com o email ou username fornecido
      mockUsuarioRepository.findOne.mockResolvedValue(null)

      const result = await usuarioController.verificarUsuarioExistente('nonexistent@example.com', 'nonexistentUser')
      expect(result).toBe(false)
    })
  })
})
