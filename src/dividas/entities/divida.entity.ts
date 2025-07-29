import { Cartao } from "src/cartoes/entities/cartoes.entity";
import { ContasAPagar } from "src/contas-a-pagar/entities/contas-a-pagar.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('dividas')

export class Dividas {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    descricao: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor_total: number;

    @Column({ type: 'boolean' })
    parcelado: boolean;

    @Column({ type: 'int', nullable: true }) // Tipo explícito para MySQL INT
    qtd_parcelas?: number; // Propriedade opcional no TypeScript

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) // Tipo explícito para MySQL DECIMAL
    valor_parcela?: number; // Propriedade opcional no TypeScript

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) // Tipo explícito para MySQL DECIMAL
    total_com_juros?: number; // Propriedade opcional no TypeScript

    @Column({ type: 'date' }) // Tipo explícito para MySQL DATE
    data_lancamento: Date;

    @Column({ type: 'date', nullable: true }) // Tipo explícito para MySQL DATE, e opcional
    data_fim_parcela?: Date; // Propriedade marcada como opcional

    // Relação Many-to-One com Cartão (uma dívida pertence a um cartão)
    @ManyToOne(() => Cartao, cartao => cartao.dividas, { onDelete: 'CASCADE' })
    cartao: Cartao;

    @Column() // Coluna para armazenar a chave estrangeira do cartão
    cartaoId: number;

    // Relação Many-to-One com Usuário (uma dívida pertence a um usuário)
    @ManyToOne(() => User, user => user.dividas, { onDelete: 'CASCADE' })
    usuario: User;

    @Column() // Coluna para armazenar a chave estrangeira do usuário
    usuarioId: number;

    // Relação One-to-Many com Contas a Pagar (uma dívida pode ter várias contas a pagar/parcelas)
    @OneToMany(() => ContasAPagar, contasPagar => contasPagar.divida)
    contasAPagar: ContasAPagar[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}