import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne
} from 'typeorm'
import { Usuario } from './Usuario'
import { Desafio } from './Desafio'

@Entity('apostas')
export class Aposta {
@PrimaryGeneratedColumn()
  id!: number

@Column({ type: 'decimal', precision: 10, scale: 2 })
  valorDaAposta!: number

@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataAposta!: Date

@ManyToOne(() => Usuario, (usuario) => usuario.apostas)
  apostador!: Usuario

@ManyToOne(() => Desafio, (desafio) => desafio.apostas)
  desafio!: Desafio

@Column({ type: 'text', nullable: true })
  resultado?: string
}
