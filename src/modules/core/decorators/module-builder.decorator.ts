import { ModuleMetaRegister } from "../types";
import { MODULE_BUILDER_REGISTER } from "../constants";

/**
 * 模块构造器装饰器工厂函数
 * @param register 
 */
export function ModuleBuilder<P extends Record<string, any>>(
    register: ModuleMetaRegister<P>
) {
    return <M extends new (...args: any[]) => any>(target: M) => {
        Reflect.defineMetadata(MODULE_BUILDER_REGISTER, register, target);
        return target;
    }
}