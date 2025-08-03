import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { Despesas } from 'src/despesas/entities/despesas.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bandeira } from '../enums/Bandeira.enum';
import { StatusCartao } from '../enums/StatusCartao.enum';
import { TipoCartao } from '../enums/TipoCartao.enum';

@Entity('cartoes')
export class Cartao {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    descricao: string;

    @Column({ type: 'enum', enum: Bandeira })
    bandeira: Bandeira;

    @Column({ type: 'enum', enum: TipoCartao })
    tipo_cartao: TipoCartao;

    @Column({ nullable: true })
    imagem_cartao: string;

    @Column({ type: 'enum', enum: StatusCartao, default: StatusCartao.ATIVO })
    status: StatusCartao;

    @ManyToOne(() => User, user => user.cartoes, { onDelete: 'CASCADE' })
    usuario: User;

    @Column()
    usuarioId: number;

    @OneToMany(() => Despesas, despesas => despesas.cartao)
    despesas: Despesas[];

    @OneToMany(() => ContasAPagar, accountPayable => accountPayable.cartao)
    contasAPagar: ContasAPagar[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}