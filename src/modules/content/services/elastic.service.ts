import { Injectable } from "@nestjs/common";
import { WriteResponseBase } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { instanceToPlain } from "class-transformer";
import { pick } from "lodash";
import { PostEntity } from "../entities";
import { PostSearchBody } from "../types";
import chalk from "chalk";

/**
 * es crud
 */
@Injectable()
export class ElasticSearchService {
  // 索引名
  private index = "posts"; 

  constructor(private elasticService: ElasticsearchService) {}

  async search(text: string) {
    const res = await this.elasticService.search<PostEntity>({
      index: this.index,
      query: {
        multi_match: {
          fields: ['title', 'body', 'summary', 'categories'],
          query: text
        }
      }
    });
    return res.hits.hits.map(item => item._source)
  }

  /**
   * 存储post到索引中
   * 仅存储文章的title、summary、body、categories字段
   * 以数据库的id为es中索引的id
   * @param post 
   */
  async create(post: PostEntity): Promise<WriteResponseBase> {
    return this.elasticService.index<PostSearchBody>({
      index: this.index,
      document: {
        ...pick(instanceToPlain(post), ['id', 'title', 'body', 'summary']),
        categories: post.categories ? post.categories.join(",") : ""
      }
    });
  }

  /**
   * 更新指定post的文档
   * @param post 
   */
  async update(post: PostEntity) {
    // 要更新的字段
    const newBody = {
      ...pick(instanceToPlain(post), ['title', 'body', 'summary']),
      categories: (post.categories ?? []).join(','),
    }

    // crud根据官网案例，更新某个字段必须是: ctx._source[xxx] = xxx;
    // 拼接更新
    // const script = Object.entries(newBody).reduce((result, [key, value]) => {
    //   result = `${result}; ctx._source.${key}=${value}`;
    //   return result;
    // }, "")
    const script = Object.entries(newBody).reduce(
      (result, [key, value]) => `${result} ctx._source.${key}=>${value};`,
      '',
    );
    console.log(chalk.red(script));

    return this.elasticService.updateByQuery({
      index: this.index,
      query: {
        match: {
          id: post.id
        }
      },
      script
    })
  }

  /**
   * 删除指定postId的记录
   * @param postId 
   */
  async delete(postId: string) {
    console.log("id", postId);
    return this.elasticService.deleteByQuery({
      index: this.index,
      query: {
        match: {
          id: postId
        }
      }
    })
  }
}