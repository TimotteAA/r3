import { Controller, Get, ParseUUIDPipe, Query, Param, Delete, SerializeOptions, Body, Patch } from "@nestjs/common";
import { In } from "typeorm";

import { MessageService } from "../services";
import { User } from "../decorators";
import { ClassToPlain } from "@/modules/utils";
import { RecevierActionType } from "../constants";
import { UserEntity } from "../entities";
import { QueryOwnerMessageDto, QueryReciveMessageDto, UpdateReceviesDto } from "../dto";
import { checkOwner } from "@/modules/rbac/helpers";
import { PermissionChecker } from "@/modules/rbac/types";
import { MessageRepository } from "../repositorys";
import { Permission } from "@/modules/rbac/decorators";

const senderChecker: PermissionChecker = async (ab, ref, request) => 
  checkOwner(ab, async (ids) => 
    ref.get(MessageRepository, {strict: false}).find({
      where: {
        id: In(ids)
      },
      relations: ['sender']
    }),
    request,
    "sended-message"
  )
  
const recevierChecker: PermissionChecker = async (ab, ref, request) => 
  checkOwner(ab, async (ids) => 
    ref.get(MessageRepository, {strict: false}).find({
      where: {
        id: In(ids)
      },
      relations: ['receives.receiver']
    }),
    request,
    "recevied-message"
  )

@Controller("api/messages")
export class MessageController {
  constructor(protected messageService: MessageService) {}

  /**
   * 读取发送到的消息列表
   */
  // @Permission(senderChecker) 此处不能加，没有消息的id
  @Get("sendeds")
  async list(@User() user: ClassToPlain<UserEntity>, @Query() options: QueryOwnerMessageDto) {
    return this.messageService.paginate({...options, sender: user.id} as any)
  }

  /**
   * 查看某条发送的消息
   * @param user 
   * @param options 
   */
  @Permission(senderChecker)
  @Get("sendeds/:item")
  async sended(
    @Param("item", new ParseUUIDPipe()) 
    item: string
  ) {
    return this.messageService.detail(item, false)
  }

  /**
   * 发送者删除已发送的消息
   * @param user
   * @param item
   */
  @Permission(senderChecker)
  @Delete('sendeds/:item')
  @SerializeOptions({
      groups: ['message-detail'],
  })
  async deleteSended(
      @User() user: ClassToPlain<UserEntity>,
      @Param('item', new ParseUUIDPipe()) item: string,
  ) {
      return this.messageService.deleteSended(item, user.id);
  }

  /**
   * 发送者批量删除已发送的消息
   * @param user
   * @param data
   * @param query
   */
  @Permission(senderChecker)
  @Delete('sendeds')
  @SerializeOptions({
      groups: ['message-list'],
  })
  async deleteSendeds(
      @User() user: ClassToPlain<UserEntity>,
      @Body() data: UpdateReceviesDto,
      @Query() query: QueryOwnerMessageDto,
  ) {
      return this.messageService.deleteSendeds(data, user.id, query);
  }

  /**
   * 查看接受到的消息列表
   */
  @Get("receives")
  async sender(
    @User() user: ClassToPlain<UserEntity>, @Query() options: QueryOwnerMessageDto
  ) {
    return this.messageService.paginate({...options, receiver: user.id} as any);
  }

  /**
   * 设置收到的消息为已读
   * @param user 
   * @param item 
   */
  @Permission(recevierChecker)
  @Get("readed/:item")
  @SerializeOptions({
    groups: ['message-detail']
  })
  async readed(
    @User() user: ClassToPlain<UserEntity>,
    @Param('item', new ParseUUIDPipe()) item: string,
  ) {
    return this.messageService.updateReceive(item, RecevierActionType.READED, user.id)
  }

  /**
   * 批量设置收到的消息为已读
   * @param user 
   * @param item 
   */
  @Permission(recevierChecker)
  @Patch("readed")
  @SerializeOptions({
    groups: ['message-list']
  })
  async readedMulti(
    @User() user: ClassToPlain<UserEntity>,
    @Body() data: UpdateReceviesDto,
    @Query() query: QueryReciveMessageDto
  ) {
    return this.messageService.updateReceviesPaginate(data, RecevierActionType.READED, user.id, query)
  }

  /**
   * 接收者删除一条收到的消息
   * @param user 
   * @param item 
   */
  @Permission(recevierChecker)
  @Delete("receives/:item")
  @SerializeOptions({
    groups: ['message-detail'],
  })
  async deleteRecevie(
      @User() user: ClassToPlain<UserEntity>,
      @Param('item', new ParseUUIDPipe()) item: string,
  ) {
      return this.messageService.updateReceive(item, RecevierActionType.DELETE, user.id);
  }

  /**
  //  * 接收者批量删除收到的消息
  //  * @param user 
  //  * @param item 
  //  */
  @Permission(recevierChecker)
  @Delete("receives")
  @SerializeOptions({
    groups: ['message-detail'],
  })
  async deleteReceviePaginate(
      @User() user: ClassToPlain<UserEntity>,
      @Body() data: UpdateReceviesDto,
      @Query() query: QueryOwnerMessageDto
  ) {
    return this.messageService.updateReceviesPaginate(data, RecevierActionType.DELETE, user.id, query);
  }
} 