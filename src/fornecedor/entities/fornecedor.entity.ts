import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fornecedores')
export class Fornecedor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'razao_social', type: 'varchar', length: 255 })
    razaoSocial: string;

    @Column({ name: 'nome_fantasia', type: 'varchar', length: 255 })
    nomeFantasia: string;

    @Column({ name: 'cnpj', type: 'varchar', length: 18, unique: true })
    cnpj: string;

    @Column({ name: 'ie', type: 'varchar', length: 14, nullable: true })
    ie: string;

    @CreateDateColumn({ name: 'data_cadastro', type: 'timestamp' })
    dataCadastro: Date;

    @Column({ name: 'ativo', type: 'boolean', default: true })
    ativo: boolean;

    @Column({ name: 'telefone', type: 'varchar', length: 20 })
    telefone: string;

    @Column({ name: 'whatsapp', type: 'varchar', length: 20, nullable: true })
    whatsapp: string;

    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
    email: string;
}
