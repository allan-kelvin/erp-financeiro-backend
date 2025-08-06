
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
} from '@nestjs/common';
import { CreateFornecedorDto } from './dto/create-fornecedor/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor/update-fornecedor.dto';
import { FornecedorService } from './fornecedor.service';

@Controller('fornecedor')
export class FornecedorController {
    constructor(private readonly fornecedorService: FornecedorService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createFornecedorDto: CreateFornecedorDto) {
        return this.fornecedorService.create(createFornecedorDto);
    }

    @Get()
    findAll() {
        return this.fornecedorService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fornecedorService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFornecedorDto: UpdateFornecedorDto) {
        return this.fornecedorService.update(+id, updateFornecedorDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.fornecedorService.remove(+id);
    }
}
