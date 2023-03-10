import { InsertEvent, DataSource, LoadEvent } from 'typeorm';

import { TypeAction, TypeStuff } from '@/modules/actions/constants';
import { ActionEntity } from '@/modules/actions/entities';
import { PostEntity } from '../entities/post.entity';
import { SanitizeService } from '../services/sanitize.service';
import { Injectable } from '@nestjs/common';
import { BaseSubscriber } from '@/modules/database/crud';

@Injectable()
export class PostSubscriber extends BaseSubscriber<PostEntity> {
    constructor(
        private sanitizeService: SanitizeService, 
        protected dataSource: DataSource,
    ) {
        super(dataSource)
        this.dataSource.subscribers.push(this);
    }

    protected entity = PostEntity;

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return PostEntity;
    }

    /**
     * Called before post insertion.
     */
    beforeInsert(event: InsertEvent<PostEntity>) {
        // 对htmk放xss攻击
        if (event.entity.type === 'html') {
            event.entity.body = this.sanitizeService.sanitize(event.entity.body);
        }
    }

    /**
     * 计算点赞数与讨厌数
     * @param entity 
     * @param event 
     */
    async afterLoad(_: PostEntity, event?: LoadEvent<PostEntity>) {
        const actionRepo = this.dataSource.getRepository(ActionEntity);
        // 点赞者
        const likers = (await actionRepo.find({
            where: {
                stuffId: event.entity.id,
                stuffType: TypeStuff.POST,
                actionType: TypeAction.UP,
            },
            relations: ['user']
        })).map(item => item.user)
        
        event.entity.likers = likers;
        event.entity.likeCounts = likers.length;

        // 不点赞者
        const [__, disLikers] = await actionRepo.findAndCount({
            where: {
                stuffId: event.entity.id,
                stuffType: TypeStuff.POST,
                actionType: TypeAction.DOWN,
            }
        });
        event.entity.hateCounts = disLikers
    }
}
