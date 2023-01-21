import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

type PasswordType = 1 | 2 | 3 | 4 | 5;

@ValidatorConstraint({ name: 'isPassword' })
export class PasswordConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const passwordType: PasswordType = args.constraints[0] ?? 1;
        switch (passwordType) {
            case 1:
                return /\d/.test(value) && /[a-zA-Z]/.test(value);
            case 2:
                return /\d/.test(value) && /[a-zA-Z]/.test(value);

            case 3: {
                return /\d/.test(value) && /[A-Z]/.test(value);
            }
            case 4:
                return /\d/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value);
            // 必须包含数字,小写字母,大写字母,特殊符号
            case 5:
                return (
                    /\d/.test(value) &&
                    /[a-z]/.test(value) &&
                    /[A-Z]/.test(value) &&
                    /[!@#$%^&]/.test(value)
                );
            default:
                return /\d/.test(value) && /[a-zA-Z]/.test(value);
        }
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const property = validationArguments.property;
        const [relativeProperty] = validationArguments.constraints;
        return `${relativeProperty} and ${property} don't match`;
    }
}

/**
 * 校验dto中的password是否符合某一格式
 * 模式1: 必须由大写或小写字母组成(默认模式)
 * 模式2: 必须由小写字母组成
 * 模式3: 必须由大写字母组成
 * 模式4: 必须包含数字,小写字母,大写字母
 * 模式5: 必须包含数字,小写字母,大写字母,特殊符号
 * @param type 密码格式
 * @param validationOptions
 * @returns
 */
export function IsPassword(type?: PasswordType, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [type],
            validator: PasswordConstraint,
        });
    };
}
