import { UserEntity } from '../entities';
import { UserRepository } from '../repositorys';
import { BaseService } from '@/modules/core/crud';
import { Injectable } from '@nestjs/common';
import { QueryHook } from '@/modules/database/types';
import { isNil, omit } from 'lodash';
import { EntityNotFoundError } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
    constructor(protected repo: UserRepository) {
        super(repo);
    }

    async create(data: CreateUserDto): Promise<UserEntity> {
        const res = await this.repo.save(data);
        return omit(res, 'password') as UserEntity;
    }

    async update(data: UpdateUserDto) {
        // id字段不更新
        const rest = omit(data, 'id');
        await this.repo.update(data.id, rest);
        return this.detail(data.id);
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
            .getOne();
    }

    async findOneByCondition(condition: Record<string, any>, callback?: QueryHook<UserEntity>) {
        let qb = this.repo.buildBaseQuery();
        qb = callback ? await callback(qb) : qb;
        // 遍历key与value，拼接where的查询条件
        const wheres = Object.fromEntries(
            Object.entries(condition).map(([key, value]) => [`user.${key}`, value]),
        );
        const user = await qb.where(wheres).getOne();
        if (isNil(user)) throw new EntityNotFoundError(UserEntity, 'user not found');
        return user;
    }
}