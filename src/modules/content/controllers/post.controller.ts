import { Controller } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from '../dtos';
import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';

@Controller('posts')
@Crud({
    id: 'post',
    enabled: [
        {
            name: 'list',
            options: { allowGuest: true },
        },
        {
            name: 'detail',
            options: { allowGuest: true },
        },
        'update',
        'create',
        'delete',
    ],
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
