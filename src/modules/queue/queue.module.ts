import { BullModule } from "@nestjs/bullmq";
import { omit } from "lodash";

import { ModuleBuilder } from "../core/decorators";
import { QueueConfig } from "./types";

@ModuleBuilder(async (configure) => {
    const queues = await configure.get<QueueConfig>("queue");
    return {
        global: true,
        imports: Array.isArray(queues) ?
            queues.map(queue => BullModule.forRoot(queue.name, omit(queue, ['name'])))
            : [BullModule.forRoot(queues)]
    }
})
export class QueueModule {}