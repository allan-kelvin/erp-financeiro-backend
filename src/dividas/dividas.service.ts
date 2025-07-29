import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMonths } from 'date-fns';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { StatusContaPagar } from 'src/contas-a-pagar/enums/StatusContaPagar.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateDividasDto } from './dto/create-dividas.dto/create-dividas.dto';
import { UpdateDividasDto } from './dto/update-dividas.dto/update-dividas.dto';
import { Dividas } from './entities/divida.entity';


@Injectable()
export class DividasService {
  constructor(
    @InjectRepository(Dividas)
    private dividasRepository: Repository<Dividas>,
    @InjectRepository(ContasAPagar)
    private accountsPayableRepository: Repository<ContasAPagar>,
    @InjectRepository(User) // Injeta o repositório de usuários
    private usersRepository: Repository<User>,
    @InjectRepository(Cartao) // Injeta o repositório de cartões para validação
    private cartoesRepository: Repository<Cartao>,
  ) { }

  /**
   * Cria uma nova dívida para um usuário específico, gerando contas a pagar se parcelado.
   * @param createDividaDto Os dados para criação da dívida.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A dívida criada.
   */
  async create(createDividaDto: CreateDividasDto, usuarioId: number): Promise<Dividas> {
    const { parcelado, valor_total, qtd_parcelas, data_lancamento, cartaoId, ...rest } = createDividaDto;

    // 1. Verificar se o usuário existe
    const usuario = await this.usersRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado.`);
    }

    // 2. Verificar se o cartão existe e pertence ao usuário
    const cartao = await this.cartoesRepository.findOne({
      where: { id: cartaoId, usuario: { id: usuarioId } },
    });
    if (!cartao) {
      throw new NotFoundException(`Cartão com ID ${cartaoId} não encontrado ou não pertence ao usuário.`);
    }

    const divida = this.dividasRepository.create({
      ...rest,
      valor_total,
      parcelado,
      data_lancamento: new Date(data_lancamento),
      cartao: cartao, // Associa o objeto cartão
      cartaoId: cartaoId,
      usuario: usuario, // Associa o objeto usuário
      usuarioId: usuarioId, // Garante que a chave estrangeira seja definida corretamente
    });

    if (parcelado) {
      divida.qtd_parcelas = qtd_parcelas;
      divida.valor_parcela = valor_total / qtd_parcelas!; // Use ! para afirmar que não é nulo aqui
      divida.data_fim_parcela = addMonths(new Date(data_lancamento), qtd_parcelas!);
    } else {
      divida.qtd_parcelas = undefined;
      divida.valor_parcela = undefined;
      divida.total_com_juros = undefined;
      divida.data_fim_parcela = undefined;
    }

    const savedDivida = await this.dividasRepository.save(divida);

    // Gerar contas a pagar
    if (parcelado) {
      for (let i = 0; i < savedDivida.qtd_parcelas!; i++) {
        const dueDate = addMonths(new Date(data_lancamento), i); // Data de vencimento da parcela
        const accountPayable = this.accountsPayableRepository.create({
          divida: savedDivida,
          dividaId: savedDivida.id,
          cartao: cartao,
          cartaoId: cartaoId,
          valor_pago: savedDivida.valor_parcela!,
          data_emissao: dueDate,
          status: StatusContaPagar.ABERTO,
        });
        await this.accountsPayableRepository.save(accountPayable);
      }
    } else {
      const accountPayable = this.accountsPayableRepository.create({
        divida: savedDivida,
        dividaId: savedDivida.id,
        cartao: cartao,
        cartaoId: cartaoId,
        valor_pago: savedDivida.valor_total,
        data_emissao: new Date(data_lancamento),
        status: StatusContaPagar.ABERTO,
      });
      await this.accountsPayableRepository.save(accountPayable);
    }

    return savedDivida;
  }

  /**
   * Retorna todas as dívidas pertencentes a um usuário específico.
   * @param usuarioId O ID do usuário autenticado.
   * @returns Uma lista de dívidas do usuário.
   */
  async findAllByUserId(usuarioId: number): Promise<Dividas[]> {
    return this.dividasRepository.find({
      where: { usuario: { id: usuarioId } }, // Filtra por usuário
      relations: ['usuario', 'cartao'], // Carrega dados do usuário e do cartão associado
    });
  }

  /**
   * Retorna uma dívida específica pelo ID, garantindo que ela pertença ao usuário.
   * @param id O ID da dívida.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A dívida encontrada.
   * @throws NotFoundException Se a dívida não for encontrada ou não pertencer ao usuário.
   */
  async findOne(id: number, usuarioId: number): Promise<Dividas> {
    const divida = await this.dividasRepository.findOne({
      where: { id: id, usuario: { id: usuarioId } }, // Filtra por ID da dívida E ID do usuário
      relations: ['usuario', 'cartao'],
    });

    if (!divida) {
      throw new NotFoundException(`Dívida com ID ${id} não encontrada ou não pertence ao usuário.`);
    }
    return divida;
  }

  /**
   * Atualiza uma dívida específica, garantindo que ela pertença ao usuário.
   * @param id O ID da dívida a ser atualizada.
   * @param updateDividaDto Os dados para atualização.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A dívida atualizada.
   */
  async update(id: number, updateDividaDto: UpdateDividasDto, usuarioId: number): Promise<Dividas> {
    // Reutiliza findOne para validar se a dívida existe e pertence ao usuário
    const divida = await this.findOne(id, usuarioId);

    // Se o cartaoId for alterado, verificar se o novo cartão pertence ao usuário
    if (updateDividaDto.cartaoId && updateDividaDto.cartaoId !== divida.cartaoId) {
      const newCartao = await this.cartoesRepository.findOne({
        where: { id: updateDividaDto.cartaoId, usuario: { id: usuarioId } },
      });
      if (!newCartao) {
        throw new NotFoundException(`Novo cartão com ID ${updateDividaDto.cartaoId} não encontrado ou não pertence ao usuário.`);
      }
      divida.cartao = newCartao;
      divida.cartaoId = newCartao.id;
    }

    // Aplica as atualizações no objeto da dívida
    this.dividasRepository.merge(divida, updateDividaDto);

    // Recalcular informações de parcela se campos relevantes forem atualizados
    if (updateDividaDto.parcelado !== undefined || updateDividaDto.valor_total !== undefined || updateDividaDto.qtd_parcelas !== undefined || updateDividaDto.data_lancamento !== undefined) {
      if (divida.parcelado) {
        divida.valor_parcela = divida.valor_total / divida.qtd_parcelas!;
        divida.data_fim_parcela = addMonths(divida.data_lancamento, divida.qtd_parcelas!);
      } else {
        divida.qtd_parcelas = undefined;
        divida.valor_parcela = undefined;
        divida.total_com_juros = undefined;
        divida.data_fim_parcela = undefined;
      }
    }

    return this.dividasRepository.save(divida);
  }

  /**
   * Remove uma dívida específica, garantindo que ela pertença ao usuário.
   * @param id O ID da dívida a ser removida.
   * @param usuarioId O ID do usuário autenticado.
   * @throws NotFoundException Se a dívida não for encontrada ou não pertencer ao usuário.
   */
  async remove(id: number, usuarioId: number): Promise<void> {
    // Reutiliza findOne para validar se a dívida existe e pertence ao usuário
    const divida = await this.findOne(id, usuarioId);

    await this.dividasRepository.remove(divida);
  }
}
