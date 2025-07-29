import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from '@nestjs/class-validator';
import { Bandeira } from 'src/cartoes/enums/Bandeira.enum';
import { StatusCartao } from 'src/cartoes/enums/StatusCartao.enum';
import { TipoCartao } from 'src/cartoes/enums/TipoCartao.enum';

export class CreateCartoesDto {

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsEnum(Bandeira)
    @IsNotEmpty()
    bandeira: Bandeira;

    @IsEnum(TipoCartao)
    @IsNotEmpty()
    tipo_cartao: TipoCartao;

    @IsOptional()
    @IsString()
    imagem_cartao?: string;

    @IsOptional()
    @IsEnum(StatusCartao)
    status?: StatusCartao;

    @IsNumber()
    @IsNotEmpty()
    usuarioId: number
}
