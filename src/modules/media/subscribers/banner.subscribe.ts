import { Injectable } from '@nestjs/common';
import { isNil } from 'lodash'; 

import { BannerEntity } from '../entities';
import { BaseSubscriber } from '@/modules/database/crud';
import { App } from '@/modules/core/app';
import { Configure } from '@/modules/core/configure';


@Injectable()
export class BannerSubscriber extends BaseSubscriber<BannerEntity> {
    protected entity = BannerEntity;

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return BannerEntity;
    }

    async afterLoad(entity: BannerEntity) {
        const configure = App.app.get(Configure);
        const prefix = await configure.get<string>("COS_URL_BANNER_PREFIX");
        // console.log("entity", entity);
        if (!isNil(entity.image)) entity.src = (new URL(entity.image.key, prefix)).href;
    }
}
