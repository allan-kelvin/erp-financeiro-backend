import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSubCategoriaDTO {
    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
