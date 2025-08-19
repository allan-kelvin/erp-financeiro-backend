import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banco } from 'src/banco/entities/banco.entity';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { Fornecedor } from 'src/fornecedor/entities/fornecedor.entity';
import { SubCategoria } from 'src/sub-categoria/entities/sub-categoria.entity';
import { User } from 'src/users/entities/user.entity';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';
import { Despesas } from './entities/despesas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Despesas,
      ContasAPagar,
      User,
      Cartao,
      Fornecedor,
      Banco,
      SubCategoria,
    ]),
  ],
  providers: [DespesasService],
  controllers: [DespesasController],
  exports: [DespesasService, TypeOrmModule],
})
export class DespesasModule { }
