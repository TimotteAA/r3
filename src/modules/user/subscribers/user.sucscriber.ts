import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    DataSource
} from 'typeorm';
import { UserEntity } from '../entities';
import { encrypt, generateRandonString } from '../helpers';

import crypto from 'crypto';
import { isNil } from 'lodash';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';
import { env } from '@/modules/utils';

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
        event.entity.password = await encrypt(event.entity.password);
    }

    /**
     * 当密码更改时加密密码
     * 仅有更新字段
     * 
     * @param {UpdateEvent<UserEntity>} event
     * @memberof UserSubscriber
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        
        if (!isNil(event.entity) &&  !isNil(event.entity.password)) {
            event.entity.password = encrypt(event.entity.password)
        }
    }

    /**
     * 在rbac.resolver中，并没有直接关联用户和权限
     * @param entity 
     */
    async afterLoad(entity: UserEntity) {
        // user的权限通过角色查询而出，因此权限可能会有重复
        let permissions = (entity.permissions ?? []) as PermissionEntity[];
        // 查询角色所有的权限
        if (entity.roles && entity.roles.length > 0) {
            for (const role of entity.roles) {
                const roleEntity = await RoleEntity.findOneOrFail({
                    where: {
                        id: role.id
                    },
                    relations: ['permissions']
                });
                permissions = [...permissions, ...(roleEntity.permissions ?? [])]
            };
        }


        permissions = permissions.reduce<PermissionEntity[]>((o, n) => {
            if (o.map(item => item.name).includes(n.name)) {
                return o;
            }
            return [...o, n]
        }, []);
        entity.permissions = permissions;
        entity.avatarSrc = env("DEFAULT_AVATAR");
        if (!isNil(entity.avatar)) {
            entity.avatarSrc = this.genAvatarSrc(entity.avatar.key);
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

    /**
     * 生成头像src
     * @param key 
     */
    protected genAvatarSrc(key: string) {
        const prefix = env("COS_URL_PREFIX");
        return (prefix + "/" + key).replace("//", '/')
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
