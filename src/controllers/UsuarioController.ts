import { Messages } from './../messagens'
import { Request, Response } from 'express'
import { UsuarioRepository } from '../repositories/UsuarioRepository'
import { Usuario } from '../entities/Usuario'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt' // Adicionar bcrypt para hash de senha
import { AppDataSource } from '../data-source'
import moment from 'moment'

export class UsuarioController {
  public UsuarioRepository = AppDataSource.getRepository(Usuario)

  constructor () {
    this.create = this.create.bind(this) // Garante que o método create esteja vinculado à instância correta
    this.verificarUsuarioExistente = this.verificarUsuarioExistente.bind(this) // Garante que o método verificarUsuarioExistente esteja vinculado à instância correta
    this.getBalance = this.getBalance.bind(this)
  }

  private formatarData (data: string): string {
    const dataMoment = moment(data, moment.ISO_8601, true)
    if (!dataMoment.isValid()) {
      return '1990-10-10'
    }
    return dataMoment.format('yyy-MM-DD')
  }

  async create (req: Request, res: Response): Promise<Response> {
    // eslint-disable-next-line camelcase

    try {
      // eslint-disable-next-line camelcase
      const { name, date_nasc, cpf, rg, username, password, email } =
      req.body as {
        name: string
        date_nasc: string // Assume que date_nasc é uma string do request
        cpf: string
        rg: number
        username: string
        password: string
        email: string
      }
      // Verifica se o usuário já existe
      try {
        const usuarioExistente = await this.verificarUsuarioExistente(email, username)
        if (usuarioExistente) {
          console.error('Usuário já Existe')
          return res.status(422).json({ message: Messages.USER_ALREADY_EXISTS })
        }
        // Continuação do seu código aqui após verificar a inexistência do usuário
      } catch (error) {
        console.error('Erro ao verificar usuário existente:', error)
        return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
      }
      const hashedPassword = await bcrypt.hash(password, 10) // Gerar hash da senha
      const cpfNumber = parseFloat(cpf.replace(/\D/g, ''))
      const formatedDataNasc = new Date(this.formatarData(date_nasc))

      const usuario = new Usuario(
        name,
        formatedDataNasc,
        cpfNumber,
        rg,
        username,
        hashedPassword,
        email
      )

      usuario.moeda = 1000

      const savedUsuario = await this.UsuarioRepository.save(usuario)
      // Remove a senha do objeto antes de enviar a resposta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: omitPassword, ...responseUsuario } = savedUsuario
      return res.status(201).json(responseUsuario)
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  public async verificarUsuarioExistente (email: string, username: string): Promise<boolean> {
    const usuario = await this.UsuarioRepository.findOne({ where: [{ email }, { username }] })
    return usuario !== null
  }

  async autenticar (req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as { email: string; password: string }
    const secret = 'teste123'

    try {
      if (!email || !password) {
        return res.status(422).json({ message: Messages.EMAIL_AND_PASSWORD_REQUIRED })
      }

      const usuario = await findUsuario(email)
      if (!usuario) {
        return res.status(404).json({ message: Messages.NO_USERS_FOUND })
      }

      const passwordMatch = await bcrypt.compare(password, usuario.password) // Comparar hashes de senha
      if (!passwordMatch) {
        return res.status(422).json({ message: Messages.INCORRECT_PASSWORD })
      }

      const token = jwt.sign({ id: usuario.id }, secret)
      const authData = { token, id: usuario.id, email }
      return res
        .status(200)
        .json({ msg: Messages.AUTHENTICATION_SUCCESS, authData })
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async getBalance (req: Request, res: Response): Promise<Response> {
    const { id } = req.params

    try {
      const usuario = await this.UsuarioRepository.findOneBy({ id: Number(id) })
      if (!usuario) {
        return res.status(404).json({ message: Messages.USER_NOT_FOUND })
      }
      return res.status(200).json({ balance: usuario.moeda })
    } catch (error) {
      console.error('Erro ao obter saldo do usuário:', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }
}

async function findUsuario (email: string): Promise<Usuario | null> {
  try {
    return await UsuarioRepository
      .createQueryBuilder('usuarios')
      .where('usuarios.email = :email', { email })
      .getOne()
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}
