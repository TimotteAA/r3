import { ArgumentMetadata, Paramtype, ValidationPipe } from '@nestjs/common';
import { CUSTOM_DTO_VALIDATION_KEY } from '@/modules/database/constants';
import merge from 'deepmerge';
import { isObject, omit } from 'lodash';

export class AppPipe extends ValidationPipe {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        // value是正在检验的值
        const { type, metatype } = metadata;
        // 校验的dto的类
        const dto = metatype as any;
        // 获取装饰器定义的options
        const options = Reflect.getMetadata(CUSTOM_DTO_VALIDATION_KEY, dto) || {};
        // 备份全局的校验选项
        const originValidatorOptions = { ...this.validatorOptions };
        // 备份全局的class-transformer选项
        const originTransformOptions = { ...this.transformOptions };
        // 解构options中的设定
        const { transformOptions, type: optionType, ...dtoValidatorOptions } = options;
        // 请求类型，默认是body
        const requestType: Paramtype = optionType ?? 'body';
        // 比较定义在dto类上的与controller入参是否一致
        if (requestType !== type) {
            return value;
        }

        // 合并当前transform选项和自定义选项
        if (transformOptions) {
            this.transformOptions = merge(this.transformOptions, transformOptions ?? {}, {
                arrayMerge: (_d, s, _o) => s,
            });
        }
        // 合并当前验证选项和自定义选项
        this.validatorOptions = merge(this.validatorOptions, dtoValidatorOptions ?? {}, {
            arrayMerge: (_d, s, _o) => s,
        });
        const toValidate = isObject(value)
            ? Object.fromEntries(
                  Object.entries(value as Record<string, any>).map(([key, v]) => {
                      if (!isObject(v) || !('mimetype' in v)) return [key, v];
                      return [key, omit(v, ['fields'])];
                  }),
              )
            : value;
        // 序列化并验证dto对象

        let result = await super.transform(toValidate, metadata);

        // 如果dto类的中存在transform静态方法,则返回调用进一步transform之后的结果
        if (typeof result.transform === 'function') {
            result = await result.transform(result);
            const { transform, ...data } = result;
            result = data;
        }
        // 重置验证选项
        this.validatorOptions = originValidatorOptions;
        // 重置transform选项
        this.transformOptions = originTransformOptions;
        return result;
    }
}
