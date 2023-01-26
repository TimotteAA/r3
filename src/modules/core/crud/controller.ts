import { PaginateOptions } from '@/modules/utils';
import { Body, Get, Post, Delete, Patch, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryListParams, TrashedDto } from '@/modules/utils';
import { DeleteDto, DeleteMultiDto, QueryDetailDto, RestoreMultiDto } from './dtos';

export abstract class BaseController<S, P extends QueryListParams<any> = QueryListParams<any>> {
    protected service: S;

    constructor(service: S) {
        this.service = service;
    }

    @Get()
    async list(@Query() params: PaginateOptions & P & TrashedDto) {
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

    @Delete(':id')
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @Query() options: DeleteDto) {
        return (this.service as any).delete(id, options.trashed);
    }

    @Delete()
    async deleteMulti(
        @Query()
        options: PaginateOptions & TrashedDto & P,
        @Body()
        { trashed, ids }: DeleteMultiDto,
        ...args: any[]
    ) {
        return (this.service as any).deletePaginate(ids, options, trashed);
    }

    @Patch('restore/:item')
    async restore(
        @Param('item', new ParseUUIDPipe())
        item: string,
        ...args: any[]
    ) {
        return (this.service as any).restore(item);
    }

    @Patch('restore')
    async restoreMulti(
        @Query()
        options: PaginateOptions & TrashedDto & P,
        @Body()
        { ids }: RestoreMultiDto,
        ...args: any[]
    ) {
        return (this.service as any).restorePaginate(ids, options);
    }
}
