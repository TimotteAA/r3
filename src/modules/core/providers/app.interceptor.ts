import {
    Injectable,
    LiteralObject,
    ClassSerializerContextOptions,
    ClassSerializerInterceptor,
    StreamableFile,
    ExecutionContext,
} from '@nestjs/common';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { CLASS_SERIALIZER_OPTIONS } from '@nestjs/common/serializer/class-serializer.constants';
import { isObject, isNil } from 'lodash';

@Injectable()
export class AppInterceptor extends ClassSerializerInterceptor {
    serialize(
        response: LiteralObject | Array<LiteralObject>,
        options: ClassSerializerContextOptions,
    ) {
        // 基本类型或文件流，直接返回
        if (!isObject(response) || response instanceof StreamableFile) {
            return response;
        }

        // 数组
        if (Array.isArray(response)) {
            response = response.map((item) => {
                return isObject(item) ? this.transformToPlain(item, options) : item;
            });

            return response;
        }

        // 针对自定义的分页数据
        if ('meta' in response && 'items' in response) {
            let items =
                !isNil(response.items) && Array.isArray(response.items) ? response.items : [];
            items = items.map((item) => {
                return isObject(item) ? this.transformToPlain(item, options) : item;
            });
            return {
                ...response,
                items,
            };
        }

        // 普通对象
        return this.transformToPlain(response, options);
    }

    protected getContextOptions(context: ExecutionContext): ClassTransformOptions | undefined {
        const crudOptions = Reflect.getMetadata(
            CLASS_SERIALIZER_OPTIONS,
            context.getClass().prototype,
            context.getHandler().name,
        );
        return (
            crudOptions ??
            this.reflector.getAllAndOverride(CLASS_SERIALIZER_OPTIONS, [
                context.getHandler(),
                context.getClass(),
            ])
        );
    }
}
