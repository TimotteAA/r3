import { EventSubscriber, EntitySubscriberInterface, DataSource, LoadEvent } from 'typeorm';

import { TypeAction, TypeStuff } from '@/modules/actions/constants';
import { ActionEntity } from '@/modules/actions/entities';
import { CommentEntity } from '../entities';

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<CommentEntity> {
    constructor(
        private dataSource: DataSource,
    ) {
        this.dataSource.subscribers.push(this);
    }

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return CommentEntity;
    }

    /**
     * 计算点赞数与讨厌数
     * @param entity 
     * @param event 
     */
    async afterLoad(_: CommentEntity, event?: LoadEvent<CommentEntity>) {
        const actionRepo = this.dataSource.getRepository(ActionEntity);
        // 点赞者
        const likers = (await actionRepo.find({
            where: {
                stuffId: event.entity.id,
                stuffType: TypeStuff.COMMENT,
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
                stuffType: TypeStuff.COMMENT,
                actionType: TypeAction.DOWN,
            }
        });
        event.entity.hateCounts = disLikers
    }
}
