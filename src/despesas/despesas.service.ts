import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMonths } from 'date-fns';
import { Banco } from 'src/banco/entities/banco.entity';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { StatusContaPagar } from 'src/contas-a-pagar/enums/StatusContaPagar.enum';
import { Fornecedor } from 'src/fornecedor/entities/fornecedor.entity';
import { SubCategoria } from 'src/sub-categoria/entities/sub-categoria.entity';
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
    @InjectRepository(SubCategoria)
    private subCategoriaRepository: Repository<SubCategoria>,
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
    @InjectRepository(Banco)
    private bancoRepository: Repository<Banco>,
  ) { }

  async create(
    createDespesasDto: CreateDespesasDto,
    usuarioId: number,
  ): Promise<Despesas> {
    const {
      parcelado,
      valor,
      qtd_parcelas,
      data_lancamento,
      cartaoId,
      juros_aplicado,
      total_com_juros,
      subCategoriaId,
      fornecedorId,
      bancoId,
      ...rest
    } = createDespesasDto;

    const usuario = await this.usersRepository.findOne({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${usuarioId} não encontrado.`,
      );
    }

    const subCategoria = await this.subCategoriaRepository.findOne({
      where: { id: subCategoriaId },
    });
    if (!subCategoria) {
      throw new NotFoundException(
        `Sub-categoria com ID ${subCategoriaId} não encontrada.`,
      );
    }

    const despesas = this.DespesasRepository.create({
      ...rest,
      valor,
      parcelado,
      data_lancamento: new Date(data_lancamento),
      usuario,
      usuarioId,
      subCategoria,
      subCategoriaId,
    });

    // Verificações para campos opcionais
    if (cartaoId) {
      const cartao = await this.cartoesRepository.findOne({
        where: { id: cartaoId, usuario: { id: usuarioId } },
      });
      if (!cartao) {
        throw new NotFoundException(
          `Cartão com ID ${cartaoId} não encontrado ou não pertence ao usuário.`,
        );
      }
      despesas.cartao = cartao;
      despesas.cartaoId = cartaoId;
    }

    if (fornecedorId) {
      const fornecedor = await this.fornecedorRepository.findOne({
        where: { id: fornecedorId },
      });
      if (!fornecedor) {
        throw new NotFoundException(
          `Fornecedor com ID ${fornecedorId} não encontrado.`,
        );
      }
      despesas.fornecedor = fornecedor;
      despesas.fornecedorId = fornecedorId;
    }

    if (bancoId) {
      const banco = await this.bancoRepository.findOne({
        where: { id: bancoId },
      });
      if (!banco) {
        throw new NotFoundException(`Banco com ID ${bancoId} não encontrado.`);
      }
      despesas.banco = banco;
      despesas.bancoId = bancoId;
    }

    if (parcelado) {
      if (!qtd_parcelas || qtd_parcelas <= 0) {
        throw new BadRequestException(
          'Quantidade de parcelas é obrigatória e deve ser maior que zero para despesas parceladas.',
        );
      }
      despesas.qtd_parcelas = qtd_parcelas;
      despesas.total_com_juros = total_com_juros || valor;
      despesas.juros_aplicado = juros_aplicado || 0;
      if (despesas.total_com_juros > 0) {
        despesas.valor_parcela = despesas.total_com_juros / qtd_parcelas;
      } else {
        despesas.valor_parcela = 0;
      }
      despesas.data_fim_parcela = addMonths(
        new Date(data_lancamento),
        qtd_parcelas,
      );
    } else {
      despesas.qtd_parcelas = undefined;
      despesas.valor_parcela = undefined;
      despesas.data_fim_parcela = undefined;
      despesas.juros_aplicado = juros_aplicado || 0;
      despesas.total_com_juros = total_com_juros || valor;
    }

    const savedDespesas = await this.DespesasRepository.save(despesas);

    // Gerar contas a pagar
    const valueToPay = savedDespesas.total_com_juros ?? savedDespesas.valor;
    if (savedDespesas.parcelado) {
      for (let i = 0; i < savedDespesas.qtd_parcelas!; i++) {
        const dueDate = addMonths(new Date(data_lancamento), i);
        const accountPayable = this.accountsPayableRepository.create({
          despesas: savedDespesas,
          despesasId: savedDespesas.id,
          cartao: savedDespesas.cartao,
          cartaoId: savedDespesas.cartaoId,
          valor_pago: savedDespesas.valor_parcela!,
          data_emissao: dueDate,
          status: StatusContaPagar.ABERTO,
        });
        await this.accountsPayableRepository.save(accountPayable);
      }
    } else {
      const accountPayable = this.accountsPayableRepository.create({
        despesas: savedDespesas,
        despesasId: savedDespesas.id,
        cartao: savedDespesas.cartao,
        cartaoId: savedDespesas.cartaoId,
        valor_pago: valueToPay,
        data_emissao: new Date(data_lancamento),
        status: StatusContaPagar.ABERTO,
      });
      await this.accountsPayableRepository.save(accountPayable);
    }

    return savedDespesas;
  }

  async findAllByUserId(usuarioId: number): Promise<Despesas[]> {
    return this.DespesasRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario', 'cartao', 'subCategoria', 'fornecedor', 'banco'],
    });
  }

  async findOne(id: number, usuarioId: number): Promise<Despesas> {
    const despesas = await this.DespesasRepository.findOne({
      where: { id: id, usuario: { id: usuarioId } },
      relations: ['usuario', 'cartao', 'subCategoria', 'fornecedor', 'banco'],
    });

    if (!despesas) {
      throw new NotFoundException(
        `Despesa com ID ${id} não encontrada ou não pertence ao usuário.`,
      );
    }
    return despesas;
  }

  async update(
    id: number,
    updateDespesasDto: UpdateDespesasDto,
    usuarioId: number,
  ): Promise<Despesas> {
    const despesa = await this.findOne(id, usuarioId);

    // Atualiza o objeto da despesa com os novos dados
    this.DespesasRepository.merge(despesa, updateDespesasDto);

    // Validação de relações
    if (
      updateDespesasDto.cartaoId !== undefined &&
      updateDespesasDto.cartaoId !== despesa.cartaoId
    ) {
      const newCartao = await this.cartoesRepository.findOne({
        where: { id: updateDespesasDto.cartaoId, usuario: { id: usuarioId } },
      });
      if (!newCartao) {
        throw new NotFoundException(
          `Novo cartão com ID ${updateDespesasDto.cartaoId} não encontrado ou não pertence ao usuário.`,
        );
      }
      despesa.cartao = newCartao;
    }
    if (
      updateDespesasDto.subCategoriaId !== undefined &&
      updateDespesasDto.subCategoriaId !== despesa.subCategoriaId
    ) {
      const newSubCategoria = await this.subCategoriaRepository.findOne({
        where: { id: updateDespesasDto.subCategoriaId },
      });
      if (!newSubCategoria) {
        throw new NotFoundException(
          `Nova sub-categoria com ID ${updateDespesasDto.subCategoriaId} não encontrada.`,
        );
      }
      despesa.subCategoria = newSubCategoria;
    }
    if (
      updateDespesasDto.fornecedorId !== undefined &&
      updateDespesasDto.fornecedorId !== despesa.fornecedorId
    ) {
      const newFornecedor = await this.fornecedorRepository.findOne({
        where: { id: updateDespesasDto.fornecedorId },
      });
      if (!newFornecedor) {
        throw new NotFoundException(
          `Novo fornecedor com ID ${updateDespesasDto.fornecedorId} não encontrado.`,
        );
      }
      despesa.fornecedor = newFornecedor;
    }
    if (
      updateDespesasDto.bancoId !== undefined &&
      updateDespesasDto.bancoId !== despesa.bancoId
    ) {
      const newBanco = await this.bancoRepository.findOne({
        where: { id: updateDespesasDto.bancoId },
      });
      if (!newBanco) {
        throw new NotFoundException(
          `Novo banco com ID ${updateDespesasDto.bancoId} não encontrado.`,
        );
      }
      despesa.banco = newBanco;
    }

    // Recalcular informações de parcelamento se o status ou valores mudarem
    if (despesa.parcelado) {
      if (despesa.qtd_parcelas && despesa.qtd_parcelas > 0) {
        despesa.total_com_juros = despesa.total_com_juros || despesa.valor;
        despesa.juros_aplicado = despesa.juros_aplicado || 0;
        if (despesa.total_com_juros > 0) {
          despesa.valor_parcela =
            despesa.total_com_juros / despesa.qtd_parcelas;
        } else {
          despesa.valor_parcela = 0;
        }
        const dataLancamento = updateDespesasDto.data_lancamento
          ? new Date(updateDespesasDto.data_lancamento)
          : despesa.data_lancamento;
        despesa.data_fim_parcela = addMonths(
          dataLancamento,
          despesa.qtd_parcelas,
        );
      } else {
        throw new BadRequestException(
          'Quantidade de parcelas é obrigatória e deve ser maior que zero para despesas parceladas.',
        );
      }
    } else {
      despesa.qtd_parcelas = undefined;
      despesa.valor_parcela = undefined;
      despesa.data_fim_parcela = undefined;
      despesa.juros_aplicado = despesa.juros_aplicado || 0;
      despesa.total_com_juros = despesa.total_com_juros || despesa.valor;
    }

    // TODO: Lógica para atualizar/regerar ContasAPagar se o parcelamento mudar.
    // Isso é complexo e pode exigir a exclusão e recriação das contas a pagar existentes ou um ajuste fino.

    return this.DespesasRepository.save(despesa);
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const despesa = await this.findOne(id, usuarioId);

    // TODO: Lógica para remover ContasAPagar associadas se o onDelete não for suficiente ou se precisar de lógica extra.
    await this.DespesasRepository.remove(despesa);
  }
}
