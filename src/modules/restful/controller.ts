import { Body, Get, Post, Delete, Patch, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ServiceListQueryParams } from '@/modules/core/types';
import { DeleteDto, ListQueryDto, QueryDetailDto, RestoreDto } from '@/modules/restful/dto';

export abstract class BaseController<S, P extends ServiceListQueryParams<any> = ServiceListQueryParams<any>> {
    protected service: S;

    constructor(service: S) {
        this.service = service;
    }

    @Get()
    async list(@Query() params:  P & ListQueryDto) {
        return (this.service as any).paginate(params);
    }

    @Get(':id')
    async detail(@Param('id', new ParseUUIDPipe()) id: string, @Query() options: QueryDetailDto) {
        return (this.service as any).detail(id, options.trashed);
    }

    @Post()
    async create(@Body() data: any, ...args: any[]) {
        return (this.service as any).create(data, ...args);
    }

    @Patch()
    async update(@Body() data: any, ...args: any[]) {
        return (this.service as any).update(data);
    }

    @Delete()
    async delete(@Body() options: DeleteDto) {
        return (this.service as any).delete(options.ids, options.trashed);
    }

    // /**
    //  * 批量删除
    //  * @param options 
    //  * @param param1 
    //  * @param args 
    //  */
    // @Delete()
    // async deleteMulti(
    //     @Query()
    //     options: PaginateOptions & TrashedDto & P,
    //     @Body()
    //     { trashed, ids }: DeleteDto,
    //     ...args: any[]
    // ) {
    //     return (this.service as any).deletePaginate(ids, options, trashed);
    // }

    // @Patch('restore/:item')
    // async restore(
    //     @Param('item', new ParseUUIDPipe())
    //     item: string,
    //     ...args: any[]
    // ) {
    //     return (this.service as any).restore(item);
    // }

    // @Patch('restore')
    // async restore(
    //     @Query()
    //     options: PaginateOptions & TrashedDto & P,
    //     @Body()
    //     { ids }: RestoreDto,
    //     ...args: any[]
    // ) {
    //     return (this.service as any).restore(ids, options);
    // }

    @Patch('restore')
    async restore(
        @Body()
        { ids }: RestoreDto,
        ...args: any[]
    ) {
        return (this.service as any).restore(ids);
    }
}
