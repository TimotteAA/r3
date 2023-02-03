import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { SAVE_MESSAGE_QUEUE, SaveMessageQueueJob } from "@/modules/utils";
import { Queue } from "bullmq";
import { MessageWorker } from "./message.worker";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class MessageJob {
  constructor(
    @InjectQueue(SAVE_MESSAGE_QUEUE) protected queue: Queue,
    protected worker: MessageWorker
  ) {
    this.worker.addWorker()
  }

  async saveMessage(data: SaveMessageQueueJob) {
    try {
      await this.queue.add("save-message", data)
    } catch (err: any) {
      throw new WsException(err);
    } 
    return { result: true }
  }
}