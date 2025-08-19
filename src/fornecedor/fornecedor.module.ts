import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Despesas } from 'src/despesas/entities/despesas.entity';
import { Fornecedor } from './entities/fornecedor.entity';
import { FornecedorController } from './fornecedor.controller';
import { FornecedorService } from './fornecedor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fornecedor, Despesas])],
  controllers: [FornecedorController],
  providers: [FornecedorService]
})
export class FornecedorModule { }
