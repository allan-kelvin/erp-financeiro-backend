import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartoesModule } from './cartoes/cartoes.module';
import { Cartao } from './cartoes/entities/cartoes.entity';
import { ContasAPagarModule } from './contas-a-pagar/contas-a-pagar.module';
import { ContasAPagar } from './contas-a-pagar/entities/contas-a-pagar.entity';
import { DividasModule } from './dividas/dividas.module';
import { Dividas } from './dividas/entities/divida.entity';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'a7financeiro',
      entities: [User, Cartao, Dividas, ContasAPagar],
      synchronize: true,
    }),
    UsersModule,
    CartoesModule,
    DividasModule,
    ContasAPagarModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
