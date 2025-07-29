import { Dividas } from 'src/dividas/entities/divida.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StatusContaPagar } from '../enums/StatusContaPagar.enum';
import { Cartao } from './../../cartoes/entities/cartoes.entity';


@Entity('contas_a_pagar')
export class ContasAPagar {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dividas, divida => divida.contasAPagar, { onDelete: 'CASCADE' })
    divida: Dividas;

    @Column()
    dividaId: number;

    @ManyToOne(() => Cartao, cartao => cartao.contasAPagar, { onDelete: 'CASCADE' })
    cartao: Cartao;

    @Column()
    cartaoId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor_pago: number;

    @Column({ type: 'date' })
    data_emissao: Date;

    @Column({ type: 'date', nullable: true })
    data_encerramento: Date | null;

    @Column({ type: 'enum', enum: StatusContaPagar, default: StatusContaPagar.ABERTO })
    status: StatusContaPagar;

    @Column({ type: 'text', nullable: true })
    observacoes: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}