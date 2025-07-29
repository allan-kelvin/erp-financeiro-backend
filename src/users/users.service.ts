import {
    BadRequestException,
    Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'senha'>> {
        const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new BadRequestException('Este e-mail já está em uso.');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            senha: hashedPassword,
        });

        const savedUser = await this.usersRepository.save(user);
        const { senha, ...result } = savedUser;
        console.log('Usuário salvo no banco de dados:', result); // Log para confirmar salvamento
        return result;
    }

    async findAll(usuarioId: number): Promise<Omit<User, 'senha'>[]> {
        const users = await this.usersRepository.find({ where: { id: usuarioId } });
        return users.map(user => {

            const { senha, ...result } = user;
            return result;
        });
    }

    async findOne(id: number, usuarioId?: number): Promise<Omit<User, 'senha'> | null> {
        const whereCondition: any = { id };
        if (usuarioId) {
            whereCondition.id = usuarioId; // Garante que o usuário só pode buscar a si mesmo
        }
        const user = await this.usersRepository.findOne({ where: whereCondition });
        if (!user) {
            return null;
        }

        const { senha, ...result } = user;
        return result;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async update(id: number, updateUserDto: UpdateUserDto, usuarioId: number): Promise<Omit<User, 'senha'> | null> {
        // Garante que o usuário só pode atualizar a si mesmo
        if (id !== usuarioId) {
            throw new BadRequestException('Você não tem permissão para atualizar este usuário.');
        }

        const user = await this.usersRepository.findOne({ where: { id: usuarioId } });
        if (!user) {
            return null; // Usuário não encontrado
        }

        if (updateUserDto.senha) {
            user.senha = await bcrypt.hash(updateUserDto.senha, 10);
        }
        // Atualiza outras propriedades
        Object.assign(user, updateUserDto);

        const savedUser = await this.usersRepository.save(user);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { senha, ...updatedResult } = savedUser;
        return updatedResult;
    }

    async remove(id: number, usuarioId: number): Promise<boolean> {
        // Garante que o usuário só pode deletar a si mesmo
        if (id !== usuarioId) {
            throw new BadRequestException('Você não tem permissão para remover este usuário.');
        }

        const result = await this.usersRepository.delete({ id: usuarioId });
        return result.affected! > 0;
    }
}
