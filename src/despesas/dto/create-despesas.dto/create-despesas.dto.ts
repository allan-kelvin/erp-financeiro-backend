import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { CategoriaEnum } from 'src/despesas/enums/CategoriaEnum';
import { FormaDePagamentoEnum } from 'src/despesas/enums/FormaPagamentoEnum';
import { GrupoEnum } from 'src/despesas/enums/GrupoEnum';

export class CreateDespesasDto {

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsEnum(CategoriaEnum, { message: 'Categoria inválida.' })
    @IsNotEmpty()
    categoria: CategoriaEnum;

    @IsEnum(GrupoEnum, { message: 'Grupo inválido.' })
    @IsNotEmpty()
    grupo: GrupoEnum;

    @IsNumber()
    @IsNotEmpty()
    @Min(0.01, { message: 'O valor deve ser maior que zero.' })
    @Type(() => Number)
    valor: number;

    @IsEnum(FormaDePagamentoEnum, { message: 'Forma de pagamento inválida.' })
    @IsNotEmpty()
    formaDePagamento: FormaDePagamentoEnum;

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

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Os juros aplicados não podem ser negativos.' })
    @Type(() => Number)
    juros_aplicado?: number;

    @IsNotEmpty()
    @IsString({ message: 'A data de lançamento deve ser uma string de data válida.' })
    data_lancamento: string;

    @IsNumber()
    @IsOptional()
    cartaoId: number;

    @IsNumber()
    @IsNotEmpty()
    subCategoriaId: number;

    @IsNumber()
    @IsOptional()
    fornecedorId?: number;

    @IsNumber()
    @IsOptional()
    bancoId?: number;

    @IsNumber()
    @IsNotEmpty()
    usuarioId: number;
}
