import { UpdateUserDto } from './user.dto';
import { OmitType } from '@nestjs/swagger';
import { CustomDtoValidation } from '@/modules/core/decorators';
import { Injectable } from '@nestjs/common';

@Injectable()
@CustomDtoValidation({ groups: ['update'] })
export class UpdateAccountDto extends OmitType(UpdateUserDto, ['id']) {}
