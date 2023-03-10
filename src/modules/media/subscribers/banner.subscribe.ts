import { DataSource, RemoveEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { isNil } from 'lodash'; 

import { BannerEntity } from '../entities';
import { env } from '@/modules/utils';
import { BaseSubscriber } from '@/modules/database/crud';

@Injectable()
export class BannerSubscriber extends BaseSubscriber<BannerEntity> {
    constructor(
        protected dataSource: DataSource,
    ) {
        super(dataSource)
        this.dataSource.subscribers.push(this);
    }

    protected entity = BannerEntity;

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

    async afterRemove(event: RemoveEvent<BannerEntity>) {
        const entity = event.entity;
        const file = entity.image;
        if (!isNil(file)) await file.remove();
    }
}
