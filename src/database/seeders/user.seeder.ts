import { DataSource, EntityManager } from "typeorm";
import { isNil } from "lodash";

import { BaseSeeder } from "@/modules/database/crud/seeder";
import { DbFactory } from "@/modules/database/types";
import { UserEntity, AccessTokenEntity, RefreshTokenEntity, CodeEntity } from "@/modules/user/entities";
import { getUserConfig } from "@/modules/user/helpers";
import { getCustomRepository } from "@/modules/database/helpers";
import { UserRepository } from "@/modules/user/repositorys";
import { UserConfig } from "@/modules/user/types";

export default class UserSeeder extends BaseSeeder {

    protected truncates = [UserEntity, AccessTokenEntity, RefreshTokenEntity, CodeEntity];

    protected factorier!: DbFactory;

    protected async run(factorier?: DbFactory, dataSource?: DataSource, em?: EntityManager): Promise<any> {
        this.factorier = factorier;
        await this.loadUsers();
    }

    private async loadUsers() {
        const admin = await getUserConfig<UserConfig['super']>("super");
        // console.log("user factorier", this.factorier)
        const superUser = await getCustomRepository(this.dataSource, UserRepository).findOneBy({username: admin.username});
        if (isNil(superUser)) {
            const superUser = await (this.factorier(UserEntity)({
                username: admin.username,
                password: admin.password
            }).create());
            // console.log("superUser", superUser);
            await this.em.save(superUser);
        };

        // 再随机创建几个
        const users = await this.factorier(UserEntity)({}).createMany(15, {}, 'username');
        // console.log("users", users);
        await this.em.save(users);
    }
}