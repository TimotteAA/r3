import { ListQueryDto } from '@/modules/restful/dto';
import { NotFoundException, Type } from '@nestjs/common';
import { CLASS_SERIALIZER_OPTIONS } from '@nestjs/common/serializer/class-serializer.constants';
import { isNil } from 'lodash';

import { ALLOW_GUEST, CRUD_OPTIONS } from '@/modules/restful/constants';
import { BaseController } from '../controller';

import { CrudItem, CrudMethod, CrudOptions } from '../types';

export const Crud =
    (options: CrudOptions) =>
    <T extends BaseController<any>>(Target: Type<T>) => {
        Reflect.defineMetadata(CRUD_OPTIONS, options, Target);
        const { id, enabled, dtos } = Reflect.getMetadata(CRUD_OPTIONS, Target) as CrudOptions;
        const changed: Array<CrudMethod> = [];
        // 遍历所用启用的方法添加验证DTO类
        for (const value of enabled) {
            // 方法名
            const { name } = (typeof value === 'string' ? { name: value } : value) as CrudItem;
            if (changed.includes(name)) continue;
            if (name in Target.prototype) {
                // 在Controller中自己定义了
                let method = Object.getOwnPropertyDescriptor(Target.prototype, name);
                if (isNil(method)) {
                    // 没定义，取BaseController的方法描述符
                    method = Object.getOwnPropertyDescriptor(BaseController.prototype, name);
                }
                // 拿到方法入参
                const paramTypes = Reflect.getMetadata('design:paramtypes', Target.prototype, name);
                const params = [...paramTypes];
                if (name === 'create') params[0] = dtos.create;
                else if (name === 'update') params[0] = dtos.update;
                // else if (name === 'list' || name === 'deleteMulti' || name === 'restoreMulti')
                else if (name === "list")
                    params[0] = dtos.query ?? ListQueryDto;
                Reflect.defineMetadata('design:paramtypes', params, Target.prototype, name);
                changed.push(name);
            }
        }
        // // 添加序列化选项以及是否允许匿名访问等metadata
        // if (Target.name === "UserController") {
        //     console.log(changed)
        // }

        for (const key of changed) {
            const find = enabled.find((v) => v === key || (v as any).name === key);
            const option = typeof find === 'string' ? {} : find.options ?? {};
            let serialize = {};
            if (isNil(option.serialize)) {
                if (['detail', 'store', 'update', 'delete', 'restore'].includes(key)) {
                    serialize = { groups: [`${id}-detail`] };
                } else if (['list', 'deleteMulti', 'restoreMulti'].includes(key)) {
                    serialize = { groups: [`${id}-list`] };
                }
            } else if (option.serialize === 'noGroup') {
                serialize = {};
            }
            Reflect.defineMetadata(CLASS_SERIALIZER_OPTIONS, serialize, Target.prototype, key);
            if (option.allowGuest) {
                Reflect.defineMetadata(ALLOW_GUEST, true, Target.prototype, key);
            }
            // if (key === "list" && Target.name === "UserController") console.log(option)
            if (option.hook) option.hook(Target, key)
        }
        // 对于不启用的方法返回404
        const fixedProperties = ['constructor', 'service', 'setService'];
        for (const key of Object.getOwnPropertyNames(BaseController.prototype)) {
            const isEnabled = options.enabled.find((v) =>
                typeof v === 'string' ? v === key : (v as any).name === key,
            );
            if (!isEnabled && !fixedProperties.includes(key)) {
                let method = Object.getOwnPropertyDescriptor(Target.prototype, key);
                if (isNil(method))
                    method = Object.getOwnPropertyDescriptor(BaseController.prototype, key);
                Object.defineProperty(Target.prototype, key, {
                    ...method,
                    async value(...args: any[]) {
                        return new NotFoundException();
                    },
                });
            }
        }
        return Target;
    };
