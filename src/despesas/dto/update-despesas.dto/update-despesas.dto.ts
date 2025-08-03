import { PartialType } from "@nestjs/mapped-types";
import { CreateDespesasDto } from "../create-despesas.dto/create-despesas.dto";

export class UpdateDespesasDto extends PartialType(CreateDespesasDto) { }
