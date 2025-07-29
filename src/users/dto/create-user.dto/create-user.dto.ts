import { IsEmail, IsString, MaxLength, MinLength } from "@nestjs/class-validator";


export class CreateUserDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  @MaxLength(255, { message: 'O nome não pode ter mais de 255 caracteres.' })
  nome: string;

  @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
  @MaxLength(255, { message: 'O email não pode ter mais de 255 caracteres.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(255, { message: 'A senha não pode ter mais de 255 caracteres.' })
  senha: string;
}
