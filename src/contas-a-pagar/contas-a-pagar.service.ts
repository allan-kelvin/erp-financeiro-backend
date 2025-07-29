import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { Dividas } from 'src/dividas/entities/divida.entity';
import { User } from 'src/users/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateContasAPagarDto } from './dto/create-contas-a-pagar.dto/create-contas-a-pagar.dto';
import { UpdateContasAPagarDto } from './dto/update-contas-a-pagar.dto/update-contas-a-pagar.dto';
import { ContasAPagar } from './entities/contas-a-pagar.entity';
import { StatusContaPagar } from './enums/StatusContaPagar.enum';

@Injectable()
export class ContasAPagarService {

    constructor(
        @InjectRepository(ContasAPagar)
        private contasAPagarRepository: Repository<ContasAPagar>,
        @InjectRepository(Dividas)
        private dividasRepository: Repository<Dividas>,
        @InjectRepository(Cartao)
        private cartoesRepository: Repository<Cartao>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Cria uma nova conta a pagar. Usado principalmente para lançamentos avulsos,
     * já que as parcelas são geradas automaticamente pelas Dívidas.
     * @param createContaAPagarDto Os dados para criação da conta a pagar.
     * @param usuarioId O ID do usuário autenticado.
     * @returns A conta a pagar criada.
     * @throws NotFoundException Se a dívida ou cartão não forem encontrados ou não pertencerem ao usuário.
     */
    async create(createContaAPagarDto: CreateContasAPagarDto, usuarioId: number): Promise<ContasAPagar> {
        const { dividaId, cartaoId, ...rest } = createContaAPagarDto;

        // Verificar se o usuário existe
        const usuario = await this.usersRepository.findOne({ where: { id: usuarioId } });
        if (!usuario) {
            throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado.`);
        }

        // Verificar se a dívida existe e pertence ao usuário
        const divida = await this.dividasRepository.findOne({
            where: { id: dividaId, usuario: { id: usuarioId } },
        });
        if (!divida) {
            throw new NotFoundException(`Dívida com ID ${dividaId} não encontrada ou não pertence ao usuário.`);
        }

        // Verificar se o cartão existe e pertence ao usuário
        const cartao = await this.cartoesRepository.findOne({
            where: { id: cartaoId, usuario: { id: usuarioId } },
        });
        if (!cartao) {
            throw new NotFoundException(`Cartão com ID ${cartaoId} não encontrado ou não pertence ao usuário.`);
        }

        const contaAPagar = this.contasAPagarRepository.create({
            ...rest,
            divida: divida,
            dividaId: dividaId,
            cartao: cartao,
            cartaoId: cartaoId,
            status: rest.status || StatusContaPagar.ABERTO, // Garante um status padrão
            data_emissao: new Date(rest.data_emissao),
        });

        return this.contasAPagarRepository.save(contaAPagar);
    }

    /**
     * @param usuarioId O ID do usuário autenticado.
     * @param status Opcional: Filtra por status da conta a pagar.
     * @param dividaId Opcional: Filtra por ID da dívida associada.
     * @param cartaoId Opcional: Filtra por ID do cartão associado.
     * @returns Uma lista de contas a pagar do usuário.
     */
    async findAllByUserId(usuarioId: number, status?: StatusContaPagar, dividaId?: number, cartaoId?: number): Promise<ContasAPagar[]> {
        const where: FindOptionsWhere<ContasAPagar> = {
            divida: { usuario: { id: usuarioId } },
        };

        if (status) {
            where.status = status;
        }
        if (dividaId) {
            // Como 'divida' já é um objeto, podemos adicionar 'id' diretamente.
            // A asserção de tipo é usada para auxiliar o TypeScript em tipos parciais.
            (where.divida as FindOptionsWhere<Dividas>).id = dividaId;
        }
        if (cartaoId) {
            // Inicializa 'cartao' como um objeto se ele ainda não for, antes de atribuir o 'id'.
            // Isso evita o erro de 'spread type' se 'where.cartao' for undefined.
            where.cartao = { id: cartaoId };
        }

        return this.contasAPagarRepository.find({
            where,
            relations: ['divida', 'cartao'], // Carrega dados da dívida e do cartão associados
        });
    }
    /**
     * Retorna uma conta a pagar específica pelo ID, garantindo que ela pertença ao usuário.
     * @param id O ID da conta a pagar.
     * @param usuarioId O ID do usuário autenticado.
     * @returns A conta a pagar encontrada.
     * @throws NotFoundException Se a conta a pagar não for encontrada ou não pertencer ao usuário.
     */
    async findOne(id: number, usuarioId: number): Promise<ContasAPagar> {
        const contaAPagar = await this.contasAPagarRepository.findOne({
            where: { id: id, divida: { usuario: { id: usuarioId } } }, // Filtra por ID da conta E ID do usuário da dívida
            relations: ['divida', 'cartao'],
        });

        if (!contaAPagar) {
            throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada ou não pertence ao usuário.`);
        }
        return contaAPagar;
    }

