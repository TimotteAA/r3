import { Controller, Get, Query} from "@nestjs/common";
import { MessageService } from "../services";
import { User } from "../decorators";
import { ClassToPlain } from "@/modules/utils";
import { UserEntity } from "../entities";
import { QueryOwnerMessageDto } from "../dto";

@Controller("messages")
export class MessageController {
  constructor(protected messageService: MessageService) {}

  /**
   * 读取发送到的消息列表
   */
  @Get("sendeds")
  async list(@User() user: ClassToPlain<UserEntity>, @Query() options: QueryOwnerMessageDto) {
    return this.messageService.paginate({...options, sender: user.id} as any)
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

  
} 