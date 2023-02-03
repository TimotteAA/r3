import { Injectable, ExecutionContext} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { isNil } from "lodash";
import { TokenService } from "../services";

@Injectable()
export class JwtWsGuard {
  constructor(protected tokenService: TokenService) {}

  async canActivate(context: ExecutionContext) {
    const {token} = context.switchToWs().getData() || {};
    if (!token) {
      throw new WsException("没有access token");
    }
    const tokenDb = await this.tokenService.findAccessToken(token);
    if (isNil(tokenDb)) throw new WsException("access token无效");

    // websocket续期？

    const user = await this.tokenService.verifyAccessToken(tokenDb.value);
    return !isNil(user);
  }
}