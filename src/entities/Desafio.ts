import { Aposta } from './Aposta'
import { Usuario } from './Usuario'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity('desafios')
export class Desafio {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'text' })
    escolhaDoUsuarioCriador!: string

  @Column({ type: 'text', nullable: true })
    nomeUsuarioCriador?: string

  @Column({ type: 'text', nullable: true })
    escolhaDoUsuarioAceitou?: string

  @ManyToOne(() => Usuario, (usuario) => usuario.desafiosCriados)
  @JoinColumn({ name: 'id_criador' })
    usuarioCriador!: Usuario

  @ManyToOne(() => Usuario, (usuario) => usuario.desafiosAceitos)
  @JoinColumn({ name: 'id_acetou' })
    usuarioAceitou?: Usuario

  @Column({ type: 'text', nullable: true })
    resultado?: string

    @Column({ type: 'integer', nullable: true })
      idUsuarioGanhou?: number | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    valorDaAposta?: number

    @OneToMany(() => Aposta, (aposta) => aposta.desafio)
      apostas!: Aposta[]

    // eslint-disable-next-line no-useless-constructor
    constructor () {}
}
