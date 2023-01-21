import {
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
    Body,
    Query,
    ParseUUIDPipe,
    SerializeOptions,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from '../dtos';

@Controller('posts')
export class PostController {
    public constructor(private postService: PostService) {}

    @SerializeOptions({ groups: ['post-list'] })
    @Get()
    async index(
        @Query()
        options: QueryPostDto,
    ) {
        const res = await this.postService.paginate(options);
        return res;
    }

    @SerializeOptions({ groups: ['post-detail'] })
    @Get(':id')
    async show(@Param('id', new ParseUUIDPipe()) id: string) {
        const res = await this.postService.detail(id);
        return res;
    }

    @SerializeOptions({ groups: ['post-detail'] })
    @Post()
    async store(
        @Body()
        data: CreatePostDto,
    ) {
        const res = await this.postService.create(data);
        return res;
    }

    @SerializeOptions({ groups: ['post-detail'] })
    @Patch()
    async update(
        @Body()
        data: UpdatePostDto,
    ) {
        const res = await this.postService.update(data);
        return res;
    }

    @SerializeOptions({ groups: ['post-detail'] })
    @Delete(':id')
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.postService.delete(id);
    }
}
