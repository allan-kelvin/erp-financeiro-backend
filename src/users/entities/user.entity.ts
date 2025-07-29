import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { Dividas } from 'src/dividas/entities/divida.entity';
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
    senha: string; // Lembre-se de hashar senhas!

    @OneToMany(() => Cartao, cartao => cartao.usuario)
    cartoes: Cartao[];

    @OneToMany(() => Dividas, divida => divida.usuario)
    dividas: Dividas[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}