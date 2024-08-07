import { Usuario } from '../entities/Usuario'
import { AppDataSource } from '../data-source'

export const UsuarioRepository = AppDataSource.getRepository(Usuario)
