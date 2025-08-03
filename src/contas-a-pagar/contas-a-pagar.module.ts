import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { Despesas } from 'src/despesas/entities/despesas.entity';
import { User } from 'src/users/entities/user.entity';
import { ContasAPagarController } from './contas-a-pagar.controller';
import { ContasAPagarService } from './contas-a-pagar.service';
import { ContasAPagar } from './entities/contas-a-pagar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContasAPagar, Despesas, User, Cartao])],
  providers: [ContasAPagarService],
  controllers: [ContasAPagarController],
  exports: [ContasAPagarService],
})
export class ContasAPagarModule { }
