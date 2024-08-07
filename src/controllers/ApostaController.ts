import { Request, Response } from 'express'
import { Aposta } from '../entities/Aposta'
import { Usuario } from '../entities/Usuario'
import { Desafio } from '../entities/Desafio'
import { AppDataSource } from '../data-source'
import { Messages } from '../messagens'

export class ApostaController {
  private apostaRepository = AppDataSource.getRepository(Aposta)
  private usuarioRepository = AppDataSource.getRepository(Usuario)
  private desafioRepository = AppDataSource.getRepository(Desafio)

  async criarAposta (req: Request, res: Response): Promise<Response> {
    const { valorDaAposta, apostadorId, desafioId } = req.body

    try {
      const apostador = await this.usuarioRepository.findOneBy({ id: apostadorId })
      const desafio = await this.desafioRepository.findOneBy({ id: desafioId })

      if (!apostador || !desafio) {
        return res.status(404).json({ message: Messages.USER_OR_CHALLENGE_NOT_FOUND })
      }

      const aposta = new Aposta()
      aposta.valorDaAposta = valorDaAposta
      aposta.apostador = apostador
      aposta.desafio = desafio

      const savedAposta = await this.apostaRepository.save(aposta)
      return res.status(201).json(savedAposta)
    } catch (error) {
      console.error('Erro ao criar aposta:', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async atualizarResultado (req: Request, res: Response): Promise<Response> {
    const { apostaId, resultado } = req.body

    try {
      const aposta = await this.apostaRepository.findOneBy({ id: apostaId })
      if (!aposta) {
        return res.status(404).json({ message: Messages.BET_NOT_FOUND })
      }

      aposta.resultado = resultado
      await this.apostaRepository.save(aposta)

      return res.status(200).json(aposta)
    } catch (error) {
      console.error('Erro ao atualizar resultado da aposta:', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }
}
