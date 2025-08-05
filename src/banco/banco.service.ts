import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { Banco } from './entities/banco.entity';
import { StatusBanco } from './enums/StatusBanco.enum';

@Injectable()
export class BancoService {
  constructor(
    @InjectRepository(Banco)
    private bancoRepository: Repository<Banco>,
  ) { }

  // CREATE: aceita imagemPath opcional
  async create(createBancoDto: CreateBancoDto, imagemPath?: string): Promise<Banco> {
    // Normaliza campos se front enviar 'ativo' em vez de 'status'
    const dto: any = { ...createBancoDto };

    if (dto.ativo !== undefined) {
      if (typeof dto.ativo === 'string') {
        const val = dto.ativo.toLowerCase();
        dto.status = (val === 'true' || val === 'ativo' || val === 'Ativo') ? StatusBanco.ATIVO : StatusBanco.INATIVO;
      } else if (typeof dto.ativo === 'boolean') {
        dto.status = dto.ativo ? StatusBanco.ATIVO : StatusBanco.INATIVO;
      }
      delete dto.ativo;
    }

    // mapeia tipo_banco -> tipo_conta caso necessário
    if (!dto.tipo_conta && dto.tipo_banco) {
      dto.tipo_conta = dto.tipo_banco;
      delete dto.tipo_banco;
    }

    if (imagemPath) {
      dto.imagem_banco = imagemPath;
    }

    const novoBanco = this.bancoRepository.create(dto as CreateBancoDto);
    const saved = await this.bancoRepository.save(novoBanco) as Banco; // cast para Banco
    return saved;
  }

  // FIND ALL
  async findAll(): Promise<Banco[]> {
    return this.bancoRepository.find();
  }

  // FIND ONE
  async findOne(id: number): Promise<Banco> {
    const banco = await this.bancoRepository.findOne({ where: { id } });
    if (!banco) {
      throw new NotFoundException(`Banco com ID ${id} não encontrado.`);
    }
    return banco;
  }

  // UPDATE: aceita imagemPath opcional
  async update(id: number, updateBancoDto: UpdateBancoDto, imagemPath?: string): Promise<Banco> {
    const banco = await this.findOne(id);

    const dto: any = { ...updateBancoDto };

    // mesma normalização de 'ativo' -> status caso necessário
    if (dto.ativo !== undefined) {
      if (typeof dto.ativo === 'string') {
        const val = dto.ativo.toLowerCase();
        dto.status = (val === 'true' || val === 'ativo' || val === 'Ativo') ? StatusBanco.ATIVO : StatusBanco.INATIVO;
      } else if (typeof dto.ativo === 'boolean') {
        dto.status = dto.ativo ? StatusBanco.ATIVO : StatusBanco.INATIVO;
      }
      delete dto.ativo;
    }

    if (!dto.tipo_conta && dto.tipo_banco) {
      dto.tipo_conta = dto.tipo_banco;
      delete dto.tipo_banco;
    }

    if (imagemPath) {
      (dto as any).imagem_banco = imagemPath;
    }

    this.bancoRepository.merge(banco, dto);
    const saved = await this.bancoRepository.save(banco) as Banco;
    return saved;
  }

  // REMOVE
  async remove(id: number): Promise<{ deleted: boolean; message?: string }> {
    const banco = await this.findOne(id);
    await this.bancoRepository.remove(banco);
    return { deleted: true };
  }
}