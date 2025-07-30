import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContasAPagar } from 'src/contas-a-pagar/entities/contas-a-pagar.entity';
import { Dividas } from 'src/dividas/entities/divida.entity';
import { User } from 'src/users/entities/user.entity';
import { CartoesController } from './cartoes.controller';
import { CartoesService } from './cartoes.service';
import { Cartao } from './entities/cartoes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cartao, User, Dividas, ContasAPagar]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/images/cartoes', // Diretório onde as imagens serão salvas
        filename: (req, file, callback) => {
          // Gera um nome de arquivo único para evitar colisões
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Aceita apenas imagens
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB por arquivo (opcional)
      },
    }),
  ],
  providers: [CartoesService],
  controllers: [CartoesController],
  exports: [CartoesService]
})
export class CartoesModule { }
