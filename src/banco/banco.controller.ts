import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { StatusBanco } from './enums/StatusBanco.enum';

@Controller('banco')
@UsePipes(new ValidationPipe({ transform: true }))
export class BancoController {
  constructor(private readonly bancoService: BancoService) { }

  @Post()
  @UseInterceptors(FileInterceptor('imagem_banco', {
    storage: diskStorage({
      destination: './uploads/bancos', // ajuste conforme necessidade
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      // aceitar apenas imagens
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(new Error('Invalid file type'), false);
      } else {
        cb(null, true);
      }
    }
  }))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBancoDto: CreateBancoDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // 1) Sevier pra tratar o arquivo (cria caminho relativo)
    let imagemPath: string | undefined;
    if (file) {
      imagemPath = `/uploads/bancos/${file.filename}`; // ou URL completa se você servir com serve-static
    }

    // 2) Transformações necessárias porque multipart form envia tudo como strings
    const dto: any = { ...createBancoDto };

    // Se o frontend enviar "ativo" booleano (ex.: campo chamado 'ativo'), converta para status
    // Ex: frontend pode enviar ativo=true (boolean) ou "true"/"false" (string) ou enviar status diretamente
    if (dto.ativo !== undefined) {
      // se vier 'true' ou 'false' como string, trate:
      if (typeof dto.ativo === 'string') {
        const valor = dto.ativo.toLowerCase();
        dto.status = (valor === 'true' || valor === 'ativo' || valor === 'Ativo') ? StatusBanco.ATIVO : StatusBanco.INATIVO;
      } else if (typeof dto.ativo === 'boolean') {
        dto.status = dto.ativo ? StatusBanco.ATIVO : StatusBanco.INATIVO;
      }
      delete dto.ativo; // remove o campo 'ativo' para evitar confusão com o DTO que espera 'status'
    }

    // Garantir que tipo_conta está vindo corretamente (opcional: você pode validar/normalizar aqui)
    // Ex.: se frontend enviar tipo_banco no lugar de tipo_conta:
    if (!dto.tipo_conta && dto.tipo_banco) {
      dto.tipo_conta = dto.tipo_banco;
      delete dto.tipo_banco;
    }

    // 3) Passe a imagem (caminho) para o service
    try {
      const created = await this.bancoService.create(dto as CreateBancoDto, imagemPath);
      return created;
    } catch (err) {
      // relança erro com mensagem útil
      throw new BadRequestException(err.message || 'Erro ao criar banco');
    }
  }
  @Get()
  findAll() {
    return this.bancoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bancoService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagem_banco', {
    storage: diskStorage({ /* mesmo storage */ }),
  }))
  update(@Param('id') id: string, @Body() updateBancoDto: UpdateBancoDto, @UploadedFile() file?: Express.Multer.File) {
    const imagemPath = file ? `/uploads/bancos/${file.filename}` : undefined;
    return this.bancoService.update(+id, updateBancoDto, imagemPath);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bancoService.remove(+id);
  }
}
