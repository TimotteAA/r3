import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "@/modules/database/crud";
import { MessageEntity } from "../entities";
import { MessageRepository, MessageReceiveRepository } from "../repositorys";
import { isNil, omit } from "lodash";
import { UpdateReceviesDto, QueryOwnerMessageDto, QueryMessageDto } from "../dto";
import { In, SelectQueryBuilder } from "typeorm";
import { QueryHook } from "@/modules/database/types";
import { ServiceListQueryParams } from "@/modules/database/types";
import { RecevierActionType } from "../constants";

@Injectable()
export class MessageService extends BaseService<MessageEntity, MessageRepository> {
  constructor(protected messageRepo: MessageRepository,
      protected receiveRepo: MessageReceiveRepository
    ) {
    super(messageRepo);
  }

  /**
   * 发送者删除已发送的消息
   * @param id 消息id
   * @param userId 当前用户id 
   */
  async deleteSended(id: string, userId: string) {
    const message = await this.messageRepo.findOne({
      where: {
        id,
        sender: {
          id: userId
        }
      },
      relations: ['sender', 'receives', 'receives.receiver']
    });
    if (isNil(message)) throw new BadRequestException(MessageEntity, "消息不存在");
    await this.repo.remove(message);
    return message;
  }

  /**
   * 批量删除已发送消息
   * @param data 
   * @param userId 
   * @param options 
   */
  async deleteSendeds(data: UpdateReceviesDto, userId: string, options?: QueryOwnerMessageDto) {
    const messages = await this.repo.find({
      where: {
        id: In(data.receives),
        sender: {
          id: userId
        }
      },
      relations: ['sender', 'receives', 'receives.receiver']
    });

    // 删除
    await this.repo.remove(messages);
    return this.paginate({ ...options, sender: userId } as any);
  }

  
  /**
   * 接收者更改接收数据
   * 删除消息接收者与消息的关联(即接收者删除该消息)/更改已读状态
   * @param id 消息ID
   * @param type 操作类型
   * @param userId 当前用户ID
   */
  async updateReceive(id: string, type: RecevierActionType, userId: string) {
    const receives = await this.updateRecevies([id], type, userId);
    if (receives.length <= 0) {
      throw new NotFoundException(MessageEntity, "消息不存在")
    }

    return this.repo.buildBaseQuery()
    .leftJoinAndSelect(
      `${this.repo.getAlias()}.receives`,
      "receives"
    ).leftJoinAndSelect('receives.receiver', "receiver")
      .leftJoinAndSelect(`${this.repo.getAlias()}.sender`, "sender")
      .andWhere(`message.id = :id`, {
        id: id
      }).getOne()
  }

  /**
   * 批量更改接收数据
   * 删除消息接收者与消息的关联(即接收者删除该消息)/更改已读状态
   * @param data 消息ID列表
   * @param type 操作类型
   * @param userId 当前用户ID
   * @param params 列表查询参数
   */
    async updateReceviesList(
      data: UpdateReceviesDto,
      type: RecevierActionType,
      userId: string,
      params: QueryMessageDto,
  ) {
      await this.updateRecevies(data.receives, type, userId);
      return this.list(omit(params, ['page', 'limit']) as any);
  }

    /**
     * 批量更改接收数据,返回分页后的消息列表
     * 返回分页后的消息列表，删除消息接收者与消息的关联(即接收者删除该消息)/更改已读状态
     * @param data 消息ID列表
     * @param type 操作类型
     * @param userId 当前用户ID
     * @param options 分页查询参数
     */
    async updateReceviesPaginate(
        data: UpdateReceviesDto,
        type: RecevierActionType,
        userId: string,
        options: QueryMessageDto,
    ) { 
      await this.updateRecevies(data.receives, type, userId);
      return this.paginate({ ...options, receiver: userId } as any);
    }


  /**
   * 更新接收者接收消息的状态
   * 更改成已读或者删除
   * @param id 
   * @param type 
   * @param userId 
   */
  protected async updateRecevies(data: string[], type: RecevierActionType, userId: string) {
    // 多对多的中间表记录情况
    const receives = await this.receiveRepo.find({
      where: {
        message: {
          id: In(data)
        },
        receiver: {
          id: userId
        }
      },
      relations: ['receiver', 'message']
    });
    for (const receive of receives) {
      if (type === RecevierActionType.READED && !receive.readed) {
        receive.readed = true;
        await receive.save({ reload: true });
      }
      if (type === RecevierActionType.DELETE) {
        // 删除该记录
        // 原来5条的，现在变成了四条
        this.receiveRepo.remove(receive);
      }
    }
    return receives;
  }

  /**
   * 
   * @param qb 
   * @param callback 
   */
  protected buildItemQuery(qb: SelectQueryBuilder<MessageEntity>, callback?: QueryHook<MessageEntity>): Promise<SelectQueryBuilder<MessageEntity>> {
    qb = qb.leftJoinAndSelect(`${this.repo.getAlias()}.sender`, 'sender')
    .leftJoinAndSelect(`${this.repo.getAlias()}.receives`, 'receives')
    .leftJoinAndSelect('receives.receiver', "receiver")
    return super.buildItemQuery(qb, callback);
  }

  protected buildListQuery(qb: SelectQueryBuilder<MessageEntity>, 
    options?: ServiceListQueryParams<MessageEntity> & {
      readed?: boolean,
      receiver?: string;
      sender?: string;
    }, 
    callback?: QueryHook<MessageEntity>): Promise<SelectQueryBuilder<MessageEntity>> {
    return super.buildListQuery(qb, options, async (q) => {
      // console.log("options", options);
      // q.leftJoinAndSelect(`${this.repo.getAlias()}.sender`, 'sender');
      if (!isNil(options.receiver)) {
        q.leftJoinAndSelect(`${this.repo.getAlias()}.sender`, 'sender')
          .leftJoinAndSelect(`${this.repo.getAlias()}.receives`, 'receives')
          .leftJoinAndSelect('receives.receiver', "receiver")
          .andWhere("receiver.id = :id", { id: options.receiver })
      } else if (!isNil(options.sender))  {
        // 作为发送者
        q.leftJoinAndSelect(
          `${this.repo.getAlias()}.receives`,
          "receives"
        ).leftJoinAndSelect('receives.receiver', "receiver")
          .leftJoinAndSelect(`${this.repo.getAlias()}.sender`, "sender")
          q.andWhere(`sender.id = :sender`, {
            sender: options.sender
          })
      } else {
        q.leftJoinAndSelect(`${this.repo.getAlias()}.sender`, 'sender')
        .leftJoinAndSelect(`${this.repo.getAlias()}.receives`, 'receives')
        .leftJoinAndSelect('receives.receiver', "receiver")
      }
      // console.log(q.getQuery());
      if (typeof options.readed === "boolean") {
        q.andWhere(`receives.readed = :readed`, {
          readed: options.readed
        })
      }
      return q;
    })
  }
}