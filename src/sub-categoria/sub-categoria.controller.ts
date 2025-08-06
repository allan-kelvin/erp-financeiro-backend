import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreateSubCategoriaDTO } from './dto/create-sub-categoria/create-sub-categoria.dto';
import { UpdateSubCategoriaDTO } from './dto/update-sub-categoria/update-sub-categoria.dto';
import { SubCategoriaService } from './sub-categoria.service';

@Controller('sub-categoria')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class SubCategoriaController {

    constructor(private readonly subCategoryService: SubCategoriaService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createSubCategoryDto: CreateSubCategoriaDTO) {
        return this.subCategoryService.create(createSubCategoryDto);
    }

    @Get()
    findAll() {
        return this.subCategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.subCategoryService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoriaDTO) {
        return this.subCategoryService.update(+id, updateSubCategoryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.subCategoryService.remove(+id);
    }
}
