import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
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

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('imagem_cartao_file')) // 'imagem_cartao_file' é o nome do campo no FormData do frontend
    async create(
        @Req() req: Request & { user: User; body: any }, // Acesse req.body diretamente
        @UploadedFile() file?: Express.Multer.File, // O arquivo é opcional
    ) {
        // Crie uma instância do DTO e atribua os campos do req.body
        const createCartaoDto = new CreateCartoesDto();
        createCartaoDto.descricao = req.body.descricao;
        createCartaoDto.bandeira = req.body.bandeira;
        createCartaoDto.tipo_cartao = req.body.tipo_cartao;
        createCartaoDto.status = req.body.status;
        createCartaoDto.usuarioId = parseInt(req.body.usuarioId, 10); // Converte para número

        // Valide o DTO manualmente
        const errors = await validate(createCartaoDto);
        if (errors.length > 0) {
            // Se houver erros de validação, lance uma BadRequestException
            throw new BadRequestException(errors);
        }

        const imagePath = file ? `/uploads/images/cartoes/${file.filename}` : undefined;
        return this.cartoesService.create(createCartaoDto, req.user.id, imagePath);
    }

    @Get()
    findAll(@Req() req: Request & { user: User }) {
        return this.cartoesService.findAllByUserId(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
        return this.cartoesService.findOne(+id, req.user.id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('imagem_cartao_file')) // Para atualizar a imagem também
    async update(
        @Param('id') id: string,
        @Req() req: Request & { user: User; body: any }, // Acesse req.body diretamente
        @UploadedFile() file?: Express.Multer.File, // O arquivo é opcional
    ) {
        // Crie uma instância do DTO e atribua os campos do req.body
        const updateCartaoDto = new UpdateCartoesDto();
        // Use Object.assign para copiar as propriedades, já que UpdateCartaoDto é um PartialType
        Object.assign(updateCartaoDto, req.body);
        // Converte usuarioId se estiver presente
        if (req.body.usuarioId) {
            updateCartaoDto.usuarioId = parseInt(req.body.usuarioId, 10);
        }
        // Removido: updateCartaoDto.id = parseInt(req.body.id, 10);
        // O ID é passado como parâmetro de rota e não deve fazer parte do DTO do corpo.


        // Valide o DTO manualmente
        const errors = await validate(updateCartaoDto);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const imagePath = file ? `/uploads/images/cartoes/${file.filename}` : undefined;
        return this.cartoesService.update(+id, updateCartaoDto, req.user.id, imagePath);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
        return this.cartoesService.remove(+id, req.user.id);
    }
}
