import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export class CreateDividasDto {

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.01)
    @Type(() => Number)
    valor_total: number;

    @IsBoolean()
    @IsNotEmpty()
    parcelado: boolean;

    @ValidateIf(o => o.parcelado === true) // Valida apenas se parcelado for true
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Type(() => Number)
    qtd_parcelas?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    valor_parcela?: number; // Pode ser calculado pelo backend, mas aceito na entrada

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    total_com_juros?: number;

    @IsNotEmpty()
    @IsString()
    data_lancamento: string;

    @IsNumber()
    @IsNotEmpty()
    cartaoId: number;

    @IsNumber()
    @IsNotEmpty()
    usuarioId: number;
}
