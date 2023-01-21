import { Module } from '@nestjs/common';
import { PostController, CommentController, CategoryController } from './controllers';
import { PostService, SanitizeService, CommentService, CategoryService } from './services';

import { DatabaseModule } from '../database/database.module';
import { PostRepository, CategoryRepository, CommentRepository } from './repositorys';
import { PostSubscriber } from './subscribers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity, CategoryEntity, CommentEntity } from './entities';

@Module({
    imports: [
        DatabaseModule.forRepository([PostRepository, CategoryRepository, CommentRepository]),
        TypeOrmModule.forFeature([PostEntity, CategoryEntity, CommentEntity]),
    ],
    providers: [PostService, SanitizeService, PostSubscriber, CommentService, CategoryService],
    controllers: [PostController, CommentController, CategoryController],
    exports: [
        DatabaseModule.forRepository([PostRepository]),
        PostService,
        PostSubscriber,

        CommentService,
        CategoryService,
    ],
})
export class ContentModule {}
