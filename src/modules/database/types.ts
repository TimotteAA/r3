import { OneToMany, OneToOne, ManyToOne, ManyToMany } from "typeorm"

/**
 * 关联关系动态关联装饰器工厂函数入参
 */
export interface DynamicRelation {
  // 关联关系
  relation: ReturnType<typeof OneToOne> | ReturnType<typeof OneToMany> | ReturnType<typeof ManyToOne> | ReturnType<typeof ManyToMany>;
  // 别的装饰器？
  others?: Array<(...args: any[]) => any>;
  // 字段
  column: string;
}