import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CartoesService } from './cartoes.service';
import { CreateCartoesDto } from './dto/create-cartoes.dto/create-cartoes.dto';
import { UpdateCartoesDto } from './dto/update-cartoes.dto/update-cartoes.dto';

@Controller('cartoes')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class CartoesController {
    constructor(private readonly cartoesService: CartoesService) { }

    /**
     * Cria um novo cartão.
     * @param createCartaoDto Dados para criação do cartão.
     * @returns O cartão criado.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createCartaoDto: CreateCartoesDto, @Req() req: Request & { user: User }) {
        // O ID do usuário logado estará disponível em req.user.id (graças ao JwtStrategy)
        return this.cartoesService.create(createCartaoDto, req.user.id);
    }

    @Get()
    findAll(@Req() req: Request & { user: User }) {
        // Retorna apenas os cartões do usuário logado
        return this.cartoesService.findAllByUserId(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Retorna um cartão específico, mas apenas se pertencer ao usuário logado
        return this.cartoesService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCartaoDto: UpdateCartoesDto, @Req() req: Request & { user: User }) {
        // Atualiza um cartão específico, mas apenas se pertencer ao usuário logado
        return this.cartoesService.update(+id, updateCartaoDto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
        // Remove um cartão específico, mas apenas se pertencer ao usuário logado
        return this.cartoesService.remove(+id, req.user.id);
    }
}
