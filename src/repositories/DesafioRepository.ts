import { AppDataSource } from '../data-source'
import { Desafio } from '../entities/Desafio'

export const DesafioRepository = AppDataSource.getRepository(Desafio)
