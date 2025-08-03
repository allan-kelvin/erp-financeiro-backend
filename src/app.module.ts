import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartoesModule } from './cartoes/cartoes.module';
import { Cartao } from './cartoes/entities/cartoes.entity';
import { ContasAPagarModule } from './contas-a-pagar/contas-a-pagar.module';
import { ContasAPagar } from './contas-a-pagar/entities/contas-a-pagar.entity';
import { DespesasModule } from './despesas/despesas.module';
import { Despesas } from './despesas/entities/despesas.entity';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'a7financeiro',
      entities: [User, Cartao, Despesas, ContasAPagar],
      synchronize: true,
    }),
    UsersModule,
    CartoesModule,
    DespesasModule,
    ContasAPagarModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
