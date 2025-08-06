import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSubCategoriaDTO {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
