import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req) {
    const usuarioId = req.user.id;
    return this.usersService.findAll(usuarioId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    const usuarioId = req.user.id;
    const user = await this.usersService.findOne(+id, usuarioId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado ou não pertence ao usuário logado.`);
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req) {
    const usuarioId = req.user.id;
    const updatedUser = await this.usersService.update(+id, updateUserDto, usuarioId);
    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado ou não pertence ao usuário logado.`);
    }
    return updatedUser;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // Mantenha a proteção
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content para exclusão bem-sucedida
  async remove(@Param('id') id: string, @Req() req) {
    const usuarioId = req.user.id;
    const result = await this.usersService.remove(+id, usuarioId);
    if (!result) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado ou não pertence ao usuário logado.`);
    }
  }
}
