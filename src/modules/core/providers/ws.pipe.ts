import { WsException } from "@nestjs/websockets";
import { ArgumentMetadata, Injectable } from "@nestjs/common";
import { AppPipe } from "./app.pipe";

/**
 * 抛出专门的WsException
 */
@Injectable()
export class WsPipe extends AppPipe {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      return super.transform(value, metadata);
    } catch (err: any) {
      const error = err.response ?? err;
      throw new WsException(error);
    }
  }
}