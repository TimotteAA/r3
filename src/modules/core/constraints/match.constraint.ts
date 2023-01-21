import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMatch' })
export class IsMatchConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const object = args.object as any;
        const [relativeProperty] = args.constraints;
        return value === object[relativeProperty];
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const property = validationArguments.property;
        const [relativeProperty] = validationArguments.constraints;
        return `${relativeProperty} and ${property} don't match`;
    }
}

/**
 * 校验dto中该字段是否与另一个字段的值相等
 * @param relativeProperty：比较的属性
 * @param validationOptions
 * @returns
 */
export function IsMatch(relativeProperty: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [relativeProperty],
            validator: IsMatchConstraint,
        });
    };
}
