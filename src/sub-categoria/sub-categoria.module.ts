import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategoria } from './entities/sub-categoria.entity';
import { SubCategoriaController } from './sub-categoria.controller';
import { SubCategoriaService } from './sub-categoria.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategoria])],
  providers: [SubCategoriaService],
  controllers: [SubCategoriaController]
})
export class SubCategoriaModule { }
