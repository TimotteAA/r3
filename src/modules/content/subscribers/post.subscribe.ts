import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { SanitizeService } from '../services/sanitize.service';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<PostEntity> {
    constructor(private sanitizeService: SanitizeService) {}

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
}
