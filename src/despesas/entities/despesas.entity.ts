import { Banco } from "src/banco/entities/banco.entity";
import { Cartao } from "src/cartoes/entities/cartoes.entity";
import { ContasAPagar } from "src/contas-a-pagar/entities/contas-a-pagar.entity";
import { Fornecedor } from "src/fornecedor/entities/fornecedor.entity";
import { SubCategoria } from "src/sub-categoria/entities/sub-categoria.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CategoriaEnum } from "../enums/CategoriaEnum";
import { FormaDePagamentoEnum } from "../enums/FormaDePagamentoEnum";
import { GrupoEnum } from "../enums/GrupoEnum";


@Entity('despesas')

export class Despesas {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    descricao: string;

    @Column({ type: 'enum', enum: CategoriaEnum })
    categoria: CategoriaEnum;

    @Column({ type: 'enum', enum: GrupoEnum })
    grupo: GrupoEnum;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @Column({ type: 'enum', enum: FormaDePagamentoEnum })
    formaDePagamento: FormaDePagamentoEnum;

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

    @ManyToOne(() => Cartao, cartao => cartao.despesas, { onDelete: 'CASCADE', nullable: true })
    cartao: Cartao;

    @Column({ nullable: true })
    cartaoId: number;

    @ManyToOne(() => User, user => user.despesas, { onDelete: 'CASCADE' })
    usuario: User;

    @Column()
    usuarioId: number;

    @ManyToOne(() => SubCategoria, subCategoria => subCategoria.despesas)
    subCategoria: SubCategoria;

    @Column()
    subCategoriaId: number;

    @ManyToOne(() => Fornecedor, fornecedor => fornecedor.despesas, { nullable: true })
    fornecedor: Fornecedor;

    @Column({ nullable: true })
    fornecedorId: number;

    @ManyToOne(() => Banco, banco => banco.despesas, { nullable: true })
    banco: Banco;

    @Column({ nullable: true })
    bancoId: number;

    @OneToMany(() => ContasAPagar, accountPayable => accountPayable.despesas)
    contasAPagar: ContasAPagar[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}