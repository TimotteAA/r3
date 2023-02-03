import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "@/modules/core/crud";
import { MessageEntity } from "../entities";
import { MessageRepository, MessageReceiveRepository } from "../repositorys";
import { isNil, omit } from "lodash";
import { UpdateReceviesDto, QueryOwnerMessageDto, QueryMessageDto } from "../dto";
import { In } from "typeorm";
import { RecevierActionType } from "@/modules/utils";

@Injectable()
export class MessageService extends BaseService<MessageEntity, MessageRepository> {
  constructor(protected messageRepo: MessageRepository,
      protected receiveRepo: MessageReceiveRepository
    ) {
    super(messageRepo);
  }

  /**
   * 删除已发送的消息
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
    return this.paginate({ ...options, addQuery: (qb) => qb.andWhere('sender.id = :id', {id: userId}) });
  }

  
  /**
   * 更改接收数据
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

    // 最后返回的是关联上sender属性
    // 然后关联receives，alias为receive，参数
    // 映射到receiver属性上
    // 先关联中间表，再关联
    return this.repo.buildBaseQuery()
            .leftJoinAndSelect(`${this.repo.getAlias()}.sender`, 'sender')
            .leftJoinAndMapOne(`${this.repo.getAlias()}.receiver`, 
            `${this.repo.getAlias()}.receives`,
            'receive',
            'receive.receiver = :receiver',
            {
              receiver: userId
            }
            ).leftJoin(`${this.repo.getAlias()}.recevies`, 'recevies')
            .andWhere('receives.receiver', {
              receiver: userId
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
        return this.paginate({ ...options, recevier: userId } as any);
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
      }
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
}