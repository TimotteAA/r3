import { Injectable } from "@nestjs/common"
import { isNil } from "lodash"

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

    delete(ids: string[], trash?: boolean): Promise<BannerEntity[]> {
        return super.delete(ids, false)
    }
}