    /**
     * Atualiza uma conta a pagar específica, garantindo que ela pertença ao usuário.
     * @param id O ID da conta a pagar a ser atualizada.
     * @param updateContaAPagarDto Os dados para atualização.
     * @param usuarioId O ID do usuário autenticado.
     * @returns A conta a pagar atualizada.
     */
    async update(id: number, updateContaAPagarDto: UpdateContasAPagarDto, usuarioId: number): Promise<ContasAPagar> {
        // Reutiliza findOne para validar se a conta a pagar existe e pertence ao usuário
        const contaAPagar = await this.findOne(id, usuarioId);

        // Se o dividaId ou cartaoId forem alterados, verificar se os novos pertencem ao usuário
        if (updateContaAPagarDto.dividaId && updateContaAPagarDto.dividaId !== contaAPagar.dividaId) {
            const newDivida = await this.dividasRepository.findOne({
                where: { id: updateContaAPagarDto.dividaId, usuario: { id: usuarioId } },
            });
            if (!newDivida) {
                throw new NotFoundException(`Nova dívida com ID ${updateContaAPagarDto.dividaId} não encontrada ou não pertence ao usuário.`);
            }
            contaAPagar.divida = newDivida;
            contaAPagar.dividaId = newDivida.id;
        }

        if (updateContaAPagarDto.cartaoId && updateContaAPagarDto.cartaoId !== contaAPagar.cartaoId) {
            const newCartao = await this.cartoesRepository.findOne({
                where: { id: updateContaAPagarDto.cartaoId, usuario: { id: usuarioId } },
            });
            if (!newCartao) {
                throw new NotFoundException(`Novo cartão com ID ${updateContaAPagarDto.cartaoId} não encontrado ou não pertence ao usuário.`);
            }
            contaAPagar.cartao = newCartao;
            contaAPagar.cartaoId = newCartao.id;
        }

        // Aplica as atualizações no objeto da conta a pagar
        this.contasAPagarRepository.merge(contaAPagar, updateContaAPagarDto);

        // Se o status for alterado para 'pago', defina a data de encerramento
        if (updateContaAPagarDto.status === StatusContaPagar.PAGO && !contaAPagar.data_encerramento) {
            contaAPagar.data_encerramento = new Date(); // Data e hora atual do pagamento
        } else if (updateContaAPagarDto.status !== StatusContaPagar.PAGO && contaAPagar.data_encerramento) {
            contaAPagar.data_encerramento = null; // Remove a data se o status não for pago
        }


        return this.contasAPagarRepository.save(contaAPagar);
    }

    /**
     * Remove uma conta a pagar específica, garantindo que ela pertença ao usuário.
     * @param id O ID da conta a pagar a ser removida.
     * @param usuarioId O ID do usuário autenticado.
     * @throws NotFoundException Se a conta a pagar não for encontrada ou não pertencer ao usuário.
     */
    async remove(id: number, usuarioId: number): Promise<void> {
        // Reutiliza findOne para validar se a conta a pagar existe e pertence ao usuário
        const contaAPagar = await this.findOne(id, usuarioId);

        await this.contasAPagarRepository.remove(contaAPagar);
    }
}
