import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { Despesas } from 'src/despesas/entities/despesas.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column({ unique: true })
    email: string;

    @Column()
    senha: string;

    @OneToMany(() => Cartao, cartao => cartao.usuario)
    cartoes: Cartao[];

    @OneToMany(() => Despesas, despesas => despesas.usuario)
    despesas: Despesas[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}