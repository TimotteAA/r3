import { ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validateOrReject } from 'class-validator';
import { CredentialDto } from '../dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        try {
            // 类似于pipe，先将普通js对象序列化，然后校验
            await validateOrReject(plainToClass(CredentialDto, request.body), {
                validationError: {
                    target: false,
                },
            });
        } catch (errors) {
            const messages = (errors as any[])
                .map((err) => err.constraints ?? {})
                .reduce((n, o) => ({ ...n, ...o }), {});
            throw new BadRequestException(Object.values(messages));
        }
        console.log(1231231)
        try {
            const res = await super.canActivate(context) as boolean;
            console.log('res', res);
            
        } catch (err) {
            console.log("error", err)
        }
        return true;
    }
}
