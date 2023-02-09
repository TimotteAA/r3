import { BaseRepository } from '@/modules/core/crud';
import { CustomRepository } from '@/modules/database/decorators';
import { UserEntity } from '../entities';

@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    protected alias = 'user';

    buildBaseQuery() {
        console.log("this", this);
        return this.createQueryBuilder(this.alias)
            .leftJoinAndSelect(`${this.alias}.roles`, 'roles')
            .leftJoinAndSelect(`${this.alias}.permissions`, 'permissions')
            .orderBy(`${this.alias}.createdAt`, 'ASC');
    }
}
