import { BaseRepository } from '@/modules/database/crud';
import { CustomRepository } from '@/modules/database/decorators';
import { MessageReceiveEntity } from '../entities';

@CustomRepository(MessageReceiveEntity)
export class MessageReceiveRepository extends BaseRepository<MessageReceiveEntity> {
    protected alias = 'message-receive';

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias);
    }
}
