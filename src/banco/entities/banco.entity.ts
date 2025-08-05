import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { StatusBanco } from "../enums/StatusBanco.enum";
import { TipoContaEnum } from "../enums/TipoConta.enum";

@Entity('bancos')
export class Banco {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column({ nullable: true })
    imagem_banco?: string;

    @Column({ type: 'enum', enum: TipoContaEnum, default: TipoContaEnum.CORRENTE })
    tipo_conta: string;


    @Column({ type: 'enum', enum: StatusBanco, default: StatusBanco.ATIVO })
    status: string;
}
