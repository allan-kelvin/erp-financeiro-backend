import { PartialType } from "@nestjs/mapped-types";
import { CreateDividasDto } from "../create-dividas.dto/create-dividas.dto";

export class UpdateDividasDto extends PartialType(CreateDividasDto) { }
