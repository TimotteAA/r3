/**
 * 默认的系统用户：普通用户、超级管理员
 */
export enum SystemRoles {
  USER = 'custom-user',
  ADMIN = "super-admin"
}

/**
 * rule的action
 */
export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  OWNER = "owner",
  MANAGE = "manage"
}

export const PERMISSION_CHECKERS = Symbol("permission_checkers");