import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCartoesDto } from './dto/create-cartoes.dto/create-cartoes.dto';
import { UpdateCartoesDto } from './dto/update-cartoes.dto/update-cartoes.dto';
import { Cartao } from './entities/cartoes.entity';

@Injectable()
export class CartoesService {

    constructor(
        @InjectRepository(Cartao)
        private cartoesRepository: Repository<Cartao>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Cria um novo cartão para um usuário específico.
     * @param createCartaoDto Os dados para criação do cartão.
     * @param usuarioId O ID do usuário autenticado.
     * @param imagePath O caminho do arquivo de imagem (opcional).
     * @returns O cartão criado.
     */
    async create(createCartaoDto: CreateCartoesDto, usuarioId: number, imagePath?: string): Promise<Cartao> {
        const usuario = await this.usersRepository.findOne({ where: { id: usuarioId } });
        if (!usuario) {
            throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado.`);
        }

        const cartao = this.cartoesRepository.create({
            ...createCartaoDto,
            usuario: usuario,
            usuarioId: usuarioId,
            imagem_cartao: imagePath, // Salva o caminho da imagem
        });
        return this.cartoesRepository.save(cartao);
    }

    /**
     * Retorna todos os cartões pertencentes a um usuário específico.
     * @param usuarioId O ID do usuário autenticado.
     * @returns Uma lista de cartões do usuário.
     */
    async findAllByUserId(usuarioId: number): Promise<Cartao[]> {
        return this.cartoesRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: ['usuario'],
            order: { id: 'DESC' }
        });
    }

    /**
     * Retorna um cartão específico pelo ID, garantindo que ele pertença ao usuário.
     * @param id O ID do cartão.
     * @param usuarioId O ID do usuário autenticado.
     * @returns O cartão encontrado.
     * @throws NotFoundException Se o cartão não for encontrado ou não pertencer ao usuário.
     */
    async findOne(id: number, usuarioId: number): Promise<Cartao> {
        const cartao = await this.cartoesRepository.findOne({
            where: { id: id, usuario: { id: usuarioId } },
            relations: ['usuario'],
        });

        if (!cartao) {
            throw new NotFoundException(`Cartão com ID ${id} não encontrado ou não pertence ao usuário.`);
        }
        return cartao;
    }

    /**
     * Atualiza um cartão específico, garantindo que ele pertença ao usuário.
     * @param id O ID do cartão a ser atualizado.
     * @param updateCartaoDto Os dados para atualização.
     * @param usuarioId O ID do usuário autenticado.
     * @param imagePath O novo caminho do arquivo de imagem (opcional).
     * @returns O cartão atualizado.
     */
    async update(id: number, updateCartaoDto: UpdateCartoesDto, usuarioId: number, imagePath?: string): Promise<Cartao> {
        const cartao = await this.findOne(id, usuarioId);

        // Se uma nova imagem for enviada, atualiza o caminho
        if (imagePath !== undefined) { // Permite que 'null' seja passado para remover a imagem
            cartao.imagem_cartao = imagePath;
        }

        this.cartoesRepository.merge(cartao, updateCartaoDto);
        return this.cartoesRepository.save(cartao);
    }

    /**
     * Remove um cartão específico, garantindo que ele pertença ao usuário.
     * @param id O ID do cartão a ser removido.
     * @param usuarioId O ID do usuário autenticado.
     * @throws NotFoundException Se o cartão não for encontrado ou não pertencer ao usuário.
     */
    async remove(id: number, usuarioId: number): Promise<void> {
        const cartao = await this.findOne(id, usuarioId);
        // TODO: Adicionar lógica para remover o arquivo físico da imagem, se existir.
        await this.cartoesRepository.remove(cartao);
    }
}
