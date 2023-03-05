import { EventSubscriber, EntitySubscriberInterface, DataSource } from 'typeorm';
import path from 'path';

import { BannerEntity } from '../entities';
import { env } from '@/modules/utils';

@EventSubscriber()
export class BannerSubscriber implements EntitySubscriberInterface<BannerEntity> {
    constructor(
        private dataSource: DataSource,
    ) {
        this.dataSource.subscribers.push(this);
    }

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return BannerEntity;
    }

    async afterLoad(entity: BannerEntity) {
        const prefix = env("COS_URL_BANNER_PREFIX")
        entity.src = path.join(prefix, entity.image.bucketPrefix, entity.image.key);
    }
}
