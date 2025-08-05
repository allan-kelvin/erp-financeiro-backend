import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { StatusBanco } from "../enums/StatusBanco.enum";
import { TipoContaEnum } from "../enums/TipoConta.enum";

export class CreateBancoDto {

    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsOptional()
    @IsString()
    imagem_banco?: string;

    @IsEnum(TipoContaEnum)
    @Transform(({ value }) => {
        // aceita valor vindo como string equivalente (mantém como definido no enum)
        if (typeof value === 'string') return value;
        return value;
    })
    tipo_conta: TipoContaEnum;

    @IsEnum(StatusBanco)
    @Transform(({ value }) => {
        // Aceita boolean, 'ativo'|'inativo' (qualquer case), ou o valor exato do enum.
        if (typeof value === 'boolean') {
            return value ? StatusBanco.ATIVO : StatusBanco.INATIVO;
        }
        if (typeof value === 'string') {
            const v = value.trim().toLowerCase();
            if (v === 'true' || v === 'ativo' || v === 'at') return StatusBanco.ATIVO;
            if (v === 'false' || v === 'inativo' || v === 'in') return StatusBanco.INATIVO;
            // se já vier exatamente "Ativo" / "Inativo", retorna como está
            if (value === StatusBanco.ATIVO || value === StatusBanco.INATIVO) return value;
            // última tentativa: capitaliza primeira letra e retorna
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        return value;
    })
    status: StatusBanco;
}
