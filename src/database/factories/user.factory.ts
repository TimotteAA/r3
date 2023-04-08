import { defineFactory } from "@/modules/database/helpers"
import { UserEntity } from "@/modules/user/entities"
import { Faker } from "@faker-js/faker"
import { isNil } from "lodash"

/**
 * fake user type
 */
export type IUserFactoryOptions = Partial<{
    [key in keyof UserEntity]: UserEntity[key]
}>

/**
 * user entity必选字段的处理
 */
export const UserFactory = defineFactory(
    UserEntity, 
    async (faker: Faker, options: IUserFactoryOptions = {}) => {
        faker.setLocale("zh_CN");
        const user = new UserEntity();
        const keys: (keyof IUserFactoryOptions)[] = [
            'username',
            'password',
            'email',
            'phone',
            'isCreator'
        ]
        keys.forEach((key) => {
            if (!isNil(options[key])) {
                user[key] = options[key]
            }
        })

        user.username = options.username ?? faker.name.fullName();
        user.password = options.password ?? '123456aA!';
        user.actived = options.actived ?? Math.random() > 0.5;
        return user;
    }
)
