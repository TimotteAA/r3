import {
    Injectable,
    LiteralObject,
    ClassSerializerContextOptions,
    ClassSerializerInterceptor,
    StreamableFile,
} from '@nestjs/common';
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
            // console.log('items', items);
            items = items.map((item) => {
                return isObject(item) ? this.transformToPlain(item, options) : item;
            });
            // console.log(items);
            return {
                ...response,
                items,
            };
        }

        // 普通对象
        return this.transformToPlain(response, options);
    }
}
