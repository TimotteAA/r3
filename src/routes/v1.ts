import { Configure } from "../modules/core/configure";
import { VersionOption } from "../modules/restful/types";
import * as contentMaps from "@/modules/content/controllers";
import * as userMaps from "@/modules/user/controller";
import * as actionMaps from '@/modules/actions/controllers'
import * as bannerMaps from "@/modules/media/controllers";

import * as manageContentMaps from "@/modules/content/controllers/manage"
import * as manageUserMaps from "@/modules/user/controller/manage";
import * as manageRbacMaps from "@/modules/rbac/controllers";
import * as manageActionMaps from "@/modules/actions/controllers/manage";
import * as manageMediaMaps from "@/modules/media/controllers/manage";

/**
 * 文档放在route第一层
 * controller放在children里
 */
export const v1 = async (configure: Configure): Promise<VersionOption> => ({
  routes: [
      {
          name: 'app',
          path: '/',
          controllers: [],
          doc: {
              title: '应用接口',
              description: '前端API接口',
              tags: [
                    { name: '文章操作', description: '用户对文章进行的增删查改及搜索等操作' },
                    { name: '分类查询', description: '文章分类列表及详情查询' },
                    { name: '评论操作', description: '用户对评论的增删查操作' },
                    {
                        name: '验证码操作',
                        description: '用户发送登录、注册等一系列验证码操作',
                    },
                    { name: 'Auth操作', description: '用户登录,登出,注册,发送找回密码等操作' },
                    {
                        name: '消息操作',
                        description: '用户作为消息发送者和接收者对消息进行增删查改及已读标注等操作',
                    },
                    {
                        name: "action操作", description: "对文章、评论点赞或不喜欢"
                    },
                    {
                        name: "Banner查询", description: "分页查询轮播图"
                    }
              ],
          },
          children: [
                {
                    name: 'content',
                    path: '',
                    controllers: Object.values(contentMaps),
                },
                {
                    name: 'user',
                    path: '',
                    controllers: Object.values(userMaps),
                },
                {
                    name: "action",
                    path: "",
                    controllers: Object.values(actionMaps)
                },
                {
                    name: "banner",
                    path: "banner",
                    controllers: Object.values(bannerMaps)
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
                    { name: '消息管理', description: '站内信消息管理' },
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
                        name: "action管理",
                        description: "对action的管理"
                    },
                    {
                        name: '文件管理-轮播图管理',
                        description: '博客首页轮播图管理',
                    },
                    {
                        name: "文件管理-用户头像管理",
                        description: '用户头像管理'
                    }
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
                },
                {
                    name: "action",
                    path: "",
                    controllers: Object.values(manageActionMaps)
                },
                {
                    name: "media",
                    path: "media",
                    controllers: Object.values(manageMediaMaps)
                }
          ],
      },
  ],
});
