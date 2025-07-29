import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CartoesController } from './cartoes.controller';
import { CartoesService } from './cartoes.service';
import { Cartao } from './entities/cartoes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cartao, User])],
  providers: [CartoesService],
  controllers: [CartoesController],
  exports: [CartoesService]
})
export class CartoesModule { }
