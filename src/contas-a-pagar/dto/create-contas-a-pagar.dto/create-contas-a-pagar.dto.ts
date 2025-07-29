import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "@nestjs/class-validator";
import { StatusContaPagar } from "src/contas-a-pagar/enums/StatusContaPagar.enum";

export class CreateContasAPagarDto {

    @IsNumber()
    dividaId: number;

    @IsNumber()
    cartaoId: number;

    @IsNumber()
    valor_pago: number;

    @IsDateString()
    data_emissao: string;

    @IsOptional()
    @IsDateString()
    data_encerramento?: string;

    @IsOptional()
    @IsEnum(StatusContaPagar)
    status?: StatusContaPagar;

    @IsOptional()
    @IsString()
    observacoes?: string;
}
