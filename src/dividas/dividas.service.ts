import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Cartao)
    private cartoesRepository: Repository<Cartao>,
  ) { }

  /**
   * Cria uma nova dívida para um usuário específico, gerando contas a pagar se parcelado.
   * @param createDividaDto Os dados para criação da dívida.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A dívida criada.
   */
  async create(createDividaDto: CreateDividasDto, usuarioId: number): Promise<Dividas> {
    const { parcelado, valor_total, qtd_parcelas, data_lancamento, cartaoId, juros_aplicado, total_com_juros, ...rest } = createDividaDto;

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
      cartao: cartao,
      cartaoId: cartaoId,
      usuario: usuario,
      usuarioId: usuarioId,
    });

    // Lógica para juros e parcelamento
    if (parcelado) {
      if (!qtd_parcelas || qtd_parcelas <= 0) {
        throw new BadRequestException('Quantidade de parcelas é obrigatória e deve ser maior que zero para dívidas parceladas.');
      }
      divida.qtd_parcelas = qtd_parcelas;

      // Calcular juros_aplicado e total_com_juros
      if (juros_aplicado !== undefined && juros_aplicado !== null) {
        divida.juros_aplicado = juros_aplicado;
        divida.total_com_juros = valor_total + juros_aplicado;
      } else if (total_com_juros !== undefined && total_com_juros !== null) {
        divida.total_com_juros = total_com_juros;
        divida.juros_aplicado = total_com_juros - valor_total;
      } else {
        // Se nenhum juros ou total_com_juros for fornecido, assumir 0 juros
        divida.juros_aplicado = 0;
        divida.total_com_juros = valor_total;
      }

      divida.valor_parcela = divida.total_com_juros / qtd_parcelas;
      divida.data_fim_parcela = addMonths(new Date(data_lancamento), qtd_parcelas);
    } else {
      divida.qtd_parcelas = undefined;
      divida.valor_parcela = undefined;
      divida.data_fim_parcela = undefined;

      if (juros_aplicado !== undefined && juros_aplicado !== null) {
        divida.juros_aplicado = juros_aplicado;
        divida.total_com_juros = valor_total + juros_aplicado;
      } else if (total_com_juros !== undefined && total_com_juros !== null) {
        divida.total_com_juros = total_com_juros;
        divida.juros_aplicado = total_com_juros - valor_total;
      } else {
        divida.juros_aplicado = 0;
        divida.total_com_juros = valor_total;
      }
    }

    const savedDivida = await this.dividasRepository.save(divida);

    // Gerar contas a pagar
    if (savedDivida.parcelado) {
      for (let i = 0; i < savedDivida.qtd_parcelas!; i++) {
        const dueDate = addMonths(new Date(data_lancamento), i);
        const accountPayable = this.accountsPayableRepository.create({
          divida: savedDivida,
          dividaId: savedDivida.id,
          cartao: cartao,
          cartaoId: cartaoId,
          valor_pago: savedDivida.valor_parcela!, // Valor da parcela
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
        valor_pago: savedDivida.total_com_juros || savedDivida.valor_total, // Valor total ou com juros se não parcelado
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
      where: { usuario: { id: usuarioId } },
      relations: ['usuario', 'cartao'],
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
      where: { id: id, usuario: { id: usuarioId } },
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
    const dataLancamento = updateDividaDto.data_lancamento ? new Date(updateDividaDto.data_lancamento) : divida.data_lancamento;

    if (divida.parcelado) {
      if (divida.qtd_parcelas && divida.qtd_parcelas > 0) {
        // Recalcular juros_aplicado e total_com_juros
        if (divida.juros_aplicado !== undefined && divida.juros_aplicado !== null) {
          divida.total_com_juros = divida.valor_total + divida.juros_aplicado;
        } else if (divida.total_com_juros !== undefined && divida.total_com_juros !== null) {
          divida.juros_aplicado = divida.total_com_juros - divida.valor_total;
        } else {
          divida.juros_aplicado = 0;
          divida.total_com_juros = divida.valor_total;
        }
        divida.valor_parcela = divida.total_com_juros / divida.qtd_parcelas;
        divida.data_fim_parcela = addMonths(dataLancamento, divida.qtd_parcelas);
      } else {
        throw new BadRequestException('Quantidade de parcelas é obrigatória e deve ser maior que zero para dívidas parceladas.');
      }
    } else {
      divida.qtd_parcelas = undefined;
      divida.valor_parcela = undefined;
      divida.data_fim_parcela = undefined;
      if (divida.juros_aplicado !== undefined && divida.juros_aplicado !== null) {
        divida.total_com_juros = divida.valor_total + divida.juros_aplicado;
      } else if (divida.total_com_juros !== undefined && divida.total_com_juros !== null) {
        divida.juros_aplicado = divida.total_com_juros - divida.valor_total;
      } else {
        divida.juros_aplicado = 0;
        divida.total_com_juros = divida.valor_total;
      }
    }

    // TODO: Lógica para atualizar/regerar ContasAPagar se o parcelamento mudar ou se qtd_parcelas/valor_total mudar significativamente.
    // Isso é complexo e pode exigir a exclusão e recriação das contas a pagar existentes ou um ajuste fino.

    return this.dividasRepository.save(divida);
  }

  /**
   * Remove uma dívida específica, garantindo que ela pertença ao usuário.
   * @param id O ID da dívida a ser removida.
   * @param usuarioId O ID do usuário autenticado.
   * @throws NotFoundException Se a dívida não for encontrada ou não pertencer ao usuário.
   */
  async remove(id: number, usuarioId: number): Promise<void> {
    const divida = await this.findOne(id, usuarioId);

    // TODO: Lógica para remover ContasAPagar associadas se o onDelete não for suficiente ou se precisar de lógica extra.
    await this.dividasRepository.remove(divida);
  }

  /**
   * Calcula a quantidade de parcelas restantes para uma dívida.
   * Este é um método de exemplo para demonstrar como 'qant_parcelas_restantes'
   * deve ser um campo calculado, e não armazenado diretamente na entidade Divida.
   * @param dividaId O ID da dívida.
   * @returns O número de parcelas restantes.
   */
  async getRemainingInstallments(dividaId: number): Promise<number> {
    const totalPaid = await this.accountsPayableRepository.count({
      where: {
        divida: { id: dividaId },
        status: StatusContaPagar.PAGO,
      },
    });

    const divida = await this.dividasRepository.findOne({ where: { id: dividaId } });
    if (!divida || !divida.parcelado || !divida.qtd_parcelas) {
      return 0; // Não é parcelado ou dados inválidos
    }

    return divida.qtd_parcelas - totalPaid;
  }
}