import { Faker } from "@faker-js/faker";

import { defineFactory } from "@/modules/database/helpers";
import { getTime } from "@/modules/utils";
import { CategoryEntity, CommentEntity, PostEntity } from "@/modules/content/entities";
import { UserEntity } from "@/modules/user/entities";
import { getUserConfig } from "@/modules/user/helpers";
import { UserConfig } from "@/modules/user/types";

export type IPostFactoryOptions = Partial<{
    title: string;
    summary: string;
    body: string;
    isPublished: boolean;
    categories: CategoryEntity[];
    comments: CommentEntity[];
    author?: ClassToPlain<UserEntity>
}>;

/**
 * 生成的假数据
 */
export const ContentFactory = defineFactory(
    PostEntity,
    async (faker: Faker, options: IPostFactoryOptions) => {
        faker.setLocale('zh_CN');
        const post = new PostEntity();
        const { title, summary, body, categories } = options;
        post.title = title ?? faker.lorem.sentence(Math.floor(Math.random() * 10) + 6);
        if (summary) {
            post.summary = options.summary;
        }
        post.body = body ?? faker.lorem.paragraph(Math.floor(Math.random() * 500) + 1);
        post.publishedAt = (await getTime()).toDate();
        if (Math.random() >= 0.5) {
            post.deletedAt = (await getTime()).toDate();
        }
        if (categories) {
            post.categories = categories;
        }

        // 默认作者是超级管理员用户
        const admin = await getUserConfig<UserConfig['super']>("super");
        post.author = await UserEntity.findOneOrFail({
            where: {
                username: admin.username
            }
        });

        return post;
    },
);