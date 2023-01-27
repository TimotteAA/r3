import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClassToPlain } from '@/modules/utils';
import { UserEntity } from '../entities';

export const User = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ClassToPlain<UserEntity>;
});
