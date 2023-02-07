import { FindTreeOptions, SelectQueryBuilder } from "typeorm";
import { ClassToPlain } from "../utils";
import { PostEntity, CommentEntity } from "./entities";

/**
 * 文章的全文搜索类型
 * MySQL的like、againt关键字
 * elastic搜索
 */
export type SearchType = "like" | "against" | "elastic";

/**
 * content模块配置
 */
export interface ContentConfig {
  searchType: SearchType
}

/**
 * 全文搜索字段
 */
export type PostSearchBody = Pick<ClassToPlain<PostEntity>, "title" | "body" | "summary"> & {
  // 索引id数组在存储id拼接的数组
  categories: string;
}

/**
 * content module的type
 */

export type FindCommentTreeOptions = FindTreeOptions & {
  addQuery?: (query: SelectQueryBuilder<CommentEntity>) => SelectQueryBuilder<CommentEntity>;
};
