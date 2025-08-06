import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFornecedorDto } from './dto/create-fornecedor/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor/update-fornecedor.dto';
import { Fornecedor } from './entities/fornecedor.entity';
@Injectable()
export class FornecedorService {

    constructor(
        @InjectRepository(Fornecedor)
        private readonly fornecedorRepository: Repository<Fornecedor>,
    ) { }

    async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
        const fornecedor = this.fornecedorRepository.create(createFornecedorDto);
        return this.fornecedorRepository.save(fornecedor);
    }

    findAll(): Promise<Fornecedor[]> {
        return this.fornecedorRepository.find();
    }

    async findOne(id: number): Promise<Fornecedor> {
        const fornecedor = await this.fornecedorRepository.findOneBy({ id });
        if (!fornecedor) {
            throw new NotFoundException(`Fornecedor com ID "${id}" não encontrado.`);
        }
        return fornecedor;
    }

    async update(id: number, updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor> {
        const fornecedor = await this.findOne(id); // Reusa o método findOne para validação
        this.fornecedorRepository.merge(fornecedor, updateFornecedorDto);
        return this.fornecedorRepository.save(fornecedor);
    }

    async remove(id: number): Promise<void> {
        const result = await this.fornecedorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Fornecedor com ID "${id}" não encontrado.`);
        }
    }
}
