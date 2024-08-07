/* eslint-disable no-unused-vars */
import { config } from 'dotenv'
import 'dotenv/config'
import path from 'path'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

config({ path: path.join(__dirname, '..', '.env.local') })

const port = parseInt(process.env.DB_PORT || '5432', 10)

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'api_rest_typescript',
  entities: [path.join(__dirname, '**', 'entities', '*.{ts,js}')],
  migrations: [path.join(__dirname, '**', 'migrations', '*.{ts,js}')]
})

export const findById = async (id: number) => {
  const query = 'SELECT * FROM usuarios WHERE id = $1'
  try {
    const manager = AppDataSource.manager
    const result = await manager.query(query, [id])
    return result[0] // Retorna o primeiro resultado
  } catch (error) {
    console.error('Error executing query', error)
    return null
  }
}
