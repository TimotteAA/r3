import { BaseRepository } from '@/modules/database/crud';
import { CustomRepository } from '@/modules/database/decorators';
import { UserEntity } from '../entities';

@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    protected alias = 'user';

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias)
            .leftJoinAndSelect(`${this.alias}.roles`, 'roles')
            .leftJoinAndSelect(`${this.alias}.permissions`, 'permissions')
            .leftJoinAndSelect(`${this.alias}.avatar`, 'avatar')
            .orderBy(`${this.alias}.createdAt`, 'DESC');
    }

    
}
