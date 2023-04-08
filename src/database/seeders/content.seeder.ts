import { DataSource, EntityManager, In } from "typeorm";
import path from "path";
import { faker } from "@faker-js/faker";
import { existsSync, readFileSync } from "fs-extra";

import { CategoryEntity, CommentEntity, PostEntity } from "@/modules/content/entities";
import { BaseSeeder } from "@/modules/database/crud/seeder";
import { DbFactory } from "@/modules/database/types";
import { categories, CategoryData, posts, PostData} from "../factories/content.data";
import { IPostFactoryOptions } from "../factories/content.factory";
import { panic } from "@/modules/core/helpers";
import { getCustomRepository } from "@/modules/database/helpers";
import { CategoryRepository } from "@/modules/content/repositorys";
import { getRandListData } from "@/modules/utils";
import { getUserConfig } from "@/modules/user/helpers";
import { UserConfig } from "@/modules/user/types";
import { UserEntity } from "@/modules/user/entities";
import { isNil } from "lodash";

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [PostEntity, CategoryEntity, CommentEntity];

    protected factorier!: DbFactory;

    async run(_factorier: DbFactory, _dataSource: DataSource, _em: EntityManager): Promise<any> {
        this.factorier = _factorier;
        // console.log("factorier", this.factorier);
        await this.loadCategories(categories);
        await this.loadPosts(posts);
    }

    /**
     * 根据factory数据创建entity保存到数据库中
     * @param data 
     * @param parent 
     */
    private async loadCategories(data: CategoryData[], parent?: CategoryEntity): Promise<void> {
        let order = 0;
        for (const item of data) {
            const category = new CategoryEntity();
            category.content = item.content;
            category.customOrder = order;
            if (parent) category.parent = parent;
            await this.em.save(category);
            order++;
            if (item.children) {
                await this.loadCategories(item.children, category);
            }
        }
    }

    /**
     * 给指定文章创建评论
     * @param post 
     * @param count 
     * @param parent 
     */
    private async genRandomComments(post: PostEntity, count: number, parent?: CommentEntity, author?: ClassToPlain<UserEntity>) {
        const comments: CommentEntity[] = [];
        for (let i = 0; i < count; i++) {
            const comment = new CommentEntity();
            // faker.lorem.
            comment.content = faker.lorem.sentence();
            comment.post = post;
            if (parent) {
                comment.parent = parent;
            }
            if (!isNil(author)) {
                comment.author = author;
            }
            comments.push(await this.em.save(comment));
            if (Math.random() >= 0.99) {
                comment.children = await this.genRandomComments(
                    post,
                    Math.floor(count * 2),
                    comment,
                    author
                )
                await this.em.save(comment);
            }
        }
        return comments;
    }

    private async loadPosts(posts: PostData[]) {
        // 所有的分类
        const allCates = await this.em.find(CategoryEntity);

        // fake author
        const admin = await getUserConfig<UserConfig['super']>("super");
        console.error("12311111111111111111111")
        const author = await UserEntity.findOneOrFail({
            where: {
                username: admin.username
            }
        });

        for (const item of posts) {
            const options: IPostFactoryOptions = {};
            const filePath = path.resolve(__dirname, "../../assets/posts", item.contentFile);
            if (!existsSync(filePath)) {
                panic({
                    spinner: this.spinner,
                    message: `post content file ${filePath} not exists!`
                })
            }
            options.title = item.title;
            options.body = readFileSync(filePath, 'utf-8');
            options.isPublished = true;
            // 处理item的可选字段
            if (item.summary) {
                options.summary = item.summary;
            }
            if (item.categories) {
                options.categories = await getCustomRepository(
                    this.dataSource,
                    CategoryRepository
                ).find({
                    where: {
                        content: In(item.categories)
                    }
                })
            };

            // 默认作者是超级管理员用户
            options.author = author;

            const post = await this.factorier(PostEntity)(options).create();
            await this.genRandomComments(post, Math.floor(Math.random() * 5), null, author);
        }

        // fake post
        const redoms = await this.factorier(PostEntity)<IPostFactoryOptions>({
            categories: getRandListData(allCates)
        }).createMany(100);
        for (const redom of redoms) {
            await this.genRandomComments(redom, Math.floor(Math.random() * 2), null, author)
        }
    }
}