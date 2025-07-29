import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartao } from 'src/cartoes/entities/cartoes.entity';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { User } from 'src/users/entities/user.entity';
import { DividasController } from './dividas.controller';
import { DividasService } from './dividas.service';
import { Dividas } from './entities/divida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dividas, ContasAPagar, User, Cartao])],
  providers: [DividasService],
  controllers: [DividasController],
  exports: [DividasService, TypeOrmModule]
})
export class DividasModule { }
