import { Injectable } from '@nestjs/common';
import { ObjectType, DataSource, Repository } from 'typeorm';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

type IsExistCondition = {
    entity: ObjectType<any>;
    // 额外查询的字段
    map?: string;
};

@ValidatorConstraint({ name: 'isExist', async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, args: ValidationArguments) {
        // value可能是数据库中某一个entity的id。
        // null是否存在于数据库...
        if (!value) return true;
        // 传入的查询
        const [condition] = args.constraints;
        let repo: Repository<any> | null;
        // 查询字段，默认是id
        let map: string = condition.map ?? 'id';
        // 获取查询的repository
        if ('entity' in condition) {
            repo = this.dataSource.getRepository(condition.entity);
        } else {
            repo = this.dataSource.getRepository(condition);
        }
        //
        const item = await repo.findOne({
            where: {
                [map]: value,
            },
        });
        return !!item;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const property = validationArguments.property;
        const [condition] = validationArguments.constraints;
        return `${property} with field ${condition.map ?? 'id'} does not exist`;
    }
}

/**
 * 对传入entity的id字段进行查询
 * @param entity
 * @param validationOptions
 */
export function IsExist(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;
/**
 * 对传入字段的指定字段进行查询
 */
export function IsExist(
    condition: IsExistCondition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

export function IsExist(
    condition: ObjectType<any> | IsExistCondition,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: IsExistConstraint,
        });
    };
}
