import { ModuleMetadata } from '@nestjs/common';
import { PostService, SanitizeService, CommentService, CategoryService, ElasticSearchService, EventsService } from './services';
import { DatabaseModule } from '../database/database.module';
import { PostRepository, CategoryRepository, CommentRepository } from './repositorys';
import * as subscribeMaps from './subscribers';
import { PostEntity, CategoryEntity, CommentEntity } from './entities';
import { UserModule } from '../user/user.module';
import { ContentConfig } from './types';
import { UserService } from '../user/services';
import { ContentRbac } from './rbac';
import { addEntities, addSubscribers } from '../database/helpers';
import { ModuleBuilder } from '../core/decorators';


@ModuleBuilder(async (configure) => {
    const config = await configure.get<ContentConfig>("content")

    const imports: ModuleMetadata['imports'] = [
        DatabaseModule.forRepository([PostRepository, CategoryRepository, CommentRepository]),
        (await addEntities(configure, [PostEntity, CategoryEntity, CommentEntity])),
        UserModule,
    ];

    const exports: ModuleMetadata['exports'] = [
        DatabaseModule.forRepository([PostRepository]),
        PostService,
        ElasticSearchService,
        CommentService,
        CategoryService,
        EventsService,
        ...Object.values(subscribeMaps)
    ];

    // const controllers: ModuleMetadata['controllers' ] = [...Object.values(controllerMaps), ...Object.values(manageMaps)]

    const providers: ModuleMetadata['providers'] = [
        SanitizeService, 
        CommentService, 
        CategoryService,
        EventsService,
        ElasticSearchService, 
        ContentRbac,
        {
            provide: PostService,
            inject: [
                PostRepository,
                CategoryRepository,
                CategoryService,
                UserService,
                { token: ElasticSearchService, optional: true },
            ],
            useFactory(
                postRepository: PostRepository,
                categoryRepository: CategoryRepository,
                categoryService: CategoryService,
                userService: UserService,
                searchService?: ElasticSearchService,
            ) {
                return new PostService(
                    postRepository,
                    categoryRepository,
                    categoryService,
                    userService,
                    searchService,
                    config.searchType,
                );
            },
        },
        ...await addSubscribers(configure, Object.values(subscribeMaps))
    ]

    return {
        // module: ContentModule,
        imports,
        // controllers,
        providers,
        exports
    }
})
export class ContentModule {
}
