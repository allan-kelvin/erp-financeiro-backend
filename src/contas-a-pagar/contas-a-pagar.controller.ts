import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { ContasAPagarService } from './contas-a-pagar.service';
import { CreateContasAPagarDto } from './dto/create-contas-a-pagar.dto/create-contas-a-pagar.dto';
import { UpdateContasAPagarDto } from './dto/update-contas-a-pagar.dto/update-contas-a-pagar.dto';
import { StatusContaPagar } from './enums/StatusContaPagar.enum';


@Controller('contas-a-pagar')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class ContasAPagarController {
    constructor(private readonly contasAPagarService: ContasAPagarService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createContaAPagarDto: CreateContasAPagarDto, @Req() req: Request & { user: User }) {
        return this.contasAPagarService.create(createContaAPagarDto, req.user.id);
    }

    @Get()
    findAll(
        @Req() req: Request & { user: User },
        @Query('status') status?: StatusContaPagar,
        @Query('despesasId') despesasId?: number,
        @Query('cartaoId') cartaoId?: number,
    ) {
        const parsedDespesasId = despesasId ? parseInt(despesasId as any, 10) : undefined;
        const parsedCartaoId = cartaoId ? parseInt(cartaoId as any, 10) : undefined;
        // Retorna apenas as contas a pagar do usuário logado, com filtros opcionais
        return this.contasAPagarService.findAllByUserId(req.user.id, status, parsedDespesasId, parsedCartaoId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Retorna uma conta a pagar específica, mas apenas se pertencer ao usuário logado
        return this.contasAPagarService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateContaAPagarDto: UpdateContasAPagarDto, @Req() req: Request & { user: User }) {
        // Atualiza uma conta a pagar específica, mas apenas se pertencer ao usuário logado
        return this.contasAPagarService.update(+id, updateContaAPagarDto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Remove uma conta a pagar específica, mas apenas se pertencer ao usuário logado
        return this.contasAPagarService.remove(+id, req.user.id);
    }
}
