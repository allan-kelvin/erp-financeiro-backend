import { PartialType } from "@nestjs/mapped-types";
import { CreateFornecedorDto } from "../create-fornecedor/create-fornecedor.dto";

export class UpdateFornecedorDto extends PartialType(CreateFornecedorDto) { }
