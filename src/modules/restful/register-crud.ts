import { DeleteDto, ListQueryDto, RestoreDto } from '@/modules/restful/dto';
import { NotFoundException, SerializeOptions, Type } from '@nestjs/common';
import { Get, Post, Delete, Patch } from '@nestjs/common';
import { isNil } from 'lodash';
import { ApiBody, ApiQuery} from '@nestjs/swagger';

import { BaseController } from "./controller"
import { CrudOptions, CrudItem } from "./types"
import { ALLOW_GUEST } from './constants';

export const registerCrud = async <T extends BaseController<any>>(
  Target: Type<T>,
  options: CrudOptions
) => {
    const { id, enabled, dtos } = options;
    const methods: CrudItem[] = [];
    // 添加启用的方法
    for (const value of enabled) {            
        // 将字符串改成对象类型
        const item = ((typeof value === "string") ? { name: value } : value) as CrudItem;
        if (
            // 包含了同名方法或自己实现、改写了父类的路由方法，不处理
            methods.map(({name}) => name).includes(item.name) || 
            !isNil(Object.getOwnPropertyDescriptor(Target.prototype, item.name))
        ) 
            continue;
        methods.push(item);
    }

  
    // 添加参数、路径装饰器、序列化选项、是否允许匿名访问等
    for (const { name, options = {} } of methods) {
        // 自己的描述符
        // const baseDescriptor = Object.getOwnPropertyDescriptor(BaseController.prototype, name);
        // if (!isNil(baseDescriptor)) {
        //     let descriptor = Object.getOwnPropertyDescriptor(Target.prototype, name);
        //     descriptor = isNil(descriptor) ? baseDescriptor : descriptor;
        //     // 权限有，但文档乱
        //     Object.defineProperty(Target.prototype, name, {
        //         ...descriptor,
        //         async value(...args: any[]) {
        //             return descriptor.value.apply(this, args);
        //         },
        //         // [name]: async function(...args: any[]) {
        //         //     return descriptor.value.apply(this, args);
        //         // },
        //     });

        //     // // 文档对，但权限无
        //     // Object.defineProperty(Target.prototype, name, {
        //     //     ...descriptor,
        //     //     async value(...args: any[]) {
        //     //         return descriptor.value.apply(this, args);
        //     //     },
        //     // });
        // }

        if (isNil(Object.getOwnPropertyDescriptor(Target.prototype, name))) {
            const descriptor = Object.getOwnPropertyDescriptor(BaseController.prototype, name);

            Object.defineProperty(Target.prototype, name, {
                ...descriptor,
                // async value(...args: any[]) {
                //     return descriptor.value.apply(this, args);
                // },
                [name]: async function(...args: any[]) {
                    return descriptor.value.apply(this, args);
                }
            });
        }
  
        const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, name);
        // console.log("descriptor", descriptor);
  
        // 添加入参
        const [_, ...params] = Reflect.getMetadata("design:paramtypes", Target.prototype, name);
        
        if (name === "create" && !isNil(dtos.create)) {
            // 添加入参
            Reflect.defineMetadata(
                "design:paramtypes",
                [dtos.create, ...params],
                Target.prototype,
                name,
            );
            ApiBody({type: dtos.create})(Target, name, descriptor);
        } else if (name === "update" && !isNil(dtos.update)) {
            Reflect.defineMetadata(
                "design:paramtypes",
                [dtos.update, ...params],
                Target.prototype,
                name,
            );
            ApiBody({type: dtos.update})(Target, name, descriptor);
        } else if (name === "list") {
            // if (Target.name === "UserController") {
            //   console.log(name, options)
            // }
            const dto = dtos.query ?? ListQueryDto
            Reflect.defineMetadata(
                "design:paramtypes",
                [dto, ...params],
                Target.prototype,
                name
            )
            ApiQuery({ type: dtos.query })(Target, name, descriptor)
        } else if (name === "delete") {
            ApiBody({type: DeleteDto })(Target, name, descriptor)
        } else if (name === "restore") {
            ApiBody({type: RestoreDto})(Target, name, descriptor)
        }

        if (options.allowGuest) {
            Reflect.defineMetadata(ALLOW_GUEST, true, Target.prototype, name);
        }
  
        // 添加序列化group
        let serialize = {};
        if (isNil(options.serialize)) {
            if (['detail', 'create', 'update', 'delete', 'restore'].includes(name)) {
                serialize = { groups: [`${id}-detail`] }
            } else if (['list'].includes(name)) {
                serialize = { groups: [`${id}-list`] }
            }
        } else if (options.serialize === "noGroup") {
            serialize = {}
        }
        SerializeOptions(serialize)(Target, name, descriptor);

        switch (name) {
            case 'list':
                Get()(Target, name, descriptor);
                break;
            case 'detail':
                Get(':id')(Target, name, descriptor);
                break;
            case 'create':
                Post()(Target, name, descriptor);
                break;
            case 'update':
                Patch()(Target, name, descriptor);
                break;
            case 'delete':
                Delete()(Target, name, descriptor);
                break;
            case "restore":
                Patch("restore")(Target, name, descriptor);
                break;
            default:
                break;
        }
        
        if (!isNil(options.hook)) {
            // if (Target.name === "UserController") {
            //     console.log(123154, name, options.hook.toString())
            // }
            options.hook(Target, name);
        }
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
}

