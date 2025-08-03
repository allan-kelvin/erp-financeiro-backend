import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { DespesasService } from './despesas.service';
import { CreateDespesasDto } from './dto/create-despesas.dto/create-despesas.dto';
import { UpdateDespesasDto } from './dto/update-despesas.dto/update-despesas.dto';


@Controller('despesas')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class DespesasController {

    constructor(private readonly despesasService: DespesasService) { }
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDespesasDto: CreateDespesasDto, @Req() req: Request & { user: User }) {
        // O ID do usuário logado estará disponível em req.user.id
        return this.despesasService.create(createDespesasDto, req.user.id);
    }

    @Get()
    findAll(@Req() req: Request & { user: User }) {
        // Retorna apenas as Despesasvidas do usuário logado
        return this.despesasService.findAllByUserId(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Retorna uma Despesasvida específica, mas apenas se pertencer ao usuário logado
        return this.despesasService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDespesasDto: UpdateDespesasDto, @Req() req: Request & { user: User }) {
        // Atualiza uma Despesasvida específica, mas apenas se pertencer ao usuário logado
        return this.despesasService.update(+id, updateDespesasDto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Remove uma Despesasvida específica, mas apenas se pertencer ao usuário logado
        return this.despesasService.remove(+id, req.user.id);
    }
}
