import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { Dividas } from 'src/dividas/entities/divida.entity';
import { User } from 'src/users/entities/user.entity';
import { ContasAPagarController } from './contas-a-pagar.controller';
import { ContasAPagarService } from './contas-a-pagar.service';
import { ContasAPagar } from './entities/contas-a-pagar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContasAPagar, Dividas, User, Cartao])],
  providers: [ContasAPagarService],
  controllers: [ContasAPagarController],
  exports: [ContasAPagarService],
})
export class ContasAPagarModule { }
