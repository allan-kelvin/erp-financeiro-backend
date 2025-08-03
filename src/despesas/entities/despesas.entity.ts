import { Cartao } from "src/cartoes/entities/cartoes.entity";
import { ContasAPagar } from "src/contas-a-pagar/entities/contas-a-pagar.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoDespesaEnum } from "../enums/TipoDespesasEnum";


@Entity('despesas')

export class Despesas {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    descricao: string;

    @Column({ type: 'enum', enum: TipoDespesaEnum })
    tipo_despesa: TipoDespesaEnum;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor_total: number;

    @Column({ type: 'boolean', default: false })
    parcelado: boolean;

    @Column({ type: 'int', nullable: true })
    qtd_parcelas?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    valor_parcela?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    total_com_juros?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    juros_aplicado?: number;

    @Column({ type: 'date' })
    data_lancamento: Date;

    @Column({ type: 'date', nullable: true })
    data_fim_parcela?: Date;

    @ManyToOne(() => Cartao, cartao => cartao.despesas, { onDelete: 'CASCADE' })
    cartao: Cartao;

    @Column()
    cartaoId: number;

    @ManyToOne(() => User, user => user.despesas, { onDelete: 'CASCADE' })
    usuario: User;

    @Column()
    usuarioId: number;

    @OneToMany(() => ContasAPagar, accountPayable => accountPayable.despesas)
    contasAPagar: ContasAPagar[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}