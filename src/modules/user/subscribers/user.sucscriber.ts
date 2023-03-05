import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    DataSource
} from 'typeorm';
import crypto from 'crypto';
import { isNil, omit } from 'lodash';

import { UserEntity } from '../entities';
import { encrypt, generateRandonString } from '../helpers';
import { MenuEntity, PermissionEntity, RoleEntity } from '@/modules/rbac/entities';
import { env } from '@/modules/utils';
import { MenuType } from '@/modules/rbac/constants';
import { MenuRepository } from '@/modules/rbac/repository/menu.repository';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(private dataSource: DataSource,
        protected mRepo: MenuRepository    
    ) {
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
        if (isNil(event.entity.password)) {
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
            event.entity.password = await encrypt(event.entity.password)
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
        // 权限名
        const pNames = permissions.map(({name}) => name);

        // console.log("user permissions", entity.username, permissions);
        // const menus: MenuEntity[] = [];

        if (entity.isCreator) {
            // 超级管理员
            entity.menus = await this.mRepo.findTrees({
                relations: ['p']
            });
        } else {
            const menus: MenuEntity[] = [];
            const roots = await this.mRepo.findRoots();
            for (const root of roots) {
                // 系统内置菜单
                if (root.static) {
                    const tree = await this.mRepo.findDescendantsTree(root);
                    menus.push(tree)
                    continue;
                }

                // 取决于权限的菜单
                // 后代树
                const des = await this.mRepo.findDescendants(root, {
                    relations: ['p', 'parent', 'children']
                });
                // 当前菜单树中，是否含有子代包含有当前用户的权限
                let leafs = des.filter(d => d.type === MenuType.PERMISSION);
                // 第二层
                const ms = des.filter(d => d.type === MenuType.MENU);
                // 顶层目录
                const dirs = des.filter(d => d.type === MenuType.DIRECTORY);
                
                // 含有permission menu
                if (leafs.length > 0) {
                    // 菜单树中叶子节点的权限名称
                    const names = leafs.map(leaf => leaf.p.name);
                    // 用户在当前菜单树中具有的权限
                    const res: string[] = [];
                    // 遍历所有用户权限，去滤掉第三层
                    for (const p of pNames) {
                        if (names.includes(p)) res.push(p);
                    }

                    // 删掉
                    if (res.length > 0) {
                        leafs = leafs.filter(leaf => res.includes(leaf.p.name))
                        // 根据数组重建
                        const nRoot = omit(dirs[0], ['parent']);
                        nRoot.children = [];
                        for (const m of ms) {
                            // 第一层与第二层
                            const nM = omit(m, ['parent']);
                            nM.children = [];
                            nRoot.children.push(nM as any);
                            // 恢复第二层与第三层
                            for (const l of leafs) {
                                if (l.parent.id === m.id) {
                                    const nL = omit(l, ['parent', 'children']);
                                    nM.children.push(nL as any)
                                }
                            }
                        }

                        menus.push(nRoot as any);
                    }  
                }
            }
            entity.menus = menus;
        }

        // 处理头像
        entity.avatarSrc = env("DEFAULT_AVATAR");
        if (!isNil(entity.avatar)) {
            if (entity.avatar.isThird) {
                entity.avatarSrc = entity.avatar.thirdSrc
            } else {
                entity.avatarSrc = this.genAvatarSrc(entity.avatar.key);
            }
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
        const prefix = env("COS_URL_AVATAR_PREFIX");
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
