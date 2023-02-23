import { VersionOption } from "../restful/types";
import * as contentMaps from "@/modules/content/controllers";
import * as userMaps from "@/modules/user/controller";

import * as manageContentMaps from "@/modules/content/controllers/manage"
import * as manageUserMaps from "@/modules/user/controller/manage";
import * as manageRbacMaps from "@/modules/rbac/controllers";

export const v1: VersionOption = {
  apps: [
      {
          name: 'app',
          path: '/',
          controllers: [],
          doc: {
              title: '应用接口',
              description: '前端APP应用接口',
              tags: [
                  { name: '文章操作', description: '用户对文章进行的增删查改及搜索等操作' },
                  { name: '分类查询', description: '文章分类列表及详情查询' },
                  { name: '评论操作', description: '用户对评论的增删查操作' },
                  {
                      name: '账户操作',
                      description: '用户登录后对账户进行的更改密码,换绑手机号等一系列操作',
                  },
                  { name: 'Auth操作', description: '用户登录,登出,注册,发送找回密码等操作' },
                  {
                      name: '用户消息操作',
                      description: '用户作为消息发送者和接收者对消息进行增删查改及已读标注等操作',
                  },
                  {
                      name: '文件操作',
                      description: '浏览及下载文件等',
                  },
              ],
          },
          children: [
              {
                  name: 'content',
                  path: 'content',
                  controllers: Object.values(contentMaps),
              },
              {
                  name: 'user',
                  path: '',
                  controllers: Object.values(userMaps),
              }
          ],
      },
      {
          name: 'manage',
          path: 'manage',
          controllers: [],
          doc: {
              title: '管理接口',
              description: '后台管理面板接口',
              tags: [
                  { name: '分类管理', description: '内容模块-文章分类管理' },
                  { name: '文章管理', description: '内容模块-文章管理' },
                  { name: '评论管理', description: '内容模块-文章评论管理' },
                  { name: '用户管理', description: '管理应用的所有用户' },
                  { name: '消息管理', description: '全局消息管理' },
                  {
                      name: '角色管理',
                      description:
                          '默认包含super-admin等系统角色角色,但是可以增删查改(系统角色不可操作)',
                  },
                  {
                      name: '权限管理',
                      description: '权限为系统硬编码后自动同步到数据库,只能查看',
                  },
                  {
                      name: '文件管理',
                      description: '上传的动态文件管理',
                  },
              ],
          },
          children: [
              {
                  name: 'content',
                  path: 'content',
                  controllers: Object.values(manageContentMaps),
              },
              {
                  name: 'user',
                  path: '',
                  controllers: Object.values(manageUserMaps),
              },
              {
                  name: 'rbac',
                  path: 'rbac',
                  controllers: Object.values(manageRbacMaps),
              }
          ],
      },
  ],
};
