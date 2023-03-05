import { CosService } from '@/modules/tencent-os/services';
import { EventSubscriber, EntitySubscriberInterface, DataSource, RemoveEvent } from 'typeorm';

import { BaseFileEntity } from '../entities';

@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<BaseFileEntity> {
    constructor(
        private dataSource: DataSource,
        private cosService: CosService
    ) {
        this.dataSource.subscribers.push(this);
    }

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return BaseFileEntity;
    }

    async afterRemove(event: RemoveEvent<BaseFileEntity>) {
        const ossKey = event.entity.key;
        const bucketPrefix = event.entity.bucketPrefix;
        await this.cosService.delete(bucketPrefix, ossKey);
    }
}
