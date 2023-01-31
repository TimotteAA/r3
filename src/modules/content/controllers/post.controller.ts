import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from '../dtos';
import { BaseController } from '@/modules/core/crud';
import { Crud } from '@/modules/core/decorators';
import { User } from '@/modules/user/decorators';
import { ClassToPlain } from '@/modules/utils';
import { UserEntity } from '@/modules/user/entities';

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
@Controller('posts')
export class PostController extends BaseController<PostService> {
    public constructor(protected service: PostService) {
        super(service);
    }

    // 重写create方法
    @Post()
    async create(@Body() data: CreatePostDto, @User() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id)
    }
}
