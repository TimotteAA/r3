import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    DataSource,
} from 'typeorm';
import { UserEntity } from '../entities';
import { encrypt, generateRandonString } from '../helpers';

import crypto from 'crypto';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(private dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return UserEntity;
    }

    async beforeInsert(event: InsertEvent<UserEntity>) {
        // 使用手机或者邮箱注册
        if (!event.entity.username) {
            event.entity.username = await this.generateUserName(event);
        }

        // 使用手机或者邮箱注册
        if (!event.entity.password) {
            event.entity.password = crypto.randomBytes(11).toString('hex').slice(0, 22);
        }

        // 插入前对entity的密码加密
        event.entity.password = encrypt(event.entity.password);
    }

    /**
     * 当密码更改时加密密码
     *
     * @param {UpdateEvent<UserEntity>} event
     * @memberof UserSubscriber
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        if (this.isUpdated('password', event)) {
            event.entity.password = encrypt(event.entity.password);
        }
    }

    /**
     * 生成不重复的随机用户名
     *
     * @protected
     * @param {InsertEvent<UserEntity>} event
     * @return {*}  {Promise<string>}
     * @memberof UserSubscriber
     */
    protected async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `user_${generateRandonString()}`;
        // 用户名查询
        const user = await event.manager.findOne(UserEntity, {
            where: { username },
        });
        return !user ? username : this.generateUserName(event);
    }

    /*
     * @description 判断某个属性是否被更新
     * @protected
     * @param {keyof E} cloumn
     * @param {UpdateEvent<E>} event
     */
    protected isUpdated(cloumn: keyof UserEntity, event: UpdateEvent<UserEntity>) {
        return !!event.updatedColumns.find((item) => item.propertyName === cloumn);
    }
}
