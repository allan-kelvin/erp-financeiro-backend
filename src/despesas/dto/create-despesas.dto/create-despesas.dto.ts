import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { TipoDespesaEnum } from 'src/despesas/enums/TipoDespesasEnum';

export class CreateDespesasDto {

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsEnum(TipoDespesaEnum, { message: 'Tipo de despesa inválido.' }) // Novo campo com validação de enum
    @IsNotEmpty()
    tipo_despesa: TipoDespesaEnum;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.01, { message: 'O valor total deve ser maior que zero.' })
    @Type(() => Number)
    valor_total: number;

    @IsBoolean()
    @IsNotEmpty()
    parcelado: boolean;

    @ValidateIf(o => o.parcelado === true)
    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'A quantidade de parcelas deve ser no mínimo 1 para despesas parceladas.' })
    @Type(() => Number)
    qtd_parcelas?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'O valor da parcela não pode ser negativo.' })
    @Type(() => Number)
    valor_parcela?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'O total com juros não pode ser negativo.' })
    @Type(() => Number)
    total_com_juros?: number;

    @IsOptional() // Campo opcional, pode ser calculado ou fornecido
    @IsNumber()
    @Min(0, { message: 'Os juros aplicados não podem ser negativos.' })
    @Type(() => Number)
    juros_aplicado?: number; // Novo campo para juros aplicados

    @IsNotEmpty()
    @IsString({ message: 'A data de lançamento deve ser uma string de data válida.' })
    data_lancamento: string;

    @IsNumber()
    @IsOptional()
    cartaoId: number;

    @IsNumber()
    @IsNotEmpty()
    usuarioId: number;
}
