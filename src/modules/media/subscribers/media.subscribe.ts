import {  LoadEvent, RemoveEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { isNil } from 'lodash';

import { BaseSubscriber } from '@/modules/database/crud';
import { CosService } from '@/modules/tencent-os/services';
import { App } from '@/modules/core/app';

import { BaseFileEntity } from '../entities';
import { panic } from '@/modules/core/helpers';
import { Configure } from '@/modules/core/configure';

@Injectable()
export class MediaSubscriber extends BaseSubscriber<BaseFileEntity> {
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
        const cosService = App.app.get(CosService);
        try {
            await cosService.delete(bucketPrefix, ossKey);
        } catch (err: any) {
            panic({error: err, message: `文件${ossKey}删除失败`});
        }
    }

    async afterLoad(event: LoadEvent<BaseFileEntity>): Promise<void> {
        const configure = App.app.get(Configure);
        const prefix = await configure.get<string>("COS_URL_BANNER_PREFIX");
        // console.log("entity", entity);
        // if (!isNil(entity.image)) entity.src = (new URL(entity.image.key, prefix)).href;
        const entity = event.entity;
        if (isNil(entity)) return;
        event.entity.url = (new URL(entity.bucketPrefix + entity.key, prefix)).href;
    }
}
