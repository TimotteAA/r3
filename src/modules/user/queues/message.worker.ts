import { Injectable } from "@nestjs/common";
import { Job, Worker } from "bullmq";
import { isNil } from "lodash";
import chalk from "chalk";
import { SAVE_MESSAGE_QUEUE } from "../constants";
import { SaveMessageQueueJob } from "../types"
import { MessageReceiveRepository, MessageRepository, UserRepository } from "../repositorys";
import { MessageEntity, MessageReceiveEntity } from "../entities";

@Injectable()
export class MessageWorker {
  constructor(
    protected messageRepository: MessageRepository,
    protected userRepository: UserRepository,
    protected receiveRepository: MessageReceiveRepository
  ) {}

  addWorker() {
    return new Worker(SAVE_MESSAGE_QUEUE, 
        async (job: Job<SaveMessageQueueJob>) => {
          this.saveMessage(job)
        },
        {
          concurrency: 10
        }
      )
  }

  protected async saveMessage(job: Job<SaveMessageQueueJob>) {
    const { body, receivers, sender, title, type } =  job.data;
    try {
      const message = new MessageEntity();
      message.body = body;
      if (!isNil(title)) message.title = title;
      if (!isNil(type)) message.type = type;
      message.sender = await this.userRepository.findOneByOrFail({id: sender});
      // 先保存一下
      await message.save({reload: true});
      // 创建中间表实例
      const receives = await Promise.all(receivers.map(async (receiver) => {
        // 接收者id
        const messageReceive = new MessageReceiveEntity();
        messageReceive.message = message;
        messageReceive.receiver = await this.userRepository.findOneByOrFail({id: receiver});
        await messageReceive.save();
        return messageReceive;
      }))
      await this.receiveRepository.save(receives);
      message.receives = receives;
      await message.save({reload: true})
    } catch (err: any) {
      console.log(chalk.red(err));
      throw new Error(err)
    }
  }
}