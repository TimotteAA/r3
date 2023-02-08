import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { PostController, CommentController, CategoryController } from './controllers';
import { PostService, SanitizeService, CommentService, CategoryService, ElasticSearchService } from './services';
import { DatabaseModule } from '../database/database.module';
import { PostRepository, CategoryRepository, CommentRepository } from './repositorys';
import { PostSubscriber } from './subscribers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, CategoryEntity, CommentEntity } from './entities';
import { UserModule } from '../user/user.module';
import { ContentConfig } from './types';
import { UserService } from '../user/services';
import { ContentRbac } from './rbac';

@Module({})
export class ContentModule {
    static forRoot(options?: () => ContentConfig): DynamicModule {
        const config = options ? options() : {
            searchType: "like"
        } as ContentConfig;

        const imports: ModuleMetadata['imports'] = [
            DatabaseModule.forRepository([PostRepository, CategoryRepository, CommentRepository]),
            TypeOrmModule.forFeature([PostEntity, CategoryEntity, CommentEntity]),
            UserModule
        ];

        const exports: ModuleMetadata['exports'] = [
            DatabaseModule.forRepository([PostRepository]),
            PostService,
            PostSubscriber,
            ElasticSearchService,
            CommentService,
            CategoryService,
        ];

        const controllers: ModuleMetadata['controllers' ] = [PostController, CommentController, CategoryController]

        const providers: ModuleMetadata['providers'] = [
            SanitizeService, PostSubscriber, CommentService, CategoryService, ElasticSearchService, ContentRbac,
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
        ]

        return {
            module: ContentModule,
            imports,
            controllers,
            providers,
            exports
        }
    }
}
