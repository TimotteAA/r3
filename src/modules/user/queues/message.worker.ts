import { Injectable } from "@nestjs/common";
import { Job, Worker } from "bullmq";
import { SAVE_MESSAGE_QUEUE, SaveMessageQueueJob } from "@/modules/utils";
import { MessageRepository } from "../repositorys";

@Injectable()
export class MessageWorker {
  constructor(
    protected messageRepository: MessageRepository
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

  }
}