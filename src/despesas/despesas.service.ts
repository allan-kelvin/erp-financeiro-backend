import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMonths } from 'date-fns';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { StatusContaPagar } from 'src/contas-a-pagar/enums/StatusContaPagar.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateDespesasDto } from './dto/create-despesas.dto/create-despesas.dto';
import { UpdateDespesasDto } from './dto/update-despesas.dto/update-despesas.dto';
import { Despesas } from './entities/despesas.entity';



@Injectable()
export class DespesasService {
  constructor(
    @InjectRepository(Despesas)
    private DespesasRepository: Repository<Despesas>,
    @InjectRepository(ContasAPagar)
    private accountsPayableRepository: Repository<ContasAPagar>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Cartao)
    private cartoesRepository: Repository<Cartao>,
  ) { }

  /**
   * Cria uma nova despesas para um usuário específico, gerando contas a pagar se parcelado.
   * @param createDespesasDto Os dados para criação da despesas.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A despesas criada.
   */
  async create(createDespesasDto: CreateDespesasDto, usuarioId: number): Promise<Despesas> {
    const { parcelado, valor_total, qtd_parcelas, data_lancamento, cartaoId, juros_aplicado, total_com_juros, ...rest } = createDespesasDto;

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

    const Despesas = this.DespesasRepository.create({
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
        throw new BadRequestException('Quantidade de parcelas é obrigatória e deve ser maior que zero para despesass parceladas.');
      }
      Despesas.qtd_parcelas = qtd_parcelas;

      // Calcular juros_aplicado e total_com_juros
      if (juros_aplicado !== undefined && juros_aplicado !== null) {
        Despesas.juros_aplicado = juros_aplicado;
        Despesas.total_com_juros = valor_total + juros_aplicado;
      } else if (total_com_juros !== undefined && total_com_juros !== null) {
        Despesas.total_com_juros = total_com_juros;
        Despesas.juros_aplicado = total_com_juros - valor_total;
      } else {
        // Se nenhum juros ou total_com_juros for fornecido, assumir 0 juros
        Despesas.juros_aplicado = 0;
        Despesas.total_com_juros = valor_total;
      }

      Despesas.valor_parcela = Despesas.total_com_juros / qtd_parcelas;
      Despesas.data_fim_parcela = addMonths(new Date(data_lancamento), qtd_parcelas);
    } else {
      Despesas.qtd_parcelas = undefined;
      Despesas.valor_parcela = undefined;
      Despesas.data_fim_parcela = undefined;

      if (juros_aplicado !== undefined && juros_aplicado !== null) {
        Despesas.juros_aplicado = juros_aplicado;
        Despesas.total_com_juros = valor_total + juros_aplicado;
      } else if (total_com_juros !== undefined && total_com_juros !== null) {
        Despesas.total_com_juros = total_com_juros;
        Despesas.juros_aplicado = total_com_juros - valor_total;
      } else {
        Despesas.juros_aplicado = 0;
        Despesas.total_com_juros = valor_total;
      }
    }

    const savedDespesas = await this.DespesasRepository.save(Despesas);

    // Gerar contas a pagar
    if (savedDespesas.parcelado) {
      for (let i = 0; i < savedDespesas.qtd_parcelas!; i++) {
        const dueDate = addMonths(new Date(data_lancamento), i);
        const accountPayable = this.accountsPayableRepository.create({
          despesas: savedDespesas,
          despesasId: savedDespesas.id,
          cartao: cartao,
          cartaoId: cartaoId,
          valor_pago: savedDespesas.valor_parcela!, // Valor da parcela
          data_emissao: dueDate,
          status: StatusContaPagar.ABERTO,
        });
        await this.accountsPayableRepository.save(accountPayable);
      }
    } else {
      const accountPayable = this.accountsPayableRepository.create({
        despesas: savedDespesas,
        despesasId: savedDespesas.id,
        cartao: cartao,
        cartaoId: cartaoId,
        valor_pago: savedDespesas.total_com_juros || savedDespesas.valor_total, // Valor total ou com juros se não parcelado
        data_emissao: new Date(data_lancamento),
        status: StatusContaPagar.ABERTO,
      });
      await this.accountsPayableRepository.save(accountPayable);
    }

    return savedDespesas;
  }

  /**
   * Retorna todas as despesass pertencentes a um usuário específico.
   * @param usuarioId O ID do usuário autenticado.
   * @returns Uma lista de despesass do usuário.
   */
  async findAllByUserId(usuarioId: number): Promise<Despesas[]> {
    return this.DespesasRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario', 'cartao'],
    });
  }

  /**
   * Retorna uma despesas específica pelo ID, garantindo que ela pertença ao usuário.
   * @param id O ID da despesas.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A despesas encontrada.
   * @throws NotFoundException Se a despesas não for encontrada ou não pertencer ao usuário.
   */
  async findOne(id: number, usuarioId: number): Promise<Despesas> {
    const Despesas = await this.DespesasRepository.findOne({
      where: { id: id, usuario: { id: usuarioId } },
      relations: ['usuario', 'cartao'],
    });

    if (!Despesas) {
      throw new NotFoundException(`despesas com ID ${id} não encontrada ou não pertence ao usuário.`);
    }
    return Despesas;
  }

  /**
   * Atualiza uma despesas específica, garantindo que ela pertença ao usuário.
   * @param id O ID da despesas a ser atualizada.
   * @param updateDespesasDto Os dados para atualização.
   * @param usuarioId O ID do usuário autenticado.
   * @returns A despesas atualizada.
   */
  async update(id: number, updateDespesasDto: UpdateDespesasDto, usuarioId: number): Promise<Despesas> {
    const Despesas = await this.findOne(id, usuarioId);

    // Se o cartaoId for alterado, verificar se o novo cartão pertence ao usuário
    if (updateDespesasDto.cartaoId && updateDespesasDto.cartaoId !== Despesas.cartaoId) {
      const newCartao = await this.cartoesRepository.findOne({
        where: { id: updateDespesasDto.cartaoId, usuario: { id: usuarioId } },
      });
      if (!newCartao) {
        throw new NotFoundException(`Novo cartão com ID ${updateDespesasDto.cartaoId} não encontrado ou não pertence ao usuário.`);
      }
      Despesas.cartao = newCartao;
      Despesas.cartaoId = newCartao.id;
    }

    // Aplica as atualizações no objeto da despesas
    this.DespesasRepository.merge(Despesas, updateDespesasDto);

    // Recalcular informações de parcela se campos relevantes forem atualizados
    const dataLancamento = updateDespesasDto.data_lancamento ? new Date(updateDespesasDto.data_lancamento) : Despesas.data_lancamento;

    if (Despesas.parcelado) {
      if (Despesas.qtd_parcelas && Despesas.qtd_parcelas > 0) {
        // Recalcular juros_aplicado e total_com_juros
        if (Despesas.juros_aplicado !== undefined && Despesas.juros_aplicado !== null) {
          Despesas.total_com_juros = Despesas.valor_total + Despesas.juros_aplicado;
        } else if (Despesas.total_com_juros !== undefined && Despesas.total_com_juros !== null) {
          Despesas.juros_aplicado = Despesas.total_com_juros - Despesas.valor_total;
        } else {
          Despesas.juros_aplicado = 0;
          Despesas.total_com_juros = Despesas.valor_total;
        }
        Despesas.valor_parcela = Despesas.total_com_juros / Despesas.qtd_parcelas;
        Despesas.data_fim_parcela = addMonths(dataLancamento, Despesas.qtd_parcelas);
      } else {
        throw new BadRequestException('Quantidade de parcelas é obrigatória e deve ser maior que zero para despesass parceladas.');
      }
    } else {
      Despesas.qtd_parcelas = undefined;
      Despesas.valor_parcela = undefined;
      Despesas.data_fim_parcela = undefined;
      if (Despesas.juros_aplicado !== undefined && Despesas.juros_aplicado !== null) {
        Despesas.total_com_juros = Despesas.valor_total + Despesas.juros_aplicado;
      } else if (Despesas.total_com_juros !== undefined && Despesas.total_com_juros !== null) {
        Despesas.juros_aplicado = Despesas.total_com_juros - Despesas.valor_total;
      } else {
        Despesas.juros_aplicado = 0;
        Despesas.total_com_juros = Despesas.valor_total;
      }
    }

    // TODO: Lógica para atualizar/regerar ContasAPagar se o parcelamento mudar ou se qtd_parcelas/valor_total mudar significativamente.
    // Isso é complexo e pode exigir a exclusão e recriação das contas a pagar existentes ou um ajuste fino.

    return this.DespesasRepository.save(Despesas);
  }

  /**
   * Remove uma despesas específica, garantindo que ela pertença ao usuário.
   * @param id O ID da despesas a ser removida.
   * @param usuarioId O ID do usuário autenticado.
   * @throws NotFoundException Se a despesas não for encontrada ou não pertencer ao usuário.
   */
  async remove(id: number, usuarioId: number): Promise<void> {
    const Despesas = await this.findOne(id, usuarioId);

    // TODO: Lógica para remover ContasAPagar associadas se o onDelete não for suficiente ou se precisar de lógica extra.
    await this.DespesasRepository.remove(Despesas);
  }

  /**
   * Calcula a quantidade de parcelas restantes para uma despesas.
   * Este é um método de exemplo para demonstrar como 'qant_parcelas_restantes'
   * deve ser um campo calculado, e não armazenado diretamente na entidade Despesas.
   * @param DespesasId O ID da despesas.
   * @returns O número de parcelas restantes.
   */
  async getRemainingInstallments(DespesasId: number): Promise<number> {
    const totalPaid = await this.accountsPayableRepository.count({
      where: {
        despesas: { id: DespesasId },
        status: StatusContaPagar.PAGO,
      },
    });

    const Despesas = await this.DespesasRepository.findOne({ where: { id: DespesasId } });
    if (!Despesas || !Despesas.parcelado || !Despesas.qtd_parcelas) {
      return 0; // Não é parcelado ou dados inválidos
    }

    return Despesas.qtd_parcelas - totalPaid;
  }
}