import { Injectable } from '@nestjs/common';
import { ObjectType, DataSource } from 'typeorm';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { merge, isNil } from 'lodash';

type Condition = {
    entity: ObjectType<any>;
    // 要忽视的字段
    ignore?: string;
    // 查询是否重复的字段
    property?: string;
    // 父亲字段
    parentField?: string;
};

@ValidatorConstraint({ name: 'isUniqueTreeUpdate', async: true })
@Injectable()
export class IsUniqueTreeUpdateConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, args: ValidationArguments) {
        // 查询entity中的字段是否唯一
        // 可以忽视某个字段
        let [condition] = args.constraints;
        const config: Omit<Condition, 'entity'> = {
            // 查询是否重复的字段，默认是添加装饰器的property
            property: args.property,
            // 父亲字段
            parentField: 'parent',
            // 忽视的字段
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
        if (!condition.entity) return false;
        const dtoObj = args.object as any;
        // 查询字段的值
        const toFindValue = dtoObj[condition.property];
        // 忽视字段的值
        const toIgnoreValue = dtoObj[condition.ignore];
        if (!toFindValue || !toIgnoreValue) return false;
        try {
            const repo = this.dataSource.getTreeRepository(condition.entity);
            // 要更新的对象，根据id查询
            const item = await repo.findOne({
                where: {
                    [condition.ignore]: dtoObj[condition.ignore],
                },
                relations: [condition.parentField],
            });
            // 没有此对象
            if (isNil(item)) return false;

            // 查询parent的所有child
            const children = await repo.find({
                where: {
                    parent: !item[condition.parentField]
                        ? null
                        : {
                              id: item[condition.parentField].id,
                          },
                },
                withDeleted: true,
            });
            return !children.find(
                (c) => c[condition.ignore] !== toIgnoreValue && c[condition.property] == value,
            );
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
export function IsUniqueTreeUpdate(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;
/**
 * 对传入entity的，同一个父亲，在同层中是否有重复
 */
export function IsUniqueTreeUpdate(
    condition: Condition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

export function IsUniqueTreeUpdate(
    condition: ObjectType<any> | Condition,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: IsUniqueTreeUpdateConstraint,
        });
    };
}
