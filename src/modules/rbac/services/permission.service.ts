import { Injectable } from "@nestjs/common";

import { PermissionRepository } from "../repository";
import { PermissionEntity } from "../entities";
import { BaseService } from "@/modules/core/crud";
import { QueryListParams } from "@/modules/core/types";
import { QueryHook } from "@/modules/utils";
import { AbilityTuple, Subject, MongoQuery } from "@casl/ability";
import { AnyObject } from "@casl/ability/dist/types/types";
import { SelectQueryBuilder } from "typeorm";

/**
 * 权限服务类
 * 只支持查询，不支持别的操作
 */
@Injectable()
export class PermissionService extends BaseService<PermissionEntity, PermissionRepository> {
  constructor(
    protected repo: PermissionRepository
  ) {
    super(repo)
  }

  /**
   * 查询某个角色的权限
   * @param qb 
   * @param options 
   * @param callback 
   */
  protected buildListQuery(qb: SelectQueryBuilder<PermissionEntity<AbilityTuple<string, Subject>, 
    MongoQuery<AnyObject>>>, 
    options: QueryListParams<PermissionEntity<AbilityTuple<string, Subject>, MongoQuery<AnyObject>>>, 
    callback?: QueryHook<PermissionEntity<AbilityTuple<string, Subject>, MongoQuery<AnyObject>>>)
  : Promise<SelectQueryBuilder<PermissionEntity<AbilityTuple<string, Subject>, MongoQuery<AnyObject>>>> {
    return super.buildListQuery(qb, options, callback);
  }
}