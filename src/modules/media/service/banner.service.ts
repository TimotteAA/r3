import { Injectable } from "@nestjs/common"
import { isNil } from "lodash"
import { In } from "typeorm"

import { BannerRepository, MediaRepository } from "../repositorys"
import { BannerEntity } from "../entities"
import { BaseService } from "@/modules/database/crud"
import { CreateBannerDto, UpdateBannerDto } from "../dtos"

@Injectable()
export class BannerService extends BaseService<BannerEntity, BannerRepository> {
    constructor(protected repo: BannerRepository,
        protected mediaRepo: MediaRepository
    ) {
        super(repo)
    }

    async create(data: CreateBannerDto): Promise<BannerEntity> {
        const { image, ...rest } = data;
        console.log("image", await this.mediaRepo.findOneByOrFail({id: image}))
        return this.repo.save({
            ...rest,
            image: await this.mediaRepo.findOneByOrFail({id: image})
        })
    }

    async update(data: UpdateBannerDto) {
        const { image, ...rest } = data;
        await this.repo.update(rest.id, rest);

        const oldItem = await this.repo.findOneOrFail({
            where: {
                id: rest.id
            },
            relations: ['image']
        });
        if (!isNil(image)) {
            // 更新image
            if ((!isNil(oldItem.image) && oldItem.image.id !== image) || isNil(oldItem.image)) {
                // 干掉老的
                if (!isNil(oldItem.image)) await this.mediaRepo.remove(oldItem.image);
                // 保存新的
                const newImage = await this.mediaRepo.findOneByOrFail({id: image});
                newImage.banner = oldItem;
                await newImage.save()
            }
        }

        return this.detail(oldItem.id);
    }

    async delete(ids: string[], trash?: boolean): Promise<BannerEntity[]> {
        const items = await this.repo.find({
            where: { id: In(ids) as any },
            withDeleted: this.enable_trash ? true : undefined,
            relations: ['image']
        });
        const toDels = [];
        for (const item of items) {
            // console.log("item", item.image);
            if (!isNil(item.image)) toDels.push(item.image);
        }

        if (toDels.length > 0) {
            await this.mediaRepo.remove(toDels);
        }

        return this.repo.remove(items);
        // return super.delete(ids, false);
    }
}