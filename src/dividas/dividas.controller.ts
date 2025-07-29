import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { DividasService } from './dividas.service';
import { CreateDividasDto } from './dto/create-dividas.dto/create-dividas.dto';
import { UpdateDividasDto } from './dto/update-dividas.dto/update-dividas.dto';

@Controller('dividas')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class DividasController {

    constructor(private readonly dividasService: DividasService) { }
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDividaDto: CreateDividasDto, @Req() req: Request & { user: User }) {
        // O ID do usuário logado estará disponível em req.user.id
        return this.dividasService.create(createDividaDto, req.user.id);
    }

    @Get()
    findAll(@Req() req: Request & { user: User }) {
        // Retorna apenas as dívidas do usuário logado
        return this.dividasService.findAllByUserId(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Retorna uma dívida específica, mas apenas se pertencer ao usuário logado
        return this.dividasService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDividaDto: UpdateDividasDto, @Req() req: Request & { user: User }) {
        // Atualiza uma dívida específica, mas apenas se pertencer ao usuário logado
        return this.dividasService.update(+id, updateDividaDto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Remove uma dívida específica, mas apenas se pertencer ao usuário logado
        return this.dividasService.remove(+id, req.user.id);
    }
}
