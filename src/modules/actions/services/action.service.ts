import { Injectable } from "@nestjs/common";
import { isNil } from "lodash";
import { SelectQueryBuilder } from "typeorm";

import { BaseService } from "@/modules/database/crud";
import { ActionEntity } from "../entities";
import { ActionRepository } from "../repositorys";
import { CreatePostActionDto, CreateCommentActionDto } from "../dtos";
import { UserService } from "@/modules/user/services";
import { PostService } from "@/modules/content/services";
import { MessageJob } from "@/modules/user/queues";
import { TypeAction, TypeStuff } from "../constants";
import { CommentRepository } from "@/modules/content/repositorys";
import { QueryHook } from "@/modules/database/types";
import { QueryActionDto } from "../dtos/manage/action.dto";

type FindParams = Omit<QueryActionDto, 'page' | 'limit'>

@Injectable()
export class ActionService extends BaseService<ActionEntity, ActionRepository, FindParams> {
    constructor(
        protected repo: ActionRepository,
        protected userService: UserService,
        protected postService: PostService,
        protected commentRepo: CommentRepository,
        protected messageJob: MessageJob    
    ) {
        super(repo)
    }

    delete(ids: string[], trash?: boolean): Promise<ActionEntity[]> {
        return super.delete(ids, false)
    }

    /**
     * 点赞、讨厌文章
     * @param data 
     * @param id 
     */
    async actionPost(data: CreatePostActionDto, id: string) {
        const { post, actionType } = data;
        // 点赞或者讨厌的人
        const user = await this.userService.findOneByCondition({id});

        // 根据文章id与用户id查询是否存在老的记录，如果存在则更新
        const oAction = await this.repo.findOne({
            where: {
                stuffType: TypeStuff.POST,
                stuffId: post,
                user: {
                    id
                }
            }
        });
        if (!isNil(oAction)) {
            await this.repo.update(oAction.id, {
                actionType: actionType
            })
        } else {
            // 插入记录
            await this.repo.save({ 
                user, 
                stuffId: post,
                stuffType: TypeStuff.POST,
                actionType: actionType
            })
        }

        // if (actionType === TypeAction.UP) {
        //     // 发送消息：xxx点赞了您的文章
        //     const p = await this.postService.detail(post);
        //     await this.messageJob.saveMessage({
        //         sender: id,
        //         body: `${user.nickname ?? user.username}点赞了您的文章${p.title}`,
        //         title: "点赞",
        //         type: actionType,
        //         receivers: [
        //             p.author.id
        //         ]
        //     })
        // }

        // 返回文章详情
        return this.postService.detail(data.post);
    }

    /**
     * 点赞、讨厌评论
     * @param data 
     * @param id 
     */
    async actionComment(data: CreateCommentActionDto, id: string) {
        const { comment, actionType } = data;
        // 点赞或者讨厌的人
        const user = await this.userService.findOneByCondition({id});

        // 根据评论id与用户id查询是否存在老的记录，如果存在则更新
        const oAction = await this.repo.findOne({
            where: {
                stuffType: TypeStuff.COMMENT,
                stuffId: comment,
                user: {
                    id
                }
            }
        });
        if (!isNil(oAction)) {
            await this.repo.update(oAction.id, {
                actionType: actionType
            })
        } else {
            // 插入新的记录
            await this.repo.save({ 
                user, 
                stuffId: comment,
                stuffType: TypeStuff.COMMENT,
                actionType: actionType
            })
        }

        if (actionType === TypeAction.UP) {
            // 发送消息：xxx点赞了您的评论
            const c = await this.commentRepo.findOneOrFail({
                where: {
                    id: comment
                },
                relations: ['author']
            });
            await this.messageJob.saveMessage({
                sender: id,
                body: `${user.nickname ?? user.username}点赞了您的评论`,
                title: "点赞",
                type: actionType,
                receivers: [
                    c.author.id
                ]
            })
        }

        // 返回文章详情
        return this.commentRepo.findOne({
            where: {
                id: comment
            },
            relations: ['author']
        });
    }

    protected buildListQuery(qb: SelectQueryBuilder<ActionEntity>, options: FindParams, callback?: QueryHook<ActionEntity>) {
        const { action, stuffType } = options;
        if (!isNil(action)) {
            qb = qb.andWhere(`${this.repo.getAlias()}.actionType = :action`, {
                action
            })
        }
        if (!isNil(stuffType)) {{
            qb = qb.andWhere(`${this.repo.getAlias()}.stuffType = :stuffType`, {
                stuffType
            })
        }};
        return super.buildListQuery(qb, options, callback)
    }
}