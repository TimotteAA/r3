import { BaseRepository } from '@/modules/core/crud';
import { CustomRepository } from '@/modules/database/decorators';
import { UserEntity } from '../entities';

@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    protected alias = 'user';

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias).orderBy(`${this.alias}.createdAt`, 'ASC');
    }
}
