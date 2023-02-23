import { Injectable, UsePipes, UseFilters, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, WsResponse } from "@nestjs/websockets";
import Redis from "ioredis";
import WebSocket, { Server } from "ws";

import { WsPipe, WsExceptionFilter } from "@/modules/core/providers"; 
import { AccessTokenEntity, MessageEntity, UserEntity } from "../entities";
import { getTime} from "@/modules/utils";
import { SaveMessageQueueJob } from "../types";
import { RedisService } from "@/modules/redis/services";
import { TokenService, UserService } from "../services";
import { MessageJob } from "../queues";
// import { JwtWsGuard } from "../guards/jwt-ws.guart";
import { RbacWsGuard } from "@/modules/rbac/guards";
import { WSAuthDto, WsMessageDto } from "../dto";
import { pick, isNil } from "lodash";
import { instanceToPlain } from "class-transformer";
import { SelectQueryBuilder } from "typeorm";
import { PermissionChecker } from "@/modules/rbac/types";
import { PermissionAction } from "@/modules/rbac/constants";
import { Permission } from "@/modules/rbac/decorators";

const permissions: PermissionChecker[] = [
  async (ab) => ab.can(PermissionAction.CREATE, MessageEntity.name)
]

/**
 * 返回给客户端的用户信息
 */
type User = Pick<ClassToPlain<UserEntity>, "id" | "username" | "nickname" | "email" | "phone">
/**
 * 在线的websocket用户
 */
interface Onliner {
  token: AccessTokenEntity;
  user: Partial<ClassToPlain<UserEntity>>;
  client: WebSocket
}

@Injectable()
@WebSocketGateway()
@UseFilters(WsExceptionFilter)
@UsePipes(
  new WsPipe({
    transform: true,
    // forbidUnknownValues: true,
    validationError: {
      target: false
    }
  })
)
export class WsMessageGateway {
  // redis客户端
  protected redisClient: Redis;
  // 在线的用户
  protected onliners: Onliner[] = [];

  constructor(
    protected redisServer: RedisService,
    protected tokenService: TokenService,
    protected userService: UserService,
    protected messageJob: MessageJob
  ) {
    this.redisClient = this.redisServer.getClient()
  } 

  get onLiners() {
    return this.onliners;
  }

  @WebSocketServer()
  server!: Server;

  @Permission(...permissions)
  @UseGuards(RbacWsGuard)
  @SubscribeMessage("online")
  async onLine(
    @MessageBody() data: WSAuthDto,
    @ConnectedSocket() client: WebSocket
  ) {
    // 查找传过来的token
    const token = await this.tokenService.findAccessToken(data.token);
    // 创建上线者
    const onliner: Onliner = { token, user: token.user, client };
    this.onliners.push(onliner);
    // 保存上线者的token到redis中
    await this.redisClient.sadd("online", token.value);
    // 其余的用户
    const onliners = this.onliners.filter(o => o.user.id !== token.user.id);
    onliners.forEach(({client: c}) => {
      c.send(
        JSON.stringify({
          type: "message",
          message: {
            body: `${token.user.username}上线啦`,
            sender: this.getUserInfo(token.user),
            timer: getTime().toString
          }
        })
      )
    });


    client.send(       
      JSON.stringify({
        type: "message",
        message: {
          body: `${token.user.username}，您已上线`,
          sender: this.getUserInfo(token.user),
          timer: getTime().toString
        }
    }))

    // 监听用户下线
    client.on("close", async () => {
      client.terminate();
      await this.handleOnfline(onliner)
    })
  }



    /**
     * 消息异常
     * @param data
     */
    @Permission(...permissions)
    @SubscribeMessage('exception')
    sendException(
        @MessageBody()
        data: {
            status: string;
            message: any;
        },
    ): WsResponse<Record<string, any>> {
        return { event: 'exception', data };
    }

  /**
   * websocket发送消息
   * @param data 
   */
  @Permission(...permissions)
  @UseGuards(RbacWsGuard)
  @SubscribeMessage("message")
  async sendMessage(
    @MessageBody() data: WsMessageDto
  ): Promise<any> {
    const { sender, receivers } = await this.getMessager(data);
    const receiversId = receivers.map(r => r.id);
    // 找到其中的上线用户
    const onliners = this.onliners.filter(o => receiversId.includes(o.user.id));
    
    // 异步存储消息
    const message: SaveMessageQueueJob = {
      title: data.title,
      body: data.body,
      type: data.type,
      sender: sender.id,
      receivers: data.receivers,
    }
    await this.messageJob.saveMessage(message);
    // 在线用户发送消息
    onliners.forEach(({client: c}) => {
      c.send(
        JSON.stringify(
          {
            type: "message",
            message: {
              ...pick(message, ['title', 'body', 'type']),
              sender: this.getUserInfo(sender),
              time: getTime().toString
            }
          }
        )
      )
    });
    return undefined;
  }

  /**
   * websocket主动下线
   * @param data 
   */
  @Permission(...permissions)
  @UseGuards(RbacWsGuard)
  @SubscribeMessage("offline")
  async offline(
    @MessageBody() data: WSAuthDto
  ) {
    const token = await this.tokenService.findAccessToken(data.token);
    // 从redis中删除token
    if (!isNil(token)) {
      const onliner = this.onliners.find(o => o.user.id === token.user.id);
      await this.handleOnfline(onliner);
    }
    return {
      event: "offline",
      data: this.getUserInfo(token.user)
    }
  }

  /**
   * 从ws消息体中获得发送者与接收者
   * @param data 
   */
  protected async getMessager(
    data: WsMessageDto
  ) {
    // 所有的接收者
    const receivers = await (await this.userService.list({
      addQuery(qb) {
        return qb.whereInIds(data.receivers)
      }
    }) as SelectQueryBuilder<UserEntity>).getMany();
    // token
    const token = await this.tokenService.findAccessToken(data.token);
    // 判断当前用户是否上线
    if (isNil(this.onliners.find(o => o.token.id === token.id))) {
      throw new WsException("你不在线上")
    }
    // 发送者
    const sender = token.user;
    // 从接收者列表中滤除自己
    return {
      sender,
      receivers: receivers.filter(r => r.id !== sender.id)
    }
  }

  /**
   * 处理用户下线
   * @param param
   */
  protected async handleOnfline({token}: Onliner) {
    // 删除用户的token
    await this.redisClient.srem("online", token.value);
    // 删除在线用户
    this.onliners = this.onLiners.filter(o => o.user.id !== token.user.id);
    // 发送下线消息
    this.onliners.forEach(({client: c}) => {
      c.send(
        JSON.stringify({
          type: "message",
          message: {
            body: token.user.username + "下线啦",
            time: getTime().toString(),
            sender: this.getUserInfo(token.user)
          }
        })
      )
    })
  }

  /**
   * 获得部分用户信息
   * @param user 
   */
  protected getUserInfo(user: UserEntity): User {
    return pick(instanceToPlain(user, { groups: ['user-detail'] }), ['id', 'email', 'phone', 'username', 'nickname']) as User
  }
}