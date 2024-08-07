/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eqeqeq */
import { Messages } from './../messagens'
import { UsuarioRepository } from './../repositories/UsuarioRepository'
import { DesafioRepository } from './../repositories/desafioRepository'
import { Usuario } from './../entities/Usuario'
import { Request, Response } from 'express'
import { Desafio } from '../entities/Desafio'

export interface Apostar{

  id: number
  nome: string
  quantidade: number
}

export class DesafioController {
  async create (req: Request, res: Response): Promise<Response> {
    const { id, escolhaDoUsuarioCriador, valorDaAposta } = req.body
    console.log(id, escolhaDoUsuarioCriador, valorDaAposta)

    try {
      const usuarioCriador = await UsuarioRepository.findOneBy({ id })
      if (!usuarioCriador) {
        console.log(usuarioCriador)
        throw new Error(Messages.USER_NOT_FOUND)
      }

      if (!validarAposta(valorDaAposta, usuarioCriador.moeda)) {
        throw new Error(Messages.BET_AMOUNT_INVALID)
      }

      let desafio = new Desafio()
      desafio.usuarioCriador = usuarioCriador
      desafio.nomeUsuarioCriador = usuarioCriador.name
      desafio.escolhaDoUsuarioCriador = escolhaDoUsuarioCriador
      desafio.valorDaAposta = valorDaAposta

      usuarioCriador.moeda -= valorDaAposta
      await UsuarioRepository.save(usuarioCriador)

      desafio = await DesafioRepository.save(desafio)

      const response = {
        message: Messages.CHALLENGE_CREATED,
        desafio: {
          id: desafio.id,
          escolhaDoUsuarioCriador: desafio.escolhaDoUsuarioCriador,
          valorDaAposta: desafio.valorDaAposta,
          usuarioCriador: {
            id: usuarioCriador.id,
            nome: usuarioCriador.name
          }
        }
      }

      console.log(response)
      return res.status(201).json({ response })
    } catch (error) {
      if (error instanceof Error && error.message === Messages.BET_AMOUNT_INVALID) {
        return res.status(400).json({ message: Messages.BET_AMOUNT_INVALID })
      }
      console.log(error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async consultarApostasPorUsuario (
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params
    const usuarioId = parseInt(id, 10)
    if (isNaN(usuarioId)) {
      return res.status(400).json({ message: Messages.INVALID_ID })
    }

    try {
      const usuario = await findUsuario(usuarioId)
      console.log(`Usuário encontrado: ${JSON.stringify(usuario)}`)
      if (!usuario) {
        return res.status(404).json({ message: Messages.USER_NOT_FOUND })
      }
      const desafiosDoUsuario = await DesafioRepository.createQueryBuilder('desafio')
        .leftJoinAndSelect('desafio.usuarioCriador', 'criador')
        .leftJoinAndSelect('desafio.usuarioAceitou', 'aceitou')
        .where('desafio.usuarioCriador = :usuarioId OR desafio.usuarioAceitou = :usuarioId', { usuarioId })
        .getMany()

      console.log(desafiosDoUsuario)

      return res.status(200).json(desafiosDoUsuario)
    } catch (error) {
      console.error('Erro ao consultar apostas por usuário:', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async maioresApostadores (req: Request, res: Response): Promise<Response> {
    try {
      const apostasCriadas = await DesafioRepository.createQueryBuilder('desafios')
        .leftJoin('desafios.usuarioCriador', 'usuarioCriador')
        .select([
          'usuarioCriador.id AS usuarioId',
          'usuarioCriador.name AS usuarioName',
          'COUNT(desafios.id) AS totalApostasCriadas'
        ])
        .groupBy('usuarioCriador.id')
        .addGroupBy('usuarioCriador.name')
        .orderBy('totalApostasCriadas', 'DESC')
        .limit(3)
        .where('desafios.usuarioCriador IS NOT NULL')
        .getRawMany()

      // Consultar apostas dos usuários que aceitaram
      const apostasAceitas = await DesafioRepository.createQueryBuilder('desafios')
        .leftJoin('desafios.usuarioAceitou', 'usuarioAceitou')
        .select([
          'usuarioAceitou.id AS usuarioId',
          'usuarioAceitou.name AS usuarioName',
          'COUNT(desafios.id) AS totalApostasAceitas'
        ])
        .groupBy('usuarioAceitou.id')
        .addGroupBy('usuarioAceitou.name')
        .orderBy('totalApostasAceitas', 'DESC')
        .limit(3)
        .where('desafios.usuarioAceitou IS NOT NULL')
        .getRawMany()

      const apostadoresMap = new Map<string, Apostar>()

      apostasCriadas.forEach(aposta => {
        const quantidadeCriada = parseInt(aposta.totalapostascriadas, 10)
        apostadoresMap.set(aposta.usuarioid, {
          id: aposta.usuarioid,
          nome: aposta.usuarioname,
          quantidade: quantidadeCriada
        })
      })

      apostasAceitas.forEach(aposta => {
        const usuarioId = aposta.usuarioid
        const totalApostasAceitas = parseInt(aposta.totalapostasaceitas, 10)
        if (apostadoresMap.has(usuarioId)) {
          const apostador = apostadoresMap.get(usuarioId)
          apostador.quantidade += totalApostasAceitas
        } else {
          apostadoresMap.set(usuarioId, {
            id: usuarioId,
            nome: aposta.usuarioname,
            quantidade: totalApostasAceitas
          })
        }
      })

      // Converter o Map para array e ordenar
      const maioresApostadoresTotal = Array.from(apostadoresMap.values())
      maioresApostadoresTotal.sort((a, b) => b.quantidade - a.quantidade)
      const top3Apostadores = maioresApostadoresTotal.slice(0, 3)

      console.log(top3Apostadores)

      return res.status(200).json(top3Apostadores)
    } catch (error) {
      console.error('Erro ao buscar os principais apostadores:', error)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  async maioresApostas (req: Request, res: Response): Promise<Response> {
    try {
      const desafios = await DesafioRepository
        .createQueryBuilder('desafio')
        .orderBy('desafio.valorDaAposta', 'DESC')
        .limit(3)
        .getMany()

      if (desafios.length > 0) {
        return res.status(200).json(desafios)
      } else {
        return res.status(404).json({ message: Messages.NO_BETS_FOUND })
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async maioresGanhadores (req: Request, res: Response): Promise<Response> {
    try {
      const usuarios = await UsuarioRepository.find()
      if (usuarios.length === 0) {
        console.log('Nenhum usuário encontrado')
        return res.status(200).json([])
      }

      const ganhadores: { usuario: Usuario; vitorias: number }[] = []

      for (const usuario of usuarios) {
        console.log(`Verificando vitórias para o usuário: ${usuario.id}`)
        const vitorias = await DesafioRepository.count({
          where: { idUsuarioGanhou: usuario.id }
        })
        console.log(`Usuário ${usuario.id} tem ${vitorias} vitórias`)
        if (vitorias > 0) {
          ganhadores.push({ usuario, vitorias })
        }
      }

      ganhadores.sort((a, b) => b.vitorias - a.vitorias)
      const maioresGanhadores = ganhadores.slice(0, 3).map((ganhador) => {
        return { id: ganhador.usuario.id, name: ganhador.usuario.name, vitorias: ganhador.vitorias }
      })
      console.log(maioresGanhadores)
      return res.status(200).json(maioresGanhadores)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async buscarDesafios (
    req: Request,
    res: Response
  ): Promise<Response> {
    const usuarioLogadoId = parseInt(req.headers['usuario-id'] as string, 10)
    try {
      const desafios = await DesafioRepository.find({
        relations: ['usuarioCriador', 'usuarioAceitou']
      })
      if (desafios.length > 0) {
        const desafiosFiltrados = desafios
          .filter(desafio => !desafio.escolhaDoUsuarioAceitou && desafio.usuarioCriador && desafio.usuarioCriador.id !== usuarioLogadoId)
          .map(desafio => ({
            id: desafio.id,
            escolhaDoUsuarioCriador: desafio.escolhaDoUsuarioCriador,
            escolhaDoUsuarioAceitou: desafio.escolhaDoUsuarioAceitou,
            valorDaAposta: desafio.valorDaAposta,
            resultado: desafio.resultado,
            usuarioCriador: desafio.usuarioCriador
              ? {
                  id: desafio.usuarioCriador.id,
                  nome: desafio.usuarioCriador.name
                }
              : null,
            usuarioAceitou: desafio.usuarioAceitou
              ? {
                  id: desafio.usuarioAceitou.id,
                  nome: desafio.usuarioAceitou.name
                }
              : null
          }))
        console.log(desafiosFiltrados)
        return res.status(200).json(desafiosFiltrados)
      } else {
        return res.status(404).json({ message: Messages.NO_CHALLENGES_FOUND })
      }
    } catch (erro) {
      console.error('Erro ao buscar desafio', erro)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }

  async aceitarDesafio (req: Request, res: Response): Promise<Response> {
    const { idAceitou, idDesafio, escolhaDoUsuarioAceitou } = req.body
    console.log(`idAceitou: ${idAceitou}, idDesafio: ${idDesafio}, escolhaDoUsuarioAceitou: ${escolhaDoUsuarioAceitou}`)

    if (!idAceitou || !idDesafio) {
      return res.status(400).json({ message: 'idAceitou e idDesafio são necessários.' })
    }
    try {
      const [usuarioAceitou, desafio] = await Promise.all([
        findUsuario(idAceitou),
        findDesafio(idDesafio)
      ])
      if (!usuarioAceitou) {
        console.log(`Usuário não encontrado: ${idAceitou}`)
        return res.status(404).json({ message: 'Usuário não encontrado.' })
      }
      if (!desafio) {
        console.log(`Desafio não encontrado: ${idDesafio}`)
        return res.status(404).json({ message: 'Desafio não encontrado.' })
      }
      console.log(`Usuário encontrado: ${JSON.stringify(usuarioAceitou)}`)
      console.log(`Desafio encontrado: ${JSON.stringify(desafio)}`)

      if (desafio.valorDaAposta === undefined) {
        return res.status(400).json({ message: 'O valor da aposta não está definido' })
      }

      if (usuarioAceitou.moeda < desafio.valorDaAposta) {
        return res.status(400).json({ message: 'Você não tem moeda Suficiente para aceitar o desafio.' })
      }

      desafio.escolhaDoUsuarioAceitou = escolhaDoUsuarioAceitou
      usuarioAceitou.moeda -= desafio.valorDaAposta
      desafio.usuarioAceitou = usuarioAceitou

      const pedra = 'pedra'
      const tesoura = 'tesoura'
      const papel = 'papel'
      const empate = 'empate'

      if (desafio.escolhaDoUsuarioCriador === desafio.escolhaDoUsuarioAceitou) {
        desafio.resultado = empate
      } else if (
        (desafio.escolhaDoUsuarioCriador == pedra && desafio.escolhaDoUsuarioAceitou == tesoura) ||
          (desafio.escolhaDoUsuarioCriador == tesoura && desafio.escolhaDoUsuarioAceitou == papel) ||
          (desafio.escolhaDoUsuarioCriador == papel && desafio.escolhaDoUsuarioAceitou == pedra)
      ) {
        desafio.resultado = desafio.escolhaDoUsuarioCriador
        desafio.idUsuarioGanhou = desafio.usuarioCriador.id
        desafio.usuarioCriador.moeda += 2 * desafio.valorDaAposta
      } else {
        desafio.resultado = desafio.escolhaDoUsuarioAceitou
        desafio.idUsuarioGanhou = desafio.usuarioAceitou?.id
        usuarioAceitou.moeda += 2 * desafio.valorDaAposta
      }

      await Promise.all([
        UsuarioRepository.save(usuarioAceitou),
        UsuarioRepository.save(desafio.usuarioCriador),
        DesafioRepository.save(desafio)
      ])

      const desafioFiltrado = {
        id: desafio.id,
        escolhaDoUsuarioCriador: desafio.escolhaDoUsuarioCriador,
        escolhaDoUsuarioAceitou: desafio.escolhaDoUsuarioAceitou,
        valorDaAposta: desafio.valorDaAposta,
        resultado: desafio.resultado,
        idUsuarioGanhou: desafio.idUsuarioGanhou,
        usuarioGanhador: desafio.idUsuarioGanhou
          ? {
              id: desafio.idUsuarioGanhou,
              name: desafio.idUsuarioGanhou === desafio.usuarioCriador.id
                ? desafio.usuarioCriador.name
                : desafio.usuarioAceitou?.name
            }
          : null,
        usuarioCriador: desafio.usuarioCriador
          ? {
              id: desafio.usuarioCriador.id,
              name: desafio.usuarioCriador.name
            }
          : null,
        usuarioAceitou: desafio.usuarioAceitou
          ? {
              id: desafio.usuarioAceitou.id,
              name: desafio.usuarioAceitou.name
            }
          : null
      }
      return res.status(200).json({
        message: desafio.resultado === 'empate'
          ? 'O desafio terminou em empate.'
          : `O desafio foi ganho por ${desafioFiltrado.usuarioGanhador?.name || 'desconhecido'}`,
        desafio: desafioFiltrado
      })
    } catch (error) {
      console.error('Erro ao aceitar desafio', error)
      return res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR })
    }
  }
}

function validarAposta (valorDaAposta: number, moedaUsuario: number): boolean {
  if (typeof valorDaAposta !== 'number' || typeof moedaUsuario !== 'number') {
    return false
  }
  if (valorDaAposta < 10 || moedaUsuario < 0) {
    return false
  }
  return valorDaAposta >= 10 && valorDaAposta <= moedaUsuario
}

async function findUsuario (id: number): Promise<Usuario | null> {
  try {
    if (isNaN(id) || id <= 0) {
      throw new Error(`ID inválido: ${id}`)
    }

    console.log(`Procurando usuário com id: ${id}`)
    const usuario = await UsuarioRepository.findOne({ where: { id } })

    if (!usuario) {
      console.log(`Nenhum usuário encontrado com id: ${id}`)
    }

    return usuario || null
  } catch (error) {
    console.error('Erro ao encontrar o usuário:', error)
    throw new Error('Error finding challenge')
  }
}

async function findDesafio (id:number): Promise<Desafio | null> {
  try {
    console.log(`Procurando desafio com id: ${id}`)

    const desafio = await DesafioRepository.findOne({
      where: { id },
      relations: ['usuarioCriador', 'usuarioAceitou']
    })

    if (desafio) {
      console.log(`Desafio encontrado: ${JSON.stringify(desafio)}`)
    } else {
      console.log(`Nenhum desafio encontrado com id: ${id}`)
    }
    return desafio || null
  } catch (error) {
    console.error('Erro ao encontrar o desafio', error)
    throw Error('Error finding challenge')
  }
}
