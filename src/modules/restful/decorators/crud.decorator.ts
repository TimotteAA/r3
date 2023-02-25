/* eslint-disable new-cap */
import { Type} from '@nestjs/common';
import { BaseController } from '../controller';

import { CRUD_OPTIONS_REGISTER } from '../constants';
import { CrudOptionsRegister } from '../types';

export const Crud =
    (factory: CrudOptionsRegister) =>
    <T extends BaseController<any>>(Target: Type<T>) => {
        Reflect.defineMetadata(CRUD_OPTIONS_REGISTER, factory, Target);
    };
