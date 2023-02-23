import { SetMetadata, Paramtype } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { TransformOptions } from 'class-transformer';
import { CUSTOM_DTO_VALIDATION_KEY } from '../constants';

/**
 * 自定义dto装饰器
 */
export function CustomDtoValidation(
    options?: ValidatorOptions & {
        transformOptions?: TransformOptions;
    } & {
        type?: Paramtype;
    },
) {
    return SetMetadata(CUSTOM_DTO_VALIDATION_KEY, options ?? {});
}
