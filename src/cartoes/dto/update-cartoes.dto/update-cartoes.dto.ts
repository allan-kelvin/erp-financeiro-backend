
import { PartialType } from '@nestjs/mapped-types';
import { CreateCartoesDto } from '../create-cartoes.dto/create-cartoes.dto';


export class UpdateCartoesDto extends PartialType(CreateCartoesDto) { }