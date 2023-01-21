import { Injectable } from '@nestjs/common';
import { ObjectType, DataSource } from 'typeorm';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isNil, merge } from 'lodash';

type IsUnqieCondition = {
    entity: ObjectType<any>;
    // 查询是否重复的字段
    property?: string;
};

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, args: ValidationArguments) {
        // 查询entity中的字段是否唯一
        let [condition] = args.constraints;
        // 查询字段，默认是添加装饰器的property
        const config: Omit<IsUnqieCondition, 'entity'> = {
            property: args.property,
        };
        condition =
            'entity' in condition
                ? merge(config, condition)
                : {
                      ...config,
                      entity: args.constraints[0],
                  };
        // 没传Entity
        if (!condition.entity) return false;
        try {
            const repo = this.dataSource.getRepository(condition.entity);
            const item = await repo.findOne({
                where: { [condition.property]: value },
                withDeleted: true,
            });
            return isNil(item);
        } catch {
            // 数据库操作失败
            return false;
        }
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const property = validationArguments.property;
        const [condition] = validationArguments.constraints;
        return `${property} with field ${condition.property ?? property} does not exist`;
    }
}

/**
 * 对传入entity的，对施加装饰器的字段查询是否唯一
 * @param entity
 * @param validationOptions
 */
export function IsUnique(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;
/**
 * 对传入entity的指定字段查询是否唯一
 */
export function IsUnique(
    condition: IsUnqieCondition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

export function IsUnique(
    condition: ObjectType<any> | IsUnqieCondition,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: IsUniqueConstraint,
        });
    };
}
