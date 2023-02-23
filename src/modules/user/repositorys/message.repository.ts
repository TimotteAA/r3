import { BaseRepository } from '@/modules/database/crud';
import { CustomRepository } from '@/modules/database/decorators';
import { MessageEntity } from '../entities';

@CustomRepository(MessageEntity)
export class MessageRepository extends BaseRepository<MessageEntity> {
    protected alias = 'message';

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias).orderBy(`${this.alias}.createdAt`, 'DESC');
    }
}
