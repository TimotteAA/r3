import { BaseSubscriber } from '@/modules/database/crud';
import { CosService } from '@/modules/tencent-os/services';
import { Injectable } from '@nestjs/common';
import { DataSource, RemoveEvent } from 'typeorm';

import { BaseFileEntity } from '../entities';

@Injectable()
export class MediaSubscriber extends BaseSubscriber<BaseFileEntity> {
    constructor(
        protected dataSource: DataSource,
        private cosService: CosService
    ) {
        super(dataSource);
        this.dataSource.subscribers.push(this);
    }

    protected entity = BaseFileEntity;

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
