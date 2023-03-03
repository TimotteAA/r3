import {
    EventSubscriber,
    EntitySubscriberInterface,
    DataSource
  } from 'typeorm';
  import { isNil } from 'lodash';
  import { MenuEntity } from '../entities';
  
  /**
   * role订阅者
   * 数据库没有label字段，设置name为label字段
   */
  @EventSubscriber()
  export class MenuSubscriber implements EntitySubscriberInterface<MenuEntity> {
    constructor(private dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }
  
    listenTo() {
        return MenuEntity;
    }
  
    afterLoad(entity: MenuEntity): void | Promise<any> {
        if (!isNil(entity.p)) entity.permission = entity.p.name
    }
  }
  