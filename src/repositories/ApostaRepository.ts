import { AppDataSource } from '../data-source'
import { Aposta } from '../entities/Aposta'

export const ApostaRepository = AppDataSource.getRepository(Aposta)
