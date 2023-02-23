import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';

import { Configure } from '@/modules/core/configure';

/**
 * google oauth策略
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "github") {
    constructor(protected configure: Configure) {
        super({
            clientID: configure.env("GITHUB_CLIENT_ID"),
            clientSecret: configure.env("GITHUB_CLIENT_SECRET"),
            callbackURL: configure.env("GITHUB_CALLBACK_URL"),
            scope: ['user']
        })
    }
}