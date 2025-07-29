import {
    ConflictException,
    Injectable,
    NotFoundException,
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

    /**
     * @param createUserDto Dados para criação do usuário.
     * @returns O usuário recém-criado (sem a senha, idealmente).
     * @throws ConflictException Se um usuário com o mesmo email já existir.
     */
    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'senha'>> {
        // Verificar se o email já está em uso
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new ConflictException('Um usuário com este email já existe.');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.senha, 10); // O '10' é o saltRounds

        const user = this.usersRepository.create({
            ...createUserDto,
            senha: hashedPassword, // Armazena a senha hashada
        });

        const savedUser = await this.usersRepository.save(user);
        const { senha, ...result } = savedUser;
        return result;
    }

    /**
     * Retorna todos os usuários cadastrados.
     * @returns Uma lista de usuários.
     */
    async findAll(): Promise<Omit<User, 'senha'>[]> {
        const users = await this.usersRepository.find();
        return users.map((user) => {
            const { senha, ...result } = user;
            return result;
        });
    }

    /**
     * Retorna um usuário específico pelo ID.
     * @param id ID do usuário.
     * @returns O usuário encontrado.
     * @throws NotFoundException Se o usuário não for encontrado.
     */
    async findOne(id: number): Promise<Omit<User, 'senha'>> {
        // Define o tipo de retorno sem a senha
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
        const { senha, ...result } = user; // Remove senha antes de retornar
        return result;
    }
    /**
     * Retorna um usuário pelo email. Útil para autenticação.
     * Esta função retorna a senha (hashada) para validação.
     * @param email Email do usuário.
     * @returns O usuário encontrado, incluindo a senha hashada.
     */
    async findByEmail(email: string): Promise<User | null> {
        // Tipo de retorno alterado para User | null
        return this.usersRepository.findOne({ where: { email } });
    }
    /**
     * Atualiza as informações de um usuário existente.
     * Se a senha for fornecida no DTO de atualização, ela será hashada novamente.
     * @param id ID do usuário a ser atualizado.
     * @param updateUserDto Dados para atualização do usuário.
     * @returns O usuário atualizado.
     * @throws NotFoundException Se o usuário não for encontrado.
     * @throws ConflictException Se o novo email já estiver em uso por outro usuário.
     */
    async update(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<Omit<User, 'senha'>> {
        // Define o tipo de retorno sem a senha
        // Se o email for fornecido, verificar se já está em uso por outro usuário
        if (updateUserDto.email) {
            const existingUserWithEmail = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUserWithEmail && existingUserWithEmail.id !== id) {
                throw new ConflictException(
                    'Este email já está em uso por outro usuário.',
                );
            }
        }

        // Hash da nova senha se ela for fornecida
        if (updateUserDto.senha) {
            updateUserDto.senha = await bcrypt.hash(updateUserDto.senha, 10);
        }

        // O método preload carrega a entidade existente e aplica as mudanças do DTO
        const user = await this.usersRepository.preload({
            id: id,
            ...updateUserDto,
        });

        if (!user) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }

        const updatedUser = await this.usersRepository.save(user);
        const { senha, ...result } = updatedUser; // Remove senha antes de retornar
        return result;
    }

    /**
     * Remove um usuário do banco de dados.
     * @param id ID do usuário a ser removido.
     * @throws NotFoundException Se o usuário não for encontrado.
     */
    async remove(id: number): Promise<void> {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
    }
}
