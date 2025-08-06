import { PartialType } from "@nestjs/mapped-types";
import { CreateSubCategoriaDTO } from "../create-sub-categoria/create-sub-categoria.dto";

export class UpdateSubCategoriaDTO extends PartialType(CreateSubCategoriaDTO) { }
