import { UserEntity } from '../entities';
import { UserRepository } from '../repositorys';
import { BaseService } from '@/modules/core/crud';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryHook } from '@/modules/utils';
import { isBoolean, isNil, omit } from 'lodash';
import { EntityNotFoundError, SelectQueryBuilder } from 'typeorm';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from '../dto';
import { decrypt } from "../helpers";
import { SystemRoles } from '@/modules/rbac/constants';
import { PermissionRepository, RoleRepository } from '@/modules/rbac/repository';
 
type FindParams = Omit<QueryUserDto, "limit" | 'page'>

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
    constructor(protected repo: UserRepository,
        protected roleRepo: RoleRepository,
        protected permissionRepo: PermissionRepository    
    ) {
        super(repo);
    }

    async create(data: CreateUserDto): Promise<UserEntity> {
        const { roles, permissions, ...rest } = data;
        const res = await this.repo.save(rest);

        if (!isNil(roles) && roles.length > 0) {
            await this.repo.createQueryBuilder("user")
                    .relation(UserEntity, "roles")
                    .of(res)
                    .add(roles)
        }

        
        if (!isNil(permissions) && permissions.length > 0) {
            await this.repo.createQueryBuilder("user")
                    .relation(UserEntity, "permissions")
                    .of(res)
                    .add(permissions)
        }

        const user = await this.detail(res.id);
        await this.syncActived(user);
        return this.detail(user.id);
    }

    async update(data: UpdateUserDto) {
        // id字段不更新
        const { roles, permissions, ...rest } = data;;
        await this.repo.update(data.id, omit(rest, "id") as any);

        const user = await this.detail(data.id);
        
        if (!isNil(roles) && roles.length > 0) {
            await this.repo.createQueryBuilder("user")
                    .relation(UserEntity, "roles")
                    .of(user)
                    .addAndRemove(
                        roles ?? [],
                        user.roles ?? []
                    )
        }

        
        if (!isNil(permissions) && permissions.length > 0) {
            await this.repo.createQueryBuilder("user")
                    .relation(UserEntity, "permissions")
                    .of(user)
                    .addAndRemove(
                        permissions ?? [],
                        user.permissions ?? []
                    )
        }

        const res = await this.detail(user.id);
        await this.syncActived(res);
        return this.detail(res.id);
    }

    /**
     * 根据邮箱或用户名查询用户
     * @param credential
     * @param callback
     * @returns
     */
    async findOneByCredential(
        credential: string,
        callback?: QueryHook<UserEntity>,
    ): Promise<UserEntity> {
        let qb = this.repo.buildBaseQuery();
        qb = callback ? await callback(qb) : qb;
        return qb
            .where(`${this.repo.getAlias()}.username = :credential`, {
                credential,
            })
            .orWhere(`${this.repo.getAlias()}.email = :credential`, {
                credential,
            })
            .orWhere(`${this.repo.getAlias()}.phone = :credential`, {
                credential,
            })
            .getOne();
    }

    async findOneByCondition(condition: Record<string, any>, callback?: QueryHook<UserEntity>) {
        let qb = this.repo.buildBaseQuery();
        qb = callback ? await callback(qb) : qb;
        // console.log(condition);
        // 遍历key与value，拼接where的查询条件
        // const wheres = Object.fromEntries(
        //     Object.entries(condition).map(([key, value]) => [`user.${key}`, value]),
        // );

        const keys = Object.keys(condition);
        if (!isNil(keys) && keys.length) {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (i === 0) {
                    qb = qb.where(`${this.repo.getAlias()}.${key} = :key`, {
                        key: condition[key]
                    })
                } else {
                    qb = qb.andWhere(`${this.repo.getAlias()}.${key} = :key`, {
                        key: condition[key]
                    })
                }
            }
        }

        // console.log("wheres", wheres);
        // const user = await qb.where(wheres).getOne();
        const user = await qb.getOne();
        if (isNil(user)) throw new EntityNotFoundError(UserEntity, 'user not found');
        return user;
    }

    /**
     * 更新用户密码
     * @param id 
     * @param oldPassword 
     * @param newPassword 
     */
    async updatePassword(id: string, oldPassword: string, newPassword: string) {
        const user = await this.findOneByCondition({id})
        if (!decrypt(oldPassword, user.password)) {
            throw new BadRequestException(UserEntity, "旧密码输入错误");
        }
        // 更新密码
        user.password = newPassword;
        await user.save();
        return this.detail(user.id);
    }


    protected async syncActived(user: UserEntity) {
        const roleRelation = this.repo.createQueryBuilder()
            .relation('roles')
            .of(user);
        const permissionRelation = this.repo.createQueryBuilder()
            .relation("permissions")
            .of(user)
        // 激活的用户
        if (user.actived) {
            const roleNames = (user.roles ?? []).map(item => item.name);
            // 是否没有角色
            const noRoles = roleNames.length <= 0 ||    
                (!roleNames.includes(SystemRoles.ADMIN) && !roleNames.includes(SystemRoles.USER));
            const isSuperAdmin = roleNames.includes(SystemRoles.ADMIN);
            
            if (noRoles) {
                // 分配普通角色
                const customRole = await this.roleRepo.findOne({
                    where: {
                        name: SystemRoles.USER
                    },
                    relations: ['users']
                });
                if (!isNil(customRole)) await roleRelation.add(customRole)
            } else if (isSuperAdmin) {
                // 分配超级管理员角色
                const adminRole = await this.roleRepo.findOne({
                    where: {
                        name: SystemRoles.ADMIN
                    },
                    relations: ['users']
                });
                if (!isNil(adminRole)) await roleRelation.addAndRemove(adminRole, user.roles)
            }
        } else {
            // 没有激活的用户，删除所有权限与角色
            await roleRelation.remove((user.roles ?? []).map(item => item.id));
            await permissionRelation.remove((user.permissions ?? []).map(item => item.id))
        }
    }

    /**
     * 用于分页查询
     * @param qb 
     * @param options 
     * @param callback 
     */
    protected async buildListQuery(qb: SelectQueryBuilder<UserEntity>, options: FindParams, callback?: QueryHook<UserEntity>) {
        const alias = this.repo.getAlias();
        // 是否查询回收站
        // const { trashed } = options;
        const { orderBy, isActive } = options;
        if (!isNil(orderBy)) {
            qb = qb.orderBy(`${alias}.${orderBy}`, "ASC")
        }

        if (!isNil(isActive) && isBoolean(isActive)) {
            qb = qb.where(`${alias}.actived = :isActive`, { isActive })
        }

        // 额外查询，比如关联关系？
        qb = !isNil(callback) ? await callback(qb) : qb;
        qb = await super.buildListQuery(qb, options, callback);
        return qb;
    }
}
