import { boot } from '@/modules/utils/app';
import { creator } from './creator';
import { RestfulFactory } from './modules/restful/factory';
import { echoApi } from './modules/restful/helpers';

// 启动创建出的app
boot(creator, ({ app, configure }) => async () => {
    const rest = app.get(RestfulFactory)
    echoApi(configure, rest)
});


