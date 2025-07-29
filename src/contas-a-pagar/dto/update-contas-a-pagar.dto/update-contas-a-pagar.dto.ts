import { PartialType } from "@nestjs/mapped-types";
import { CreateContasAPagarDto } from "../create-contas-a-pagar.dto/create-contas-a-pagar.dto";

export class UpdateContasAPagarDto extends PartialType(CreateContasAPagarDto) { }
