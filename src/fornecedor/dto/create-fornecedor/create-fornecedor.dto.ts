import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFornecedorDto {

    @IsString()
    @IsNotEmpty()
    razaoSocial: string;

    @IsString()
    @IsNotEmpty()
    nomeFantasia: string;

    @IsString()
    @IsNotEmpty()
    cnpj: string;

    @IsString()
    @IsOptional()
    ie: string;

    @IsString()
    @IsNotEmpty()
    telefone: string;

    @IsString()
    @IsOptional()
    whatsapp: string;

    @IsString()
    @IsOptional()
    email: string;

    @IsBoolean()
    @IsOptional()
    ativo: boolean;
}
