import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubCategoriaDTO } from './dto/create-sub-categoria/create-sub-categoria.dto';
import { UpdateSubCategoriaDTO } from './dto/update-sub-categoria/update-sub-categoria.dto';
import { SubCategoria } from './entities/sub-categoria.entity';

@Injectable()
export class SubCategoriaService {
    constructor(
        @InjectRepository(SubCategoria)
        private SubCategoriaRepository: Repository<SubCategoria>,
    ) { }

    async create(createSubCategoriaDto: CreateSubCategoriaDTO): Promise<SubCategoria> {
        const newSubCategoria = this.SubCategoriaRepository.create(createSubCategoriaDto);
        return this.SubCategoriaRepository.save(newSubCategoria);
    }

    async findAll(): Promise<SubCategoria[]> {
        return this.SubCategoriaRepository.find();
    }

    async findOne(id: number): Promise<SubCategoria> {
        const SubCategoria = await this.SubCategoriaRepository.findOne({ where: { id } });
        if (!SubCategoria) {
            throw new NotFoundException(`Sub-categoria com ID ${id} não encontrada.`);
        }
        return SubCategoria;
    }

    async update(id: number, updateSubCategoriaDto: UpdateSubCategoriaDTO): Promise<SubCategoria> {
        const SubCategoria = await this.findOne(id);
        this.SubCategoriaRepository.merge(SubCategoria, updateSubCategoriaDto);
        return this.SubCategoriaRepository.save(SubCategoria);
    }

    async remove(id: number): Promise<void> {
        const result = await this.SubCategoriaRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Sub-categoria com ID ${id} não encontrada.`);
        }
    }
}
