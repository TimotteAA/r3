import { Controller } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from '../dtos';
import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';

@Controller('posts')
@Crud({
    id: 'post',
    enabled: ['list', 'update', 'create', 'delete', 'detail'],
    dtos: {
        query: QueryPostDto,
        create: CreatePostDto,
        update: UpdatePostDto,
    },
})
export class PostController extends BaseController<PostService> {
    public constructor(protected service: PostService) {
        super(service);
    }
}
