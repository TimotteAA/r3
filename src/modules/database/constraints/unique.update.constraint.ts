import { Injectable } from '@nestjs/common';
import { ObjectType, DataSource, Not } from 'typeorm';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isNil, merge } from 'lodash';

type IsUniqueUpdateCondition = {
    entity: ObjectType<any>;
    // 忽视的字段，默认为id
    ignore?: string;
    // 查询是否重复的字段
    property?: string;
};

@ValidatorConstraint({ name: 'isUniqueUpdate', async: true })
@Injectable()
export class IsUniqueUpdateConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, args: ValidationArguments) {
        // 查询entity中的字段是否唯一，可以忽视某一字段
        let condition = args.constraints[0];
        // 查询字段，默认是添加装饰器的property
        const config: Omit<IsUniqueUpdateCondition, 'entity'> = {
            property: args.property,
            ignore: 'id',
        };
        condition =
            'entity' in condition
                ? merge(config, condition)
                : {
                      ...config,
                      entity: args.constraints[0],
                  };
        // 没传Entity
        // 忽略的字段值
        const ignoreValue = (args.object as any)[condition.ignore];
        // 忽略的字段值不存在
        if (ignoreValue === undefined) return false;
        if (!condition.entity) return false;
        try {
            const repo = this.dataSource.getRepository(condition.entity);
            const item = await repo.findOne({
                where: {
                    [condition.property]: value,
                    [condition.ignore]: Not(ignoreValue),
                },
                withDeleted: true,
            });
            return isNil(item);
        } catch {
            // 数据库操作失败
            return false;
        }
    }

    defaultMessage(args?: ValidationArguments): string {
        const { entity, property } = args.constraints[0];
        const queryProperty = property ?? args.property;
        if (!(args.object as any).getManager) {
            return 'getManager function not been found';
        }
        if (!entity) return 'entity must be defined';
        return `${queryProperty} of ${entity} does not exist`;
    }
}

/**
 * 对传入entity的，对施加装饰器的字段查询是否唯一，可以指定忽视字段，默认为id
 * @param entity
 * @param validationOptions
 */
export function IsUniqueUpdate(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;
/**
 * 对传入entity的指定字段查询是否唯一，可以指定忽视字段
 */
export function IsUniqueUpdate(
    condition: IsUniqueUpdateCondition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

export function IsUniqueUpdate(
    condition: ObjectType<any> | IsUniqueUpdateCondition,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: IsUniqueUpdateConstraint,
        });
    };
}
