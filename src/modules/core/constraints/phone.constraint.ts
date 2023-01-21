import {
    isMobilePhone,
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
// @ts-ignore
import { MobilePhoneLocale, IsMobilePhoneOptions } from 'validator/lib/isMobilePhone';

export function isMatchPhone(
    value: any,
    locale?: MobilePhoneLocale,
    options?: IsMobilePhoneOptions,
) {
    if (!value) return false;
    const phoneArr: string[] = value.split('.');
    if (phoneArr.length !== 2) return false;
    return isMobilePhone(phoneArr.join(''), locale, options);
}

@ValidatorConstraint({ name: 'isPhone' })
export class PhoneConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        return isMobilePhone(value, args.constraints[0], args.constraints[1]);
    }

    defaultMessage(_args: ValidationArguments): string {
        return '$property is not a valid phone, eg: +86.12345678123';
    }
}

/**
 *
 * @param locales 国家、区号
 * @param options isMobilePhone约束项
 * @param validationOptions
 * @returns
 */
export function IsPhone(
    locales?: MobilePhoneLocale,
    options?: IsMobilePhoneOptions,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [locales || 'any', options],
            validator: PhoneConstraint,
        });
    };
}
