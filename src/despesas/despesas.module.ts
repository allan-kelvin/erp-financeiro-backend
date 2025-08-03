import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { User } from 'src/users/entities/user.entity';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';
import { Despesas } from './entities/despesas.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Despesas, ContasAPagar, User, Cartao])],
  providers: [DespesasService],
  controllers: [DespesasController],
  exports: [DespesasService, TypeOrmModule]
})
export class DespesasModule { }
