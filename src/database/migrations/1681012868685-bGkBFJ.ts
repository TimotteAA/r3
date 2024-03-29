import { MigrationInterface, QueryRunner } from "typeorm";

export class BGkBFJ1681012868685 implements MigrationInterface {
    name = 'BGkBFJ1681012868685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`content_categories\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL COMMENT '分类内容', \`customOrder\` int NOT NULL COMMENT '自定义排序' DEFAULT '0', \`deletedAt\` datetime(6) NULL, \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_03bd2d5552bacd48f6c860912a\` (\`content\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_permission\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '权限名', \`label\` varchar(255) NULL COMMENT '权限别名', \`description\` text NULL COMMENT '权限描述', \`rule\` text NOT NULL COMMENT '具体的权限规则', \`customOrder\` int NOT NULL COMMENT '权限排列字段', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '角色名', \`label\` varchar(255) NULL COMMENT '角色别名', \`description\` text NULL COMMENT '角色描述', \`systemd\` tinyint NOT NULL COMMENT '是否为系统默认角色：普通用户与超级管理员' DEFAULT 0, \`deletedAt\` datetime(6) NULL COMMENT '删除时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`media_banners\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '轮播图名称', \`link\` varchar(255) NULL COMMENT '轮播图跳转链接', \`description\` varchar(255) NULL COMMENT '轮播图描述', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatetAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`customOrder\` int NOT NULL COMMENT '轮播图排序字段', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`medias\` (\`id\` varchar(36) NOT NULL, \`ext\` varchar(255) NULL COMMENT '文件扩展名', \`key\` varchar(255) NULL COMMENT '腾讯云cos存储名', \`bucketPrefix\` varchar(255) NULL COMMENT '存储bucket', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`bannerId\` varchar(36) NULL, UNIQUE INDEX \`REL_15ee1e7851c1b92560525145b2\` (\`bannerId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`medias_avatars\` (\`id\` varchar(36) NOT NULL, \`ext\` varchar(255) NULL COMMENT '文件扩展名', \`key\` varchar(255) NULL COMMENT '腾讯云cos存储名', \`bucketPrefix\` varchar(255) NULL COMMENT '存储bucket', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`description\` varchar(255) NOT NULL COMMENT '文件描述', \`isThird\` tinyint NOT NULL COMMENT '是否是第三方授权的头像' DEFAULT 0, \`thirdSrc\` varchar(255) NULL COMMENT '第三方授权登录头像地址', \`bannerId\` varchar(36) NULL, UNIQUE INDEX \`REL_5c5d60d333087c3e02078aef04\` (\`bannerId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`actions\` (\`id\` varchar(36) NOT NULL, \`actionType\` enum ('up', 'down') NOT NULL COMMENT '用户做出的行为', \`stuffType\` enum ('post', 'comment') NOT NULL COMMENT '用户行为的对象类型', \`stuffId\` varchar(255) NOT NULL COMMENT '对象ID', \`userId\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_users\` (\`id\` varchar(36) NOT NULL, \`nickname\` varchar(255) NULL COMMENT '用户昵称', \`username\` varchar(255) NOT NULL COMMENT '用户名', \`password\` varchar(500) NOT NULL COMMENT '用户密码', \`phone\` varchar(255) NULL COMMENT '用户手机', \`email\` varchar(255) NULL COMMENT '用户邮箱', \`isCreator\` tinyint NOT NULL COMMENT '是否是创始人' DEFAULT 0, \`actived\` tinyint NOT NULL COMMENT '用户是否激活' DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`avatarId\` varchar(36) NULL, UNIQUE INDEX \`IDX_10be72e2d5666502370b5d14ed\` (\`phone\`), UNIQUE INDEX \`IDX_8b74148f5712a28539a4ca4158\` (\`email\`), UNIQUE INDEX \`REL_9315814ebff510c6c0507ccb68\` (\`avatarId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_access_token\` (\`id\` varchar(36) NOT NULL, \`value\` varchar(1000) NOT NULL, \`expired_at\` datetime NOT NULL COMMENT '过期时间', \`createdAt\` datetime(6) NOT NULL COMMENT 'token创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_refresh_token\` (\`id\` varchar(36) NOT NULL, \`value\` varchar(1000) NOT NULL, \`expired_at\` datetime NOT NULL COMMENT '过期时间', \`createdAt\` datetime(6) NOT NULL COMMENT 'token创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`accessTokenId\` varchar(36) NULL, UNIQUE INDEX \`REL_0fb9e76570bb35fd7dd7f78f73\` (\`accessTokenId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_code\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NOT NULL, \`action\` enum ('login', 'register', 'retrieve_password', 'reset_password', 'bound') NOT NULL COMMENT '验证码行为' DEFAULT 'register', \`type\` enum ('sms', 'email') NOT NULL COMMENT '手机验证码或邮箱验证码' DEFAULT 'sms', \`media\` varchar(255) NOT NULL COMMENT '手机号或邮箱', \`createtAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_messages\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NULL COMMENT '消息标题', \`body\` longtext NOT NULL COMMENT '消息内容', \`type\` varchar(255) NULL COMMENT '消息类型、可以是icon的url，也可以是链接地址', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`senderId\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users_recevies\` (\`id\` varchar(36) NOT NULL, \`readed\` tinyint NOT NULL COMMENT '是否已读' DEFAULT 0, \`messageId\` varchar(36) NULL, \`receiverId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_comment\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(1000) NOT NULL, \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, \`postId\` varchar(36) NOT NULL, \`authorId\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_posts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL COMMENT '文字标题', \`body\` longtext NOT NULL COMMENT '文章内容', \`summary\` varchar(255) NULL COMMENT '文章总结', \`keywords\` text NULL COMMENT '文章关键词', \`type\` enum ('html', 'markdown') NOT NULL COMMENT '文章类型' DEFAULT 'html', \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`publishedAt\` datetime NULL COMMENT '发表时间', \`customOrder\` int NOT NULL COMMENT '文章排序值' DEFAULT '0', \`deletedAt\` datetime(6) NULL, \`authorId\` varchar(36) NOT NULL, FULLTEXT INDEX \`IDX_9ef6db9d13df6882d36c8af0cc\` (\`title\`), FULLTEXT INDEX \`IDX_e51068c39974ca11fae5d44c88\` (\`body\`), FULLTEXT INDEX \`IDX_f43723dc196c18767a3893a3f7\` (\`summary\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_permission_roles_rbac_roles\` (\`rbacPermissionId\` varchar(36) NOT NULL, \`rbacRolesId\` varchar(36) NOT NULL, INDEX \`IDX_729cfb6b1737c0b504e33f986f\` (\`rbacPermissionId\`), INDEX \`IDX_6915858cb1d029e3fc8989644a\` (\`rbacRolesId\`), PRIMARY KEY (\`rbacPermissionId\`, \`rbacRolesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_permission_users_user_users\` (\`rbacPermissionId\` varchar(36) NOT NULL, \`userUsersId\` varchar(36) NOT NULL, INDEX \`IDX_50d0b86f8a1749ad6489fef447\` (\`rbacPermissionId\`), INDEX \`IDX_47a2e136fc14280f171362ef7a\` (\`userUsersId\`), PRIMARY KEY (\`rbacPermissionId\`, \`userUsersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_roles_users_user_users\` (\`rbacRolesId\` varchar(36) NOT NULL, \`userUsersId\` varchar(36) NOT NULL, INDEX \`IDX_8f4b3a7a63cd003ddae8e00605\` (\`rbacRolesId\`), INDEX \`IDX_eaebceec60743a9d92e5f03f09\` (\`userUsersId\`), PRIMARY KEY (\`rbacRolesId\`, \`userUsersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_users_roles_rbac_roles\` (\`userUsersId\` varchar(36) NOT NULL, \`rbacRolesId\` varchar(36) NOT NULL, INDEX \`IDX_87c05108f1fe96c6e832c5fd79\` (\`userUsersId\`), INDEX \`IDX_02383f8545e062a3d1cbeb03ba\` (\`rbacRolesId\`), PRIMARY KEY (\`userUsersId\`, \`rbacRolesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_users_permissions_rbac_permission\` (\`userUsersId\` varchar(36) NOT NULL, \`rbacPermissionId\` varchar(36) NOT NULL, INDEX \`IDX_52c588f000a1baacb67db8751e\` (\`userUsersId\`), INDEX \`IDX_b2b3f3bd036d828455a1d01a69\` (\`rbacPermissionId\`), PRIMARY KEY (\`userUsersId\`, \`rbacPermissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_posts_categories_content_categories\` (\`contentPostsId\` varchar(36) NOT NULL, \`contentCategoriesId\` varchar(36) NOT NULL, INDEX \`IDX_9172320639056856745c6bc21a\` (\`contentPostsId\`), INDEX \`IDX_82926fe45def38f6a53838347a\` (\`contentCategoriesId\`), PRIMARY KEY (\`contentPostsId\`, \`contentCategoriesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`content_categories\` ADD CONSTRAINT \`FK_a03aea27707893300382b6f18ae\` FOREIGN KEY (\`parentId\`) REFERENCES \`content_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`medias\` ADD CONSTRAINT \`FK_15ee1e7851c1b92560525145b2b\` FOREIGN KEY (\`bannerId\`) REFERENCES \`media_banners\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`medias_avatars\` ADD CONSTRAINT \`FK_5c5d60d333087c3e02078aef04c\` FOREIGN KEY (\`bannerId\`) REFERENCES \`media_banners\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`actions\` ADD CONSTRAINT \`FK_83a262823d7b54757fa07171b90\` FOREIGN KEY (\`userId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_users\` ADD CONSTRAINT \`FK_9315814ebff510c6c0507ccb68a\` FOREIGN KEY (\`avatarId\`) REFERENCES \`medias_avatars\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_access_token\` ADD CONSTRAINT \`FK_c9c6ac4970ddbe5a8c4887e1e7e\` FOREIGN KEY (\`userId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` ADD CONSTRAINT \`FK_0fb9e76570bb35fd7dd7f78f73c\` FOREIGN KEY (\`accessTokenId\`) REFERENCES \`user_access_token\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_messages\` ADD CONSTRAINT \`FK_853e28ad8c195d597fd8a8d4b3b\` FOREIGN KEY (\`senderId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users_recevies\` ADD CONSTRAINT \`FK_c2934254f17ba92bc8ab76f1e2b\` FOREIGN KEY (\`messageId\`) REFERENCES \`user_messages\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`users_recevies\` ADD CONSTRAINT \`FK_f8c7d561812468c9ef3372b395c\` FOREIGN KEY (\`receiverId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`content_comment\` ADD CONSTRAINT \`FK_cf594b7930bbee3ef9cb94cc083\` FOREIGN KEY (\`parentId\`) REFERENCES \`content_comment\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_comment\` ADD CONSTRAINT \`FK_937464642ad2fe050807b731fa9\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`content_comment\` ADD CONSTRAINT \`FK_70b9cb9c33e723c66ea68715268\` FOREIGN KEY (\`authorId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_8fcc2d81ced7b8ade2bbd151b1a\` FOREIGN KEY (\`authorId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` ADD CONSTRAINT \`FK_729cfb6b1737c0b504e33f986fb\` FOREIGN KEY (\`rbacPermissionId\`) REFERENCES \`rbac_permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` ADD CONSTRAINT \`FK_6915858cb1d029e3fc8989644a1\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_users_user_users\` ADD CONSTRAINT \`FK_50d0b86f8a1749ad6489fef447f\` FOREIGN KEY (\`rbacPermissionId\`) REFERENCES \`rbac_permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_users_user_users\` ADD CONSTRAINT \`FK_47a2e136fc14280f171362ef7a0\` FOREIGN KEY (\`userUsersId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_user_users\` ADD CONSTRAINT \`FK_8f4b3a7a63cd003ddae8e00605f\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_user_users\` ADD CONSTRAINT \`FK_eaebceec60743a9d92e5f03f098\` FOREIGN KEY (\`userUsersId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_users_roles_rbac_roles\` ADD CONSTRAINT \`FK_87c05108f1fe96c6e832c5fd797\` FOREIGN KEY (\`userUsersId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_users_roles_rbac_roles\` ADD CONSTRAINT \`FK_02383f8545e062a3d1cbeb03bac\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_users_permissions_rbac_permission\` ADD CONSTRAINT \`FK_52c588f000a1baacb67db8751ed\` FOREIGN KEY (\`userUsersId\`) REFERENCES \`user_users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_users_permissions_rbac_permission\` ADD CONSTRAINT \`FK_b2b3f3bd036d828455a1d01a697\` FOREIGN KEY (\`rbacPermissionId\`) REFERENCES \`rbac_permission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_posts_categories_content_categories\` ADD CONSTRAINT \`FK_9172320639056856745c6bc21aa\` FOREIGN KEY (\`contentPostsId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`content_posts_categories_content_categories\` ADD CONSTRAINT \`FK_82926fe45def38f6a53838347a2\` FOREIGN KEY (\`contentCategoriesId\`) REFERENCES \`content_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts_categories_content_categories\` DROP FOREIGN KEY \`FK_82926fe45def38f6a53838347a2\``);
        await queryRunner.query(`ALTER TABLE \`content_posts_categories_content_categories\` DROP FOREIGN KEY \`FK_9172320639056856745c6bc21aa\``);
        await queryRunner.query(`ALTER TABLE \`user_users_permissions_rbac_permission\` DROP FOREIGN KEY \`FK_b2b3f3bd036d828455a1d01a697\``);
        await queryRunner.query(`ALTER TABLE \`user_users_permissions_rbac_permission\` DROP FOREIGN KEY \`FK_52c588f000a1baacb67db8751ed\``);
        await queryRunner.query(`ALTER TABLE \`user_users_roles_rbac_roles\` DROP FOREIGN KEY \`FK_02383f8545e062a3d1cbeb03bac\``);
        await queryRunner.query(`ALTER TABLE \`user_users_roles_rbac_roles\` DROP FOREIGN KEY \`FK_87c05108f1fe96c6e832c5fd797\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_user_users\` DROP FOREIGN KEY \`FK_eaebceec60743a9d92e5f03f098\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_user_users\` DROP FOREIGN KEY \`FK_8f4b3a7a63cd003ddae8e00605f\``);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_users_user_users\` DROP FOREIGN KEY \`FK_47a2e136fc14280f171362ef7a0\``);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_users_user_users\` DROP FOREIGN KEY \`FK_50d0b86f8a1749ad6489fef447f\``);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` DROP FOREIGN KEY \`FK_6915858cb1d029e3fc8989644a1\``);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` DROP FOREIGN KEY \`FK_729cfb6b1737c0b504e33f986fb\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_8fcc2d81ced7b8ade2bbd151b1a\``);
        await queryRunner.query(`ALTER TABLE \`content_comment\` DROP FOREIGN KEY \`FK_70b9cb9c33e723c66ea68715268\``);
        await queryRunner.query(`ALTER TABLE \`content_comment\` DROP FOREIGN KEY \`FK_937464642ad2fe050807b731fa9\``);
        await queryRunner.query(`ALTER TABLE \`content_comment\` DROP FOREIGN KEY \`FK_cf594b7930bbee3ef9cb94cc083\``);
        await queryRunner.query(`ALTER TABLE \`users_recevies\` DROP FOREIGN KEY \`FK_f8c7d561812468c9ef3372b395c\``);
        await queryRunner.query(`ALTER TABLE \`users_recevies\` DROP FOREIGN KEY \`FK_c2934254f17ba92bc8ab76f1e2b\``);
        await queryRunner.query(`ALTER TABLE \`user_messages\` DROP FOREIGN KEY \`FK_853e28ad8c195d597fd8a8d4b3b\``);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` DROP FOREIGN KEY \`FK_0fb9e76570bb35fd7dd7f78f73c\``);
        await queryRunner.query(`ALTER TABLE \`user_access_token\` DROP FOREIGN KEY \`FK_c9c6ac4970ddbe5a8c4887e1e7e\``);
        await queryRunner.query(`ALTER TABLE \`user_users\` DROP FOREIGN KEY \`FK_9315814ebff510c6c0507ccb68a\``);
        await queryRunner.query(`ALTER TABLE \`actions\` DROP FOREIGN KEY \`FK_83a262823d7b54757fa07171b90\``);
        await queryRunner.query(`ALTER TABLE \`medias_avatars\` DROP FOREIGN KEY \`FK_5c5d60d333087c3e02078aef04c\``);
        await queryRunner.query(`ALTER TABLE \`medias\` DROP FOREIGN KEY \`FK_15ee1e7851c1b92560525145b2b\``);
        await queryRunner.query(`ALTER TABLE \`content_categories\` DROP FOREIGN KEY \`FK_a03aea27707893300382b6f18ae\``);
        await queryRunner.query(`DROP INDEX \`IDX_82926fe45def38f6a53838347a\` ON \`content_posts_categories_content_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_9172320639056856745c6bc21a\` ON \`content_posts_categories_content_categories\``);
        await queryRunner.query(`DROP TABLE \`content_posts_categories_content_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_b2b3f3bd036d828455a1d01a69\` ON \`user_users_permissions_rbac_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_52c588f000a1baacb67db8751e\` ON \`user_users_permissions_rbac_permission\``);
        await queryRunner.query(`DROP TABLE \`user_users_permissions_rbac_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_02383f8545e062a3d1cbeb03ba\` ON \`user_users_roles_rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_87c05108f1fe96c6e832c5fd79\` ON \`user_users_roles_rbac_roles\``);
        await queryRunner.query(`DROP TABLE \`user_users_roles_rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_eaebceec60743a9d92e5f03f09\` ON \`rbac_roles_users_user_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f4b3a7a63cd003ddae8e00605\` ON \`rbac_roles_users_user_users\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles_users_user_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_47a2e136fc14280f171362ef7a\` ON \`rbac_permission_users_user_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_50d0b86f8a1749ad6489fef447\` ON \`rbac_permission_users_user_users\``);
        await queryRunner.query(`DROP TABLE \`rbac_permission_users_user_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_6915858cb1d029e3fc8989644a\` ON \`rbac_permission_roles_rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_729cfb6b1737c0b504e33f986f\` ON \`rbac_permission_roles_rbac_roles\``);
        await queryRunner.query(`DROP TABLE \`rbac_permission_roles_rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_f43723dc196c18767a3893a3f7\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_e51068c39974ca11fae5d44c88\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ef6db9d13df6882d36c8af0cc\` ON \`content_posts\``);
        await queryRunner.query(`DROP TABLE \`content_posts\``);
        await queryRunner.query(`DROP TABLE \`content_comment\``);
        await queryRunner.query(`DROP TABLE \`users_recevies\``);
        await queryRunner.query(`DROP TABLE \`user_messages\``);
        await queryRunner.query(`DROP TABLE \`user_code\``);
        await queryRunner.query(`DROP INDEX \`REL_0fb9e76570bb35fd7dd7f78f73\` ON \`user_refresh_token\``);
        await queryRunner.query(`DROP TABLE \`user_refresh_token\``);
        await queryRunner.query(`DROP TABLE \`user_access_token\``);
        await queryRunner.query(`DROP INDEX \`REL_9315814ebff510c6c0507ccb68\` ON \`user_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b74148f5712a28539a4ca4158\` ON \`user_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_10be72e2d5666502370b5d14ed\` ON \`user_users\``);
        await queryRunner.query(`DROP TABLE \`user_users\``);
        await queryRunner.query(`DROP TABLE \`actions\``);
        await queryRunner.query(`DROP INDEX \`REL_5c5d60d333087c3e02078aef04\` ON \`medias_avatars\``);
        await queryRunner.query(`DROP TABLE \`medias_avatars\``);
        await queryRunner.query(`DROP INDEX \`REL_15ee1e7851c1b92560525145b2\` ON \`medias\``);
        await queryRunner.query(`DROP TABLE \`medias\``);
        await queryRunner.query(`DROP TABLE \`media_banners\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles\``);
        await queryRunner.query(`DROP TABLE \`rbac_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_03bd2d5552bacd48f6c860912a\` ON \`content_categories\``);
        await queryRunner.query(`DROP TABLE \`content_categories\``);
    }

}
