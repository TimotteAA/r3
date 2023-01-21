import { Injectable } from '@nestjs/common';
import { ObjectType, DataSource } from 'typeorm';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { merge } from 'lodash';

type Condition = {
    entity: ObjectType<any>;
    // 查询是否重复的字段
    property?: string;
    // 父亲字段
    parentField?: string;
};

@ValidatorConstraint({ name: 'isUniqueTree', async: true })
@Injectable()
export class IsUniqueTreeConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, args: ValidationArguments) {
        // 查询entity中的字段是否唯一
        let [condition] = args.constraints;
        const config: Omit<Condition, 'entity'> = {
            // 查询是否重复的字段，默认是添加装饰器的property
            property: args.property,
            // 父亲字段
            parentField: 'parent',
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
        const dtoObj = args.object as any;
        try {
            const repo = this.dataSource.getTreeRepository(condition.entity);
            const collection = await repo.find({
                where: {
                    parent: !dtoObj[condition.parentField]
                        ? null
                        : { id: dtoObj[condition.parentField] },
                },
            });
            // 对比每个子分类的queryProperty值是否与当前验证的dto属性相同,如果有相同的则验证失败
            return collection.every((item) => item[condition.property] !== value);
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
        return `${queryProperty} of ${entity.name} must been unique with siblings element!`;
    }
}

/**
 * 对传入entity的，同一个父亲，在同层中是否有重复
 * @param entity
 * @param validationOptions
 */
export function IsUniqueTree(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;
/**
 * 对传入entity的，同一个父亲，在同层中是否有重复
 */
export function IsUniqueTree(
    condition: Condition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

export function IsUniqueTree(
    condition: ObjectType<any> | Condition,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: IsUniqueTreeConstraint,
        });
    };
}
